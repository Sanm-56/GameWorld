import { supabase } from "../../js/supabase.js"

const pestana = "memoria_activo"

if(localStorage.getItem(pestana)){
alert("Ya tienes el juego abierto en otra pestana")
window.location.href = "lobby.html"
}

localStorage.setItem(pestana, "abierto")

window.addEventListener("beforeunload", function(){
localStorage.removeItem(pestana)
})

let usuario = localStorage.getItem("usuario")

if(!usuario){
window.location.href = "index.html"
}

let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false

let advertencias = 0
const MAX_ADVERTENCIAS = 3

document.addEventListener("visibilitychange", async function(){

if(juegoTerminado) return

if(document.hidden){
advertencias++

if(advertencias === 1){
alert("No cambies de pestana")
}
else if(advertencias === 2){
alert("Ultima advertencia")
}
else if(advertencias >= MAX_ADVERTENCIAS){

descalificado = true
juegoTerminado = true

await guardarResultado(9999, true, true, "Cambio de pestana")

alert("Descalificado")
localStorage.setItem("juego_actual", "memoria")
window.location.href = "final.html"
}

}

})

let cartas = []
let seleccionadas = []
let encontradas = 0

let rachaBuena = 0
let rachaMala = 0

function iniciarMemoria(){
generarCartas()
renderizarTablero()
}

function generarCartas(){

let base = ["😂","😎","😈","🔥","🐶","🍕","👻","🎮","🚗","🐱","💎","⚽","🍔","🐸","🦊","🍩","🎲","🎧"]

cartas = [...base, ...base]
cartas.sort(() => Math.random() - 0.5)

}

function renderizarTablero(){

let tablero = document.getElementById("tablero")
tablero.innerHTML = ""

cartas.forEach((valor) => {

let carta = document.createElement("div")

carta.classList.add("carta")
carta.dataset.valor = valor

carta.innerHTML = `
<div class="carta-inner">
  <div class="cara frente"></div>
  <div class="cara atras">${valor}</div>
</div>
`

carta.addEventListener("click", () => seleccionarCarta(carta))

tablero.appendChild(carta)

})

}

function actualizarRacha(tipo){

const rachaDiv = document.getElementById("racha")

if(tipo === "buena"){
rachaBuena++
rachaMala = 0

if(rachaBuena >= 5) rachaDiv.innerText = "🚀"
else if(rachaBuena >= 3) rachaDiv.innerText = "😎"
else rachaDiv.innerText = "🔥"
}

if(tipo === "mala"){
rachaMala++
rachaBuena = 0

if(rachaMala >= 5) rachaDiv.innerText = "🤡"
else if(rachaMala >= 3) rachaDiv.innerText = "😡"
else rachaDiv.innerText = "💀"
}

}

function seleccionarCarta(carta){

if(juegoTerminado) return
if(seleccionadas.length === 2) return
if(carta.classList.contains("volteada")) return

carta.classList.add("volteada")
seleccionadas.push(carta)

if(seleccionadas.length === 2){

let [c1, c2] = seleccionadas

if(c1.dataset.valor === c2.dataset.valor){

actualizarRacha("buena")

c1.classList.add("acierto")
c2.classList.add("acierto")

encontradas++
seleccionadas = []

if(encontradas === 18){
finalizar()
}

}
else{

actualizarRacha("mala")

c1.classList.add("error")
c2.classList.add("error")

setTimeout(() => {
c1.classList.remove("volteada", "error")
c2.classList.remove("volteada", "error")
seleccionadas = []
}, 800)

}

}

}

let intervalo = null
const DURACION = 600

async function iniciarCronometro(){

const reloj = document.getElementById("reloj")

let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id", 1)
.single()

let { data: horaServer } = await supabase.rpc("ahora_servidor")

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let restante = Math.floor((inicio + DURACION * 1000 - ahora) / 1000)

async function actualizar(){

restante--

if(restante <= 0){

clearInterval(intervalo)
reloj.innerText = "0:00"

if(!resultadoEnviado){
await guardarResultado(9999, false, false, "Tiempo agotado")
}

juegoTerminado = true

alert("Tiempo terminado")
localStorage.setItem("juego_actual", "memoria")
window.location.href = "final.html"
return
}

let min = Math.floor(restante / 60)
let seg = restante % 60

reloj.innerText = min + ":" + (seg < 10 ? "0" : "") + seg
}

await actualizar()
intervalo = setInterval(actualizar, 1000)

}

async function guardarResultado(tiempo, sospechoso = false, invalido = false, motivo = ""){

if(resultadoEnviado) return false

resultadoEnviado = true

const { error } = await supabase
.from("ranking")
.upsert({
usuario: usuario,
tiempo: tiempo,
sospechoso: sospechoso,
invalido: invalido,
motivo: motivo,
juego: "memoria"
}, { onConflict: "usuario,juego" })

if(error){
console.error("Error guardando resultado de memoria", error)
resultadoEnviado = false
return false
}

return true
}

async function finalizar(){

if(resultadoEnviado || descalificado) return

clearInterval(intervalo)

let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id", 1)
.single()

let { data: horaServer } = await supabase.rpc("ahora_servidor")

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let tiempo = Math.floor((ahora - inicio) / 1000)

await guardarResultado(tiempo)

juegoTerminado = true

alert("Juego completado")
localStorage.setItem("juego_actual", "memoria")
window.location.href = "final.html"
}

window.finalizar = finalizar

async function revisarEstadoTorneo(){

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id", 1)
.single()

if(data?.estado == "espera"){

if(!juegoTerminado){
await guardarResultado(9999, true, true, "Torneo detenido")
}

alert("Torneo detenido por el admin")
window.location.href = "lobby.html"
}
}

setInterval(revisarEstadoTorneo, 3000)

iniciarMemoria()
iniciarCronometro()
