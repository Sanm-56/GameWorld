export const SOLITARIO_LEVEL_CONTEXT_KEY = "solitario_nivel_context"

export const LEVELS = [
  { id: 1, game: "matematicas", mission: { type: "score", target: 80 } },
  { id: 2, game: "memoria", mission: { type: "time", maxTime: 540 } },
  { id: 3, game: "numcatch", mission: { type: "score", target: 160 } },
  { id: 4, game: "sudoku", mission: { type: "time", maxTime: 540 } },
  { id: 5, game: "flashmind", mission: { type: "score", target: 30 } },
  { id: 6, game: "damas", mission: { type: "win", maxTime: 540 } },
  { id: 7, game: "domino", mission: { type: "win", maxTime: 540 } },
  { id: 8, game: "ajedrez", mission: { type: "win", maxTime: 540 } },
  { id: 9, game: "matematicas", mission: { type: "score", target: 150 } },
  { id: 10, game: "memoria", mission: { type: "time", maxTime: 480 } },
  { id: 11, game: "numcatch", mission: { type: "score", target: 280 } },
  { id: 12, game: "sudoku", mission: { type: "time", maxTime: 480 } },
].map((level) => ({
  ...level,
  title: `Nivel ${level.id}`,
}))

const GAME_LABELS = {
  ajedrez: "Ajedrez",
  damas: "Damas",
  domino: "Domino",
  flashmind: "FlashMind",
  matematicas: "Matematicas",
  memoria: "Memoria",
  numcatch: "NumCatch",
  sudoku: "Sudoku",
}

export function getGameLabel(game) {
  return GAME_LABELS[game] || game
}

export function missionLabel(level) {
  const mission = level?.mission
  if (!mission) return "Completa la mision para avanzar."

  if (mission.type === "score") {
    return `Logra ${mission.target} puntos en ${getGameLabel(level.game)}.`
  }

  if (mission.type === "win") {
    return mission.maxTime
      ? `Gana en ${getGameLabel(level.game)} antes de ${formatTime(mission.maxTime)}.`
      : `Gana una partida de ${getGameLabel(level.game)}.`
  }

  if (mission.type === "time") {
    return `Completa ${getGameLabel(level.game)} antes de ${formatTime(mission.maxTime)}.`
  }

  return "Completa la mision para avanzar."
}

export function checkMission(level, result) {
  const mission = level?.mission
  if (!mission || !result || result.game !== level.game || result.invalid) return false

  if (mission.type === "score") {
    return Number(result.score || 0) >= Number(mission.target || 0)
  }

  if (mission.type === "win") {
    if (!result.win) return false
    return !mission.maxTime || Number(result.time || 9999) <= Number(mission.maxTime)
  }

  if (mission.type === "time") {
    return result.win && Number(result.time || 9999) <= Number(mission.maxTime)
  }

  return false
}

export function getLevelProgress(usuario) {
  return normalizeProgress(readJson(progressKey(usuario), null))
}

export async function syncLevelProgress(supabase, usuario) {
  const progress = getLevelProgress(usuario)
  if (!supabase || !usuario) return progress

  const { data, error } = await supabase
    .from("progreso_niveles")
    .select("nivel,completado,puntaje,tiempo,updated_at")
    .eq("usuario_id", usuario)

  if (error) {
    console.warn("No se pudo sincronizar progreso de niveles", error)
    return progress
  }

  ;(data || []).forEach((row) => {
    const levelId = Number(row.nivel)
    const metric = Number(row.puntaje || 0)
    progress.bestByLevel[String(levelId)] = Math.max(progress.bestByLevel[String(levelId)] || 0, metric)
    progress.lastByLevel[String(levelId)] = {
      score: metric,
      time: row.tiempo,
      completed: Boolean(row.completado),
      updatedAt: row.updated_at,
    }

    if (row.completado) {
      progress.done.push(levelId)
      progress.unlocked = Math.max(progress.unlocked, Math.min(levelId + 1, LEVELS.length))
    }
  })

  progress.done = [...new Set(progress.done)].sort((a, b) => a - b)
  localStorage.setItem(progressKey(usuario), JSON.stringify(progress))
  return progress
}

export function resetLevelProgress(usuario) {
  const progress = normalizeProgress(null)
  localStorage.setItem(progressKey(usuario), JSON.stringify(progress))
  return progress
}

export function isLevelUnlocked(level, progress) {
  return level.id <= normalizeProgress(progress).unlocked
}

