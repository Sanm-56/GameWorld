import { createClient } from "@supabase/supabase-js"

type Compra = {
  id: string
  estado: string
  precio_cop_snapshot: number
  moneda: string
  wompi_reference: string
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function getEnv(name: string, required = true) {
  const value = Deno.env.get(name) || ""
  if (required && !value) throw new Error(`Falta configurar ${name}`)
  return value
}

function getPath(payload: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[key]
  }, payload)
}

function bytesToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text)
  return bytesToHex(await crypto.subtle.digest("SHA-256", data))
}

async function isValidWompiEvent(payload: Record<string, unknown>, secret: string) {
  const signature = payload.signature as Record<string, unknown> | undefined
  const checksum = String(signature?.checksum || "")
  const properties = Array.isArray(signature?.properties) ? signature.properties.map(String) : []
  const timestamp = String(payload.timestamp || "")

  if (!checksum || !properties.length || !timestamp) return false

  const concatenated = properties.map((property) => String(getPath(payload, property) ?? "")).join("")
  const expected = await sha256Hex(`${concatenated}${timestamp}${secret}`)
  return expected === checksum
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, mensaje: "Metodo no permitido." }, 405)
  }

  try {
    const supabase = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false },
    })
    const eventSecret = getEnv("WOMPI_EVENTS_SECRET")
    const payload = await req.json() as Record<string, unknown>
    const eventType = String(payload.event || "")
    const transaction = (payload.data as Record<string, unknown> | undefined)?.transaction as Record<string, unknown> | undefined
    const reference = String(transaction?.reference || "")
    const transactionId = String(transaction?.id || "")
    const status = String(transaction?.status || "")
    const amountInCents = Number(transaction?.amount_in_cents || 0)
    const currency = String(transaction?.currency || "COP")
    const paymentMethodData = transaction?.payment_method as Record<string, unknown> | undefined
    const paymentMethod = String(transaction?.payment_method_type || paymentMethodData?.type || "")
    const signatureValid = await isValidWompiEvent(payload, eventSecret)

    await supabase.from("wompi_eventos").insert({
      event_id: String(payload.id || ""),
      transaction_id: transactionId || null,
      reference: reference || null,
      event_type: eventType || "unknown",
      payload,
      signature_valid: signatureValid,
      processed_at: signatureValid ? new Date().toISOString() : null,
    })

    if (!signatureValid) {
      return jsonResponse({ ok: false, mensaje: "Firma invalida." }, 401)
    }

    if (eventType !== "transaction.updated" || !reference) {
      return jsonResponse({ ok: true, mensaje: "Evento ignorado." })
    }

    const { data: compraData, error: compraError } = await supabase
      .from("compras")
      .select("id,estado,precio_cop_snapshot,moneda,wompi_reference")
      .eq("wompi_reference", reference)
      .maybeSingle()

    if (compraError) throw compraError
    const compra = compraData as Compra | null
    if (!compra) {
      return jsonResponse({ ok: true, mensaje: "Compra no encontrada para esta referencia." })
    }

    const expectedAmount = Number(compra.precio_cop_snapshot) * 100
    const amountMatches = expectedAmount === amountInCents && (compra.moneda || "COP") === currency

    if (status === "APPROVED" && amountMatches) {
      await supabase
        .from("compras")
        .update({
          estado: "pagado",
          wompi_transaction_id: transactionId || null,
          wompi_status: status,
          wompi_payment_method: paymentMethod || null,
          paid_at: new Date().toISOString(),
          metadata: {
            wompi_status: status,
            amount_in_cents: amountInCents,
            currency,
          },
        })
        .eq("id", compra.id)
        .in("estado", ["pendiente", "pagado"])

      const { data: entrega, error: entregaError } = await supabase.rpc("tienda_entregar_compra_pagada", {
        p_compra_id: compra.id,
      })

      if (entregaError) throw entregaError
      return jsonResponse({ ok: true, mensaje: "Compra aprobada procesada.", entrega })
    }

    const estado = status === "DECLINED" || status === "ERROR" || status === "VOIDED" ? "fallido" : "pendiente"
    await supabase
      .from("compras")
      .update({
        estado,
        wompi_transaction_id: transactionId || null,
        wompi_status: status,
        wompi_payment_method: paymentMethod || null,
        failed_at: estado === "fallido" ? new Date().toISOString() : null,
        metadata: {
          wompi_status: status,
          amount_in_cents: amountInCents,
          currency,
          amount_matches: amountMatches,
        },
      })
      .eq("id", compra.id)
      .neq("estado", "entregado")

    return jsonResponse({ ok: true, mensaje: "Evento procesado sin entrega.", status, amountMatches })
  } catch (error) {
    console.error("[wompi-webhook]", error)
    return jsonResponse({
      ok: false,
      mensaje: error instanceof Error ? error.message : "No se pudo procesar el evento.",
    }, 500)
  }
})
