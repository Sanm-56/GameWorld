import { supabase } from '../../js/supabase.js'
import { registrarPartidaDesdeRanking } from '../../js/partidas.js'
import { bloquearFinalizacionInicialSolitario, debeSalirDelTorneo, obtenerInicioTorneo, obtenerTiempoRestanteTorneo, registrarPuntosMiniTorneo, salidaTorneoUrl } from '../../js/mini-torneo.js'

// =============================
// BLOQUEO MULTI-PESTANA
// =============================
const BLOQUEO_PESTANA_KEY = 'domino_activo'
const BLOQUEO_TTL_MS = 5000
const TAB_ID = `domino_${Date.now()}_${Math.random().toString(36).slice(2)}`

function leerBloqueoPestana() {
  try {
    const valor = localStorage.getItem(BLOQUEO_PESTANA_KEY)
    return valor ? JSON.parse(valor) : null
  } catch (error) {
    localStorage.removeItem(BLOQUEO_PESTANA_KEY)
    return null
  }
}

function bloqueoEstaVigente(bloqueo) {
  return Boolean(
    bloqueo &&
    bloqueo.tabId &&
    bloqueo.tabId !== TAB_ID &&
    Date.now() - bloqueo.timestamp < BLOQUEO_TTL_MS
  )
}

function guardarBloqueoPestana() {
  localStorage.setItem(BLOQUEO_PESTANA_KEY, JSON.stringify({
    tabId: TAB_ID,
    timestamp: Date.now(),
  }))
}

function reclamarBloqueoPestana() {
  const bloqueoActual = leerBloqueoPestana()
  if (bloqueoEstaVigente(bloqueoActual)) {
    return false
  }

  guardarBloqueoPestana()
  const bloqueoConfirmado = leerBloqueoPestana()
  return bloqueoConfirmado?.tabId === TAB_ID
}

let intervaloBloqueo = null

function liberarBloqueoPestana() {
  const bloqueoActual = leerBloqueoPestana()
  if (bloqueoActual?.tabId === TAB_ID) {
    localStorage.removeItem(BLOQUEO_PESTANA_KEY)
  }

  if (intervaloBloqueo) {
    clearInterval(intervaloBloqueo)
    intervaloBloqueo = null
  }
}

function iniciarBloqueoPestana() {
  if (!reclamarBloqueoPestana()) {
    alert('Ya tienes el dominó abierto en otra pestaña')
    window.location.href = salidaTorneoUrl()
    return false
  }

  intervaloBloqueo = setInterval(() => {
    guardarBloqueoPestana()
  }, 2000)

  return true
}

window.addEventListener('beforeunload', liberarBloqueoPestana)
window.addEventListener('pagehide', liberarBloqueoPestana)

// =============================
// CONTROL GLOBAL
// =============================
const usuario = localStorage.getItem('usuario') || 'anonimo'
const JUEGO_ACTUAL = 'domino'
const statusEl = document.getElementById('status')
const resultEl = document.getElementById('result')
const handEl = document.getElementById('hand')
const tableEl = document.getElementById('table')
const myPiecesEl = document.getElementById('myPieces')
const botPiecesEl = document.getElementById('botPieces')
const myScoreEl = document.getElementById('myScore')
const botScoreEl = document.getElementById('botScore')
const passBtn = document.getElementById('passBtn')

let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false
let intervalo = null
let advertencias = 0
let ultimoCambio = Date.now()

const MAX_ADVERTENCIAS = 3
const DURACION = 600
const MAX_VALOR_FICHA = 8
const FICHAS_POR_JUGADOR = 21
const BOT_DELAY_MS = 5000

let dominos = []
let myHand = []
let botHand = []
let table = []
let currentPlayer = 'player'
let consecutivePasses = 0

// =============================
// ANTI-TRAMPA: CAMBIO PESTANA
// =============================
document.addEventListener('visibilitychange', () => {
  if (juegoTerminado || !document.hidden) return

  const ahora = Date.now()
  if (ahora - ultimoCambio < 3000) return
  ultimoCambio = ahora

  advertencias++

  if (advertencias === 1) {
    alert('No cambies de pestaña')
  } else if (advertencias === 2) {
    alert('Ultima advertencia')
  } else if (advertencias >= MAX_ADVERTENCIAS) {
    descalificado = true
    juegoTerminado = true
    liberarBloqueoPestana()
    localStorage.setItem('dominoResultado', 'Descalificado por cambiar de pestaña.')
    localStorage.setItem('juego_actual', 'domino')
    alert('Descalificado por cambiar de pestaña')
    window.location.href = 'final.html'
  }
})

