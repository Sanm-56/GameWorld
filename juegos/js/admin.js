import { supabase } from "./supabase.js"
import { cleanText, confirmAction, errorMessage, escapeHtml, promptAction, safeAlert, setCleanText } from "./mensajes.js"
import {
  BONUS_TEMPORADA_VALORES,
  JUEGOS_TEMPORADA,
  calcularFechaFin,
  construirTemporadaAdmin,
  etiquetaJuego,
  formatearMultiplicador,
  guardarBonusTemporada,
  guardarTemporadaActiva,
  normalizarEstadoTemporada,
  obtenerBonusesTemporada,
  obtenerJuegoDestacadoTemporada,
  obtenerTemporadaActiva,
  temporadaTieneBonusActivo,
  tiempoRestanteTemporada,
} from "./experiencia-temporada.js"
import {
  BONUS_MONEDAS_VALORES,
  construirEventoMonedas,
  desactivarEventoMonedas,
  eventoEstaActivo,
  guardarEventoMonedas,
  obtenerEventoMonedasActual,
  resumenEventoMonedas,
  tiempoRestanteEventoMonedas,
} from "./bonus-monedas-evento.js"
import { COSMETICOS, ORDEN_RAREZAS_TIENDA, rarezaEtiqueta, tiempoRestante } from "./tienda.js"

const JUEGOS_PUNTAJE = new Set(["matematicas", "flashmind", "numcatch", "cricketarcade", "esquivaobstaculos", "torreinfinita", "subelamontana"])
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
let temporadaTimer = null
let canalTemporadas = null
let eventoMonedasActivo = null
let bonusMonedasTimer = null
let formularioMonedasInicializado = false
let canalBonusMonedas = null
let miniTorneosAdminRequestId = 0
const miniTorneosAdminAccionesPendientes = new Set()
let vipMembershipsRequestId = 0
let vipEventsRequestId = 0
let vipEventsCache = []
let vipBingoRoomsRequestId = 0
const vipBingoRoomTimers = new Map()
let vipPrivateTournamentsRequestId = 0
let vipPrivateTournamentsCache = []
let rewardUserSeleccionado = null
let rewardAmountSeleccionado = 100
let rewardHistoryChannel = null
let storeProductsCache = []
const REWARD_AMOUNT_PRESETS = {
  monedas: [100, 1000, 10000, 100000, 1000000],
  experiencia: [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000],
}
const REWARD_TYPES = {
  monedas: "Monedas",
  experiencia: "Experiencia",
  booster_xp: "Booster XP",
  booster_monedas: "Booster monedas",
  fondo: "Fondo",
  id: "ID",
  marco: "Marco",
  bate_cricket: "Bate Cricket",
  pelota_cricket: "Pelota Cricket",
  especial: "Recompensa especial/evento",
}
const REWARD_COSMETIC_TYPES = ["fondo", "id", "marco", "bate_cricket", "pelota_cricket"]

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
cargarEventoMonedasAdmin()
cargarMiniTorneosAdmin()
cargarMembresiasVipAdmin()
cargarEventosVipAdmin()
cargarSalasBingoVipAdmin()
cargarMinitorneosVipPrivadosAdmin()
cargarHistorialRegalosAdmin()
cargarProductosTiendaAdmin()
escucharHistorialRegalosAdmin()
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
cargarEventoMonedasAdmin()
cargarMiniTorneosAdmin()
cargarMembresiasVipAdmin()
cargarEventosVipAdmin()
cargarSalasBingoVipAdmin()
cargarMinitorneosVipPrivadosAdmin()
cargarHistorialRegalosAdmin()
cargarProductosTiendaAdmin()
escucharHistorialRegalosAdmin()
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

async function cargarMembresiasVipAdmin(){
const list = document.getElementById("vipMembershipList")
const status = document.getElementById("vipAdminStatus")
if(!list) return

const requestId = ++vipMembershipsRequestId
list.innerHTML = '<div class="export-note">Cargando membresias VIP...</div>'

const rpc = await ejecutarRpcAdminObjeto("admin_listar_membresias_vip")
if(requestId !== vipMembershipsRequestId) return

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudieron cargar las membresias VIP. Reaplica supabase-vip.sql actualizado.")
if(status) setCleanText(status, mensaje)
list.innerHTML = `<div class="export-note">${escapeHtml(mensaje)}</div>`
return
}

const items = Array.isArray(rpc.data?.items) ? rpc.data.items : []
if(status) setCleanText(status, `${items.length} membresia${items.length === 1 ? "" : "s"} VIP registradas.`)

if(!items.length){
list.innerHTML = '<div class="export-note">Todavia no hay usuarios VIP.</div>'
return
}

list.innerHTML = items.map((item) => {
const activa = item.is_valid === true
const expira = item.expires_at ? new Date(item.expires_at).toLocaleString("es-CO") : "Sin expiracion"
const actualizado = item.updated_at ? new Date(item.updated_at).toLocaleString("es-CO") : "-"
return `
  <div class="reward-history-row">
    <strong>${escapeHtml(item.usuario_id)} - ${activa ? "VIP activo" : "VIP inactivo"}</strong>
    <span>Expira: ${escapeHtml(expira)} | Actualizado: ${escapeHtml(actualizado)}</span>
  </div>
`
}).join("")
}

function obtenerVipExpiresAtAdmin(activo){
if(!activo) return null
const value = document.getElementById("vipDurationSelect")?.value || "permanente"
if(value === "permanente") return null
const dias = Math.trunc(Number(value || 0))
if(!Number.isFinite(dias) || dias <= 0) return null
return new Date(Date.now() + dias * 86400000).toISOString()
}

async function guardarVipAdmin(activo){
const input = document.getElementById("vipUserInput")
const status = document.getElementById("vipAdminStatus")
const usuario = cleanText(input?.value || "", "").trim()
if(!usuario){
safeAlert("Escribe el apodo exacto del usuario.")
return
}

const accion = activo ? "activar VIP para " : "quitar VIP a "
const ok = await confirmAction(accion + usuario + "?", { title: activo ? "Activar VIP" : "Quitar VIP", acceptText: activo ? "Activar" : "Quitar", danger: !activo })
if(!ok) return

if(status) setCleanText(status, "Guardando membresia VIP...")
const rpc = await ejecutarRpcAdminObjeto("admin_guardar_membresia_vip", {
p_usuario: usuario,
p_activo: activo,
p_expires_at: obtenerVipExpiresAtAdmin(activo),
})

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo guardar la membresia VIP. Reaplica supabase-vip.sql actualizado.")
if(status) setCleanText(status, mensaje)
safeAlert(mensaje)
return
}

if(input) input.value = ""
if(status) setCleanText(status, activo ? "VIP activado correctamente." : "VIP desactivado correctamente.")
safeAlert(activo ? "VIP activado correctamente." : "VIP desactivado correctamente.")
await cargarMembresiasVipAdmin()
}

// =============================
// 🏆 PODIO + RANKING
// =============================
function formatoDatetimeLocal(fecha = new Date()){
const date = fecha instanceof Date ? fecha : new Date(fecha)
if(Number.isNaN(date.getTime())) return ""
const offset = date.getTimezoneOffset()
const local = new Date(date.getTime() - offset * 60000)
return local.toISOString().slice(0, 16)
}

function leerJsonAdmin(id, fallback = {}){
const raw = document.getElementById(id)?.value?.trim() || ""
if(!raw) return fallback
try{
const parsed = JSON.parse(raw)
return parsed && typeof parsed === "object" ? parsed : fallback
}catch{
throw new Error(`JSON invalido en ${id}.`)
}
}

function obtenerPayloadEventoVipAdmin(){
const idRaw = document.getElementById("vipEventId")?.value || ""
const name = cleanText(document.getElementById("vipEventName")?.value || "", "").trim()
const description = cleanText(document.getElementById("vipEventDescription")?.value || "", "").trim()
const type = cleanText(document.getElementById("vipEventType")?.value || "general", "general")
const relatedGame = cleanText(document.getElementById("vipEventGame")?.value || "", "").trim()
const startRaw = document.getElementById("vipEventStart")?.value || ""
const endRaw = document.getElementById("vipEventEnd")?.value || ""
const startsAt = startRaw ? new Date(startRaw) : null
const endsAt = endRaw ? new Date(endRaw) : null
return {
id: idRaw ? Math.trunc(Number(idRaw)) : null,
name,
description,
type,
relatedGame,
startsAt,
endsAt,
isActive: document.getElementById("vipEventActive")?.checked !== false,
rewards: leerJsonAdmin("vipEventRewards", {}),
config: leerJsonAdmin("vipEventConfig", {}),
}
}

function validarEventoVipAdmin(payload){
if(!payload.name) return "El evento VIP necesita nombre."
if(!payload.startsAt || Number.isNaN(payload.startsAt.getTime())) return "Selecciona fecha de inicio valida."
if(!payload.endsAt || Number.isNaN(payload.endsAt.getTime())) return "Selecciona fecha de fin valida."
if(payload.endsAt <= payload.startsAt) return "La fecha de fin debe ser posterior al inicio."
return ""
}

function resumenEventoVipAdmin(evento){
const activo = evento.is_active ? "Activo" : "Inactivo"
const actual = evento.is_current ? " | En curso" : ""
const inicio = evento.starts_at ? new Date(evento.starts_at).toLocaleString("es-CO") : "-"
const fin = evento.ends_at ? new Date(evento.ends_at).toLocaleString("es-CO") : "-"
return `${activo}${actual} | ${inicio} - ${fin}`
}

async function cargarEventosVipAdmin(){
const list = document.getElementById("vipEventsList")
const status = document.getElementById("vipEventsAdminStatus")
if(!list) return

const requestId = ++vipEventsRequestId
list.innerHTML = '<div class="export-note">Cargando eventos VIP...</div>'

const rpc = await ejecutarRpcAdminObjeto("admin_listar_eventos_vip")
if(requestId !== vipEventsRequestId) return

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudieron cargar eventos VIP. Reaplica supabase-vip.sql actualizado.")
if(status) setCleanText(status, mensaje)
list.innerHTML = `<div class="export-note">${escapeHtml(mensaje)}</div>`
return
}

vipEventsCache = Array.isArray(rpc.data?.items) ? rpc.data.items : []
if(status) setCleanText(status, `${vipEventsCache.length} evento${vipEventsCache.length === 1 ? "" : "s"} VIP registrado${vipEventsCache.length === 1 ? "" : "s"}.`)

