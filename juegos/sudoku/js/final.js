import { supabase } from "../../js/supabase.js"
import { redirigirFinalNivelSolitario, volverDesdeFinal } from "../../js/mini-torneo.js"
import { escapeHtml } from "../../js/mensajes.js"
import { aplicarPersonalizacionUsuario, instalarEstilosPersonalizacion } from "../../js/personalizacion-visual.js"
import { limpiarFinalProtegido, validarFinalReciente } from "../../js/final-guard.js"

if (redirigirFinalNivelSolitario()) await new Promise(() => {})
if (!validarFinalReciente("sudoku")) await new Promise(() => {})

const HISTORIA_PENDING_KEY = "historia_trial_pending"
const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const usuario = localStorage.getItem("usuario")
const posicionDiv = document.createElement("h2")
instalarEstilosPersonalizacion()

document.querySelector(".contenedor").insertBefore(posicionDiv, podioDiv)

function leerPruebaHistoriaPendiente(){
  try {
    return JSON.parse(localStorage.getItem(HISTORIA_PENDING_KEY) || "null")
  } catch (error) {
    return null
  }
}

function pruebaHistoriaActiva(){
  const pendiente = leerPruebaHistoriaPendiente()
  return pendiente?.bookId === "novato" && pendiente?.chapterId === "activacion" && pendiente?.gameId === "sudoku"
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

supabase
  .channel("final-ranking")
  .on("postgres_changes", { event: "*", schema: "public", table: "ranking" }, () => cargarResultados())
  .subscribe()

cargarResultados()
actualizarSalidaHistoria()

window.volverLobby = async function () {
  limpiarFinalProtegido("sudoku")
  if (pruebaHistoriaActiva()) {
    window.location.href = "../../historia-novato.html"
    return
  }
  await volverDesdeFinal(supabase)
}
