import { supabase } from "./supabase.js"

const JUEGOS_PUNTAJE = new Set(["matematicas", "flashmind", "numcatch"])
const NUMCATCH_DEFAULT_COND = "multiplos_3"
const TABLAS_RANKING_POR_JUEGO = {
  ajedrez: "ranking_ajedrez",
  domino: "ranking_domino",
  damas: "ranking_damas",
}
let claveAdminSesion = ""

function escapeHtml(valor){
return String(valor ?? "")
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#039;")
}

function escapeJsString(valor){
return String(valor ?? "")
.replaceAll("\\", "\\\\")
.replaceAll("'", "\\'")
.replaceAll("\n", "\\n")
.replaceAll("\r", "\\r")
}

function valorCsv(valor){
if(valor === null || valor === undefined) return ""
const texto = typeof valor === "object" ? JSON.stringify(valor) : String(valor)
return `"${texto.replaceAll('"', '""')}"`
}

function descargarCsv(nombreArchivo, filas){
if(!filas.length){
alert("No hay datos para exportar.")
return
}

const columnas = [...filas.reduce((set, fila) => {
Object.keys(fila).forEach((columna) => set.add(columna))
return set
}, new Set())]

const contenido = [
columnas.map(valorCsv).join(","),
...filas.map((fila) => columnas.map((columna) => valorCsv(fila[columna])).join(",")),
].join("\n")

const blob = new Blob([`\uFEFF${contenido}`], { type: "text/csv;charset=utf-8" })
const url = URL.createObjectURL(blob)
const link = document.createElement("a")
link.href = url
link.download = nombreExportacion(nombreArchivo)
document.body.appendChild(link)
link.click()
link.remove()
URL.revokeObjectURL(url)
}

async function seleccionarTodo(tabla, configurar = null){
let desde = 0
const tamano = 1000
const filas = []

while(true){
let query = supabase
.from(tabla)
.select("*")
.range(desde, desde + tamano - 1)

if(configurar) query = configurar(query)

const { data, error } = await query
if(error) throw error

filas.push(...(data || []))
if(!data || data.length < tamano) break
desde += tamano
}

return filas
}

function nombreExportacion(base){
const fecha = new Date().toISOString().slice(0, 19).replaceAll(":", "-")
return `${base}-${fecha}.csv`
}

async function validarAdminConRpc(clave){
const { data, error } = await supabase.rpc("validar_admin_torneo", { p_clave: clave })
if(error) return null
return data === true
}

async function ejecutarRpcAdmin(nombre, args = {}){
if(!claveAdminSesion) return { ok: false, error: new Error("Sin clave admin en sesion") }
const { data, error } = await supabase.rpc(nombre, { p_clave: claveAdminSesion, ...args })
if(error) return { ok: false, error }
return { ok: data !== false, data }
}

