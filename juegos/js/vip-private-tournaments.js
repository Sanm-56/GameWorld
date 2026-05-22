import { supabase } from "./supabase.js"
import { getVipIdentity } from "./vip.js"
import { getVipGame } from "./vip-games.js"
import { escapeHtml, errorMessage, safeAlert } from "./mensajes.js"

const ACTIVE_PRIVATE_TOURNAMENT_KEY = "vip_private_tournament_active"
const PRIVATE_TOURNAMENT_LAUNCH_KEY = "vip_private_tournament_launch"
const PRIVATE_TOURNAMENT_LAUNCH_TTL_MS = 15 * 60 * 1000
const PRIVATE_TOURNAMENT_SUPPORTED_GAMES = new Set(["reflejos-vip"])

let initialized = false
let activeState = null

function identityParams(extra = {}) {
  const identity = getVipIdentity()
  return {
    p_usuario: identity.usuario,
    p_codigo: identity.codigo || null,
    ...extra,
  }
}

function cleanPrivateCode(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64)
}

async function callRpc(name, params) {
  const { data, error } = await supabase.rpc(name, params)
  if (error || data?.ok === false) {
    throw new Error(data?.mensaje || error?.message || "No se pudo completar la accion VIP privada.")
  }
  return data
}

function setStatus(container, message, tone = "") {
  const status = container?.querySelector("[data-vip-private-status]")
  if (!status) return
  status.className = `vip-private-status${tone ? ` ${tone}` : ""}`
  status.textContent = message
}

function formatDate(value) {
  if (!value) return "Pendiente"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Pendiente" : date.toLocaleString("es-CO")
}

function statusLabel(status) {
  const labels = {
    borrador: "Borrador",
    inscripcion: "Inscripcion",
    lista: "Lista",
    en_juego: "En juego",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
    archivada: "Archivada",
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    cortesia: "Cortesia",
    rechazada: "Rechazada",
  }
  return labels[status] || status || "Pendiente"
}

function canPrepareGame(state) {
  return state?.access === true
    && state?.tournament?.status === "en_juego"
    && state?.player
    && ["confirmada", "cortesia"].includes(state.player.entry_status)
}

function saveActiveState(state) {
  activeState = state
  try {
    localStorage.setItem(ACTIVE_PRIVATE_TOURNAMENT_KEY, JSON.stringify({
      tournamentId: state?.tournament?.id || null,
      gameKey: state?.tournament?.game_key || "",
      savedAt: new Date().toISOString(),
    }))
  } catch {
    // Local persistence is just a convenience for the later game integration.
  }
}

