export const SOLITARIO_LEVEL_CONTEXT_KEY = "solitario_nivel_context"
export const SOLITARIO_LEVEL_RESULT_KEY = "solitario_nivel_resultado"
export const SOLITARIO_LEVEL_CHECKPOINT_KEY = "solitario_nivel_checkpoint"
export const SOLITARIO_MAX_LEVEL = 500

const GAME_CONFIG = {
  matematicas: {
    label: "Matematicas",
    mode: "points",
    baseScore: 70,
    scoreStep: 13,
    fastLimit: 520,
    minLimit: 170,
    families: ["score", "score_time", "streak", "precision", "combo"],
  },
  memoria: {
    label: "Memoria",
    mode: "time",
    baseTime: 560,
    minTime: 175,
    families: ["time", "speed", "precision", "survival"],
  },
  numcatch: {
    label: "NumCatch",
    mode: "points",
    baseScore: 120,
    scoreStep: 18,
    fastLimit: 500,
    minLimit: 150,
    families: ["score", "score_time", "survival", "combo", "precision"],
  },
  cricketarcade: {
    label: "Cricket Arcade",
    mode: "points",
    baseScore: 130,
    scoreStep: 16,
    fastLimit: 460,
    minLimit: 130,
    families: ["score", "score_time", "combo", "precision", "survival"],
  },
  esquivaobstaculos: {
    label: "Esquiva Obstaculos",
    mode: "points",
    baseScore: 120,
    scoreStep: 17,
    fastLimit: 455,
    minLimit: 130,
    families: ["score", "score_time", "survival", "combo", "precision"],
  },
  torreinfinita: {
    label: "Torre Infinita",
    mode: "points",
    baseScore: 125,
    scoreStep: 18,
    fastLimit: 470,
    minLimit: 140,
    families: ["score", "score_time", "precision", "combo", "survival"],
  },
  subelamontana: {
    label: "Sube la Montana",
    mode: "points",
    baseScore: 120,
    scoreStep: 18,
    fastLimit: 465,
    minLimit: 135,
    families: ["score", "score_time", "survival", "combo", "precision"],
  },
  sudoku: {
    label: "Sudoku",
    mode: "time",
    baseTime: 560,
    minTime: 210,
    families: ["time", "speed", "precision", "multi"],
  },
  flashmind: {
    label: "FlashMind",
    mode: "points",
    baseScore: 28,
    scoreStep: 5,
    fastLimit: 510,
    minLimit: 150,
    families: ["score", "score_time", "streak", "combo", "survival"],
  },
  damas: {
    label: "Damas",
    mode: "win",
    baseTime: 560,
    minTime: 190,
    families: ["win", "win_time", "precision"],
  },
  domino: {
    label: "Domino",
    mode: "win",
    baseTime: 560,
    minTime: 190,
    families: ["win", "win_time", "survival"],
  },
  ajedrez: {
    label: "Ajedrez",
    mode: "win",
    baseTime: 560,
    minTime: 220,
    families: ["win", "win_time", "precision", "multi"],
  },
}

const GAME_ROTATION = [
  "matematicas",
  "memoria",
  "numcatch",
  "cricketarcade",
  "esquivaobstaculos",
  "torreinfinita",
  "subelamontana",
  "sudoku",
  "flashmind",
  "damas",
  "domino",
  "ajedrez",
]

const LEVEL_SEEDS = [
  { game: "matematicas", family: "score", target: 100 },
  { game: "memoria", family: "time", maxTime: 520 },
  { game: "numcatch", family: "score", target: 170 },
  { game: "cricketarcade", family: "score", target: 160 },
  { game: "esquivaobstaculos", family: "survival", target: 150 },
  { game: "torreinfinita", family: "precision", target: 150 },
  { game: "subelamontana", family: "score", target: 150 },
  { game: "sudoku", family: "time", maxTime: 520 },
  { game: "flashmind", family: "score", target: 35 },
  { game: "damas", family: "win", maxTime: 540 },
  { game: "domino", family: "win", maxTime: 540 },
  { game: "ajedrez", family: "win", maxTime: 540 },
  { game: "matematicas", family: "score_time", target: 150, maxElapsed: 480 },
  { game: "memoria", family: "speed", maxTime: 470 },
  { game: "numcatch", family: "score_time", target: 260, maxElapsed: 470 },
  { game: "sudoku", family: "speed", maxTime: 470 },
]

