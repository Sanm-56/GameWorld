import { supabase } from "../juegos/js/supabase.js"
import {
  LEVELS,
  clearLevelContext,
  getGameLabel,
  getLastLevelResult,
  getLevelContext,
  missionFailureMessage,
  missionLabel,
  missionProgress,
  reportLevelResult,
  startLevel,
} from "../juegos/js/solitario-niveles.js"

const els = {
  card: document.getElementById("finalCard"),
  eyebrow: document.getElementById("finalEyebrow"),
  title: document.getElementById("finalTitle"),
  message: document.getElementById("finalMessage"),
  mission: document.getElementById("missionText"),
  failure: document.getElementById("failureText"),
  level: document.getElementById("levelValue"),
  score: document.getElementById("scoreValue"),
  time: document.getElementById("timeValue"),
  coins: document.getElementById("coinsValue"),
  xp: document.getElementById("xpValue"),
  progress: document.getElementById("progressList"),
  next: document.getElementById("nextLevelBtn"),
  retry: document.getElementById("retryBtn"),
  map: document.getElementById("mapBtn"),
}

init()

async function init() {
  const summary = await loadSummary()
  render(summary)

  els.map.addEventListener("click", () => goMap(summary, false))
  els.retry.addEventListener("click", () => retry(summary))
  els.next.addEventListener("click", () => goMap(summary, true))
}

async function loadSummary() {
  const stored = getLastLevelResult()
  if (stored?.level && stored?.result) return stored

  const context = getLevelContext()
  const usuario = localStorage.getItem("usuario")
  if (!context || !usuario) return null

  const level = LEVELS.find((item) => item.id === Number(context.id))
  if (!level) return null

  const fin = localStorage.getItem("fin_juego")
  return reportLevelResult(supabase, {
    usuario,
    juego: context.game,
    valor: inferValue(context.game),
    modo: inferMode(level),
    invalido: fin === "descalificado",
    motivo: fin === "descalificado" ? "Descalificado por actividad sospechosa." : "",
  })
}

function render(summary) {
  if (!summary) {
    els.title.textContent = "Resultado no disponible"
    els.message.textContent = "No se encontro una partida de nivel activa."
    els.next.hidden = true
    els.retry.hidden = true
    return
  }

  const level = summary.level
  const result = summary.result
  const completed = Boolean(summary.completed)
  const invalid = Boolean(result.invalid)
  const progressItems = summary.progressItems || missionProgress(level, result)

  els.card.classList.toggle("completed", completed)
  els.card.classList.toggle("failed", !completed)
  els.card.classList.toggle("invalid", invalid)
  els.eyebrow.textContent = `${getGameLabel(level.game)} - ${level.difficulty || "Reto"}`
  els.title.textContent = invalid
    ? "Nivel descalificado"
    : completed
      ? "Nivel completado"
      : "Mision no superada"
  els.message.textContent = invalid
    ? "La partida termino por actividad sospechosa. No se aplico progreso de nivel."
    : completed
      ? (summary.newlyCompleted ? "Excelente trabajo. Nuevo nivel desbloqueado." : "Mision superada de nuevo.")
      : "Buen intento. Revisa el objetivo y vuelve con mejor ritmo."
  els.mission.textContent = summary.missionText || missionLabel(level)
  els.failure.textContent = completed ? "" : (summary.failureMessage || missionFailureMessage(level, result))
  els.level.textContent = String(level.id)
  els.score.textContent = String(result.score || 0)
  els.time.textContent = result.time ? formatTime(result.time) : result.elapsed ? formatTime(result.elapsed) : "-"
  els.coins.textContent = String(summary.monedasGanadas || 0)
  els.xp.textContent = formatearXpResumen(summary)
  els.progress.innerHTML = progressItems.map((item) => `
    <div class="solo-progress-row ${item.ok ? "ok" : "bad"}">
      <span>${item.ok ? "OK" : "NO"}</span>
      <strong>${escapeHtml(item.label)}</strong>
    </div>
  `).join("")
  els.next.disabled = !completed || level.id >= LEVELS.length
  els.next.textContent = level.id >= LEVELS.length ? "Mapa completado" : "Siguiente nivel"
  if (summary.recompensasXp?.length) lanzarReaccionRecompensa(summary.recompensasXp)
}

function retry(summary) {
  const level = summary?.level
  if (!level) return goMap(summary, false)
  localStorage.removeItem("solitario_nivel_resultado")
  startLevel(level, localStorage.getItem("usuario") || summary.usuario)
  localStorage.setItem("solitario_game_launch", JSON.stringify({
    game: level.game,
    origin: "nivel",
    launchedAt: new Date().toISOString(),
  }))
  localStorage.setItem("solitario_selected_level", String(level.id))
  window.location.href = `../juegos/${level.game}/${level.game}.html`
}

function goMap(summary, next) {
  if (summary?.level) {
    localStorage.setItem("solitario_selected_level", String(next ? Math.min(summary.level.id + 1, LEVELS.length) : summary.level.id))
  }
  clearLevelContext()
  localStorage.removeItem("fin_juego")
  localStorage.removeItem("juego_actual")
  window.location.href = "solitario.html"
}

function inferValue(game) {
  if (game === "flashmind") return Number(localStorage.getItem("flashmind_puntos") || 0)
  if (game === "numcatch") return Number(localStorage.getItem("numcatch_puntos") || 0)
  if (["cricketarcade", "esquivaobstaculos", "torreinfinita", "subelamontana", "basketballarcade"].includes(game)) {
    return Number(localStorage.getItem(`${game}_puntos`) || 0)
  }
  return 0
}

function inferMode(level) {
  return level?.mission?.conditions?.some((condition) => condition.type === "score") ? "points" : "time"
}

function formatTime(seconds) {
  const min = Math.floor(Number(seconds || 0) / 60)
  const sec = Number(seconds || 0) % 60
  return `${min}:${sec < 10 ? "0" : ""}${sec}`
}

function formatearXpResumen(summary) {
  const xpBase = Number(summary?.xpGanada || 0)
  const bonus = (summary?.recompensasXp || []).reduce((total, item) => total + Number(item.xp || 0), 0)
  if (!bonus) return String(xpBase)
  return `${formatNumber(xpBase + bonus)} (+${formatNumber(bonus)} bonus)`
}

function lanzarReaccionRecompensa(recompensas) {
  if (document.querySelector(".xp-reward-burst")) return
  const total = recompensas.reduce((sum, item) => sum + Number(item.xp || 0), 0)
  const burst = document.createElement("div")
  burst.className = "xp-reward-burst"
  burst.innerHTML = `
    <span>Recompensa desbloqueada</span>
    <strong>+${formatNumber(total)} XP</strong>
  `
  document.body.appendChild(burst)
  setTimeout(() => burst.remove(), 3200)
}

function formatNumber(value) {
  return Math.max(0, Number(value) || 0).toLocaleString("es-CO")
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
