import { supabase } from "../../js/supabase.js"
import { registrarPartidaDesdeRanking } from "../../js/partidas.js"
import { registrarCheckpointNivel } from "../../js/solitario-niveles.js"
import { bloquearFinalizacionInicialSolitario, crearRelojTorneo, debeSalirDelTorneo, esMiniTorneo, registrarPuntosMiniTorneo, salidaTorneoUrl, validarAccesoJuego } from "../../js/mini-torneo.js"
import { iniciarFinalProtegido, marcarFinalValido } from "../../js/final-guard.js"
import { adquirirCandadoJuego } from "../../js/game-lock.js"

const JUEGO_ACTUAL = "matematicas"

if(!await validarAccesoJuego(supabase, JUEGO_ACTUAL)) await new Promise(() => {})
const candadoJuego = adquirirCandadoJuego(JUEGO_ACTUAL)
if(!candadoJuego.ok){
alert(candadoJuego.message)
window.location.href=salidaTorneoUrl()
await new Promise(() => {})
}
// 👤 USUARIO
let usuario = localStorage.getItem("usuario")

if(!usuario){
window.location.href="index.html"
}

iniciarFinalProtegido(JUEGO_ACTUAL)

// 🔒 CONTROL
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false

// ⚠️ ANTI-TRAMPA
let advertencias = 0
const MAX_ADVERTENCIAS = 3
let ultimoCambio = 0

document.addEventListener("visibilitychange", async function(){
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

else if(advertencias < MAX_ADVERTENCIAS){
alert("⚠️ Última advertencia")
}

else{
descalificado = true
juegoTerminado = true
localStorage.setItem("fin_juego","descalificado")
if(!resultadoEnviado){
resultadoEnviado = true
let error = null
if(!esMiniTorneo(JUEGO_ACTUAL)){
const resultadoRanking = await guardarRankingMatematicas({
usuario,
tiempo: 0,
correctas: 0,
errores: 0,
preguntas,
juego: "matematicas",
sospechoso: true,
invalido: true,
motivo: "Demasiados cambios de pestana",
fecha: new Date().toISOString()
})
error = resultadoRanking.error
}

if(error){
console.error("Error guardando descalificacion de matematicas", error)
resultadoEnviado = false
return
}

await registrarPartidaDesdeRanking({
usuario,
juego: "matematicas",
valor: 0,
modo: "points",
invalido: true
})

await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, 0, {
invalido: true,
motivo: "Demasiados cambios de pestana"
})
}
guardarResultadoFinalLocal("descalificado")
alert("❌ Descalificado por cambiar de pestaña")
marcarFinalValido(JUEGO_ACTUAL)
window.location.href = "final.html"
}

}
})

// VARIABLES
let nivel = 1
let preguntas = 0
let correctas = 0
let errores = 0
let respuestaCorrecta
let preguntaInicioMs = performance.now()
const inicioSesionMs = performance.now()
let rachaCorrectas = 0
let mejorRachaCorrectas = 0
let rachaRapida3s = 0
let mejorRachaRapida3s = 0
let rachaRapida5s = 0
let mejorRachaRapida5s = 0
let ejerciciosMenos15s = 0
let correctasTiempos = []
const umbralesRapidez = [
  ["14s", 14],
  ["13s", 13],
  ["12s", 12],
  ["11s", 11],
  ["10s", 10],
  ["9s", 9],
  ["8s", 8],
  ["7s", 7],
  ["6s", 6],
  ["5s", 5],
  ["4s", 4],
  ["3_5s", 3.5],
  ["3s", 3],
  ["2_5s", 2.5],
  ["2s", 2],
  ["1_8s", 1.8],
  ["1_5s", 1.5],
  ["1_2s", 1.2],
  ["1s", 1],
  ["0_8s", 0.8],
]
const ejerciciosRapidos = Object.fromEntries(umbralesRapidez.map(([key]) => [key, 0]))

const DURACION = 600
let intervalo = null

