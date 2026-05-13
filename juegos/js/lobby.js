import { supabase } from "../js/supabase.js"

const container = document.querySelector(".container")
const juegoLobby = window.location.pathname.split("/").filter(Boolean).slice(-2, -1)[0]
const rutasJuego = {
  sudoku: "sudoku.html",
  memoria: "memoria.html",
  matematicas: "matematicas.html",
  flashmind: "flashmind.html",
  numcatch: "numcatch.html",
  cricketarcade: "cricketarcade.html",
  esquivaobstaculos: "esquivaobstaculos.html",
  torreinfinita: "torreinfinita.html",
  subelamontana: "subelamontana.html",
  basketballarcade: "basketballarcade.html",
  ajedrez: "ajedrez.html",
  domino: "domino.html",
  damas: "damas.html",
}

if (container && !document.getElementById("volverMenuBtn")) {
const volverBtn = document.createElement("button")
volverBtn.id = "volverMenuBtn"
volverBtn.textContent = "Volver al menu de opciones"
volverBtn.style.marginTop = "14px"
volverBtn.style.padding = "12px 20px"
volverBtn.style.border = "none"
volverBtn.style.borderRadius = "12px"
volverBtn.style.fontSize = "16px"
volverBtn.style.fontWeight = "bold"
volverBtn.style.cursor = "pointer"
volverBtn.style.background = "linear-gradient(135deg, #38bdf8, #2563eb)"
volverBtn.style.color = "white"
volverBtn.onclick = () => {
window.location.href = "../../index.html"
}
container.appendChild(volverBtn)
}

async function revisarEstado(){

let { data, error } = await supabase
.from("estado_torneo")
.select("*")
.eq("id",1)
.single()

if(error){
console.log(error)
return
}

let estado = data.estado
let juego = data.juego_actual

// Mostrar info en pantalla
document.getElementById("mensaje").innerText =
"Estado: " + estado + " | Juego: " + juego

if(estado === "iniciado"){

if(juego === juegoLobby && rutasJuego[juego]){
localStorage.setItem("juego_actual", juego)
window.location.href = rutasJuego[juego]
return
}

document.getElementById("mensaje").innerText =
"Estado: " + estado + " | Juego activo: " + juego + " | Esperando inicio de " + juegoLobby

}

}

setInterval(revisarEstado,3000)
revisarEstado()
