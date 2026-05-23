import { supabase } from "../../js/supabase.js"
import { redirigirFinalNivelSolitario, volverDesdeFinal } from "../../js/mini-torneo.js"
import { escapeHtml } from "../../js/mensajes.js"
import { aplicarPersonalizacionUsuario, instalarEstilosPersonalizacion } from "../../js/personalizacion-visual.js"
import { limpiarFinalProtegido, validarFinalReciente } from "../../js/final-guard.js"

const HISTORIA_PENDING_KEY = "historia_trial_pending"
const LAUNCH_KEY = "solitario_game_launch"

function leerPruebaHistoriaPendiente(){
  try {
    return JSON.parse(localStorage.getItem(HISTORIA_PENDING_KEY) || "null")
  } catch (error) {
    return null
  }
}

function pruebaHistoriaActiva(){
  const pendiente = leerPruebaHistoriaPendiente()
  let lanzamiento = null
  try {
    lanzamiento = JSON.parse(localStorage.getItem(LAUNCH_KEY) || "null")
  } catch (error) {
    lanzamiento = null
  }

  return lanzamiento?.origin === "historia"
    && lanzamiento?.game === "sudoku"
    && pendiente?.bookId === "novato"
    && pendiente?.chapterId === "activacion"
    && pendiente?.gameId === "sudoku"
}

const FINAL_GUARD_KEY = pruebaHistoriaActiva() ? "sudoku_historia" : "sudoku"

if (redirigirFinalNivelSolitario()) await new Promise(() => {})
if (!validarFinalReciente(FINAL_GUARD_KEY)) await new Promise(() => {})

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const usuario = localStorage.getItem("usuario")
const posicionDiv = document.createElement("h2")
instalarEstilosPersonalizacion()

document.querySelector(".contenedor").insertBefore(posicionDiv, podioDiv)

function renderResultadoHistoria(){
  const completada = Boolean(leerPruebaHistoriaPendiente()?.completed)
  posicionDiv.innerText = completada ? "Prueba del Nexus completada" : "Prueba del Nexus pendiente"
  podioDiv.innerHTML = ""
  rankingDiv.innerHTML = `
    <div class="vacio">
      ${completada
        ? "El primer codigo fue estabilizado. Vuelve al Libro Novato para continuar la historia."
        : "La prueba no se estabilizo todavia. Vuelve al Libro Novato e intenta de nuevo cuando estes listo."}
    </div>
  `
}

function actualizarSalidaHistoria(){
  const boton = document.querySelector(".contenedor > button:not(.musica)")
  if (!boton || !pruebaHistoriaActiva()) return
  boton.textContent = "Volver al Libro Novato"
}

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return minutos + ":" + (seg < 10 ? "0" : "") + seg
}

async function cargarResultados() {
  const juegoActual = localStorage.getItem("juego_actual") || "sudoku"
  const { data } = await supabase
    .from("ranking")
    .select("*")
    .eq("invalido", false)
    .eq("juego", juegoActual)
    .order("tiempo", { ascending: true })

  if (!data) return

  const posicion = data.findIndex((j) => j.usuario === usuario)

  if (posicion !== -1) {
    let mensaje = `Quedaste #${posicion + 1} de ${data.length}`

    if (posicion === 0) {
      mensaje += " - GANASTE"
      setTimeout(lanzarConfeti, 500)
    } else if (posicion < 3) {
      mensaje += " - Podio"
    } else {
      mensaje += " - Buen intento"
    }

    posicionDiv.innerText = mensaje
  } else {
    posicionDiv.innerText = "No estas en el ranking"
  }

  podioDiv.innerHTML = ""
  data.slice(0, 3).forEach((j, i) => {
    const etiqueta = ["#1", "#2", "#3"][i]
    const div = document.createElement("div")
    div.innerHTML = `
      <h3>${etiqueta} ${escapeHtml(j.usuario)}</h3>
      <p>${formatearTiempo(j.tiempo)}</p>
    `
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ""
  data.forEach((j, i) => {
    const div = document.createElement("div")
    div.className = `ranking-row${j.usuario === usuario ? " actual" : ""}`
    div.innerHTML = `
      <span>#${i + 1}</span>
      <strong>${escapeHtml(j.usuario)}</strong>
      <span>${formatearTiempo(j.tiempo)}</span>
    `
    rankingDiv.appendChild(div)
    aplicarPersonalizacionUsuario(div, j.usuario)
  })
}

function lanzarConfeti() {
  for (let i = 0; i < 80; i += 1) {
    const c = document.createElement("div")
    c.classList.add("confeti")
    c.style.left = Math.random() * 100 + "vw"
    c.style.background = `hsl(${Math.random() * 360},100%,50%)`
    c.style.animationDuration = (Math.random() * 2 + 2) + "s"
    document.body.appendChild(c)
    setTimeout(() => c.remove(), 4000)
  }
}

if (pruebaHistoriaActiva()) {
  renderResultadoHistoria()
  actualizarSalidaHistoria()
} else {
  supabase
    .channel("final-ranking")
    .on("postgres_changes", { event: "*", schema: "public", table: "ranking" }, () => cargarResultados())
    .subscribe()

  cargarResultados()
}

window.volverLobby = async function () {
  limpiarFinalProtegido(FINAL_GUARD_KEY)
  if (pruebaHistoriaActiva()) {
    window.location.href = "../../historia-novato.html"
    return
  }
  await volverDesdeFinal(supabase)
}