function actualizarMarcador(){
const correctasEl = document.getElementById("correctas")
const erroresEl = document.getElementById("errores")
if(correctasEl) correctasEl.textContent = String(correctas)
if(erroresEl) erroresEl.textContent = String(errores)
}

async function guardarRankingMatematicas(payload){
const resultado = await supabase
.from("ranking")
.upsert(payload, { onConflict: "usuario,juego" })

if(!resultado.error) return resultado

if(payload.correctas !== undefined || payload.errores !== undefined || payload.preguntas !== undefined){
const { correctas: _correctas, errores: _errores, preguntas: _preguntas, ...payloadLegacy } = payload
return await supabase
.from("ranking")
.upsert(payloadLegacy, { onConflict: "usuario,juego" })
}

return resultado
}

function guardarResultadoFinalLocal(estado = "tiempo"){
const puntos = correctas * 10
const precision = preguntas > 0 ? Math.round((correctas / preguntas) * 100) : 0
localStorage.setItem("matematicas_resultado_final", JSON.stringify({
usuario,
estado,
puntos,
correctas,
errores,
preguntas,
precision,
fecha: new Date().toISOString()
}))
}

function aleatorio(min, max){
return Math.floor(Math.random() * (max - min + 1)) + min
}

function aleatorioCifras(minCifras = 1, maxCifras = 3){
const cifras = aleatorio(minCifras, maxCifras)
const min = cifras === 1 ? 1 : Math.pow(10, cifras - 1)
const max = Math.pow(10, cifras) - 1
return aleatorio(min, max)
}

function esDecimalSimple(valor){
return /^-?\d+(?:[.,]\d+)?$/.test(valor)
}

function redondear2(numero){
return Math.round((numero + Number.EPSILON) * 100) / 100
}

function formatearNumero(numero){
const redondeado = redondear2(numero)
return Number.isInteger(redondeado) ? String(redondeado) : redondeado.toFixed(2)
}

function generarDivisionDecimal(){
const divisor = aleatorioCifras(1, 2)
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
const n1 = aleatorioCifras(1, 2)
const n2 = aleatorioCifras(1, 3)
const n3 = aleatorioCifras(1, 3)
return {
preguntaTexto: `${n1} × (${n2} + ${n3})`,
resp: n1 * (n2 + n3)
}
}

if(tipo === 1){
const n1 = aleatorioCifras(1, 3)
const n2 = aleatorioCifras(1, 2)
const n3 = aleatorio(-99, 99)
const n4 = aleatorio(-99, 99)
return {
preguntaTexto: `${n1} - ${n2} × (${n3} + ${n4})`,
resp: n1 - (n2 * (n3 + n4))
}
}

if(tipo === 2){
const n1 = aleatorioCifras(1, 2)
const n2 = aleatorioCifras(1, 3)
const divisor = aleatorioCifras(1, 2)
const cociente = aleatorioCifras(1, 2)
const dividendo = divisor * cociente
return {
preguntaTexto: `${n1} × (${n2} + ${dividendo} ÷ ${divisor})`,
resp: n1 * (n2 + cociente)
}
}

if(tipo === 3){
const n1 = aleatorioCifras(1, 3)
const n2 = aleatorioCifras(1, 3)
const n3 = aleatorioCifras(1, 3)
const n4 = aleatorioCifras(1, 2)
return {
preguntaTexto: `(${n1} + ${n2}) × (${n3} - ${n4})`,
resp: (n1 + n2) * (n3 - n4)
}
}

const divisor = aleatorioCifras(1, 2)
const cociente = aleatorioCifras(1, 2)
const dividendo = divisor * cociente
const n1 = aleatorioCifras(1, 2)
const n2 = aleatorioCifras(1, 3)
return {
preguntaTexto: `${dividendo} ÷ ${divisor} + ${n1} × ${n2}`,
resp: cociente + (n1 * n2)
}
}

