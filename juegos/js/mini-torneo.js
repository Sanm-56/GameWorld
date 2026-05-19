import { installSafeAlert } from "./mensajes.js"
import { obtenerSnapshotBonusXP } from "./experiencia-temporada.js"

installSafeAlert()

export function esMiniTorneo(juego) {
  return localStorage.getItem("solitario_origen") === "sala"
    && localStorage.getItem("solitario_sala_id")
    && localStorage.getItem("solitario_juego") === juego
}

const DURACION_JUEGO_MS = 10 * 60 * 1000
const LANZAMIENTO_JUEGO_KEY = "solitario_game_launch"
const ORIGENES_LANZAMIENTO_VALIDOS = ["torneo", "sala", "nivel"]
const ESTADOS_TERMINALES_TORNEO = ["finalizado", "eliminado", "descalificado", "perdido"]

export function esNivelSolitario(juego) {
  const context = leerContextoNivel()
  return localStorage.getItem("solitario_origen") === "nivel"
    && context
    && context.game === juego
}

export function redirigirFinalNivelSolitario() {
  const juego = localStorage.getItem("juego_actual") || localStorage.getItem("solitario_juego")
  if (!esNivelSolitario(juego)) return false
  window.location.replace("../../solitario/final-nivel.html")
  return true
}

export function obtenerOrigenExperiencia(juego) {
  if (esNivelSolitario(juego)) return "solitario"
  if (esMiniTorneo(juego)) return "minitorneo"
  return "torneo"
}

export async function obtenerInicioTorneo(supabase, juego) {
  if (esMiniTorneo(juego)) {
    await obtenerSnapshotBonusXP(juego, "minitorneo")
    const salaId = localStorage.getItem("solitario_sala_id")
    const usuario = localStorage.getItem("usuario")
    if (!usuario) return null

    const { data } = await supabase
      .from("salas")
      .select("estado,juego,inicio_torneo,created_at")
      .eq("id", salaId)
      .maybeSingle()

    if (data?.estado !== "en_juego" || data?.juego !== juego) return null

    const { data: participante } = await supabase
      .from("sala_jugadores")
      .select("id")
      .eq("sala_id", salaId)
      .eq("usuario_id", usuario)
      .maybeSingle()

    if (!participante) return null
    return inicioSeguroParaSolitario(juego, "sala", data.inicio_torneo || data.created_at)
  }

  if (esNivelSolitario(juego)) {
    await obtenerSnapshotBonusXP(juego, "solitario")
    return inicioSeguroParaSolitario(juego, "nivel", leerContextoNivel()?.startedAt)
  }

  await obtenerSnapshotBonusXP(juego, "torneo")

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado,juego_actual,inicio_torneo")
    .eq("id", 1)
    .single()

  if (data?.estado !== "iniciado" || data?.juego_actual !== juego) return null
  return data?.inicio_torneo || null
}

export function marcarLanzamientoJuego(juego, origin = "torneo") {
  const origenSeguro = ORIGENES_LANZAMIENTO_VALIDOS.includes(origin) ? origin : "torneo"
  if (origenSeguro === "torneo") limpiarContextoSolitario()
  localStorage.setItem(LANZAMIENTO_JUEGO_KEY, JSON.stringify({
    game: juego,
    origin: origenSeguro,
    launchedAt: new Date().toISOString(),
  }))
}

export function lanzamientoJuegoValido(juego, origin = null) {
  const lanzamiento = leerContextoLanzamiento()
  const lanzamientoMs = Date.parse(lanzamiento?.launchedAt)
  const origenValido = origin ? lanzamiento?.origin === origin : ORIGENES_LANZAMIENTO_VALIDOS.includes(lanzamiento?.origin)

  return Boolean(
    lanzamiento
      && lanzamiento.game === juego
      && origenValido
      && Number.isFinite(lanzamientoMs)
      && Date.now() - lanzamientoMs < DURACION_JUEGO_MS
  )
}

export async function validarAccesoJuego(supabase, juego) {
  if (!localStorage.getItem("usuario")) {
    window.location.replace("index.html")
    return false
  }

  const lanzamiento = leerContextoLanzamiento()
  const origin = lanzamiento?.origin === "torneo"
    ? "torneo"
    : esNivelSolitario(juego)
      ? "nivel"
      : esMiniTorneo(juego)
        ? "sala"
        : "torneo"

  if (origin === "torneo") limpiarContextoSolitario()

  if (!lanzamientoJuegoValido(juego, origin)) {
    window.location.replace(salidaTorneoUrl())
    return false
  }

  const inicio = await obtenerInicioTorneo(supabase, juego)
  if (!inicio) {
    window.location.replace(salidaTorneoUrl())
    return false
  }

  if (origin === "torneo" && await jugadorTieneCierreTorneo(supabase, juego, inicio)) {
    marcarBloqueoLanzamientoTorneo(juego, inicio)
    window.location.replace("lobby.html")
    return false
  }

  if (origin === "torneo") {
    marcarSesionTorneoActiva(juego, inicio)
    instalarMarcadoAbandonoTorneo(juego, inicio)
  }

  return true
}

