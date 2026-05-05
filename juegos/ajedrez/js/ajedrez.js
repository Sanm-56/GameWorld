import { supabase } from '../../js/supabase.js'
import { registrarPartidaDesdeRanking } from '../../js/partidas.js'
import { debeSalirDelTorneo, obtenerInicioTorneo, registrarPuntosMiniTorneo, salidaTorneoUrl } from '../../js/mini-torneo.js'

// =============================
// 🔒 BLOQUEO MULTI-PESTAÑA
// =============================
const BLOQUEO_PESTANA_KEY = 'ajedrez_activo'
const BLOQUEO_TTL_MS = 5000
const TAB_ID = `ajedrez_${Date.now()}_${Math.random().toString(36).slice(2)}`
let intervaloBloqueo = null

function leerBloqueoPestana() {
  try {
    const valor = localStorage.getItem(BLOQUEO_PESTANA_KEY)
    return valor ? JSON.parse(valor) : null
  } catch (error) {
    console.warn('No se pudo leer bloqueo multi-pestaña', error)
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
    alert('Ya tienes el ajedrez abierto en otra pestaña')
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

window.addEventListener('storage', (event) => {
  if (event.key !== BLOQUEO_PESTANA_KEY || juegoTerminado) return

  const bloqueoActual = leerBloqueoPestana()
  if (bloqueoEstaVigente(bloqueoActual)) {
    alert('Ya tienes el ajedrez abierto en otra pestaña')
    window.location.href = 'lobby.html'
  }
})

// =============================
// 👤 USUARIO
// =============================
let usuario = localStorage.getItem('usuario') || 'anónimo'
const JUEGO_ACTUAL = 'ajedrez'

// =============================
// 🔒 CONTROL GLOBAL
// =============================
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false
let game
let board
let intervalo = null
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}
const STOCKFISH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js'
const STOCKFISH_DEPTH = 8
const STOCKFISH_MULTIPV = 3
const TRACKED_ACHIEVEMENTS = [
  'ajedrez_victorias_sin_perder_piezas',
  'ajedrez_mate_tras_sacrificar_reina',
  'ajedrez_final_menores_peones',
  'ajedrez_remontada_15_material',
  'ajedrez_dos_sacrificios_consecutivos',
  'ajedrez_victorias_80_movimientos',
  'ajedrez_rey_peon_vs_piezas',
  'ajedrez_derrota_mayor_rango',
  'ajedrez_racha_13_sin_errores',
  'ajedrez_jaque_5_turnos',
  'ajedrez_mate_dos_alfiles',
  'ajedrez_victoria_menos_10s',
  'ajedrez_mate_antes_15',
  'ajedrez_castiga_3_errores',
  'ajedrez_captura_mayores_antes_mate',
  'ajedrez_victoria_sin_enrocar',
  'ajedrez_3_promociones',
  'ajedrez_campeon_invicto',
]

// =============================
// ⚠️ ANTI-TRAMPA
// =============================
let advertencias = 0
const MAX_ADVERTENCIAS = 3
const DURACION = 600
let ultimoCambio = Date.now()
let piezasBlancasPerdidas = 0
let reinaBlancaSacrificada = false
let jugadorEnroco = false
let promocionesBlancas = 0
let minMaterialBlanco = 0
let capturasMayoresNegras = new Set()
let jaquesConsecutivosBlancos = 0
let maxJaquesConsecutivosBlancos = 0
let capturasConsecutivasBlancas = 0
let maxCapturasConsecutivasBlancas = 0
let piezasBlancasPerdidasConsecutivas = 0
let maxPiezasBlancasPerdidasConsecutivas = 0
let rachaLimpiaBlanca = 0
let maxRachaLimpiaBlanca = 0
let ultimoMovimientoBlanco = null
let perdioTorreBlanca = false
let primerJaqueBlancoMovimiento = null
let stockfish = null
let stockfishDisponible = false
let stockfishListo = false
let stockfishPendiente = null
let colaAnalisisStockfish = Promise.resolve()
let rachaEngineBlanca = 0
let maxRachaEngineBlanca = 0
let erroresConsecutivosRival = 0
let maxErroresConsecutivosRival = 0
let mateForzadoTrasSacrificioReina = false

// =============================
// 🎮 UI ELEMENTS
// =============================
const statusEl = document.getElementById('status')
const historyEl = document.getElementById('history')
const resultEl = document.getElementById('result')
const promotionModalEl = document.getElementById('promotionModal')
const promotionOptionEls = Array.from(document.querySelectorAll('.promotion-option'))
let pendingPromotion = null

// =============================
// 🔥 ANTI-TRAMPA: CAMBIO PESTAÑA
// =============================
document.addEventListener("visibilitychange", function(){
if(juegoTerminado) return
if(document.hidden){
let ahora = Date.now()

// ⛔ evita contar cambios rápidos (ej: abrir música)
if(ahora - ultimoCambio < 3000) return
ultimoCambio = ahora
advertencias++

if(advertencias === 1){
alert("⚠️ No cambies de pestaña")
}

else if(advertencias === 2){
alert("⚠️ Última advertencia")
}

else{
descalificado = true
juegoTerminado = true
localStorage.setItem("fin_juego","descalificado")
alert("❌ Descalificado por cambiar de pestaña")
window.location.href = "final.html"
}

}
})

function initializeChess() {
  if (!iniciarBloqueoPestana()) {
    return
  }

  if (typeof Chess === 'undefined') {
    console.error('Chess library not loaded.')
    return
  }

  if (typeof Chessboard === 'undefined') {
    console.error('Chessboard library not loaded.')
    return
  }

  game = new Chess()
  reiniciarMetricasAjedrez()
  iniciarStockfish()
  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    pieceTheme: 'vendor/img/chesspieces/wikipedia/{piece}.png',
    onDragStart: onDragStart,
    onDrop: handleMove,
    onSnapEnd: onSnapEnd,
  })

  updateBoard()
  iniciarCronometro()
  setInterval(revisarEstadoTorneo, 3000)
}

