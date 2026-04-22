import { supabase } from "../../js/supabase.js"

const podioDiv = document.getElementById("podio")
const rankingDiv = document.getElementById("ranking")
const resultadoFinal = document.getElementById("resultadoFinal")
const usuario = localStorage.getItem("usuario")

const fin = localStorage.getItem("fin_juego")
const puntos = Number(localStorage.getItem("flashmind_puntos") || "0")

function setMensaje() {
  if (fin === "tiempo") resultadoFinal.innerText = `⏱️ Tiempo terminado. Puntaje: ${puntos} pts`
  else if (fin === "descalificado") resultadoFinal.innerText = "❌ Descalificado"
  else resultadoFinal.innerText = `✅ Partida finalizada. Puntaje: ${puntos} pts`
}

async function cargar() {
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .eq("juego", "flashmind")
    .eq("invalido", false)
    .order("tiempo", { ascending: false })

  if (error || !data) return

  const miPos = data.findIndex((j) => j.usuario === usuario)
  const posicionDiv = document.createElement("h2")
  if (miPos >= 0) {
    let msg = `Quedaste #${miPos + 1} de ${data.length}`
    if (miPos === 0) msg += " 🥇"
    else if (miPos < 3) msg += " 🏆"
    posicionDiv.innerText = `🎯 ${msg}`
  } else {
    posicionDiv.innerText = "No estás en el ranking"
  }

  document.querySelector(".contenedor").insertBefore(posicionDiv, podioDiv)

  podioDiv.innerHTML = ""
  data.slice(0, 3).forEach((j, i) => {
    const emoji = ["🥇", "🥈", "🥉"][i]
    const div = document.createElement("div")
    div.innerHTML = `<h3>${emoji} ${j.usuario}</h3><p>⭐ ${j.tiempo} pts</p>`
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ""
  if (data.length === 0) {
    rankingDiv.innerHTML = "<p>No hay resultados todavía.</p>"
    return
  }

  data.forEach((j, i) => {
    const destacado = j.usuario === usuario ? 'style="color:#22c55e; font-weight:bold"' : ""
    rankingDiv.innerHTML += `<div ${destacado}>#${i + 1} - ${j.usuario} (${j.tiempo} pts)</div>`
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