window.addEventListener('storage', (event) => {
  if (event.key !== BLOQUEO_PESTANA_KEY || juegoTerminado) return

  const bloqueoActual = leerBloqueoPestana()
  if (bloqueoEstaVigente(bloqueoActual)) {
    alert('Ya tienes el dominó abierto en otra pestaña')
    window.location.href = salidaTorneoUrl()
  }
})

// =============================
// CRONOMETRO
// =============================
async function iniciarCronometro() {
  let reloj = document.getElementById('reloj')
  if (!reloj) {
    reloj = document.createElement('div')
    reloj.id = 'reloj'
    reloj.style.cssText = 'position:fixed;top:20px;right:20px;font-size:1.5em;background:#1e293b;padding:10px 20px;border-radius:8px;z-index:999;'
    document.body.appendChild(reloj)
  }

  if (intervalo) clearInterval(intervalo)

  let restante = await obtenerTiempoRestanteTorneo(supabase, JUEGO_ACTUAL, DURACION)

  if (restante === null) {
    return
  }

  function pintarReloj() {
    const min = Math.floor(restante / 60)
    const seg = restante % 60
    reloj.innerText = `${min}:${seg < 10 ? '0' : ''}${seg}`
  }

  function actualizar() {
    restante--

    if (restante <= 0) {
      if (bloquearFinalizacionInicialSolitario(JUEGO_ACTUAL, 'cronometro domino')) {
        restante = DURACION
        pintarReloj()
        return
      }

      clearInterval(intervalo)
      reloj.innerText = '0:00'
      finalizarPorTiempo()
      return
    }

    pintarReloj()
  }

  pintarReloj()
  intervalo = setInterval(actualizar, 1000)
}

async function finalizarPorTiempo() {
  if (juegoTerminado) return
  juegoTerminado = true
  liberarBloqueoPestana()

  if (!resultadoEnviado && !descalificado) {
    await guardarResultado(DURACION, false, false, '')
  }

  localStorage.setItem('juego_actual', 'domino')
  localStorage.setItem('dominoResultado', 'Tiempo terminado.')
  alert('Tiempo terminado')
  window.location.href = 'final.html'
}

// =============================
// JUEGO
// =============================
function crearDominos() {
  dominos = []
  for (let i = 0; i <= MAX_VALOR_FICHA; i++) {
    for (let j = i; j <= MAX_VALOR_FICHA; j++) {
      dominos.push({ top: i, bottom: j })
    }
  }

  for (let i = dominos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[dominos[i], dominos[j]] = [dominos[j], dominos[i]]
  }

  myHand = dominos.slice(0, FICHAS_POR_JUGADOR)
  botHand = dominos.slice(FICHAS_POR_JUGADOR, FICHAS_POR_JUGADOR * 2)
  table = []
  currentPlayer = 'player'
  consecutivePasses = 0

  updateUI()
}

function getLeftValue() {
  return table[0]?.top ?? null
}

function getRightValue() {
  return table[table.length - 1]?.bottom ?? null
}

function canPlay(domino) {
  if (table.length === 0) return true

  const left = getLeftValue()
  const right = getRightValue()

  return (
    domino.top === left ||
    domino.bottom === left ||
    domino.top === right ||
    domino.bottom === right
  )
}

function hasPlayableDomino(hand) {
  return hand.some((domino) => canPlay(domino))
}

function orientDominoForSide(domino, side) {
  const pieza = { ...domino }

  if (table.length === 0) {
    return pieza
  }

  const left = getLeftValue()
  const right = getRightValue()

  if (side === 'left') {
    if (pieza.bottom === left) return pieza
    if (pieza.top === left) return { top: pieza.bottom, bottom: pieza.top }
  }

  if (side === 'right') {
    if (pieza.top === right) return pieza
    if (pieza.bottom === right) return { top: pieza.bottom, bottom: pieza.top }
  }

  return null
}

function agregarAFinal(domino) {
  if (table.length === 0) {
    table.push({ ...domino })
    return true
  }

  const paraDerecha = orientDominoForSide(domino, 'right')
  if (paraDerecha) {
    table.push(paraDerecha)
    return true
  }

  const paraIzquierda = orientDominoForSide(domino, 'left')
  if (paraIzquierda) {
    table.unshift(paraIzquierda)
    return true
  }

  return false
}