window.addEventListener('DOMContentLoaded', initializeChess)

// =============================
// ⏱️ CRONÓMETRO (SERVER TIME)
// =============================
async function iniciarCronometro() {
  const relojEl = document.getElementById('reloj')
  if (!relojEl) {
    // Si no existe reloj, crearlo
    const reloj = document.createElement('div')
    reloj.id = 'reloj'
    reloj.style.cssText = 'position:fixed;top:20px;right:20px;font-size:1.5em;background:#1e293b;padding:10px 20px;border-radius:8px;z-index:999;'
    document.body.appendChild(reloj)
  }

  const reloj = document.getElementById('reloj')

  if (intervalo) clearInterval(intervalo)

  const inicioTorneo = await obtenerInicioTorneo(supabase, JUEGO_ACTUAL)

  if (!inicioTorneo) {
    console.log('No hay torneo activo')
    return
  }

  // Traer hora del servidor
  let { data: horaServer } = await supabase.rpc('ahora_servidor')

  const inicio = Date.parse(inicioTorneo)
  const ahora = Date.parse(horaServer)

  let restante = Math.floor((inicio + DURACION * 1000 - ahora) / 1000)
  if (isNaN(restante) || restante > DURACION) {
    restante = DURACION
  }

  if (restante <= 0) {
    reloj.innerText = '0:00'
    window.location.href = 'final.html'
    return
  }

  async function actualizar() {
    restante--

    if (restante <= 0) {
      clearInterval(intervalo)
      reloj.innerText = '0:00'

      if (!descalificado) {
        await eliminarResultadoAjedrez()
      }

      juegoTerminado = true
      alert('Tiempo terminado')
      localStorage.setItem('juego_actual', 'ajedrez')
      window.location.href = 'final.html'
      return
    }

    let min = Math.floor(restante / 60)
    let seg = restante % 60

    reloj.innerText = min + ':' + (seg < 10 ? '0' : '') + seg
  }

  actualizar()
  intervalo = setInterval(actualizar, 1000)
}

function onDragStart(source, piece) {
  if (game.game_over()) return false
  if (piece.search(/^b/) !== -1) return false
}

function isPlayerPromotionMove(source, target) {
  const piece = game.get(source)
  return piece?.type === 'p' && piece.color === 'w' && target[1] === '8'
}

function openPromotionModal(source, target) {
  pendingPromotion = { source, target }
  promotionModalEl.classList.add('visible')
}

function closePromotionModal() {
  pendingPromotion = null
  promotionModalEl.classList.remove('visible')
}

function applyPromotionChoice(promotion) {
  if (!pendingPromotion) return

  const { source, target } = pendingPromotion
  closePromotionModal()

  const materialAntes = calcularMaterialBlanco()
  const fenAntes = game.fen()
  const move = game.move({ from: source, to: target, promotion })
  if (move === null) {
    board.position(game.fen())
    return
  }

  registrarMovimiento(move, materialAntes)
  encolarAnalisisMovimiento(fenAntes, move)
  updateBoard()

  if (!game.game_over() && game.turn() === 'b') {
    setTimeout(makeBotMove, 900)
  }
}

function handleMove(source, target) {
  if (isPlayerPromotionMove(source, target)) {
    openPromotionModal(source, target)
    return 'snapback'
  }

  const materialAntes = calcularMaterialBlanco()
  const fenAntes = game.fen()
  const move = game.move({ from: source, to: target, promotion: 'q' })

  if (move === null) {
    return 'snapback'
  }

  registrarMovimiento(move, materialAntes)
  encolarAnalisisMovimiento(fenAntes, move)
  updateBoard()

  if (!game.game_over() && game.turn() === 'b') {
    setTimeout(makeBotMove, 900)
  }
}

function onSnapEnd() {
  if (!board || !game) return
  board.position(game.fen())
}

function updateBoard() {
  if (!board || !game) return
  board.position(game.fen())
  updateStatus()
  updateHistory()
}

function makeBotMove() {
  if (game.game_over()) return

  const moves = game.moves({ verbose: true })
  if (!moves.length) return

  const scoredMoves = moves.map((move) => ({
    move,
    score: scoreBotMove(move),
  }))

  scoredMoves.sort((a, b) => b.score - a.score)

  const topScore = scoredMoves[0].score
  const topMoves = scoredMoves.filter((item) => item.score >= topScore - 25)
  const chosen = topMoves[Math.floor(Math.random() * topMoves.length)].move

  const materialAntes = calcularMaterialBlanco()
  const fenAntes = game.fen()
  const move = game.move({ from: chosen.from, to: chosen.to, promotion: chosen.promotion || 'q' })
  registrarMovimiento(move, materialAntes)
  encolarAnalisisMovimiento(fenAntes, move)
  updateBoard()
}

