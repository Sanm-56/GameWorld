const LOCK_VERSION = 1
const LOCK_TTL_MS = 10000
const HEARTBEAT_MS = 2500
const PREFIX = "torneo_game_lock"

export function adquirirCandadoJuego(juego, options = {}) {
  const origin = options.origin || detectarOrigenJuego(juego)
  const key = obtenerClaveCandado(juego, origin)
  const tabId = `${juego}_${origin}_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const ahora = Date.now()
  const actual = leerCandado(key)

  if (candadoVivo(actual, ahora) && actual.tabId !== tabId) {
    return {
      ok: false,
      key,
      origin,
      tabId,
      message: "Ya tienes esta partida abierta en otra pestana.",
      release: () => {},
    }
  }

  escribirCandado(key, {
    version: LOCK_VERSION,
    game: juego,
    origin,
    tabId,
    startedAt: ahora,
    heartbeatAt: ahora,
  })

  const confirmado = leerCandado(key)
  if (!confirmado || confirmado.tabId !== tabId) {
    return {
      ok: false,
      key,
      origin,
      tabId,
      message: "No se pudo reservar esta partida.",
      release: () => {},
    }
  }

  let intervalId = window.setInterval(() => {
    const vigente = leerCandado(key)
    if (vigente?.tabId !== tabId) {
      window.clearInterval(intervalId)
      intervalId = null
      return
    }

    vigente.heartbeatAt = Date.now()
    escribirCandado(key, vigente)
  }, HEARTBEAT_MS)

  const release = () => {
    if (intervalId) {
      window.clearInterval(intervalId)
      intervalId = null
    }

    const vigente = leerCandado(key)
    if (vigente?.tabId === tabId) {
      localStorage.removeItem(key)
    }
  }

  window.addEventListener("pagehide", release, { once: true })
  window.addEventListener("beforeunload", release, { once: true })

  return { ok: true, key, origin, tabId, release }
}

export function limpiarCandadosJuego(juego = null) {
  const prefix = juego ? `${PREFIX}_${juego}_` : `${PREFIX}_`
  Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => localStorage.removeItem(key))
}

function candadoVivo(candado, ahora = Date.now()) {
  if (!candado || candado.version !== LOCK_VERSION) return false
  if (!candado.game || !candado.origin || !candado.tabId) return false

  const heartbeat = Number(candado.heartbeatAt)
  if (!Number.isFinite(heartbeat) || ahora - heartbeat > LOCK_TTL_MS) return false

  return true
}

function obtenerClaveCandado(juego, origin) {
  return `${PREFIX}_${juego}_${origin}`
}

function leerCandado(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!candadoVivo(parsed)) {
      localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function escribirCandado(key, payload) {
  localStorage.setItem(key, JSON.stringify(payload))
}

function detectarOrigenJuego(juego) {
  const lanzamiento = leerJson("solitario_game_launch")
  if (lanzamiento?.game === juego && ["torneo", "sala", "nivel", "historia"].includes(lanzamiento.origin)) {
    return lanzamiento.origin
  }

  const origenSolitario = localStorage.getItem("solitario_origen")
  const juegoSolitario = localStorage.getItem("solitario_juego")
  if (juegoSolitario === juego && ["sala", "nivel"].includes(origenSolitario)) {
    return origenSolitario
  }

  return "torneo"
}

function leerJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null")
  } catch {
    return null
  }
}
