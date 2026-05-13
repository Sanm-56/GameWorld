import { supabase } from "./supabase.js"
import { redirigirFinalNivelSolitario, volverDesdeFinal } from "./mini-torneo.js"
import { escapeHtml } from "./mensajes.js"
import { getArcadeGame } from "./arcade-games.js"

const gameKey = document.body.dataset.game
const config = getArcadeGame(gameKey)

if (redirigirFinalNivelSolitario()) await new Promise(() => {})

const usuario = localStorage.getItem("usuario")
const fin = localStorage.getItem("fin_juego")
const score = Number(localStorage.getItem(`${gameKey}_puntos`) || 0)
const elapsed = Number(localStorage.getItem(`${gameKey}_elapsed`) || 0)
const combo = Number(localStorage.getItem(`${gameKey}_combo`) || 0)
const isMini = localStorage.getItem("solitario_origen") === "sala"
const rewards = readJson(localStorage.getItem(`ultimo_resultado_${gameKey}`))
const usaFallbackLocal = [
  "cricketarcade",
  "esquivaobstaculos",
  "torreinfinita",
  "subelamontana",
  "basketballarcade",
].includes(gameKey)
const runId = localStorage.getItem(`${gameKey}_run_id`)
const finishedRunId = localStorage.getItem(`${gameKey}_finished_run_id`)
const finishedAtMs = Date.parse(localStorage.getItem(`${gameKey}_finished_at`) || "")
const resultadoReciente = Number.isFinite(finishedAtMs) && Date.now() - finishedAtMs < 30 * 60 * 1000
const resultadoLocalValido = Boolean(fin && (elapsed > 0 || score > 0 || fin === "descalificado"))

if (gameKey === "esquivaobstaculos" && (!resultadoLocalValido || !runId || runId !== finishedRunId || !resultadoReciente)) {
  window.location.replace("lobby.html")
  await new Promise(() => {})
}

document.documentElement.style.setProperty("--accent", config.accent)
document.documentElement.style.setProperty("--secondary", config.secondary)

const els = {
  title: document.getElementById("finalTitle"),
  subtitle: document.getElementById("finalSubtitle"),
  score: document.getElementById("scoreValue"),
  time: document.getElementById("timeValue"),
  combo: document.getElementById("comboValue"),
  result: document.getElementById("resultText"),
  delta: document.getElementById("deltaText"),
  ranking: document.getElementById("ranking"),
  podio: document.getElementById("podio"),
  back: document.getElementById("backBtn"),
}

const restartBtn = usaFallbackLocal && gameKey !== "esquivaobstaculos" ? crearBotonReinicioArcade() : null

els.title.textContent = config.label
els.subtitle.textContent = isMini ? "Resultado de mini torneo" : "Resultado del torneo"
els.score.textContent = `${score} pts`
els.time.textContent = elapsed ? formatTime(elapsed) : "-"
els.combo.textContent = String(combo)
document.querySelector(".summary-grid")?.insertAdjacentHTML("beforeend", `
  <div class="summary-item"><span>Monedas ganadas</span><strong>${Number(rewards?.monedasGanadas || 0)}</strong></div>
  <div class="summary-item"><span>Experiencia obtenida</span><strong>${Number(rewards?.xpGanada || 0)}</strong></div>
`)
els.result.textContent = fin === "descalificado"
  ? "Descalificado"
  : score > 0
    ? "Partida guardada"
    : "Sin puntuacion"

async function load() {
  if (isMini) return loadMiniRanking()
  return loadTournamentRanking()
}

async function loadTournamentRanking() {
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .eq("juego", gameKey)
    .eq("invalido", false)
    .order("tiempo", { ascending: false })

  if (error || !data) {
    if (usaFallbackLocal) {
      renderRanking([], { aviso: "Ranking remoto no disponible. Mostrando tu resultado guardado." })
      return
    }
    els.ranking.innerHTML = '<div class="empty">No se pudo cargar el ranking.</div>'
    return
  }

  renderRanking(data.map((row) => ({ usuario: row.usuario, puntos: row.tiempo })))
}

async function loadMiniRanking() {
  const roomId = localStorage.getItem("solitario_sala_id")
  const { data, error } = await supabase
    .from("sala_jugadores")
    .select("usuario,puntos")
    .eq("sala_id", roomId)
    .order("puntos", { ascending: false })

  if (error || !data) {
    if (usaFallbackLocal) {
      renderRanking([], { aviso: "Ranking del mini torneo no disponible. Mostrando tu resultado guardado." })
      return
    }
    els.ranking.innerHTML = '<div class="empty">No se pudo cargar el ranking del mini torneo.</div>'
    return
  }

  renderRanking(data.map((row) => ({ usuario: row.usuario, puntos: row.puntos })))
}

