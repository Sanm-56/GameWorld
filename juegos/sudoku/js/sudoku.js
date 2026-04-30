import { supabase } from "../../js/supabase.js"
import { registrarPartidaDesdeRanking } from "../../js/partidas.js"

const pestana = "sudoku_activo"

if(localStorage.getItem(pestana)){
alert("Ya tienes el sudoku abierto en otra pestana")
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

let puzzleActual = ""
let solucionActual = ""
let intervalo = null
let erroresPartida = 0
const celdasConError = new Set()

const DURACION = 600

function registrarErrorCelda(indice){
if(!celdasConError.has(indice)){
celdasConError.add(indice)
erroresPartida++
}
}

document.addEventListener("visibilitychange", async function(){

if(juegoTerminado) return

if(document.hidden){
advertencias++

console.log("Cambios de pestana:", advertencias)

if(advertencias === 1){
alert("Advertencia: no cambies de pestana")
}
else if(advertencias === 2){
alert("Ultima advertencia")
}
else if(advertencias >= MAX_ADVERTENCIAS){
descalificado = true
juegoTerminado = true
await guardarResultado(9999, true, true, "Demasiados cambios de pestana")
await reiniciarRachasSudoku()
localStorage.setItem("juego_actual", "sudoku")
window.location.href = "final.html"
}
}

})

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
juego: "sudoku"
}, { onConflict: "usuario,juego" })

if(error){
console.error("Error guardando resultado de sudoku", error)
resultadoEnviado = false
return false
}

await registrarPartidaDesdeRanking({
usuario,
juego: "sudoku",
valor: tiempo,
modo: "time",
invalido
})

return true
}

async function guardarEstadisticasSudoku(tiempo, sinErrores){

const { data: actual, error: lecturaError } = await supabase
.from("estadisticas_logros")
.select("*")
.eq("usuario", usuario)
.eq("juego", "sudoku")
.maybeSingle()

if(lecturaError){
console.warn("No se pudieron leer estadisticas de logros", lecturaError)
return
}

const completados = (actual?.completados || 0) + 1
const completadosSinErrores = (actual?.completados_sin_errores || 0) + (sinErrores ? 1 : 0)
const rachaCompletadosActual = (actual?.racha_completados_actual || 0) + 1
const mejorRachaCompletados = Math.max(actual?.mejor_racha_completados || 0, rachaCompletadosActual)
const rachaActual = sinErrores ? (actual?.racha_sin_errores_actual || 0) + 1 : 0
const mejorRacha = Math.max(actual?.mejor_racha_sin_errores || 0, rachaActual)
const mejorTiempoAnterior = actual?.mejor_tiempo
const mejorTiempo = typeof mejorTiempoAnterior === "number"
? Math.min(mejorTiempoAnterior, tiempo)
: tiempo

const { error } = await supabase
.from("estadisticas_logros")
.upsert({
usuario,
juego: "sudoku",
completados,
completados_sin_errores: completadosSinErrores,
racha_completados_actual: rachaCompletadosActual,
mejor_racha_completados: mejorRachaCompletados,
racha_sin_errores_actual: rachaActual,
mejor_racha_sin_errores: mejorRacha,
mejor_tiempo: mejorTiempo,
updated_at: new Date().toISOString(),
}, { onConflict: "usuario,juego" })

if(error){
console.warn("No se pudieron guardar estadisticas de logros", error)
}
}

async function reiniciarRachasSudoku(){

const { error } = await supabase
.from("estadisticas_logros")
.upsert({
usuario,
juego: "sudoku",
racha_completados_actual: 0,
racha_sin_errores_actual: 0,
updated_at: new Date().toISOString(),
}, { onConflict: "usuario,juego" })

if(error){
console.warn("No se pudieron reiniciar las rachas de logros", error)
}
}

async function cargarSudoku(){

let { data: user } = await supabase
.from("usuarios")
.select("tablero_id")
.eq("usuario", usuario)
.single()

if(user?.tablero_id){
let { data: tablero } = await supabase
.from("tableros")
.select("*")
.eq("id", user.tablero_id)
.single()

if(tablero){
puzzleActual = tablero.puzzle
solucionActual = tablero.solucion
crearTablero(puzzleActual)
return
}
}

let { data } = await supabase
.rpc("asignar_tablero", { p_usuario: usuario })

if(!data || data.length === 0){
alert("No hay tableros disponibles")
return
}

puzzleActual = data[0].puzzle
solucionActual = data[0].solucion

await supabase
.from("usuarios")
.update({ tablero_id: data[0].id })
.eq("usuario", usuario)

crearTablero(puzzleActual)
}

