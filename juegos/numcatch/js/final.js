import { supabase } from "../../js/supabase.js"
import { redirigirFinalNivelSolitario, volverDesdeFinal } from "../../js/mini-torneo.js"
import { escapeHtml } from "../../js/mensajes.js"
import { aplicarPersonalizacionUsuario, instalarEstilosPersonalizacion } from "../../js/personalizacion-visual.js"
import { limpiarFinalProtegido, validarFinalReciente } from "../../js/final-guard.js"
import { pruebaHistoriaActiva as esPruebaHistoriaActiva } from "../../js/historia-core.js"

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
  return esPruebaHistoriaActiva("numcatch")
}

const FINAL_GUARD_KEY = pruebaHistoriaActiva() ? "numcatch_historia" : "numcatch"

function historiaReturnUrl(){
  return leerPruebaHistoriaPendiente()?.returnUrl || "historia.html"
}

if (redirigirFinalNivelSolitario()) await new Promise(() => {})
if (!validarFinalReciente(FINAL_GUARD_KEY)) await new Promise(() => {})

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const resultadoFinal = document.getElementById("resultadoFinal")
const resumenFinal = document.getElementById("resumenFinal")
const usuario = localStorage.getItem("usuario")
instalarEstilosPersonalizacion()

const fin = localStorage.getItem("fin_juego")
const puntos = Number(localStorage.getItem("numcatch_puntos") || "0")
const sinPosicion = fin === "descalificado" || puntos <= 0

const posicionDiv = document.createElement("h2")
posicionDiv.className = "posicion-final"
document.querySelector(".contenedor").insertBefore(posicionDiv, document.getElementById("panelResumen"))

function setMensaje() {
  if (fin === "descalificado") {
    resultadoFinal.innerText = "Descalificado por actividad sospechosa"
    resumenFinal.innerText = "Tu resultado fue retirado del ranking."
    posicionDiv.innerText = "Sin posicion"
    return
  }

  if (fin === "tiempo") {
    resultadoFinal.innerText = "Tiempo terminado"
  } else {
    resultadoFinal.innerText = "Partida finalizada"
  }

  resumenFinal.innerText = `Puntaje final: ${puntos} pts`

  if (sinPosicion) {
    posicionDiv.innerText = "Sin posicion"
  }
}

async function cargar() {
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .eq("juego", "numcatch")
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
    const etiquetas = ["1", "2", "3"]
    const div = document.createElement("article")
    div.className = "podio-card"
    div.innerHTML = `
      <span class="puesto">${etiquetas[i]}</span>
      <h3>${escapeHtml(j.usuario)}</h3>
      <p>${j.tiempo} pts</p>
    `
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ""
  if (data.length === 0) {
    rankingDiv.innerHTML = "<p class='vacio'>No hay resultados todavia.</p>"
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
  resultadoFinal.innerText = completada ? "Libro Novato completado" : "Prueba del Nexus pendiente"
  resumenFinal.innerText = completada ? "El primer sello del rango Novato quedo establecido." : "El sello final sigue inestable."
  posicionDiv.innerText = "Capitulo 5"
  podioDiv.innerHTML = ""
  rankingDiv.innerHTML = `<p class="vacio">${completada ? "La conexion fue establecida. Vuelve al libro para ver el cierre." : "Vuelve al libro para intentarlo de nuevo."}</p>`
  const boton = document.querySelector(".contenedor > button:not(.musica)")
  if (boton) boton.textContent = "Volver al libro"
} else {
  cargar()
}

window.volverLobby = async function () {
  limpiarFinalProtegido(FINAL_GUARD_KEY)
  if (pruebaHistoriaActiva()) {
    window.location.href = `../../${historiaReturnUrl()}`
    return
  }
  await volverDesdeFinal(supabase)
}

localStorage.removeItem("fin_juego")
