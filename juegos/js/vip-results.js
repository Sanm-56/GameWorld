import { supabase } from "./supabase.js"
import { canAccessVipGame, getVipIdentity } from "./vip.js"

const LOCAL_HISTORY_KEY = "vip_game_results_local"
const LOCAL_REWARDS_KEY = "vip_rewards_local"
const LOCAL_WALLET_KEY = "vip_wallet_local"

export const VIP_RESULT_ORIGIN = "vip"

export const VIP_GAME_TYPES = {
  EXCLUSIVE: "vip_exclusive",
  ADAPTED: "vip_adapted",
  EVENT: "vip_event",
  COMING_SOON: "coming_soon",
}

export function calculateVipRewards({ score = 0, hits = 0, accuracy = 0, bestCombo = 0 } = {}) {
  const cleanScore = Math.max(0, Math.trunc(Number(score) || 0))
  const cleanHits = Math.max(0, Math.trunc(Number(hits) || 0))
  const cleanAccuracy = Math.max(0, Math.min(100, Number(accuracy) || 0))
  const cleanCombo = Math.max(0, Math.trunc(Number(bestCombo) || 0))

  return {
    vipCoins: Math.min(180, Math.floor(cleanScore / 18) + Math.floor(cleanHits / 4)),
    vipXp: Math.min(320, Math.floor(cleanScore / 10) + Math.round(cleanAccuracy / 4)),
    vipTickets: cleanScore >= 500 || cleanCombo >= 20 ? 1 : 0,
  }
}

export async function registerVipGameResult({
  gameKey,
  gameTitle = "",
  mode = "",
  score = 0,
  metrics = {},
  rewards = null,
} = {}) {
  if (!gameKey) return { ok: false, message: "Juego VIP invalido." }
  if (!await canAccessVipGame()) return { ok: false, message: "No se pudo validar el acceso VIP." }

  const identity = getVipIdentity()
  const cleanRewards = normalizeRewards(rewards || calculateVipRewards({ score, ...metrics }))
  const payload = {
    p_usuario: identity.usuario,
    p_codigo: identity.codigo || null,
    p_game_key: gameKey,
    p_game_title: gameTitle || gameKey,
    p_mode: mode || null,
    p_score: Math.max(0, Math.trunc(Number(score) || 0)),
    p_metrics: metrics && typeof metrics === "object" ? metrics : {},
    p_rewards: cleanRewards,
  }

  try {
    const { data, error } = await supabase.rpc("registrar_resultado_juego_vip", payload)
    if (data?.ok === false) {
      console.warn("[VIP] Resultado VIP rechazado por servidor.", data)
      return {
        ok: false,
        remote: false,
        message: data?.mensaje || "No se pudo validar la recompensa VIP.",
      }
    }

    if (error) {
      console.warn("[VIP] No se pudo guardar resultado remoto.", error)
      return saveVipResultLocal({ gameKey, gameTitle, mode, score, metrics, rewards: cleanRewards, remoteError: true })
    }

    const result = normalizeRemoteResult(data?.result || data)
    saveLocalWallet(data?.wallet)
    mergeLocalResult(result, { updateWallet: false })
    return {
      ok: true,
      remote: true,
      duplicate: data?.duplicate === true,
      message: data?.mensaje || "",
      result,
    }
  } catch (error) {
    console.warn("[VIP] Error guardando resultado VIP.", error)
    return saveVipResultLocal({ gameKey, gameTitle, mode, score, metrics, rewards: cleanRewards, remoteError: true })
  }
}

export async function getVipGameHistory({ gameKey = null, limit = 8 } = {}) {
  const identity = getVipIdentity()
  if (!identity.usuario || !identity.codigo) return getLocalHistory(gameKey, limit)

  try {
    const { data, error } = await supabase.rpc("obtener_historial_juegos_vip", {
      p_usuario: identity.usuario,
      p_codigo: identity.codigo,
      p_game_key: gameKey,
      p_limit: Math.max(1, Math.min(30, Math.trunc(Number(limit) || 8))),
    })

    if (error || data?.ok === false) {
      console.warn("[VIP] No se pudo cargar historial remoto.", error || data)
      return getLocalHistory(gameKey, limit)
    }

    return Array.isArray(data?.items) ? data.items.map(normalizeRemoteResult) : []
  } catch (error) {
    console.warn("[VIP] Error cargando historial VIP.", error)
    return getLocalHistory(gameKey, limit)
  }
}

