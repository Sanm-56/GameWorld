import { supabase } from "../js/supabase.js"

const container = document.querySelector(".container")

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

localStorage.setItem("juego_actual", juego)

if(juego === "sudoku"){
window.location.href = "sudoku.html"
}

if(juego === "memoria"){
window.location.href = "memoria.html"
}

if(juego === "matematicas"){
window.location.href = "matematicas.html"
}

if(juego === "ajedrez"){
window.location.href = "ajedrez.html"
}

if(juego === "domino"){
window.location.href = "domino.html"
}

if(juego === "damas"){
window.location.href = "damas.html"
}

}

}

setInterval(revisarEstado,3000)
revisarEstado()