export const LEVELS = Array.from({ length: SOLITARIO_MAX_LEVEL }, (_, index) => createLevel(index + 1))

const GAME_LABELS = Object.fromEntries(
  Object.entries(GAME_CONFIG).map(([key, value]) => [key, value.label])
)

export function getGameLabel(game) {
  return GAME_LABELS[game] || game
}

export function missionLabel(level) {
  const mission = level?.mission
  if (!mission) return "Completa la mision para avanzar."

  const game = getGameLabel(level.game)
  const parts = mission.conditions.map((condition) => conditionLabel(condition, game))
  return parts.length > 1 ? parts.join(" + ") + "." : `${parts[0]}.`
}

export function missionProgress(level, result) {
  const mission = level?.mission
  if (!mission || !result) return []
  return mission.conditions.map((condition) => evaluateCondition(condition, result))
}

export function missionFailureMessage(level, result) {
  if (result?.invalid) return result.reason || "Descalificado por actividad sospechosa."
  const failed = missionProgress(level, result).filter((item) => !item.ok)
  if (!failed.length) return "No alcanzaste la mision."
  return failed[0].missing || "No alcanzaste la mision."
}

export function checkMission(level, result) {
  const mission = level?.mission
  if (!mission || !result || result.game !== level.game || result.invalid) return false
  return mission.conditions.every((condition) => evaluateCondition(condition, result).ok)
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

  localStorage.removeItem(SOLITARIO_LEVEL_RESULT_KEY)
  localStorage.removeItem(SOLITARIO_LEVEL_CHECKPOINT_KEY)
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

export function getLastLevelResult() {
  return readJson(SOLITARIO_LEVEL_RESULT_KEY, null)
}

export function saveLastLevelResult(payload) {
  const current = getLastLevelResult() || {}
  localStorage.setItem(SOLITARIO_LEVEL_RESULT_KEY, JSON.stringify({
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  }))
}

export function registrarCheckpointNivel(juego, valor, modo, extra = {}) {
  const context = getLevelContext()
  if (!context || context.game !== juego) return null

  const level = LEVELS.find((item) => item.id === Number(context.id))
  if (!level) return null

  const elapsed = Number.isFinite(Number(extra.elapsed))
    ? Math.max(0, Math.round(Number(extra.elapsed)))
    : elapsedDesdeInicio(context.startedAt)
  const result = normalizeResult({
    juego,
    valor,
    modo,
    posicion: extra.posicion ?? null,
    invalido: false,
    motivo: "",
    startedAt: context.startedAt,
    elapsedOverride: elapsed,
  })

  if (!checkMission(level, result)) return null

  const checkpointActual = readJson(SOLITARIO_LEVEL_CHECKPOINT_KEY, null)
  if (checkpointActual?.contextStartedAt === context.startedAt && checkpointActual?.levelId === level.id) {
    return checkpointActual
  }

  const checkpoint = {
    levelId: level.id,
    game: juego,
    usuario: context.usuario,
    contextStartedAt: context.startedAt,
    result,
    completedAt: new Date().toISOString(),
  }
  localStorage.setItem(SOLITARIO_LEVEL_CHECKPOINT_KEY, JSON.stringify(checkpoint))
  return checkpoint
}

export function clearLevelContext({ keepResult = false } = {}) {
  localStorage.removeItem(SOLITARIO_LEVEL_CONTEXT_KEY)
  localStorage.removeItem(SOLITARIO_LEVEL_CHECKPOINT_KEY)
  if (!keepResult) localStorage.removeItem(SOLITARIO_LEVEL_RESULT_KEY)
  if (localStorage.getItem("solitario_origen") === "nivel") {
    localStorage.removeItem("solitario_origen")
    localStorage.removeItem("solitario_juego")
  }
}

export async function reportLevelResult(supabase, { usuario, juego, valor, modo, posicion = null, invalido = false, motivo = "" }) {
  const context = getLevelContext()
  if (!context || context.usuario !== usuario || context.game !== juego) return null

  const level = LEVELS.find((item) => item.id === Number(context.id))
  if (!level) return null

  const result = normalizeResult({ juego, valor, modo, posicion, invalido, motivo, startedAt: context.startedAt })
  const checkpoint = getValidCheckpoint(context, level)
  const missionResult = !invalido && checkpoint?.result ? checkpoint.result : result
  const completed = !invalido && (Boolean(checkpoint?.result) || checkMission(level, result))
  const previousProgress = getLevelProgress(usuario)
  const wasCompleted = previousProgress.done.includes(level.id)
  const previousBest = Number(previousProgress.bestByLevel[String(level.id)] || 0)
  const progress = updateLocalProgress(usuario, level, result, completed)
  const newBest = Number(progress.bestByLevel[String(level.id)] || 0)
  const summary = {
    usuario,
    level,
    result,
    completed,
    newlyCompleted: completed && !wasCompleted,
    previousBest,
    newBest,
    personalRecord: newBest > previousBest,
    progress,
    missionText: missionLabel(level),
    progressItems: missionProgress(level, missionResult),
    failureMessage: completed ? "" : missionFailureMessage(level, result),
    endedAt: new Date().toISOString(),
  }

  saveLastLevelResult(summary)
  await saveProgressToSupabase(supabase, usuario, level, result, completed)
  await saveLevelResultToRanking(supabase, usuario, level, result, completed)

  return summary
}

function createLevel(id) {
  const seed = LEVEL_SEEDS[id - 1]
  if (seed) return enrichLevel(id, seed.game, seed.family, seed)

  const game = GAME_ROTATION[(id - 1 + Math.floor((id - 1) / GAME_ROTATION.length)) % GAME_ROTATION.length]
  const config = GAME_CONFIG[game]
  const family = config.families[(id + Math.floor(id / 7) + game.length) % config.families.length]
  return enrichLevel(id, game, family, {})
}

function enrichLevel(id, game, family, overrides) {
  const tier = Math.floor((id - 1) / 25) + 1
  const chapter = Math.floor((id - 1) / 50) + 1
  const mission = buildMission(id, game, family, overrides)
  return {
    id,
    game,
    title: `Nivel ${id}`,
    chapter,
    tier,
    difficulty: difficultyName(id),
    mission,
  }
}

function buildMission(id, game, family, overrides) {
  const config = GAME_CONFIG[game]
  const pressure = Math.floor((id - 1) / 20)
  const conditions = []

  if (config.mode === "points") {
    const target = overrides.target || scaledScore(config, id)
    conditions.push({ type: "score", target })
    if (["score_time", "combo", "survival"].includes(family) || id >= 120) {
      conditions.push({ type: "elapsed", max: overrides.maxElapsed || scaledElapsedLimit(config, id, pressure) })
    }
    if (["precision", "streak"].includes(family) || id >= 200) {
      conditions.push({ type: "valid" })
    }
  } else if (config.mode === "time") {
    conditions.push({ type: "complete_time", max: overrides.maxTime || scaledTime(config, id) })
    if (["precision", "multi"].includes(family) || id >= 160) conditions.push({ type: "valid" })
  } else {
    conditions.push({ type: "win" })
    if (overrides.maxTime || id > LEVEL_SEEDS.length || family !== "win" || id >= 80) {
      conditions.push({ type: "complete_time", max: overrides.maxTime || scaledTime(config, id) })
    }
    if (["precision", "multi"].includes(family) || id >= 220) conditions.push({ type: "valid" })
  }

  return {
    type: family,
    category: categoryLabel(family),
    conditions: uniqueConditions(conditions),
  }
}

function scaledScore(config, id) {
  const wave = (id % 9) * 4
  const chapterBoost = Math.floor(id / 50) * config.scoreStep * 2
  return Math.round((config.baseScore + id * config.scoreStep + wave + chapterBoost) / 5) * 5
}

function scaledTime(config, id) {
  const pressure = Math.floor(id / 12) * 7 + (id % 5) * 4
  const raw = config.baseTime - pressure
  if (raw <= config.minTime) return config.minTime + ((id * 7) % 11)
  return raw
}

function scaledElapsedLimit(config, id, pressure) {
  return Math.max(config.minLimit, config.fastLimit - pressure * 15 - (id % 6) * 8)
}

function uniqueConditions(conditions) {
  const seen = new Set()
  return conditions.filter((condition) => {
    const key = `${condition.type}:${condition.target || condition.max || ""}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeResult({ juego, valor, modo, posicion, invalido, motivo, startedAt, elapsedOverride = null }) {
  const value = Number(valor || 0)
  const time = modo === "time" ? value : null
  const score = modo === "points" ? value : Math.max(0, 600 - Number(time || 600))
  const elapsed = Number.isFinite(Number(elapsedOverride)) ? Math.max(0, Math.round(Number(elapsedOverride))) : elapsedDesdeInicio(startedAt)

  return {
    game: juego,
    invalid: Boolean(invalido),
    reason: motivo || (invalido ? "Descalificado por actividad sospechosa." : ""),
    mode: modo,
    position: posicion,
    score,
    time,
    elapsed,
    win: !invalido && (modo === "points" ? value > 0 : value > 0 && value < 9999),
  }
}

function getValidCheckpoint(context, level) {
  const checkpoint = readJson(SOLITARIO_LEVEL_CHECKPOINT_KEY, null)
  if (!checkpoint || checkpoint.levelId !== level.id) return null
  if (checkpoint.game !== level.game || checkpoint.usuario !== context.usuario) return null
  if (checkpoint.contextStartedAt !== context.startedAt) return null
  if (!checkpoint.result || checkpoint.result.game !== level.game) return null
  return checkMission(level, checkpoint.result) ? checkpoint : null
}

function elapsedDesdeInicio(startedAt) {
  const started = Date.parse(startedAt)
  return Number.isFinite(started) ? Math.max(0, Math.round((Date.now() - started) / 1000)) : null
}

function evaluateCondition(condition, result) {
  if (condition.type === "score") {
    const score = Number(result.score || 0)
    const remaining = Math.max(0, condition.target - score)
    return {
      ok: score >= condition.target,
      label: `Puntos ${score}/${condition.target}`,
      missing: remaining ? `Te faltaron ${remaining} puntos.` : "",
    }
  }

  if (condition.type === "elapsed") {
    const elapsed = Number(result.elapsed || 9999)
    const over = Math.max(0, elapsed - condition.max)
    return {
      ok: elapsed <= condition.max,
      label: `Ritmo ${formatTime(elapsed)} / ${formatTime(condition.max)}`,
      missing: over ? `Te pasaste por ${formatTime(over)}.` : "",
    }
  }

  if (condition.type === "complete_time") {
    const time = Number(result.time || 9999)
    const over = Math.max(0, time - condition.max)
    return {
      ok: result.win && time <= condition.max,
      label: `Tiempo ${result.win ? formatTime(time) : "--"} / ${formatTime(condition.max)}`,
      missing: result.win ? `Te faltaron ${formatTime(over)} para cumplir el tiempo.` : "No completaste la partida.",
    }
  }

  if (condition.type === "win") {
    return {
      ok: Boolean(result.win),
      label: result.win ? "Victoria conseguida" : "Victoria pendiente",
      missing: "Necesitabas ganar la partida.",
    }
  }

  if (condition.type === "valid") {
    return {
      ok: !result.invalid,
      label: result.invalid ? "Resultado invalido" : "Resultado valido",
      missing: result.invalid ? result.reason || "Resultado descalificado." : "",
    }
  }

  return { ok: true, label: "Objetivo registrado", missing: "" }
}

function conditionLabel(condition, game) {
  if (condition.type === "score") return `Logra ${condition.target} puntos en ${game}`
  if (condition.type === "elapsed") return `hazlo antes de ${formatTime(condition.max)}`
  if (condition.type === "complete_time") return `Completa ${game} antes de ${formatTime(condition.max)}`
  if (condition.type === "win") return `Gana una partida de ${game}`
  if (condition.type === "valid") return "sin actividad sospechosa"
  return "Completa el objetivo"
}

function categoryLabel(family) {
  return {
    score: "Puntuacion",
    score_time: "Puntuacion + velocidad",
    streak: "Racha",
    precision: "Precision",
    combo: "Combinacion",
    time: "Tiempo",
    speed: "Velocidad",
    survival: "Supervivencia",
    multi: "Objetivo multiple",
    win: "Victoria",
    win_time: "Victoria rapida",
  }[family] || "Mision"
}

function difficultyName(id) {
  if (id >= 400) return "Maestro"
  if (id >= 300) return "Elite"
  if (id >= 200) return "Avanzado"
  if (id >= 100) return "Competitivo"
  if (id >= 40) return "Retador"
  return "Inicial"
}

function updateLocalProgress(usuario, level, result, completed) {
  const progress = getLevelProgress(usuario)
  const previousBest = progress.bestByLevel[String(level.id)] || 0
  const metric = result.invalid
    ? previousBest
    : result.mode === "time" && result.time
      ? Math.max(0, 600 - result.time)
      : result.score

  progress.bestByLevel[String(level.id)] = Math.max(previousBest, metric)
  progress.lastByLevel[String(level.id)] = {
    score: result.invalid ? 0 : result.score,
    time: result.time,
    elapsed: result.elapsed,
    completed,
    invalid: result.invalid,
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

  const { data: current, error: readError } = await supabase
    .from("progreso_niveles")
    .select("completado,puntaje,tiempo")
    .eq("usuario_id", usuario)
    .eq("nivel", level.id)
    .maybeSingle()

  if (readError) {
    console.warn("No se pudo leer progreso de nivel existente", readError)
  }

  const previousScore = Number(current?.puntaje || 0)
  const resultScore = result.invalid ? 0 : Number(result.score || 0)
  const previousTime = Number(current?.tiempo || 0)
  const resultTime = Number(result.time || 0)
  const nextTime = chooseBestTime(previousTime, resultTime, result.invalid)

  const { error } = await supabase
    .from("progreso_niveles")
    .upsert({
      usuario_id: usuario,
      usuario,
      nivel: level.id,
      juego: level.game,
      completado: Boolean(current?.completado) || completed,
      puntaje: Math.max(previousScore, resultScore),
      tiempo: nextTime,
      resultado: result,
      updated_at: new Date().toISOString(),
    }, { onConflict: "usuario_id,nivel" })

  if (error) console.warn("No se pudo guardar progreso de nivel", error)
}

async function saveLevelResultToRanking(supabase, usuario, level, result, completed) {
  if (!supabase) return

  const payload = {
    usuario_id: usuario,
    usuario,
    puntos: result.invalid ? 0 : Number(result.score || 0),
    victoria: completed,
    sala_id: null,
    origen: "nivel",
    juego: level.game,
    invalido: Boolean(result.invalid),
    motivo: result.reason || "",
  }

  const { error } = await supabase.from("solitario_resultados").insert([payload])

  if (error && isMissingInvalidColumnError(error)) {
    const { invalido, motivo, ...fallbackPayload } = payload
    const { error: fallbackError } = await supabase.from("solitario_resultados").insert([fallbackPayload])
    if (fallbackError) console.warn("No se pudo registrar resultado de nivel en ranking de solitario", fallbackError)
    return
  }

  if (error) console.warn("No se pudo registrar resultado de nivel en ranking de solitario", error)
}

function chooseBestTime(previousTime, resultTime, invalid) {
  if (invalid) return previousTime || null
  if (!resultTime) return previousTime || null
  if (!previousTime) return resultTime
  return Math.min(previousTime, resultTime)
}

function isMissingInvalidColumnError(error) {
  const message = String(error?.message || error?.details || "")
  return message.includes("invalido") || message.includes("motivo")
}

function normalizeProgress(progress) {
  return {
    unlocked: Math.min(SOLITARIO_MAX_LEVEL, Math.max(1, Number(progress?.unlocked || 1))),
    done: Array.isArray(progress?.done) ? progress.done.map(Number).filter((id) => id <= SOLITARIO_MAX_LEVEL) : [],
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