export async function getVipWallet() {
  const identity = getVipIdentity()
  if (!identity.usuario || !identity.codigo) {
    return {
      ok: false,
      wallet: getLocalVipRewards(),
      conversion: defaultConversionStatus(),
      message: "Inicia sesion para consultar tu billetera VIP.",
    }
  }

  try {
    const { data, error } = await supabase.rpc("obtener_billetera_vip", {
      p_usuario: identity.usuario,
      p_codigo: identity.codigo,
    })

    if (error || data?.ok === false) {
      console.warn("[VIP] No se pudo cargar billetera VIP.", error || data)
      return {
        ok: false,
        wallet: getLocalVipRewards(),
        conversion: defaultConversionStatus(),
        message: data?.mensaje || "No se pudo cargar la billetera VIP.",
      }
    }

    const wallet = normalizeWallet(data.wallet)
    saveLocalWallet(wallet)
    return {
      ok: true,
      wallet,
      conversion: normalizeConversionStatus(data.conversion),
    }
  } catch (error) {
    console.warn("[VIP] Error cargando billetera VIP.", error)
    return {
      ok: false,
      wallet: getLocalVipRewards(),
      conversion: defaultConversionStatus(),
      message: "No se pudo cargar la billetera VIP.",
    }
  }
}

export async function convertVipCoinsToNormal(vipCoins) {
  const amount = Math.max(0, Math.trunc(Number(vipCoins) || 0))
  if (!amount) return { ok: false, message: "Ingresa una cantidad valida de monedas VIP." }

  const identity = getVipIdentity()
  if (!identity.usuario || !identity.codigo) {
    return { ok: false, message: "Inicia sesion para convertir monedas VIP." }
  }

  try {
    const { data, error } = await supabase.rpc("convertir_monedas_vip", {
      p_usuario: identity.usuario,
      p_codigo: identity.codigo,
      p_vip_coins: amount,
    })

    if (error || data?.ok === false) {
      console.warn("[VIP] No se pudo convertir monedas VIP.", error || data)
      return {
        ok: false,
        message: data?.mensaje || "No se pudo convertir monedas VIP.",
        conversion: normalizeConversionStatus(data),
      }
    }

    const wallet = normalizeWallet(data.wallet)
    saveLocalWallet(wallet)
    notifyNormalCoinsUpdated(identity.usuario, data.normalCoinsBalance)
    return {
      ok: true,
      message: data.mensaje || "Conversion VIP completada.",
      wallet,
      conversion: normalizeConversionStatus(data.conversion),
      normalCoinsBalance: Math.max(0, Math.trunc(Number(data.normalCoinsBalance) || 0)),
    }
  } catch (error) {
    console.warn("[VIP] Error convirtiendo monedas VIP.", error)
    return { ok: false, message: "No se pudo convertir monedas VIP." }
  }
}

export function getLocalVipRewards() {
  try {
    return normalizeWallet(
      JSON.parse(localStorage.getItem(LOCAL_WALLET_KEY) || "null")
      || JSON.parse(localStorage.getItem(LOCAL_REWARDS_KEY) || "null")
    )
  } catch {
    return normalizeWallet()
  }
}

function saveVipResultLocal({ gameKey, gameTitle, mode, score, metrics, rewards, remoteError = false }) {
  const result = {
    id: `local-${Date.now()}`,
    game_key: gameKey,
    game_title: gameTitle || gameKey,
    mode: mode || "",
    score: Math.max(0, Math.trunc(Number(score) || 0)),
    metrics: metrics && typeof metrics === "object" ? metrics : {},
    rewards: normalizeRewards(rewards),
    origin: VIP_RESULT_ORIGIN,
    created_at: new Date().toISOString(),
    remoteError,
  }
  mergeLocalResult(result)
  return { ok: true, remote: false, result, message: "Resultado guardado localmente. Reaplica supabase-vip.sql para historial remoto." }
}

