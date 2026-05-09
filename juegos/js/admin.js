import { supabase } from "./supabase.js"
import { cleanText, confirmAction, errorMessage, escapeHtml, promptAction, safeAlert, setCleanText } from "./mensajes.js"
import {
  BONUS_TEMPORADA_VALORES,
  JUEGOS_TEMPORADA,
  etiquetaJuego,
  formatearMultiplicador,
  guardarBonusTemporada,
  guardarTemporadaActiva,
  normalizarEstadoTemporada,
  obtenerBonusesTemporada,
  obtenerJuegoDestacadoTemporada,
  obtenerTemporadaActiva,
} from "./experiencia-temporada.js"

const JUEGOS_PUNTAJE = new Set(["matematicas", "flashmind", "numcatch"])
const NUMCATCH_DEFAULT_COND = "multiplos_3"
const TABLAS_RANKING_POR_JUEGO = {
  ajedrez: "ranking_ajedrez",
  domino: "ranking_domino",
  damas: "ranking_damas",
}
let claveAdminSesion = ""
let bonusesTemporada = {}
let temporadaActiva = null
let formularioTemporadaInicializado = false
let miniTorneosAdminRequestId = 0
const miniTorneosAdminAccionesPendientes = new Set()

function escapeJsString(valor){
return cleanText(valor)
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
safeAlert("No hay datos para exportar.")
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

function normalizarRespuestaRpc(data){
if(data === true) return { ok: true }
if(data && typeof data === "object") return data
return { ok: data !== false }
}

async function ejecutarRpcAdminObjeto(nombre, args = {}){
if(!claveAdminSesion) return { ok: false, error: new Error("Sin clave admin en sesion") }
const { data, error } = await supabase.rpc(nombre, { p_clave: claveAdminSesion, ...args })
if(error) return { ok: false, error }
const resultado = normalizarRespuestaRpc(data)
return { ok: resultado.ok !== false, data: resultado }
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
cargarBonusTemporadaAdmin()
cargarMiniTorneosAdmin()
verEstado()
return
}

let { data, error } = await supabase
.from("configuracion")
.select("clave_admin")
.eq("id",1)
.single()

if(error || !data){
safeAlert(errorMessage(error, "Error al verificar contrasena"))
return
}

if(claveInput.trim() == String(data.clave_admin).trim()){
claveAdminSesion = claveLimpia

document.getElementById("loginAdmin").style.display = "none"
document.getElementById("panelAdmin").style.display = "block"

cargarRanking()
cargarVistaAdmin()
cargarBonusTemporadaAdmin()
cargarMiniTorneosAdmin()
verEstado()

}else{
safeAlert("Contrasena incorrecta, vuelve a intentarlo")
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

if(!await confirmAction(cleanText("Seguro que quieres borrar solo el ranking temporal de " + juego + "?"), { title: "Limpiar ranking temporal" })) return

const rpc = await ejecutarRpcAdmin("admin_limpiar_ranking_temporal", { p_juego: juego })
if(rpc.ok){
safeAlert("Ranking temporal eliminado. Semanal, victorias y global se conservan.")
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

safeAlert("Ranking temporal eliminado. Semanal, victorias y global se conservan.")

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
// MINI TORNEOS ACTIVOS
// =============================
async function cargarMiniTorneosAdmin(){
const list = document.getElementById("miniTorneosAdminList")
if(!list) return

const requestId = ++miniTorneosAdminRequestId
list.innerHTML = '<div class="export-note">Cargando mini torneos activos...</div>'

const { data, error } = await supabase
.from("salas")
.select("id,nombre,codigo,creador_id,estado,max_jugadores,juego,created_at,inicio_torneo")
.neq("estado", "finalizado")
.order("created_at", { ascending: false })
.limit(30)

if(requestId !== miniTorneosAdminRequestId) return

if(error){
console.warn("No se pudieron cargar mini torneos", error)
list.innerHTML = '<div class="export-note">No se pudieron cargar mini torneos. Revisa que la tabla salas exista.</div>'
return
}

if(!data?.length){
list.innerHTML = '<div class="export-note">No hay mini torneos activos.</div>'
return
}

const playersByRoom = await cargarJugadoresMiniTorneos(data.map((room) => room.id))
if(requestId !== miniTorneosAdminRequestId) return

list.innerHTML = data.map((room) => {
const jugadores = playersByRoom.get(room.id) || []
const creado = room.created_at ? new Date(room.created_at).toLocaleString("es-CO") : "-"
const estaProcesandoLimpiar = miniTorneosAdminAccionesPendientes.has(`finalizar:${room.id}`)
const estaProcesandoBorrar = miniTorneosAdminAccionesPendientes.has(`borrar:${room.id}`)
return `
<div class="mini-admin-row">
  <div>
    <p class="mini-admin-title">${escapeHtml(room.nombre || "Mini torneo")}</p>
    <p class="mini-admin-meta">ID ${room.id} | ${escapeHtml(room.juego || "sin juego")} | ${escapeHtml(room.estado || "esperando")} | codigo ${escapeHtml(room.codigo || "-")} | creado ${escapeHtml(creado)}</p>
    <p class="mini-admin-players">${jugadores.length ? escapeHtml(jugadores.join(", ")) : "Sin jugadores registrados"}</p>
  </div>
  <div class="mini-admin-actions">
    <button class="ghost" onclick="finalizarMiniTorneoAdmin(${Number(room.id)})" ${estaProcesandoLimpiar || estaProcesandoBorrar ? "disabled" : ""}>${estaProcesandoLimpiar ? "Limpiando..." : "Limpiar de activos"}</button>
    <button class="danger" onclick="borrarMiniTorneoAdmin(${Number(room.id)})" ${estaProcesandoLimpiar || estaProcesandoBorrar ? "disabled" : ""}>${estaProcesandoBorrar ? "Borrando..." : "Borrar definitivo"}</button>
  </div>
</div>
`
}).join("")
}

async function cargarJugadoresMiniTorneos(ids){
const grouped = new Map()
if(!ids.length) return grouped

const { data, error } = await supabase
.from("sala_jugadores")
.select("sala_id,usuario_id,usuario")
.in("sala_id", ids)
.order("created_at", { ascending: true })

if(error){
console.warn("No se pudieron cargar jugadores de mini torneos", error)
return grouped
}

;(data || []).forEach((player) => {
const current = grouped.get(player.sala_id) || []
if(current.length < 8) current.push(player.usuario || player.usuario_id || "Jugador")
grouped.set(player.sala_id, current)
})

return grouped
}

async function finalizarMiniTorneoAdmin(id){
if(!id) return
const accion = `finalizar:${id}`
if(miniTorneosAdminAccionesPendientes.has(accion) || miniTorneosAdminAccionesPendientes.has(`borrar:${id}`)) return
if(!await confirmAction("Esto marcara solo este mini torneo como finalizado para sacarlo de activos. No toca torneos normales ni rankings. Continuar?", { title: "Limpiar mini torneo" })) return

miniTorneosAdminAccionesPendientes.add(accion)
await cargarMiniTorneosAdmin()

try{
const rpc = await ejecutarRpcAdminObjeto("admin_finalizar_mini_torneo", { p_sala_id: id })
let error = rpc.ok ? null : rpc.error

if(!rpc.ok && rpc.data?.mensaje) throw new Error(rpc.data.mensaje)

if(!rpc.ok){
const fallback = await supabase
.from("salas")
.update({ estado: "finalizado", fecha_fin: new Date().toISOString() })
.eq("id", id)
error = fallback.error
}

if(error) throw error

const verificacion = await verificarMiniTorneoFueraDeActivos(id)
if(!verificacion.ok) throw new Error(verificacion.mensaje)

safeAlert("Mini torneo limpiado de activos.")
}catch(error){
console.warn("No se pudo finalizar mini torneo", error)
safeAlert(errorMessage(error, "No se pudo limpiar el mini torneo."))
}finally{
miniTorneosAdminAccionesPendientes.delete(accion)
await cargarMiniTorneosAdmin()
}
}

async function borrarMiniTorneoAdmin(id){
if(!id) return
const accion = `borrar:${id}`
if(miniTorneosAdminAccionesPendientes.has(accion) || miniTorneosAdminAccionesPendientes.has(`finalizar:${id}`)) return
const confirmacion = await promptAction("Borrado definitivo del mini torneo #" + id + ". Escribe BORRAR para confirmar.", { title: "Borrar mini torneo", danger: true })
if(confirmacion !== "BORRAR") return

miniTorneosAdminAccionesPendientes.add(accion)
await cargarMiniTorneosAdmin()

try{
const rpc = await ejecutarRpcAdminObjeto("admin_borrar_mini_torneo", { p_sala_id: id })
if(rpc.ok){
const verificacionRpc = await verificarMiniTorneoBorrado(id)
if(!verificacionRpc.ok) throw new Error(verificacionRpc.mensaje)
safeAlert("Mini torneo borrado definitivamente.")
return
}
if(rpc.data?.mensaje) throw new Error(rpc.data.mensaje)
if(rpc.error) console.warn("RPC de borrado de mini torneo no disponible o fallo; usando flujo directo", rpc.error)

const resultados = await supabase
.from("solitario_resultados")
.delete()
.eq("sala_id", id)
if(resultados.error) throw resultados.error

const jugadores = await supabase
.from("sala_jugadores")
.delete()
.eq("sala_id", id)
if(jugadores.error) throw jugadores.error

const sala = await supabase
.from("salas")
.delete()
.eq("id", id)
if(sala.error) throw sala.error

const verificacion = await verificarMiniTorneoBorrado(id)
if(!verificacion.ok) throw new Error(verificacion.mensaje)

safeAlert("Mini torneo borrado definitivamente.")
}catch(error){
console.warn("No se pudo borrar definitivamente; se intentara limpiar de activos", error)
const fallbackRpc = await ejecutarRpcAdminObjeto("admin_finalizar_mini_torneo", { p_sala_id: id })
let fallbackError = fallbackRpc.ok ? null : fallbackRpc.error

if(!fallbackRpc.ok && fallbackRpc.data?.mensaje){
fallbackError = new Error(fallbackRpc.data.mensaje)
}else if(!fallbackRpc.ok){
const fallback = await supabase
.from("salas")
.update({ estado: "finalizado", fecha_fin: new Date().toISOString() })
.eq("id", id)
fallbackError = fallback.error
}

if(fallbackError){
safeAlert(errorMessage(fallbackError, "No se pudo borrar ni finalizar el mini torneo."))
}else{
safeAlert("No hubo permiso para borrar definitivamente, pero quedo limpiado de activos.")
}
}finally{
miniTorneosAdminAccionesPendientes.delete(accion)
await cargarMiniTorneosAdmin()
}
}

async function verificarMiniTorneoFueraDeActivos(id){
const { data, error } = await supabase
.from("salas")
.select("id,estado")
.eq("id", id)
.maybeSingle()

if(error) return { ok: false, mensaje: errorMessage(error, "No se pudo verificar el mini torneo.") }
if(!data) return { ok: true }
if(data.estado === "finalizado") return { ok: true }
return { ok: false, mensaje: "La base de datos no confirmo que el mini torneo quedara fuera de activos." }
}

async function verificarMiniTorneoBorrado(id){
const sala = await supabase
.from("salas")
.select("id")
.eq("id", id)
.maybeSingle()

if(sala.error) return { ok: false, mensaje: errorMessage(sala.error, "No se pudo verificar el borrado de la sala.") }
if(sala.data) return { ok: false, mensaje: "La sala sigue existiendo despues del borrado." }

const jugadores = await supabase
.from("sala_jugadores")
.select("id")
.eq("sala_id", id)
.limit(1)

if(jugadores.error) return { ok: false, mensaje: errorMessage(jugadores.error, "No se pudo verificar el borrado de jugadores.") }
if(jugadores.data?.length) return { ok: false, mensaje: "Quedaron jugadores asociados al mini torneo." }

const resultados = await supabase
.from("solitario_resultados")
.select("id")
.eq("sala_id", id)
.limit(1)

if(resultados.error) return { ok: false, mensaje: errorMessage(resultados.error, "No se pudo verificar el borrado de resultados.") }
if(resultados.data?.length) return { ok: false, mensaje: "Quedaron resultados asociados al mini torneo." }
return { ok: true }
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
setCleanText(contador, "Jugadores: " + data.length)
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
${j.invalido ? "Invalido" : j.sospechoso ? "Sospechoso" : "Normal"}
</td>
<td>
<button onclick="eliminar('${escapeJsString(j.usuario)}')">Eliminar</button>
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

let emoji = ["1.","2.","3."][i]

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
${j.sospechoso ? "Sospechoso" : ""}
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
safeAlert("No se pudo exportar el ranking actual.")
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
safeAlert("No se pudieron exportar las tablas de ranking.")
}
}

async function exportarHistorialPartidas(){
try{
const juego = obtenerJuegoSeleccionado()
const filas = await seleccionarTodo("partidas", (query) => query.eq("juego", juego).order("fecha", { ascending: false }))
descargarCsv(`historial-partidas-${juego}`, filas)
}catch(error){
console.warn("No se pudo exportar historial de partidas", error)
safeAlert("No se pudo exportar el historial de partidas.")
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

supabase
.channel("admin-mini-torneos-cambios")
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "salas" },
() => cargarMiniTorneosAdmin()
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
safeAlert("Torneo iniciado: " + juegoAdmin)
return
}

let { data } = await supabase
.from("estado_torneo")
.select("estado")
.eq("id",1)
.single()

if(data?.estado === "iniciado"){
safeAlert("Ya hay un torneo activo")
return
}

let juego = document.getElementById("juegoSelect").value

let numcatchCondicion = document.getElementById("numcatchCondicion")?.value || NUMCATCH_DEFAULT_COND

const rpc = await ejecutarRpcAdmin("admin_iniciar_torneo", {
p_juego: juego,
p_numcatch_condicion: numcatchCondicion,
})
if(rpc.ok){
safeAlert("Torneo iniciado: " + juego)
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

safeAlert("Torneo iniciado: " + juego)
}

// =============================
// 🛑 DETENER TORNEO
// =============================
async function detenerTorneo(){

const rpc = await ejecutarRpcAdmin("admin_detener_torneo")
if(rpc.ok){
safeAlert("Torneo detenido")
return
}

await supabase
.from("estado_torneo")
.update({ estado: "espera" })
.eq("id",1)

safeAlert("Torneo detenido")
}

// =============================
// ♻️ RESET TOTAL
// =============================
function obtenerJuegoSeleccionado(){
return document.getElementById("juegoSelect")?.value || "sudoku"
}

async function cargarBonusTemporadaAdmin(){
bonusesTemporada = await obtenerBonusesTemporada()
temporadaActiva = await obtenerTemporadaActiva()
rellenarSelectorBonus()
actualizarVistaBonusAdmin()
}

function rellenarSelectorBonus(){
const juegoSelect = document.getElementById("bonusJuegoSelect")
if(juegoSelect && !juegoSelect.options.length){
juegoSelect.innerHTML = JUEGOS_TEMPORADA
.map((juego) => `<option value="${juego.key}">${juego.label}</option>`)
.join("")
}

const select = document.getElementById("bonusTemporadaSelect")
if(select && !select.options.length){
select.innerHTML = BONUS_TEMPORADA_VALORES
.map((valor) => `<option value="${valor.toFixed(1)}">${formatearMultiplicador(valor)}</option>`)
.join("")
}

const estadoSelect = document.getElementById("temporadaEstadoSelect")
if(estadoSelect && !estadoSelect.options.length){
estadoSelect.innerHTML = [
["activa", "Activa"],
["preparacion", "Preparacion"],
["pausada", "Pausada"],
["finalizada", "Finalizada"],
].map(([value, label]) => `<option value="${value}">${label}</option>`).join("")
}
}

function obtenerJuegoBonusSeleccionado(){
return document.getElementById("bonusJuegoSelect")?.value || "sudoku"
}

async function actualizarVistaBonusAdmin(){
const temporada = temporadaActiva || await obtenerTemporadaActiva()
const select = document.getElementById("bonusTemporadaSelect")
const juegoSelect = document.getElementById("bonusJuegoSelect")
if(!formularioTemporadaInicializado && juegoSelect && temporada?.bonusJuego){
juegoSelect.value = temporada.bonusJuego
}
if(!formularioTemporadaInicializado && select && temporada?.bonusXP){
select.value = Number(temporada.bonusXP).toFixed(1)
}

const juego = juegoSelect?.value || temporada?.bonusJuego || obtenerJuegoBonusSeleccionado()
const bonus = Number(select?.value || (juego === temporada?.bonusJuego ? temporada?.bonusXP : bonusesTemporada[juego]) || 1)
const juegoEl = document.getElementById("bonusJuegoActual")
const actualEl = document.getElementById("bonusActual")
const estadoEl = document.getElementById("bonusEstado")
const numeroInput = document.getElementById("temporadaNumero")
const nombreInput = document.getElementById("temporadaNombre")
const estadoSelect = document.getElementById("temporadaEstadoSelect")
const tituloEl = document.getElementById("temporadaTituloActual")
const subtituloEl = document.getElementById("temporadaSubtituloActual")
const destacado = await obtenerJuegoDestacadoTemporada()

if(select) select.value = bonus.toFixed(1)
if(!formularioTemporadaInicializado && numeroInput) numeroInput.value = temporada?.numero || 1
if(!formularioTemporadaInicializado && nombreInput) nombreInput.value = temporada?.nombre || "Temporada actual"
if(!formularioTemporadaInicializado && estadoSelect) estadoSelect.value = normalizarEstadoTemporada(temporada?.estado, temporada?.activa)
formularioTemporadaInicializado = true
if(tituloEl) setCleanText(tituloEl, `Temporada ${temporada?.numero || 1}`)
if(subtituloEl) setCleanText(subtituloEl, temporada?.nombre || "Temporada actual")
if(juegoEl) setCleanText(juegoEl, "Juego con bonus: " + etiquetaJuego(juego))
if(actualEl) setCleanText(actualEl, formatearMultiplicador(bonus))
if(estadoEl){
const esDestacado = destacado?.key === juego && Number(destacado?.bonus || 1) > 1
const estadoTexto = normalizarEstadoTemporada(temporada?.estado, temporada?.activa)
setCleanText(estadoEl, esDestacado ? `Temporada ${estadoTexto} - juego destacado` : `Temporada ${estadoTexto} - bonus base`)
estadoEl.classList.toggle("highlight", esDestacado)
}
}

async function guardarBonusTemporadaAdmin(){
return guardarTemporadaAdmin()
}

async function guardarTemporadaAdmin(){
const juego = obtenerJuegoBonusSeleccionado()
const valor = document.getElementById("bonusTemporadaSelect")?.value || "1.0"
const numero = Number(document.getElementById("temporadaNumero")?.value || 1)
const nombre = document.getElementById("temporadaNombre")?.value || "Temporada actual"
const estado = normalizarEstadoTemporada(document.getElementById("temporadaEstadoSelect")?.value || "activa")
const id = temporadaActiva?.id || `temporada-${Math.max(1, Math.trunc(numero || 1))}`
const payloadTemporada = {
id,
numero,
nombre,
estado,
bonusJuego: juego,
bonusXP: Number(valor),
activa: estado === "activa",
fechaInicio: temporadaActiva?.fechaInicio || new Date().toISOString(),
fechaFin: estado === "finalizada" ? (temporadaActiva?.fechaFin || new Date().toISOString()) : null,
visual: temporadaActiva?.visual || {},
}

const rpcTemporada = await ejecutarRpcAdmin("admin_guardar_temporada_activa", {
p_id: payloadTemporada.id,
p_numero: payloadTemporada.numero,
p_nombre: payloadTemporada.nombre,
p_juego: juego,
p_multiplicador: Number(valor),
p_estado: payloadTemporada.estado,
})
if(rpcTemporada.ok){
temporadaActiva = payloadTemporada
bonusesTemporada = await obtenerBonusesTemporada()
formularioTemporadaInicializado = false
await actualizarVistaBonusAdmin()
safeAlert("Temporada guardada: " + cleanText(payloadTemporada.nombre))
return
}

const resultado = await guardarTemporadaActiva(payloadTemporada)
if(!resultado.ok){
const legado = await guardarBonusTemporada(juego, valor)
bonusesTemporada[juego] = legado.bonus
}
temporadaActiva = resultado.temporada || payloadTemporada
formularioTemporadaInicializado = false
await actualizarVistaBonusAdmin()
safeAlert(resultado.ok
? "Temporada guardada: " + cleanText(payloadTemporada.nombre)
: "Temporada guardada localmente. Ejecuta el SQL actualizado para persistencia global.")
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

if(!await confirmAction("Esto borrara el ranking semanal de " + juego + ". El global y las victorias historicas se conservan.", { title: "Borrar ranking semanal" })) return

const rpc = await ejecutarRpcAdmin("admin_borrar_ranking_semana", { p_juego: juego })
if(rpc.ok){
safeAlert("Ranking semanal eliminado para " + juego)
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
safeAlert(errorMessage(error, "No se pudo borrar el ranking semanal"))
return
}

safeAlert("Ranking semanal eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
}

async function borrarRankingVictorias(){
const juego = obtenerJuegoSeleccionado()

if(!await confirmAction("Esto borrara las victorias acumuladas de " + juego + " sin borrar los resultados globales.", { title: "Borrar ranking de victorias" })) return

const rpc = await ejecutarRpcAdmin("admin_borrar_ranking_victorias", { p_juego: juego })
if(rpc.ok){
safeAlert("Ranking de victorias eliminado para " + juego)
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
safeAlert(errorMessage(error, "No se pudo borrar el ranking de victorias"))
return
}

safeAlert("Ranking de victorias eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
}

async function borrarRankingGlobal(){
const juego = obtenerJuegoSeleccionado()

if(!await confirmAction("Esto borrara el ranking global y el historial de " + juego + ". El ranking temporal actual tambien se limpiara.", { title: "Borrar ranking global" })) return

const rpc = await ejecutarRpcAdmin("admin_borrar_ranking_global", { p_juego: juego })
if(rpc.ok){
safeAlert("Ranking global eliminado para " + juego)
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
safeAlert(errorMessage(error, "No se pudo borrar el ranking global"))
return
}

safeAlert("Ranking global eliminado para " + juego)
cargarRanking()
cargarVistaAdmin()
}

async function reiniciarTemporada(){
const confirmacion = await promptAction("Esto creara una nueva temporada y bajara 3 niveles a todos los usuarios. Escribe TEMPORADA para confirmar.", { title: "Reiniciar temporada", danger: true })
if(confirmacion !== "TEMPORADA") return

const rpc = await ejecutarRpcAdmin("admin_reiniciar_temporada")
if(rpc.ok && rpc.data){
safeAlert("Temporada reiniciada: " + cleanText(rpc.data, "OK"))
cargarRanking()
cargarVistaAdmin()
return
}

console.warn("No se pudo reiniciar la temporada", rpc.error)
safeAlert(errorMessage(rpc.error, "No se pudo reiniciar la temporada"))
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

const confirmacion = await promptAction("Esto borrara rankings, historial y tableros unicos de Sudoku. Escribe RESET para confirmar.", { title: "Reset total", danger: true })
if(confirmacion !== "RESET") return

const rpc = await ejecutarRpcAdmin("admin_reset_total")
if(rpc.ok){
safeAlert("Torneo reiniciado completo. Los tableros de Sudoku se reasignaran cuando entren los usuarios.")
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

safeAlert("Torneo reiniciado completo. Los tableros de Sudoku se reasignaran cuando entren los usuarios.")

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
setCleanText(el, "Juego: " + cleanText(data.juego_actual, "-") + " | Estado: " + cleanText(data.estado, "-"))
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
window.guardarBonusTemporadaAdmin = guardarBonusTemporadaAdmin
window.guardarTemporadaAdmin = guardarTemporadaAdmin
window.exportarRankingActual = exportarRankingActual
window.exportarTablasRanking = exportarTablasRanking
window.exportarHistorialPartidas = exportarHistorialPartidas
window.cargarMiniTorneosAdmin = cargarMiniTorneosAdmin
window.finalizarMiniTorneoAdmin = finalizarMiniTorneoAdmin
window.borrarMiniTorneoAdmin = borrarMiniTorneoAdmin

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

document.getElementById('bonusJuegoSelect')?.addEventListener('change', () => {
  actualizarVistaBonusAdmin()
})

document.getElementById('bonusTemporadaSelect')?.addEventListener('change', () => {
  actualizarVistaBonusAdmin()
})

document.getElementById('temporadaEstadoSelect')?.addEventListener('change', () => {
  actualizarVistaBonusAdmin()
})

syncNumcatchUI()
rellenarSelectorBonus()
