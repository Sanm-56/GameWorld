import { supabase } from "./supabase.js"

export const JUEGOS_TEMPORADA = [
  { key: "sudoku", label: "Sudoku" },
  { key: "memoria", label: "Memoria" },
  { key: "matematicas", label: "Matematicas" },
  { key: "flashmind", label: "FlashMind" },
  { key: "numcatch", label: "NumCatch" },
  { key: "ajedrez", label: "Ajedrez" },
  { key: "domino", label: "Domino" },
  { key: "damas", label: "Damas" },
]

export const BONUS_TEMPORADA_VALORES = Array.from({ length: 26 }, (_, index) => {
  return Number((1 + index / 10).toFixed(1))
})

const STORAGE_KEY = "bonus_temporada_juegos"
const SNAPSHOT_KEY = "bonus_xp_partida_snapshot"
const SEASON_STORAGE_KEY = "temporada_activa"
const DEFAULT_BONUS = 1
const SNAPSHOT_TTL_MS = 3 * 60 * 60 * 1000
export const TIPOS_DURACION_TEMPORADA = ["horas", "dias"]
export const ESTADOS_TEMPORADA = ["preparacion", "activa", "revision", "finalizada"]
const DEFAULT_TEMPORADA = {
  id: "temporada-actual",
  numero: 1,
  nombre: "Temporada actual",
  estado: "activa",
  bonusJuego: "sudoku",
  bonusXP: DEFAULT_BONUS,
  activa: true,
  fechaInicio: null,
  fechaFin: null,
  duracionTipo: "dias",
  duracionCantidad: 30,
  nombreIndice: 0,
  nombres: [],
  autoRotacion: true,
  visual: {},
  fuente: "local",
}

export function etiquetaJuego(juego) {
  return JUEGOS_TEMPORADA.find((item) => item.key === juego)?.label || juego || "-"
}

export function formatearMultiplicador(valor) {
  const numero = Number(valor)
  return `x${(Number.isFinite(numero) && numero > 0 ? numero : DEFAULT_BONUS).toFixed(1)}`
}

export function normalizarEstadoTemporada(estado, activa = true) {
  const limpio = String(estado || "").toLowerCase().trim()
  if (limpio === "pausada") return "revision"
  if (ESTADOS_TEMPORADA.includes(limpio)) return limpio
  return activa ? "activa" : "finalizada"
}

export function normalizarTemporada(row = null, fallback = DEFAULT_TEMPORADA) {
  const base = fallback || DEFAULT_TEMPORADA
  if (!row) return { ...base }

  let estadoNormalizado = normalizarEstadoTemporada(row.estado, row.activa !== false)
  if (row.activa === false && estadoNormalizado === "activa") estadoNormalizado = "finalizada"
  const activa = estadoNormalizado === "activa" && row.activa !== false
  return {
    id: row.id || base.id,
    numero: normalizarNumeroTemporada(row.numero ?? row.numero_temporada ?? base.numero),
    nombre: String(row.nombre || base.nombre).trim() || base.nombre,
    estado: estadoNormalizado,
    bonusJuego: normalizarJuegoTemporada(row.bonus_juego ?? row.bonusJuego ?? base.bonusJuego),
    bonusXP: normalizarBonus(row.bonus_xp ?? row.bonusXP ?? base.bonusXP),
    activa,
    fechaInicio: row.fecha_inicio ?? row.fechaInicio ?? base.fechaInicio,
    fechaFin: row.fecha_fin ?? row.fechaFin ?? base.fechaFin,
    duracionTipo: normalizarTipoDuracion(row.duracion_tipo ?? row.duracionTipo ?? base.duracionTipo),
    duracionCantidad: normalizarCantidadDuracion(row.duracion_cantidad ?? row.duracionCantidad ?? base.duracionCantidad),
    nombreIndice: normalizarIndiceNombre(row.nombre_indice ?? row.nombreIndice ?? base.nombreIndice),
    nombres: normalizarNombresTemporada(row.nombres_temporada ?? row.nombres ?? base.nombres),
    autoRotacion: row.auto_rotacion !== undefined ? !!row.auto_rotacion : row.autoRotacion !== undefined ? !!row.autoRotacion : base.autoRotacion !== false,
    visual: normalizarVisual(row.visual_config ?? row.visual ?? base.visual),
    fuente: row.fuente || base.fuente || "local",
  }
}

