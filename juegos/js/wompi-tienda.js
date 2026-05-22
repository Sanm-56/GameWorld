import { supabase } from "./supabase.js"

const SAVED_UNIQUE_CODE_KEY = "savedUniqueCode"

function usuarioActual() {
  return localStorage.getItem("usuario") || localStorage.getItem("ultimo_usuario") || ""
}

function codigoActual() {
  return (localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || "").trim()
}

export function productoSlugPagoReal(rawValue) {
  const [tipo, id] = String(rawValue || "").split(":")
  if (!tipo || !id) return ""
  if (tipo === "coins") return id
  if (tipo === "vip") return `vip_${id}`
  if (tipo === "booster") return `booster_${id}`
  if (tipo === "cosmetic") return `cosmetic_${id}`
  return ""
}

export async function crearCompraWompi(rawProductValue) {
  const usuario = usuarioActual()
  const codigo = codigoActual()
  const productoSlug = productoSlugPagoReal(rawProductValue)

  if (!usuario || !codigo) {
    return { ok: false, mensaje: "Vuelve a iniciar sesion antes de pagar." }
  }

  if (!productoSlug) {
    return { ok: false, mensaje: "Producto invalido." }
  }

  const { data, error } = await supabase.functions.invoke("crear-compra-wompi", {
    body: {
      usuario,
      codigo,
      producto_slug: productoSlug,
    },
  })

  if (error || data?.ok === false) {
    return {
      ok: false,
      mensaje: data?.mensaje || error?.message || "No se pudo crear el pago.",
    }
  }

  return data
}

export async function abrirCheckoutWompi(rawProductValue) {
  const resultado = await crearCompraWompi(rawProductValue)
  if (!resultado.ok) return resultado

  const checkoutUrl = resultado.checkoutUrl || resultado.compra?.checkout_url
  if (!checkoutUrl) {
    return { ok: false, mensaje: "Wompi no devolvio URL de pago." }
  }

  window.location.href = checkoutUrl
  return resultado
}
