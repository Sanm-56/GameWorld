import { installSafeAlert } from "./mensajes.js"
import { obtenerSnapshotBonusXP } from "./experiencia-temporada.js"
import { limpiarCandadosJuego } from "./game-lock.js"

installSafeAlert()

export function esMiniTorneo(juego) {
  return localStorage.getItem("solitario_origen") === "sala"
    && localStorage.getItem("solitario_sala_id")
    && localStorage.getItem("solitario_juego") === juego
}

const DURACION_JUEGO_MS = 10 * 60 * 1000
const LANZAMIENTO_JUEGO_KEY = "solitario_game_launch"
const ORIGENES_LANZAMIENTO_VALIDOS = ["torneo", "sala", "nivel", "historia"]

export function esNivelSolitario(juego) {
  const context = leerContextoNivel()
  return localStorage.getItem("solitario_origen") === "nivel"
    && context
    && context.game === juego
}

export function esModoHistoria(juego) {
  const lanzamiento = leerContextoLanzamiento()
  return lanzamiento?.origin === "historia" && lanzamiento?.game === juego && lanzamientoJuegoValido(juego, "historia")
}

export function redirigirFinalNivelSolitario() {
  const juego = localStorage.getItem("juego_actual") || localStorage.getItem("solitario_juego")
  if (esModoHistoria(juego)) return false
  if (!esNivelSolitario(juego)) return false
  window.location.replace("../../solitario/final-nivel.html")
  return true
}

export function obtenerOrigenExperiencia(juego) {
  if (esModoHistoria(juego)) return "historia"
  if (esNivelSolitario(juego)) return "solitario"
  if (esMiniTorneo(juego)) return "minitorneo"
  return "torneo"
}

export async function obtenerInicioTorneo(supabase, juego) {
  if (esModoHistoria(juego)) {
    return leerContextoLanzamiento()?.launchedAt || new Date().toISOString()
  }

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
  limpiarCandadosJuego(juego)
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
  const origin = lanzamiento?.origin === "historia"
    ? "historia"
    : lanzamiento?.origin === "torneo"
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

  if (origin === "sala" && await jugadorTieneResultadoMiniTorneo(supabase, juego, inicio)) {
    window.location.replace(salidaTorneoUrl())
    return false
  }

  return true
}

export async function obtenerTiempoRestanteTorneo(supabase, juego, duracionSegundos) {
  const reloj = await crearRelojTorneo(supabase, juego, duracionSegundos)
  if (!reloj) return null

  return reloj.restante()
}

export async function obtenerTiempoTranscurridoTorneo(supabase, juego, duracionSegundos = null) {
  const reloj = await crearRelojTorneo(supabase, juego, duracionSegundos)
  if (!reloj) return null

  return reloj.transcurrido()
}

export async function crearRelojTorneo(supabase, juego, duracionSegundos) {
  const inicioTorneo = await obtenerInicioTorneo(supabase, juego)
  if (!inicioTorneo) return null

  const inicio = Date.parse(inicioTorneo)
  const ahoraMs = Date.now()
  const horaServer = esModoHistoria(juego) ? null : await obtenerAhoraServidor(supabase, juego)
  const ahoraServidor = Date.parse(horaServer)
  const offsetServidor = !esModoHistoria(juego) && Number.isFinite(ahoraServidor) ? ahoraServidor - ahoraMs : 0
  const duracion = Number(duracionSegundos || 0)

  if (!Number.isFinite(inicio)) return null

  const ahora = () => Date.now() + offsetServidor
  const transcurrido = () => {
    const segundos = Math.floor((ahora() - inicio) / 1000)
    if (!Number.isFinite(segundos)) return null
    const seguro = Math.max(0, segundos)
    return Number.isFinite(duracion) && duracion > 0 ? Math.min(duracion, seguro) : seguro
  }
  const restante = () => {
    const fin = inicio + duracion * 1000
    const segundos = Math.floor((fin - ahora()) / 1000)
    if (!Number.isFinite(segundos) || segundos > duracion) return duracion
    if (segundos < 0) return 0
    return segundos
  }

  return { inicio, duracion, restante, transcurrido }
}

async function obtenerAhoraServidor(supabase, juego) {
  const { data, error } = await supabase.rpc("ahora_servidor")
  if (error) {
    console.warn(`[Solitario] No se pudo leer hora del servidor para ${juego}; usando reloj local.`, error)
  }
  return data
}

