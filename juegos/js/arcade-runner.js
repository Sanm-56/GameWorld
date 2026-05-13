import { supabase } from "./supabase.js"
import { registrarPartidaDesdeRanking } from "./partidas.js"
import {
  bloquearFinalizacionInicialSolitario,
  debeSalirDelTorneo,
  esMiniTorneo,
  obtenerTiempoRestanteTorneo,
  registrarPuntosMiniTorneo,
  salidaTorneoUrl,
} from "./mini-torneo.js"
import { getArcadeGame } from "./arcade-games.js"

const MAX_ADVERTENCIAS = 3
const CRICKET_HIT_ZONE = 21
const CRICKET_RESET_DELAY = 0.55
const STACK_BASE_X = 15
const STACK_BASE_WIDTH = 70
const STACK_STAGE_MIN_X = 2
const STACK_STAGE_MAX_X = 98
const STACK_START_X = 4
const STACK_VISIBLE_BLOCKS = 7
const CLIMB_X_RANGE = [6, 88]
const CLIMB_PLAYER_WIDTH = 6.2
const CLIMB_PLAYER_FEET = 3.4
const CLIMB_GRAVITY = 74
const CLIMB_JUMP_SPEED = 36
const CLIMB_SPRING_SPEED = 54
const CLIMB_MOVE_SPEED = 42
const CLIMB_CAMERA_TARGET = 42
const CLIMB_VISIBLE_TOP = -14
const CLIMB_VISIBLE_BOTTOM = 104
const CLIMB_MAX_PLATFORMS = 12
const DODGE_LANES = [18, 42, 66]
const DODGE_X_RANGE = [10, 78]
const DODGE_Y_RANGE = [50, 88]
const DODGE_PLAYER_HITBOX = { x: 2.57, y: 2.84 }
const DODGE_OBSTACLE_HITBOX = { x: 2.78, y: 3.2 }
const DODGE_WARMUP_MS = 26000
const DODGE_BASE_SPEED = 10.8
const DODGE_SPEED_GROWTH = 1.35
const DODGE_MAX_SPEED_BONUS = 10
const DODGE_KEYBOARD_SPEED_X = 44
const DODGE_KEYBOARD_SPEED_Y = 34
const DODGE_MIN_SPAWN_GAP = 20
const DODGE_SAFE_OPENING = 17
const DODGE_ZONE_CENTERS = [12, 24, 36, 48, 60, 72, 78]
const DODGE_STILL_PRESSURE_MS = 1900
const DODGE_PRESSURE_COOLDOWN_MS = 3200
const DODGE_COVERAGE_COOLDOWN_MS = 5200
const DODGE_TOP_BAND_Y = 34
const gameKey = document.body.dataset.game
const DURACION = ["cricketarcade", "esquivaobstaculos"].includes(gameKey) ? 600 : 180
const config = getArcadeGame(gameKey)
const usuario = localStorage.getItem("usuario")

if (!usuario) window.location.href = "index.html"

if (gameKey === "esquivaobstaculos") {
  const accesoPermitido = await validarAccesoEsquiva()
  if (!accesoPermitido) await new Promise(() => {})
}

const lockKey = `${gameKey}_activo`
if (localStorage.getItem(lockKey)) {
  alert("Ya tienes el juego abierto en otra pestana")
  window.location.href = salidaTorneoUrl()
}
localStorage.setItem(lockKey, "abierto")
window.addEventListener("beforeunload", () => localStorage.removeItem(lockKey))

const els = {
  title: document.getElementById("gameTitle"),
  desc: document.getElementById("gameDesc"),
  user: document.getElementById("usuarioLabel"),
  timer: document.getElementById("reloj"),
  score: document.getElementById("score"),
  level: document.getElementById("level"),
  combo: document.getElementById("combo"),
  lives: document.getElementById("lives"),
  status: document.getElementById("status"),
  stage: document.getElementById("stage"),
  action: document.getElementById("actionBtn"),
}

document.documentElement.style.setProperty("--accent", config.accent)
document.documentElement.style.setProperty("--secondary", config.secondary)
els.title.textContent = config.label
els.desc.textContent = config.description
els.user.textContent = usuario || "Jugador"
document.querySelector(".top")?.setAttribute("data-mark", config.icon || "AR")

let score = 0
let level = 1
let combo = 0
let bestCombo = 0
let lives = 3
let advertencias = 0
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false
let juegoActivo = false
let ultimoCambio = 0
let ultimoSwing = 0
let startMs = performance.now()
let lastTs = 0
let objects = []
let spawnTimer = 0
let state = createState()
let timerId = null
let tournamentCheckId = null
let rafId = null
let cricketScene = null
let dodgeScene = null
let dodgeResizeObserver = null
let dodgeStageWidth = 0
let dodgeStageHeight = 0
let lastDodgeMoveAt = 0
let dodgeInvulnerableUntil = 0
let dodgeVisualX = 42
let dodgeVisualY = 78
let dodgeVisualVelocity = 0
let dodgeLean = 0
let dodgeMovePulseUntil = 0
let dodgeFeedback = ""
let dodgeFeedbackUntil = 0
let dodgeInputX = 0
let dodgeInputY = 0
let climbInputX = 0
let climbJumpQueued = false
let climbLastScoredHeight = 0
let dodgeLastTrackedX = 42
let dodgeLastTrackedY = 78
let dodgeStillMs = 0
let dodgeLastPressureAt = 0
let dodgeCoverageIndex = 0
let runId = ""
const inputController = new AbortController()
const dodgePressedKeys = new Set()
const dodgeButtonInputs = new Set()
const dodgeZoneLastThreatAt = DODGE_ZONE_CENTERS.map(() => 0)
const climbPressedKeys = new Set()
const climbButtonInputs = new Set()

if (config.type === "stack") resetStackState()
if (config.type === "climb") resetClimbState()

localStorage.setItem("juego_actual", gameKey)

async function validarAccesoEsquiva() {
  if (!usuario) return false

  if (esMiniTorneo(gameKey)) {
    const salaId = localStorage.getItem("solitario_sala_id")
    const [{ data: sala }, { data: participante }] = await Promise.all([
      supabase
        .from("salas")
        .select("estado,juego")
        .eq("id", salaId)
        .maybeSingle(),
      supabase
        .from("sala_jugadores")
        .select("id")
        .eq("sala_id", salaId)
        .eq("usuario_id", usuario)
        .maybeSingle(),
    ])

    if (sala?.estado === "en_juego" && sala?.juego === gameKey && participante) return true
    window.location.replace(salidaTorneoUrl())
    return false
  }

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado,juego_actual,inicio_torneo")
    .eq("id", 1)
    .maybeSingle()

  if (data?.estado === "iniciado" && data?.juego_actual === gameKey && data?.inicio_torneo) return true
  window.location.replace("lobby.html")
  return false
}

