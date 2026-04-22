import { supabase } from "./supabase.js"

const JUEGOS_PUNTAJE = new Set(["matematicas", "flashmind", "numcatch"])
const NUMCATCH_DEFAULT_COND = "multiplos_3"

// =============================
// 🔒 LOGIN ADMIN CON SUPABASE
// =============================
window.entrarAdmin = async function(){

let claveInput = document.getElementById("clave").value

let { data, error } = await supabase
.from("configuracion")
.select("clave_admin")
.eq("id",1)
.single()

if(error || !data){
alert("Error al verificar contraseña")
return
}

if(claveInput === data.clave_admin){

document.getElementById("loginAdmin").style.display = "none"
document.getElementById("panelAdmin").style.display = "block"

cargarRanking()
cargarVistaAdmin()
verEstado()

}else{
alert("❌ Contraseña incorrecta, vuelve a intentarlo")
}

}

// =============================
// 📊 CARGAR RANKING
// =============================
async function cargarRanking(){

let juego = document.getElementById("juegoSelect")?.value

// Cargar de tabla principal
let query = supabase
.from("ranking")
.select("*")
.eq("invalido", false)

if(juego){
query = query.eq("juego", juego)
}

const asc = juego ? !JUEGOS_PUNTAJE.has(juego) : true
let { data, error } = await query.order("tiempo", { ascending: asc })

// Si no hay datos y se seleccionó un juego específico, buscar en tabla específica
if ((!data || data.length === 0) && juego) {
  const tablaJuego = {
    'ajedrez': 'ranking_ajedrez',
    'domino': 'ranking_domino',
    'damas': 'ranking_damas'
  }
  
  const tabla = tablaJuego[juego]
  if (tabla) {
    const fallback = await supabase
      .from(tabla)
      .select('*')
      .eq('invalido', false)
      .order('tiempo', { ascending: true })
    
    if (fallback.data) {
      data = fallback.data
      error = fallback.error
    }
  }
}

if(error || !data){
console.log("Error al cargar ranking", error)
return
}

mostrar(data)
}

// =============================
// ⚠️ SOSPECHOSOS
// =============================
async function verSospechosos(){

let { data } = await supabase
.from("ranking")
.select("*")
.eq("sospechoso", true)

mostrar(data || [])
}

// =============================
// ❌ INVALIDOS
// =============================
async function verInvalidos(){

let { data } = await supabase
.from("ranking")
.select("*")
.eq("invalido", true)

mostrar(data || [])
}

// =============================
// 🧹 LIMPIAR RANKING
// =============================
async function limpiarRanking(){

if(!confirm("¿Seguro que quieres borrar todo el ranking?")) return

await supabase
.from("ranking")
.delete()
.neq("usuario","")

alert("🧹 Ranking eliminado")

cargarRanking()
cargarVistaAdmin()
}

// =============================
// ❌ ELIMINAR JUGADOR
// =============================
async function eliminar(usuario){

await supabase
.from("ranking")
.delete()
.eq("usuario", usuario)

cargarRanking()
cargarVistaAdmin()
}

// =============================
// 🎨 MOSTRAR TABLA
// =============================
function mostrar(data){

const tabla = document.getElementById("tablaAdmin")
const contador = document.getElementById("contador")
const juego = document.getElementById("juegoSelect")?.value
const esPuntaje = !!juego && JUEGOS_PUNTAJE.has(juego)

if(!tabla) return

tabla.innerHTML = ""

if(contador){
contador.innerText = "👥 Jugadores: " + data.length
}

data.forEach((j, i) => {

let fila = document.createElement("tr")

if(j.invalido){
fila.classList.add("invalido")
}
else if(j.sospechoso){
fila.classList.add("sospechoso")
}
else{
fila.classList.add("normal")
}

fila.innerHTML = `
<td>${i+1}</td>
<td>${j.usuario}</td>
<td>${formatearResultado(j.tiempo, esPuntaje)}</td>
<td>
${j.invalido ? "❌ Inválido" : j.sospechoso ? "⚠️ Sospechoso" : "✅ Normal"}
</td>
<td>
<button onclick="eliminar('${j.usuario}')">❌</button>
</td>
`

tabla.appendChild(fila)

})

}