if(!vipEventsCache.length){
list.innerHTML = '<div class="export-note">Todavia no hay eventos VIP.</div>'
return
}

list.innerHTML = vipEventsCache.map((item) => `
  <div class="reward-history-row">
    <strong>${escapeHtml(item.name)} - ${escapeHtml(item.event_type || "general")}</strong>
    <span>${escapeHtml(resumenEventoVipAdmin(item))}</span>
    <span>${escapeHtml(item.description || "Sin descripcion")}</span>
    <div class="reward-admin-actions">
      <button type="button" onclick="editarEventoVipAdmin(${Number(item.id)})">Editar</button>
      <button type="button" onclick="cambiarEstadoEventoVipAdmin(${Number(item.id)}, ${item.is_active ? "false" : "true"})">${item.is_active ? "Desactivar" : "Activar"}</button>
    </div>
    <button class="danger" type="button" onclick="eliminarEventoVipAdmin(${Number(item.id)})">Eliminar</button>
  </div>
`).join("")
}

function limpiarEventoVipAdmin(){
const now = new Date()
const end = new Date(now.getTime() + 7 * 86400000)
const fields = {
vipEventId: "",
vipEventName: "",
vipEventDescription: "",
vipEventType: "general",
vipEventGame: "",
vipEventStart: formatoDatetimeLocal(now),
vipEventEnd: formatoDatetimeLocal(end),
vipEventRewards: "",
vipEventConfig: "",
}
Object.entries(fields).forEach(([id, value]) => {
const el = document.getElementById(id)
if(el) el.value = value
})
const active = document.getElementById("vipEventActive")
if(active) active.checked = true
const title = document.getElementById("vipEventFormTitle")
if(title) setCleanText(title, "Crear evento VIP")
}

function editarEventoVipAdmin(id){
const item = vipEventsCache.find((evento) => Number(evento.id) === Number(id))
if(!item){
safeAlert("Evento VIP no encontrado en la lista actual.")
return
}
const values = {
vipEventId: item.id || "",
vipEventName: item.name || "",
vipEventDescription: item.description || "",
vipEventType: item.event_type || "general",
vipEventGame: item.related_game || "",
vipEventStart: formatoDatetimeLocal(item.starts_at),
vipEventEnd: formatoDatetimeLocal(item.ends_at),
vipEventRewards: item.rewards && Object.keys(item.rewards).length ? JSON.stringify(item.rewards, null, 2) : "",
vipEventConfig: item.config && Object.keys(item.config).length ? JSON.stringify(item.config, null, 2) : "",
}
Object.entries(values).forEach(([fieldId, value]) => {
const el = document.getElementById(fieldId)
if(el) el.value = value
})
const active = document.getElementById("vipEventActive")
if(active) active.checked = item.is_active === true
const title = document.getElementById("vipEventFormTitle")
if(title) setCleanText(title, "Editar evento VIP")
document.getElementById("vipEventName")?.focus()
}

async function guardarEventoVipAdmin(){
let payload
try{
payload = obtenerPayloadEventoVipAdmin()
}catch(error){
safeAlert(error.message)
return
}
const error = validarEventoVipAdmin(payload)
if(error){
safeAlert(error)
return
}

const ok = await confirmAction(payload.id ? "Guardar cambios del evento VIP?" : "Crear evento VIP?", { title: "Evento VIP", acceptText: "Guardar", cancelText: "Cancelar", danger: false })
if(!ok) return

const status = document.getElementById("vipEventsAdminStatus")
if(status) setCleanText(status, "Guardando evento VIP...")
const rpc = await ejecutarRpcAdminObjeto("admin_guardar_evento_vip", {
p_event_id: payload.id,
p_name: payload.name,
p_description: payload.description,
p_event_type: payload.type,
p_starts_at: payload.startsAt.toISOString(),
p_ends_at: payload.endsAt.toISOString(),
p_is_active: payload.isActive,
p_related_game: payload.relatedGame || null,
p_rewards: payload.rewards,
p_config: payload.config,
})

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo guardar el evento VIP.")
if(status) setCleanText(status, mensaje)
safeAlert(mensaje)
return
}

safeAlert("Evento VIP guardado correctamente.")
limpiarEventoVipAdmin()
await cargarEventosVipAdmin()
}

async function cambiarEstadoEventoVipAdmin(id, activo){
const ok = await confirmAction(`${activo ? "Activar" : "Desactivar"} evento VIP?`, { title: "Estado evento VIP", acceptText: activo ? "Activar" : "Desactivar", danger: !activo })
if(!ok) return
const rpc = await ejecutarRpcAdminObjeto("admin_cambiar_estado_evento_vip", {
p_event_id: Number(id),
p_is_active: Boolean(activo),
})
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo cambiar el estado del evento VIP."))
return
}
await cargarEventosVipAdmin()
}

async function eliminarEventoVipAdmin(id){
const ok = await confirmAction("Eliminar este evento VIP definitivamente?", { title: "Eliminar evento VIP", acceptText: "Eliminar", danger: true })
if(!ok) return
const rpc = await ejecutarRpcAdminObjeto("admin_eliminar_evento_vip", { p_event_id: Number(id) })
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo eliminar el evento VIP."))
return
}
safeAlert("Evento VIP eliminado.")
limpiarEventoVipAdmin()
await cargarEventosVipAdmin()
}

// =============================
// MINITORNEOS VIP PRIVADOS
// =============================
function limpiarCodigoPrivadoVip(valor){
return cleanText(valor || "", "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64)
}

function estadoMinitorneoVipPrivadoLabel(estado){
const labels = {
borrador: "Borrador",
inscripcion: "Inscripcion",
lista: "Lista",
en_juego: "En juego",
finalizada: "Finalizada",
cancelada: "Cancelada",
archivada: "Archivada",
pendiente: "Pendiente",
confirmada: "Confirmada",
cortesia: "Cortesia",
rechazada: "Rechazada",
}
return labels[estado] || estado || "-"
}

function limpiarMinitorneoVipPrivadoAdmin(){
const now = new Date()
const end = new Date(now.getTime() + 2 * 3600000)
const fields = {
vipPrivateTournamentId: "",
vipPrivateTitle: "",
vipPrivateCode: "",
vipPrivateGame: "reflejos-vip",
vipPrivateStatusSelect: "borrador",
vipPrivateMaxPlayers: "8",
vipPrivateStart: formatoDatetimeLocal(now),
vipPrivateEnd: formatoDatetimeLocal(end),
vipPrivateRules: "",
vipPrivateRecognition: "",
}
Object.entries(fields).forEach(([id, value]) => {
const el = document.getElementById(id)
if(el) el.value = value
})
const title = document.getElementById("vipPrivateFormTitle")
if(title) setCleanText(title, "Crear minitorneo privado")
}

function obtenerPayloadMinitorneoVipPrivadoAdmin(){
const idRaw = document.getElementById("vipPrivateTournamentId")?.value || ""
const title = cleanText(document.getElementById("vipPrivateTitle")?.value || "", "").trim()
const privateCode = limpiarCodigoPrivadoVip(document.getElementById("vipPrivateCode")?.value || "")
const gameKey = cleanText(document.getElementById("vipPrivateGame")?.value || "reflejos-vip", "reflejos-vip")
const status = cleanText(document.getElementById("vipPrivateStatusSelect")?.value || "borrador", "borrador")
const maxPlayers = Math.max(1, Math.min(100, Math.trunc(Number(document.getElementById("vipPrivateMaxPlayers")?.value || 8))))
const startRaw = document.getElementById("vipPrivateStart")?.value || ""
const endRaw = document.getElementById("vipPrivateEnd")?.value || ""
const startsAt = startRaw ? new Date(startRaw) : null
const endsAt = endRaw ? new Date(endRaw) : null
return {
id: idRaw ? Math.trunc(Number(idRaw)) : null,
title,
privateCode,
gameKey,
status,
maxPlayers,
startsAt,
endsAt,
rules: cleanText(document.getElementById("vipPrivateRules")?.value || "", "").trim(),
recognition: cleanText(document.getElementById("vipPrivateRecognition")?.value || "", "").trim(),
}
}

function validarMinitorneoVipPrivadoAdmin(payload){
if(!payload.title) return "El minitorneo privado necesita nombre."
if(!payload.privateCode) return "Escribe un codigo privado valido."
if(!payload.gameKey) return "Selecciona un juego valido."
if(payload.startsAt && Number.isNaN(payload.startsAt.getTime())) return "Selecciona un inicio valido."
if(payload.endsAt && Number.isNaN(payload.endsAt.getTime())) return "Selecciona un fin valido."
if(payload.startsAt && payload.endsAt && payload.endsAt < payload.startsAt) return "El fin no puede ser anterior al inicio."
return ""
}

async function cargarMinitorneosVipPrivadosAdmin(){
const list = document.getElementById("vipPrivateTournamentList")
const status = document.getElementById("vipPrivateAdminStatus")
if(!list) return

const requestId = ++vipPrivateTournamentsRequestId
list.innerHTML = '<div class="export-note">Cargando minitorneos VIP privados...</div>'

const rpc = await ejecutarRpcAdminObjeto("admin_vip_private_listar_torneos")
if(requestId !== vipPrivateTournamentsRequestId) return

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudieron cargar minitorneos VIP privados. Reaplica supabase-vip.sql actualizado.")
if(status) setCleanText(status, mensaje)
list.innerHTML = `<div class="export-note">${escapeHtml(mensaje)}</div>`
return
}

vipPrivateTournamentsCache = Array.isArray(rpc.data?.items) ? rpc.data.items : []
if(status) setCleanText(status, `${vipPrivateTournamentsCache.length} sala${vipPrivateTournamentsCache.length === 1 ? "" : "s"} privada${vipPrivateTournamentsCache.length === 1 ? "" : "s"} registrada${vipPrivateTournamentsCache.length === 1 ? "" : "s"}.`)

if(!vipPrivateTournamentsCache.length){
list.innerHTML = '<div class="export-note">No hay minitorneos VIP privados registrados.</div>'
return
}

list.innerHTML = vipPrivateTournamentsCache.map((item) => {
const inicio = item.starts_at ? new Date(item.starts_at).toLocaleString("es-CO") : "-"
const fin = item.ends_at ? new Date(item.ends_at).toLocaleString("es-CO") : "-"
const players = Array.isArray(item.players) ? item.players : []
const results = Array.isArray(item.results) ? item.results : []
const playersText = players.length
? players.map((player) => `${player.display_name || player.usuario_id} (${estadoMinitorneoVipPrivadoLabel(player.entry_status)})`).join(", ")
: "Sin participantes registrados"
const resultsText = results.length
? results.slice(0, 5).map((result, index) => `#${index + 1} ${result.usuario_id}: ${Number(result.score || 0)} pts`).join(" | ")
: "Sin resultados"
return `
  <div class="reward-history-row">
    <strong>#${Number(item.id)} ${escapeHtml(item.title || "Minitorneo VIP privado")} - ${escapeHtml(estadoMinitorneoVipPrivadoLabel(item.status))}</strong>
    <span>Codigo: ${escapeHtml(item.private_code || "-")} | Juego: ${escapeHtml(item.game_key || "-")} | Cupos: ${Number(item.players_confirmed || 0)}/${Number(item.max_players || 0)}</span>
    <span>${escapeHtml(inicio)} - ${escapeHtml(fin)}</span>
    <span>Participantes: ${escapeHtml(playersText)}</span>
    <span>Resultados: ${escapeHtml(resultsText)}</span>
    <div class="reward-admin-actions">
      <button type="button" onclick="editarMinitorneoVipPrivadoAdmin(${Number(item.id)})">Editar</button>
      <button type="button" onclick="prepararParticipanteVipPrivadoAdmin(${Number(item.id)})">Participante</button>
      <button type="button" onclick="cambiarEstadoMinitorneoVipPrivadoAdmin(${Number(item.id)}, 'inscripcion')">Inscripcion</button>
      <button type="button" onclick="cambiarEstadoMinitorneoVipPrivadoAdmin(${Number(item.id)}, 'en_juego')">Iniciar</button>
      <button type="button" onclick="finalizarMinitorneoVipPrivadoAdmin(${Number(item.id)})">Finalizar</button>
    </div>
    <button class="danger" type="button" onclick="cambiarEstadoMinitorneoVipPrivadoAdmin(${Number(item.id)}, 'archivada')">Archivar</button>
  </div>
`
}).join("")
}

