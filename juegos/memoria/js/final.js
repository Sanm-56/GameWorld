import { supabase } from "../../js/supabase.js"
import { redirigirFinalNivelSolitario, volverDesdeFinal } from "../../js/mini-torneo.js"
import { escapeHtml } from "../../js/mensajes.js"
import { aplicarPersonalizacionUsuario, instalarEstilosPersonalizacion } from "../../js/personalizacion-visual.js"
import { limpiarFinalProtegido, validarFinalReciente } from "../../js/final-guard.js"

if (redirigirFinalNivelSolitario()) await new Promise(() => {})
if (!validarFinalReciente("memoria")) await new Promise(() => {})

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const usuario = localStorage.getItem("usuario")
const juegoActual = localStorage.getItem("juego_actual") || "memoria"
const posicionDiv = document.createElement("h2")
const resultadoDiv = document.createElement("h2")
const resumenDiv = document.createElement("p")
const fin = localStorage.getItem("fin_juego")
const resultadoMemoria = localStorage.getItem("memoriaResultado")
instalarEstilosPersonalizacion()
resultadoDiv.id = "resultadoFinal"
resumenDiv.id = "resumenFinal"
posicionDiv.className = "posicion-final"

const contenedor = document.querySelector(".contenedor")
contenedor.insertBefore(resultadoDiv, document.getElementById("panelResumen"))
contenedor.insertBefore(resumenDiv, document.getElementById("panelResumen"))
contenedor.insertBefore(posicionDiv, document.getElementById("panelResumen"))

if (fin === "descalificado") {
  resultadoDiv.innerText = "Descalificado por actividad sospechosa"
  resumenDiv.innerText = resultadoMemoria || "Tu resultado fue retirado del ranking."
} else {
  resultadoDiv.innerText = "Resultado Memoria"
  resumenDiv.innerText = "Ranking final del torneo."
}

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return minutos + ":" + (seg < 10 ? "0" : "") + seg
}

async function cargarResultados() {
  if (fin === "descalificado") {
    posicionDiv.innerText = "Sin posicion competitiva"
  }

  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .eq("juego", juegoActual)
    .order("tiempo", { ascending: true })

  if (error) {
    console.error("Error cargando ranking memoria:", error)
    podioDiv.innerHTML = "Sin resultados"
    return
  }

  const filas = (data || []).filter(r => !r.invalido)

  if (filas.length === 0) {
    podioDiv.innerHTML = "Sin resultados"
    rankingDiv.innerHTML = "<p class='vacio'>No hay resultados de memoria todavia.</p>"
    return
  }

  const posicion = filas.findIndex((j) => j.usuario === usuario)

  if (fin === "descalificado") {
    posicionDiv.innerText = "Sin posicion competitiva"
  } else if (posicion !== -1) {
    let mensaje = `Quedaste #${posicion + 1} de ${filas.length} jugadores`

    if (posicion === 0) mensaje += " - GANASTE"
    else if (posicion < 3) mensaje += " - Podio"
    else mensaje += " - Buen intento"

    posicionDiv.innerText = mensaje
  } else {
    posicionDiv.innerText = "No estas en el ranking"
  }

  podioDiv.innerHTML = ""
  filas.slice(0, 3).forEach((j, i) => {
    const etiqueta = ["#1", "#2", "#3"][i]
    const div = document.createElement("div")
    div.innerHTML = `
      <h3>${etiqueta} ${escapeHtml(j.usuario)}</h3>
      <p>${formatearTiempo(j.tiempo)}</p>
    `
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ""
  filas.forEach((j, i) => {
    const div = document.createElement("div")
    div.className = `ranking-row${j.usuario === usuario ? " actual" : ""}`
    div.innerHTML = `
      <span>#${i + 1}</span>
      <strong>${escapeHtml(j.usuario)}</strong>
      <span>${formatearTiempo(j.tiempo)}${j.sospechoso ? " - Sospechoso" : ""}</span>
    `
    rankingDiv.appendChild(div)
    aplicarPersonalizacionUsuario(div, j.usuario)
  })
}

supabase
  .channel("final-ranking")
  .on("postgres_changes", { event: "*", schema: "public", table: "ranking" }, () => cargarResultados())
  .subscribe()

cargarResultados()

window.volverLobby = async function () {
  limpiarFinalProtegido("memoria")
  localStorage.removeItem("memoriaResultado")
  await volverDesdeFinal(supabase)
}
