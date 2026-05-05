import { supabase } from '../../js/supabase.js'
import { registrarPartidaDesdeRanking } from '../../js/partidas.js'
import { debeSalirDelTorneo, obtenerInicioTorneo, registrarPuntosMiniTorneo, salidaTorneoUrl } from '../../js/mini-torneo.js'

// =============================
// BLOQUEO MULTI-PESTANA
// =============================
const BLOQUEO_PESTANA_KEY = 'damas_activo'
const BLOQUEO_TTL_MS = 5000
const TAB_ID = `damas_${Date.now()}_${Math.random().toString(36).slice(2)}`

let intervaloBloqueo = null

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
    alert('Ya tienes damas abierto en otra pestaña')
    window.location.href = 'lobby.html'
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
const JUEGO_ACTUAL = 'damas'
const boardEl = document.getElementById('board')
const statusEl = document.getElementById('status')
const historyEl = document.getElementById('history')
const resultEl = document.getElementById('result')

let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false
let intervalo = null
let botTimeout = null
let advertencias = 0
let ultimoCambio = Date.now()

const DURACION = 600
const MAX_ADVERTENCIAS = 3
const BOARD_SIZE = 8

let board = []
let selectedPiece = null
let highlightedMoves = []
let currentPlayer = 'red'
let moveCount = 0

// =============================
// ANTI-TRAMPA
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
  } else {
    descalificado = true
    juegoTerminado = true
    liberarBloqueoPestana()
    localStorage.setItem('juego_actual', 'damas')
    localStorage.setItem('damasResultado', 'Descalificado por cambiar de pestaña.')
    alert('Descalificado por cambiar de pestaña')
    window.location.href = 'final.html'
  }
})

window.addEventListener('storage', (event) => {
  if (event.key !== BLOQUEO_PESTANA_KEY || juegoTerminado) return

  const bloqueoActual = leerBloqueoPestana()
  if (bloqueoEstaVigente(bloqueoActual)) {
    alert('Ya tienes damas abierto en otra pestaña')
    window.location.href = 'lobby.html'
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

  const inicioTorneo = await obtenerInicioTorneo(supabase, JUEGO_ACTUAL)

  if (!inicioTorneo) {
    return
  }

  const { data: horaServer } = await supabase.rpc('ahora_servidor')

  const inicio = Date.parse(inicioTorneo)
  const ahora = Date.parse(horaServer)
  let restante = Math.floor((inicio + DURACION * 1000 - ahora) / 1000)

  if (isNaN(restante) || restante > DURACION) {
    restante = DURACION
  }

  if (restante <= 0) {
    reloj.innerText = '0:00'
    finalizarPorTiempo()
    return
  }

  function actualizar() {
    restante--

    if (restante <= 0) {
      clearInterval(intervalo)
      reloj.innerText = '0:00'
      finalizarPorTiempo()
      return
    }

    const min = Math.floor(restante / 60)
    const seg = restante % 60
    reloj.innerText = `${min}:${seg < 10 ? '0' : ''}${seg}`
  }

  actualizar()
  intervalo = setInterval(actualizar, 1000)
}

async function finalizarPorTiempo() {
  if (juegoTerminado) return

  juegoTerminado = true
  liberarBloqueoPestana()
  limpiarTurnoBot()

  if (!resultadoEnviado && !descalificado) {
    await guardarResultado(DURACION, false, false, 'Tiempo agotado')
  }

  localStorage.setItem('juego_actual', 'damas')
  localStorage.setItem('damasResultado', 'Tiempo terminado.')
  alert('Tiempo terminado')
  window.location.href = 'final.html'
}

// =============================
// TABLERO
// =============================
function crearPieza(color) {
  return { color, king: false }
}

function inicializarTablero() {
  board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 0) continue

      if (row < 3) {
        board[row][col] = crearPieza('blue')
      } else if (row > 4) {
        board[row][col] = crearPieza('red')
      }
    }
  }

  selectedPiece = null
  highlightedMoves = []
  currentPlayer = 'red'
  moveCount = 0

  renderBoard()
  updateInfo()
}