export function marcarCierreTorneoLocal(juego, estado = "finalizado", motivo = "") {
  const lanzamiento = leerContextoLanzamiento()
  if (lanzamiento?.origin !== "torneo") return

  const inicio = localStorage.getItem(`torneo_inicio_actual_${juego}`) || lanzamiento.launchedAt
  const key = obtenerClaveEstadoTorneo(juego, inicio)
  localStorage.setItem(key, JSON.stringify({
    juego,
    estado,
    motivo,
    inicio,
    fecha: new Date().toISOString(),
  }))
}

export function torneoBloqueadoLocalmente(juego, inicio) {
  const key = `torneo_bloqueado_${juego}`
  const bloqueo = leerJsonLocalStorage(key)
  const inicioMs = Date.parse(inicio)
  if (!Number.isFinite(inicioMs)) return false

  if (!bloqueo || typeof bloqueo !== "object") {
    localStorage.removeItem(key)
    return false
  }

  return bloqueo.inicio === String(inicioMs) && bloqueo.version === 2
}

export async function obtenerTiempoRestanteTorneo(supabase, juego, duracionSegundos) {
  const inicioTorneo = await obtenerInicioTorneo(supabase, juego)
  if (!inicioTorneo) return null

  const { data: horaServer, error } = await supabase.rpc("ahora_servidor")
  if (error) {
    console.warn(`[Solitario] No se pudo leer hora del servidor para ${juego}; usando reloj local.`, error)
  }

  const inicio = Date.parse(inicioTorneo)
  const ahoraServidor = Date.parse(horaServer)
  const ahora = Number.isFinite(ahoraServidor) ? ahoraServidor : Date.now()
  let restante = Math.floor((inicio + Number(duracionSegundos || 0) * 1000 - ahora) / 1000)

  if (!Number.isFinite(restante) || restante > duracionSegundos) return duracionSegundos
  if (restante < 0) return 0
  return restante
}

export async function obtenerTiempoTranscurridoTorneo(supabase, juego, duracionSegundos = null) {
  const inicioTorneo = await obtenerInicioTorneo(supabase, juego)
  if (!inicioTorneo) return null

  const { data: horaServer, error } = await supabase.rpc("ahora_servidor")
  if (error) {
    console.warn(`[Solitario] No se pudo leer hora del servidor para ${juego}; usando reloj local.`, error)
  }

  const inicio = Date.parse(inicioTorneo)
  const ahoraServidor = Date.parse(horaServer)
  const ahora = Number.isFinite(ahoraServidor) ? ahoraServidor : Date.now()
  const transcurrido = Math.floor((ahora - inicio) / 1000)

  if (!Number.isFinite(transcurrido)) return null
  const seguro = Math.max(0, transcurrido)
  return Number.isFinite(Number(duracionSegundos))
    ? Math.min(Number(duracionSegundos), seguro)
    : seguro
}

export async function debeSalirDelTorneo(supabase, juego) {
  if (esMiniTorneo(juego)) {
    const salaId = localStorage.getItem("solitario_sala_id")
    const usuario = localStorage.getItem("usuario")
    const { data } = await supabase
      .from("salas")
      .select("estado,juego")
      .eq("id", salaId)
      .maybeSingle()

    if (!data || data.juego !== juego || data.estado === "finalizado") return true

    const { data: participante } = await supabase
      .from("sala_jugadores")
      .select("id")
      .eq("sala_id", salaId)
      .eq("usuario_id", usuario)
      .maybeSingle()

    return !participante
  }

  if (esNivelSolitario(juego)) return false

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado,juego_actual")
    .eq("id", 1)
    .single()

  return data?.estado !== "iniciado" || data?.juego_actual !== juego
}

