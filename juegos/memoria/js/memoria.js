import { supabase } from "../../js/supabase.js"
import { registrarPartidaDesdeRanking } from "../../js/partidas.js"
import { debeSalirDelTorneo, obtenerInicioTorneo, obtenerTiempoRestanteTorneo, registrarPuntosMiniTorneo, salidaTorneoUrl } from "../../js/mini-torneo.js"

const pestana = "memoria_activo"
const JUEGO_ACTUAL = "memoria"

if(localStorage.getItem(pestana)){
alert("Ya tienes el juego abierto en otra pestana")
window.location.href = salidaTorneoUrl()
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

const guardado = await guardarResultado(9999, true, true, "Cambio de pestana")
if(guardado){
await guardarEstadisticasMemoria({ tiempo: DURACION, completado: false })
}

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
let inicioLocalMs = performance.now()
let movimientosPartida = 0
let erroresPartida = 0
let maxRachaParesPartida = 0
let maxRachaFallosPartida = 0
let paresAntes1Minuto = 0
let falloUltimoPar = false
let aciertoTras5Fallos = false
let aciertoTras2Fallos = false
let parMenos2s = false
let parMenos20s = false
let parSinVerPrevio = false
let repitioErrorMismoPar = false
let primeraSeleccionTs = 0
let primerMovimientoPar = false
let ordenLineal = true
let siguienteIndiceLineal = 0
let sinPatronRepetido = true
let anticipacionTotal = false
let seleccionoCartaFalladaPrevia = false
let inicio4Pares = true
let final4Pares = true
const volteosPorCarta = new Map()
const ultimoMovimientoVista = new Map()
const paresErrados = new Set()
const fallosPorValor = new Map()
const cartasFalladas = new Set()
const patronesSeleccion = new Set()

function iniciarMemoria(){
inicioLocalMs = performance.now()
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

cartas.forEach((valor, index) => {

let carta = document.createElement("div")

carta.classList.add("carta")
carta.dataset.valor = valor
carta.dataset.indice = String(index)

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

const indiceCarta = Number(carta.dataset.indice)
carta.dataset.vistosAntes = String(volteosPorCarta.get(carta.dataset.indice) || 0)
carta.dataset.ultimoMovimientoVista = ultimoMovimientoVista.has(carta.dataset.indice)
? String(ultimoMovimientoVista.get(carta.dataset.indice))
: ""

if(!volteosPorCarta.has(carta.dataset.indice)){
if(indiceCarta !== siguienteIndiceLineal){
ordenLineal = false
}
siguienteIndiceLineal++
}

if(cartasFalladas.has(carta.dataset.indice)){
seleccionoCartaFalladaPrevia = true
}

volteosPorCarta.set(carta.dataset.indice, Number(carta.dataset.vistosAntes) + 1)
ultimoMovimientoVista.set(carta.dataset.indice, movimientosPartida)

if(seleccionadas.length === 0){
primeraSeleccionTs = performance.now()
}

carta.classList.add("volteada")
seleccionadas.push(carta)

if(seleccionadas.length === 2){

let [c1, c2] = seleccionadas
movimientosPartida++
registrarPatronSeleccion(c1, c2)

if(c1.dataset.valor === c2.dataset.valor){

if(rachaMala >= 5) aciertoTras5Fallos = true
if((fallosPorValor.get(c1.dataset.valor) || 0) >= 2) aciertoTras2Fallos = true
if(performance.now() - primeraSeleccionTs <= 2000) parMenos2s = true
if(performance.now() - primeraSeleccionTs <= 20000) parMenos20s = true
if(c1.dataset.vistosAntes === "0" && c2.dataset.vistosAntes === "0") parSinVerPrevio = true
if(movimientosPartida === 1) primerMovimientoPar = true
if(esAnticipacion(c2, movimientosPartida)) anticipacionTotal = true

actualizarRacha("buena")
maxRachaParesPartida = Math.max(maxRachaParesPartida, rachaBuena)

c1.classList.add("acierto")
c2.classList.add("acierto")

encontradas++
if(obtenerSegundosPartidaLocal() <= 60) paresAntes1Minuto++
if(encontradas <= 4 && erroresPartida > 0) inicio4Pares = false
seleccionadas = []

if(encontradas === 18){
finalizar()
}

}
else{

erroresPartida++
if(encontradas === 17) falloUltimoPar = true
if(encontradas < 4) inicio4Pares = false
if(encontradas >= 14) final4Pares = false

const errorKey = obtenerParErrorKey(c1, c2)
if(paresErrados.has(errorKey)){
repitioErrorMismoPar = true
}
paresErrados.add(errorKey)
fallosPorValor.set(c1.dataset.valor, (fallosPorValor.get(c1.dataset.valor) || 0) + 1)
fallosPorValor.set(c2.dataset.valor, (fallosPorValor.get(c2.dataset.valor) || 0) + 1)
cartasFalladas.add(c1.dataset.indice)
cartasFalladas.add(c2.dataset.indice)

actualizarRacha("mala")
maxRachaFallosPartida = Math.max(maxRachaFallosPartida, rachaMala)

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

function obtenerParErrorKey(c1, c2){
return [c1.dataset.indice, c2.dataset.indice].sort().join("-")
}

function registrarPatronSeleccion(c1, c2){
const i1 = Number(c1.dataset.indice)
const i2 = Number(c2.dataset.indice)
const patron = `${Math.sign(i2 - i1)}:${Math.abs(i2 - i1)}`
if(patronesSeleccion.has(patron)){
sinPatronRepetido = false
}
patronesSeleccion.add(patron)
}

function esAnticipacion(carta, movimientoActual){
if(carta.dataset.vistosAntes === "0") return true
const ultimo = Number(carta.dataset.ultimoMovimientoVista)
return Number.isFinite(ultimo) && movimientoActual - ultimo > 5
}

function obtenerSegundosPartidaLocal(){
return Math.floor((performance.now() - inicioLocalMs) / 1000)
}

let intervalo = null
const DURACION = 600

async function iniciarCronometro(){

const reloj = document.getElementById("reloj")

let restante = await obtenerTiempoRestanteTorneo(supabase, JUEGO_ACTUAL, DURACION)
if(restante === null){
console.warn("No hay inicio valido para memoria")
return
}

function pintarReloj(){
let min = Math.floor(restante / 60)
let seg = restante % 60
reloj.innerText = min + ":" + (seg < 10 ? "0" : "") + seg
}

async function actualizar(){

restante--

if(restante <= 0){

clearInterval(intervalo)
reloj.innerText = "0:00"

if(!resultadoEnviado){
const guardado = await guardarResultado(9999, false, false, "Tiempo agotado")
if(guardado){
await guardarEstadisticasMemoria({ tiempo: DURACION, completado: false })
}
}

juegoTerminado = true

alert("Tiempo terminado")
localStorage.setItem("juego_actual", "memoria")
window.location.href = "final.html"
return
}

pintarReloj()
}

pintarReloj()
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

await registrarPartidaDesdeRanking({
usuario,
juego: "memoria",
valor: tiempo,
modo: "time",
invalido
})

await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalido ? 0 : Math.max(0, DURACION - tiempo))

return true
}

async function guardarEstadisticasMemoria({ tiempo, completado }){
const { data: actual, error: lecturaError } = await supabase
.from("estadisticas_logros")
.select("*")
.eq("usuario", usuario)
.eq("juego", "memoria")
.maybeSingle()

if(lecturaError){
console.warn("No se pudieron leer estadisticas de memoria", lecturaError)
return
}

const completados = (actual?.completados || 0) + (completado ? 1 : 0)
const completadosSinErrores = (actual?.completados_sin_errores || 0) + (completado && erroresPartida === 0 ? 1 : 0)
const rachaCompletadosActual = completado ? (actual?.racha_completados_actual || 0) + 1 : 0
const mejorRachaCompletados = Math.max(actual?.mejor_racha_completados || 0, rachaCompletadosActual)
const rachaSinErroresActual = completado && erroresPartida === 0 ? (actual?.racha_sin_errores_actual || 0) + 1 : 0
const mejorRachaSinErrores = Math.max(actual?.mejor_racha_sin_errores || 0, rachaSinErroresActual)
const mejorTiempoAnterior = actual?.mejor_tiempo
const mejorTiempo = completado
? (typeof mejorTiempoAnterior === "number" ? Math.min(mejorTiempoAnterior, tiempo) : tiempo)
: mejorTiempoAnterior
const ultimoTiempoAnterior = actual?.ultimo_tiempo
const mejorasTiempo = completado && typeof ultimoTiempoAnterior === "number" && tiempo < ultimoTiempoAnterior
? (actual?.memoria_mejoras_tiempo || 0) + 1
: (actual?.memoria_mejoras_tiempo || 0)
const ahora = new Date()
const ventanaInicio = actual?.memoria_partidas_ventana_inicio ? new Date(actual.memoria_partidas_ventana_inicio) : null
const dentroVentana = ventanaInicio && ahora - ventanaInicio <= 10 * 60 * 1000
const ventanaActual = completado ? (dentroVentana ? (actual?.memoria_partidas_ventana_actual || 0) + 1 : 1) : (actual?.memoria_partidas_ventana_actual || 0)
const ventanaInicioIso = completado ? (dentroVentana ? actual.memoria_partidas_ventana_inicio : ahora.toISOString()) : actual?.memoria_partidas_ventana_inicio
const ventana15Inicio = actual?.memoria_partidas_ventana_15_inicio ? new Date(actual.memoria_partidas_ventana_15_inicio) : null
const dentroVentana15 = ventana15Inicio && ahora - ventana15Inicio <= 15 * 60 * 1000
const ventana15Actual = completado ? (dentroVentana15 ? (actual?.memoria_partidas_ventana_15_actual || 0) + 1 : 1) : (actual?.memoria_partidas_ventana_15_actual || 0)
const ventana15InicioIso = completado ? (dentroVentana15 ? actual.memoria_partidas_ventana_15_inicio : ahora.toISOString()) : actual?.memoria_partidas_ventana_15_inicio

const payload = {
usuario,
juego: "memoria",
completados,
completados_sin_errores: completadosSinErrores,
racha_completados_actual: rachaCompletadosActual,
mejor_racha_completados: mejorRachaCompletados,
racha_sin_errores_actual: rachaSinErroresActual,
mejor_racha_sin_errores: mejorRachaSinErrores,
mejor_tiempo: mejorTiempo,
ultimo_tiempo: completado ? tiempo : ultimoTiempoAnterior,
tiempo_jugado_total: (actual?.tiempo_jugado_total || 0) + Math.max(0, Number(tiempo || 0)),
memoria_errores_total: (actual?.memoria_errores_total || 0) + erroresPartida,
memoria_min_errores_partida: completado
? (typeof actual?.memoria_min_errores_partida === "number" ? Math.min(actual.memoria_min_errores_partida, erroresPartida) : erroresPartida)
: actual?.memoria_min_errores_partida,
memoria_max_errores_partida: completado ? Math.max(actual?.memoria_max_errores_partida || 0, erroresPartida) : (actual?.memoria_max_errores_partida || 0),
memoria_mejor_racha_pares: Math.max(actual?.memoria_mejor_racha_pares || 0, maxRachaParesPartida),
memoria_mejor_racha_fallos: Math.max(actual?.memoria_mejor_racha_fallos || 0, maxRachaFallosPartida),
memoria_pares_antes_1min: Math.max(actual?.memoria_pares_antes_1min || 0, paresAntes1Minuto),
memoria_max_intentos_partida: completado ? Math.max(actual?.memoria_max_intentos_partida || 0, movimientosPartida) : (actual?.memoria_max_intentos_partida || 0),
memoria_mejor_movimientos: completado
? (typeof actual?.memoria_mejor_movimientos === "number" ? Math.min(actual.memoria_mejor_movimientos, movimientosPartida) : movimientosPartida)
: actual?.memoria_mejor_movimientos,
memoria_mejor_tiempo_sin_errores: completado && erroresPartida === 0
? (typeof actual?.memoria_mejor_tiempo_sin_errores === "number" ? Math.min(actual.memoria_mejor_tiempo_sin_errores, tiempo) : tiempo)
: actual?.memoria_mejor_tiempo_sin_errores,
memoria_menos_20_movimientos: (actual?.memoria_menos_20_movimientos || 0) + (completado && movimientosPartida < 20 ? 1 : 0),
memoria_mejoras_tiempo: mejorasTiempo,
memoria_fallo_ultimo_par: (actual?.memoria_fallo_ultimo_par || 0) + (completado && falloUltimoPar ? 1 : 0),
memoria_acierto_tras_5_fallos: (actual?.memoria_acierto_tras_5_fallos || 0) + (completado && aciertoTras5Fallos ? 1 : 0),
memoria_par_menos_2s: (actual?.memoria_par_menos_2s || 0) + (parMenos2s ? 1 : 0),
memoria_par_menos_20s: (actual?.memoria_par_menos_20s || 0) + (parMenos20s ? 1 : 0),
memoria_acierto_tras_2_fallos: (actual?.memoria_acierto_tras_2_fallos || 0) + (completado && aciertoTras2Fallos ? 1 : 0),
memoria_par_sin_ver_previo: (actual?.memoria_par_sin_ver_previo || 0) + (parSinVerPrevio ? 1 : 0),
memoria_sin_repetir_error_par: (actual?.memoria_sin_repetir_error_par || 0) + (completado && !repitioErrorMismoPar ? 1 : 0),
memoria_partidas_ventana_inicio: ventanaInicioIso,
memoria_partidas_ventana_actual: ventanaActual,
memoria_mejor_partidas_10min: Math.max(actual?.memoria_mejor_partidas_10min || 0, ventanaActual),
memoria_partidas_ventana_15_inicio: ventana15InicioIso,
memoria_partidas_ventana_15_actual: ventana15Actual,
memoria_mejor_partidas_15min: Math.max(actual?.memoria_mejor_partidas_15min || 0, ventana15Actual),
memoria_primer_movimiento_par: (actual?.memoria_primer_movimiento_par || 0) + (primerMovimientoPar ? 1 : 0),
memoria_lineal: (actual?.memoria_lineal || 0) + (completado && ordenLineal ? 1 : 0),
memoria_sin_patron_repetido: (actual?.memoria_sin_patron_repetido || 0) + (completado && sinPatronRepetido ? 1 : 0),
memoria_anticipacion: (actual?.memoria_anticipacion || 0) + (anticipacionTotal ? 1 : 0),
memoria_sin_cartas_falladas_repetidas: (actual?.memoria_sin_cartas_falladas_repetidas || 0) + (completado && !seleccionoCartaFalladaPrevia ? 1 : 0),
memoria_inicio_4_pares: (actual?.memoria_inicio_4_pares || 0) + (completado && inicio4Pares ? 1 : 0),
memoria_final_4_pares: (actual?.memoria_final_4_pares || 0) + (completado && final4Pares ? 1 : 0),
updated_at: new Date().toISOString(),
}

const { error } = await supabase
.from("estadisticas_logros")
.upsert(payload, { onConflict: "usuario,juego" })

if(error){
console.warn("No se pudieron guardar estadisticas de memoria", error)
}
}

async function finalizar(){

if(resultadoEnviado || descalificado) return

clearInterval(intervalo)

const inicioTorneo = await obtenerInicioTorneo(supabase, JUEGO_ACTUAL)

let { data: horaServer } = await supabase.rpc("ahora_servidor")

const inicio = Date.parse(inicioTorneo)
const ahora = Date.parse(horaServer)

let tiempo = Math.floor((ahora - inicio) / 1000)

const guardado = await guardarResultado(tiempo)
if(guardado){
await guardarEstadisticasMemoria({ tiempo, completado: true })
}

juegoTerminado = true

alert("Juego completado")
localStorage.setItem("juego_actual", "memoria")
window.location.href = "final.html"
}

window.finalizar = finalizar

async function revisarEstadoTorneo(){

if(await debeSalirDelTorneo(supabase, JUEGO_ACTUAL)){

if(!juegoTerminado){
const guardado = await guardarResultado(9999, true, true, "Torneo detenido")
if(guardado){
await guardarEstadisticasMemoria({ tiempo: DURACION, completado: false })
}
}

alert("Torneo detenido por el admin")
window.location.href = salidaTorneoUrl()
}
}

setInterval(revisarEstadoTorneo, 3000)

iniciarMemoria()
iniciarCronometro()