function renderBoard() {
  boardEl.innerHTML = ''

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement('button')
      square.type = 'button'
      square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`
      square.dataset.row = String(row)
      square.dataset.col = String(col)
      square.onclick = () => onSquareClick(row, col)

      if (selectedPiece?.row === row && selectedPiece?.col === col) {
        square.classList.add('selected-square')
      }

      const move = highlightedMoves.find((item) => item.row === row && item.col === col)
      if (move) {
        square.classList.add(move.capture ? 'capture-target' : 'move-target')
      }

      const piece = board[row][col]
      if (piece) {
        const pieceEl = document.createElement('div')
        pieceEl.className = `piece ${piece.color}${piece.king ? ' king' : ''}`
        pieceEl.textContent = piece.king ? 'D' : '●'
        square.appendChild(pieceEl)
      }

      boardEl.appendChild(square)
    }
  }
}

function updateInfo() {
  const redPieces = contarPiezas('red')
  const bluePieces = contarPiezas('blue')

  statusEl.innerText = currentPlayer === 'red' ? 'Tu turno' : 'Turno del bot'
  historyEl.innerText = `Rojas: ${redPieces} | Azules: ${bluePieces} | Movimientos: ${moveCount}`
}

function contarPiezas(color) {
  let total = 0

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.color === color) {
        total++
      }
    }
  }

  return total
}

function obtenerDirecciones(piece) {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]
  }

  return piece.color === 'red'
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]]
}

function estaDentro(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

function obtenerMovimientosDePieza(row, col, forceCaptureOnly = false) {
  const piece = board[row][col]
  if (!piece) return []

  const moves = []
  const directions = obtenerDirecciones(piece)

  directions.forEach(([dRow, dCol]) => {
    const nextRow = row + dRow
    const nextCol = col + dCol

    if (!estaDentro(nextRow, nextCol)) return

    const target = board[nextRow][nextCol]

    if (!target && !forceCaptureOnly) {
      moves.push({ row: nextRow, col: nextCol, capture: null })
      return
    }

    if (target && target.color !== piece.color) {
      const jumpRow = nextRow + dRow
      const jumpCol = nextCol + dCol

      if (estaDentro(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
        moves.push({
          row: jumpRow,
          col: jumpCol,
          capture: { row: nextRow, col: nextCol },
        })
      }
    }
  })

  return moves
}

function obtenerMovimientosValidos(row, col) {
  const piece = board[row][col]
  if (!piece) return []

  return obtenerMovimientosDePieza(row, col, false)
}

function onSquareClick(row, col) {
  if (juegoTerminado || currentPlayer !== 'red') return

  const clickedPiece = board[row][col]

  if (clickedPiece?.color === 'red') {
    const moves = obtenerMovimientosValidos(row, col)
    if (moves.length === 0) {
      statusEl.innerText = 'Esa ficha no tiene movimientos disponibles.'
      return
    }

    selectedPiece = { row, col }
    highlightedMoves = moves
    renderBoard()
    return
  }

  if (!selectedPiece) return

  const move = highlightedMoves.find((item) => item.row === row && item.col === col)
  if (move) {
    aplicarMovimiento(selectedPiece.row, selectedPiece.col, move)
  }
}

function aplicarMovimiento(fromRow, fromCol, move) {
  const piece = board[fromRow][fromCol]
  if (!piece) return

  board[move.row][move.col] = piece
  board[fromRow][fromCol] = null

  if (move.capture) {
    board[move.capture.row][move.capture.col] = null
  }

  coronarSiAplica(move.row, piece)
  moveCount++

  selectedPiece = null
  highlightedMoves = []

  if (revisarFinDePartida()) return

  currentPlayer = currentPlayer === 'red' ? 'blue' : 'red'
  renderBoard()
  updateInfo()

  if (currentPlayer === 'blue') {
    limpiarTurnoBot()
    botTimeout = setTimeout(botTurn, 700)
  }
}

function coronarSiAplica(row, piece) {
  if (piece.color === 'red' && row === 0) {
    piece.king = true
  }

  if (piece.color === 'blue' && row === BOARD_SIZE - 1) {
    piece.king = true
  }
}

function obtenerTodosLosMovimientos(color) {
  const moves = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece?.color !== color) continue

      const pieceMoves = obtenerMovimientosDePieza(row, col, false)
        .map((move) => ({
          fromRow: row,
          fromCol: col,
          move,
        }))

      moves.push(...pieceMoves)
    }
  }

  return moves
}

function botTurn() {
  if (juegoTerminado || currentPlayer !== 'blue') return

  const moves = obtenerTodosLosMovimientos('blue')
  if (moves.length === 0) {
    finishGame('Ganaste. El bot se quedó sin movimientos.')
    return
  }

  const captureMoves = moves.filter((item) => item.move.capture)
  const source = captureMoves.length ? captureMoves : moves
  const chosen = source[Math.floor(Math.random() * source.length)]

  aplicarMovimiento(chosen.fromRow, chosen.fromCol, chosen.move)
}

function revisarFinDePartida() {
  const redPieces = contarPiezas('red')
  const bluePieces = contarPiezas('blue')

  if (bluePieces === 0) {
    finishGame('Ganaste. Capturaste todas las piezas azules.')
    return true
  }

  if (redPieces === 0) {
    finishGame('Perdiste. El bot capturó todas tus piezas.')
    return true
  }

  const nextPlayer = currentPlayer === 'red' ? 'blue' : 'red'
  const nextMoves = obtenerTodosLosMovimientos(nextPlayer)

  if (nextMoves.length === 0) {
    if (nextPlayer === 'blue') {
      finishGame('Ganaste. El bot se quedó sin movimientos.')
    } else {
      finishGame('Perdiste. Te quedaste sin movimientos.')
    }
    return true
  }

  return false
}

function limpiarTurnoBot() {
  if (botTimeout) {
    clearTimeout(botTimeout)
    botTimeout = null
  }
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
    juego: 'damas',
  }

  let { error } = await supabase
    .from('ranking')
    .upsert(payload, { onConflict: 'usuario,juego' })

  if (!error) {
    await registrarPartidaDesdeRanking({
      usuario,
      juego: 'damas',
      valor: payload.tiempo,
      modo: 'time',
      invalido: invalidoFinal,
    })
    await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalidoFinal ? 0 : Math.max(0, DURACION - payload.tiempo))
    localStorage.setItem('damasEstadisticasPendientes', 'true')
    return
  }

  const fallback = await supabase
    .from('ranking_damas')
    .upsert(payload, { onConflict: 'usuario,juego' })

  if (fallback.error) {
    console.error('Error guardando resultado damas', fallback.error)
  } else {
    await registrarPartidaDesdeRanking({
      usuario,
      juego: 'damas',
      valor: payload.tiempo,
      modo: 'time',
      invalido: invalidoFinal,
    })
    await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalidoFinal ? 0 : Math.max(0, DURACION - payload.tiempo))
    localStorage.setItem('damasEstadisticasPendientes', 'true')
  }
}

async function eliminarResultadoDamas() {
  const ranking = await supabase
    .from('ranking')
    .delete()
    .eq('usuario', usuario)
    .eq('juego', 'damas')

  if (ranking.error) {
    console.warn('No se pudo limpiar ranking generico de damas', ranking.error)
  }

  const rankingDamas = await supabase
    .from('ranking_damas')
    .delete()
    .eq('usuario', usuario)
    .eq('juego', 'damas')

  if (rankingDamas.error) {
    console.warn('No se pudo limpiar ranking_damas', rankingDamas.error)
  }
}

async function finishGame(message, shouldSaveResult = true) {
  if (juegoTerminado) return

  juegoTerminado = true
  liberarBloqueoPestana()
  limpiarTurnoBot()

  if (message.startsWith('Perdiste') || message.startsWith('Empate') || message.startsWith('Rendici')) {
    shouldSaveResult = false
  }

  resultEl.innerText = message
  resultEl.style.display = 'block'
  statusEl.innerText = 'Partida finalizada.'

  localStorage.setItem('juego_actual', 'damas')
  localStorage.setItem('damasResultado', message)

  if (shouldSaveResult && !resultadoEnviado) {
    const tiempo = await obtenerTiempo()
    await guardarResultado(tiempo)
    localStorage.removeItem('damasSinPosicion')
  } else {
    await eliminarResultadoDamas()
    localStorage.setItem('damasSinPosicion', 'true')
  }

  setTimeout(() => {
    window.location.href = 'final.html'
  }, 1400)
}

async function revisarEstadoTorneo() {
  if (await debeSalirDelTorneo(supabase, JUEGO_ACTUAL) && !juegoTerminado) {
    liberarBloqueoPestana()
    limpiarTurnoBot()
    await guardarResultado(9999, true, true, 'Torneo detenido por admin')
    alert('Torneo detenido por el admin')
    window.location.href = salidaTorneoUrl()
  }
}

function resign() {
  if (juegoTerminado) return
  finishGame('Rendición. El bot gana.', false)
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

window.resign = resign
window.reproducirMusica = reproducirMusica

window.addEventListener('DOMContentLoaded', () => {
  if (!iniciarBloqueoPestana()) {
    return
  }

  inicializarTablero()
  iniciarCronometro()
  setInterval(revisarEstadoTorneo, 3000)
})