export async function obtenerTemporadaActiva() {
  const fallback = leerTemporadaLocal()

  await avanzarTemporadaSiVencida()

  let { data, error } = await supabase
    .from("temporadas")
    .select("id,numero,nombre,estado,bonus_juego,bonus_xp,activa,fecha_inicio,fecha_fin,duracion_tipo,duracion_cantidad,nombre_indice,nombres_temporada,auto_rotacion,visual_config")
    .eq("activa", true)
    .order("fecha_inicio", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!error && !data) {
    const latest = await supabase
      .from("temporadas")
      .select("id,numero,nombre,estado,bonus_juego,bonus_xp,activa,fecha_inicio,fecha_fin,duracion_tipo,duracion_cantidad,nombre_indice,nombres_temporada,auto_rotacion,visual_config")
      .order("fecha_inicio", { ascending: false })
      .limit(1)
      .maybeSingle()
    data = latest.data
    error = latest.error
  }

  if (error) {
    console.warn("No se pudo cargar temporada activa; usando compatibilidad legacy", error)
    const destacado = await obtenerJuegoDestacadoLegacy()
    const legacy = normalizarTemporada({
      ...fallback,
      bonusJuego: destacado?.key || fallback.bonusJuego,
      bonusXP: destacado?.bonus || fallback.bonusXP,
      fuente: "legacy",
    }, fallback)
    guardarTemporadaLocal(legacy)
    return legacy
  }

  const temporada = data
    ? normalizarTemporada({ ...data, fuente: "temporadas" }, fallback)
    : normalizarTemporada(fallback)
  guardarTemporadaLocal(temporada)
  return temporada
}

export async function obtenerBonusTemporada(juego) {
  if (!juego) return DEFAULT_BONUS

  const temporada = await obtenerTemporadaActiva()
  if (temporadaTieneBonusActivo(temporada) && temporada.bonusJuego === juego) {
    return normalizarBonus(temporada.bonusXP)
  }
  if (temporada?.fuente === "temporadas") return DEFAULT_BONUS

  const fallback = leerBonusLocal(juego)
  const { data, error } = await supabase
    .from("bonus_temporada")
    .select("multiplicador")
    .eq("juego", juego)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo cargar bonus de temporada", error)
    return fallback
  }

  return normalizarBonus(data?.multiplicador ?? fallback)
}