function renderHand() {
  handEl.innerHTML = ''

  if (myHand.length === 0) {
    handEl.innerHTML = '<p style="color:#22c55e;">No te quedan fichas.</p>'
    return
  }

  myHand.forEach((domino, idx) => {
    const div = document.createElement('button')
    div.className = 'domino'
    div.type = 'button'
    div.disabled = juegoTerminado || currentPlayer !== 'player'
    div.innerHTML = `<div>${domino.top}</div><div>-</div><div>${domino.bottom}</div>`
    div.onclick = () => playDomino(idx)

    handEl.appendChild(div)
  })
}

function renderTable() {
  tableEl.innerHTML = ''

  if (table.length === 0) {
    tableEl.innerHTML = '<p style="color:#666;">Mesa vacía - Coloca una ficha para empezar</p>'
    return
  }

  table.forEach((domino) => {
    const div = document.createElement('div')
    div.className = 'domino'
    div.innerHTML = `<div>${domino.top}</div><div>-</div><div>${domino.bottom}</div>`
    tableEl.appendChild(div)
  })
}

function updatePassButton() {
  const mostrar = !juegoTerminado && currentPlayer === 'player' && !hasPlayableDomino(myHand)
  passBtn.style.display = mostrar ? 'inline-block' : 'none'
}

function updateScores() {
  myScoreEl.innerText = contarPuntos(myHand)
  botScoreEl.innerText = contarPuntos(botHand)
}

function updateUI() {
  myPiecesEl.innerText = myHand.length
  botPiecesEl.innerText = botHand.length
  updateScores()
  renderTable()
  renderHand()
  updatePassButton()

  if (myHand.length === 0) {
    finishGame('Ganaste. Pusiste todas tus fichas.')
  } else if (botHand.length === 0) {
    finishGame('Perdiste. El bot puso todas sus fichas.', false)
  }
}

function contarPuntos(hand) {
  return hand.reduce((total, domino) => total + domino.top + domino.bottom, 0)
}

function evaluarCierrePorBloqueo() {
  if (consecutivePasses < 2) return false

  const misPuntos = contarPuntos(myHand)
  const puntosBot = contarPuntos(botHand)

  if (misPuntos < puntosBot) {
    finishGame(`Ganaste por bloqueo. Te quedaron ${misPuntos} puntos frente a ${puntosBot} del bot.`)
  } else if (misPuntos > puntosBot) {
    finishGame(`Perdiste por bloqueo. Te quedaron ${misPuntos} puntos y el bot cerró con ${puntosBot}.`)
  } else {
    finishGame(`Empate por bloqueo. Ambos terminaron con ${misPuntos} puntos.`)
  }

  return true
}

function playDomino(idx) {
  if (juegoTerminado) return

  if (currentPlayer !== 'player') {
    statusEl.innerText = 'Espera tu turno.'
    return
  }

  const domino = myHand[idx]
  if (!domino) return

  if (!canPlay(domino)) {
    statusEl.innerText = 'No puedes jugar esa ficha.'
    updatePassButton()
    return
  }

  if (!agregarAFinal(domino)) {
    statusEl.innerText = 'No se pudo colocar la ficha.'
    return
  }

  myHand.splice(idx, 1)
  consecutivePasses = 0
  statusEl.innerText = 'Turno del bot...'
  currentPlayer = 'bot'

  updateUI()

  if (!juegoTerminado) {
    setTimeout(botTurn, BOT_DELAY_MS)
  }
}

function botTurn() {
  if (juegoTerminado) return

  const playable = botHand.filter((domino) => canPlay(domino))

  if (playable.length === 0) {
    consecutivePasses++
    currentPlayer = 'player'

    if (evaluarCierrePorBloqueo()) return

    statusEl.innerText = 'El bot pasó. Tu turno.'
    updateUI()
    return
  }

  const domino = playable[Math.floor(Math.random() * playable.length)]
  const idx = botHand.findIndex((piece) => piece.top === domino.top && piece.bottom === domino.bottom)

  if (idx === -1 || !agregarAFinal(domino)) {
    statusEl.innerText = 'El bot no pudo jugar. Tu turno.'
    currentPlayer = 'player'
    updateUI()
    return
  }

  botHand.splice(idx, 1)
  consecutivePasses = 0
  currentPlayer = 'player'
  statusEl.innerText = 'Tu turno.'

  updateUI()
}

function passTurn() {
  if (juegoTerminado || currentPlayer !== 'player') return

  if (hasPlayableDomino(myHand)) {
    statusEl.innerText = 'Aun tienes una ficha disponible para jugar.'
    updatePassButton()
    return
  }

  consecutivePasses++
  currentPlayer = 'bot'
  statusEl.innerText = 'Pasaste turno. Juega el bot...'
  updateUI()

  if (evaluarCierrePorBloqueo()) return

  setTimeout(botTurn, BOT_DELAY_MS)
}

