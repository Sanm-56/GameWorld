import { supabase } from '../../js/supabase.js'
import { registrarPartidaDesdeRanking } from '../../js/partidas.js'

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

// =============================
// ⚠️ ANTI-TRAMPA
// =============================
let advertencias = 0
const MAX_ADVERTENCIAS = 3
const DURACION = 600
let ultimoCambio = Date.now()

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

  // Traer inicio torneo
  let { data: torneo } = await supabase
    .from('estado_torneo')
    .select('inicio_torneo')
    .eq('id', 1)
    .single()

  if (!torneo || !torneo.inicio_torneo) {
    console.log('No hay torneo activo')
    return
  }

  // Traer hora del servidor
  let { data: horaServer } = await supabase.rpc('ahora_servidor')

  const inicio = Date.parse(torneo.inicio_torneo)
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

  const move = game.move({ from: source, to: target, promotion })
  if (move === null) {
    board.position(game.fen())
    return
  }

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

  const move = game.move({ from: source, to: target, promotion: 'q' })

  if (move === null) {
    return 'snapback'
  }

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

  game.move({ from: chosen.from, to: chosen.to, promotion: chosen.promotion || 'q' })
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
  const { data: torneo, error: torneoError } = await supabase
    .from('estado_torneo')
    .select('inicio_torneo')
    .eq('id', 1)
    .single()

  if (torneoError || !torneo?.inicio_torneo) {
    console.error('Error obteniendo inicio_torneo', torneoError)
    return 9999
  }

  const { data: horaServer, error: horaError } = await supabase.rpc('ahora_servidor')
  if (horaError) {
    console.error('Error obteniendo hora de servidor', horaError)
    return 9999
  }

  const inicio = Date.parse(torneo.inicio_torneo)
  const ahora = Date.parse(horaServer)
  return Math.max(0, Math.floor((ahora - inicio) / 1000))
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
  
  // Limpiar localStorage
  localStorage.removeItem('ajedrezResultado')
  localStorage.removeItem('juego_actual')
  
  updateBoard()
  statusEl.innerText = 'Partida reiniciada'
}

async function revisarEstadoTorneo() {
  const { data } = await supabase
    .from('estado_torneo')
    .select('estado')
    .eq('id', 1)
    .single()

  if (data?.estado === 'espera' && !juegoTerminado) {
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