export async function crearSnapshotBonusXP(juego, origen = "torneo") {
  if (!juego) return null

  const temporada = await obtenerTemporadaActiva()
  const bonus = await obtenerBonusTemporada(juego)
  const snapshot = {
    temporadaId: temporada.id,
    temporadaNumero: temporada.numero,
    temporadaNombre: temporada.nombre,
    juego,
    origen,
    bonusXPAplicado: temporadaTieneBonusActivo(temporada) && temporada.bonusJuego === juego
      ? normalizarBonus(temporada.bonusXP)
      : normalizarBonus(bonus),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
  return snapshot
}

export async function obtenerSnapshotBonusXP(juego, origen = "torneo") {
  const snapshot = leerSnapshotBonusXP()
  if (snapshotValido(snapshot, juego, origen)) return snapshot
  return crearSnapshotBonusXP(juego, origen)
}

export function limpiarSnapshotBonusXP(juego = null) {
  const snapshot = leerSnapshotBonusXP()
  if (!juego || snapshot?.juego === juego) {
    localStorage.removeItem(SNAPSHOT_KEY)
  }
}

export async function obtenerBonusesTemporada() {
  const local = leerBonusesLocales()
  const temporada = await obtenerTemporadaActiva()
  if (temporadaTieneBonusActivo(temporada) && temporada?.bonusJuego) {
    local[temporada.bonusJuego] = normalizarBonus(temporada.bonusXP)
  }

  const { data, error } = await supabase
    .from("bonus_temporada")
    .select("juego,multiplicador,updated_at")

  if (error) {
    console.warn("No se pudieron cargar bonuses de temporada", error)
    return local
  }

  const merged = { ...local }
  ;(data || []).forEach((row) => {
    merged[row.juego] = normalizarBonus(row.multiplicador)
  })
  if (temporadaTieneBonusActivo(temporada) && temporada?.bonusJuego) {
    merged[temporada.bonusJuego] = normalizarBonus(temporada.bonusXP)
  }
  return merged
}

export async function guardarBonusTemporada(juego, multiplicador) {
  const bonus = normalizarBonus(multiplicador)
  guardarBonusLocal(juego, bonus)

  const { error } = await supabase
    .from("bonus_temporada")
    .upsert({
      juego,
      multiplicador: bonus,
      updated_at: new Date().toISOString(),
    }, { onConflict: "juego" })

  if (error) {
    console.warn("No se pudo guardar bonus de temporada en Supabase", error)
    return { ok: false, bonus, error }
  }

  return { ok: true, bonus }
}

export async function guardarTemporadaActiva(temporada) {
  const limpia = normalizarTemporada(temporada, leerTemporadaLocal())
  guardarTemporadaLocal(limpia)
  guardarBonusLocal(limpia.bonusJuego, limpia.bonusXP)

  const payload = {
    id: limpia.id || `temporada-${limpia.numero}`,
    numero: limpia.numero,
    nombre: limpia.nombre,
    estado: limpia.estado,
    bonus_juego: limpia.bonusJuego,
    bonus_xp: limpia.bonusXP,
    activa: temporadaTieneBonusActivo(limpia),
    fecha_inicio: limpia.fechaInicio || new Date().toISOString(),
    fecha_fin: limpia.fechaFin || calcularFechaFin(limpia.fechaInicio || new Date().toISOString(), limpia.duracionTipo, limpia.duracionCantidad),
    duracion_tipo: limpia.duracionTipo,
    duracion_cantidad: limpia.duracionCantidad,
    nombre_indice: limpia.nombreIndice,
    nombres_temporada: limpia.nombres,
    auto_rotacion: limpia.autoRotacion,
    visual_config: limpia.visual || {},
  }

  const { error } = await supabase
    .from("temporadas")
    .upsert(payload, { onConflict: "id" })

  if (error) {
    console.warn("No se pudo guardar temporada en Supabase", error)
    return { ok: false, temporada: limpia, error }
  }

  return { ok: true, temporada: limpia }
}

export async function avanzarTemporadaSiVencida() {
  const { error } = await supabase.rpc("avanzar_temporada_si_vencida")
  if (error && error.code !== "PGRST202" && error.code !== "42883") {
    console.warn("No se pudo verificar rotacion automatica de temporada", error)
  }
}

export function construirTemporadaAdmin({
  id,
  numero,
  nombre,
  estado,
  bonusJuego,
  bonusXP,
  fechaInicio = null,
  fechaFin = null,
  duracionTipo = "dias",
  duracionCantidad = 30,
  nombreIndice = 0,
  nombres = [],
  autoRotacion = true,
  visual = {},
} = {}) {
  const inicio = fechaInicio || new Date().toISOString()
  const tipo = normalizarTipoDuracion(duracionTipo)
  const cantidad = normalizarCantidadDuracion(duracionCantidad)
  const estadoLimpio = normalizarEstadoTemporada(estado, false)
  return normalizarTemporada({
    id,
    numero,
    nombre,
    estado: estadoLimpio,
    bonusJuego,
    bonusXP,
    activa: estadoLimpio === "activa",
    fechaInicio: inicio,
    fechaFin: fechaFin || (estadoLimpio === "activa" ? calcularFechaFin(inicio, tipo, cantidad) : null),
    duracionTipo: tipo,
    duracionCantidad: cantidad,
    nombreIndice,
    nombres,
    autoRotacion,
    visual,
  })
}

export function calcularFechaFin(fechaInicio, tipoDuracion = "dias", cantidad = 30) {
  const inicioMs = Date.parse(fechaInicio || new Date().toISOString())
  const base = Number.isFinite(inicioMs) ? inicioMs : Date.now()
  const factor = normalizarTipoDuracion(tipoDuracion) === "horas" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  return new Date(base + normalizarCantidadDuracion(cantidad) * factor).toISOString()
}

export function temporadaTieneBonusActivo(temporada) {
  if (!temporada || normalizarEstadoTemporada(temporada.estado, temporada.activa) !== "activa" || temporada.activa === false) return false
  const finMs = Date.parse(temporada.fechaFin)
  return !Number.isFinite(finMs) || finMs > Date.now()
}

export function tiempoRestanteTemporada(temporada) {
  const finMs = Date.parse(temporada?.fechaFin)
  if (!Number.isFinite(finMs)) return "Sin limite"
  const restante = finMs - Date.now()
  if (restante <= 0) return "Finalizando"
  return formatearDuracionRestante(restante)
}

export function formatearDuracionRestante(ms) {
  const totalMinutos = Math.max(0, Math.ceil(ms / 60000))
  const dias = Math.floor(totalMinutos / 1440)
  const horas = Math.floor((totalMinutos % 1440) / 60)
  const minutos = totalMinutos % 60
  const partes = []
  if (dias) partes.push(`${dias}d`)
  if (horas || dias) partes.push(`${horas}h`)
  partes.push(`${minutos}m`)
  return partes.join(" ")
}

export async function obtenerJuegoDestacadoTemporada() {
  const temporada = await obtenerTemporadaActiva()
  const juego = JUEGOS_TEMPORADA.find((game) => game.key === temporada?.bonusJuego)
  if (juego) {
    return {
      ...juego,
      bonus: normalizarBonus(temporada.bonusXP),
      temporada,
    }
  }

  return obtenerJuegoDestacadoLegacy()
}

function normalizarBonus(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return DEFAULT_BONUS
  return Math.min(3.5, Math.max(1, Math.round(numero * 10) / 10))
}

function normalizarNumeroTemporada(valor) {
  const numero = Math.trunc(Number(valor))
  if (!Number.isFinite(numero) || numero < 1) return DEFAULT_TEMPORADA.numero
  return numero
}

function normalizarJuegoTemporada(juego) {
  const key = String(juego || "").trim().toLowerCase()
  return JUEGOS_TEMPORADA.some((item) => item.key === key) ? key : DEFAULT_TEMPORADA.bonusJuego
}

function normalizarTipoDuracion(valor) {
  const tipo = String(valor || "").toLowerCase().trim()
  return TIPOS_DURACION_TEMPORADA.includes(tipo) ? tipo : DEFAULT_TEMPORADA.duracionTipo
}

function normalizarCantidadDuracion(valor) {
  const numero = Math.trunc(Number(valor))
  if (!Number.isFinite(numero) || numero < 1) return DEFAULT_TEMPORADA.duracionCantidad
  return Math.min(3650, numero)
}

function normalizarIndiceNombre(valor) {
  const numero = Math.trunc(Number(valor))
  if (!Number.isFinite(numero) || numero < 0) return 0
  return numero
}

function normalizarNombresTemporada(valor) {
  if (!Array.isArray(valor)) return []
  return [...new Set(valor.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, 500)
}

function normalizarVisual(valor) {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {}
  return valor
}

function leerTemporadaLocal() {
  try {
    return normalizarTemporada(JSON.parse(localStorage.getItem(SEASON_STORAGE_KEY) || "null"))
  } catch {
    return { ...DEFAULT_TEMPORADA }
  }
}

function guardarTemporadaLocal(temporada) {
  localStorage.setItem(SEASON_STORAGE_KEY, JSON.stringify(normalizarTemporada(temporada)))
}

function leerBonusesLocales() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {}
  } catch {
    return {}
  }
}

