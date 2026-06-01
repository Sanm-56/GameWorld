import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type ProductoTienda = {
  id: string
  slug: string
  nombre: string
  tipo: string
  precio_cop: number
  moneda: string
  activo: boolean
  reward_config: Record<string, unknown>
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function cleanText(value: unknown, max = 120) {
  return String(value || "").trim().slice(0, max)
}

function normalizeSlug(value: unknown) {
  return cleanText(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function getEnv(name: string, required = true) {
  const value = Deno.env.get(name) || ""
  if (required && !value) throw new Error(`Falta configurar ${name}`)
  return value
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

async function buildCheckoutUrl(params: {
  publicKey: string
  integritySecret: string
  reference: string
  amountInCents: number
  currency: string
  redirectUrl: string
}) {
  const signature = await sha256Hex(
    `${params.reference}${params.amountInCents}${params.currency}${params.integritySecret}`,
  )
  const url = new URL("https://checkout.wompi.co/p/")
  url.searchParams.set("public-key", params.publicKey)
  url.searchParams.set("currency", params.currency)
  url.searchParams.set("amount-in-cents", String(params.amountInCents))
  url.searchParams.set("reference", params.reference)
  url.searchParams.set("signature:integrity", signature)
  if (params.redirectUrl) url.searchParams.set("redirect-url", params.redirectUrl)
  return url.toString()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, mensaje: "Metodo no permitido." }, 405)
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL")
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")
    const wompiPublicKey = getEnv("WOMPI_PUBLIC_KEY")
    const wompiIntegritySecret = getEnv("WOMPI_INTEGRITY_SECRET")
    const siteUrl = getEnv("SITE_URL", false)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const body = await req.json().catch(() => ({}))
    const usuario = cleanText(body.usuario)
    const codigo = cleanText(body.codigo, 80)
    const productoSlug = normalizeSlug(body.producto_slug || body.slug)

    if (!usuario || !codigo) {
      return jsonResponse({ ok: false, mensaje: "Inicia sesion antes de comprar." }, 400)
    }

    if (!productoSlug) {
      return jsonResponse({ ok: false, mensaje: "Producto invalido." }, 400)
    }

    const { data: usuarioRow, error: usuarioError } = await supabase
      .from("usuarios")
      .select("usuario,codigo")
      .eq("usuario", usuario)
      .maybeSingle()

    if (usuarioError) throw usuarioError
    if (!usuarioRow || String(usuarioRow.codigo || "") !== codigo) {
      return jsonResponse({ ok: false, mensaje: "No se pudo validar tu sesion." }, 403)
    }

    const { data: productoData, error: productoError } = await supabase
      .from("productos_tienda")
      .select("id,slug,nombre,tipo,precio_cop,moneda,activo,reward_config")
      .eq("slug", productoSlug)
      .eq("activo", true)
      .maybeSingle()

    if (productoError) throw productoError
    const producto = productoData as ProductoTienda | null
    if (!producto) {
      return jsonResponse({ ok: false, mensaje: "Producto no disponible para pago real." }, 404)
    }

    if (producto.tipo === "cosmetico") {
      const cosmeticoId = cleanText(producto.reward_config?.cosmetico_id || producto.slug)
      const { data: cosmeticoComprado, error: cosmeticoError } = await supabase
        .from("usuario_cosmeticos")
        .select("id")
        .eq("usuario_id", usuario)
        .eq("cosmetico_id", cosmeticoId)
        .maybeSingle()

      if (cosmeticoError) throw cosmeticoError
      if (cosmeticoComprado) {
        return jsonResponse({ ok: false, mensaje: "Este cosmetico ya fue comprado." }, 409)
      }
    }

    const amountInCents = Number(producto.precio_cop) * 100
    const reference = `gw_${crypto.randomUUID().replaceAll("-", "")}`
    const redirectBase = siteUrl || req.headers.get("origin") || ""
    const redirectUrl = redirectBase ? `${redirectBase.replace(/\/$/, "")}/index.html?compra=${reference}` : ""
    const checkoutUrl = await buildCheckoutUrl({
      publicKey: wompiPublicKey,
      integritySecret: wompiIntegritySecret,
      reference,
      amountInCents,
      currency: producto.moneda || "COP",
      redirectUrl,
    })

    const { data: compra, error: compraError } = await supabase
      .from("compras")
      .insert({
        usuario_id: usuario,
        producto_id: producto.id,
        estado: "pendiente",
        precio_cop_snapshot: producto.precio_cop,
        moneda: producto.moneda || "COP",
        wompi_reference: reference,
        checkout_url: checkoutUrl,
        metadata: {
          producto_slug: producto.slug,
          producto_nombre: producto.nombre,
          origen: "wompi_checkout",
        },
      })
      .select("id,estado,wompi_reference,checkout_url,precio_cop_snapshot,moneda")
      .single()

    if (compraError) throw compraError

    return jsonResponse({
      ok: true,
      compra,
      producto: {
        slug: producto.slug,
        nombre: producto.nombre,
        tipo: producto.tipo,
        precioCop: producto.precio_cop,
      },
      checkoutUrl,
    })
  } catch (error) {
    console.error("[crear-compra-wompi]", error)
    return jsonResponse({
      ok: false,
      mensaje: error instanceof Error ? error.message : "No se pudo crear la compra.",
    }, 500)
  }
})