function scoreBotMove(move) {
  const beforeTurn = game.turn()
  const movingPiece = move.piece
  const fromRank = parseInt(move.from[1], 10)
  const toRank = parseInt(move.to[1], 10)
  let score = 0

  game.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' })

  if (game.in_checkmate()) {
    game.undo()
    return 100000
  }

  if (move.flags.includes('c') || move.flags.includes('e')) {
    score += PIECE_VALUES[move.captured] || 0
  }

  if (move.flags.includes('p')) {
    score += 800
  }

  if (game.in_check()) {
    score += 60
  }

  if (movingPiece === 'p') {
    score += (toRank - fromRank) * 12
    if (toRank >= 6) {
      score += 20
    }
  }

  if (movingPiece === 'n' || movingPiece === 'b') {
    score += 18
  }

  if (move.to === 'd4' || move.to === 'e4' || move.to === 'd5' || move.to === 'e5') {
    score += 25
  }

  if (move.flags.includes('k') || move.flags.includes('q')) {
    score += 35
  }

  if (estaCasillaAtacadaPorBlancas(move.to)) {
    score -= (PIECE_VALUES[movingPiece] || 0) * 0.35
  }

  if (dejaPiezaColgando(move.to, movingPiece)) {
    score -= (PIECE_VALUES[movingPiece] || 0) * 0.55
  }

  const playerReplies = game.moves({ verbose: true })
  if (playerReplies.some((reply) => {
    game.move({ from: reply.from, to: reply.to, promotion: reply.promotion || 'q' })
    const mate = game.in_checkmate()
    game.undo()
    return mate
  })) {
    score -= 5000
  }

  if (beforeTurn === 'b' && playerReplies.length <= 4) {
    score += 10
  }

  game.undo()

  score += Math.random() * 18
  return score
}

function estaCasillaAtacadaPorBlancas(square) {
  const replies = game.moves({ verbose: true })
  return replies.some((reply) => reply.to === square || (reply.flags.includes('c') && reply.to === square))
}

function dejaPiezaColgando(square, movingPiece) {
  const playerMoves = game.moves({ verbose: true })
  let attackers = 0

  playerMoves.forEach((reply) => {
    if (reply.to === square && (reply.flags.includes('c') || reply.flags.includes('e'))) {
      attackers++
    }
  })

  if (attackers === 0) return false

  const defenders = contarDefensoresNegros(square, movingPiece)
  return attackers > defenders
}

function contarDefensoresNegros(square, movingPiece) {
  const fenParts = game.fen().split(' ')
  fenParts[1] = 'b'
  const blackView = new Chess(fenParts.join(' '))
  const blackMoves = blackView.moves({ verbose: true })

  return blackMoves.filter((candidate) => {
    if (candidate.from === square) return false
    if (candidate.to !== square) return false
    return candidate.piece !== movingPiece || candidate.from !== square
  }).length
}

function iniciarStockfish() {
  if (stockfish || typeof Worker === 'undefined') return

  try {
    const workerCode = `importScripts("${STOCKFISH_URL}");`
    const workerUrl = URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' }))
    stockfish = new Worker(workerUrl)
    URL.revokeObjectURL(workerUrl)
    stockfishDisponible = true

    stockfish.onmessage = (event) => manejarMensajeStockfish(String(event.data || event))
    stockfish.onerror = (error) => {
      console.warn('Stockfish no esta disponible, usando logros aproximados', error)
      stockfishDisponible = false
      resolverStockfishPendiente(null)
    }

    enviarStockfish('uci')
    enviarStockfish(`setoption name MultiPV value ${STOCKFISH_MULTIPV}`)
    enviarStockfish('isready')
  } catch (error) {
    console.warn('No se pudo iniciar Stockfish', error)
    stockfishDisponible = false
  }
}

function manejarMensajeStockfish(texto) {
  if (texto === 'uciok' || texto === 'readyok') {
    stockfishListo = true
  }

  if (!stockfishPendiente) return

  stockfishPendiente.lines.push(texto)

  if (texto.startsWith('bestmove')) {
    const pendiente = stockfishPendiente
    stockfishPendiente = null
    pendiente.resolve(parsearAnalisisStockfish(pendiente.lines))
  }
}

function enviarStockfish(command) {
  if (!stockfishDisponible || !stockfish) return
  stockfish.postMessage(command)
}

function resolverStockfishPendiente(valor) {
  if (!stockfishPendiente) return
  const pendiente = stockfishPendiente
  stockfishPendiente = null
  pendiente.resolve(valor)
}

function analizarConStockfish(fen) {
  if (!stockfishDisponible || !stockfish) return Promise.resolve(null)

  return new Promise((resolve) => {
    stockfishPendiente = { resolve, lines: [] }
    enviarStockfish('stop')
    enviarStockfish(`setoption name MultiPV value ${STOCKFISH_MULTIPV}`)
    enviarStockfish(`position fen ${fen}`)
    enviarStockfish(`go depth ${STOCKFISH_DEPTH}`)

    setTimeout(() => {
      if (stockfishPendiente?.resolve === resolve) {
        resolverStockfishPendiente(null)
      }
    }, 4500)
  })
}

