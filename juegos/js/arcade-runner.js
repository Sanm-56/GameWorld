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
const DODGE_LANES = [18, 42, 66]
const DODGE_X_RANGE = [12, 72]
const DODGE_Y_RANGE = [68, 86]
const DODGE_PLAYER_HITBOX = { x: 4.8, y: 4.9 }
const DODGE_OBSTACLE_HITBOX = { x: 4.5, y: 5.2 }
const DODGE_WARMUP_MS = 12000
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
let runId = ""
const inputController = new AbortController()

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
    stackWidth: 70,
    stackX: 15,
    stackDir: 1,
    platforms: [],
    nextId: 1,
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
  makeEl("block base", { left: `${state.stackX}%`, bottom: "8%", width: `${state.stackWidth}%` })
  objects.forEach((item, index) => makeEl("block", {
    left: `${item.x}%`,
    bottom: `${8 + (index + 1) * 7}%`,
    width: `${item.w}%`,
  }))
  makeEl("block active", { left: `${state.x}%`, bottom: `${15 + objects.length * 7}%`, width: `${state.stackWidth}%` })
}

function renderClimb() {
  clearStage()
  makeEl("mountain")
  state.platforms.forEach((platform) => makeEl("platform", { left: `${platform.x}%`, top: `${platform.y}%` }))
  makeEl("actor", { left: `${state.x}%`, top: `${state.y}%` })
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
  const previousX = dodgeVisualX
  const ease = 1 - Math.exp(-dt * 13.5)
  dodgeVisualX += (state.x - dodgeVisualX) * ease
  dodgeVisualY += (state.y - dodgeVisualY) * (1 - Math.exp(-dt * 12))
  if (Math.abs(state.x - dodgeVisualX) < 0.04) dodgeVisualX = state.x
  if (Math.abs(state.y - dodgeVisualY) < 0.04) dodgeVisualY = state.y
  dodgeVisualVelocity = dt > 0 ? (dodgeVisualX - previousX) / dt : 0
  const targetLean = clamp(dodgeVisualVelocity * 0.09, -11, 11)
  dodgeLean += (targetLean - dodgeLean) * Math.min(1, dt * 17)
  const elapsedMs = juegoActivo ? performance.now() - startMs : 0
  const warmup = clamp(elapsedMs / DODGE_WARMUP_MS, 0, 1)
  const difficulty = Math.max(0, level - 1) * warmup
  spawnTimer -= dt
  if (spawnTimer <= 0) {
    spawnTimer = Math.max(0.38, rand(0.82, 1.24) - difficulty * 0.028)
    const ultimo = objects[objects.length - 1]
    let lane = DODGE_LANES[Math.floor(rand(0, DODGE_LANES.length))]
    if (ultimo && ultimo.y < 22 && Math.abs(ultimo.x - lane) < 4) {
      lane = DODGE_LANES[(DODGE_LANES.indexOf(lane) + 1) % DODGE_LANES.length]
    }
    objects.push({
      id: state.nextId++,
      x: lane,
      y: -10,
      hit: false,
      speed: rand(0.74, 1.02) + Math.min(0.22, difficulty * 0.01),
      drift: rand(-0.8, 0.8) * Math.max(0.35, warmup),
      spin: rand(-18, 18),
      scale: rand(0.88, 1.12),
      variant: Math.floor(rand(0, 3)),
    })
  }
  objects.forEach((item) => {
    item.y += (15.5 + difficulty * 2.7) * Number(item.speed || 1) * dt
    item.drift = clamp(Number(item.drift || 0) + Math.sin((performance.now() + item.id * 211) / 420) * 0.012 * Math.max(0.45, warmup), -1.65, 1.65)
    item.spin = Number(item.spin || 0) + 28 * dt
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
    if (state.x <= 2 || state.x + state.stackWidth >= 98) state.stackDir *= -1
    return
  }

  if (config.type === "climb") {
    state.y += (10 + level * 0.8) * dt
    if (!state.platforms.length) {
      state.platforms = Array.from({ length: 7 }, (_, index) => ({ x: rand(8, 78), y: 86 - index * 13 }))
    }
    state.platforms.forEach((platform) => platform.y += (4 + level * 0.35) * dt)
    state.platforms = state.platforms.filter((platform) => platform.y < 100)
    while (state.platforms.length < 7) state.platforms.push({ x: rand(8, 78), y: rand(-10, 0) })
    if (state.y > 95) miss("Caida")
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
    const base = objects.length ? objects[objects.length - 1] : { x: state.stackX, w: state.stackWidth }
    const overlapLeft = Math.max(base.x, state.x)
    const overlapRight = Math.min(base.x + base.w, state.x + state.stackWidth)
    const overlap = overlapRight - overlapLeft
    if (overlap <= 4) {
      miss("La pieza cayo fuera")
      return
    }
    state.stackX = overlapLeft
    state.stackWidth = overlap
    objects.push({ x: overlapLeft, w: overlap })
    state.x = rand(4, 24)
    addScore(22 + objects.length * 4)
    if (objects.length >= 9) {
      objects.shift()
      addScore(35)
    }
    return
  }

  if (config.type === "climb") {
    const next = state.platforms
      .filter((platform) => platform.y < state.y && Math.abs(platform.x - state.x) < 24)
      .sort((a, b) => b.y - a.y)[0]
    if (!next) {
      miss("Salto sin plataforma")
      return
    }
    state.x = next.x
    state.y = next.y - 8
    addScore(30 + level * 3)
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
  if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
    event.preventDefault()
    action()
  }
  if (config.type === "dodge" && (event.code === "ArrowLeft" || event.code === "ArrowRight")) {
    event.preventDefault()
    moveDodge(event.code === "ArrowLeft" ? -1 : 1)
  }
  if (config.type === "dodge" && (event.code === "ArrowUp" || event.code === "ArrowDown")) {
    event.preventDefault()
    setDodgeTarget(state.x, state.y + (event.code === "ArrowUp" ? -6 : 6), event.code === "ArrowUp" ? "Arriba" : "Abajo", 54)
  }
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
