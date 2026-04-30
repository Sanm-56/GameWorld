import { supabase } from "../../js/supabase.js"
import { registrarPartidaDesdeRanking } from "../../js/partidas.js"

// 🔒 BLOQUEO MULTI-PESTAÑA
const pestaña = "mate_activo"

if(localStorage.getItem(pestaña)){
alert("Ya tienes el juego abierto en otra pestaña")
window.location.href="lobby.html"
}

localStorage.setItem(pestaña,"abierto")

window.addEventListener("beforeunload",function(){
localStorage.removeItem(pestaña)
})

// 👤 USUARIO
let usuario = localStorage.getItem("usuario")

if(!usuario){
window.location.href="index.html"
}

// 🔒 CONTROL
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false

// ⚠️ ANTI-TRAMPA
let advertencias = 0
const MAX_ADVERTENCIAS = 3
let ultimoCambio = 0

document.addEventListener("visibilitychange", function(){
if(juegoTerminado) return
if(document.hidden){
let ahora = Date.now()

// ⛔ evita contar cambios rápidos (ej: abrir música)
if(ahora - ultimoCambio < 3000) return
ultimoCambio = ahora
advertencias++

if(advertencias === 1){
alert("⚠️ No cambies de pestaña")
}

else if(advertencias === 2){
alert("⚠️ Última advertencia")
}

else{
descalificado = true
juegoTerminado = true
localStorage.setItem("fin_juego","descalificado")
alert("❌ Descalificado por cambiar de pestaña")
window.location.href = "final.html"
}

}
})

// VARIABLES
let nivel = 1
let preguntas = 0
let correctas = 0
let respuestaCorrecta

const DURACION = 600
let intervalo = null

// 🧠 GENERAR PREGUNTA
function generarPregunta(){

let preguntaTexto = ""
let resp = 0

// 🔰 NIVEL 1-5 (SUMA / RESTA)
if(nivel <= 5){

let n1 = Math.floor(Math.random()*20)
let n2 = Math.floor(Math.random()*20)

if(Math.random() < 0.5){
preguntaTexto = `${n1} + ${n2}`
resp = n1 + n2
}else{
preguntaTexto = `${n1} - ${n2}`
resp = n1 - n2
}

}

// 🧩 NIVEL 6-10 (MULTIPLICACIÓN)
else if(nivel <= 10){

let n1 = Math.floor(Math.random()*10)
let n2 = Math.floor(Math.random()*10)

preguntaTexto = `${n1} × ${n2}`
resp = n1 * n2

}

// 🔄 NIVEL 11-15 (COMBINADAS)
else if(nivel <= 15){

let n1 = Math.floor(Math.random()*10)
let n2 = Math.floor(Math.random()*10)
let n3 = Math.floor(Math.random()*10)

preguntaTexto = `${n1} + ${n2} × ${n3}`
resp = n1 + (n2 * n3)

}

// ➗ NIVEL 16-20 (DIVISIONES EXACTAS)
else if(nivel <= 20){

let n2 = Math.floor(Math.random()*9) + 1
let respBase = Math.floor(Math.random()*10) + 1
let n1 = n2 * respBase

preguntaTexto = `${n1} ÷ ${n2}`
resp = respBase

}

// 🧠 NIVEL 21+ (AVANZADO 🔥)
else{

let tipo = Math.floor(Math.random()*3)

if(tipo === 0){
// raíz exacta
let base = Math.floor(Math.random()*10) + 1
let cuadrado = base * base

preguntaTexto = `√${cuadrado}`
resp = base
}

else if(tipo === 1){
// paréntesis
let n1 = Math.floor(Math.random()*10)
let n2 = Math.floor(Math.random()*10)
let n3 = Math.floor(Math.random()*10)

preguntaTexto = `(${n1} + ${n2}) × ${n3}`
resp = (n1 + n2) * n3
}

else{
// mezcla
let n1 = Math.floor(Math.random()*20)
let n2 = Math.floor(Math.random()*10) + 1

preguntaTexto = `${n1} × 2 - ${n2}`
resp = (n1 * 2) - n2
}

}

// 🎯 MOSTRAR
document.getElementById("pregunta").textContent = preguntaTexto
document.getElementById("nivel").textContent = "Nivel: " + nivel

respuestaCorrecta = resp
}

window.responder = function(){

let r = parseInt(document.getElementById("respuesta").value)

if(r === respuestaCorrecta){
correctas++
document.getElementById("resultado").textContent = "✅ Bien"
}else{
document.getElementById("resultado").textContent = "❌ Mal"
}

preguntas++

if(preguntas % 3 === 0) nivel++

document.getElementById("respuesta").value = ""
generarPregunta()
}

// ⏱️ CRONÓMETRO (IGUAL QUE SUDOKU)
async function iniciarCronometro(){

const reloj = document.getElementById("reloj")

let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id",1)
.single()

let { data: horaServer } = await supabase.rpc("ahora_servidor")

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let restante = Math.floor((inicio + DURACION*1000 - ahora)/1000)

async function actualizar(){

restante--

if(restante <= 0){

clearInterval(intervalo)

juegoTerminado = true

if(!resultadoEnviado && !descalificado){

resultadoEnviado = true

await supabase
.from("ranking")
.upsert({
usuario,
tiempo: correctas * 10,
juego: "matematicas"
}, { onConflict: "usuario,juego" })

await registrarPartidaDesdeRanking({
usuario,
juego: "matematicas",
valor: correctas * 10,
modo: "points"
})

}

// ✅ marcar como terminado correctamente
localStorage.setItem("fin_juego","tiempo")

window.location.href="final.html"
return
}

let min = Math.floor(restante/60)
let seg = restante%60

reloj.innerText = min + ":" + (seg<10?"0":"") + seg
}

actualizar()
intervalo = setInterval(actualizar,1000)
}

// 🔄 CONTROL TORNEO
async function revisarEstado(){

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id",1)
.single()

if(data.estado === "espera"){
window.location.href="lobby.html"
}

}

setInterval(revisarEstado,3000)

// 🚀 INICIO
generarPregunta()
iniciarCronometro()
