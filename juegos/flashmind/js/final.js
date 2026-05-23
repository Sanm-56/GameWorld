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
  let lanzamiento = null
  try {
    lanzamiento = JSON.parse(localStorage.getItem(LAUNCH_KEY) || "null")
  } catch (error) {
    lanzamiento = null
  }

  const pendiente = leerPruebaHistoriaPendiente()
  return lanzamiento?.origin === "historia"
    && lanzamiento?.game === "flashmind"
    && pendiente?.bookId === "novato"
    && pendiente?.chapterId === "camara-inicial"
    && pendiente?.gameId === "flashmind"
}

const FINAL_GUARD_KEY = pruebaHistoriaActiva() ? "flashmind_historia" : "flashmind"

if (redirigirFinalNivelSolitario()) await new Promise(() => {})
if (!validarFinalReciente(FINAL_GUARD_KEY)) await new Promise(() => {})

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const resultadoFinal = document.getElementById("resultadoFinal")
const usuario = localStorage.getItem("usuario")
instalarEstilosPersonalizacion()

const fin = localStorage.getItem("fin_juego")
const puntos = Number(localStorage.getItem("flashmind_puntos") || "0")
const sinPosicion = fin === "descalificado" || puntos <= 0

const posicionDiv = document.createElement("h2")
document.querySelector(".contenedor").insertBefore(posicionDiv, podioDiv)

function setMensaje() {
  if (fin === "descalificado") {
    resultadoFinal.innerText = "Descalificado por actividad sospechosa"
    posicionDiv.innerText = "Sin posicion"
    return
  }

  if (fin === "tiempo") {
    resultadoFinal.innerText = `Tiempo terminado. Puntaje: ${puntos} pts`
  } else {
    resultadoFinal.innerText = `Partida finalizada. Puntaje: ${puntos} pts`
  }

  if (sinPosicion) {
    posicionDiv.innerText = "Sin posicion"
  }
}

async function cargar() {
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .eq("juego", "flashmind")
    .eq("invalido", false)
    .order("tiempo", { ascending: false })

  if (error || !data) return

  if (!sinPosicion) {
    const miPos = data.findIndex((j) => j.usuario === usuario)
    if (miPos >= 0) {
      let msg = `Quedaste #${miPos + 1} de ${data.length}`
      if (miPos === 0) msg += " Ganaste"
      else if (miPos < 3) msg += " Podio"
      posicionDiv.innerText = msg
    } else {
      posicionDiv.innerText = "Sin posicion"
    }
  }

  podioDiv.innerHTML = ""
  data.slice(0, 3).forEach((j, i) => {
    const emoji = ["1", "2", "3"][i]
    const div = document.createElement("div")
    div.innerHTML = `<h3>${emoji}. ${escapeHtml(j.usuario)}</h3><p>${j.tiempo} pts</p>`
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ""
  if (data.length === 0) {
    rankingDiv.innerHTML = "<p>No hay resultados todavia.</p>"
    return
  }

  data.forEach((j, i) => {
    const div = document.createElement("div")
    div.className = `ranking-row${j.usuario === usuario && !sinPosicion ? " actual" : ""}`
    div.innerHTML = `
      <span>#${i + 1}</span>
      <strong>${escapeHtml(j.usuario)}</strong>
      <span>${j.tiempo} pts</span>
    `
    rankingDiv.appendChild(div)
    aplicarPersonalizacionUsuario(div, j.usuario)
  })
}

setMensaje()
if (pruebaHistoriaActiva()) {
  const completada = Boolean(leerPruebaHistoriaPendiente()?.completed)
  resultadoFinal.innerText = completada ? "Prueba del Nexus completada" : "Prueba del Nexus pendiente"
  posicionDiv.innerText = "Capitulo 4"
  podioDiv.innerHTML = ""
  rankingDiv.innerHTML = `<p class="vacio">${completada ? "La camara inicial recupero su pulso." : "La camara inicial sigue inestable."}</p>`
  const boton = document.querySelector(".contenedor > button:not(.musica)")
  if (boton) boton.textContent = "Volver al Libro Novato"
} else {
  cargar()
}

window.volverLobby = async function () {
  limpiarFinalProtegido(FINAL_GUARD_KEY)
  if (pruebaHistoriaActiva()) {
    window.location.href = "../../historia-novato.html"
    return
  }
  await volverDesdeFinal(supabase)
}

localStorage.removeItem("fin_juego")
