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
const DEFAULT_BONUS = 1

export function etiquetaJuego(juego) {
  return JUEGOS_TEMPORADA.find((item) => item.key === juego)?.label || juego || "-"
}

export function formatearMultiplicador(valor) {
  const numero = Number(valor)
  return `x${(Number.isFinite(numero) && numero > 0 ? numero : DEFAULT_BONUS).toFixed(1)}`
}

export async function obtenerBonusTemporada(juego) {
  if (!juego) return DEFAULT_BONUS

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

export async function obtenerBonusesTemporada() {
  const local = leerBonusesLocales()
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

export async function obtenerJuegoDestacadoTemporada() {
  const bonuses = await obtenerBonusesTemporada()
  return JUEGOS_TEMPORADA
    .map((game) => ({ ...game, bonus: normalizarBonus(bonuses[game.key]) }))
    .sort((a, b) => b.bonus - a.bonus || a.label.localeCompare(b.label))[0]
}

function normalizarBonus(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return DEFAULT_BONUS
  return Math.min(3.5, Math.max(1, Math.round(numero * 10) / 10))
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