async function obtenerTiempo() {
  const inicioTorneo = await obtenerInicioTorneo(supabase, JUEGO_ACTUAL)

  if (!inicioTorneo) {
    return 9999
  }

  const { data: horaServer, error: horaError } = await supabase.rpc('ahora_servidor')
  if (horaError) {
    return 9999
  }

  const inicio = Date.parse(inicioTorneo)
  const ahora = Date.parse(horaServer)
  return Math.max(0, Math.floor((ahora - inicio) / 1000))
}

async function guardarResultado(tiempo, sospechoso = false, invalido = false, motivo = '') {
  if (resultadoEnviado) return

  resultadoEnviado = true

  let sospechosoFinal = sospechoso
  let invalidoFinal = invalido
  let motivoFinal = motivo

  if (tiempo < 60) {
    sospechosoFinal = true
    motivoFinal += 'Tiempo menor a 1 minuto | '
  }

  if (tiempo < 30) {
    sospechosoFinal = true
    invalidoFinal = true
    motivoFinal += 'Tiempo extremadamente bajo | '
  }

  if (advertencias > 0) {
    sospechosoFinal = true
    motivoFinal += 'Cambio de pestaña | '
  }

  if (advertencias >= MAX_ADVERTENCIAS) {
    invalidoFinal = true
    motivoFinal += 'Demasiados cambios | '
  }

  const payload = {
    usuario,
    tiempo: invalidoFinal ? 9999 : tiempo,
    sospechoso: sospechosoFinal,
    invalido: invalidoFinal,
    motivo: motivoFinal,
    juego: 'domino',
  }

  let { error } = await supabase
    .from('ranking')
    .upsert(payload, { onConflict: 'usuario,juego' })

  if (!error) {
    await registrarPartidaDesdeRanking({
      usuario,
      juego: 'domino',
      valor: payload.tiempo,
      modo: 'time',
      invalido: invalidoFinal,
    })
    await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalidoFinal ? 0 : Math.max(0, DURACION - payload.tiempo))
    localStorage.setItem('dominoEstadisticasPendientes', 'true')
    return
  }

  const fallback = await supabase
    .from('ranking_domino')
    .upsert(payload, { onConflict: 'usuario,juego' })

  if (fallback.error) {
    console.error('Error guardando resultado domino', fallback.error)
  } else {
    await registrarPartidaDesdeRanking({
      usuario,
      juego: 'domino',
      valor: payload.tiempo,
      modo: 'time',
      invalido: invalidoFinal,
    })
    await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalidoFinal ? 0 : Math.max(0, DURACION - payload.tiempo))
    localStorage.setItem('dominoEstadisticasPendientes', 'true')
  }
}

async function finishGame(message, shouldSaveResult = true) {
  if (juegoTerminado) return
  juegoTerminado = true
  liberarBloqueoPestana()

  if (message.startsWith('Perdiste') || message.startsWith('Empate')) {
    shouldSaveResult = false
  }

  resultEl.innerText = message
  resultEl.style.display = 'block'
  statusEl.innerText = 'Partida finalizada.'
  passBtn.style.display = 'none'

  localStorage.setItem('juego_actual', 'domino')
  localStorage.setItem('dominoResultado', message)

  if (shouldSaveResult && !resultadoEnviado) {
    const tiempo = await obtenerTiempo()
    await guardarResultado(tiempo)
    localStorage.removeItem('dominoSinPosicion')
  } else {
    localStorage.setItem('dominoSinPosicion', 'true')
  }

  setTimeout(() => {
    window.location.href = 'final.html'
  }, 1400)
}

async function revisarEstadoTorneo() {
  if (await debeSalirDelTorneo(supabase, JUEGO_ACTUAL) && !juegoTerminado) {
    liberarBloqueoPestana()
    await guardarResultado(9999, true, true, 'Torneo detenido por admin')
    alert('Torneo detenido por el admin')
    window.location.href = salidaTorneoUrl()
  }
}

function resign() {
  if (juegoTerminado) return
  finishGame('Te has rendido sin posicion.', false)
}

function reproducirMusica() {
  const audio = document.querySelector('audio')
  if (!audio) return

  if (audio.paused) {
    audio.play()
  } else {
    audio.pause()
  }
}

window.passTurn = passTurn
window.resign = resign
window.reproducirMusica = reproducirMusica

window.addEventListener('DOMContentLoaded', () => {
  if (!iniciarBloqueoPestana()) {
    return
  }

  localStorage.removeItem('dominoSinPosicion')
  crearDominos()
  iniciarCronometro()
  setInterval(revisarEstadoTorneo, 3000)
})