function leerBonusLocal(juego) {
  return normalizarBonus(leerBonusesLocales()[juego] || DEFAULT_BONUS)
}

function guardarBonusLocal(juego, bonus) {
  const actuales = leerBonusesLocales()
  actuales[juego] = normalizarBonus(bonus)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actuales))
}

function leerSnapshotBonusXP() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "null")
  } catch {
    return null
  }
}

function snapshotValido(snapshot, juego, origen) {
  if (!snapshot || snapshot.juego !== juego || snapshot.origen !== origen) return false

  const createdAt = Date.parse(snapshot.createdAt)
  if (!Number.isFinite(createdAt)) return false
  if (Date.now() - createdAt > SNAPSHOT_TTL_MS) return false

  return Number.isFinite(Number(snapshot.bonusXPAplicado))
}

async function obtenerJuegoDestacadoLegacy() {
  const bonuses = await obtenerBonusesTemporadaLegacy()
  return JUEGOS_TEMPORADA
    .map((game) => ({ ...game, bonus: normalizarBonus(bonuses[game.key]) }))
    .sort((a, b) => b.bonus - a.bonus || a.label.localeCompare(b.label))[0]
}

async function obtenerBonusesTemporadaLegacy() {
  const local = leerBonusesLocales()
  const { data, error } = await supabase
    .from("bonus_temporada")
    .select("juego,multiplicador,updated_at")

  if (error) return local

  const merged = { ...local }
  ;(data || []).forEach((row) => {
    merged[row.juego] = normalizarBonus(row.multiplicador)
  })
  return merged
}