function mergeLocalResult(result, { updateWallet = true } = {}) {
  const history = [result, ...getLocalHistory(null, 50).filter((item) => item.id !== result.id)].slice(0, 50)
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history))

  if (!updateWallet) return

  const current = getLocalVipRewards()
  const rewards = normalizeRewards(result.rewards)
  localStorage.setItem(LOCAL_REWARDS_KEY, JSON.stringify({
    vipCoins: current.vipCoins + rewards.vipCoins,
    vipXp: current.vipXp + rewards.vipXp,
    vipTickets: current.vipTickets + rewards.vipTickets,
  }))
  saveLocalWallet({
    vipCoins: current.vipCoins + rewards.vipCoins,
    vipXp: current.vipXp + rewards.vipXp,
    vipTickets: current.vipTickets + rewards.vipTickets,
  })
}

function getLocalHistory(gameKey = null, limit = 8) {
  try {
    const items = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "[]")
    return (Array.isArray(items) ? items : [])
      .filter((item) => !gameKey || item.game_key === gameKey || item.gameKey === gameKey)
      .slice(0, Math.max(1, Math.trunc(Number(limit) || 8)))
  } catch {
    return []
  }
}

function normalizeRewards(rewards = {}) {
  return normalizeWallet(rewards)
}

function normalizeWallet(wallet = {}) {
  return {
    vipCoins: Math.max(0, Math.trunc(Number(wallet?.vipCoins ?? wallet?.vip_coins) || 0)),
    vipXp: Math.max(0, Math.trunc(Number(wallet?.vipXp ?? wallet?.vip_xp) || 0)),
    vipTickets: Math.max(0, Math.trunc(Number(wallet?.vipTickets ?? wallet?.vip_tickets) || 0)),
    updatedAt: wallet?.updated_at || wallet?.updatedAt || new Date().toISOString(),
  }
}

function saveLocalWallet(wallet = {}) {
  localStorage.setItem(LOCAL_WALLET_KEY, JSON.stringify(normalizeWallet(wallet)))
}

function normalizeConversionStatus(status = {}) {
  return {
    rate: Math.max(1, Math.trunc(Number(status?.rate) || 100)),
    dailyLimitVipCoins: Math.max(0, Math.trunc(Number(status?.dailyLimitVipCoins) || 50)),
    convertedTodayVipCoins: Math.max(0, Math.trunc(Number(status?.convertedTodayVipCoins) || 0)),
    remainingTodayVipCoins: Math.max(0, Math.trunc(Number(status?.remainingTodayVipCoins) || 0)),
    vipCoinsSpent: Math.max(0, Math.trunc(Number(status?.vipCoinsSpent) || 0)),
    normalCoinsReceived: Math.max(0, Math.trunc(Number(status?.normalCoinsReceived) || 0)),
  }
}

function defaultConversionStatus() {
  return normalizeConversionStatus()
}

function notifyNormalCoinsUpdated(usuario, saldo) {
  if (typeof window === "undefined") return
  const cleanSaldo = Math.max(0, Math.trunc(Number(saldo) || 0))
  window.dispatchEvent(new CustomEvent("monedas:actualizadas", {
    detail: { usuario, saldo: cleanSaldo },
  }))
}

function normalizeRemoteResult(row = {}) {
  return {
    ...row,
    id: row.id || row.result_id || `remote-${Date.now()}`,
    game_key: row.game_key || row.gameKey,
    game_title: row.game_title || row.gameTitle || row.game_key || row.gameKey,
    score: Math.max(0, Math.trunc(Number(row.score) || 0)),
    metrics: row.metrics || {},
    rewards: normalizeRewards(row.rewards || row),
    origin: row.origin || VIP_RESULT_ORIGIN,
    created_at: row.created_at || row.createdAt || new Date().toISOString(),
  }
}