export function bloquearFinalizacionInicialSolitario(juego, motivo = "finalizacion inicial") {
  const lanzamiento = leerContextoLanzamiento()
  const lanzamientoMs = Date.parse(lanzamiento?.launchedAt)
  const reciente = lanzamiento
    && lanzamiento.game === juego
    && ["nivel", "sala"].includes(lanzamiento.origin)
    && Number.isFinite(lanzamientoMs)
    && Date.now() - lanzamientoMs < 5000

  if (!reciente) return false

  const detalle = {
    juego,
    motivo,
    origin: lanzamiento.origin,
    launchedAt: lanzamiento.launchedAt,
    blockedAt: new Date().toISOString(),
  }
  localStorage.setItem("solitario_last_blocked_finish", JSON.stringify(detalle))
  console.warn("[Solitario] Finalizacion automatica bloqueada al iniciar juego.", detalle)
  return true
}

export function salidaTorneoUrl() {
  const lanzamiento = leerContextoLanzamiento()
  if (lanzamiento?.origin === "torneo") return "lobby.html"

  if (esNivelSolitario(localStorage.getItem("solitario_juego"))) {
    return "../../solitario/solitario.html"
  }

  return esMiniTorneo(localStorage.getItem("solitario_juego"))
    ? "../../solitario/solitario.html"
    : "lobby.html"
}

export async function volverDesdeFinal(supabase, limpiar = () => {}) {
  const juego = localStorage.getItem("juego_actual") || localStorage.getItem("solitario_juego")

  if (esNivelSolitario(juego)) {
    limpiar()
    limpiarContextoNivel()
    localStorage.removeItem("juego_actual")
    window.location.href = "../../solitario/solitario.html"
    return
  }

  if (esMiniTorneo(juego)) {
    limpiar()
    localStorage.removeItem("juego_actual")
    window.location.href = "../../solitario/solitario.html"
    return
  }

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  if (data?.estado !== "espera") {
    alert("Torneo aun activo")
    return
  }

  limpiar()
  localStorage.removeItem("juego_actual")
  window.location.href = "lobby.html"
}

export async function registrarPuntosMiniTorneo(supabase, juego, puntos) {
  if (!esMiniTorneo(juego)) return

  const salaId = localStorage.getItem("solitario_sala_id")
  const usuario = localStorage.getItem("usuario")
  const puntosSeguros = Math.max(0, Number(puntos || 0))

  if (!salaId || !usuario) return

  const sala = await supabase
    .from("salas")
    .select("id,estado,juego")
    .eq("id", salaId)
    .maybeSingle()

  if (sala.error) {
    console.warn(`[Solitario] No se pudo validar mini torneo para ${juego}.`, sala.error)
    return
  }

  if (!sala.data || sala.data.estado === "finalizado" || sala.data.juego !== juego) {
    limpiarContextoMiniTorneo()
    return
  }

  const jugadores = await supabase
    .from("sala_jugadores")
    .update({ puntos: puntosSeguros, usuario })
    .eq("sala_id", salaId)
    .eq("usuario_id", usuario)
    .select("id")

  if (jugadores.error) {
    console.warn(`[Solitario] No se pudieron registrar puntos del mini torneo para ${juego}.`, jugadores.error)
    return
  }

  if (!jugadores.data?.length) {
    console.warn(`[Solitario] El jugador no estaba asociado a la sala ${salaId}; no se registran puntos huerfanos.`)
    return
  }

  const resultado = await supabase
    .from("solitario_resultados")
    .insert([{
      usuario_id: usuario,
      usuario,
      puntos: puntosSeguros,
      victoria: false,
      sala_id: salaId,
      origen: "sala",
      juego,
    }])

  if (resultado.error) {
    console.warn(`[Solitario] No se pudo guardar resultado de mini torneo para ${juego}.`, resultado.error)
  }
}

function leerContextoNivel() {
  try {
    return JSON.parse(localStorage.getItem("solitario_nivel_context") || "null")
  } catch {
    return null
  }
}

function leerContextoLanzamiento() {
  try {
    return JSON.parse(localStorage.getItem(LANZAMIENTO_JUEGO_KEY) || "null")
  } catch {
    return null
  }
}

function inicioSeguroParaSolitario(juego, origen, inicioPreferido) {
  const ahora = Date.now()
  const lanzamiento = leerContextoLanzamiento()
  const inicioMs = Date.parse(inicioPreferido)
  const lanzamientoMs = Date.parse(lanzamiento?.launchedAt)
  const lanzamientoValido = lanzamiento
    && lanzamiento.game === juego
    && lanzamiento.origin === origen
    && Number.isFinite(lanzamientoMs)
    && lanzamientoMs <= ahora
    && ahora - lanzamientoMs < DURACION_JUEGO_MS

  if (!Number.isFinite(inicioMs) || inicioMs > ahora || ahora - inicioMs >= DURACION_JUEGO_MS) {
    const fallback = lanzamientoValido ? lanzamiento.launchedAt : new Date().toISOString()
    console.warn(`[Solitario] Inicio invalido o vencido para ${juego}/${origen}; usando inicio local.`, {
      inicioPreferido,
      fallback,
    })
    return fallback
  }

  return inicioPreferido
}

