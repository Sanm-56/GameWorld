import { supabase } from "../../js/supabase.js"

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const resultadoFinal = document.getElementById("resultadoFinal")
const usuario = localStorage.getItem("usuario")

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
    div.innerHTML = `<h3>${emoji}. ${j.usuario}</h3><p>${j.tiempo} pts</p>`
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
      <strong>${j.usuario}</strong>
      <span>${j.tiempo} pts</span>
    `
    rankingDiv.appendChild(div)
  })
}

setMensaje()
cargar()

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

localStorage.removeItem("fin_juego")