function generarPregunta(){

let preguntaTexto = ""
let resp = 0

if(nivel <= 5){
let n1 = aleatorioCifras()
let n2 = aleatorioCifras()

if(Math.random() < 0.5){
preguntaTexto = `${n1} + ${n2}`
resp = n1 + n2
}else{
preguntaTexto = `${n1} - ${n2}`
resp = n1 - n2
}
}

else if(nivel <= 10){
let n1 = aleatorioCifras()
let n2 = aleatorioCifras()

preguntaTexto = `${n1} × ${n2}`
resp = n1 * n2
}

else if(nivel <= 15){
let n1 = aleatorioCifras()
let n2 = aleatorioCifras()
let n3 = aleatorioCifras()

preguntaTexto = `${n1} + ${n2} × ${n3}`
resp = n1 + (n2 * n3)
}

else if(nivel <= 20){
let n2 = aleatorioCifras(1, 2)
let respBase = aleatorioCifras()
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
preguntaInicioMs = performance.now()
}

window.responder = function(){
if(juegoTerminado) return

let respuestaValor = document.getElementById("respuesta").value.trim()
let r = esDecimalSimple(respuestaValor) ? Number(respuestaValor.replace(",", ".")) : NaN
const segundosRespuesta = (performance.now() - preguntaInicioMs) / 1000
const tolerancia = Number.isInteger(respuestaCorrecta) ? 0 : 0.01

if(Number.isFinite(r) && Math.abs(r - respuestaCorrecta) <= tolerancia){
correctas++
actualizarMarcador()
registrarCheckpointNivel(JUEGO_ACTUAL, correctas * 10, "points")
rachaCorrectas++
mejorRachaCorrectas = Math.max(mejorRachaCorrectas, rachaCorrectas)

if(segundosRespuesta < 15){
ejerciciosMenos15s++
}

umbralesRapidez.forEach(([key, limite]) => {
if(segundosRespuesta < limite){
ejerciciosRapidos[key]++
}
})

if(segundosRespuesta < 3){
rachaRapida3s++
}else{
rachaRapida3s = 0
}
mejorRachaRapida3s = Math.max(mejorRachaRapida3s, rachaRapida3s)

if(segundosRespuesta < 5){
rachaRapida5s++
}else{
rachaRapida5s = 0
}
mejorRachaRapida5s = Math.max(mejorRachaRapida5s, rachaRapida5s)
correctasTiempos.push((performance.now() - inicioSesionMs) / 1000)
document.getElementById("resultado").textContent = "✅ Bien"
}else{
errores++
actualizarMarcador()
document.getElementById("resultado").textContent = "❌ Mal. Era " + formatearNumero(respuestaCorrecta)
}

if(!(Number.isFinite(r) && Math.abs(r - respuestaCorrecta) <= tolerancia)){
rachaCorrectas = 0
rachaRapida3s = 0
rachaRapida5s = 0
}

preguntas++

if(preguntas % 3 === 0) nivel++

document.getElementById("respuesta").value = ""
generarPregunta()
}

// ⏱️ CRONÓMETRO (IGUAL QUE SUDOKU)
function calcularMejorCorrectas60s(){
let mejor = 0
let izquierda = 0

for(let derecha = 0; derecha < correctasTiempos.length; derecha++){
while(correctasTiempos[derecha] - correctasTiempos[izquierda] > 60){
izquierda++
}
mejor = Math.max(mejor, derecha - izquierda + 1)
}

return mejor
}

async function guardarEstadisticasMatematicas(){
const { data: actual, error: lecturaError } = await supabase
.from("estadisticas_logros")
.select("*")
.eq("usuario", usuario)
.eq("juego", "matematicas")
.maybeSingle()

if(lecturaError){
console.warn("No se pudieron leer estadisticas de matematicas", lecturaError)
return
}

const sinErrores = preguntas > 0 && correctas === preguntas
const completados = (actual?.completados || 0) + 1
const completadosSinErrores = (actual?.completados_sin_errores || 0) + (sinErrores ? 1 : 0)
const rachaSinErroresActual = sinErrores ? (actual?.racha_sin_errores_actual || 0) + 1 : 0
const mejorRachaSinErrores = Math.max(actual?.mejor_racha_sin_errores || 0, rachaSinErroresActual)

const payload = {
usuario,
juego: "matematicas",
completados,
completados_sin_errores: completadosSinErrores,
racha_sin_errores_actual: rachaSinErroresActual,
mejor_racha_sin_errores: mejorRachaSinErrores,
matematicas_total_correctas: (actual?.matematicas_total_correctas || 0) + correctas,
matematicas_sesiones_sin_errores: (actual?.matematicas_sesiones_sin_errores || 0) + (sinErrores ? 1 : 0),
matematicas_ejercicios_menos_15s: (actual?.matematicas_ejercicios_menos_15s || 0) + ejerciciosMenos15s,
...Object.fromEntries(umbralesRapidez.map(([key]) => {
const columna = `matematicas_ejercicios_menos_${key}`
return [columna, (actual?.[columna] || 0) + ejerciciosRapidos[key]]
})),
matematicas_mejor_racha_correctas: Math.max(actual?.matematicas_mejor_racha_correctas || 0, mejorRachaCorrectas),
matematicas_mejor_racha_3s: Math.max(actual?.matematicas_mejor_racha_3s || 0, mejorRachaRapida3s),
matematicas_mejor_racha_5s: Math.max(actual?.matematicas_mejor_racha_5s || 0, mejorRachaRapida5s),
matematicas_mejor_correctas_60s: Math.max(actual?.matematicas_mejor_correctas_60s || 0, calcularMejorCorrectas60s()),
updated_at: new Date().toISOString(),
}

const { error } = await supabase
.from("estadisticas_logros")
.upsert(payload, { onConflict: "usuario,juego" })

if(error){
console.warn("No se pudieron guardar estadisticas de matematicas", error)
}
}

async function iniciarCronometro(){

const reloj = document.getElementById("reloj")

const relojTorneo = await crearRelojTorneo(supabase, JUEGO_ACTUAL, DURACION)
if(!relojTorneo){
console.warn("No hay inicio valido para matematicas")
window.location.href = salidaTorneoUrl()
return
}

function pintarReloj(restante){
let min = Math.floor(restante/60)
let seg = restante%60
reloj.innerText = min + ":" + (seg<10?"0":"") + seg
}

async function actualizar(){

const restante = relojTorneo.restante()

if(restante <= 0){
if(bloquearFinalizacionInicialSolitario(JUEGO_ACTUAL, "cronometro matematicas")){
pintarReloj(DURACION)
return
}

clearInterval(intervalo)

juegoTerminado = true
const respuestaInput = document.getElementById("respuesta")
const botonResponder = document.querySelector(".btn.responder")
if(respuestaInput) respuestaInput.disabled = true
if(botonResponder) botonResponder.disabled = true

if(!resultadoEnviado && !descalificado){

resultadoEnviado = true

let error = null
if(!esMiniTorneo(JUEGO_ACTUAL)){
const resultadoRanking = await guardarRankingMatematicas({
usuario,
tiempo: correctas * 10,
correctas,
errores,
preguntas,
juego: "matematicas",
sospechoso: false,
invalido: false,
motivo: "",
fecha: new Date().toISOString()
})
error = resultadoRanking.error
}

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

await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, correctas * 10, {
invalido: false
})

await guardarEstadisticasMatematicas()

}

// ✅ marcar como terminado correctamente
localStorage.setItem("fin_juego","tiempo")
guardarResultadoFinalLocal()

marcarFinalValido(JUEGO_ACTUAL)
window.location.href="final.html"
return
}

pintarReloj(restante)
}

pintarReloj(relojTorneo.restante())
intervalo = setInterval(actualizar,1000)
document.addEventListener("visibilitychange", () => {
if(!document.hidden && !juegoTerminado) actualizar()
})
}

// 🔄 CONTROL TORNEO
async function revisarEstado(){

if(await debeSalirDelTorneo(supabase, JUEGO_ACTUAL)){
window.location.href=salidaTorneoUrl()
}

}

setInterval(revisarEstado,3000)

// 🚀 INICIO
generarPregunta()
actualizarMarcador()
iniciarCronometro()