function limpiarResultadoEsquivaPrevio() {
  if (gameKey !== "esquivaobstaculos") return
  localStorage.removeItem("fin_juego")
  localStorage.removeItem(`${gameKey}_puntos`)
  localStorage.removeItem(`${gameKey}_elapsed`)
  localStorage.removeItem(`${gameKey}_combo`)
  localStorage.removeItem(`${gameKey}_run_id`)
  localStorage.removeItem(`${gameKey}_finished_run_id`)
  localStorage.removeItem(`${gameKey}_finished_at`)
}

function createState() {
  return {
    x: 42,
    y: 78,
    vx: 125,
    target: 50,
    ball: null,
    ballSpeed: 42,
    cricket: createCricketState(),
    stackWidth: STACK_BASE_WIDTH,
    stackX: STACK_BASE_X,
    stackDir: 1,
    climb: createClimbState(),
    platforms: [],
    nextId: 1,
  }
}

function createClimbState() {
  return {
    playerY: 6,
    vy: 0,
    cameraY: 0,
    height: 0,
    lastPlatformY: 0,
    lastSafeX: 42,
    springCooldownY: -80,
    spikeCooldownY: -120,
  }
}

function createCricketState() {
  return {
    x: 92,
    y: 43,
    target: CRICKET_HIT_ZONE,
    speed: 42,
    phase: "pitch",
    resetIn: 0,
    lastActionAt: 0,
    result: "",
    resultPower: 0,
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetStackState() {
  state.stackX = STACK_BASE_X
  state.stackWidth = STACK_BASE_WIDTH
  state.stackDir = 1
  state.x = STACK_START_X
}

function getStackMaxX(width = state.stackWidth) {
  return Math.max(STACK_STAGE_MIN_X, STACK_STAGE_MAX_X - width)
}

function prepareNextStackBlock() {
  const maxX = getStackMaxX()
  const startFromLeft = Math.random() < 0.5
  state.stackDir = startFromLeft ? 1 : -1
  state.x = startFromLeft ? STACK_STAGE_MIN_X : maxX
}

function resetClimbState() {
  state.climb = createClimbState()
  state.x = 42
  state.y = 72
  state.platforms = [
    createClimbPlatform(42, 0, 32, "start"),
    createClimbPlatform(24, 16, 26, "normal"),
    createClimbPlatform(62, 32, 24, "normal"),
    createClimbPlatform(38, 49, 23, "spring"),
  ]
  state.climb.lastPlatformY = 49
  state.climb.lastSafeX = 38
  climbLastScoredHeight = 0
}

function createClimbPlatform(x, y, w, type = "normal") {
  return {
    id: state.nextId++,
    x: clamp(x, CLIMB_X_RANGE[0], CLIMB_X_RANGE[1]),
    y,
    w,
    type,
    touched: false,
    phase: rand(0, Math.PI * 2),
    baseX: clamp(x, CLIMB_X_RANGE[0], CLIMB_X_RANGE[1]),
  }
}

function addScore(points) {
  if (juegoTerminado || !juegoActivo) return
  const gained = Math.max(0, Math.round(points * (1 + combo * 0.04)))
  score += gained
  combo += 1
  bestCombo = Math.max(bestCombo, combo)
  level = Math.max(1, Math.floor(score / 180) + 1)
  setStatus(`+${gained} puntos`)
  renderHud()
}

function miss(reason = "Fallaste") {
  if (juegoTerminado) return
  combo = 0
  lives = Math.max(0, lives - 1)
  setStatus(reason)
  renderHud()
  if (lives <= 0) endGame("perdiste")
}

function resetCricketDelivery(message = "") {
  const nextSpeed = Math.min(112, 44 + level * 5.8 + Math.min(18, combo * 0.7))
  state.cricket = {
    ...createCricketState(),
    speed: nextSpeed,
    target: CRICKET_HIT_ZONE + rand(-1.8, 1.8),
  }
  state.x = state.cricket.x
  state.target = state.cricket.target
  if (message) setStatus(message)
}

function renderHud() {
  els.score.textContent = String(score)
  els.level.textContent = String(level)
  els.combo.textContent = String(bestCombo)
  els.lives.textContent = String(Math.max(0, lives))
}

function setStatus(text) {
  els.status.textContent = text
}

function clearStage() {
  els.stage.querySelectorAll(".actor,.target,.trail,.block,.platform,.hoop,.ball,.bat,.mountain,.dodge-lane,.dodge-road-glow,.dodge-feedback").forEach((node) => node.remove())
}

function makeEl(className, style = {}, text = "") {
  const el = document.createElement("div")
  el.className = className
  el.textContent = text
  Object.assign(el.style, style)
  els.stage.appendChild(el)
  return el
}

function render() {
  if (config.type === "timing") return renderTiming()
  if (config.type === "dodge") return renderDodge()
  if (config.type === "stack") return renderStack()
  if (config.type === "climb") return renderClimb()
  return renderBasket()
}

function renderTiming() {
  if (!cricketScene) {
    clearStage()
    cricketScene = {
      pitch: makeEl("cricket-pitch"),
      crease: makeEl("cricket-crease"),
      wicket: makeEl("cricket-wicket"),
      target: makeEl("target cricket-zone"),
      bat: makeEl("bat cricket-bat", {}, "BAT"),
      ball: makeEl("ball actor cricket-ball"),
    }
  }

  const cricket = state.cricket
  cricketScene.target.style.left = `${cricket.target - 6}%`
  cricketScene.target.style.width = "14%"
  cricketScene.ball.style.left = `${cricket.x}%`
  cricketScene.ball.style.bottom = `${cricket.y}%`
  cricketScene.ball.classList.toggle("hit", cricket.phase === "result" && cricket.result === "hit")
  cricketScene.ball.classList.toggle("missed", cricket.phase === "result" && cricket.result === "miss")
  cricketScene.bat.classList.toggle("swing", performance.now() - ultimoSwing < 150)
}

function renderDodge() {
  if (!dodgeScene) {
    clearStage()
    updateDodgeStageSize()
    dodgeResizeObserver = new ResizeObserver(updateDodgeStageSize)
    dodgeResizeObserver.observe(els.stage)
    const fragment = document.createDocumentFragment()
    DODGE_LANES.forEach((lane) => {
      const el = document.createElement("div")
      el.className = "dodge-lane"
      el.style.left = `${lane}%`
      fragment.appendChild(el)
    })
    const glow = document.createElement("div")
    glow.className = "dodge-road-glow"
    fragment.appendChild(glow)
    const player = document.createElement("div")
    player.className = "actor dodge-player"
    player.style.left = "0"
    player.style.top = "0"
    fragment.appendChild(player)
    const feedback = document.createElement("div")
    feedback.className = "dodge-feedback"
    feedback.hidden = true
    fragment.appendChild(feedback)
    els.stage.appendChild(fragment)
    dodgeScene = { player, feedback, obstacles: new Map() }
  }

  const actorClass = performance.now() < dodgeInvulnerableUntil ? "actor dodge-player invulnerable" : "actor dodge-player"
  const pulse = performance.now() < dodgeMovePulseUntil ? 1 : 0
  const stretch = Math.min(0.08, Math.abs(dodgeLean) * 0.003) + pulse * 0.025
  const playerX = dodgeStageWidth * dodgeVisualX / 100
  const playerY = dodgeStageHeight * dodgeVisualY / 100
  dodgeScene.player.className = actorClass
  dodgeScene.player.style.transform = `translate3d(${playerX}px,${playerY}px,0) translate(-50%,-50%) rotate(${dodgeLean}deg) scale(${1 + stretch},${1 - pulse * 0.018})`

  const active = new Set()
  objects.forEach((item) => {
    const id = String(item.id)
    active.add(id)
    let el = dodgeScene.obstacles.get(id)
    if (!el) {
      el = document.createElement("div")
      dodgeScene.obstacles.set(id, el)
      els.stage.appendChild(el)
    }
    el.className = `block danger dodge-obstacle dodge-obstacle-${item.variant || 0}`
    el.style.left = `${item.x + Number(item.drift || 0)}%`
    el.style.top = `${item.y}%`
    el.style.transform = `translate3d(-50%,0,0) rotate(${45 + Number(item.spin || 0)}deg) scale(${Number(item.scale || 1)})`
  })

  dodgeScene.obstacles.forEach((el, id) => {
    if (active.has(id)) return
    el.remove()
    dodgeScene.obstacles.delete(id)
  })

  if (dodgeFeedback && performance.now() < dodgeFeedbackUntil) {
    dodgeScene.feedback.hidden = false
    dodgeScene.feedback.textContent = dodgeFeedback
  } else {
    dodgeScene.feedback.hidden = true
  }
}

function updateDodgeStageSize() {
  dodgeStageWidth = els.stage.clientWidth || 1
  dodgeStageHeight = els.stage.clientHeight || 1
}

function renderStack() {
  clearStage()
  const visibleBlocks = objects.slice(-STACK_VISIBLE_BLOCKS)
  const hiddenCount = Math.max(0, objects.length - visibleBlocks.length)
  const showBase = hiddenCount === 0
  if (showBase) {
    makeEl("block base", { left: `${STACK_BASE_X}%`, bottom: "8%", width: `${STACK_BASE_WIDTH}%` })
  } else {
    const anchor = visibleBlocks[0]
    makeEl("block base stack-camera-base", { left: `${anchor.x}%`, bottom: "8%", width: `${anchor.w}%` })
  }
  visibleBlocks.forEach((item, index) => makeEl("block", {
    left: `${item.x}%`,
    bottom: `${8 + (index + 1) * 7}%`,
    width: `${item.w}%`,
  }))
  makeEl("block active", { left: `${state.x}%`, bottom: `${15 + visibleBlocks.length * 7}%`, width: `${state.stackWidth}%` })
}

function renderClimb() {
  clearStage()
  makeEl("mountain climb-sky")
  const climb = state.climb
  state.platforms.forEach((platform) => {
    const top = climbWorldToScreen(platform.y)
    if (top < CLIMB_VISIBLE_TOP || top > CLIMB_VISIBLE_BOTTOM) return
    const el = makeEl(`platform climb-platform climb-platform-${platform.type}`, {
      left: `${platform.x}%`,
      top: `${top}%`,
      width: `${platform.w}%`,
    })
    if (platform.type === "spring") {
      const spring = document.createElement("i")
      spring.className = "climb-spring"
      el.appendChild(spring)
    }
    if (platform.type === "spike") {
      const spike = document.createElement("i")
      spike.className = "climb-spike"
      el.appendChild(spike)
    }
  })
  makeEl("actor climb-player", {
    left: `${state.x}%`,
    top: `${climbWorldToScreen(climb.playerY)}%`,
  })
}

function renderBasket() {
  clearStage()
  makeEl("hoop", { right: "10%", top: `${state.target}%` })
  makeEl("ball", { left: "14%", bottom: "16%" })
  makeEl("trail", { left: "18%", bottom: "20%", width: `${state.x}%`, transform: `rotate(${-20 - level * 2}deg)` })
}

function loop(ts) {
  if (juegoTerminado) return
  if (!juegoActivo) {
    render()
    rafId = requestAnimationFrame(loop)
    return
  }
  if (!lastTs) lastTs = ts
  const dt = Math.min(0.05, (ts - lastTs) / 1000)
  lastTs = ts
  update(dt)
  render()
  rafId = requestAnimationFrame(loop)
}

function updateCricket(dt) {
  const cricket = state.cricket

  if (cricket.phase === "result") {
    cricket.resetIn -= dt
    if (cricket.result === "hit") {
      cricket.x = clamp(cricket.x + (86 + cricket.resultPower * 0.5) * dt, 0, 108)
      cricket.y = clamp(cricket.y + (42 + cricket.resultPower * 0.2) * dt, 10, 86)
    } else {
      cricket.x = clamp(cricket.x - 34 * dt, -8, 108)
      cricket.y = clamp(cricket.y - 14 * dt, 8, 86)
    }
    if (cricket.resetIn <= 0 && !juegoTerminado) {
      resetCricketDelivery(cricket.result === "hit" ? "Siguiente bola" : "Nueva bola")
    }
    return
  }

  cricket.x -= cricket.speed * dt
  const travel = clamp((92 - cricket.x) / 76, 0, 1)
  cricket.y = 42 - Math.sin(travel * Math.PI) * 10 + travel * 2
  state.x = cricket.x
  state.target = cricket.target

  if (cricket.x <= 7) {
    cricket.phase = "result"
    cricket.result = "miss"
    cricket.resetIn = CRICKET_RESET_DELAY
    miss("No golpeaste la bola")
  }
}

function resolveCricketSwing() {
  const cricket = state.cricket
  const now = performance.now()
  if (cricket.phase !== "pitch") return
  if (now - cricket.lastActionAt < 180) return
  cricket.lastActionAt = now
  ultimoSwing = now

  const diff = Math.abs(cricket.x - cricket.target)
  cricket.phase = "result"
  cricket.resetIn = CRICKET_RESET_DELAY

  if (diff <= 2.6) {
    cricket.result = "hit"
    cricket.resultPower = 96
    addScore(85 + level * 6)
    setStatus("Golpe perfecto")
    return
  }

  if (diff <= 6.4) {
    cricket.result = "hit"
    cricket.resultPower = 68
    addScore(48 + level * 4)
    setStatus("Buen golpe")
    return
  }

  if (diff <= 10.5) {
    cricket.result = "hit"
    cricket.resultPower = 38
    addScore(20 + level * 2)
    setStatus("Roce salvado")
    return
  }

  cricket.result = "miss"
  cricket.resultPower = 0
  miss(cricket.x > cricket.target ? "Swing muy temprano" : "Swing tarde")
}

function moveDodge(delta) {
  if (juegoTerminado || !juegoActivo) {
    setStatus("Espera el inicio oficial del torneo")
    return
  }
  const current = nearestDodgeLaneIndex(state.x)
  setDodgeLane(current + delta, delta < 0 ? "Izquierda" : "Derecha", 54)
}

function cycleDodgeLane() {
  if (juegoTerminado || !juegoActivo) {
    setStatus("Espera el inicio oficial del torneo")
    return
  }
  const current = nearestDodgeLaneIndex(state.x)
  setDodgeLane((current + 1) % DODGE_LANES.length, "Cambio", 54)
}

function moveDodgeToPointer(clientX, clientY) {
  if (juegoTerminado || !juegoActivo) {
    setStatus("Espera el inicio oficial del torneo")
    return
  }
  const rect = els.stage.getBoundingClientRect()
  const ratioX = rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0.5
  const ratioY = rect.height ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0.78
  setDodgeTarget(
    DODGE_X_RANGE[0] + ratioX * (DODGE_X_RANGE[1] - DODGE_X_RANGE[0]),
    DODGE_Y_RANGE[0] + ratioY * (DODGE_Y_RANGE[1] - DODGE_Y_RANGE[0]),
    "Mover",
    16
  )
}

function setDodgeLane(index, feedback, cooldownMs) {
  const next = DODGE_LANES[clamp(index, 0, DODGE_LANES.length - 1)]
  setDodgeTarget(next, state.y, feedback, cooldownMs)
}

function setDodgeTarget(x, y, feedback, cooldownMs) {
  const now = performance.now()
  if (now - lastDodgeMoveAt < cooldownMs) return

  const nextX = clamp(x, DODGE_X_RANGE[0], DODGE_X_RANGE[1])
  const nextY = clamp(y, DODGE_Y_RANGE[0], DODGE_Y_RANGE[1])
  if (Math.abs(nextX - state.x) < 0.1 && Math.abs(nextY - state.y) < 0.1) return

  lastDodgeMoveAt = now
  state.x = nextX
  state.y = nextY
  dodgeMovePulseUntil = now + 145
  showDodgeFeedback(feedback)
}

function nearestDodgeLaneIndex(x) {
  return DODGE_LANES.reduce((best, lane, index) => (
    Math.abs(lane - x) < Math.abs(DODGE_LANES[best] - x) ? index : best
  ), 0)
}

function showDodgeFeedback(text) {
  dodgeFeedback = text
  dodgeFeedbackUntil = performance.now() + 650
}

function updateDodge(dt) {
  updateDodgeDirectionalInput(dt)
  updateDodgeSafeZoneTracking(dt)
  const previousX = dodgeVisualX
  const ease = 1 - Math.exp(-dt * 12.5)
  dodgeVisualX += (state.x - dodgeVisualX) * ease
  dodgeVisualY += (state.y - dodgeVisualY) * (1 - Math.exp(-dt * 10.5))
  if (Math.abs(state.x - dodgeVisualX) < 0.04) dodgeVisualX = state.x
  if (Math.abs(state.y - dodgeVisualY) < 0.04) dodgeVisualY = state.y
  dodgeVisualVelocity = dt > 0 ? (dodgeVisualX - previousX) / dt : 0
  const targetLean = clamp(dodgeVisualVelocity * 0.09, -11, 11)
  dodgeLean += (targetLean - dodgeLean) * Math.min(1, dt * 17)
  const elapsedMs = juegoActivo ? performance.now() - startMs : 0
  const warmup = clamp(elapsedMs / DODGE_WARMUP_MS, 0, 1)
  const timeDifficulty = clamp(elapsedMs / 180000, 0, 1)
  const difficulty = (Math.max(0, level - 1) * 0.55 + timeDifficulty * 3.5) * warmup
  spawnTimer -= dt
  const maxObstacles = 3 + Math.floor(clamp(difficulty / 2.4, 0, 2))
  const ultimo = objects[objects.length - 1]
  if (spawnTimer <= 0 && objects.length < maxObstacles && (!ultimo || ultimo.y > DODGE_MIN_SPAWN_GAP)) {
    spawnTimer = Math.max(0.72, rand(1.18, 1.68) - difficulty * 0.035)
    const spawn = chooseDodgeSpawn(difficulty, warmup)
    const scale = rand(0.78, 1.02)
    const driftRange = warmup < 0.35 ? 0.35 : 0.85
    const previousTopObstacle = objects.find((item) => item.y < DODGE_MIN_SPAWN_GAP + 10)
    const x = resolveDodgeSpawnX(spawn.x, previousTopObstacle)
    markDodgeZoneThreat(x)
    objects.push({
      id: state.nextId++,
      x,
      y: -10,
      hit: false,
      speed: (spawn.kind === "pressure" ? rand(0.68, 0.88) : rand(0.72, 0.95)) + Math.min(0.13, difficulty * 0.008),
      drift: rand(-driftRange, driftRange) * Math.max(0.25, warmup),
      spin: rand(-18, 18),
      scale: spawn.kind === "pressure" ? Math.min(scale, 0.9) : scale,
      variant: Math.floor(rand(0, 3)),
    })
  } else if (spawnTimer <= 0) {
    spawnTimer = 0.18
  }
  objects.forEach((item) => {
    const fallSpeed = DODGE_BASE_SPEED + Math.min(DODGE_MAX_SPEED_BONUS, difficulty * DODGE_SPEED_GROWTH)
    item.y += fallSpeed * Number(item.speed || 1) * dt
    item.drift = clamp(Number(item.drift || 0) + Math.sin((performance.now() + item.id * 211) / 520) * 0.007 * Math.max(0.35, warmup), -1.15, 1.15)
    item.spin = Number(item.spin || 0) + 22 * dt
  })
  objects = objects.filter((item) => {
    if (item.y > 96) {
      addScore(10 + level)
      if (combo > 0 && combo % 5 === 0) showDodgeFeedback(`Racha x${combo}`)
      return false
    }
    const puedeGolpear = performance.now() >= dodgeInvulnerableUntil
    const obstacleX = item.x + Number(item.drift || 0)
    const hitX = DODGE_PLAYER_HITBOX.x + DODGE_OBSTACLE_HITBOX.x * Number(item.scale || 1)
    const hitY = DODGE_PLAYER_HITBOX.y + DODGE_OBSTACLE_HITBOX.y * Number(item.scale || 1)
    if (!item.hit && puedeGolpear && Math.abs(item.y - state.y) < hitY && Math.abs(obstacleX - state.x) < hitX) {
      item.hit = true
      dodgeInvulnerableUntil = performance.now() + 850
      showDodgeFeedback("Impacto")
      miss("Choque")
      return false
    }
    return true
  })
}

function updateDodgeSafeZoneTracking(dt) {
  const moved = Math.hypot(state.x - dodgeLastTrackedX, state.y - dodgeLastTrackedY)
  const hasInput = Math.abs(dodgeInputX) > 0.12 || Math.abs(dodgeInputY) > 0.12
  if (moved < 0.22 && !hasInput) {
    dodgeStillMs += dt * 1000
    return
  }
  dodgeStillMs = Math.max(0, dodgeStillMs - dt * 2600)
  dodgeLastTrackedX = state.x
  dodgeLastTrackedY = state.y
}

function chooseDodgeSpawn(difficulty, warmup) {
  const now = performance.now()
  const canPressurePlayer = warmup > 0.22
    && dodgeStillMs >= DODGE_STILL_PRESSURE_MS
    && now - dodgeLastPressureAt > DODGE_PRESSURE_COOLDOWN_MS
  if (canPressurePlayer) {
    dodgeLastPressureAt = now
    dodgeStillMs = Math.max(0, dodgeStillMs - 1050)
    return {
      kind: "pressure",
      x: clamp(state.x + rand(-4.5, 4.5), DODGE_X_RANGE[0] + 2, DODGE_X_RANGE[1] - 2),
    }
  }

  const uncoveredZone = findDodgeUncoveredZone(now)
  const coverageChance = clamp(0.16 + difficulty * 0.025, 0.16, 0.34)
  if (warmup > 0.35 && uncoveredZone && Math.random() < coverageChance) {
    return { kind: "coverage", x: uncoveredZone }
  }

  if (Math.random() < 0.62) {
    return { kind: "lane", x: DODGE_LANES[Math.floor(rand(0, DODGE_LANES.length))] }
  }
  return { kind: "free", x: rand(DODGE_X_RANGE[0] + 6, DODGE_X_RANGE[1] - 6) }
}

function findDodgeUncoveredZone(now) {
  const staleZones = DODGE_ZONE_CENTERS
    .map((x, index) => ({ x, index, age: now - dodgeZoneLastThreatAt[index] }))
    .filter((zone) => zone.age > DODGE_COVERAGE_COOLDOWN_MS)
    .sort((a, b) => b.age - a.age)

  for (const zone of staleZones) {
    dodgeCoverageIndex = zone.index
    if (isDodgeSpawnRouteOpen(zone.x)) return zone.x
  }

  for (let step = 0; step < DODGE_ZONE_CENTERS.length; step += 1) {
    const index = (dodgeCoverageIndex + step + 1) % DODGE_ZONE_CENTERS.length
    const x = DODGE_ZONE_CENTERS[index]
    if (!isDodgeSpawnRouteOpen(x)) continue
    dodgeCoverageIndex = index
    return x
  }
  return null
}

function resolveDodgeSpawnX(preferredX, previousTopObstacle) {
  let x = clamp(preferredX, DODGE_X_RANGE[0], DODGE_X_RANGE[1])
  if (previousTopObstacle && Math.abs(previousTopObstacle.x - x) < DODGE_SAFE_OPENING) {
    x = clamp(x + (x < 44 ? DODGE_SAFE_OPENING : -DODGE_SAFE_OPENING), DODGE_X_RANGE[0], DODGE_X_RANGE[1])
  }
  if (isDodgeSpawnRouteOpen(x)) return x

  const alternates = DODGE_ZONE_CENTERS
    .map((zoneX) => ({ x: zoneX, distance: Math.abs(zoneX - x) }))
    .sort((a, b) => b.distance - a.distance)
  const safe = alternates.find((candidate) => isDodgeSpawnRouteOpen(candidate.x))
  return safe ? safe.x : x
}

function isDodgeSpawnRouteOpen(x) {
  const topObstacles = objects.filter((item) => item.y < DODGE_TOP_BAND_Y)
  const nearby = topObstacles.filter((item) => Math.abs(item.x + Number(item.drift || 0) - x) < DODGE_SAFE_OPENING * 0.62)
  if (nearby.length >= 1) return false

  const leftOpen = !topObstacles.some((item) => Math.abs(item.x + Number(item.drift || 0) - (x - DODGE_SAFE_OPENING)) < 7)
  const rightOpen = !topObstacles.some((item) => Math.abs(item.x + Number(item.drift || 0) - (x + DODGE_SAFE_OPENING)) < 7)
  return leftOpen || rightOpen
}

function markDodgeZoneThreat(x) {
  const now = performance.now()
  let nearestIndex = 0
  DODGE_ZONE_CENTERS.forEach((zoneX, index) => {
    if (Math.abs(zoneX - x) < Math.abs(DODGE_ZONE_CENTERS[nearestIndex] - x)) nearestIndex = index
  })
  dodgeZoneLastThreatAt[nearestIndex] = now
}

function climbWorldToScreen(worldY) {
  return 78 - (worldY - state.climb.cameraY)
}

function updateClimb(dt) {
  const climb = state.climb
  updateClimbDirectionalInput(dt)
  ensureClimbPlatforms()
  updateMovingClimbPlatforms(dt)

  const prevY = climb.playerY
  state.x = clamp(state.x + climbInputX * CLIMB_MOVE_SPEED * dt, CLIMB_X_RANGE[0], CLIMB_X_RANGE[1])

  if (climbJumpQueued && climb.vy > -10) {
    climb.vy = Math.max(climb.vy, CLIMB_JUMP_SPEED * 0.82)
    climbJumpQueued = false
  }

  climb.vy -= CLIMB_GRAVITY * dt
  climb.playerY += climb.vy * dt
  resolveClimbPlatformCollisions(prevY)
  resolveClimbSpikeHits()

  const targetCamera = Math.max(0, climb.playerY - (78 - CLIMB_CAMERA_TARGET))
  climb.cameraY += (targetCamera - climb.cameraY) * Math.min(1, dt * 5.5)
  state.y = climbWorldToScreen(climb.playerY)

  const height = Math.max(0, Math.floor(climb.playerY))
  if (height > climb.height) climb.height = height
  if (climb.height - climbLastScoredHeight >= 12) {
    const steps = Math.floor((climb.height - climbLastScoredHeight) / 12)
    climbLastScoredHeight += steps * 12
    addScore(steps * (10 + Math.floor(level * 1.5)))
  }

  if (climb.playerY < climb.cameraY - 30) {
    miss("Caida")
    if (!juegoTerminado) resetClimbAfterFall()
  }

  state.platforms = state.platforms.filter((platform) => platform.y > climb.cameraY - 22)
}

function updateClimbDirectionalInput(dt) {
  const keyX = (climbPressedKeys.has("ArrowRight") || climbPressedKeys.has("KeyD") ? 1 : 0)
    - (climbPressedKeys.has("ArrowLeft") || climbPressedKeys.has("KeyA") ? 1 : 0)
  const buttonX = (climbButtonInputs.has("right") ? 1 : 0) - (climbButtonInputs.has("left") ? 1 : 0)
  const rawX = clamp(keyX + buttonX, -1, 1)
  climbInputX += (rawX - climbInputX) * Math.min(1, dt * 13)
}

function ensureClimbPlatforms() {
  const climb = state.climb
  const maxY = climb.cameraY + 112
  while (climb.lastPlatformY < maxY && state.platforms.length < CLIMB_MAX_PLATFORMS + 4) {
    const difficulty = clamp(climb.lastPlatformY / 420, 0, 1)
    const gap = rand(13.5 + difficulty * 1.8, 18.5 + difficulty * 4.2)
    const nextY = climb.lastPlatformY + gap
    const maxStep = 30 - difficulty * 6
    const nextX = clamp(climb.lastSafeX + rand(-maxStep, maxStep), 12, 82)
    const width = rand(24 - difficulty * 5, 31 - difficulty * 4)
    const type = chooseClimbPlatformType(nextY, difficulty)
    if (type === "spike") {
      const spikeX = clamp(nextX + (nextX < 50 ? rand(14, 24) : rand(-24, -14)), 12, 82)
      state.platforms.push(createClimbPlatform(spikeX, nextY + rand(-2, 2), 17, "spike"))
      state.platforms.push(createClimbPlatform(nextX, nextY, width, "normal"))
    } else {
      state.platforms.push(createClimbPlatform(nextX, nextY, width, type))
    }
    climb.lastPlatformY = nextY
    climb.lastSafeX = nextX
  }
}

function chooseClimbPlatformType(y, difficulty) {
  if (y < 65) return "normal"
  if (y - state.climb.springCooldownY > 90 && Math.random() < 0.12) {
    state.climb.springCooldownY = y
    return "spring"
  }
  if (y - state.climb.spikeCooldownY > 80 && Math.random() < 0.08 + difficulty * 0.08) {
    state.climb.spikeCooldownY = y
    return "spike"
  }
  if (difficulty > 0.28 && Math.random() < 0.16 + difficulty * 0.12) return "moving"
  return "normal"
}

function updateMovingClimbPlatforms(dt) {
  const difficulty = clamp(state.climb.height / 420, 0, 1)
  state.platforms.forEach((platform) => {
    if (platform.type !== "moving") return
    platform.phase += dt * (1.2 + difficulty)
    platform.x = clamp(platform.baseX + Math.sin(platform.phase) * (7 + difficulty * 5), 10, 84)
  })
}

function resolveClimbPlatformCollisions(prevY) {
  const climb = state.climb
  if (climb.vy > 0) return
  const feetY = climb.playerY - CLIMB_PLAYER_FEET
  const prevFeetY = prevY - CLIMB_PLAYER_FEET
  const platform = state.platforms
    .filter((item) => item.type !== "spike")
    .find((item) => prevFeetY >= item.y && feetY <= item.y && Math.abs(state.x - item.x) <= item.w * 0.5 + CLIMB_PLAYER_WIDTH)

  if (!platform) return

  climb.playerY = platform.y + CLIMB_PLAYER_FEET
  climb.vy = platform.type === "spring" ? CLIMB_SPRING_SPEED : CLIMB_JUMP_SPEED
  if (!platform.touched) {
    platform.touched = true
    addScore(platform.type === "spring" ? 32 : 14)
    if (platform.type === "spring") setStatus("Impulso")
  }
}

function resolveClimbSpikeHits() {
  const climb = state.climb
  const spike = state.platforms.find((item) => item.type === "spike"
    && Math.abs(item.y - (climb.playerY - CLIMB_PLAYER_FEET)) < 3.6
    && Math.abs(state.x - item.x) <= item.w * 0.42 + CLIMB_PLAYER_WIDTH)
  if (!spike) return
  spike.type = "hit"
  miss("Pinchos")
  if (!juegoTerminado) {
    climb.vy = CLIMB_JUMP_SPEED * 0.75
    climb.playerY += 2
  }
}

function resetClimbAfterFall() {
  const climb = state.climb
  const safe = state.platforms
    .filter((platform) => platform.type !== "spike" && platform.y >= climb.cameraY)
    .sort((a, b) => a.y - b.y)[0]
  if (!safe) {
    endGame("perdiste")
    return
  }
  state.x = safe.x
  climb.playerY = safe.y + CLIMB_PLAYER_FEET + 1
  climb.vy = CLIMB_JUMP_SPEED
}

function updateDodgeDirectionalInput(dt) {
  if (config.type !== "dodge" || juegoTerminado || !juegoActivo) return
  const keyX = (dodgePressedKeys.has("ArrowRight") || dodgePressedKeys.has("KeyD") ? 1 : 0)
    - (dodgePressedKeys.has("ArrowLeft") || dodgePressedKeys.has("KeyA") ? 1 : 0)
  const keyY = (dodgePressedKeys.has("ArrowDown") || dodgePressedKeys.has("KeyS") ? 1 : 0)
    - (dodgePressedKeys.has("ArrowUp") || dodgePressedKeys.has("KeyW") ? 1 : 0)
  const buttonX = (dodgeButtonInputs.has("right") ? 1 : 0) - (dodgeButtonInputs.has("left") ? 1 : 0)
  const buttonY = (dodgeButtonInputs.has("down") ? 1 : 0) - (dodgeButtonInputs.has("up") ? 1 : 0)
  const rawX = clamp(keyX + buttonX, -1, 1)
  const rawY = clamp(keyY + buttonY, -1, 1)
  dodgeInputX += (rawX - dodgeInputX) * Math.min(1, dt * 14)
  dodgeInputY += (rawY - dodgeInputY) * Math.min(1, dt * 14)
  if (Math.abs(dodgeInputX) < 0.02 && Math.abs(dodgeInputY) < 0.02) return
  const diagonal = dodgeInputX && dodgeInputY ? 0.72 : 1
  state.x = clamp(state.x + dodgeInputX * DODGE_KEYBOARD_SPEED_X * diagonal * dt, DODGE_X_RANGE[0], DODGE_X_RANGE[1])
  state.y = clamp(state.y + dodgeInputY * DODGE_KEYBOARD_SPEED_Y * diagonal * dt, DODGE_Y_RANGE[0], DODGE_Y_RANGE[1])
  dodgeMovePulseUntil = performance.now() + 80
}

function update(dt) {
  if (config.type === "timing") {
    updateCricket(dt)
    return
  }

  if (config.type === "dodge") {
    updateDodge(dt)
    return
  }

  if (config.type === "stack") {
    state.x += state.vx * state.stackDir * dt / 8
    const maxX = getStackMaxX()
    if (state.x <= STACK_STAGE_MIN_X) {
      state.x = STACK_STAGE_MIN_X
      state.stackDir = 1
    } else if (state.x >= maxX) {
      state.x = maxX
      state.stackDir = -1
    }
    return
  }

  if (config.type === "climb") {
    updateClimb(dt)
    return
  }

  state.x = clamp(state.x + 38 * dt, 10, 78)
}

function action() {
  if (juegoTerminado) return
  if (!juegoActivo) {
    setStatus("Espera a que cargue el cronometro")
    return
  }

  if (config.type === "timing") {
    resolveCricketSwing()
    return
  }

  if (config.type === "dodge") {
    cycleDodgeLane()
    return
  }

  if (config.type === "stack") {
    const base = objects.length ? objects[objects.length - 1] : { x: STACK_BASE_X, w: STACK_BASE_WIDTH }
    const overlapLeft = Math.max(base.x, state.x)
    const overlapRight = Math.min(base.x + base.w, state.x + state.stackWidth)
    const overlap = overlapRight - overlapLeft
    if (overlap <= 4) {
      miss("La pieza cayo fuera")
      return
    }
    state.stackX = overlapLeft
    state.stackWidth = overlap
    objects.push({ id: state.nextId++, x: overlapLeft, w: overlap })
    addScore(22 + objects.length * 4)
    if (objects.length >= 9) {
      objects.shift()
      addScore(35)
    }
    prepareNextStackBlock()
    return
  }

  if (config.type === "climb") {
    climbJumpQueued = true
    return
  }

  const target = state.target
  const power = state.x
  const perfect = 54 + (target - 42) * 0.55
  const diff = Math.abs(power - perfect)
  if (diff < 5) addScore(50 + level * 5)
  else if (diff < 12) addScore(25)
  else miss("Tiro fallado")
  state.x = 10
  state.target = rand(24, 60)
}

els.action.addEventListener("click", action, { signal: inputController.signal })
if (config.type === "timing") {
  els.stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.preventDefault()
    action()
  }, { signal: inputController.signal })
}
document.addEventListener("keydown", (event) => {
  if (config.type === "dodge" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"].includes(event.code)) {
    event.preventDefault()
    dodgePressedKeys.add(event.code)
    return
  }
  if (config.type === "climb" && ["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(event.code)) {
    event.preventDefault()
    climbPressedKeys.add(event.code)
    return
  }
  if (config.type === "climb" && ["ArrowUp", "KeyW", "Space"].includes(event.code)) {
    event.preventDefault()
    if (event.repeat) return
    action()
    return
  }
  if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
    event.preventDefault()
    action()
  }
}, { signal: inputController.signal })

