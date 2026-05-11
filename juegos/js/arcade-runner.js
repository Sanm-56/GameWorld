import { supabase } from "./supabase.js"
import { registrarPartidaDesdeRanking } from "./partidas.js"
import {
  bloquearFinalizacionInicialSolitario,
  debeSalirDelTorneo,
  obtenerTiempoRestanteTorneo,
  registrarPuntosMiniTorneo,
  salidaTorneoUrl,
} from "./mini-torneo.js"
import { getArcadeGame } from "./arcade-games.js"

const DURACION = 180
const MAX_ADVERTENCIAS = 3
const gameKey = document.body.dataset.game
const config = getArcadeGame(gameKey)
const usuario = localStorage.getItem("usuario")

if (!usuario) window.location.href = "index.html"

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
let ultimoCambio = 0
let startMs = performance.now()
let lastTs = 0
let objects = []
let spawnTimer = 0
let state = createState()

function createState() {
  return {
    x: 50,
    y: 78,
    vx: 125,
    target: 50,
    ball: null,
    stackWidth: 70,
    stackX: 15,
    stackDir: 1,
    platforms: [],
    nextId: 1,
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function addScore(points) {
  const gained = Math.max(0, Math.round(points * (1 + combo * 0.04)))
  score += gained
  combo += 1
  bestCombo = Math.max(bestCombo, combo)
  level = Math.max(1, Math.floor(score / 180) + 1)
  setStatus(`+${gained} puntos`)
  renderHud()
}

function miss(reason = "Fallaste") {
  combo = 0
  lives -= 1
  setStatus(reason)
  renderHud()
  if (lives <= 0) endGame("perdiste")
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
  els.stage.querySelectorAll(".actor,.target,.trail,.block,.platform,.hoop,.ball,.bat,.mountain").forEach((node) => node.remove())
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
  clearStage()
  makeEl("target", { left: `${state.target - 8}%`, bottom: "34%", width: "16%", height: "8px" })
  makeEl("bat", { left: "11%", bottom: "18%" })
  makeEl("ball actor", { left: `${state.x}%`, bottom: "35%" })
}

function renderDodge() {
  clearStage()
  makeEl("actor", { left: `${state.x}%`, bottom: "12%" })
  objects.forEach((item) => makeEl("block danger", { left: `${item.x}%`, top: `${item.y}%` }))
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
  if (!lastTs) lastTs = ts
  const dt = Math.min(0.05, (ts - lastTs) / 1000)
  lastTs = ts
  update(dt)
  render()
  requestAnimationFrame(loop)
}

function update(dt) {
  if (config.type === "timing") {
    state.x += (42 + level * 7) * dt
    if (state.x > 104) {
      state.x = -4
      state.target = rand(45, 82)
      miss("Se fue la bola")
    }
    return
  }

  if (config.type === "dodge") {
    spawnTimer -= dt
    if (spawnTimer <= 0) {
      spawnTimer = Math.max(0.34, 0.9 - level * 0.045)
      objects.push({ id: state.nextId++, x: [18, 42, 66][Math.floor(rand(0, 3))], y: -8 })
    }
    objects.forEach((item) => item.y += (22 + level * 3.5) * dt)
    objects = objects.filter((item) => {
      if (item.y > 96) {
        addScore(8)
        return false
      }
      if (item.y > 72 && item.y < 88 && Math.abs(item.x - state.x) < 11) {
        miss("Choque")
        return false
      }
      return true
    })
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

  if (config.type === "timing") {
    const diff = Math.abs(state.x - state.target)
    if (diff < 4) addScore(45 + level * 4)
    else if (diff < 9) addScore(25 + level * 2)
    else miss("Swing fuera de ritmo")
    state.x = -4
    state.target = rand(45, 82)
    return
  }

  if (config.type === "dodge") {
    const lanes = [18, 42, 66]
    const current = lanes.indexOf(state.x)
    state.x = lanes[(current + 1) % lanes.length]
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

els.action.addEventListener("click", action)
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
    event.preventDefault()
    action()
  }
  if (config.type === "dodge" && (event.code === "ArrowLeft" || event.code === "ArrowRight")) {
    event.preventDefault()
    const lanes = [18, 42, 66]
    const current = lanes.indexOf(state.x)
    const delta = event.code === "ArrowLeft" ? -1 : 1
    state.x = lanes[clamp(current + delta, 0, lanes.length - 1)]
  }
})

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden || juegoTerminado) return
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
})

async function startTimer() {
  let restante = await obtenerTiempoRestanteTorneo(supabase, gameKey, DURACION)
  if (restante === null) {
    console.warn(`No hay inicio valido para ${gameKey}`)
    return
  }

  const tick = async () => {
    restante -= 1
    const min = Math.floor(restante / 60)
    const seg = restante % 60
    els.timer.textContent = `${min}:${seg < 10 ? "0" : ""}${seg}`

    if (restante <= 0) {
      if (bloquearFinalizacionInicialSolitario(gameKey, `cronometro ${gameKey}`)) {
        restante = DURACION
        return
      }
      clearInterval(timer)
      await endGame("tiempo")
    }
  }

  let timer = null
  tick()
  timer = setInterval(tick, 1000)
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

  if (finalScore > 0 && !invalid) {
    const { error } = await supabase
      .from("ranking")
      .upsert({
        usuario,
        tiempo: finalScore,
        juego: gameKey,
        sospechoso: advertencias > 0,
        invalido: false,
        motivo: advertencias > 0 ? "Cambio de pestana" : "",
      }, { onConflict: "usuario,juego" })

    if (error) {
      console.error(`No se pudo guardar ranking de ${gameKey}`, error)
      resultadoEnviado = false
      return false
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
  return true
}

async function endGame(reason) {
  if (juegoTerminado) return
  juegoTerminado = true
  const saved = await saveResult(reason)
  if (saved !== false) window.location.href = "final.html"
}

async function checkTournamentState() {
  if (await debeSalirDelTorneo(supabase, gameKey)) {
    window.location.href = salidaTorneoUrl()
  }
}

renderHud()
setStatus("Listo")
startTimer()
setInterval(checkTournamentState, 3000)
requestAnimationFrame(loop)