export async function debeSalirDelTorneo(supabase, juego) {
  if (esModoHistoria(juego)) return false

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
  if (lanzamiento?.origin === "historia") return "../../historia-novato.html"
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

export async function registrarPuntosMiniTorneo(supabase, juego, puntos, opciones = {}) {
  if (!esMiniTorneo(juego)) return

  const salaId = localStorage.getItem("solitario_sala_id")
  const usuario = localStorage.getItem("usuario")
  const invalido = Boolean(opciones.invalido || localStorage.getItem("fin_juego") === "descalificado")
  const motivo = opciones.motivo || (invalido ? "Descalificado por actividad sospechosa" : "")
  const puntosSeguros = invalido ? 0 : Math.max(0, Number(puntos || 0))

  if (!salaId || !usuario) return

  const sala = await supabase
    .from("salas")
    .select("id,estado,juego,inicio_torneo,created_at")
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

  let jugadores = await supabase
    .from("sala_jugadores")
    .update({ puntos: puntosSeguros, usuario, invalido, motivo })
    .eq("sala_id", salaId)
    .eq("usuario_id", usuario)
    .select("id")

  if (jugadores.error && esErrorColumnaInvalido(jugadores.error)) {
    jugadores = await supabase
      .from("sala_jugadores")
      .update({ puntos: puntosSeguros, usuario })
      .eq("sala_id", salaId)
      .eq("usuario_id", usuario)
      .select("id")
  }

  if (jugadores.error) {
    console.warn(`[Solitario] No se pudieron registrar puntos del mini torneo para ${juego}.`, jugadores.error)
    return
  }

  if (!jugadores.data?.length) {
    console.warn(`[Solitario] El jugador no estaba asociado a la sala ${salaId}; no se registran puntos huerfanos.`)
    return
  }

  const inicioSala = sala.data.inicio_torneo || sala.data.created_at
  const resultadoExistente = await obtenerResultadoMiniTorneoExistente(supabase, {
    salaId,
    usuario,
    juego,
    inicioSala,
  })

  if (resultadoExistente?.id) {
    await actualizarResultadoMiniTorneo(supabase, resultadoExistente.id, {
      puntos: puntosSeguros,
      invalido,
      motivo,
      victoria: false,
    })
    return
  }

  let resultado = await supabase
    .from("solitario_resultados")
    .insert([{
      usuario_id: usuario,
      usuario,
      puntos: puntosSeguros,
      victoria: false,
      sala_id: salaId,
      origen: "sala",
      juego,
      invalido,
      motivo,
    }])

  if (resultado.error && esErrorColumnaInvalido(resultado.error)) {
    resultado = await supabase
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
  }

  if (resultado.error) {
    console.warn(`[Solitario] No se pudo guardar resultado de mini torneo para ${juego}.`, resultado.error)
  }
}

async function jugadorTieneResultadoMiniTorneo(supabase, juego, inicioSala) {
  if (!esMiniTorneo(juego)) return false
  const salaId = localStorage.getItem("solitario_sala_id")
  const usuario = localStorage.getItem("usuario")
  if (!salaId || !usuario || !inicioSala) return false

  const existente = await obtenerResultadoMiniTorneoExistente(supabase, {
    salaId,
    usuario,
    juego,
    inicioSala,
  })

  return Boolean(existente?.id)
}

async function obtenerResultadoMiniTorneoExistente(supabase, { salaId, usuario, juego, inicioSala }) {
  let query = supabase
    .from("solitario_resultados")
    .select("id")
    .eq("sala_id", salaId)
    .eq("usuario_id", usuario)
    .eq("juego", juego)
    .eq("origen", "sala")
    .order("created_at", { ascending: false })
    .limit(1)

  if (inicioSala) query = query.gte("created_at", inicioSala)

  const { data, error } = await query
  if (error) {
    console.warn(`[Solitario] No se pudo verificar intento previo de mini torneo para ${juego}.`, error)
    return null
  }

  return data?.[0] || null
}

async function actualizarResultadoMiniTorneo(supabase, id, payload) {
  const { error } = await supabase
    .from("solitario_resultados")
    .update(payload)
    .eq("id", id)

  if (error) {
    console.warn("[Solitario] No se pudo actualizar resultado existente de mini torneo.", error)
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

function esErrorColumnaInvalido(error) {
  const mensaje = String(error?.message || "")
  return error?.code === "42703"
    || mensaje.includes("invalido")
    || mensaje.includes("motivo")
    || mensaje.includes("Could not find")
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