document.addEventListener("keyup", (event) => {
  if (config.type === "climb") {
    climbPressedKeys.delete(event.code)
    return
  }
  if (config.type !== "dodge") return
  dodgePressedKeys.delete(event.code)
}, { signal: inputController.signal })

window.addEventListener("blur", () => {
  dodgePressedKeys.clear()
  dodgeButtonInputs.clear()
  climbPressedKeys.clear()
  climbButtonInputs.clear()
}, { signal: inputController.signal })

if (config.type === "dodge") {
  els.stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.preventDefault()
    moveDodgeToPointer(event.clientX, event.clientY)
  }, { signal: inputController.signal })
  els.stage.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" && event.buttons !== 1) return
    event.preventDefault()
    moveDodgeToPointer(event.clientX, event.clientY)
  }, { signal: inputController.signal })
  document.querySelectorAll("[data-dodge-dir]").forEach((button) => {
    const dir = button.dataset.dodgeDir
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault()
      button.setPointerCapture?.(event.pointerId)
      dodgeButtonInputs.add(dir)
    }, { signal: inputController.signal })
    button.addEventListener("pointerup", (event) => {
      event.preventDefault()
      dodgeButtonInputs.delete(dir)
    }, { signal: inputController.signal })
    button.addEventListener("pointercancel", () => {
      dodgeButtonInputs.delete(dir)
    }, { signal: inputController.signal })
    button.addEventListener("lostpointercapture", () => {
      dodgeButtonInputs.delete(dir)
    }, { signal: inputController.signal })
  })
}