function editarMinitorneoVipPrivadoAdmin(id){
const item = vipPrivateTournamentsCache.find((torneo) => Number(torneo.id) === Number(id))
if(!item){
safeAlert("Minitorneo VIP privado no encontrado.")
return
}
const fields = {
vipPrivateTournamentId: item.id || "",
vipPrivateTitle: item.title || "",
vipPrivateCode: item.private_code || "",
vipPrivateGame: item.game_key || "reflejos-vip",
vipPrivateStatusSelect: item.status || "borrador",
vipPrivateMaxPlayers: item.max_players || 8,
vipPrivateStart: formatoDatetimeLocal(item.starts_at),
vipPrivateEnd: formatoDatetimeLocal(item.ends_at),
vipPrivateRules: item.rules || "",
vipPrivateRecognition: item.recognition || "",
}
Object.entries(fields).forEach(([idCampo, value]) => {
const el = document.getElementById(idCampo)
if(el) el.value = value
})
const title = document.getElementById("vipPrivateFormTitle")
if(title) setCleanText(title, "Editar minitorneo privado")
prepararParticipanteVipPrivadoAdmin(item.id)
document.getElementById("vipPrivateTitle")?.focus()
}

function prepararParticipanteVipPrivadoAdmin(id){
const input = document.getElementById("vipPrivatePlayerTournamentId")
if(input) input.value = String(id || "")
document.getElementById("vipPrivatePlayerUser")?.focus()
}

async function guardarMinitorneoVipPrivadoAdmin(){
let payload
try{
payload = obtenerPayloadMinitorneoVipPrivadoAdmin()
}catch(error){
safeAlert(error.message)
return
}
const error = validarMinitorneoVipPrivadoAdmin(payload)
if(error){
safeAlert(error)
return
}

const ok = await confirmAction(payload.id ? "Guardar cambios del minitorneo VIP privado?" : "Crear minitorneo VIP privado?", { title: "Minitorneo VIP privado", acceptText: "Guardar", danger: false })
if(!ok) return

const status = document.getElementById("vipPrivateAdminStatus")
if(status) setCleanText(status, "Guardando minitorneo VIP privado...")
const rpc = await ejecutarRpcAdminObjeto("admin_vip_private_guardar_torneo", {
p_tournament_id: payload.id,
p_title: payload.title,
p_private_code: payload.privateCode,
p_game_key: payload.gameKey,
p_max_players: payload.maxPlayers,
p_rules: payload.rules,
p_recognition: payload.recognition,
p_starts_at: payload.startsAt ? payload.startsAt.toISOString() : null,
p_ends_at: payload.endsAt ? payload.endsAt.toISOString() : null,
p_status: payload.status,
p_config: {},
})

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo guardar el minitorneo VIP privado.")
if(status) setCleanText(status, mensaje)
safeAlert(mensaje)
return
}

if(status) setCleanText(status, "Minitorneo VIP privado guardado.")
safeAlert("Minitorneo VIP privado guardado.")
limpiarMinitorneoVipPrivadoAdmin()
await cargarMinitorneosVipPrivadosAdmin()
}

async function guardarParticipanteVipPrivadoAdmin(){
const tournamentId = Math.trunc(Number(document.getElementById("vipPrivatePlayerTournamentId")?.value || 0))
const usuario = cleanText(document.getElementById("vipPrivatePlayerUser")?.value || "", "").trim()
const entryStatus = cleanText(document.getElementById("vipPrivatePlayerStatus")?.value || "pendiente", "pendiente")
const notes = cleanText(document.getElementById("vipPrivatePlayerNotes")?.value || "", "").trim()
if(!tournamentId){
safeAlert("Indica el ID de la sala privada.")
return
}
if(!usuario){
safeAlert("Escribe el apodo exacto del usuario.")
return
}

const ok = await confirmAction(`Guardar inscripcion ${entryStatus} para ${usuario}?`, { title: "Inscripcion privada VIP", acceptText: "Guardar", danger: entryStatus === "rechazada" || entryStatus === "cancelada" })
if(!ok) return

const status = document.getElementById("vipPrivateAdminStatus")
if(status) setCleanText(status, "Guardando participante...")
const rpc = await ejecutarRpcAdminObjeto("admin_vip_private_guardar_participante", {
p_tournament_id: tournamentId,
p_usuario: usuario,
p_entry_status: entryStatus,
p_display_name: usuario,
p_notes: notes,
})
if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo guardar el participante VIP privado.")
if(status) setCleanText(status, mensaje)
safeAlert(mensaje)
return
}
if(status) setCleanText(status, "Participante actualizado.")
document.getElementById("vipPrivatePlayerUser").value = ""
document.getElementById("vipPrivatePlayerNotes").value = ""
await cargarMinitorneosVipPrivadosAdmin()
}

async function cambiarEstadoMinitorneoVipPrivadoAdmin(id, estado){
const ok = await confirmAction(`Cambiar sala #${id} a ${estadoMinitorneoVipPrivadoLabel(estado)}?`, { title: "Estado minitorneo VIP", acceptText: "Cambiar", danger: ["cancelada", "archivada"].includes(estado) })
if(!ok) return
const rpc = await ejecutarRpcAdminObjeto("admin_vip_private_cambiar_estado", {
p_tournament_id: Number(id),
p_status: estado,
})
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo cambiar el estado del minitorneo VIP privado."))
return
}
await cargarMinitorneosVipPrivadosAdmin()
}

async function finalizarMinitorneoVipPrivadoAdmin(id){
const ganador = await promptAction("Usuario ganador opcional. Deja vacio para finalizar sin marcar ganador.", { title: "Finalizar minitorneo VIP", acceptText: "Finalizar", cancelText: "Cancelar", danger: false })
if(ganador === null) return
const rpc = await ejecutarRpcAdminObjeto("admin_vip_private_finalizar_torneo", {
p_tournament_id: Number(id),
p_winner_usuario: cleanText(ganador || "", "").trim() || null,
})
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo finalizar el minitorneo VIP privado."))
return
}
await cargarMinitorneosVipPrivadosAdmin()
}

// =============================
// SALAS BINGO VIP
// =============================
function limpiarCodigoSalaVip(valor){
return cleanText(valor || "", "").trim().toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 32)
}

async function cargarSalasBingoVipAdmin(){
const list = document.getElementById("vipBingoRoomsList")
const status = document.getElementById("vipBingoRoomsStatus")
if(!list) return

const requestId = ++vipBingoRoomsRequestId
list.innerHTML = '<div class="export-note">Cargando salas Bingo VIP...</div>'
const rpc = await ejecutarRpcAdminObjeto("admin_vip_bingo_listar_salas")
if(requestId !== vipBingoRoomsRequestId) return

if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudieron cargar salas Bingo VIP. Reaplica supabase-vip.sql actualizado.")
if(status) setCleanText(status, mensaje)
list.innerHTML = `<div class="export-note">${escapeHtml(mensaje)}</div>`
return
}

const items = Array.isArray(rpc.data?.items) ? rpc.data.items : []
if(status) setCleanText(status, `${items.length} sala${items.length === 1 ? "" : "s"} Bingo VIP registrada${items.length === 1 ? "" : "s"}.`)
if(!items.length){
list.innerHTML = '<div class="export-note">No hay salas Bingo VIP activas.</div>'
return
}

list.innerHTML = items.map((room) => {
const id = cleanText(room.id || "", "")
const creada = room.created_at ? new Date(room.created_at).toLocaleString("es-CO") : "-"
const ultimo = room.updated_at ? new Date(room.updated_at).toLocaleString("es-CO") : "-"
const finished = room.status === "finished"
const autoRunning = vipBingoRoomTimers.has(id)
return `
  <div class="reward-history-row">
    <strong>${escapeHtml(id)} - ${escapeHtml(room.status || "active")}</strong>
    <span>${Number(room.players || 0)} jugador${Number(room.players || 0) === 1 ? "" : "es"} | ${Number(room.called_count || 0)} numeros | Ganador: ${escapeHtml(room.winner_usuario_id || "-")}</span>
    <span>Creada: ${escapeHtml(creada)} | Actualizada: ${escapeHtml(ultimo)}</span>
    <div class="reward-admin-actions">
      <button type="button" onclick="cantarNumeroBingoVipAdmin('${escapeJsString(id)}')" ${finished ? "disabled" : ""}>Cantar ahora</button>
      <button type="button" onclick="alternarAutoBingoVipAdmin('${escapeJsString(id)}')" ${finished ? "disabled" : ""}>${autoRunning ? "Pausar auto" : "Iniciar auto"}</button>
      <button type="button" onclick="finalizarSalaBingoVipAdmin('${escapeJsString(id)}')" ${finished ? "disabled" : ""}>Finalizar</button>
    </div>
    <button class="danger" type="button" onclick="borrarSalaBingoVipAdmin('${escapeJsString(id)}')">Borrar</button>
  </div>
`
}).join("")
}