function limpiarContextoNivel() {
  localStorage.removeItem("solitario_nivel_context")
  localStorage.removeItem("solitario_game_launch")
  if (localStorage.getItem("solitario_origen") === "nivel") {
    localStorage.removeItem("solitario_origen")
    localStorage.removeItem("solitario_juego")
  }
}

function limpiarContextoMiniTorneo() {
  localStorage.removeItem("solitario_sala_id")
  localStorage.removeItem("solitario_sala_codigo")
  localStorage.removeItem("solitario_juego")
  localStorage.removeItem("solitario_origen")
  localStorage.removeItem("solitario_game_launch")
}

function limpiarContextoSolitario() {
  localStorage.removeItem("solitario_sala_id")
  localStorage.removeItem("solitario_sala_codigo")
  localStorage.removeItem("solitario_juego")
  localStorage.removeItem("solitario_origen")
  localStorage.removeItem("solitario_nivel_context")
}

function obtenerClaveEstadoTorneo(juego, inicio) {
  const inicioMs = Date.parse(inicio)
  const sufijo = Number.isFinite(inicioMs) ? String(inicioMs) : "actual"
  return `torneo_estado_${juego}_${sufijo}`
}

function leerEstadoTorneoLocal(juego, inicio) {
  try {
    return JSON.parse(localStorage.getItem(obtenerClaveEstadoTorneo(juego, inicio)) || "null")
  } catch {
    return null
  }
}

function marcarSesionTorneoActiva(juego, inicio) {
  const key = obtenerClaveEstadoTorneo(juego, inicio)
  const actual = leerEstadoTorneoLocal(juego, inicio)
  if (ESTADOS_TERMINALES_TORNEO.includes(actual?.estado)) return

  localStorage.setItem(`torneo_inicio_actual_${juego}`, inicio)
  localStorage.removeItem(`torneo_bloqueado_${juego}`)
  localStorage.setItem(key, JSON.stringify({
    juego,
    estado: "activo",
    inicio,
    fecha: new Date().toISOString(),
  }))
}

function marcarBloqueoLanzamientoTorneo(juego, inicio) {
  const inicioMs = Date.parse(inicio)
  if (Number.isFinite(inicioMs)) {
    localStorage.setItem(`torneo_bloqueado_${juego}`, JSON.stringify({
      inicio: String(inicioMs),
      version: 2,
      fecha: new Date().toISOString(),
    }))
  }
}

function instalarMarcadoAbandonoTorneo(juego, inicio) {
  const flag = `torneo_abandono_listener_${juego}`
  if (window[flag]) return
  window[flag] = true

  window.addEventListener("pagehide", () => {
    const actual = leerEstadoTorneoLocal(juego, inicio)
    if (ESTADOS_TERMINALES_TORNEO.includes(actual?.estado)) return

    localStorage.setItem(obtenerClaveEstadoTorneo(juego, inicio), JSON.stringify({
      juego,
      estado: "salida_detectada",
      motivo: "Salida antes de finalizar",
      inicio,
      fecha: new Date().toISOString(),
    }))
  })
}

function leerJsonLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null")
  } catch {
    return null
  }
}

async function jugadorTieneCierreTorneo(supabase, juego, inicio) {
  const estadoLocal = leerEstadoTorneoLocal(juego, inicio)
  if (ESTADOS_TERMINALES_TORNEO.includes(estadoLocal?.estado)) return true

  const usuario = localStorage.getItem("usuario")
  if (!usuario) return false

  const { data, error } = await supabase
    .from("ranking")
    .select("usuario,fecha,invalido,motivo")
    .eq("usuario", usuario)
    .eq("juego", juego)
    .maybeSingle()

  if (error) {
    console.warn(`[Torneo] No se pudo validar reingreso para ${juego}.`, error)
    return false
  }

  if (!data) return false

  const fechaResultado = Date.parse(data.fecha)
  const inicioMs = Date.parse(inicio)
  if (Number.isFinite(fechaResultado) && Number.isFinite(inicioMs)) {
    return fechaResultado >= inicioMs
  }

  return true
}