if (config.type === "climb") {
  document.querySelectorAll("[data-climb-dir]").forEach((button) => {
    const dir = button.dataset.climbDir
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault()
      button.setPointerCapture?.(event.pointerId)
      climbButtonInputs.add(dir)
    }, { signal: inputController.signal })
    button.addEventListener("pointerup", (event) => {
      event.preventDefault()
      climbButtonInputs.delete(dir)
    }, { signal: inputController.signal })
    button.addEventListener("pointercancel", () => {
      climbButtonInputs.delete(dir)
    }, { signal: inputController.signal })
    button.addEventListener("lostpointercapture", () => {
      climbButtonInputs.delete(dir)
    }, { signal: inputController.signal })
  })
}

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden || juegoTerminado || (gameKey === "esquivaobstaculos" && !juegoActivo)) return
  const ahora = Date.now()
  if (ahora - ultimoCambio < 3000) return
  ultimoCambio = ahora
  advertencias += 1
  if (advertencias >= MAX_ADVERTENCIAS) {
    descalificado = true
    await endGame("descalificado")
  } else {
    alert(advertencias === 1 ? "No cambies de pestana" : "Ultima advertencia")
  }
}, { signal: inputController.signal })

async function startTimer() {
  let restante = await obtenerTiempoRestanteTorneo(supabase, gameKey, DURACION)
  if (restante === null) {
    console.warn(`No hay inicio valido para ${gameKey}`)
    setStatus("El torneo aun no ha iniciado")
    if (gameKey === "esquivaobstaculos") {
      cleanupRuntime()
      window.location.replace(salidaTorneoUrl())
      return false
    }
    setTimeout(() => {
      window.location.href = salidaTorneoUrl()
    }, 1200)
    return false
  }
  if (restante <= 0) {
    if (gameKey === "esquivaobstaculos") {
      setStatus("El torneo ya finalizo")
      cleanupRuntime()
      window.location.replace(salidaTorneoUrl())
      return false
    }
    await endGame("tiempo")
    return false
  }

  const tick = async () => {
    const min = Math.floor(restante / 60)
    const seg = restante % 60
    els.timer.textContent = `${min}:${seg < 10 ? "0" : ""}${seg}`

    if (restante <= 0) {
      if (bloquearFinalizacionInicialSolitario(gameKey, `cronometro ${gameKey}`)) {
        restante = DURACION
        return
      }
      clearInterval(timerId)
      await endGame("tiempo")
      return
    }
    restante -= 1
  }

  timerId = setInterval(tick, 1000)
  await tick()
  if (juegoTerminado) return false
  return true
}

