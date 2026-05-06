import { supabase } from "./supabase.js"
import { escapeHtml } from "./mensajes.js"

const GAMES = [
  { key: "sudoku", label: "Sudoku", mode: "time" },
  { key: "matematicas", label: "Matematicas", mode: "points" },
  { key: "memoria", label: "Memoria", mode: "time" },
  { key: "flashmind", label: "FlashMind", mode: "points" },
  { key: "numcatch", label: "NumCatch", mode: "points" },
  { key: "ajedrez", label: "Ajedrez", mode: "time" },
  { key: "domino", label: "Domino", mode: "time" },
  { key: "damas", label: "Damas", mode: "time" },
]

const modal = document.getElementById("rankingModal")
const gameSelect = document.getElementById("rankingGame")
const statusEl = document.getElementById("rankingStatus")
const listEl = document.getElementById("rankingList")
const tabs = [...document.querySelectorAll("[data-ranking-type]")]
const openButtons = document.querySelectorAll("[data-open-rankings]")
const closeButtons = document.querySelectorAll("[data-close-rankings]")

let activeType = "semanal"

function initRankingModal() {
  if (!modal || !gameSelect || !statusEl || !listEl) return

  gameSelect.innerHTML = GAMES
    .map((game) => `<option value="${game.key}">${game.label}</option>`)
    .join("")

  openButtons.forEach((button) => button.addEventListener("click", abrirModal))
  closeButtons.forEach((button) => button.addEventListener("click", cerrarModal))
  modal.addEventListener("click", cerrarDesdeFondo)
  document.addEventListener("keydown", cerrarConEscape)
  gameSelect.addEventListener("change", cargarRanking)

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeType = tab.dataset.rankingType
      tabs.forEach((item) => item.classList.toggle("activo", item === tab))
      cargarRanking()
    })
  })
}

function abrirModal() {
  modal.classList.add("abierto")
  modal.setAttribute("aria-hidden", "false")
  cargarRanking()
}

function cerrarModal() {
  modal.classList.remove("abierto")
  modal.setAttribute("aria-hidden", "true")
}

function cerrarDesdeFondo(event) {
  if (event.target === modal) cerrarModal()
}

function cerrarConEscape(event) {
  if (event.key === "Escape" && modal.classList.contains("abierto")) cerrarModal()
}

async function cargarRanking() {
  const game = GAMES.find((item) => item.key === gameSelect.value) || GAMES[0]
  statusEl.textContent = "Cargando ranking..."
  listEl.innerHTML = ""

  const rows = await obtenerDatos(game)
  const ranking = construirRanking(rows, game, activeType).slice(0, 20)

  if (!ranking.length) {
    statusEl.textContent = "Todavia no hay resultados para este ranking."
    listEl.innerHTML = ""
    return
  }

  statusEl.textContent = `Mostrando ${ranking.length} resultado${ranking.length === 1 ? "" : "s"}.`
  listEl.innerHTML = ranking.map(renderFila).join("")
}

async function obtenerDatos(game) {
  const partidas = await obtenerPartidas(game.key)
  if (partidas.length) return partidas

  return obtenerRankingActual(game)
}

async function obtenerPartidas(juego) {
  const { data, error } = await supabase
    .from("partidas")
    .select("usuario,usuario_id,juego,puntos,tiempo,posicion,fecha")
    .eq("juego", juego)

  if (error) {
    console.warn("No se pudo leer partidas, usando ranking actual", error)
    return []
  }

  return (data || []).map((row) => ({
    usuario: row.usuario || row.usuario_id || "Jugador",
    puntos: Number(row.puntos || 0),
    tiempo: Number(row.tiempo || 0),
    posicion: Number(row.posicion || 0),
    fecha: row.fecha,
  }))
}

async function obtenerRankingActual(game) {
  const ascendente = game.mode === "time"
  let { data, error } = await supabase
    .from("ranking")
    .select("usuario,tiempo,juego,fecha,invalido")
    .eq("juego", game.key)
    .eq("invalido", false)
    .order("tiempo", { ascending: ascendente })

  if ((!data || data.length === 0) && ["ajedrez", "domino", "damas"].includes(game.key)) {
    const table = {
      ajedrez: "ranking_ajedrez",
      domino: "ranking_domino",
      damas: "ranking_damas",
    }[game.key]

    const fallback = await supabase
      .from(table)
      .select("usuario,tiempo,juego,fecha,invalido")
      .eq("invalido", false)
      .order("tiempo", { ascending: ascendente })

    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.warn("No se pudo leer ranking actual", error)
    return []
  }

  return (data || []).map((row, index) => ({
    usuario: row.usuario || "Jugador",
    puntos: game.mode === "points" ? Number(row.tiempo || 0) : 0,
    tiempo: Number(row.tiempo || 0),
    posicion: index + 1,
    fecha: row.fecha,
  }))
}

function construirRanking(rows, game, type) {
  const desdeSemana = inicioDeSemana()
  const filtradas = type === "semanal"
    ? rows.filter((row) => !row.fecha || new Date(row.fecha) >= desdeSemana)
    : rows

  const acumulado = new Map()

  filtradas.forEach((row) => {
    const key = row.usuario
    const actual = acumulado.get(key) || {
      usuario: key,
      total: 0,
      victorias: 0,
      mejorTiempo: Number.POSITIVE_INFINITY,
      partidas: 0,
    }

    actual.partidas += 1
    actual.victorias += row.posicion === 1 ? 1 : 0
    actual.total = game.mode === "points"
      ? actual.total + row.puntos
      : Math.min(actual.total || Number.POSITIVE_INFINITY, row.tiempo || Number.POSITIVE_INFINITY)
    actual.mejorTiempo = Math.min(actual.mejorTiempo, row.tiempo || Number.POSITIVE_INFINITY)
    acumulado.set(key, actual)
  })

  return [...acumulado.values()].sort((a, b) => ordenarRanking(a, b, game, type))
}

function ordenarRanking(a, b, game, type) {
  if (type === "victorias") return b.victorias - a.victorias || desempate(a, b, game)
  if (game.mode === "points") return b.total - a.total || a.usuario.localeCompare(b.usuario)
  return a.total - b.total || a.usuario.localeCompare(b.usuario)
}

function desempate(a, b, game) {
  if (game.mode === "points") return b.total - a.total
  return a.mejorTiempo - b.mejorTiempo
}

function renderFila(row, index) {
  return `
    <div class="ranking-row">
      <span class="ranking-pos">#${index + 1}</span>
      <span class="ranking-user">${escapeHtml(row.usuario)}</span>
      <span class="ranking-score">${formatearValor(row)}</span>
    </div>
  `
}

function formatearValor(row) {
  if (activeType === "victorias") return `${row.victorias} victoria${row.victorias === 1 ? "" : "s"}`
  const game = GAMES.find((item) => item.key === gameSelect.value)
  if (game?.mode === "points") return `${row.total} pts`
  return formatearTiempo(row.total)
}

function formatearTiempo(segundos) {
  if (!Number.isFinite(segundos)) return "-"
  const minutos = Math.floor(segundos / 60)
  const seg = Math.round(segundos % 60)
  return `${minutos}:${seg < 10 ? "0" : ""}${seg}`
}

function inicioDeSemana() {
  const hoy = new Date()
  const dia = hoy.getDay() || 7
  const inicio = new Date(hoy)
  inicio.setDate(hoy.getDate() - dia + 1)
  inicio.setHours(0, 0, 0, 0)
  return inicio
}

initRankingModal()