// =============================
// 🔒 LOGIN ADMIN CON SUPABASE
// =============================
window.entrarAdmin = async function(){

let claveInput = document.getElementById("clave").value
const claveLimpia = claveInput.trim()

const adminValidoRpc = await validarAdminConRpc(claveLimpia)

if(adminValidoRpc === true){
claveAdminSesion = claveLimpia

document.getElementById("loginAdmin").style.display = "none"
document.getElementById("panelAdmin").style.display = "block"

cargarRanking()
cargarVistaAdmin()
verEstado()
return
}

let { data, error } = await supabase
.from("configuracion")
.select("clave_admin")
.eq("id",1)
.single()

if(error || !data){
alert("Error al verificar contraseña")
return
}

if(claveInput.trim() == String(data.clave_admin).trim()){
claveAdminSesion = claveLimpia

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

const juego = document.getElementById("juegoSelect")?.value
let query = supabase
.from("ranking")
.select("*")
.eq("sospechoso", true)

if(juego){
query = query.eq("juego", juego)
}

const { data } = await query
let filas = data || []

const tablaExtra = TABLAS_RANKING_POR_JUEGO[juego]
if(tablaExtra){
const extra = await supabase
.from(tablaExtra)
.select("*")
.eq("sospechoso", true)

if(extra.data){
const existentes = new Set(filas.map((item) => item.usuario))
extra.data.forEach((item) => {
if(!existentes.has(item.usuario)){
filas.push(item)
existentes.add(item.usuario)
}
})
}
}

mostrar(filas)
}

// =============================
// ❌ INVALIDOS
// =============================
async function verInvalidos(){

const juego = document.getElementById("juegoSelect")?.value
let query = supabase
.from("ranking")
.select("*")
.eq("invalido", true)

if(juego){
query = query.eq("juego", juego)
}

const { data } = await query
let filas = data || []

const tablaExtra = TABLAS_RANKING_POR_JUEGO[juego]
if(tablaExtra){
const extra = await supabase
.from(tablaExtra)
.select("*")
.eq("invalido", true)

if(extra.data){
const existentes = new Set(filas.map((item) => item.usuario))
extra.data.forEach((item) => {
if(!existentes.has(item.usuario)){
filas.push(item)
existentes.add(item.usuario)
}
})
}
}

mostrar(filas)
}

// =============================
// 🧹 LIMPIAR RANKING
// =============================
async function limpiarRanking(){

const juego = document.getElementById("juegoSelect")?.value

if(!confirm("¿Seguro que quieres borrar solo el ranking temporal de " + juego + "?")) return

const rpc = await ejecutarRpcAdmin("admin_limpiar_ranking_temporal", { p_juego: juego })
if(rpc.ok){
alert("ðŸ§¹ Ranking temporal eliminado. Semanal, victorias y global se conservan.")
cargarRanking()
cargarVistaAdmin()
return
}

await guardarHistoricoAntesDeLimpiar(juego)

await supabase
.from("ranking")
.delete()
.eq("juego", juego)

const tablaExtra = TABLAS_RANKING_POR_JUEGO[juego]
if(tablaExtra){
await supabase
.from(tablaExtra)
.delete()
.neq("usuario","")
}

alert("🧹 Ranking temporal eliminado. Semanal, victorias y global se conservan.")

cargarRanking()
cargarVistaAdmin()
}

async function obtenerRankingTemporal(juego){
const asc = juego ? !JUEGOS_PUNTAJE.has(juego) : true

let { data } = await supabase
.from("ranking")
.select("*")
.eq("juego", juego)
.eq("invalido", false)
.order("tiempo", { ascending: asc })

data = data || []

const tablaExtra = TABLAS_RANKING_POR_JUEGO[juego]
if(tablaExtra){
const fallback = await supabase
.from(tablaExtra)
.select("*")
.eq("invalido", false)
.order("tiempo", { ascending: asc })

if(fallback.data){
const usuarios = new Set(data.map((item) => item.usuario))
fallback.data.forEach((item) => {
if(!usuarios.has(item.usuario)){
data.push(item)
usuarios.add(item.usuario)
}
})
}
}

return data
}

async function guardarHistoricoAntesDeLimpiar(juego){
if(!juego) return

const ranking = await obtenerRankingTemporal(juego)
if(!ranking.length) return

const { data: torneo } = await supabase
.from("estado_torneo")
.select("inicio_torneo")
.eq("id",1)
.single()

const desde = torneo?.inicio_torneo || new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
const esPuntaje = JUEGOS_PUNTAJE.has(juego)
const nuevos = []

for(const [index, item] of ranking.entries()){
const valor = Number(item.tiempo || 0)

let query = supabase
.from("partidas")
.select("id")
.eq("usuario", item.usuario)
.eq("juego", juego)
.gte("fecha", desde)
.limit(1)

query = esPuntaje
? query.eq("puntos", valor)
: query.eq("tiempo", valor)

const { data: existente } = await query
if(existente && existente.length) continue

nuevos.push({
usuario: item.usuario,
usuario_id: null,
juego,
puntos: esPuntaje ? valor : 0,
tiempo: esPuntaje ? 0 : valor,
posicion: index + 1,
})
}

if(!nuevos.length) return

const { error } = await supabase
.from("partidas")
.insert(nuevos)

if(error){
console.warn("No se pudo conservar el historico antes de limpiar", error)
}
}

// =============================
// ❌ ELIMINAR JUGADOR
// =============================
async function eliminar(usuario){

const juego = document.getElementById("juegoSelect")?.value

const rpc = await ejecutarRpcAdmin("admin_eliminar_jugador_ranking", {
p_usuario: usuario,
p_juego: juego,
})
if(rpc.ok){
cargarRanking()
cargarVistaAdmin()
return
}

await supabase
.from("ranking")
.delete()
.eq("usuario", usuario)
.eq("juego", juego)

const tablaExtra = TABLAS_RANKING_POR_JUEGO[juego]
if(tablaExtra){
await supabase
.from(tablaExtra)
.delete()
.eq("usuario", usuario)
}

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
<td>${escapeHtml(j.usuario)}</td>
<td>${formatearResultado(j.tiempo, esPuntaje)}</td>
<td>
${j.invalido ? "❌ Inválido" : j.sospechoso ? "⚠️ Sospechoso" : "✅ Normal"}
</td>
<td>
<button onclick="eliminar('${escapeJsString(j.usuario)}')">❌</button>
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

div.innerHTML = `<b>${emoji} ${escapeHtml(j.usuario)}</b> - ${formatearResultado(j.tiempo, esPuntaje)}`

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
#${i+1} - ${escapeHtml(j.usuario)} (${formatearResultado(j.tiempo, esPuntaje)})
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

async function exportarRankingActual(){
try{
const juego = obtenerJuegoSeleccionado()
const ranking = await obtenerRankingTemporal(juego)
const filas = ranking.map((fila, index) => ({
posicion: index + 1,
juego,
usuario: fila.usuario,
resultado: fila.tiempo,
resultado_formateado: formatearResultado(fila.tiempo, JUEGOS_PUNTAJE.has(juego)),
sospechoso: !!fila.sospechoso,
invalido: !!fila.invalido,
fecha: fila.fecha || "",
}))

descargarCsv(`ranking-actual-${juego}`, filas)
}catch(error){
console.warn("No se pudo exportar ranking actual", error)
alert("No se pudo exportar el ranking actual.")
}
}

async function exportarTablasRanking(){
try{
const tablas = ["ranking", "ranking_ajedrez", "ranking_domino", "ranking_damas"]
const filas = []

for(const tabla of tablas){
const datos = await seleccionarTodo(tabla)
datos.forEach((fila) => filas.push({ tabla, ...fila }))
}

descargarCsv("tablas-ranking", filas)
}catch(error){
console.warn("No se pudieron exportar las tablas de ranking", error)
alert("No se pudieron exportar las tablas de ranking.")
}
}

async function exportarHistorialPartidas(){
try{
const juego = obtenerJuegoSeleccionado()
const filas = await seleccionarTodo("partidas", (query) => query.eq("juego", juego).order("fecha", { ascending: false }))
descargarCsv(`historial-partidas-${juego}`, filas)
}catch(error){
console.warn("No se pudo exportar historial de partidas", error)
alert("No se pudo exportar el historial de partidas.")
}
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

const juegoAdmin = document.getElementById("juegoSelect").value
const numcatchCondicionAdmin = document.getElementById("numcatchCondicion")?.value || NUMCATCH_DEFAULT_COND
const rpcAdmin = await ejecutarRpcAdmin("admin_iniciar_torneo", {
p_juego: juegoAdmin,
p_numcatch_condicion: numcatchCondicionAdmin,
})
if(rpcAdmin.ok){
alert("Torneo iniciado: " + juegoAdmin)
return
}

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id",1)
.single()

if(data?.estado === "iniciado"){
alert("⚠️ Ya hay un torneo activo")
return
}

let juego = document.getElementById("juegoSelect").value

let numcatchCondicion = document.getElementById("numcatchCondicion")?.value || NUMCATCH_DEFAULT_COND

const rpc = await ejecutarRpcAdmin("admin_iniciar_torneo", {
p_juego: juego,
p_numcatch_condicion: numcatchCondicion,
})
if(rpc.ok){
alert("ðŸ”¥ Torneo iniciado: " + juego)
return
}

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

const rpc = await ejecutarRpcAdmin("admin_detener_torneo")
if(rpc.ok){
alert("ðŸ›‘ Torneo detenido")
return
}

await supabase
.from("estado_torneo")
.update({ estado: "espera" })
.eq("id",1)

alert("🛑 Torneo detenido")
}

// =============================
// ♻️ RESET TOTAL
// =============================
function obtenerJuegoSeleccionado(){
return document.getElementById("juegoSelect")?.value || "sudoku"
}

function inicioDeSemanaISO(){
const hoy = new Date()
const dia = hoy.getDay() || 7
const inicio = new Date(hoy)
inicio.setDate(hoy.getDate() - dia + 1)
inicio.setHours(0, 0, 0, 0)
return inicio.toISOString()
}

async function borrarRankingSemana(){
const juego = obtenerJuegoSeleccionado()

if(!confirm("Esto borrara el ranking semanal de " + juego + ". El global y las victorias historicas se conservan.")) return

const rpc = await ejecutarRpcAdmin("admin_borrar_ranking_semana", { p_juego: juego })
if(rpc.ok){
alert("Ranking semanal eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
return
}

const { error } = await supabase
.from("partidas")
.delete()
.eq("juego", juego)
.gte("fecha", inicioDeSemanaISO())

if(error){
console.warn("No se pudo borrar el ranking semanal", error)
alert("No se pudo borrar el ranking semanal")
return
}

alert("Ranking semanal eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
}

async function borrarRankingVictorias(){
const juego = obtenerJuegoSeleccionado()

if(!confirm("Esto borrara las victorias acumuladas de " + juego + " sin borrar los resultados globales.")) return

const rpc = await ejecutarRpcAdmin("admin_borrar_ranking_victorias", { p_juego: juego })
if(rpc.ok){
alert("Ranking de victorias eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
return
}

const { error } = await supabase
.from("partidas")
.update({ posicion: 0 })
.eq("juego", juego)
.eq("posicion", 1)

if(error){
console.warn("No se pudo borrar el ranking de victorias", error)
alert("No se pudo borrar el ranking de victorias")
return
}

alert("Ranking de victorias eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
}

async function borrarRankingGlobal(){
const juego = obtenerJuegoSeleccionado()

if(!confirm("Esto borrara el ranking global y el historial de " + juego + ". El ranking temporal actual tambien se limpiara.")) return

const rpc = await ejecutarRpcAdmin("admin_borrar_ranking_global", { p_juego: juego })
if(rpc.ok){
alert("Ranking global eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
return
}

await borrarRankingTemporal(juego)

const { error } = await supabase
.from("partidas")
.delete()
.eq("juego", juego)
.neq("usuario","")

if(error){
console.warn("No se pudo borrar el ranking global", error)
alert("No se pudo borrar el ranking global")
return
}

alert("Ranking global eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
}

async function reiniciarTemporada(){
const confirmacion = prompt("Esto creara una nueva temporada y bajara 3 niveles a todos los usuarios. Escribe TEMPORADA para confirmar.")
if(confirmacion !== "TEMPORADA") return

const rpc = await ejecutarRpcAdmin("admin_reiniciar_temporada")
if(rpc.ok && rpc.data){
alert("Temporada reiniciada: " + rpc.data)
cargarRanking()
cargarVistaAdmin()
return
}

console.warn("No se pudo reiniciar la temporada", rpc.error)
alert("No se pudo reiniciar la temporada")
}

async function borrarRankingTemporal(juego){
const ranking = await supabase
.from("ranking")
.delete()
.eq("juego", juego)

if(ranking.error){
console.warn("No se pudo limpiar ranking generico", ranking.error)
}

const tablaExtra = TABLAS_RANKING_POR_JUEGO[juego]
if(tablaExtra){
const extra = await supabase
.from(tablaExtra)
.delete()
.neq("usuario","")

if(extra.error){
console.warn("No se pudo limpiar " + tablaExtra, extra.error)
}
}
}

async function resetTotal(){

const confirmacion = prompt("Esto borrara rankings, historial y tableros unicos de Sudoku. Escribe RESET para confirmar.")
if(confirmacion !== "RESET") return

const rpc = await ejecutarRpcAdmin("admin_reset_total")
if(rpc.ok){
alert("Torneo reiniciado completo. Los tableros de Sudoku se reasignaran cuando entren los usuarios.")
cargarRanking()
cargarVistaAdmin()
return
}

// Borrar todas las tablas de ranking e historial
await supabase.from("ranking").delete().neq("usuario","")
await supabase.from("ranking_ajedrez").delete().neq("usuario","")
await supabase.from("ranking_domino").delete().neq("usuario","")
await supabase.from("ranking_damas").delete().neq("usuario","")
await supabase.from("partidas").delete().neq("usuario","")
await supabase.from("estadisticas_logros").delete().neq("usuario","")

// Resetear datos de usuarios, incluyendo los tableros unicos de Sudoku
await supabase.from("usuarios").update({
tablero_id: null,
cartas_memoria: null
}).neq("usuario","")

alert("Torneo reiniciado completo. Los tableros de Sudoku se reasignaran cuando entren los usuarios.")

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
window.borrarRankingSemana = borrarRankingSemana
window.borrarRankingVictorias = borrarRankingVictorias
window.borrarRankingGlobal = borrarRankingGlobal
window.reiniciarTemporada = reiniciarTemporada
window.resetTotal = resetTotal
window.verEstado = verEstado
window.exportarRankingActual = exportarRankingActual
window.exportarTablasRanking = exportarTablasRanking
window.exportarHistorialPartidas = exportarHistorialPartidas

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