function renderRoom(container, state) {
  const room = container.querySelector("[data-vip-private-room]")
  if (!room) return

  if (!state?.tournament) {
    room.innerHTML = ""
    return
  }

  const tournament = state.tournament
  const player = state.player || {}
  const players = Array.isArray(state.players) ? state.players : []
  const results = Array.isArray(state.results) ? state.results : []
  const canLaunch = canPrepareGame(state)

  room.innerHTML = `
    <div class="vip-private-room-card">
      <div class="vip-private-room-head">
        <div>
          <span class="vip-game-badge">${escapeHtml(statusLabel(tournament.status))}</span>
          <strong>${escapeHtml(tournament.title || "Minitorneo VIP privado")}</strong>
          <p>${escapeHtml(tournament.game_key || "Juego pendiente")}</p>
        </div>
        <span class="vip-private-pill">${escapeHtml(statusLabel(player.entry_status))}</span>
      </div>
      <div class="vip-private-meta">
        <span>Cupos: ${players.length}/${Number(tournament.max_players || 0)}</span>
        <span>Inicio: ${escapeHtml(formatDate(tournament.starts_at))}</span>
      </div>
      <div class="vip-private-rules">
        <strong>Reglas</strong>
        <span>${escapeHtml(tournament.rules || "El administrador aun no publico reglas para esta sala.")}</span>
      </div>
      <div class="vip-private-rules">
        <strong>Reconocimiento</strong>
        <span>${escapeHtml(tournament.recognition || "Reconocimiento pendiente de definir.")}</span>
      </div>
      <div class="vip-private-list">
        <strong>Participantes confirmados</strong>
        ${players.length
          ? players.map((item) => `<span>${escapeHtml(item.display_name || item.usuario_id || "VIP")}</span>`).join("")
          : "<span>Aun no hay participantes confirmados.</span>"}
      </div>
      <div class="vip-private-list">
        <strong>Resultados privados</strong>
        ${results.length
          ? results.slice(0, 5).map((item, index) => `<span>#${index + 1} ${escapeHtml(item.usuario_id || "VIP")} - ${Number(item.score || 0)} pts</span>`).join("")
          : "<span>Todavia no hay resultados para esta sala.</span>"}
      </div>
      <button class="vip-button ${canLaunch ? "primary" : ""}" type="button" data-vip-private-start ${canLaunch ? "" : "disabled"}>
        ${canLaunch ? "Preparar juego" : "Esperando inicio"}
      </button>
    </div>
  `

  room.querySelector("[data-vip-private-start]")?.addEventListener("click", () => prepareGame(container))
}

async function joinPrivateRoom(container) {
  const input = container.querySelector("[data-vip-private-code]")
  const code = cleanPrivateCode(input?.value || "")
  if (!code) {
    setStatus(container, "Ingresa el codigo privado entregado por el administrador.", "bad")
    return
  }

  const button = container.querySelector("[data-vip-private-join]")
  if (button) button.disabled = true
  setStatus(container, "Validando sala privada VIP...")

  try {
    const data = await callRpc("vip_private_join_with_code", identityParams({ p_private_code: code }))
    saveActiveState(data)
    renderRoom(container, data)
    setStatus(
      container,
      data.access
        ? "Inscripcion confirmada. Sala privada cargada."
        : data.mensaje || "Tu inscripcion para esta sala aun no ha sido confirmada.",
      data.access ? "ok" : "bad"
    )
  } catch (error) {
    setStatus(container, errorMessage(error, "No se pudo validar el minitorneo VIP privado. Reaplica supabase-vip.sql actualizado."), "bad")
  } finally {
    if (button) button.disabled = false
  }
}

async function prepareGame(container) {
  if (!activeState?.tournament?.id) return
  setStatus(container, "Revalidando acceso antes de preparar el juego...")

  try {
    if (!PRIVATE_TOURNAMENT_SUPPORTED_GAMES.has(activeState.tournament.game_key)) {
      throw new Error("Este juego aun no esta conectado a resultados privados VIP.")
    }

    const data = await callRpc("vip_private_start_game", identityParams({
      p_tournament_id: activeState.tournament.id,
      p_game_key: activeState.tournament.game_key,
    }))
    saveActiveState(data)
    localStorage.setItem(PRIVATE_TOURNAMENT_LAUNCH_KEY, JSON.stringify({
      tournamentId: data?.tournament?.id || activeState.tournament.id,
      gameKey: data?.tournament?.game_key || activeState.tournament.game_key,
      launchedAt: new Date().toISOString(),
      origin: "vip_private_tournament",
    }))
    const game = getVipGame(data?.tournament?.game_key || activeState.tournament.game_key)
    if (!game?.url) throw new Error("No se encontro la ruta del juego privado VIP.")
    setStatus(container, "Acceso privado validado. Abriendo juego...")
    window.location.href = game.url
  } catch (error) {
    setStatus(container, errorMessage(error, "No se pudo preparar el juego privado VIP."), "bad")
  }
}

export function initVipPrivateTournaments(container) {
  if (!container || initialized) return
  initialized = true

  container.querySelector("[data-vip-private-join]")?.addEventListener("click", () => joinPrivateRoom(container))
  container.querySelector("[data-vip-private-code]")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") joinPrivateRoom(container)
  })

  setStatus(container, "Ingresa un codigo privado para validar tu inscripcion.")
}

export function getVipPrivateTournamentLaunch(gameKey) {
  try {
    const launch = JSON.parse(localStorage.getItem(PRIVATE_TOURNAMENT_LAUNCH_KEY) || "null")
    const launchedMs = Date.parse(launch?.launchedAt)
    if (!launch || launch.origin !== "vip_private_tournament") return null
    if (launch.gameKey !== gameKey) return null
    if (!Number.isFinite(launchedMs) || Date.now() - launchedMs > PRIVATE_TOURNAMENT_LAUNCH_TTL_MS) return null
    return launch
  } catch {
    return null
  }
}

export async function validateVipPrivateTournamentLaunch(gameKey) {
  const launch = getVipPrivateTournamentLaunch(gameKey)
  if (!launch?.tournamentId) return { ok: false, privateTournament: false }

  try {
    const data = await callRpc("vip_private_start_game", identityParams({
      p_tournament_id: launch.tournamentId,
      p_game_key: gameKey,
    }))
    return { ok: true, privateTournament: true, state: data }
  } catch (error) {
    localStorage.removeItem(PRIVATE_TOURNAMENT_LAUNCH_KEY)
    return {
      ok: false,
      privateTournament: true,
      message: errorMessage(error, "No se pudo validar el minitorneo VIP privado."),
    }
  }
}

export async function submitVipPrivateTournamentResult({
  gameKey,
  tournamentId,
  score = 0,
  timeSeconds = null,
  metrics = {},
} = {}) {
  if (!gameKey || !tournamentId) return { ok: false, message: "Resultado privado VIP invalido." }

  try {
    const data = await callRpc("vip_private_submit_result", identityParams({
      p_tournament_id: tournamentId,
      p_game_key: gameKey,
      p_score: Math.max(0, Math.trunc(Number(score) || 0)),
      p_time_seconds: timeSeconds === null || timeSeconds === undefined ? null : Math.max(0, Math.trunc(Number(timeSeconds) || 0)),
      p_metrics: metrics && typeof metrics === "object" ? metrics : {},
    }))
    localStorage.removeItem(PRIVATE_TOURNAMENT_LAUNCH_KEY)
    return { ok: true, remote: true, result: data?.result || null, message: data?.mensaje || "Resultado privado VIP guardado." }
  } catch (error) {
    return { ok: false, remote: false, message: errorMessage(error, "No se pudo guardar el resultado privado VIP.") }
  }
}