export function startLevel(level, usuario) {
  if (!level || !usuario) return

  localStorage.setItem(SOLITARIO_LEVEL_CONTEXT_KEY, JSON.stringify({
    id: level.id,
    game: level.game,
    mission: level.mission,
    usuario,
    startedAt: new Date().toISOString(),
  }))
  localStorage.setItem("solitario_origen", "nivel")
  localStorage.setItem("solitario_juego", level.game)
}

export function hasLevelContext() {
  return Boolean(getLevelContext())
}

export function getLevelContext() {
  return readJson(SOLITARIO_LEVEL_CONTEXT_KEY, null)
}

export function clearLevelContext() {
  localStorage.removeItem(SOLITARIO_LEVEL_CONTEXT_KEY)
  if (localStorage.getItem("solitario_origen") === "nivel") {
    localStorage.removeItem("solitario_origen")
    localStorage.removeItem("solitario_juego")
  }
}

export async function reportLevelResult(supabase, { usuario, juego, valor, modo, posicion = null, invalido = false }) {
  const context = getLevelContext()
  if (!context || context.usuario !== usuario || context.game !== juego) return null

  const level = LEVELS.find((item) => item.id === Number(context.id))
  if (!level) return null

  const result = normalizeResult({ juego, valor, modo, posicion, invalido })
  const completed = checkMission(level, result)
  const progress = updateLocalProgress(usuario, level, result, completed)

  await saveProgressToSupabase(supabase, usuario, level, result, completed)
  await saveLevelResultToRanking(supabase, usuario, level, result, completed)

  return { completed, level, progress, result }
}

function normalizeResult({ juego, valor, modo, posicion, invalido }) {
  const value = Number(valor || 0)
  const time = modo === "time" ? value : null
  const score = modo === "points" ? value : Math.max(0, 600 - Number(time || 600))

  return {
    game: juego,
    invalid: Boolean(invalido),
    mode: modo,
    position: posicion,
    score,
    time,
    win: !invalido && (modo === "points" ? value > 0 : value > 0 && value < 9999),
  }
}

function updateLocalProgress(usuario, level, result, completed) {
  const progress = getLevelProgress(usuario)
  const previousBest = progress.bestByLevel[String(level.id)] || 0
  const metric = result.mode === "time" && result.time ? Math.max(0, 600 - result.time) : result.score

  progress.bestByLevel[String(level.id)] = Math.max(previousBest, metric)
  progress.lastByLevel[String(level.id)] = {
    score: result.score,
    time: result.time,
    completed,
    updatedAt: new Date().toISOString(),
  }

  if (completed) {
    progress.done = [...new Set([...progress.done, level.id])].sort((a, b) => a - b)
    progress.unlocked = Math.max(progress.unlocked, Math.min(level.id + 1, LEVELS.length))
  }

  localStorage.setItem(progressKey(usuario), JSON.stringify(progress))
  return progress
}

async function saveProgressToSupabase(supabase, usuario, level, result, completed) {
  if (!supabase) return

  const { error } = await supabase
    .from("progreso_niveles")
    .upsert({
      usuario_id: usuario,
      usuario,
      nivel: level.id,
      juego: level.game,
      completado: completed,
      puntaje: Number(result.score || 0),
      tiempo: result.time,
      resultado: result,
      updated_at: new Date().toISOString(),
    }, { onConflict: "usuario_id,nivel" })

  if (error) {
    console.warn("No se pudo guardar progreso de nivel", error)
  }
}

async function saveLevelResultToRanking(supabase, usuario, level, result, completed) {
  if (!supabase) return

  const { error } = await supabase.from("solitario_resultados").insert([{
    usuario_id: usuario,
    usuario,
    puntos: Number(result.score || 0),
    victoria: completed,
    sala_id: null,
    origen: "nivel",
    juego: level.game,
  }])

  if (error) {
    console.warn("No se pudo registrar resultado de nivel en ranking de solitario", error)
  }
}

function normalizeProgress(progress) {
  return {
    unlocked: Number(progress?.unlocked || 1),
    done: Array.isArray(progress?.done) ? progress.done.map(Number) : [],
    bestByLevel: progress?.bestByLevel || {},
    lastByLevel: progress?.lastByLevel || {},
  }
}

function progressKey(usuario) {
  return `solitario_progreso_${usuario}`
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback
  } catch {
    return fallback
  }
}

function formatTime(seconds) {
  const min = Math.floor(Number(seconds || 0) / 60)
  const sec = Number(seconds || 0) % 60
  return `${min}:${sec < 10 ? "0" : ""}${sec}`
}
