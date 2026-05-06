import { installSafeAlert } from "./mensajes.js"

installSafeAlert()

export function esMiniTorneo(juego) {
  return localStorage.getItem("solitario_origen") === "sala"
    && localStorage.getItem("solitario_sala_id")
    && localStorage.getItem("solitario_juego") === juego
}

const DURACION_JUEGO_MS = 10 * 60 * 1000

function esNivelSolitario(juego) {
  const context = leerContextoNivel()
  return localStorage.getItem("solitario_origen") === "nivel"
    && context
    && context.game === juego
}

export async function obtenerInicioTorneo(supabase, juego) {
  if (esMiniTorneo(juego)) {
    const salaId = localStorage.getItem("solitario_sala_id")
    const { data } = await supabase
      .from("salas")
      .select("estado,juego,inicio_torneo,created_at")
      .eq("id", salaId)
      .maybeSingle()

    if (data?.estado !== "en_juego" || data?.juego !== juego) return null
    return inicioSeguroParaSolitario(juego, "sala", data.inicio_torneo || data.created_at)
  }

  if (esNivelSolitario(juego)) {
    return inicioSeguroParaSolitario(juego, "nivel", leerContextoNivel()?.startedAt)
  }

  const { data } = await supabase
    .from("estado_torneo")
    .select("inicio_torneo")
    .eq("id", 1)
    .single()

  return data?.inicio_torneo || null
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

export async function debeSalirDelTorneo(supabase, juego) {
  if (esMiniTorneo(juego)) {
    const salaId = localStorage.getItem("solitario_sala_id")
    const { data } = await supabase
      .from("salas")
      .select("estado,juego")
      .eq("id", salaId)
      .maybeSingle()

    return !data || data.juego !== juego || data.estado === "finalizado"
  }

  if (esNivelSolitario(juego)) return false

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  return data?.estado === "espera"
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

  await supabase
    .from("sala_jugadores")
    .update({ puntos: puntosSeguros, usuario })
    .eq("sala_id", salaId)
    .eq("usuario_id", usuario)

  await supabase
    .from("solitario_resultados")
    .insert([{
      usuario_id: usuario,
      usuario,
      puntos: puntosSeguros,
      victoria: false,
      sala_id: salaId,
      origen: "sala",
    }])
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
    return JSON.parse(localStorage.getItem("solitario_game_launch") || "null")
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
