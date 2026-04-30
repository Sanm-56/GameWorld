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

function aleatorio(min, max){
return Math.floor(Math.random() * (max - min + 1)) + min
}

function redondear2(numero){
return Math.round((numero + Number.EPSILON) * 100) / 100
}

function formatearNumero(numero){
const redondeado = redondear2(numero)
return Number.isInteger(redondeado) ? String(redondeado) : redondeado.toFixed(2)
}

function generarDivisionDecimal(){
const divisor = aleatorio(2, 50)
const cociente = aleatorio(1000, 9999) / 100
const dividendo = redondear2(divisor * cociente)

return {
preguntaTexto: `${dividendo.toFixed(2)} ÷ ${divisor}`,
resp: cociente
}
}

function generarRaizExacta(){
const base = aleatorio(1, 31)
const cuadrado = base * base

return {
preguntaTexto: `√${cuadrado}`,
resp: base
}
}

function generarCombinada(){
const tipo = aleatorio(0, 4)

if(tipo === 0){
const n1 = aleatorio(2, 25)
const n2 = aleatorio(2, 40)
const n3 = aleatorio(2, 40)
return {
preguntaTexto: `${n1} × (${n2} + ${n3})`,
resp: n1 * (n2 + n3)
}
}

if(tipo === 1){
const n1 = aleatorio(20, 120)
const n2 = aleatorio(2, 15)
const n3 = aleatorio(-20, 20)
const n4 = aleatorio(-20, 20)
return {
preguntaTexto: `${n1} - ${n2} × (${n3} + ${n4})`,
resp: n1 - (n2 * (n3 + n4))
}
}

if(tipo === 2){
const n1 = aleatorio(2, 20)
const n2 = aleatorio(2, 30)
const divisor = aleatorio(2, 12)
const cociente = aleatorio(1, 20)
const dividendo = divisor * cociente
return {
preguntaTexto: `${n1} × (${n2} + ${dividendo} ÷ ${divisor})`,
resp: n1 * (n2 + cociente)
}
}

if(tipo === 3){
const n1 = aleatorio(2, 60)
const n2 = aleatorio(2, 60)
const n3 = aleatorio(20, 90)
const n4 = aleatorio(1, 19)
return {
preguntaTexto: `(${n1} + ${n2}) × (${n3} - ${n4})`,
resp: (n1 + n2) * (n3 - n4)
}
}

const divisor = aleatorio(2, 20)
const cociente = aleatorio(5, 60)
const dividendo = divisor * cociente
const n1 = aleatorio(2, 20)
const n2 = aleatorio(2, 20)
return {
preguntaTexto: `${dividendo} ÷ ${divisor} + ${n1} × ${n2}`,
resp: cociente + (n1 * n2)
}
}

function generarPregunta(){

let preguntaTexto = ""
let resp = 0

if(nivel <= 5){
let n1 = aleatorio(100, 999)
let n2 = aleatorio(100, 999)

if(Math.random() < 0.5){
preguntaTexto = `${n1} + ${n2}`
resp = n1 + n2
}else{
preguntaTexto = `${n1} - ${n2}`
resp = n1 - n2
}
}

else if(nivel <= 10){
let n1 = aleatorio(100, 999)
let n2 = aleatorio(100, 999)

preguntaTexto = `${n1} × ${n2}`
resp = n1 * n2
}

else if(nivel <= 15){
let n1 = aleatorio(100, 999)
let n2 = aleatorio(100, 999)
let n3 = aleatorio(100, 999)

preguntaTexto = `${n1} + ${n2} × ${n3}`
resp = n1 + (n2 * n3)
}

else if(nivel <= 20){
let n2 = aleatorio(10, 99)
let respBase = aleatorio(100, 999)
let n1 = n2 * respBase

preguntaTexto = `${n1} ÷ ${n2}`
resp = respBase
}

else if(nivel <= 25){
const pregunta = generarDivisionDecimal()
preguntaTexto = pregunta.preguntaTexto
resp = pregunta.resp
}

else if(nivel <= 30){
const pregunta = generarRaizExacta()
preguntaTexto = pregunta.preguntaTexto
resp = pregunta.resp
}

else{
const pregunta = generarCombinada()
preguntaTexto = pregunta.preguntaTexto
resp = pregunta.resp
}

document.getElementById("pregunta").textContent = preguntaTexto
document.getElementById("nivel").textContent = "Nivel: " + nivel

respuestaCorrecta = redondear2(resp)
}

window.responder = function(){

let respuestaValor = document.getElementById("respuesta").value.trim()
let r = respuestaValor === "" ? NaN : Number(respuestaValor.replace(",", "."))

if(Number.isFinite(r) && Math.abs(r - respuestaCorrecta) <= 0.01){
correctas++
document.getElementById("resultado").textContent = "✅ Bien"
}else{
document.getElementById("resultado").textContent = "❌ Mal. Era " + formatearNumero(respuestaCorrecta)
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

const { error } = await supabase
.from("ranking")
.upsert({
usuario,
tiempo: correctas * 10,
juego: "matematicas"
}, { onConflict: "usuario,juego" })

if(error){
console.error("Error guardando resultado de matematicas", error)
resultadoEnviado = false
return
}

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
