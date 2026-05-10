import { supabase } from "./supabase.js"
import { JUEGOS_TEMPORADA, etiquetaJuego, formatearMultiplicador } from "./experiencia-temporada.js"

export const BONUS_MONEDAS_VALORES = Array.from({ length: 24 }, (_, index) => {
  return Number((1.2 + index / 10).toFixed(1))
})

const STORAGE_KEY = "evento_bonus_monedas_activo"
const DEFAULT_EVENTO_MONEDAS = {
  id: "evento-monedas-actual",
  juego: "sudoku",
  multiplicador: 1,
  fechaInicio: null,
  fechaFin: null,
  activo: false,
  fuente: "local",
}

export async function obtenerEventoMonedasActual() {
  const fallback = leerEventoLocal()
  const { data, error } = await supabase
    .from("bonus_monedas_evento")
    .select("id,juego,multiplicador,fecha_inicio,fecha_fin,activo,updated_at")
    .eq("id", DEFAULT_EVENTO_MONEDAS.id)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo cargar evento de monedas; usando fallback local", error)
    return normalizarEventoMonedas(fallback)
  }

  const evento = normalizarEventoMonedas(data ? { ...data, fuente: "bonus_monedas_evento" } : fallback)
  guardarEventoLocal(evento)
  return evento
}

export async function obtenerBonusMonedasEvento(juego) {
  if (!juego) return 1
  const { data, error } = await supabase.rpc("obtener_bonus_monedas_evento", { p_juego: juego })
  if (!error && Number.isFinite(Number(data))) {
    return normalizarMultiplicadorMonedas(data)
  }

  const evento = await obtenerEventoMonedasActual()
  if (!eventoEstaActivo(evento) || evento.juego !== juego) return 1
  return normalizarMultiplicadorMonedas(evento.multiplicador)
}

export async function guardarEventoMonedas(evento) {
  const limpio = normalizarEventoMonedas(evento)
  guardarEventoLocal(limpio)

  const payload = {
    id: limpio.id,
    juego: limpio.juego,
    multiplicador: limpio.multiplicador,
    fecha_inicio: limpio.fechaInicio || new Date().toISOString(),
    fecha_fin: limpio.fechaFin,
    activo: limpio.activo && Date.parse(limpio.fechaFin) > Date.now(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("bonus_monedas_evento")
    .upsert(payload, { onConflict: "id" })

  if (error) {
    console.warn("No se pudo guardar evento de monedas en Supabase", error)
    return { ok: false, evento: limpio, error }
  }

  return { ok: true, evento: normalizarEventoMonedas({ ...payload, fuente: "bonus_monedas_evento" }) }
}

export function construirEventoMonedas({ juego, multiplicador, tipoDuracion, cantidad }) {
  const inicio = new Date()
  const cantidadLimpia = Math.max(1, Math.trunc(Number(cantidad) || 1))
  const tipo = tipoDuracion === "dias" ? "dias" : "horas"
  const duracionMs = cantidadLimpia * (tipo === "dias" ? 86400000 : 3600000)
  const fin = new Date(inicio.getTime() + duracionMs)

  return normalizarEventoMonedas({
    id: DEFAULT_EVENTO_MONEDAS.id,
    juego,
    multiplicador,
    fechaInicio: inicio.toISOString(),
    fechaFin: fin.toISOString(),
    activo: true,
  })
}

export function desactivarEventoMonedas(evento = leerEventoLocal()) {
  return normalizarEventoMonedas({
    ...evento,
    multiplicador: 1,
    activo: false,
    fechaFin: new Date().toISOString(),
  })
}

export function eventoEstaActivo(evento) {
  const fechaFin = Date.parse(evento?.fechaFin)
  return Boolean(evento?.activo)
    && Number.isFinite(fechaFin)
    && fechaFin > Date.now()
    && normalizarMultiplicadorMonedas(evento?.multiplicador) > 1
}

export function tiempoRestanteEventoMonedas(evento) {
  const restante = Date.parse(evento?.fechaFin) - Date.now()
  if (!Number.isFinite(restante) || restante <= 0) return "Finalizado"
  const dias = Math.floor(restante / 86400000)
  const horas = Math.floor((restante % 86400000) / 3600000)
  const minutos = Math.floor((restante % 3600000) / 60000)
  if (dias > 0) return `${dias}d ${horas}h ${minutos}m`
  if (horas > 0) return `${horas}h ${minutos}m`
  return `${Math.max(1, minutos)}m`
}

export function normalizarEventoMonedas(row = null) {
  const base = { ...DEFAULT_EVENTO_MONEDAS }
  if (!row) return base
  const fechaFin = row.fecha_fin ?? row.fechaFin ?? base.fechaFin
  const activo = Boolean(row.activo) && Date.parse(fechaFin) > Date.now()

  return {
    id: row.id || base.id,
    juego: normalizarJuegoMonedas(row.juego ?? base.juego),
    multiplicador: activo ? normalizarMultiplicadorMonedas(row.multiplicador) : 1,
    fechaInicio: row.fecha_inicio ?? row.fechaInicio ?? base.fechaInicio,
    fechaFin,
    activo,
    fuente: row.fuente || base.fuente,
  }
}

export function resumenEventoMonedas(evento) {
  const activo = eventoEstaActivo(evento)
  return {
    activo,
    juegoTexto: etiquetaJuego(evento?.juego || DEFAULT_EVENTO_MONEDAS.juego),
    multiplicadorTexto: formatearMultiplicador(activo ? evento.multiplicador : 1),
    restanteTexto: activo ? tiempoRestanteEventoMonedas(evento) : "Sin evento activo",
  }
}

function normalizarMultiplicadorMonedas(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return 1
  return Math.min(3.5, Math.max(1, Math.round(numero * 10) / 10))
}

function normalizarJuegoMonedas(juego) {
  const key = String(juego || "").trim().toLowerCase()
  return JUEGOS_TEMPORADA.some((item) => item.key === key) ? key : DEFAULT_EVENTO_MONEDAS.juego
}

function leerEventoLocal() {
  try {
    return normalizarEventoMonedas(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"))
  } catch {
    return { ...DEFAULT_EVENTO_MONEDAS }
  }
}

function guardarEventoLocal(evento) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizarEventoMonedas(evento)))
}