async function getPosition() {
  const { data, error } = await supabase
    .from("ranking")
    .select("usuario")
    .eq("juego", gameKey)
    .eq("invalido", false)
    .order("tiempo", { ascending: false })

  if (error || !data) return null
  const index = data.findIndex((row) => row.usuario === usuario)
  return index >= 0 ? index + 1 : null
}

async function saveStats(position, elapsed) {
  const { data: actual } = await supabase
    .from("estadisticas_logros")
    .select("*")
    .eq("usuario", usuario)
    .eq("juego", gameKey)
    .maybeSingle()

  const top3 = typeof position === "number" && position <= 3
  const win = position === 1
  const bestPosition = typeof position === "number"
    ? Math.min(actual?.mejor_posicion_torneo || position, position)
    : actual?.mejor_posicion_torneo

  const payload = {
    usuario,
    juego: gameKey,
    completados: (actual?.completados || 0) + 1,
    torneos_participados: (actual?.torneos_participados || 0) + 1,
    mejor_posicion_torneo: bestPosition,
    ultima_posicion_torneo: position,
    victorias_torneos: (actual?.victorias_torneos || 0) + (win ? 1 : 0),
    top3_torneos: (actual?.top3_torneos || 0) + (top3 ? 1 : 0),
    tiempo_jugado_total: (actual?.tiempo_jugado_total || 0) + elapsed,
    mejor_tiempo: typeof actual?.mejor_tiempo === "number" ? Math.min(actual.mejor_tiempo, elapsed) : elapsed,
    mejor_racha_completados: Math.max(actual?.mejor_racha_completados || 0, bestCombo),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("estadisticas_logros")
    .upsert(payload, { onConflict: "usuario,juego" })

  if (error) console.warn(`No se pudieron guardar estadisticas de ${gameKey}`, error)
}

async function saveResult(reason) {
  if (resultadoEnviado) return
  resultadoEnviado = true
  const invalid = reason === "descalificado" || descalificado
  const finalScore = invalid ? 0 : score
  const elapsed = Math.max(1, Math.round((performance.now() - startMs) / 1000))

  if ((finalScore > 0 || gameKey === "esquivaobstaculos") && !invalid) {
    const { data: recordActual, error: recordError } = await supabase
      .from("ranking")
      .select("tiempo,invalido")
      .eq("usuario", usuario)
      .eq("juego", gameKey)
      .maybeSingle()

    if (recordError) {
      console.warn(`No se pudo leer record actual de ${gameKey}`, recordError)
    }

    const debeActualizarRecord = !recordActual || recordActual.invalido || finalScore >= Number(recordActual.tiempo || 0)
    const { error } = debeActualizarRecord
      ? await supabase
        .from("ranking")
        .upsert({
          usuario,
          tiempo: finalScore,
          juego: gameKey,
          sospechoso: advertencias > 0,
          invalido: false,
          motivo: advertencias > 0 ? "Cambio de pestana" : "",
        }, { onConflict: "usuario,juego" })
      : { error: null }

    if (error) {
      console.error(`No se pudo guardar ranking de ${gameKey}`, error)
    }
  }

  await registrarPartidaDesdeRanking({ usuario, juego: gameKey, valor: finalScore, modo: "points", invalido: invalid })
  await registrarPuntosMiniTorneo(supabase, gameKey, finalScore)
  const position = await getPosition()
  if (!invalid) await saveStats(position, elapsed)

  localStorage.setItem("fin_juego", reason)
  localStorage.setItem(`${gameKey}_puntos`, String(finalScore))
  localStorage.setItem(`${gameKey}_elapsed`, String(elapsed))
  localStorage.setItem(`${gameKey}_combo`, String(bestCombo))
  if (gameKey === "esquivaobstaculos") {
    localStorage.setItem(`${gameKey}_finished_run_id`, runId)
    localStorage.setItem(`${gameKey}_finished_at`, new Date().toISOString())
  }
  return true
}

async function endGame(reason) {
  if (juegoTerminado) return
  juegoTerminado = true
  juegoActivo = false
  renderHud()
  setStatus(reason === "tiempo" ? "Tiempo terminado" : reason === "perdiste" ? "Sin vidas" : "Partida terminada")
  cleanupRuntime()
  try {
    await saveResult(reason)
  } catch (error) {
    console.error(`No se pudo completar el guardado final de ${gameKey}`, error)
    const finalScore = reason === "descalificado" || descalificado ? 0 : score
    localStorage.setItem("fin_juego", reason)
    localStorage.setItem(`${gameKey}_puntos`, String(finalScore))
    localStorage.setItem(`${gameKey}_elapsed`, String(Math.max(1, Math.round((performance.now() - startMs) / 1000))))
    localStorage.setItem(`${gameKey}_combo`, String(bestCombo))
    if (gameKey === "esquivaobstaculos") {
      localStorage.setItem(`${gameKey}_finished_run_id`, runId)
      localStorage.setItem(`${gameKey}_finished_at`, new Date().toISOString())
    }
  } finally {
    window.location.href = "final.html"
  }
}

async function checkTournamentState() {
  if (await debeSalirDelTorneo(supabase, gameKey)) {
    if (gameKey === "esquivaobstaculos") cleanupRuntime()
    window.location.replace(salidaTorneoUrl())
  }
}

renderHud()
setStatus(config.type === "timing" ? "Toca la pantalla, Espacio o Golpear cuando la bola entre en la zona" : "Listo")
tournamentCheckId = setInterval(checkTournamentState, 3000)
rafId = requestAnimationFrame(loop)
startTimer().then((started) => {
  if (!started || juegoTerminado) return
  limpiarResultadoEsquivaPrevio()
  runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  if (gameKey === "esquivaobstaculos") {
    localStorage.setItem(`${gameKey}_run_id`, runId)
  }
  startMs = performance.now()
  lastTs = 0
  juegoActivo = true
  setStatus(config.type === "timing" ? "Partida iniciada: golpea en la zona dorada" : "Partida iniciada")
})

function cleanupRuntime() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  if (tournamentCheckId) {
    clearInterval(tournamentCheckId)
    tournamentCheckId = null
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (dodgeResizeObserver) {
    dodgeResizeObserver.disconnect()
    dodgeResizeObserver = null
  }
  inputController.abort()
}
