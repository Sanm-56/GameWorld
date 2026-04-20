import { supabase } from "../../js/supabase.js"

// =============================
// 🔒 BLOQUEO MULTI-PESTAÑA
// =============================
const pestaña = "sudoku_activo"

if(localStorage.getItem(pestaña)){
alert("Ya tienes el sudoku abierto en otra pestaña")
window.location.href="lobby.html"
}

localStorage.setItem(pestaña,"abierto")

window.addEventListener("beforeunload",function(){
localStorage.removeItem(pestaña)
})

// =============================
// 👤 USUARIO
// =============================
let usuario = localStorage.getItem("usuario")

if(!usuario){
window.location.href="index.html"
}

// =============================
// 🔒 CONTROL GLOBAL
// =============================
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false

// =============================
// ⚠️ CONTROL ANTI-TRAMPA
// =============================
let advertencias = 0
const MAX_ADVERTENCIAS = 3

document.addEventListener("visibilitychange", function(){

// 🔥 NO CONTAR SI YA TERMINÓ
if(juegoTerminado) return

if(document.hidden){

advertencias++

console.log("Cambios de pestaña:", advertencias)

if(advertencias === 1){
alert("⚠️ Advertencia: No cambies de pestaña")
}
else if(advertencias === 2){
alert("⚠️ Última advertencia")
}
else if(advertencias >= MAX_ADVERTENCIAS){

descalificado = true
juegoTerminado = true

alert("❌ Descalificado por salir de la pestaña varias veces")
// ✅ AGREGAR AQUÍ 🔥
localStorage.setItem("juego_actual","sudoku")
window.location.href = "final.html"
}

}

})

// =============================
// VARIABLES
// =============================
let puzzleActual=""
let solucionActual=""
let intervalo=null

const DURACION = 600

// =============================
// 📥 CARGAR SUDOKU
// =============================
async function cargarSudoku(){

let { data:user } = await supabase
.from("usuarios")
.select("tablero_id")
.eq("usuario",usuario)
.single()

if(user?.tablero_id){

let { data:tablero } = await supabase
.from("tableros")
.select("*")
.eq("id",user.tablero_id)
.single()

if(tablero){
puzzleActual=tablero.puzzle
solucionActual=tablero.solucion
crearTablero(puzzleActual)
return
}
}

let { data } = await supabase
.rpc("asignar_tablero",{p_usuario:usuario})

if(!data || data.length===0){
alert("No hay tableros disponibles")
return
}

puzzleActual=data[0].puzzle
solucionActual=data[0].solucion

await supabase
.from("usuarios")
.update({tablero_id:data[0].id})
.eq("usuario",usuario)

crearTablero(puzzleActual)
}

// =============================
// 🎮 TABLERO
// =============================
function crearTablero(puzzle){

let tablero=document.getElementById("tablero")
tablero.innerHTML=""

for(let i=0;i<81;i++){

let valor=puzzle[i]
let input=document.createElement("input")

input.type="text"
input.maxLength=1

input.addEventListener("keypress",function(e){
let numero=parseInt(e.key)
if(numero<1 || numero>9){
e.preventDefault()
}
})

input.addEventListener("input",function(){
this.value=this.value.replace(/[^1-9]/g,"")
})

// 🟩🟥 VALIDACIÓN
input.addEventListener("input",function(){
if(this.value === solucionActual[i]){
this.style.background="lightgreen"
}else{
this.style.background="salmon"
}
})

if(valor!=="0"){
input.value=valor
input.disabled=true
input.classList.add("bloqueado")
}

tablero.appendChild(input)
}
}

// =============================
// ⏱️ CRONÓMETRO (SERVER TIME 🔥)
// =============================
async function iniciarCronometro(){

const reloj = document.getElementById("reloj")

if(intervalo) clearInterval(intervalo)

// 🔥 TRAER INICIO TORNEO
let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id",1)
.single()

if(!torneo || !torneo.inicio_torneo){
console.log("No hay torneo activo")
return
}

// 🔥 TRAER HORA DEL SERVIDOR
let { data: horaServer } = await supabase
.rpc("ahora_servidor") // 👈 la creamos abajo

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let restante = Math.floor((inicio + DURACION*1000 - ahora)/1000)
if(isNaN(restante) || restante > DURACION){
restante = DURACION
}

if(restante <= 0){
reloj.innerText="0:00"
window.location.href="final.html"
return
}

function actualizar(){

restante--

if(restante <= 0){

clearInterval(intervalo)
reloj.innerText="0:00"

if(!resultadoEnviado && !descalificado){

resultadoEnviado = true

supabase.from("ranking").upsert({
usuario: usuario,
tiempo: DURACION
},{ onConflict:"usuario" })

}

juegoTerminado = true

alert("Tiempo terminado")
// ✅ AGREGAR AQUÍ 🔥
localStorage.setItem("juego_actual","sudoku")
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

// =============================
// 🏁 FINALIZAR
// =============================
async function finalizar(){

if(resultadoEnviado || descalificado){
alert("No puedes finalizar (descalificado o ya enviado)")
return
}

let inputs = document.querySelectorAll("#tablero input")

for(let i=0;i<inputs.length;i++){
if(inputs[i].value != solucionActual[i]){
alert("El sudoku no está correcto")
return
}
}

resultadoEnviado = true
clearInterval(intervalo)

// 🔥 TIEMPO REAL DESDE EL SERVIDOR
let { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id",1)
.single()

let { data: horaServer } = await supabase
.rpc("ahora_servidor")

const inicio = Date.parse(torneo.inicio_torneo)
const ahora = Date.parse(horaServer)

let data = Math.floor((ahora - inicio) / 1000)

let sospechoso = false
let invalido = false
let motivo = ""

// ⚠️ TIEMPO RÁPIDO
if(data < 60){
sospechoso = true
motivo += "Tiempo menor a 1 minuto"
}

// 💀 IMPOSIBLE
if(data < 30){
sospechoso = true
invalido = true
motivo += " | Tiempo extremadamente bajo (<30s)"
}

// 👀 PESTAÑA
if(advertencias > 0){
sospechoso = true
motivo += " | Cambio de pestaña"
}

// 💀 MUCHAS
if(advertencias >= MAX_ADVERTENCIAS){
invalido = true
motivo += " | Demasiados cambios"
}

// 📊 GUARDAR SIEMPRE (clave 🔥)
await supabase
.from("ranking")
.upsert({
usuario: usuario,
tiempo: invalido ? 9999 : data,
sospechoso: sospechoso,
invalido: invalido,
motivo: motivo,
juego: "sudoku" // 🔥 FALTABA ESTO
}, { onConflict: "usuario" })

juegoTerminado = true

if(invalido){
alert("❌ Resultado inválido")
}else if(sospechoso){
alert("⚠️ Resultado sospechoso")
}else{
alert("🏆 Sudoku completado!")
}
// ✅ AGREGAR AQUÍ 🔥
localStorage.setItem("juego_actual","sudoku")
window.location.href="final.html"
}

// =============================
// 🔄 ESTADO TORNEO
// =============================
async function revisarEstadoTorneo(){

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id",1)
.single()

if(data.estado=="espera"){
window.location.href = "lobby.html"
}
}

// =============================
// 🚀 INICIO
// =============================
cargarSudoku()
iniciarCronometro()

window.finalizar=finalizar

setInterval(revisarEstadoTorneo,3000)