// =============================
// 🏆 PODIO + RANKING
// =============================
async function cargarVistaAdmin(){

let juego = document.getElementById("juegoSelect")?.value
const asc = juego ? !JUEGOS_PUNTAJE.has(juego) : true

let { data } = await supabase
.from("ranking")
.select("*")
.eq("invalido", false)
.eq("juego", juego)
.order("tiempo", { ascending: asc })

if(!data) return

// 🥇 PODIO
let podioDiv = document.getElementById("podio")
if(podioDiv){
podioDiv.innerHTML = ""

let top3 = data.slice(0,3)

top3.forEach((j,i)=>{

let emoji = ["🥇","🥈","🥉"][i]

let div = document.createElement("div")
const esPuntaje = juego && JUEGOS_PUNTAJE.has(juego)

div.innerHTML = `<b>${emoji} ${j.usuario}</b> - ${formatearResultado(j.tiempo, esPuntaje)}`

podioDiv.appendChild(div)

})
}

// 📊 RANKING
let rankingDiv = document.getElementById("ranking")
if(rankingDiv){
rankingDiv.innerHTML = ""

data.forEach((j,i)=>{

let div = document.createElement("div")
const esPuntaje = juego && JUEGOS_PUNTAJE.has(juego)

div.innerHTML = `
#${i+1} - ${j.usuario} (${formatearResultado(j.tiempo, esPuntaje)})
${j.sospechoso ? "⚠️" : ""}
`

rankingDiv.appendChild(div)

})
}

}

// =============================
// ⏱️ FORMATEO TIEMPO
// =============================
function formatearTiempo(segundos){
let min = Math.floor(segundos/60)
let seg = segundos%60
return min + ":" + (seg<10?"0":"") + seg
}

function formatearResultado(valor, esPuntaje){
if(esPuntaje) return `${valor} pts`
return formatearTiempo(valor)
}

// =============================
// 🔴 TIEMPO REAL
// =============================
supabase
.channel("ranking-cambios")
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "ranking" },
() => {
cargarRanking()
cargarVistaAdmin()
}
)
.subscribe()

// =============================
// 🚀 INICIAR TORNEO (MEJORADO)
// =============================
async function iniciarTorneo(){

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id",1)
.single()

if(data.estado === "iniciado"){
alert("⚠️ Ya hay un torneo activo")
return
}

let juego = document.getElementById("juegoSelect").value

let numcatchCondicion = document.getElementById("numcatchCondicion")?.value || NUMCATCH_DEFAULT_COND

const payload = {
estado: "iniciado",
juego_actual: juego,
inicio_torneo: new Date().toISOString()
}

if(juego === "numcatch"){
payload.numcatch_condicion = numcatchCondicion
}

await supabase
.from("estado_torneo")
.update(payload)
.eq("id",1)

alert("🔥 Torneo iniciado: " + juego)
}

// =============================
// 🛑 DETENER TORNEO
// =============================
async function detenerTorneo(){

await supabase
.from("estado_torneo")
.update({ estado: "espera" })
.eq("id",1)

alert("🛑 Torneo detenido")
}

// =============================
// ♻️ RESET TOTAL
// =============================
async function resetTotal(){

if(!confirm("⚠️ Esto borrará TODO el torneo")) return

// Borrar todas las tablas de ranking
await supabase.from("ranking").delete().neq("usuario","")
await supabase.from("ranking_ajedrez").delete().neq("usuario","")
await supabase.from("ranking_domino").delete().neq("usuario","")
await supabase.from("ranking_damas").delete().neq("usuario","")

// Resetear datos de usuarios
await supabase.from("usuarios").update({
tablero_id: null,
cartas_memoria: null
}).neq("usuario","")

alert("♻️ Torneo reiniciado COMPLETO")

cargarRanking()
cargarVistaAdmin()
}

// =============================
// 👁️ ESTADO EN VIVO
// =============================
async function verEstado(){

let { data } = await supabase
.from("estado_torneo")
.select("juego_actual, estado")
.eq("id",1)
.single()

if(data){
let el = document.getElementById("juegoActivo")
if(el){
el.innerText = "🎮 Juego: " + data.juego_actual + " | Estado: " + data.estado
}
}
}

setInterval(verEstado,3000)

// =============================
// 🌐 GLOBAL
// =============================
window.eliminar = eliminar
window.iniciarTorneo = iniciarTorneo
window.detenerTorneo = detenerTorneo
window.verSospechosos = verSospechosos
window.verInvalidos = verInvalidos
window.limpiarRanking = limpiarRanking
window.cargarRanking = cargarRanking
window.resetTotal = resetTotal

function syncNumcatchUI(){
  const juego = document.getElementById("juegoSelect")?.value
  const wrap = document.getElementById("numcatchConfig")
  if(!wrap) return
  wrap.style.display = juego === "numcatch" ? "block" : "none"
}

document.getElementById('juegoSelect')?.addEventListener('change', () => {
  syncNumcatchUI()
  cargarRanking()
  cargarVistaAdmin()
})

syncNumcatchUI()