function parsearAnalisisStockfish(lines) {
  const mejores = new Map()
  let mate = null

  lines.forEach((line) => {
    const pvMatch = line.match(/\bmultipv\s+(\d+).*?\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/)
    const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/)

    if (scoreMatch?.[1] === 'mate') {
      const mateValue = Number(scoreMatch[2])
      if (mate === null || Math.abs(mateValue) < Math.abs(mate)) {
        mate = mateValue
      }
    }

    if (pvMatch) {
      mejores.set(Number(pvMatch[1]), pvMatch[2])
    }
  })

  const bestLine = lines.find((line) => line.startsWith('bestmove')) || ''
  const bestMove = bestLine.split(/\s+/)[1] || null
  const topMoves = [...mejores.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, move]) => move)

  if (bestMove && !topMoves.includes(bestMove)) {
    topMoves.unshift(bestMove)
  }

  return { bestMove, topMoves, mate }
}

function moveToUci(move) {
  return `${move.from}${move.to}${move.promotion || ''}`
}

function encolarAnalisisMovimiento(fenAntes, move) {
  if (!fenAntes || !move) return

  colaAnalisisStockfish = colaAnalisisStockfish
    .then(async () => {
      const analisis = await analizarConStockfish(fenAntes)
      aplicarAnalisisMovimiento(move, analisis)
    })
    .catch((error) => {
      console.warn('Fallo el analisis de Stockfish', error)
    })
}

function aplicarAnalisisMovimiento(move, analisis) {
  if (!analisis?.topMoves?.length) return

  const uci = moveToUci(move)
  const esMovimientoBueno = analisis.topMoves.includes(uci)

    if (move.color === 'w') {
    if (esMovimientoBueno) {
      rachaEngineBlanca++
      maxRachaEngineBlanca = Math.max(maxRachaEngineBlanca, rachaEngineBlanca)
    } else {
      rachaEngineBlanca = 0
    }

    if (reinaBlancaSacrificada && analisis.mate !== null && analisis.mate > 0) {
      mateForzadoTrasSacrificioReina = true
    }
  } else if (move.color === 'b') {
    if (!esMovimientoBueno) {
      erroresConsecutivosRival++
      maxErroresConsecutivosRival = Math.max(maxErroresConsecutivosRival, erroresConsecutivosRival)
    } else {
      erroresConsecutivosRival = 0
    }
  }
}

async function esperarAnalisisStockfish() {
  try {
    await colaAnalisisStockfish
  } catch (error) {
    console.warn('No se pudo completar el analisis pendiente', error)
  }
}

function reiniciarMetricasAjedrez() {
  piezasBlancasPerdidas = 0
  reinaBlancaSacrificada = false
  jugadorEnroco = false
  promocionesBlancas = 0
  minMaterialBlanco = 0
  capturasMayoresNegras = new Set()
  jaquesConsecutivosBlancos = 0
  maxJaquesConsecutivosBlancos = 0
  capturasConsecutivasBlancas = 0
  maxCapturasConsecutivasBlancas = 0
  piezasBlancasPerdidasConsecutivas = 0
  maxPiezasBlancasPerdidasConsecutivas = 0
  rachaLimpiaBlanca = 0
  maxRachaLimpiaBlanca = 0
  ultimoMovimientoBlanco = null
  perdioTorreBlanca = false
  primerJaqueBlancoMovimiento = null
  rachaEngineBlanca = 0
  maxRachaEngineBlanca = 0
  erroresConsecutivosRival = 0
  maxErroresConsecutivosRival = 0
  mateForzadoTrasSacrificioReina = false
  colaAnalisisStockfish = Promise.resolve()
}

function contarPiezas(color) {
  const conteo = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
  const boardState = game.board()

  boardState.forEach((row) => {
    row.forEach((piece) => {
      if (piece?.color === color) {
        conteo[piece.type]++
      }
    })
  })

  return conteo
}

function calcularMaterialBlanco() {
  const piezas = contarPiezas('w')
  const negras = contarPiezas('b')
  const valor = (conteo) => Object.entries(conteo).reduce((total, [piece, amount]) => {
    if (piece === 'k') return total
    return total + (PIECE_VALUES[piece] || 0) * amount
  }, 0)

  return valor(piezas) - valor(negras)
}

