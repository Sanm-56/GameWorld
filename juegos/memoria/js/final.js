import { supabase } from "../../js/supabase.js"

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const usuario = localStorage.getItem("usuario")
const juegoActual = localStorage.getItem("juego_actual") || "memoria"
const posicionDiv = document.createElement("h2")
posicionDiv.className = "posicion-final"

document.querySelector(".contenedor").insertBefore(posicionDiv, document.getElementById("panelResumen"))

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return minutos + ":" + (seg < 10 ? "0" : "") + seg
}

async function cargarResultados() {
  const { data } = await supabase
    .from("ranking")
    .select("*")
    .eq("invalido", false)
    .eq("juego", juegoActual)
    .order("tiempo", { ascending: true })

  if (!data || data.length === 0) {
    podioDiv.innerHTML = "Sin resultados"
    return
  }

  const posicion = data.findIndex((j) => j.usuario === usuario)

  if (posicion !== -1) {
    let mensaje = `Quedaste #${posicion + 1} de ${data.length} jugadores`

    if (posicion === 0) mensaje += " - GANASTE"
    else if (posicion < 3) mensaje += " - Podio"
    else mensaje += " - Buen intento"

    posicionDiv.innerText = mensaje
  } else {
    posicionDiv.innerText = "No estas en el ranking"
  }

  podioDiv.innerHTML = ""
  data.slice(0, 3).forEach((j, i) => {
    const etiqueta = ["#1", "#2", "#3"][i]
    const div = document.createElement("div")
    div.innerHTML = `
      <h3>${etiqueta} ${j.usuario}</h3>
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
      <strong>${j.usuario}</strong>
      <span>${formatearTiempo(j.tiempo)}${j.sospechoso ? " - Sospechoso" : ""}</span>
    `
    rankingDiv.appendChild(div)
  })
}

supabase
  .channel("final-ranking")
  .on("postgres_changes", { event: "*", schema: "public", table: "ranking" }, () => cargarResultados())
  .subscribe()

cargarResultados()

window.volverLobby = async function () {
  const { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  if (data?.estado !== "espera") {
    alert("Torneo aun activo")
    return
  }

  localStorage.removeItem("juego_actual")
  window.location.href = "lobby.html"
}