async function crearSalaBingoVipAdmin(){
const codeInput = document.getElementById("vipBingoRoomCode")
const adminInput = document.getElementById("vipBingoRoomAdmin")
const status = document.getElementById("vipBingoRoomsStatus")
const roomId = limpiarCodigoSalaVip(codeInput?.value || "")
const createdBy = cleanText(adminInput?.value || "admin", "admin").trim() || "admin"
if(!roomId){
safeAlert("Escribe un codigo de sala VIP.")
return
}
const ok = await confirmAction(`Crear o reiniciar sala Bingo VIP ${roomId}?`, { title: "Sala Bingo VIP", acceptText: "Crear", cancelText: "Cancelar" })
if(!ok) return
if(status) setCleanText(status, "Creando sala Bingo VIP...")
const rpc = await ejecutarRpcAdminObjeto("admin_vip_bingo_crear_sala", {
p_room_id: roomId,
p_created_by: createdBy,
})
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo crear la sala Bingo VIP."))
return
}
if(codeInput) codeInput.value = roomId
safeAlert(`Sala Bingo VIP creada. Codigo: ${roomId}`)
await cargarSalasBingoVipAdmin()
}

async function cantarNumeroBingoVipAdmin(roomId, { quiet = false } = {}){
const cleanRoom = limpiarCodigoSalaVip(roomId)
if(!cleanRoom) return
const rpc = await ejecutarRpcAdminObjeto("admin_vip_bingo_cantar_numero", { p_room_id: cleanRoom })
if(!rpc.ok || rpc.data?.ok === false){
if(!quiet) safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo cantar numero VIP."))
detenerAutoBingoVipAdmin(cleanRoom)
return
}
const number = rpc.data?.number
if(!quiet) safeAlert(number ? `Numero cantado: ${number}` : "La sala ya no tiene numeros disponibles.")
if(rpc.data?.room?.status === "finished" || number === null) detenerAutoBingoVipAdmin(cleanRoom)
await cargarSalasBingoVipAdmin()
}

function alternarAutoBingoVipAdmin(roomId){
const cleanRoom = limpiarCodigoSalaVip(roomId)
if(!cleanRoom) return
if(vipBingoRoomTimers.has(cleanRoom)){
detenerAutoBingoVipAdmin(cleanRoom)
cargarSalasBingoVipAdmin()
return
}
const timer = setInterval(() => {
cantarNumeroBingoVipAdmin(cleanRoom, { quiet: true })
}, 4500)
vipBingoRoomTimers.set(cleanRoom, timer)
cantarNumeroBingoVipAdmin(cleanRoom, { quiet: true })
cargarSalasBingoVipAdmin()
}

function detenerAutoBingoVipAdmin(roomId){
const timer = vipBingoRoomTimers.get(roomId)
if(timer) clearInterval(timer)
vipBingoRoomTimers.delete(roomId)
}

async function finalizarSalaBingoVipAdmin(roomId){
const cleanRoom = limpiarCodigoSalaVip(roomId)
if(!cleanRoom) return
const ok = await confirmAction(`Finalizar sala Bingo VIP ${cleanRoom}?`, { title: "Finalizar sala VIP", danger: true })
if(!ok) return
detenerAutoBingoVipAdmin(cleanRoom)
const rpc = await ejecutarRpcAdminObjeto("admin_vip_bingo_finalizar_sala", { p_room_id: cleanRoom })
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo finalizar la sala Bingo VIP."))
return
}
await cargarSalasBingoVipAdmin()
}

async function borrarSalaBingoVipAdmin(roomId){
const cleanRoom = limpiarCodigoSalaVip(roomId)
if(!cleanRoom) return
const confirmacion = await promptAction(`Borrar sala Bingo VIP ${cleanRoom}. Escribe BORRAR para confirmar.`, { title: "Borrar sala VIP", danger: true })
if(confirmacion !== "BORRAR") return
detenerAutoBingoVipAdmin(cleanRoom)
const rpc = await ejecutarRpcAdminObjeto("admin_vip_bingo_borrar_sala", { p_room_id: cleanRoom })
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo borrar la sala Bingo VIP."))
return
}
await cargarSalasBingoVipAdmin()
}

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

supabase
.channel("admin-vip-bingo-cambios")
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "vip_bingo_rooms" },
() => cargarSalasBingoVipAdmin()
)
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "vip_bingo_players" },
() => cargarSalasBingoVipAdmin()
)
.subscribe()

// =============================
// 🚀 INICIAR TORNEO (MEJORADO)
// =============================
supabase
.channel("admin-vip-private-cambios")
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "vip_private_tournaments" },
() => cargarMinitorneosVipPrivadosAdmin()
)
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "vip_private_tournament_players" },
() => cargarMinitorneosVipPrivadosAdmin()
)
.on(
"postgres_changes",
{ event: "*", schema: "public", table: "vip_private_tournament_results" },
() => cargarMinitorneosVipPrivadosAdmin()
)
.subscribe()

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
instalarRealtimeTemporadas()
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
["preparacion", "Preparacion"],
["activa", "Activa"],
["revision", "Revision"],
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
const duracionTipoSelect = document.getElementById("temporadaDuracionTipo")
const duracionCantidadInput = document.getElementById("temporadaDuracionCantidad")
const tituloEl = document.getElementById("temporadaTituloActual")
const subtituloEl = document.getElementById("temporadaSubtituloActual")
const destacado = await obtenerJuegoDestacadoTemporada()

if(select) select.value = bonus.toFixed(1)
if(!formularioTemporadaInicializado && numeroInput) numeroInput.value = temporada?.numero || 1
if(!formularioTemporadaInicializado && nombreInput) nombreInput.value = temporada?.nombre || "Temporada actual"
if(!formularioTemporadaInicializado && estadoSelect) estadoSelect.value = normalizarEstadoTemporada(temporada?.estado, temporada?.activa)
if(!formularioTemporadaInicializado && duracionTipoSelect) duracionTipoSelect.value = temporada?.duracionTipo || "dias"
if(!formularioTemporadaInicializado && duracionCantidadInput) duracionCantidadInput.value = temporada?.duracionCantidad || 30
formularioTemporadaInicializado = true
if(tituloEl) setCleanText(tituloEl, `Temporada ${temporada?.numero || 1}`)
if(subtituloEl) setCleanText(subtituloEl, temporada?.nombre || "Temporada actual")
if(juegoEl) setCleanText(juegoEl, "Juego con bonus: " + etiquetaJuego(juego))
if(actualEl) setCleanText(actualEl, formatearMultiplicador(bonus))
if(estadoEl){
const esDestacado = destacado?.key === juego && Number(destacado?.bonus || 1) > 1 && temporadaTieneBonusActivo(temporada)
const estadoTexto = normalizarEstadoTemporada(temporada?.estado, temporada?.activa)
setCleanText(estadoEl, esDestacado ? `Temporada ${estadoTexto} - juego destacado` : `Temporada ${estadoTexto} - bonus base`)
estadoEl.classList.toggle("highlight", esDestacado)
}
actualizarCountdownTemporada()
reiniciarTimerTemporada()
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
const duracionTipo = document.getElementById("temporadaDuracionTipo")?.value || "dias"
const duracionCantidad = Math.max(1, Math.trunc(Number(document.getElementById("temporadaDuracionCantidad")?.value || 30)))
const id = temporadaActiva?.id || `temporada-${Math.max(1, Math.trunc(numero || 1))}`
const nombres = obtenerNombresTemporadaConfigurados()
const nombreIndice = Math.max(0, nombres.findIndex((item) => item === cleanText(nombre, "").trim()))
const estadoAnterior = normalizarEstadoTemporada(temporadaActiva?.estado, temporadaActiva?.activa)
const ahora = new Date().toISOString()
const activandoTemporada = estado === "activa" && estadoAnterior !== "activa"
const fechaInicio = estado === "activa"
? (activandoTemporada ? ahora : (temporadaActiva?.fechaInicio || ahora))
: (temporadaActiva?.fechaInicio || ahora)
const conservarFinActivo = estado === "activa"
&& !activandoTemporada
&& temporadaActiva?.fechaFin
&& Date.parse(temporadaActiva.fechaFin) > Date.now()
&& temporadaActiva?.duracionTipo === duracionTipo
&& Number(temporadaActiva?.duracionCantidad || 0) === duracionCantidad
const fechaFin = estado === "activa"
? (conservarFinActivo ? temporadaActiva.fechaFin : calcularFechaFin(fechaInicio, duracionTipo, duracionCantidad))
: estado === "finalizada"
  ? (temporadaActiva?.fechaFin || ahora)
  : null
const payloadTemporada = construirTemporadaAdmin({
id,
numero,
nombre,
estado,
bonusJuego: juego,
bonusXP: Number(valor),
fechaInicio,
fechaFin,
duracionTipo,
duracionCantidad,
nombreIndice: nombreIndice >= 0 ? nombreIndice : (temporadaActiva?.nombreIndice || 0),
nombres,
autoRotacion: true,
visual: temporadaActiva?.visual || {},
})