function registrarMovimiento(move, materialAntes) {
  if (!move) return

  if (move.color === 'w') {
    ultimoMovimientoBlanco = move

    if (move.flags.includes('k') || move.flags.includes('q')) {
      jugadorEnroco = true
    }

    if (move.flags.includes('p')) {
      promocionesBlancas++
    }

    if (move.flags.includes('c') || move.flags.includes('e')) {
      capturasConsecutivasBlancas++
      maxCapturasConsecutivasBlancas = Math.max(maxCapturasConsecutivasBlancas, capturasConsecutivasBlancas)

      if (move.captured === 'q' || move.captured === 'r') {
        capturasMayoresNegras.add(move.to)
      }
    } else {
      capturasConsecutivasBlancas = 0
    }

    if (game.in_check()) {
      jaquesConsecutivosBlancos++
      maxJaquesConsecutivosBlancos = Math.max(maxJaquesConsecutivosBlancos, jaquesConsecutivosBlancos)
      if (primerJaqueBlancoMovimiento === null) {
        primerJaqueBlancoMovimiento = Math.ceil(game.history().length / 2)
      }
    } else {
      jaquesConsecutivosBlancos = 0
    }

    rachaLimpiaBlanca++
    maxRachaLimpiaBlanca = Math.max(maxRachaLimpiaBlanca, rachaLimpiaBlanca)
    piezasBlancasPerdidasConsecutivas = 0
  } else if (move.color === 'b') {
    if (move.flags.includes('c') || move.flags.includes('e')) {
      piezasBlancasPerdidas++
      rachaLimpiaBlanca = 0
      piezasBlancasPerdidasConsecutivas++
      maxPiezasBlancasPerdidasConsecutivas = Math.max(maxPiezasBlancasPerdidasConsecutivas, piezasBlancasPerdidasConsecutivas)

      if (move.captured === 'q') {
        reinaBlancaSacrificada = true
      }

      if (move.captured === 'r') {
        perdioTorreBlanca = true
      }
    } else {
      piezasBlancasPerdidasConsecutivas = 0
    }
  }

  const materialDespues = calcularMaterialBlanco()
  minMaterialBlanco = Math.min(minMaterialBlanco, materialAntes, materialDespues)
}

function updateStatus() {
  let status = ''

  if (game.in_checkmate()) {
    const winner = game.turn() === 'w' ? 'Negras' : 'Blancas'
    status = `¡Jaque mate! ${winner} gana.`
    finishGame(status, winner === 'Blancas')
  } else if (game.in_draw()) {
    status = 'Tablas.'
    finishGame(status, false)
  } else {
    status = game.turn() === 'w' ? 'Turno de blancas' : 'Turno de negras'
    if (game.in_check()) {
      status += ' (Jaque)'
    }
  }

  statusEl.innerText = status
}

function updateHistory() {
  const moves = game.history({ verbose: true })
  if (moves.length === 0) {
    historyEl.innerText = 'Movimientos: -'
    return
  }

  const formatted = moves
    .map((move, index) => {
      if (move.color === 'w') {
        return `${Math.ceil((index + 1) / 2)}. ${move.san}`
      }
      return move.san
    })
    .join(' ')

  historyEl.innerText = `Movimientos: ${formatted}`
}

async function obtenerTiempo() {
  const inicioTorneo = await obtenerInicioTorneo(supabase, JUEGO_ACTUAL)

  if (!inicioTorneo) {
    console.error('Error obteniendo inicio_torneo')
    return 9999
  }

  const { data: horaServer, error: horaError } = await supabase.rpc('ahora_servidor')
  if (horaError) {
    console.error('Error obteniendo hora de servidor', horaError)
    return 9999
  }

  const inicio = Date.parse(inicioTorneo)
  const ahora = Date.parse(horaServer)
  return Math.max(0, Math.floor((ahora - inicio) / 1000))
}

async function obtenerPosicionAjedrez() {
  let result = await supabase
    .from('ranking_ajedrez')
    .select('usuario')
    .eq('invalido', false)
    .order('tiempo', { ascending: true })

  if (result.error || !result.data) {
    result = await supabase
      .from('ranking')
      .select('usuario')
      .eq('juego', 'ajedrez')
      .eq('invalido', false)
      .order('tiempo', { ascending: true })
  }

  if (result.error || !result.data) {
    console.warn('No se pudo calcular posicion de ajedrez', result.error)
    return null
  }

  const index = result.data.findIndex((item) => item.usuario === usuario)
  return index >= 0 ? index + 1 : null
}