function crearTablero(puzzle){

let tablero = document.getElementById("tablero")
tablero.innerHTML = ""

for(let i = 0; i < 81; i++){

let valor = puzzle[i]
let input = document.createElement("input")

input.type = "text"
input.maxLength = 1

input.addEventListener("keypress", function(e){
let numero = parseInt(e.key)
if(numero < 1 || numero > 9){
e.preventDefault()
}
})

input.addEventListener("input", function(){
this.value = this.value.replace(/[^1-9]/g, "")
})

input.addEventListener("input", function(){
if(this.value === ""){
this.style.background = ""
return
}

if(this.value === solucionActual[i]){
this.style.background = "lightgreen"
}
else{
this.style.background = "salmon"
registrarErrorCelda(i)
}
})

if(valor !== "0"){
input.value = valor
input.disabled = true
input.classList.add("bloqueado")
}

tablero.appendChild(input)
}
}

async function iniciarCronometro(){

const reloj = document.getElementById("reloj")

if(intervalo) clearInterval(intervalo)

let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id", 1)
.single()

if(!torneo || !torneo.inicio_torneo){
console.log("No hay torneo activo")
return
}

let { data: horaServer } = await supabase
.rpc("ahora_servidor")

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let restante = Math.floor((inicio + DURACION * 1000 - ahora) / 1000)
if(isNaN(restante) || restante > DURACION){
restante = DURACION
}

if(restante <= 0){
reloj.innerText = "0:00"
localStorage.setItem("juego_actual", "sudoku")
window.location.href = "final.html"
return
}

async function actualizar(){

restante--

if(restante <= 0){

clearInterval(intervalo)
reloj.innerText = "0:00"

if(!descalificado){
await guardarResultado(DURACION, false, false, "Tiempo agotado")
await reiniciarRachasSudoku()
}

juegoTerminado = true

alert("Tiempo terminado")
localStorage.setItem("juego_actual", "sudoku")
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

async function finalizar(){

if(resultadoEnviado || descalificado){
alert("No puedes finalizar (descalificado o ya enviado)")
return
}

function revisar(){
const inputs = document.querySelectorAll("#tablero input")
let correcto = true

for(let i = 0; i < inputs.length; i++){
if(inputs[i].value === ""){
inputs[i].style.background = ""
correcto = false
continue
}

if(inputs[i].value === solucionActual[i]){
inputs[i].style.background = "lightgreen"
}
else{
inputs[i].style.background = "salmon"
registrarErrorCelda(i)
correcto = false
}
}

alert(correcto ? "Todo esta correcto" : "Hay numeros incorrectos o espacios vacios")
}

let inputs = document.querySelectorAll("#tablero input")

for(let i = 0; i < inputs.length; i++){
if(inputs[i].value != solucionActual[i]){
alert("El sudoku no esta correcto")
return
}
}

clearInterval(intervalo)

let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id", 1)
.single()

let { data: horaServer } = await supabase
.rpc("ahora_servidor")

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let tiempo = Math.floor((ahora - inicio) / 1000)

let sospechoso = false
let invalido = false
let motivo = ""

if(tiempo < 60){
sospechoso = true
motivo += "Tiempo menor a 1 minuto"
}

if(tiempo < 30){
sospechoso = true
invalido = true
motivo += " | Tiempo extremadamente bajo (<30s)"
}

if(advertencias > 0){
sospechoso = true
motivo += " | Cambio de pestana"
}

if(advertencias >= MAX_ADVERTENCIAS){
invalido = true
motivo += " | Demasiados cambios"
}

const resultadoGuardado = await guardarResultado(invalido ? 9999 : tiempo, sospechoso, invalido, motivo)

if(resultadoGuardado && !invalido){
await guardarEstadisticasSudoku(tiempo, erroresPartida === 0)
}
else if(resultadoGuardado && invalido){
await reiniciarRachasSudoku()
}

juegoTerminado = true

if(invalido){
alert("Resultado invalido")
}
else if(sospechoso){
alert("Resultado sospechoso")
}
else{
alert("Sudoku completado")
}

localStorage.setItem("juego_actual", "sudoku")
window.location.href = "final.html"
}

async function revisarEstadoTorneo(){

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id", 1)
.single()

if(data?.estado == "espera"){
window.location.href = "lobby.html"
}
}

cargarSudoku()
iniciarCronometro()

window.finalizar = finalizar
window.revisar = revisar

setInterval(revisarEstadoTorneo, 3000)