const rpcTemporada = await ejecutarRpcAdmin("admin_guardar_temporada_activa", {
p_id: payloadTemporada.id,
p_numero: payloadTemporada.numero,
p_nombre: payloadTemporada.nombre,
p_juego: juego,
p_multiplicador: Number(valor),
p_estado: payloadTemporada.estado,
p_fecha_inicio: payloadTemporada.fechaInicio,
p_fecha_fin: payloadTemporada.fechaFin,
p_duracion_tipo: payloadTemporada.duracionTipo,
p_duracion_cantidad: payloadTemporada.duracionCantidad,
p_nombre_indice: payloadTemporada.nombreIndice,
p_nombres_temporada: payloadTemporada.nombres,
p_auto_rotacion: payloadTemporada.autoRotacion,
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

function obtenerNombresTemporadaConfigurados(){
const opciones = [...document.querySelectorAll("#temporadaNombresSugeridos option")]
const nombres = opciones.map((option) => cleanText(option.value, "").trim()).filter(Boolean)
const nombreManual = cleanText(document.getElementById("temporadaNombre")?.value || "", "").trim()
if(nombreManual && !nombres.includes(nombreManual)) nombres.unshift(nombreManual)
return [...new Set(nombres)]
}

function actualizarCountdownTemporada(){
const countdownEl = document.getElementById("temporadaCountdown")
if(!countdownEl) return
const estado = normalizarEstadoTemporada(temporadaActiva?.estado, temporadaActiva?.activa)
if(estado === "activa"){
setCleanText(countdownEl, "Finaliza en " + tiempoRestanteTemporada(temporadaActiva))
countdownEl.classList.toggle("highlight", temporadaTieneBonusActivo(temporadaActiva))
return
}
const textos = {
preparacion: "En preparacion - bonus inactivo",
revision: "En revision - bonus inactivo",
finalizada: "Temporada finalizada",
}
setCleanText(countdownEl, textos[estado] || "Bonus inactivo")
countdownEl.classList.remove("highlight")
}

function reiniciarTimerTemporada(){
if(temporadaTimer){
clearInterval(temporadaTimer)
temporadaTimer = null
}
if(normalizarEstadoTemporada(temporadaActiva?.estado, temporadaActiva?.activa) !== "activa") return

temporadaTimer = setInterval(async () => {
actualizarCountdownTemporada()
if(!temporadaTieneBonusActivo(temporadaActiva)){
clearInterval(temporadaTimer)
temporadaTimer = null
temporadaActiva = await obtenerTemporadaActiva()
formularioTemporadaInicializado = false
await actualizarVistaBonusAdmin()
}
}, 1000)
}

function instalarRealtimeTemporadas(){
if(canalTemporadas) return
canalTemporadas = supabase
.channel("temporadas-admin")
.on("postgres_changes", { event: "*", schema: "public", table: "temporadas" }, async () => {
temporadaActiva = await obtenerTemporadaActiva()
bonusesTemporada = await obtenerBonusesTemporada()
formularioTemporadaInicializado = false
actualizarVistaBonusAdmin()
})
.subscribe()
}

async function reiniciarSecuenciaTemporadasAdmin(){
const confirmacion = await promptAction("Esto reiniciara solo la secuencia automatica de temporadas a Temporada 1 y al primer nombre guardado. No borra rankings ni historial. Escribe REINICIAR para confirmar.", { title: "Reiniciar temporadas", danger: true })
if(confirmacion !== "REINICIAR") return

const nombres = obtenerNombresTemporadaConfigurados()
const primerNombre = nombres[0] || "Temporada actual"
const juego = obtenerJuegoBonusSeleccionado()
const multiplicador = Number(document.getElementById("bonusTemporadaSelect")?.value || temporadaActiva?.bonusXP || 1)
const duracionTipo = document.getElementById("temporadaDuracionTipo")?.value || temporadaActiva?.duracionTipo || "dias"
const duracionCantidad = Math.max(1, Math.trunc(Number(document.getElementById("temporadaDuracionCantidad")?.value || temporadaActiva?.duracionCantidad || 30)))

const rpc = await ejecutarRpcAdmin("admin_reiniciar_temporadas", {
p_nombre: primerNombre,
p_juego: juego,
p_multiplicador: multiplicador,
p_duracion_tipo: duracionTipo,
p_duracion_cantidad: duracionCantidad,
p_nombres_temporada: nombres,
})

if(rpc.ok){
temporadaActiva = await obtenerTemporadaActiva()
formularioTemporadaInicializado = false
await actualizarVistaBonusAdmin()
safeAlert("Secuencia de temporadas reiniciada.")
return
}

const inicio = new Date().toISOString()
const temporada = construirTemporadaAdmin({
id: "temporada-1",
numero: 1,
nombre: primerNombre,
estado: "activa",
bonusJuego: juego,
bonusXP: multiplicador,
fechaInicio: inicio,
fechaFin: calcularFechaFin(inicio, duracionTipo, duracionCantidad),
duracionTipo,
duracionCantidad,
nombreIndice: 0,
nombres,
autoRotacion: true,
visual: {},
})
const resultado = await guardarTemporadaActiva(temporada)
temporadaActiva = resultado.temporada || temporada
formularioTemporadaInicializado = false
await actualizarVistaBonusAdmin()
safeAlert(resultado.ok
? "Secuencia de temporadas reiniciada."
: "Secuencia reiniciada localmente. Ejecuta el SQL actualizado para reinicio global.")
}

async function cargarEventoMonedasAdmin(){
rellenarSelectorBonusMonedas()
eventoMonedasActivo = await obtenerEventoMonedasActual()
formularioMonedasInicializado = false
actualizarVistaBonusMonedasAdmin()
instalarRealtimeBonusMonedas()
}

function rellenarSelectorBonusMonedas(){
const juegoSelect = document.getElementById("bonusMonedasJuegoSelect")
if(juegoSelect && !juegoSelect.options.length){
juegoSelect.innerHTML = JUEGOS_TEMPORADA
.map((juego) => `<option value="${juego.key}">${juego.label}</option>`)
.join("")
}

const multiplicadorSelect = document.getElementById("bonusMonedasMultiplicadorSelect")
if(multiplicadorSelect && !multiplicadorSelect.options.length){
multiplicadorSelect.innerHTML = BONUS_MONEDAS_VALORES
.map((valor) => `<option value="${valor.toFixed(1)}">${formatearMultiplicador(valor)}</option>`)
.join("")
}
}

function actualizarVistaBonusMonedasAdmin(){
const evento = eventoMonedasActivo || desactivarEventoMonedas()
const resumen = resumenEventoMonedas(evento)
const juegoSelect = document.getElementById("bonusMonedasJuegoSelect")
const multiplicadorSelect = document.getElementById("bonusMonedasMultiplicadorSelect")
const juegoActualEl = document.getElementById("bonusMonedasJuegoActual")
const actualEl = document.getElementById("bonusMonedasActual")
const countdownEl = document.getElementById("bonusMonedasCountdown")
const estadoEl = document.getElementById("bonusMonedasEstado")
const subtituloEl = document.getElementById("bonusMonedasSubtitulo")

if(!formularioMonedasInicializado){
if(juegoSelect) juegoSelect.value = evento.juego || "sudoku"
if(multiplicadorSelect) multiplicadorSelect.value = Number(eventoEstaActivo(evento) ? evento.multiplicador : 1.5).toFixed(1)
formularioMonedasInicializado = true
}

if(juegoActualEl) setCleanText(juegoActualEl, "Juego con bonus: " + resumen.juegoTexto)
if(actualEl) setCleanText(actualEl, resumen.multiplicadorTexto)
if(countdownEl) setCleanText(countdownEl, resumen.activo ? "Finaliza en " + tiempoRestanteEventoMonedas(evento) : "Sin evento activo")
if(estadoEl){
setCleanText(estadoEl, resumen.activo ? "Evento activo - bonus aplicado a monedas" : "Bonus monedas inactivo")
estadoEl.classList.toggle("highlight", resumen.activo)
}
if(subtituloEl){
setCleanText(subtituloEl, resumen.activo
? `${resumen.juegoTexto} con ${resumen.multiplicadorTexto} monedas.`
: "Multiplicador temporal para recompensas de monedas.")
}

reiniciarTimerBonusMonedas()
}

function reiniciarTimerBonusMonedas(){
if(bonusMonedasTimer){
clearInterval(bonusMonedasTimer)
bonusMonedasTimer = null
}
if(!eventoEstaActivo(eventoMonedasActivo)) return

bonusMonedasTimer = setInterval(() => {
if(!eventoEstaActivo(eventoMonedasActivo)){
clearInterval(bonusMonedasTimer)
bonusMonedasTimer = null
eventoMonedasActivo = desactivarEventoMonedas(eventoMonedasActivo)
actualizarVistaBonusMonedasAdmin()
return
}
const countdownEl = document.getElementById("bonusMonedasCountdown")
if(countdownEl) setCleanText(countdownEl, "Finaliza en " + tiempoRestanteEventoMonedas(eventoMonedasActivo))
}, 30000)
}

async function guardarEventoMonedasAdmin(){
const juego = document.getElementById("bonusMonedasJuegoSelect")?.value || "sudoku"
const multiplicador = Number(document.getElementById("bonusMonedasMultiplicadorSelect")?.value || 1.5)
const tipoDuracion = document.getElementById("bonusMonedasTipoDuracion")?.value || "horas"
const cantidad = Math.max(1, Math.trunc(Number(document.getElementById("bonusMonedasCantidad")?.value || 1)))
const evento = construirEventoMonedas({ juego, multiplicador, tipoDuracion, cantidad })

const rpc = await ejecutarRpcAdmin("admin_guardar_bonus_monedas_evento", {
p_juego: evento.juego,
p_multiplicador: evento.multiplicador,
p_fecha_inicio: evento.fechaInicio,
p_fecha_fin: evento.fechaFin,
p_activo: true,
})

if(rpc.ok){
eventoMonedasActivo = evento
formularioMonedasInicializado = false
actualizarVistaBonusMonedasAdmin()
safeAlert("Evento de monedas activado: " + etiquetaJuego(evento.juego) + " " + formatearMultiplicador(evento.multiplicador))
return
}

const resultado = await guardarEventoMonedas(evento)
eventoMonedasActivo = resultado.evento || evento
formularioMonedasInicializado = false
actualizarVistaBonusMonedasAdmin()
safeAlert(resultado.ok
? "Evento de monedas activado."
: "Evento guardado localmente. Ejecuta el SQL actualizado para persistencia global.")
}

async function desactivarEventoMonedasAdmin(){
const evento = desactivarEventoMonedas(eventoMonedasActivo)
const rpc = await ejecutarRpcAdmin("admin_guardar_bonus_monedas_evento", {
p_juego: evento.juego,
p_multiplicador: 1,
p_fecha_inicio: evento.fechaInicio || new Date().toISOString(),
p_fecha_fin: evento.fechaFin,
p_activo: false,
})

if(!rpc.ok){
await guardarEventoMonedas(evento)
}

eventoMonedasActivo = evento
formularioMonedasInicializado = false
actualizarVistaBonusMonedasAdmin()
safeAlert("Evento de monedas desactivado.")
}

function instalarRealtimeBonusMonedas(){
if(canalBonusMonedas) return
canalBonusMonedas = supabase
.channel("bonus-monedas-evento-admin")
.on("postgres_changes", { event: "*", schema: "public", table: "bonus_monedas_evento" }, async () => {
eventoMonedasActivo = await obtenerEventoMonedasActual()
formularioMonedasInicializado = false
actualizarVistaBonusMonedasAdmin()
})
.subscribe()
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
function inicializarCentroRecompensasAdmin(){
rellenarMontosRapidosAdmin()
rellenarBoostersAdmin()
rellenarCosmeticosAdmin()
actualizarControlesRecompensaAdmin()
actualizarResumenRegaloAdmin()
}

function rellenarMontosRapidosAdmin(){
const tipo = document.getElementById("rewardTypeSelect")?.value || "monedas"
const contenedor = document.getElementById("rewardQuickAmounts")
if(!contenedor) return
const presets = REWARD_AMOUNT_PRESETS[tipo] || REWARD_AMOUNT_PRESETS.monedas
if(!presets.includes(rewardAmountSeleccionado)) rewardAmountSeleccionado = presets[0]
contenedor.innerHTML = presets.map((cantidad) => `
  <button type="button" class="${cantidad === rewardAmountSeleccionado ? "active" : ""}" data-reward-amount="${cantidad}">${formatearNumeroAdmin(cantidad)}</button>
`).join("")
contenedor.querySelectorAll("[data-reward-amount]").forEach((button) => {
button.addEventListener("click", () => {
rewardAmountSeleccionado = Number(button.dataset.rewardAmount || 0)
const custom = document.getElementById("rewardCustomAmount")
if(custom) custom.value = ""
rellenarMontosRapidosAdmin()
actualizarResumenRegaloAdmin()
})
})
}

function rellenarBoostersAdmin(){
const select = document.getElementById("rewardBoosterMultiplier")
if(select && !select.options.length){
select.innerHTML = Array.from({ length: 24 }, (_, index) => {
const valor = (12 + index) / 10
return `<option value="${valor.toFixed(1)}">x${valor.toFixed(1)}</option>`
}).join("")
select.value = "1.5"
}
}

function rellenarCosmeticosAdmin(){
const rarezaSelect = document.getElementById("rewardCosmeticRarity")
if(rarezaSelect && !rarezaSelect.options.length){
rarezaSelect.innerHTML = ORDEN_RAREZAS_TIENDA.map((rareza) => `<option value="${escapeHtml(rareza)}">${escapeHtml(rarezaEtiqueta(rareza))}</option>`).join("")
}
actualizarCosmeticosPorTipoAdmin()
}

function actualizarCosmeticosPorTipoAdmin(){
const tipo = document.getElementById("rewardTypeSelect")?.value || "fondo"
const rareza = document.getElementById("rewardCosmeticRarity")?.value || "Normal"
const select = document.getElementById("rewardCosmeticSelect")
if(!select) return
const cosmeticos = COSMETICOS.filter((item) => item.tipo === tipo && item.rareza === rareza)
select.innerHTML = cosmeticos.length
? cosmeticos.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)}</option>`).join("")
: '<option value="">Sin cosmeticos disponibles</option>'
}

async function buscarUsuariosRegaloAdmin(){
const query = cleanText(document.getElementById("rewardUserSearch")?.value || "", "").trim()
const lista = document.getElementById("rewardUserResults")
if(!lista) return
if(query.length < 2){
lista.innerHTML = '<div class="export-note">Escribe al menos 2 caracteres.</div>'
return
}
lista.innerHTML = '<div class="export-note">Buscando usuarios...</div>'
const { data, error } = await supabase
.from("usuarios")
.select("usuario")
.ilike("usuario", `%${query}%`)
.order("usuario", { ascending: true })
.limit(12)

if(error){
lista.innerHTML = '<div class="export-note">No se pudieron buscar usuarios.</div>'
return
}
if(!data?.length){
lista.innerHTML = '<div class="export-note">No existe un usuario con ese nombre.</div>'
return
}
lista.innerHTML = data.map((row) => `
  <button type="button" class="reward-user-option${row.usuario === rewardUserSeleccionado ? " active" : ""}" data-reward-user="${escapeHtml(row.usuario)}">
    <strong>${escapeHtml(row.usuario)}</strong>
    <span>Usuario registrado</span>
  </button>
`).join("")
lista.querySelectorAll("[data-reward-user]").forEach((button) => {
button.addEventListener("click", () => {
rewardUserSeleccionado = button.dataset.rewardUser || ""
buscarUsuariosRegaloAdmin()
actualizarResumenRegaloAdmin()
})
})
}

function actualizarControlesRecompensaAdmin(){
const tipo = document.getElementById("rewardTypeSelect")?.value || "monedas"
const esMonto = tipo === "monedas" || tipo === "experiencia"
const esBooster = tipo === "booster_xp" || tipo === "booster_monedas"
const esCosmetico = REWARD_COSMETIC_TYPES.includes(tipo)
const esEspecial = tipo === "especial"
const amount = document.getElementById("rewardAmountControls")
const booster = document.getElementById("rewardBoosterControls")
const cosmetic = document.getElementById("rewardCosmeticControls")
const special = document.getElementById("rewardSpecialControls")
if(amount) amount.hidden = !esMonto
if(booster) booster.hidden = !esBooster
if(cosmetic) cosmetic.hidden = !esCosmetico
if(special) special.hidden = !esEspecial
rellenarMontosRapidosAdmin()
if(esCosmetico) actualizarCosmeticosPorTipoAdmin()
actualizarResumenRegaloAdmin()
}

function obtenerPayloadRegaloAdmin(){
const tipo = document.getElementById("rewardTypeSelect")?.value || "monedas"
const custom = Number(document.getElementById("rewardCustomAmount")?.value || 0)
const cantidad = Math.trunc(custom > 0 ? custom : rewardAmountSeleccionado)
const multiplicador = Number(document.getElementById("rewardBoosterMultiplier")?.value || 1.5)
const duracionTipo = document.getElementById("rewardBoosterDurationType")?.value || "horas"
const duracionCantidad = Math.trunc(Number(document.getElementById("rewardBoosterDurationAmount")?.value || 1))
const cosmeticoId = document.getElementById("rewardCosmeticSelect")?.value || ""
const cosmetico = COSMETICOS.find((item) => item.id === cosmeticoId)
const especialNombre = cleanText(document.getElementById("rewardSpecialName")?.value || "Recompensa especial", "Recompensa especial")
const especialDetalle = cleanText(document.getElementById("rewardSpecialDetail")?.value || "", "")
return { tipo, usuario: rewardUserSeleccionado, cantidad, multiplicador, duracionTipo, duracionCantidad, cosmetico, especialNombre, especialDetalle }
}

function validarPayloadRegaloAdmin(payload){
if(!payload.usuario) return "Selecciona un usuario existente."
if(!REWARD_TYPES[payload.tipo]) return "Tipo de recompensa invalido."
if(payload.tipo === "monedas" && (!Number.isFinite(payload.cantidad) || payload.cantidad <= 0 || payload.cantidad > 10000000)) return "La cantidad debe estar entre 1 y 10,000,000."
if(payload.tipo === "experiencia" && (!Number.isFinite(payload.cantidad) || payload.cantidad <= 0 || payload.cantidad > 100000)) return "La experiencia debe estar entre 1 y 100,000."
if(["booster_xp", "booster_monedas"].includes(payload.tipo)){
if(payload.multiplicador < 1.2 || payload.multiplicador > 3.5) return "El multiplicador debe estar entre x1.2 y x3.5."
if(!["horas", "dias"].includes(payload.duracionTipo) || payload.duracionCantidad < 1 || payload.duracionCantidad > 365) return "La duracion debe ser valida."
}
if(REWARD_COSMETIC_TYPES.includes(payload.tipo) && (!payload.cosmetico || payload.cosmetico.tipo !== payload.tipo)) return "Selecciona un cosmetico valido."
if(payload.tipo === "especial" && !payload.especialNombre) return "Escribe un nombre para la recompensa especial."
return ""
}

function resumenPayloadRegaloAdmin(payload){
if(!payload.usuario) return "Selecciona usuario y recompensa."
if(payload.tipo === "monedas") return `${payload.usuario} recibira ${formatearNumeroAdmin(payload.cantidad)} monedas.`
if(payload.tipo === "experiencia") return `${payload.usuario} recibira ${formatearNumeroAdmin(payload.cantidad)} XP y se recalcularan niveles, rangos y desbloqueos.`
if(payload.tipo === "booster_xp" || payload.tipo === "booster_monedas"){
const ms = payload.duracionCantidad * (payload.duracionTipo === "dias" ? 86400000 : 3600000)
return `${payload.usuario} recibira ${REWARD_TYPES[payload.tipo]} x${payload.multiplicador.toFixed(1)} por ${tiempoRestante(new Date(Date.now() + ms).toISOString())}.`
}
if(REWARD_COSMETIC_TYPES.includes(payload.tipo)) return `${payload.usuario} recibira ${payload.cosmetico?.nombre || "cosmetico"} permanentemente.`
return `${payload.usuario} recibira ${payload.especialNombre}.`
}

function actualizarResumenRegaloAdmin(){
const box = document.getElementById("rewardSummaryBox")
if(!box) return
const payload = obtenerPayloadRegaloAdmin()
const error = validarPayloadRegaloAdmin(payload)
setCleanText(box, error || resumenPayloadRegaloAdmin(payload))
}

async function confirmarRegaloAdmin(){
const payload = obtenerPayloadRegaloAdmin()
const error = validarPayloadRegaloAdmin(payload)
if(error){
safeAlert(error)
return
}
const ok = await confirmAction(resumenPayloadRegaloAdmin(payload), { title: "Confirmar recompensa", acceptText: "Enviar", cancelText: "Cancelar", danger: false })
if(!ok) return
const rpc = await ejecutarRpcAdminObjeto("admin_otorgar_recompensa", {
p_usuario: payload.usuario,
p_tipo: payload.tipo,
p_cantidad: ["monedas", "experiencia"].includes(payload.tipo) ? payload.cantidad : null,
p_multiplicador: ["booster_xp", "booster_monedas"].includes(payload.tipo) ? payload.multiplicador : null,
p_duracion_tipo: payload.duracionTipo,
p_duracion_cantidad: ["booster_xp", "booster_monedas"].includes(payload.tipo) ? payload.duracionCantidad : null,
p_item_id: payload.cosmetico?.id || null,
p_item_tipo: payload.cosmetico?.tipo || null,
p_item_rareza: payload.cosmetico?.rareza || null,
p_item_nombre: payload.tipo === "especial" ? payload.especialNombre : (payload.cosmetico?.nombre || null),
p_detalle: { nombre: payload.especialNombre, detalle: payload.especialDetalle, cosmetico: payload.cosmetico ? { id: payload.cosmetico.id, nombre: payload.cosmetico.nombre, tipo: payload.cosmetico.tipo, rareza: payload.cosmetico.rareza } : null },
})
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo enviar la recompensa."))
return
}
safeAlert("Recompensa enviada correctamente.")
await cargarHistorialRegalosAdmin()
}

function limpiarRegaloAdmin(){
rewardUserSeleccionado = null
rewardAmountSeleccionado = 100
const search = document.getElementById("rewardUserSearch")
const custom = document.getElementById("rewardCustomAmount")
if(search) search.value = ""
if(custom) custom.value = ""
inicializarCentroRecompensasAdmin()
const lista = document.getElementById("rewardUserResults")
if(lista) lista.innerHTML = '<div class="export-note">Busca un usuario para seleccionarlo.</div>'
}

async function cargarHistorialRegalosAdmin(){
const list = document.getElementById("rewardHistoryList")
if(!list) return
list.innerHTML = '<div class="export-note">Cargando historial...</div>'
const { data, error } = await supabase
.from("admin_recompensas_historial")
.select("usuario_id,tipo,cantidad,multiplicador,item_nombre,admin_id,created_at")
.order("created_at", { ascending: false })
.limit(18)

if(error){
list.innerHTML = '<div class="export-note">No se pudo cargar el historial. Ejecuta la migracion SQL si falta la tabla.</div>'
return
}
if(!data?.length){
list.innerHTML = '<div class="export-note">Aun no hay recompensas enviadas.</div>'
return
}
list.innerHTML = data.map((row) => {
const principal = row.tipo === "monedas" || row.tipo === "experiencia"
? `${formatearNumeroAdmin(row.cantidad)} ${row.tipo === "monedas" ? "monedas" : "XP"}`
: row.tipo?.startsWith("booster")
? `${REWARD_TYPES[row.tipo] || row.tipo} x${Number(row.multiplicador || 1).toFixed(1)}`
: row.item_nombre || REWARD_TYPES[row.tipo] || row.tipo
return `
  <div class="reward-history-row">
    <strong>${escapeHtml(row.usuario_id)} - ${escapeHtml(principal)}</strong>
    <span>${escapeHtml(row.admin_id || "admin")} | ${new Date(row.created_at).toLocaleString("es-CO")}</span>
  </div>
`
}).join("")
}

function escucharHistorialRegalosAdmin(){
if(rewardHistoryChannel) return
rewardHistoryChannel = supabase
.channel("admin-recompensas-historial")
.on("postgres_changes", { event: "*", schema: "public", table: "admin_recompensas_historial" }, () => {
cargarHistorialRegalosAdmin()
})
.subscribe()
}

async function cargarProductosTiendaAdmin(){
const lista = document.getElementById("storeProductsList")
const huecos = document.getElementById("storeNoRotationList")
const resumen = document.getElementById("storeAdminSummary")
if(lista) lista.innerHTML = '<div class="export-note">Cargando productos...</div>'
const rpc = await ejecutarRpcAdminObjeto("admin_listar_tienda_productos", { p_limite: 180 })
if(!rpc.ok || rpc.data?.ok === false){
const mensaje = errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo cargar el catalogo de tienda.")
if(lista) lista.innerHTML = `<div class="export-note">${escapeHtml(mensaje)}</div>`
if(resumen) setCleanText(resumen, mensaje)
return
}

storeProductsCache = Array.isArray(rpc.data.productos) ? rpc.data.productos : []
const sinRotacion = Array.isArray(rpc.data.sinRotacion) ? rpc.data.sinRotacion : []
if(resumen){
const activos = storeProductsCache.filter((item) => item.activo).length
const vendibles = storeProductsCache.filter((item) => item.vendible).length
setCleanText(resumen, `${storeProductsCache.length} productos recientes. ${activos} activos, ${vendibles} vendibles.`)
}
if(huecos){
huecos.innerHTML = sinRotacion.length
? sinRotacion.map((item) => `
  <div class="reward-history-row">
    <strong>${escapeHtml(item.familia)} - ${escapeHtml(item.rareza || "Sin rareza")}</strong>
    <span>${formatearNumeroAdmin(item.cantidad)} productos vendibles fuera de rotacion activa</span>
  </div>
`).join("")
: '<div class="export-note">No hay productos vendibles fuera de rotacion activa.</div>'
}
if(lista){
lista.innerHTML = storeProductsCache.length
? storeProductsCache.map((item) => `
  <div class="reward-history-row">
    <strong>${escapeHtml(item.slug)} ${item.en_rotacion ? "· rotando" : ""}</strong>
    <span>${escapeHtml(item.tipo)} / ${escapeHtml(item.familia)} / ${escapeHtml(item.rareza || "-")} · ${formatearNumeroAdmin(item.precio_monedas || 0)} monedas</span>
    <button class="ghost" type="button" data-store-edit="${escapeHtml(String(item.id))}">Editar</button>
  </div>
`).join("")
: '<div class="export-note">No hay productos registrados.</div>'
lista.querySelectorAll("[data-store-edit]").forEach((button) => {
button.addEventListener("click", () => editarProductoTiendaAdmin(Number(button.dataset.storeEdit || 0)))
})
}
}

function editarProductoTiendaAdmin(id){
const producto = storeProductsCache.find((item) => Number(item.id) === Number(id))
if(!producto) return
setValueAdmin("storeProductSlug", producto.slug)
setValueAdmin("storeProductType", producto.tipo)
setValueAdmin("storeProductFamily", producto.familia)
setValueAdmin("storeProductRarity", producto.rareza || "Normal")
setValueAdmin("storeProductName", producto.nombre)
setValueAdmin("storeProductDescription", producto.descripcion || "")
setValueAdmin("storeProductCoins", producto.precio_monedas ?? 0)
setValueAdmin("storeProductReal", producto.precio_real || "")
setValueAdmin("storeProductMetadata", JSON.stringify(producto.metadata || {}))
rellenarVisualProductoAdmin(producto.metadata?.visual || {})
setToggleAdmin("storeProductActiveBtn", producto.activo, "Activo", "Inactivo")
setToggleAdmin("storeProductSellableBtn", producto.vendible, "Vendible", "No vendible")
setToggleAdmin("storeProductPermanentBtn", producto.permanente, "Permanente", "Rotativo")
}

function limpiarProductoTiendaAdmin(){
setValueAdmin("storeProductSlug", "")
setValueAdmin("storeProductType", "cosmetico")
setValueAdmin("storeProductFamily", "fondo")
setValueAdmin("storeProductRarity", "Normal")
setValueAdmin("storeProductName", "")
setValueAdmin("storeProductDescription", "")
setValueAdmin("storeProductCoins", 2500)
setValueAdmin("storeProductReal", "$0.99")
setValueAdmin("storeProductMetadata", "{}")
rellenarVisualProductoAdmin({})
setToggleAdmin("storeProductActiveBtn", true, "Activo", "Inactivo")
setToggleAdmin("storeProductSellableBtn", true, "Vendible", "No vendible")
setToggleAdmin("storeProductPermanentBtn", false, "Permanente", "Rotativo")
}

async function guardarProductoTiendaAdmin(){
const metadataTexto = document.getElementById("storeProductMetadata")?.value || "{}"
let metadata = {}
try{
metadata = metadataTexto.trim() ? JSON.parse(metadataTexto) : {}
}catch{
safeAlert("Metadata debe ser JSON valido.")
return
}
metadata = aplicarVisualProductoAdmin(metadata)
const tipoProducto = document.getElementById("storeProductType")?.value || "cosmetico"
if(["booster_xp", "booster_monedas"].includes(tipoProducto)){
const multiplicador = Number(metadata.multiplicador)
const duracionMs = Number(metadata.duracion_ms)
if(!Number.isFinite(multiplicador) || multiplicador < 1.2 || multiplicador > 8 || !Number.isFinite(duracionMs) || duracionMs <= 0){
safeAlert('Para boosters, metadata debe incluir {"multiplicador":2,"duracion_ms":86400000}.')
return
}
}
const payload = {
p_slug: cleanText(document.getElementById("storeProductSlug")?.value || "").toLowerCase(),
p_tipo: tipoProducto,
p_familia: document.getElementById("storeProductFamily")?.value || "fondo",
p_rareza: document.getElementById("storeProductRarity")?.value || "Normal",
p_nombre: cleanText(document.getElementById("storeProductName")?.value || ""),
p_descripcion: cleanText(document.getElementById("storeProductDescription")?.value || ""),
p_precio_monedas: Math.max(0, Math.trunc(Number(document.getElementById("storeProductCoins")?.value || 0))),
p_precio_real: cleanText(document.getElementById("storeProductReal")?.value || ""),
p_activo: getToggleAdmin("storeProductActiveBtn"),
p_vendible: getToggleAdmin("storeProductSellableBtn"),
p_permanente: getToggleAdmin("storeProductPermanentBtn"),
p_metadata: metadata,
}
if(!payload.p_slug || !payload.p_nombre){
safeAlert("Slug y nombre son obligatorios.")
return
}
const rpc = await ejecutarRpcAdminObjeto("admin_guardar_tienda_producto", payload)
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo guardar el producto."))
return
}
safeAlert("Producto guardado.")
await cargarProductosTiendaAdmin()
}

async function forzarRotacionTiendaAdmin(){
const familia = document.getElementById("storeRotationFamily")?.value || null
const rareza = document.getElementById("storeRotationRarity")?.value || null
const ok = await confirmAction("Cerrar la rotacion activa y generar una nueva?", {
title: "Forzar rotacion",
acceptText: "Regenerar",
cancelText: "Cancelar",
danger: false,
})
if(!ok) return
const rpc = await ejecutarRpcAdminObjeto("admin_forzar_tienda_rotacion", {
p_familia: familia || null,
p_rareza: rareza || null,
})
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo forzar la rotacion."))
return
}
safeAlert(rpc.data?.mensaje || "Rotacion regenerada.")
await cargarProductosTiendaAdmin()
}

async function generarCatalogoMasivoAdmin(){
const ok = await confirmAction("Generar o actualizar 100 cosmeticos por rareza y familia con el formato nuevo?", {
title: "Catalogo masivo",
acceptText: "Generar",
cancelText: "Cancelar",
danger: false,
})
if(!ok) return
const rpc = await ejecutarRpcAdminObjeto("admin_generar_catalogo_cosmeticos", { p_por_rareza: 100 })
if(!rpc.ok || rpc.data?.ok === false){
safeAlert(errorMessage(rpc.error || rpc.data?.mensaje, "No se pudo generar el catalogo."))
return
}
safeAlert(`${rpc.data?.mensaje || "Catalogo generado."} Afectados: ${formatearNumeroAdmin(rpc.data?.afectados || 0)}.`)
await cargarProductosTiendaAdmin()
}

function setValueAdmin(id, value){
const el = document.getElementById(id)
if(el) el.value = value
}

function rellenarVisualProductoAdmin(visual = {}){
setValueAdmin("storeVisualPattern", visual.patron || "")
setValueAdmin("storeVisualHue", visual.hue ?? "")
setValueAdmin("storeVisualAccent", visual.accent ?? "")
setValueAdmin("storeVisualBrightness", visual.brillo ?? "")
setValueAdmin("storeVisualDepth", visual.profundidad ?? "")
}

function aplicarVisualProductoAdmin(metadata){
const visual = {}
const patron = document.getElementById("storeVisualPattern")?.value || ""
const hue = leerNumeroVisualAdmin("storeVisualHue", 0, 360)
const accent = leerNumeroVisualAdmin("storeVisualAccent", 0, 360)
const brillo = leerNumeroVisualAdmin("storeVisualBrightness", 1, 10)
const profundidad = leerNumeroVisualAdmin("storeVisualDepth", 1, 100)
if(patron) visual.patron = patron
if(hue !== null) visual.hue = hue
if(accent !== null) visual.accent = accent
if(brillo !== null) visual.brillo = brillo
if(profundidad !== null) visual.profundidad = profundidad
if(Object.keys(visual).length){
return { ...metadata, visual }
}
const limpio = { ...metadata }
delete limpio.visual
return limpio
}

function leerNumeroVisualAdmin(id, min, max){
const valor = document.getElementById(id)?.value
if(valor === "" || valor === null || valor === undefined) return null
const numero = Number(valor)
if(!Number.isFinite(numero)) return null
return Math.max(min, Math.min(max, numero))
}

function getToggleAdmin(id){
return document.getElementById(id)?.dataset.toggleValue === "true"
}

function setToggleAdmin(id, value, trueText, falseText){
const el = document.getElementById(id)
if(!el) return
const activo = Boolean(value)
el.dataset.toggleValue = activo ? "true" : "false"
setCleanText(el, activo ? trueText : falseText)
el.classList.toggle("success", activo)
}

function formatearNumeroAdmin(valor){
return Math.trunc(Number(valor) || 0).toLocaleString("es-CO")
}

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
window.reiniciarSecuenciaTemporadasAdmin = reiniciarSecuenciaTemporadasAdmin
window.guardarEventoMonedasAdmin = guardarEventoMonedasAdmin
window.desactivarEventoMonedasAdmin = desactivarEventoMonedasAdmin
window.exportarRankingActual = exportarRankingActual
window.exportarTablasRanking = exportarTablasRanking
window.exportarHistorialPartidas = exportarHistorialPartidas
window.cargarMiniTorneosAdmin = cargarMiniTorneosAdmin
window.finalizarMiniTorneoAdmin = finalizarMiniTorneoAdmin
window.borrarMiniTorneoAdmin = borrarMiniTorneoAdmin
window.cargarMembresiasVipAdmin = cargarMembresiasVipAdmin
window.guardarVipAdmin = guardarVipAdmin
window.cargarEventosVipAdmin = cargarEventosVipAdmin
window.guardarEventoVipAdmin = guardarEventoVipAdmin
window.limpiarEventoVipAdmin = limpiarEventoVipAdmin
window.editarEventoVipAdmin = editarEventoVipAdmin
window.cambiarEstadoEventoVipAdmin = cambiarEstadoEventoVipAdmin
window.eliminarEventoVipAdmin = eliminarEventoVipAdmin
window.cargarSalasBingoVipAdmin = cargarSalasBingoVipAdmin
window.crearSalaBingoVipAdmin = crearSalaBingoVipAdmin
window.cantarNumeroBingoVipAdmin = cantarNumeroBingoVipAdmin
window.alternarAutoBingoVipAdmin = alternarAutoBingoVipAdmin
window.finalizarSalaBingoVipAdmin = finalizarSalaBingoVipAdmin
window.borrarSalaBingoVipAdmin = borrarSalaBingoVipAdmin
window.cargarMinitorneosVipPrivadosAdmin = cargarMinitorneosVipPrivadosAdmin
window.guardarMinitorneoVipPrivadoAdmin = guardarMinitorneoVipPrivadoAdmin
window.limpiarMinitorneoVipPrivadoAdmin = limpiarMinitorneoVipPrivadoAdmin
window.editarMinitorneoVipPrivadoAdmin = editarMinitorneoVipPrivadoAdmin
window.prepararParticipanteVipPrivadoAdmin = prepararParticipanteVipPrivadoAdmin
window.guardarParticipanteVipPrivadoAdmin = guardarParticipanteVipPrivadoAdmin
window.cambiarEstadoMinitorneoVipPrivadoAdmin = cambiarEstadoMinitorneoVipPrivadoAdmin
window.finalizarMinitorneoVipPrivadoAdmin = finalizarMinitorneoVipPrivadoAdmin
window.confirmarRegaloAdmin = confirmarRegaloAdmin
window.limpiarRegaloAdmin = limpiarRegaloAdmin
window.cargarHistorialRegalosAdmin = cargarHistorialRegalosAdmin
window.cargarProductosTiendaAdmin = cargarProductosTiendaAdmin
window.guardarProductoTiendaAdmin = guardarProductoTiendaAdmin
window.limpiarProductoTiendaAdmin = limpiarProductoTiendaAdmin
window.forzarRotacionTiendaAdmin = forzarRotacionTiendaAdmin
window.generarCatalogoMasivoAdmin = generarCatalogoMasivoAdmin

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

limpiarEventoVipAdmin()

document.getElementById('bonusJuegoSelect')?.addEventListener('change', () => {
  actualizarVistaBonusAdmin()
})

document.getElementById('bonusTemporadaSelect')?.addEventListener('change', () => {
  actualizarVistaBonusAdmin()
})

document.getElementById('temporadaEstadoSelect')?.addEventListener('change', () => {
  actualizarVistaBonusAdmin()
})

document.getElementById('temporadaDuracionTipo')?.addEventListener('change', () => {
  formularioTemporadaInicializado = true
  actualizarVistaBonusAdmin()
})

document.getElementById('temporadaDuracionCantidad')?.addEventListener('input', () => {
  formularioTemporadaInicializado = true
  actualizarVistaBonusAdmin()
})

document.getElementById('bonusMonedasJuegoSelect')?.addEventListener('change', () => {
  formularioMonedasInicializado = true
})

document.getElementById('bonusMonedasMultiplicadorSelect')?.addEventListener('change', () => {
  formularioMonedasInicializado = true
})

document.getElementById('rewardUserSearch')?.addEventListener('input', () => {
buscarUsuariosRegaloAdmin()
actualizarResumenRegaloAdmin()
})

document.getElementById('rewardTypeSelect')?.addEventListener('change', () => {
actualizarControlesRecompensaAdmin()
})

document.getElementById('rewardCustomAmount')?.addEventListener('input', actualizarResumenRegaloAdmin)
document.getElementById('rewardBoosterMultiplier')?.addEventListener('change', actualizarResumenRegaloAdmin)
document.getElementById('rewardBoosterDurationType')?.addEventListener('change', actualizarResumenRegaloAdmin)
document.getElementById('rewardBoosterDurationAmount')?.addEventListener('input', actualizarResumenRegaloAdmin)
document.getElementById('rewardCosmeticRarity')?.addEventListener('change', () => {
actualizarCosmeticosPorTipoAdmin()
actualizarResumenRegaloAdmin()
})
document.getElementById('rewardCosmeticSelect')?.addEventListener('change', actualizarResumenRegaloAdmin)
document.getElementById('rewardSpecialName')?.addEventListener('input', actualizarResumenRegaloAdmin)
document.getElementById('rewardSpecialDetail')?.addEventListener('input', actualizarResumenRegaloAdmin)
;[
  ["storeProductActiveBtn", "Activo", "Inactivo"],
  ["storeProductSellableBtn", "Vendible", "No vendible"],
  ["storeProductPermanentBtn", "Permanente", "Rotativo"],
].forEach(([id, trueText, falseText]) => {
const button = document.getElementById(id)
if(!button) return
button.addEventListener("click", () => setToggleAdmin(id, !getToggleAdmin(id), trueText, falseText))
setToggleAdmin(id, getToggleAdmin(id), trueText, falseText)
})
document.getElementById('storeProductType')?.addEventListener('change', () => {
const tipo = document.getElementById('storeProductType')?.value || "cosmetico"
if(tipo === "booster_xp") setValueAdmin("storeProductFamily", "xp")
if(tipo === "booster_monedas") setValueAdmin("storeProductFamily", "monedas")
if(tipo === "vip") setValueAdmin("storeProductFamily", "vip")
const metadataActual = document.getElementById("storeProductMetadata")?.value.trim() || ""
if(tipo === "booster_xp" && (!metadataActual || metadataActual === "{}")) setValueAdmin("storeProductMetadata", '{"beneficio":"xp","multiplicador":2,"duracion_ms":86400000}')
if(tipo === "booster_monedas" && (!metadataActual || metadataActual === "{}")) setValueAdmin("storeProductMetadata", '{"beneficio":"monedas","multiplicador":2,"duracion_ms":86400000}')
})

syncNumcatchUI()
inicializarCentroRecompensasAdmin()
limpiarProductoTiendaAdmin()
rellenarSelectorBonus()
rellenarSelectorBonusMonedas()