function renderRanking(rows, opciones = {}) {
  const filas = normalizarFilasFinal(rows)
  const myIndex = filas.findIndex((row) => row.usuario === usuario)
  const filaUsuario = myIndex >= 0 ? filas[myIndex] : null
  const winner = filas[0]

  if (opciones.aviso) {
    els.delta.textContent = opciones.aviso
  }

  if (myIndex === 0) {
    els.result.textContent = "Ganaste"
    if (filas.length > 1) burst()
  } else if (myIndex > 0 && winner) {
    const diff = Math.max(0, Number(winner.puntos || 0) - score)
    agregarDelta(`Perdiste por ${diff} puntos`)
  } else if (filaUsuario) {
    els.result.textContent = "Resultado guardado"
  }

  const previousBest = Number(localStorage.getItem(`${gameKey}_best`) || 0)
  const mejorRemoto = filaUsuario ? Number(filaUsuario.puntos || 0) : 0
  const mejorPersonal = Math.max(previousBest, mejorRemoto, score)
  if (mejorPersonal > previousBest) {
    localStorage.setItem(`${gameKey}_best`, String(mejorPersonal))
  }

  if (myIndex >= 0) {
    agregarDelta(`Posicion #${myIndex + 1} de ${filas.length}`)
  }

  if (score > previousBest && score > 0) {
    agregarDelta("Nuevo record personal")
  } else if (mejorPersonal > 0) {
    agregarDelta(`Record personal: ${mejorPersonal} pts`)
  }

  els.podio.innerHTML = filas.slice(0, 3).map((row, index) => `
    <div class="podium-card">
      <span>#${index + 1}</span>
      <strong>${escapeHtml(row.usuario || "Jugador")}</strong>
      <em>${Number(row.puntos || 0)} pts</em>
    </div>
  `).join("") || '<div class="empty">Sin podio disponible.</div>'

  els.ranking.innerHTML = filas.slice(0, 20).map((row, index) => `
    <div class="ranking-row ${row.usuario === usuario ? "current" : ""}">
      <span>#${index + 1}</span>
      <strong>${escapeHtml(row.usuario || "Jugador")}</strong>
      <span>${Number(row.puntos || 0)} pts</span>
    </div>
  `).join("") || '<div class="empty">Sin resultados disponibles.</div>'
}

function normalizarFilasFinal(rows) {
  const limpias = Array.isArray(rows)
    ? rows
      .filter((row) => row && row.usuario)
      .map((row) => ({ usuario: row.usuario, puntos: Math.max(0, Number(row.puntos || 0)) }))
    : []

  if (usaFallbackLocal && usuario && !limpias.some((row) => row.usuario === usuario)) {
    limpias.push({ usuario, puntos: Math.max(0, score) })
  }

  return limpias.sort((a, b) => Number(b.puntos || 0) - Number(a.puntos || 0))
}

function agregarDelta(texto) {
  if (!texto) return
  els.delta.textContent = els.delta.textContent
    ? `${els.delta.textContent} - ${texto}`
    : texto
}

function burst() {
  for (let i = 0; i < 48; i += 1) {
    const item = document.createElement("i")
    item.className = "burst"
    item.style.left = `${Math.random() * 100}%`
    item.style.animationDelay = `${Math.random() * 0.6}s`
    document.body.appendChild(item)
    setTimeout(() => item.remove(), 2600)
  }
}

function formatTime(seconds) {
  const min = Math.floor(Number(seconds || 0) / 60)
  const sec = Number(seconds || 0) % 60
  return `${min}:${sec < 10 ? "0" : ""}${sec}`
}

function readJson(value) {
  try {
    return JSON.parse(value || "null")
  } catch {
    return null
  }
}

els.back.addEventListener("click", async () => {
  await volverDesdeFinal(supabase, () => {
    limpiarResultadoLocal()
  })
})

restartBtn?.addEventListener("click", () => {
  limpiarResultadoLocal()
  window.location.href = `${gameKey}.html`
})

load()

function crearBotonReinicioArcade() {
  const button = document.createElement("button")
  button.className = "back restart"
  button.type = "button"
  button.textContent = "Jugar otra vez"
  els.back.insertAdjacentElement("beforebegin", button)
  return button
}

function limpiarResultadoLocal() {
  localStorage.removeItem("fin_juego")
  localStorage.removeItem(`${gameKey}_puntos`)
  localStorage.removeItem(`${gameKey}_elapsed`)
  localStorage.removeItem(`${gameKey}_combo`)
  localStorage.removeItem(`${gameKey}_run_id`)
  localStorage.removeItem(`${gameKey}_finished_run_id`)
  localStorage.removeItem(`${gameKey}_finished_at`)
}