function obtenerClaveApertura() {
  return game.history({ verbose: true })
    .slice(0, 8)
    .map((move) => move.san.replace(/[+#?!]/g, ''))
    .join(' ')
}

function parsearHistorialAperturas(valor) {
  if (!valor) return []
  try {
    const parsed = JSON.parse(valor)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function calcularRachaAperturasDiferentes(actual, apertura) {
  const historialPrevio = parsearHistorialAperturas(actual?.ajedrez_aperturas_diferentes_historial)
  let historial = historialPrevio

  if (!apertura) {
    historial = []
  } else if (historial.includes(apertura)) {
    historial = [apertura]
  } else {
    historial = [...historial, apertura].slice(-12)
  }

  return {
    historial,
    actual: historial.length,
    mejor: Math.max(actual?.ajedrez_mejor_racha_aperturas_diferentes || 0, historial.length),
  }
}

function actualizarRacha(actual, condicion, actualKey, mejorKey) {
  const valorActual = condicion ? (actual?.[actualKey] || 0) + 1 : 0
  return {
    actual: valorActual,
    mejor: Math.max(actual?.[mejorKey] || 0, valorActual),
  }
}

function evaluarLogrosAjedrez(tiempo, posicion) {
  const history = game.history({ verbose: true })
  const piezasBlancas = contarPiezas('w')
  const piezasNegras = contarPiezas('b')
  const piezasBlancasNoRey = piezasBlancas.p + piezasBlancas.n + piezasBlancas.b + piezasBlancas.r + piezasBlancas.q
  const piezasNegrasNoRey = piezasNegras.p + piezasNegras.n + piezasNegras.b + piezasNegras.r + piezasNegras.q
  const jugadasCompletas = Math.ceil(history.length / 2)
  const tiempoRestante = DURACION - tiempo
  const sinTorresNiReina = piezasBlancas.q === 0 && piezasBlancas.r === 0
  const tieneMenoresOPeones = piezasBlancas.p + piezasBlancas.n + piezasBlancas.b > 0
  const apertura = obtenerClaveApertura()

  return {
    apertura,
    logros: {
      ajedrez_victorias_sin_perder_piezas: piezasBlancasPerdidas === 0,
      ajedrez_mate_tras_sacrificar_reina: reinaBlancaSacrificada && (mateForzadoTrasSacrificioReina || game.in_checkmate()),
      ajedrez_final_menores_peones: sinTorresNiReina && tieneMenoresOPeones,
      ajedrez_remontada_15_material: minMaterialBlanco <= -1500,
      ajedrez_dos_sacrificios_consecutivos: maxPiezasBlancasPerdidasConsecutivas >= 2,
      ajedrez_victorias_80_movimientos: history.length > 80,
      ajedrez_rey_peon_vs_piezas: piezasBlancas.p === 1 && piezasBlancasNoRey === 1 && piezasNegrasNoRey >= 2,
      ajedrez_derrota_mayor_rango: false,
      ajedrez_racha_13_sin_errores: Math.max(maxRachaEngineBlanca, maxRachaLimpiaBlanca) >= 13,
      ajedrez_jaque_5_turnos: maxJaquesConsecutivosBlancos >= 5,
      ajedrez_mate_dos_alfiles: ultimoMovimientoBlanco?.piece === 'b' && piezasBlancas.b >= 2 && game.in_checkmate(),
      ajedrez_victoria_menos_10s: tiempoRestante > 0 && tiempoRestante < 10,
      ajedrez_mate_antes_15: jugadasCompletas < 15 && game.in_checkmate(),
      ajedrez_castiga_3_errores: Math.max(maxErroresConsecutivosRival, maxCapturasConsecutivasBlancas) >= 3,
      ajedrez_captura_mayores_antes_mate: piezasNegras.q === 0 && piezasNegras.r === 0 && game.in_checkmate(),
      ajedrez_victoria_sin_enrocar: !jugadorEnroco,
      ajedrez_3_promociones: promocionesBlancas >= 3,
      ajedrez_campeon_invicto: posicion === 1 && piezasBlancasPerdidas === 0,
    },
    condicionesRacha: {
      terminoConMate: game.in_checkmate(),
      menos25Movimientos: jugadasCompletas < 25,
      sinTablas: !game.in_draw(),
      sacrificoPieza: piezasBlancasPerdidas > 0,
      sinPerderTorre: !perdioTorreBlanca,
      jaqueAntes10: primerJaqueBlancoMovimiento !== null && primerJaqueBlancoMovimiento < 10,
      remontadaMaterial: minMaterialBlanco < 0,
    },
  }
}

async function guardarEstadisticasAjedrez(tiempo, posicion) {
  await esperarAnalisisStockfish()

  const { data: actual, error: lecturaError } = await supabase
    .from('estadisticas_logros')
    .select('*')
    .eq('usuario', usuario)
    .eq('juego', 'ajedrez')
    .maybeSingle()

  if (lecturaError) {
    console.warn('No se pudieron leer estadisticas de ajedrez', lecturaError)
    return
  }

  const evaluacion = evaluarLogrosAjedrez(tiempo, posicion)
  const mismaApertura = actual?.ajedrez_apertura_actual === evaluacion.apertura
  const rachaApertura = mismaApertura ? (actual?.ajedrez_racha_apertura_actual || 0) + 1 : 1
  const rachaAperturasDiferentes = calcularRachaAperturasDiferentes(actual, evaluacion.apertura)
  const rachaMate = actualizarRacha(actual, evaluacion.condicionesRacha.terminoConMate, 'ajedrez_racha_mate_actual', 'ajedrez_mejor_racha_mate')
  const rachaMenos25 = actualizarRacha(actual, evaluacion.condicionesRacha.menos25Movimientos, 'ajedrez_racha_menos_25_movimientos_actual', 'ajedrez_mejor_racha_menos_25_movimientos')
  const rachaSinTablas = actualizarRacha(actual, evaluacion.condicionesRacha.sinTablas, 'ajedrez_racha_sin_tablas_actual', 'ajedrez_mejor_racha_sin_tablas')
  const rachaSacrificio = actualizarRacha(actual, evaluacion.condicionesRacha.sacrificoPieza, 'ajedrez_racha_sacrificio_actual', 'ajedrez_mejor_racha_sacrificio')
  const rachaSinPerderTorre = actualizarRacha(actual, evaluacion.condicionesRacha.sinPerderTorre, 'ajedrez_racha_sin_perder_torre_actual', 'ajedrez_mejor_racha_sin_perder_torre')
  const rachaJaqueAntes10 = actualizarRacha(actual, evaluacion.condicionesRacha.jaqueAntes10, 'ajedrez_racha_jaque_antes_10_actual', 'ajedrez_mejor_racha_jaque_antes_10')
  const rachaRemontada = actualizarRacha(actual, evaluacion.condicionesRacha.remontadaMaterial, 'ajedrez_racha_remontada_material_actual', 'ajedrez_mejor_racha_remontada_material')
  const rachaVictoriaTrasDerrota = actual?.ajedrez_perdio_partida_previa
    ? (actual?.ajedrez_racha_victoria_tras_derrota_actual || 0) + 1
    : 0
  const esVictoria = posicion === 1
  const rachaVictoriasTorneosActual = esVictoria
    ? (actual?.racha_victorias_torneos_actual || 0) + 1
    : 0
  const mejorPosicionAnterior = actual?.mejor_posicion_torneo
  const mejorPosicionTorneo = typeof posicion === 'number'
    ? (typeof mejorPosicionAnterior === 'number' ? Math.min(mejorPosicionAnterior, posicion) : posicion)
    : mejorPosicionAnterior

  const payload = {
    usuario,
    juego: 'ajedrez',
    completados: (actual?.completados || 0) + 1,
    torneos_participados: (actual?.torneos_participados || 0) + 1,
    victorias_torneos: (actual?.victorias_torneos || 0) + (esVictoria ? 1 : 0),
    racha_victorias_torneos_actual: rachaVictoriasTorneosActual,
    mejor_racha_victorias_torneos: Math.max(actual?.mejor_racha_victorias_torneos || 0, rachaVictoriasTorneosActual),
    mejor_posicion_torneo: mejorPosicionTorneo,
    ultima_posicion_torneo: posicion,
    mejor_tiempo: typeof actual?.mejor_tiempo === 'number' ? Math.min(actual.mejor_tiempo, tiempo) : tiempo,
    ajedrez_victorias_clasificatorias: (actual?.ajedrez_victorias_clasificatorias || 0) + 1,
    ajedrez_apertura_actual: evaluacion.apertura,
    ajedrez_racha_apertura_actual: rachaApertura,
    ajedrez_mejor_racha_apertura: Math.max(actual?.ajedrez_mejor_racha_apertura || 0, rachaApertura),
    ajedrez_racha_mate_actual: rachaMate.actual,
    ajedrez_mejor_racha_mate: rachaMate.mejor,
    ajedrez_racha_aperturas_diferentes_actual: rachaAperturasDiferentes.actual,
    ajedrez_mejor_racha_aperturas_diferentes: rachaAperturasDiferentes.mejor,
    ajedrez_aperturas_diferentes_historial: JSON.stringify(rachaAperturasDiferentes.historial),
    ajedrez_racha_menos_25_movimientos_actual: rachaMenos25.actual,
    ajedrez_mejor_racha_menos_25_movimientos: rachaMenos25.mejor,
    ajedrez_racha_sin_tablas_actual: rachaSinTablas.actual,
    ajedrez_mejor_racha_sin_tablas: rachaSinTablas.mejor,
    ajedrez_racha_sacrificio_actual: rachaSacrificio.actual,
    ajedrez_mejor_racha_sacrificio: rachaSacrificio.mejor,
    ajedrez_racha_sin_perder_torre_actual: rachaSinPerderTorre.actual,
    ajedrez_mejor_racha_sin_perder_torre: rachaSinPerderTorre.mejor,
    ajedrez_racha_jaque_antes_10_actual: rachaJaqueAntes10.actual,
    ajedrez_mejor_racha_jaque_antes_10: rachaJaqueAntes10.mejor,
    ajedrez_racha_remontada_material_actual: rachaRemontada.actual,
    ajedrez_mejor_racha_remontada_material: rachaRemontada.mejor,
    ajedrez_perdio_partida_previa: false,
    ajedrez_racha_victoria_tras_derrota_actual: rachaVictoriaTrasDerrota,
    ajedrez_mejor_racha_victoria_tras_derrota: Math.max(actual?.ajedrez_mejor_racha_victoria_tras_derrota || 0, rachaVictoriaTrasDerrota),
    updated_at: new Date().toISOString(),
  }

  TRACKED_ACHIEVEMENTS.forEach((key) => {
    payload[key] = (actual?.[key] || 0) + (evaluacion.logros[key] ? 1 : 0)
  })

  const { error } = await supabase
    .from('estadisticas_logros')
    .upsert(payload, { onConflict: 'usuario,juego' })

  if (error) {
    console.warn('No se pudieron guardar estadisticas de ajedrez', error)
  }
}

async function guardarResultado(tiempo, sospechoso = false, invalido = false, motivo = '') {
  if (resultadoEnviado) return

  resultadoEnviado = true

  let sospechoso_final = sospechoso
  let invalido_final = invalido
  let motivo_final = motivo

  // ⚠️ TIEMPO RÁPIDO
  if (tiempo < 60) {
    sospechoso_final = true
    motivo_final += 'Tiempo menor a 1 minuto | '
  }

  // 💀 IMPOSIBLE
  if (tiempo < 30) {
    sospechoso_final = true
    invalido_final = true
    motivo_final += 'Tiempo extremadamente bajo (<30s) | '
  }

  // 👀 PESTAÑA
  if (advertencias > 0) {
    sospechoso_final = true
    motivo_final += 'Cambio de pestaña | '
  }

  // 💀 MUCHAS
  if (advertencias >= MAX_ADVERTENCIAS) {
    invalido_final = true
    motivo_final += 'Demasiados cambios | '
  }

  const payload = {
    usuario,
    tiempo: invalido_final ? 9999 : tiempo,
    sospechoso: sospechoso_final,
    invalido: invalido_final,
    motivo: motivo_final,
    juego: 'ajedrez',
  }

  let { data, error } = await supabase
    .from('ranking')
    .upsert(payload, { onConflict: 'usuario' })

  if (error) {
    console.error('Error guardando resultado ajedrez en ranking', error)

    const fallback = await supabase
      .from('ranking_ajedrez')
      .upsert(payload, { onConflict: 'usuario,juego' })

    if (fallback.error) {
      console.error('Error en ranking_ajedrez', fallback.error)
    } else {
      console.log('Resultado guardado en ranking_ajedrez', fallback.data)
      await registrarPartidaDesdeRanking({
        usuario,
        juego: 'ajedrez',
        valor: payload.tiempo,
        modo: 'time',
        invalido: invalido_final,
      })
      await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalido_final ? 0 : Math.max(0, DURACION - payload.tiempo))
      if (!invalido_final) {
        const posicion = await obtenerPosicionAjedrez()
        await guardarEstadisticasAjedrez(tiempo, posicion)
      }
    }
    return
  }

  await registrarPartidaDesdeRanking({
    usuario,
    juego: 'ajedrez',
    valor: payload.tiempo,
    modo: 'time',
    invalido: invalido_final,
  })
  await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalido_final ? 0 : Math.max(0, DURACION - payload.tiempo))
  if (!invalido_final) {
    const posicion = await obtenerPosicionAjedrez()
    await guardarEstadisticasAjedrez(tiempo, posicion)
  }
  console.log('Resultado ajedrez guardado', data)
}

async function eliminarResultadoAjedrez() {
  const ranking = await supabase
    .from('ranking')
    .delete()
    .eq('usuario', usuario)
    .eq('juego', 'ajedrez')

  if (ranking.error) {
    console.warn('No se pudo limpiar ranking generico de ajedrez', ranking.error)
  }

  const rankingAjedrez = await supabase
    .from('ranking_ajedrez')
    .delete()
    .eq('usuario', usuario)
    .eq('juego', 'ajedrez')

  if (rankingAjedrez.error) {
    console.warn('No se pudo limpiar ranking_ajedrez', rankingAjedrez.error)
  }
}

async function marcarDerrotaAjedrez() {
  const { data: actual } = await supabase
    .from('estadisticas_logros')
    .select('ajedrez_racha_victoria_tras_derrota_actual')
    .eq('usuario', usuario)
    .eq('juego', 'ajedrez')
    .maybeSingle()

  const { error } = await supabase
    .from('estadisticas_logros')
    .upsert({
      usuario,
      juego: 'ajedrez',
      ajedrez_perdio_partida_previa: true,
      ajedrez_racha_victoria_tras_derrota_actual: actual?.ajedrez_racha_victoria_tras_derrota_actual || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'usuario,juego' })

  if (error) {
    console.warn('No se pudo marcar derrota de ajedrez', error)
  }
}

async function finishGame(message, wasVictory = true) {
  if (juegoTerminado) return
  juegoTerminado = true
  liberarBloqueoPestana()

  resultEl.innerText = message
  resultEl.style.display = 'block'

  // Solo guardar si el jugador humano ganó de forma legítima.
  if (wasVictory && !resultadoEnviado) {
    const tiempo = await obtenerTiempo()
    await guardarResultado(tiempo)
  } else {
    await eliminarResultadoAjedrez()
    await marcarDerrotaAjedrez()
  }

  localStorage.setItem('juego_actual', 'ajedrez')
  localStorage.setItem('ajedrezResultado', message)

  setTimeout(() => {
    window.location.href = 'final.html'
  }, 1400)
}

function resetGame() {
  if (juegoTerminado && !confirm('¿Reiniciar la partida?')) return
  
  game.reset()
  board.start()
  
  // Limpiar estado de juego
  resultEl.style.display = 'none'
  resultEl.innerText = ''
  resultadoEnviado = false
  juegoTerminado = false
  advertencias = 0
  reiniciarMetricasAjedrez()
  
  // Limpiar localStorage
  localStorage.removeItem('ajedrezResultado')
  localStorage.removeItem('juego_actual')
  
  updateBoard()
  statusEl.innerText = 'Partida reiniciada'
}

async function revisarEstadoTorneo() {
  if (await debeSalirDelTorneo(supabase, JUEGO_ACTUAL) && !juegoTerminado) {
    liberarBloqueoPestana()
    await guardarResultado(9999, true, true, 'Torneo detenido por admin')
    alert('⛔ Torneo detenido por el admin')
    window.location.href = 'lobby.html'
  }
}

function resign() {
  if (juegoTerminado) return
  juegoTerminado = true
  liberarBloqueoPestana()
  
  // NO guardar resultado si se rinde
  resultEl.innerText = 'Te rendiste. Partida abandonada.'
  resultEl.style.display = 'block'

  localStorage.setItem('juego_actual', 'ajedrez')
  localStorage.setItem('ajedrezResultado', 'Rendición')

  setTimeout(async () => {
    await eliminarResultadoAjedrez()
    await marcarDerrotaAjedrez()
    window.location.href = 'final.html'
  }, 1400)
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

window.resetGame = resetGame
window.resign = resign
window.reproducirMusica = reproducirMusica

promotionOptionEls.forEach((button) => {
  button.addEventListener('click', () => {
    applyPromotionChoice(button.dataset.piece)
  })
})
