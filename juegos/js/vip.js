import { supabase } from "./supabase.js"
import { safeAlert, setCleanText } from "./mensajes.js"

const SAVED_UNIQUE_CODE_KEY = "savedUniqueCode"
const VIP_STATUS_CACHE_MS = 60 * 1000

let vipStatusCache = null

export function getVipIdentity() {
  return {
    usuario: (localStorage.getItem("usuario") || "").trim(),
    codigo: (localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || "").trim(),
  }
}

function normalizeVipStatus(data, source = "unknown") {
  const expiresAt = data?.expires_at || data?.vip_expires_at || null
  const active = data?.is_active === true || data?.is_vip === true || data?.active === true
  const expiresMs = expiresAt ? Date.parse(expiresAt) : null
  const validExpiration = !expiresAt || (Number.isFinite(expiresMs) && expiresMs > Date.now())

  return {
    ok: Boolean(data?.ok !== false && active && validExpiration),
    isVip: Boolean(active && validExpiration),
    active,
    expiresAt,
    source,
    message: data?.mensaje || data?.message || "",
  }
}

function denyStatus(message = "No se pudo validar tu acceso VIP.") {
  return {
    ok: false,
    isVip: false,
    active: false,
    expiresAt: null,
    source: "denied",
    message,
  }
}

export function clearVipStatusCache() {
  vipStatusCache = null
}

export async function getVipStatus({ force = false } = {}) {
  const identity = getVipIdentity()

  if (!identity.usuario) {
    return denyStatus("Inicia sesion para entrar a la Zona VIP.")
  }

  if (!identity.codigo) {
    return denyStatus("Vuelve a iniciar sesion para validar tu acceso VIP.")
  }

  if (
    !force
    && vipStatusCache
    && vipStatusCache.usuario === identity.usuario
    && Date.now() - vipStatusCache.checkedAt < VIP_STATUS_CACHE_MS
  ) {
    return vipStatusCache.status
  }

  try {
    const { data, error } = await supabase.rpc("obtener_estado_vip", {
      p_usuario: identity.usuario,
      p_codigo: identity.codigo || null,
    })

    if (error) {
      console.warn("[VIP] No se pudo validar por RPC.", error)
      return denyStatus("No se pudo validar tu acceso VIP.")
    }

    const status = normalizeVipStatus(data, "rpc")
    vipStatusCache = {
      usuario: identity.usuario,
      checkedAt: Date.now(),
      status,
    }
    return status
  } catch (error) {
    console.warn("[VIP] Error inesperado validando acceso.", error)
    return denyStatus("No se pudo validar tu acceso VIP.")
  }
}

export async function checkVipAccess({ showMessage = true } = {}) {
  const status = await getVipStatus({ force: true })

  if (status.isVip) return true

  if (showMessage) {
    await safeAlert(status.message || "No eres VIP todavia. Puedes comprar el acceso VIP desde la tienda.")
  }

  return false
}

export async function validateVipSession({ statusElement = null, lockedElement = null, contentElement = null } = {}) {
  const status = await getVipStatus({ force: true })

  if (statusElement) {
    setCleanText(
      statusElement,
      status.isVip
        ? "Acceso VIP activo."
        : status.message || "No eres VIP todavia. Puedes comprar el acceso VIP desde la tienda."
    )
  }

  if (lockedElement) lockedElement.hidden = status.isVip
  if (contentElement) contentElement.hidden = !status.isVip

  return status.isVip
}

export async function canAccessVipGame() {
  return checkVipAccess({ showMessage: true })
}
