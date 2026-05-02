import { supabase } from './supabase.js'
import {
  NIVEL_MAXIMO,
  obtenerProgresoNivel,
  obtenerRankingNivel,
  obtenerRecompensaNivel,
  registrarXpPorLogros,
} from './progreso-nivel.js'

const usuario = localStorage.getItem('usuario')

const GAMES = [
  { key: 'sudoku', label: 'Sudoku', icon: 'S' },
  { key: 'memoria', label: 'Memoria', icon: 'M' },
  { key: 'matematicas', label: 'Matematicas', icon: '+' },
  { key: 'flashmind', label: 'FlashMind', icon: 'F' },
  { key: 'numcatch', label: 'NumCatch', icon: 'N' },
  { key: 'ajedrez', label: 'Ajedrez', icon: 'A' },
  { key: 'domino', label: 'Domino', icon: 'D' },
  { key: 'damas', label: 'Damas', icon: 'K' },
]

let juegoLogrosActivo = GAMES[0].key
let resultadosPerfil = []
let estadisticasLogros = {}

const nombreUsuarioEl = document.getElementById('nombreUsuario')
const perfilResumenEl = document.getElementById('perfilResumen')
const perfilEstadoEl = document.getElementById('perfilEstado')
const pillUsuarioEl = document.getElementById('pillUsuario')
const pillPartidasEl = document.getElementById('pillPartidas')
const pillMedallasEl = document.getElementById('pillMedallas')
const pillNivelEl = document.getElementById('pillNivel')
const statJuegosEl = document.getElementById('statJuegos')
const statOrosEl = document.getElementById('statOros')
const statPodiosEl = document.getElementById('statPodios')
const statMejorEl = document.getElementById('statMejor')
const medallasListEl = document.getElementById('medallasList')
const logrosJuegosEl = document.getElementById('logrosJuegos')
const logrosTituloJuegoEl = document.getElementById('logrosTituloJuego')
const logrosContadorEl = document.getElementById('logrosContador')
const logrosListEl = document.getElementById('logrosList')
const historialListEl = document.getElementById('historialList')
const nivelActualEl = document.getElementById('nivelActual')
const xpActualEl = document.getElementById('xpActual')
const porcentajeNivelEl = document.getElementById('porcentajeNivel')
const barraNivelEl = document.getElementById('barraNivel')
const xpNivelDetalleEl = document.getElementById('xpNivelDetalle')
const xpRestanteEl = document.getElementById('xpRestante')
const recompensaSiguienteEl = document.getElementById('recompensaSiguiente')
const rankingNivelListEl = document.getElementById('rankingNivelList')

function formatearTiempo(segundos) {
  if (typeof segundos !== 'number' || Number.isNaN(segundos)) return '-'
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${minutos}:${seg < 10 ? '0' : ''}${seg}`
}

function getEstado(result) {
  if (result.invalido) {
    return { label: 'Invalido', className: 'bad' }
  }

  if (result.sospechoso) {
    return { label: 'Sospechoso', className: 'warn' }
  }

  return { label: 'Valido', className: 'ok' }
}

async function obtenerRankingDeJuego(gameKey) {
  let query = supabase
    .from('ranking')
    .select('*')
    .eq('juego', gameKey)
    .order('tiempo', { ascending: true })

  let { data, error } = await query

  if ((!data || data.length === 0) && ['ajedrez', 'domino', 'damas'].includes(gameKey)) {
    const fallbackTable = {
      ajedrez: 'ranking_ajedrez',
      domino: 'ranking_domino',
      damas: 'ranking_damas',
    }[gameKey]

    const fallback = await supabase
      .from(fallbackTable)
      .select('*')
      .order('tiempo', { ascending: true })

    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error(`Error cargando ranking de ${gameKey}`, error)
  }

  return data || []
}

async function obtenerEstadisticasLogros() {
  if (!usuario) return {}

  const { data, error } = await supabase
    .from('estadisticas_logros')
    .select('*')
    .eq('usuario', usuario)

  if (error) {
    console.warn('No se pudieron cargar estadisticas de logros', error)
    return {}
  }

  return (data || []).reduce((acc, item) => {
    acc[item.juego] = item
    return acc
  }, {})
}

async function cargarPerfil() {
  if (!usuario) {
    nombreUsuarioEl.innerText = 'Sin sesion'
    perfilResumenEl.innerText = 'Todavia no hay un usuario activo en este navegador.'
    perfilEstadoEl.innerText = 'Primero entra a cualquier juego con tu apodo y codigo para construir tu perfil.'
    medallasListEl.innerHTML = '<div class="empty">Aun no hay medallas para mostrar.</div>'
    renderProgresoNivel()
    resultadosPerfil = []
    estadisticasLogros = {}
    renderLogrosJuegos()
    renderLogros()
    historialListEl.innerHTML = '<div class="empty">No hay historial disponible.</div>'
    return
  }

  nombreUsuarioEl.innerText = usuario
  pillUsuarioEl.innerText = `Usuario: ${usuario}`

  const { data: userData } = await supabase
    .from('usuarios')
    .select('*')
    .eq('usuario', usuario)
    .maybeSingle()

  const resultados = []
  estadisticasLogros = await obtenerEstadisticasLogros()

  for (const game of GAMES) {
    const ranking = await obtenerRankingDeJuego(game.key)
    const posicion = ranking.findIndex((item) => item.usuario === usuario)

    if (posicion !== -1) {
      resultados.push({
        ...ranking[posicion],
        juego: game.key,
        juegoLabel: game.label,
        posicion: posicion + 1,
        total: ranking.length,
      })
    }
  }

  resultados.sort((a, b) => {
    if (a.posicion !== b.posicion) return a.posicion - b.posicion
    return (a.tiempo || 9999) - (b.tiempo || 9999)
  })

  const oros = resultados.filter((item) => item.posicion === 1)
  const platas = resultados.filter((item) => item.posicion === 2)
  const bronces = resultados.filter((item) => item.posicion === 3)
  const podios = oros.length + platas.length + bronces.length
  const mejorPosicion = resultados.length ? Math.min(...resultados.map((item) => item.posicion)) : null

  statJuegosEl.innerText = String(resultados.length)
  statOrosEl.innerText = String(oros.length)
  statPodiosEl.innerText = String(podios)
  statMejorEl.innerText = mejorPosicion ? `#${mejorPosicion}` : '-'
  pillPartidasEl.innerText = `Partidas: ${resultados.length}`
  pillMedallasEl.innerText = `Medallas: ${podios}`

  perfilResumenEl.innerText = resultados.length
    ? `Tienes progreso registrado en ${resultados.length} juegos del torneo.`
    : 'Aun no tienes resultados guardados en el torneo.'

  perfilEstadoEl.innerText = userData
    ? 'Perfil activo y enlazado con tu usuario del torneo.'
    : 'No se encontro una ficha completa en la tabla de usuarios, pero si pudimos leer tus resultados.'

  renderMedallas(resultados)
  resultadosPerfil = resultados
  if (resultadosPerfil.length && !resultadosPerfil.some((item) => item.juego === juegoLogrosActivo)) {
    juegoLogrosActivo = resultadosPerfil[0].juego
  } else if (!GAMES.some((game) => game.key === juegoLogrosActivo)) {
    juegoLogrosActivo = GAMES[0].key
  }
  renderLogrosJuegos()
  renderLogros()
  renderHistorial(resultados)
  await sincronizarXpDeLogros()
  await renderProgresoNivel()
}

function renderMedallas(resultados) {
  medallasListEl.innerHTML = ''

  const medallas = []

  resultados.forEach((item) => {
    if (item.posicion === 1) {
      medallas.push({ title: `Campeon de ${item.juegoLabel}`, detail: `Primer lugar de ${item.total} jugadores`, className: 'gold', icon: '1' })
    } else if (item.posicion === 2) {
      medallas.push({ title: `Subcampeon de ${item.juegoLabel}`, detail: `Segundo lugar de ${item.total} jugadores`, className: 'silver', icon: '2' })
    } else if (item.posicion === 3) {
      medallas.push({ title: `Podio en ${item.juegoLabel}`, detail: `Tercer lugar de ${item.total} jugadores`, className: 'bronze', icon: '3' })
    }
  })

  if (medallas.length === 0) {
    medallasListEl.innerHTML = '<div class="empty">Todavia no hay medallas registradas.</div>'
    return
  }

  medallas.forEach((medal) => {
    const div = document.createElement('div')
    div.className = 'medal'
    div.innerHTML = `
      <div class="medal-icon ${medal.className}">${medal.icon}</div>
      <div>
        <strong>${medal.title}</strong>
        <br>
        <small>${medal.detail}</small>
      </div>
    `
    medallasListEl.appendChild(div)
  })
}

function renderLogrosJuegos() {
  logrosJuegosEl.innerHTML = ''

  GAMES.forEach((game) => {
    const resultado = resultadosPerfil.find((item) => item.juego === game.key)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `game-tab${game.key === juegoLogrosActivo ? ' active' : ''}`
    button.onclick = () => seleccionarJuegoLogros(game.key)
    button.innerHTML = `
      <span>${game.icon}</span>
      <span>${game.label}</span>
      ${resultado ? '<span class="history-state ok">OK</span>' : ''}
    `
    logrosJuegosEl.appendChild(button)
  })
}

function crearLogrosDeJuego(game, resultado) {
  if (game.key === 'sudoku') {
    return crearLogrosSudoku(estadisticasLogros.sudoku || {})
  }

  if (game.key === 'memoria') {
    return crearLogrosMemoria(estadisticasLogros.memoria || {})
  }

  if (game.key === 'matematicas') {
    return crearLogrosMatematicas(estadisticasLogros.matematicas || {})
  }

  return [
    {
      title: `Primer intento en ${game.label}`,
      description: resultado
        ? `Ya tienes resultado guardado: posicion #${resultado.posicion} de ${resultado.total}.`
        : `Juega ${game.label} para registrar tu primer resultado.`,
      unlocked: Boolean(resultado),
    },
    {
      title: `Podio en ${game.label}`,
      description: resultado?.posicion <= 3
        ? `Alcanzaste el top 3 en ${game.label}.`
        : `Queda entre los 3 mejores de ${game.label}.`,
      unlocked: Boolean(resultado && resultado.posicion <= 3),
    },
    {
      title: `Campeon de ${game.label}`,
      description: resultado?.posicion === 1
        ? `Conseguiste el primer lugar en ${game.label}.`
        : `Consigue el puesto #1 en ${game.label}.`,
      unlocked: Boolean(resultado && resultado.posicion === 1),
    },
    {
      title: 'Logro personalizado',
      description: 'Reservado para el nombre y descripcion que me pases despues.',
      unlocked: false,
    },
  ]
}

function crearLogrosMatematicas(stats) {
  const totalCorrectas = stats.matematicas_total_correctas || 0
  const sesionesSinErrores = stats.matematicas_sesiones_sin_errores || 0
  const ejerciciosMenos15s = stats.matematicas_ejercicios_menos_15s || 0
  const mejorRachaCorrectas = stats.matematicas_mejor_racha_correctas || 0
  const mejorRacha3s = stats.matematicas_mejor_racha_3s || 0
  const mejorRacha5s = stats.matematicas_mejor_racha_5s || 0
  const mejorCorrectas60s = stats.matematicas_mejor_correctas_60s || 0

  return [
    {
      title: 'Eso era todo?',
      description: 'Pense que iba a ser mas dificil...',
      howTo: 'Resuelve un ejercicio en menos de 15 segundos.',
      unlocked: ejerciciosMenos15s >= 1,
    },
    {
      title: 'Cerebro encendido',
      description: 'Algo hizo click... y no se apago.',
      howTo: 'Resuelve 12 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 12,
    },
    {
      title: 'Error inexistente',
      description: 'Busque fallar... no lo encontre.',
      howTo: 'Completa una sesion sin errores.',
      unlocked: sesionesSinErrores >= 1,
    },
    {
      title: 'Calculo silencioso',
      description: 'Ni movi los labios.',
      howTo: 'Resuelve 15 ejercicios seguidos en menos de 3 segundos cada uno.',
      unlocked: mejorRacha3s >= 15,
    },
    {
      title: 'Ritmo perfecto',
      description: 'Todo fluye... sin esfuerzo.',
      howTo: 'Resuelve 20 ejercicios consecutivos.',
      unlocked: mejorRachaCorrectas >= 20,
    },
    {
      title: 'Tiempo comprimido',
      description: 'Un minuto... muchas respuestas.',
      howTo: 'Resuelve 18 ejercicios en menos de 60 segundos.',
      unlocked: mejorCorrectas60s >= 18,
    },
    {
      title: 'Dominio creciente',
      description: 'Cada vez mas rapido... mas preciso.',
      howTo: 'Resuelve 175 ejercicios en total.',
      unlocked: totalCorrectas >= 175,
    },
    {
      title: 'Eco mental',
      description: 'La respuesta llega antes que la duda.',
      howTo: 'Resuelve 14 ejercicios seguidos en menos de 5 segundos cada uno.',
      unlocked: mejorRacha5s >= 14,
    },
    {
      title: 'Concentracion absoluta',
      description: 'Nada me distrae.',
      howTo: 'Resuelve 29 ejercicios seguidos en menos de 5 segundos cada uno.',
      unlocked: mejorRacha5s >= 29,
    },
    {
      title: 'La ultima operacion',
      description: 'Despues de esto... todo tiene sentido.',
      howTo: 'Resuelve 40 ejercicios seguidos.',
      unlocked: mejorRachaCorrectas >= 40,
    },
    {
      title: 'Cadena de aciertos',
      description: 'Uno lleva al otro... y no se detiene.',
      howTo: 'Resuelve 74 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 74,
    },
    {
      title: 'Sin interrupciones',
      description: 'Nada se interpone entre yo y el resultado.',
      howTo: 'Completa 98 ejercicios consecutivos sin fallar.',
      unlocked: mejorRachaCorrectas >= 98,
    },
    {
      title: 'Mente en linea recta',
      description: 'No hay desvios... solo respuestas.',
      howTo: 'Resuelve 122 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 122,
    },
    {
      title: 'Ritual de numeros',
      description: 'Cada operacion forma parte de algo mayor.',
      howTo: 'Completa 26 ejercicios consecutivos.',
      unlocked: mejorRachaCorrectas >= 26,
    },
    {
      title: 'Secuencia perfecta',
      description: 'Todo encaja... uno tras otro.',
      howTo: 'Resuelve 80 ejercicios seguidos sin errores.',
      unlocked: mejorRachaCorrectas >= 80,
    },
    {
      title: 'Camino inevitable',
      description: 'Cada paso ya estaba escrito.',
      howTo: 'Completa 134 ejercicios consecutivos correctamente.',
      unlocked: mejorRachaCorrectas >= 134,
    },
    {
      title: 'Dominio progresivo',
      description: 'Mientras mas avanzo... mas claro se vuelve.',
      howTo: 'Resuelve 38 ejercicios seguidos sin fallar.',
      unlocked: mejorRachaCorrectas >= 38,
    },
    {
      title: 'Flujo matematico',
      description: 'No pienso... solo continuo.',
      howTo: 'Completa 142 ejercicios consecutivos.',
      unlocked: mejorRachaCorrectas >= 142,
    },
    {
      title: 'Inercia mental',
      description: 'Ya no puedo parar aunque quiera.',
      howTo: 'Resuelve 48 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 48,
    },
    {
      title: 'Tramo infinito',
      description: 'No veo el final... y sigo.',
      howTo: 'Completa 156 ejercicios consecutivos sin errores.',
      unlocked: mejorRachaCorrectas >= 156,
    },
  ]
}

function crearLogrosMemoria(stats) {
  const completados = stats.completados || 0
  const completadosSinErrores = stats.completados_sin_errores || 0
  const mejorRachaCompletados = stats.mejor_racha_completados || 0
  const mejorRachaPares = stats.memoria_mejor_racha_pares || 0
  const mejorRachaFallos = stats.memoria_mejor_racha_fallos || 0
  const maxErroresPartida = stats.memoria_max_errores_partida || 0
  const minErroresPartida = typeof stats.memoria_min_errores_partida === 'number' ? stats.memoria_min_errores_partida : null
  const mejorTiempo = typeof stats.mejor_tiempo === 'number' ? stats.mejor_tiempo : null
  const mejorTiempoSinErrores = typeof stats.memoria_mejor_tiempo_sin_errores === 'number' ? stats.memoria_mejor_tiempo_sin_errores : null
  const paresAntes1Minuto = stats.memoria_pares_antes_1min || 0
  const mejorPartidas10Min = stats.memoria_mejor_partidas_10min || 0
  const falloUltimoPar = stats.memoria_fallo_ultimo_par || 0
  const aciertoTras5Fallos = stats.memoria_acierto_tras_5_fallos || 0
  const parMenos2s = stats.memoria_par_menos_2s || 0
  const parMenos20s = stats.memoria_par_menos_20s || 0
  const aciertoTras2Fallos = stats.memoria_acierto_tras_2_fallos || 0
  const parSinVerPrevio = stats.memoria_par_sin_ver_previo || 0
  const menos20Movimientos = stats.memoria_menos_20_movimientos || 0
  const mejorasTiempo = stats.memoria_mejoras_tiempo || 0
  const maxIntentosPartida = stats.memoria_max_intentos_partida || 0
  const sinRepetirErrorPar = stats.memoria_sin_repetir_error_par || 0
  const primerMovimientoPar = stats.memoria_primer_movimiento_par || 0
  const lineal = stats.memoria_lineal || 0
  const sinPatronRepetido = stats.memoria_sin_patron_repetido || 0
  const anticipacion = stats.memoria_anticipacion || 0
  const sinCartasFalladasRepetidas = stats.memoria_sin_cartas_falladas_repetidas || 0
  const inicio4Pares = stats.memoria_inicio_4_pares || 0
  const final4Pares = stats.memoria_final_4_pares || 0
  const mejorPartidas15Min = stats.memoria_mejor_partidas_15min || 0

  return [
    {
      title: 'Donde estaba?',
      description: 'Lo tenia claro... hace un segundo.',
      howTo: 'Encuentra 5 pares seguidos sin fallar.',
      unlocked: mejorRachaPares >= 5,
    },
    {
      title: 'Memoria sospechosa',
      description: 'Esto ya no es normal.',
      howTo: 'Completa una partida sin equivocarte.',
      unlocked: completadosSinErrores >= 1,
    },
    {
      title: 'Corto circuito',
      description: 'Mi cerebro hizo "click".',
      howTo: 'Falla 10 veces en una sola partida y aun asi termina.',
      unlocked: maxErroresPartida >= 10 && completados >= 1,
    },
    {
      title: 'Visual fotografico',
      description: 'Lo vi una vez... y fue suficiente.',
      howTo: 'Encuentra todos los pares en menos de 2 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 120,
    },
    {
      title: 'Confianza excesiva',
      description: 'Seguro esta aqui... no?',
      howTo: 'Levanta 3 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 3,
    },
    {
      title: 'Ahora si me acuerdo',
      description: 'Ok... ya entendi como funciona.',
      howTo: 'Completa 3 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 3,
    },
    {
      title: 'Memoria en modo turbo',
      description: 'No necesito pensar tanto.',
      howTo: 'Encuentra 10 pares en menos de 1 minuto.',
      unlocked: paresAntes1Minuto >= 10,
    },
    {
      title: 'Patron descubierto',
      description: 'Todo empieza a tener sentido.',
      howTo: 'Encuentra 8 pares seguidos correctamente.',
      unlocked: mejorRachaPares >= 8,
    },
    {
      title: 'Sobrecarga mental',
      description: 'Demasiada informacion... pero sigo.',
      howTo: 'Juega 5 partidas en menos de 10 minutos.',
      unlocked: mejorPartidas10Min >= 5,
    },
    {
      title: 'Imposible olvidar',
      description: 'Esto se quedo grabado.',
      howTo: 'Completa 15 partidas en total.',
      unlocked: completados >= 15,
    },
    {
      title: 'Casi lo tenia',
      description: 'Estuve tan cerca... que duele.',
      howTo: 'Falla el ultimo par antes de completar una partida.',
      unlocked: falloUltimoPar >= 1,
    },
    {
      title: 'Memoria selectiva',
      description: 'Recuerdo lo importante... a veces.',
      howTo: 'Acierta un par despues de 5 intentos fallidos seguidos.',
      unlocked: aciertoTras5Fallos >= 1,
    },
    {
      title: 'Caos controlado',
      description: 'No se que hago... pero funciona.',
      howTo: 'Completa una partida con mas de 15 errores.',
      unlocked: maxErroresPartida > 15,
    },
    {
      title: 'Reflejo mental',
      description: 'Ni lo pense... solo paso.',
      howTo: 'Encuentra un par en menos de 2 segundos.',
      unlocked: parMenos2s >= 1,
    },
    {
      title: 'Doble o nada',
      description: 'Si fallo otra vez... mejor no digo nada.',
      howTo: 'Acierta un par justo despues de fallar el mismo dos veces.',
      unlocked: aciertoTras2Fallos >= 1,
    },
    {
      title: 'Conexion inesperada',
      description: 'Ah... estaban ahi todo el tiempo.',
      howTo: 'Encuentra un par sin haber volteado esas cartas antes.',
      unlocked: parSinVerPrevio >= 1,
    },
    {
      title: 'Orden en el desorden',
      description: 'Todo parecia aleatorio... hasta que no.',
      howTo: 'Completa una partida usando menos de 20 movimientos.',
      unlocked: menos20Movimientos >= 1,
    },
    {
      title: 'Memoria en construccion',
      description: 'Voy mejorando... creo.',
      howTo: 'Mejora tu tiempo respecto a tu partida anterior.',
      unlocked: mejorasTiempo >= 1,
    },
    {
      title: 'Persistente nivel dios',
      description: 'No me rendi... y aqui estamos.',
      howTo: 'Termina una partida despues de mas de 25 intentos.',
      unlocked: maxIntentosPartida > 25,
    },
    {
      title: 'Todo encaja',
      description: 'Por fin... todo tiene sentido.',
      howTo: 'Completa una partida sin repetir errores en el mismo par.',
      unlocked: sinRepetirErrorPar >= 1,
    },
    {
      title: 'Memoria instantanea',
      description: 'Lo vi... y nunca mas lo olvide.',
      howTo: 'Encuentra un par usando exactamente los dos primeros movimientos de la partida.',
      unlocked: primerMovimientoPar >= 1,
    },
    {
      title: 'Cambio de estrategia',
      description: 'Ok... asi no era.',
      howTo: 'Encuentra un par inmediatamente despues de equivocarte 2 veces.',
      unlocked: aciertoTras2Fallos >= 1,
    },
    {
      title: 'Barrido perfecto',
      description: 'De izquierda a derecha... sin perder el ritmo.',
      howTo: 'Completa una partida siguiendo un orden lineal sin saltarte cartas.',
      unlocked: lineal >= 1,
    },
    {
      title: 'Patron invisible',
      description: 'No se como lo vi... pero lo vi.',
      howTo: 'Encuentra 6 pares seguidos sin equivocarte.',
      unlocked: mejorRachaPares >= 6,
    },
    {
      title: 'Cierre quirurgico',
      description: 'Ni un movimiento extra.',
      howTo: 'Completa la partida usando el numero minimo posible de movimientos.',
      unlocked: typeof stats.memoria_mejor_movimientos === 'number' && stats.memoria_mejor_movimientos <= 18,
    },
    {
      title: 'Memoria a largo plazo',
      description: 'Eso lo vi hace rato...',
      howTo: 'Encuentra un par en menos de 20 segundos.',
      unlocked: parMenos20s >= 1,
    },
    {
      title: 'Desorden calculado',
      description: 'Parece caos... pero no lo es.',
      howTo: 'Completa una partida sin seguir ningun patron repetido de seleccion.',
      unlocked: sinPatronRepetido >= 1,
    },
    {
      title: 'Anticipacion total',
      description: 'Ya sabia donde estaba antes de verlo.',
      howTo: 'Selecciona correctamente la segunda carta de un par sin haber visto esa posicion en los ultimos 5 movimientos.',
      unlocked: anticipacion >= 1,
    },
    {
      title: 'Sin referencias',
      description: 'Ni pistas... ni ayudas... solo mente.',
      howTo: 'Completa una partida sin repetir ninguna carta fallada anteriormente.',
      unlocked: sinCartasFalladasRepetidas >= 1,
    },
    {
      title: 'Lectura del tablero',
      description: 'No memorizo... entiendo.',
      howTo: 'Completa la partida sin intentar dos veces la misma combinacion incorrecta.',
      unlocked: sinRepetirErrorPar >= 1,
    },
    {
      title: 'Velocidad pura',
      description: 'No hubo tiempo ni de pensar.',
      howTo: 'Completa una partida en menos de 2 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 120,
    },
    {
      title: 'Paso firme',
      description: 'Sin prisa... pero sin pausa.',
      howTo: 'Completa una partida en menos de 3 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 180,
    },
    {
      title: 'Ritmo constante',
      description: 'Ni muy rapido, ni muy lento... perfecto.',
      howTo: 'Completa 4 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 4,
    },
    {
      title: 'Sin margen de error',
      description: 'Aqui no se perdona nada.',
      howTo: 'Completa 2 partidas consecutivas sin fallos.',
      unlocked: (stats.mejor_racha_sin_errores || 0) >= 2,
    },
    {
      title: 'Precision rapida',
      description: 'Rapido... y bien hecho...',
      howTo: 'Completa una partida en menos de 2 minutos sin errores.',
      unlocked: mejorTiempoSinErrores !== null && mejorTiempoSinErrores < 120,
    },
    {
      title: 'Inicio dominante',
      description: 'Desde el comienzo marque el ritmo.',
      howTo: 'Encuentra 4 pares correctos seguidos al iniciar una partida.',
      unlocked: inicio4Pares >= 1,
    },
    {
      title: 'Final limpio',
      description: 'Cerre como se debe.',
      howTo: 'Encuentra los ultimos 4 pares sin equivocarte.',
      unlocked: final4Pares >= 1,
    },
    {
      title: 'Resistencia activa',
      description: 'No me detuve ni un segundo.',
      howTo: 'Completa 6 partidas en menos de 15 minutos.',
      unlocked: mejorPartidas15Min >= 6,
    },
    {
      title: 'Control total',
      description: 'Todo bajo control... siempre.',
      howTo: 'Completa una partida con menos de 5 errores.',
      unlocked: minErroresPartida !== null && minErroresPartida < 5,
    },
    {
      title: 'Constancia mental',
      description: 'Una tras otra... sin fallar.',
      howTo: 'Completa 12 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 12,
    },
    {
      title: 'El punto sin retorno',
      description: 'En algun momento pude parar... creo.',
      howTo: 'Completa 36 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 36,
    },
    {
      title: 'Susurros del tablero',
      description: 'Siento que el juego ya me habla.',
      howTo: 'Completa 54 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 54,
    },
    {
      title: 'Juramento silencioso',
      description: 'No dije nada... pero sabia que no iba a parar.',
      howTo: 'Completa 72 partidas sin interrupcion.',
      unlocked: mejorRachaCompletados >= 72,
    },
    {
      title: 'La mirada infinita',
      description: 'Parpadear es opcional.',
      howTo: 'Completa 160 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 160,
    },
    {
      title: 'El inicio del fin',
      description: 'Aqui fue donde deje de contar.',
      howTo: 'Completa 160 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 160,
    },
    {
      title: 'Horizonte sin limite',
      description: 'Sigo avanzando... pero nunca llego.',
      howTo: 'Completa 176 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 176,
    },
    {
      title: 'Ecos en la mente',
      description: 'Las cartas aparecen antes de verlas.',
      howTo: 'Completa 188 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 188,
    },
    {
      title: 'Memoria trascendida',
      description: 'Ya no recuerdo... simplemente se.',
      howTo: 'Completa 192 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 192,
    },
    {
      title: 'Pulso inquebrantable',
      description: 'Nada me hace dudar.',
      howTo: 'Completa 208 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 208,
    },
    {
      title: 'Dimension paralela',
      description: 'El tiempo aqui funciona diferente.',
      howTo: 'Completa 224 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 224,
    },
    {
      title: 'El ciclo no se rompe',
      description: 'Empieza... termina... vuelve a empezar.',
      howTo: 'Completa 226 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 226,
    },
    {
      title: 'La rutina perfecta',
      description: 'Cada movimiento... inevitable.',
      howTo: 'Completa 240 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 240,
    },
    {
      title: 'Mas alla del jugador',
      description: 'Esto ya no es un juego.',
      howTo: 'Completa 256 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 256,
    },
    {
      title: 'Codigo interno',
      description: 'Creo que descifre todo.',
      howTo: 'Completa 272 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 272,
    },
    {
      title: 'Mas alla del cansancio humano',
      description: 'Esto ya no deberia ser posible.',
      howTo: 'Completa 288 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 288,
    },
    {
      title: 'El observador eterno',
      description: 'Siempre estoy... siempre veo.',
      howTo: 'Completa 288 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 288,
    },
    {
      title: 'El tablero te eligio',
      description: 'Ya no juegas tu... juega a traves de ti.',
      howTo: 'Completa 304 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 304,
    },
    {
      title: 'Sin principio ni final',
      description: 'No recuerdo cuando empezo.',
      howTo: 'Completa 304 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 304,
    },
    {
      title: 'Ritual interminable',
      description: 'Siempre hay otra mas... siempre.',
      howTo: 'Completa 320 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 320,
    },
    {
      title: 'Conciencia del tablero',
      description: 'Entiendo cada rincon.',
      howTo: 'Completa 320 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 320,
    },
    {
      title: 'Latido constante',
      description: 'Uno mas... siempre uno mas.',
      howTo: 'Completa 336 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 336,
    },
    {
      title: 'Frontera inexistente',
      description: 'No hay limite que alcanzar.',
      howTo: 'Completa 352 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 352,
    },
    {
      title: 'Realidad alterada',
      description: 'Esto ya no se siente normal.',
      howTo: 'Completa 368 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 368,
    },
    {
      title: 'El ciclo perfecto',
      description: 'Nada falla... nada cambia.',
      howTo: 'Completa 384 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 384,
    },
    {
      title: 'Presencia absoluta',
      description: 'Estoy en cada movimiento.',
      howTo: 'Completa 400 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 400,
    },
    {
      title: 'El final que no llega',
      description: 'Pense que terminaria... pero no.',
      howTo: 'Completa 420 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 420,
    },
    {
      title: 'El ultimo recuerdo',
      description: 'Despues de esto... todo cambia.',
      howTo: 'Completa 444 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 444,
    },
  ]
}

function crearLogrosSudoku(stats) {
  const completados = stats.completados || 0
  const completadosSinErrores = stats.completados_sin_errores || 0
  const mejorRachaCompletados = stats.mejor_racha_completados || stats.completados || 0
  const mejorRachaSinErrores = stats.mejor_racha_sin_errores || 0
  const tiempoJugadoTotal = stats.tiempo_jugado_total || 0
  const mejorRachaTiempoJugado = stats.mejor_racha_tiempo_jugado || 0
  const torneosParticipados = stats.torneos_participados || 0
  const mejorPosicionTorneo = typeof stats.mejor_posicion_torneo === 'number' ? stats.mejor_posicion_torneo : null
  const victoriasTorneos = stats.victorias_torneos || 0
  const mejorRachaTop10Torneos = stats.mejor_racha_top10_torneos || 0
  const victoriasSinErrores = stats.victorias_sin_errores || 0
  const top15Torneos = stats.top15_torneos || 0
  const cuartosLugares = stats.cuartos_lugares || 0
  const posicionesMejoradas = stats.posiciones_mejoradas || 0
  const maxPosicionesSubidas = stats.max_posiciones_subidas || 0
  const mejoresHistoricasSuperadas = stats.mejores_historicas_superadas || 0
  const jugadoresMejorRankeadosSuperados = stats.jugadores_mejor_rankeados_superados || 0
  const maxJugadoresMejorRankeadosSuperados = stats.max_jugadores_mejor_rankeados_superados || 0
  const mejorTorneosMismoDia = stats.mejor_torneos_mismo_dia || 0
  const mejorTiempo = typeof stats.mejor_tiempo === 'number' ? stats.mejor_tiempo : null

  return [
    {
      title: 'Primer Numero',
      description: 'Yo que hago aqui completando un tablero de....numeros?',
      howTo: 'Completa tu primer sudoku.',
      unlocked: completados >= 1,
    },
    {
      title: 'Mente en Marcha',
      description: 'Cada vez mas cerca de volverme un profesional.',
      howTo: 'Completa 3 sudokus.',
      unlocked: completados >= 3,
    },
    {
      title: 'Ritmo Constante',
      description: 'Este juego esta muy facil...cuando se acaba el tutorial?',
      howTo: 'Completa 15 sudokus.',
      unlocked: completados >= 15,
    },
    {
      title: 'Racha Imparable',
      description: 'No hay nada que me pare.....verdad que no?',
      howTo: 'Completa 35 sudokus.',
      unlocked: completados >= 35,
    },
    {
      title: 'Maestro del Sudoku',
      description: 'Acaso ya me estoy convirtiendo en un sabio en este juego?',
      howTo: 'Completa 80 sudokus.',
      unlocked: completados >= 80,
    },
    {
      title: 'Gran maestro del Sudoku',
      description: 'Cada vez mas cerca de ser un sabio....',
      howTo: 'Completa 100 sudokus.',
      unlocked: completados >= 100,
    },
    {
      title: 'Sabio del Sudoku',
      description: 'Ya este juego me lo he pasado....o tal vez no?',
      howTo: 'Completa 250 sudokus.',
      unlocked: completados >= 250,
    },
    {
      title: 'Anciano del Sudoku',
      description: 'Que recuerdos cuando inicie en este juego.',
      howTo: 'Completa 350 sudokus.',
      unlocked: completados >= 350,
    },
    {
      title: 'Adiccion Numerica',
      description: 'Creo que ya no puedo dejar este juego... ayuda.',
      howTo: 'Completa 500 sudokus.',
      unlocked: completados >= 500,
    },
    {
      title: 'Leyenda Viva',
      description: 'Dicen que existo... pero nadie me ha visto fallar.',
      howTo: 'Completa 750 sudokus.',
      unlocked: completados >= 750,
    },
    {
      title: 'Mas alla del limite',
      description: 'Ya no estoy jugando... estoy dominando.',
      howTo: 'Completa 1000 sudokus.',
      unlocked: completados >= 1000,
    },
    {
      title: 'Sin Fallos',
      description: 'Ya este juego me lo se de memoria.',
      howTo: 'Termina un sudoku sin cometer errores.',
      unlocked: completadosSinErrores >= 1,
    },
    {
      title: 'Perfecto... otra vez',
      description: 'Otra partida perfecta... que sorpresa.',
      howTo: 'Completa 5 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 5,
    },
    {
      title: 'Precision Total',
      description: 'No hay algo mas dificil?....Me estoy aburriendo.',
      howTo: 'Completa 15 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 15,
    },
    {
      title: 'Maquina de precision',
      description: 'Error? No se que es eso.',
      howTo: 'Completa 25 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 25,
    },
    {
      title: 'Ojo de alcon',
      description: 'Con este ojo no hay nada que no pueda completar.',
      howTo: 'Completa 80 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 80,
    },
    {
      title: 'Modo automatico',
      description: 'Creo que mis manos juegan solas.',
      howTo: 'Completa 100 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 100,
    },
    {
      title: 'Soy un....robot?',
      description: 'Cada vez me estoy convirtiendo mas en un robot.',
      howTo: 'Completa 250 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 250,
    },
    {
      title: 'Velocidad Mental',
      description: 'Con esta cabeza todo es facil...',
      howTo: 'Resuelve un sudoku en menos de 7 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 420,
    },
    {
      title: 'Calentando motores',
      description: 'Eso fue rapido... pero puedo hacerlo mejor.',
      howTo: 'Resuelve un sudoku en menos de 6 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 360,
    },
    {
      title: 'Rayo Numerico',
      description: 'Oye...creo que no soy humano.',
      howTo: 'Resuelve un sudoku en menos de 5 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 300,
    },
    {
      title: 'Casi instantaneo',
      description: 'Parpadee... y ya habia terminado.',
      howTo: 'Resuelve un sudoku en menos de 4 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 240,
    },
    {
      title: 'Estratega Silencioso',
      description: 'No hay tablero que no pueda resolver.',
      howTo: 'Completa un sudoku en menos de 1 minuto.',
      unlocked: mejorTiempo !== null && mejorTiempo < 60,
    },
    {
      title: 'Sin descanso',
      description: 'Descansar esta sobrevalorado.',
      howTo: 'Completa 10 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 10,
    },
    {
      title: 'No me detengo',
      description: 'Parar? No esta en mis planes.',
      howTo: 'Completa 25 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 25,
    },
    {
      title: 'Modo infinito',
      description: 'Esto no tiene fin... y no quiero que lo tenga.',
      howTo: 'Completa 40 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 40,
    },
    {
      title: 'Sin pausas',
      description: 'Pausa? Eso que es?',
      howTo: 'Completa 65 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 65,
    },
    {
      title: 'Flujo constante',
      description: 'Ya entre en ritmo... y no pienso salir.',
      howTo: 'Completa 80 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 80,
    },
    {
      title: 'Resistencia mental',
      description: 'Mi mente ya no se cansa.',
      howTo: 'Completa 100 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 100,
    },
    {
      title: 'Inquebrantable',
      description: 'Nada me saca de aqui.',
      howTo: 'Completa 150 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 150,
    },
    {
      title: 'Automatico',
      description: 'Ya ni lo pienso... solo lo hago.',
      howTo: 'Completa 260 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 260,
    },
    {
      title: 'Desconectado del mundo',
      description: 'El mundo sigue... yo sigo jugando.',
      howTo: 'Completa 370 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 370,
    },
    {
      title: 'Mas alla del cansancio',
      description: 'El cansancio se rindio antes que yo.',
      howTo: 'Completa 480 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 480,
    },
    {
      title: 'Nunca es suficiente',
      description: 'Siempre hay espacio para uno mas.',
      howTo: 'Completa 1000 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 1000,
    },
    {
      title: 'Trasnochador Numerico',
      description: 'Una mas... y ya duermo... lo juro.',
      howTo: 'Juega 2 horas seguidas en sudoku.',
      unlocked: mejorRachaTiempoJugado >= 2 * 60 * 60,
    },
    {
      title: 'Noches de Sudoku',
      description: 'El reloj avanza... yo tambien.',
      howTo: 'Juega 3 horas seguidas en sudoku.',
      unlocked: mejorRachaTiempoJugado >= 3 * 60 * 60,
    },
    {
      title: 'Inquebrantable',
      description: 'Nada me distrae... absolutamente nada.',
      howTo: 'Juega 5 horas seguidas en sudoku.',
      unlocked: mejorRachaTiempoJugado >= 5 * 60 * 60,
    },
    {
      title: 'Sesion Eterna',
      description: 'Creo que el tiempo dejo de existir hace rato.',
      howTo: 'Juega 4 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 4 * 60 * 60,
    },
    {
      title: 'Sin Parpadear',
      description: 'Juraria que no he cerrado los ojos en horas.',
      howTo: 'Juega 6 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 6 * 60 * 60,
    },
    {
      title: 'Turno Completo',
      description: 'Esto ya parece un trabajo de tiempo completo.',
      howTo: 'Juega 8 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 8 * 60 * 60,
    },
    {
      title: 'Absorcion Total',
      description: 'Este juego ya es parte de mi.',
      howTo: 'Juega 10 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 10 * 60 * 60,
    },
    {
      title: 'Modo Ermitano',
      description: 'Salir? No, gracias... tengo numeros.',
      howTo: 'Juega 15 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 15 * 60 * 60,
    },
    {
      title: 'Fuera del Tiempo',
      description: 'No se que dia es... pero sigo jugando.',
      howTo: 'Juega 20 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 20 * 60 * 60,
    },
    {
      title: 'Vida Alternativa',
      description: 'Creo que vivo mas aqui que en la vida real.',
      howTo: 'Juega 25 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 25 * 60 * 60,
    },
    {
      title: 'En otro mundo',
      description: 'Ya ni se si estoy en la tierra....lo estare?',
      howTo: 'Juega 35 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 35 * 60 * 60,
    },
    {
      title: 'Esto ya es un vicio',
      description: 'No puedo creer que no pueda parar de jugar.',
      howTo: 'Juega 100 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 100 * 60 * 60,
    },
    {
      title: 'Toca cesped',
      description: 'Creo que ya es hora de tocar cesped....verdad?',
      howTo: 'Juega 200 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 200 * 60 * 60,
    },
    {
      title: 'Primera Competencia',
      description: 'Ok... esto ya no es solo por diversion.',
      howTo: 'Participa en tu primer torneo.',
      unlocked: torneosParticipados >= 1,
    },
    {
      title: 'En la pelea',
      description: 'No vine a perder tan facil.',
      howTo: 'Termina en el top 50 de un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 50,
    },
    {
      title: 'Debut Prometedor',
      description: 'No gane... pero ya me estan mirando.',
      howTo: 'Termina en el top 25 de un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 25,
    },
    {
      title: 'Top Competidor',
      description: 'Esto ya se esta poniendo serio.',
      howTo: 'Termina en el top 10 de un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 10,
    },
    {
      title: 'Podio',
      description: 'Creo que estoy empezando a destacar.',
      howTo: 'Termina entre los 3 primeros en un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 3,
    },
    {
      title: 'Al Filo del Podio',
      description: 'Tan cerca... lo puedo sentir.',
      howTo: 'Termina en el 4 lugar en un torneo.',
      unlocked: cuartosLugares >= 1,
    },
    {
      title: 'Campeon',
      description: 'No era suerte... era inevitable.',
      howTo: 'Gana un torneo.',
      unlocked: victoriasTorneos >= 1,
    },
    {
      title: 'Escalando Posiciones',
      description: 'Poco a poco... pero sin parar.',
      howTo: 'Mejora tu posicion respecto al torneo anterior.',
      unlocked: posicionesMejoradas >= 1,
    },
    {
      title: 'Sorpresa del Torneo',
      description: 'Nadie lo vio venir... ni yo.',
      howTo: 'Sube mas de 20 posiciones respecto a tu ranking inicial en un torneo.',
      unlocked: maxPosicionesSubidas > 20,
    },
    {
      title: 'Golpe de Autoridad',
      description: 'Hoy vine diferente.',
      howTo: 'Supera tu mejor posicion historica en un torneo.',
      unlocked: mejoresHistoricasSuperadas >= 1,
    },
    {
      title: 'Competidor Incansable',
      description: 'Otra ronda? Vamos.',
      howTo: 'Participa en 3 torneos en un mismo dia.',
      unlocked: mejorTorneosMismoDia >= 3,
    },
    {
      title: 'Rival a Temer',
      description: 'Ya empiezan a reconocer mi nombre.',
      howTo: 'Derrota a un jugador mejor rankeado que tu en un torneo.',
      unlocked: jugadoresMejorRankeadosSuperados >= 1,
    },
    {
      title: 'Cazador de Gigantes',
      description: 'Entre mas alto caen... mejor.',
      howTo: 'Supera a 5 jugadores mejor rankeados en un mismo torneo.',
      unlocked: maxJugadoresMejorRankeadosSuperados >= 5,
    },
    {
      title: 'Consistencia Competitiva',
      description: 'No es suerte... es nivel.',
      howTo: 'Termina en el top 15 en 5 torneos diferentes.',
      unlocked: top15Torneos >= 5,
    },
    {
      title: 'Racha Competitiva',
      description: 'Estoy en mi mejor momento.',
      howTo: 'Termina en el top 10 en 3 torneos seguidos.',
      unlocked: mejorRachaTop10Torneos >= 3,
    },
    {
      title: 'Imparable en Torneos',
      description: 'Que alguien me detenga... si puede.',
      howTo: 'Gana 3 torneos.',
      unlocked: victoriasTorneos >= 3,
    },
    {
      title: 'Constancia de Hierro',
      description: 'Siempre estoy ahi.',
      howTo: 'Participa en 10 torneos.',
      unlocked: torneosParticipados >= 10,
    },
    {
      title: 'Siempre Presente',
      description: 'No importa el resultado... siempre aparezco.',
      howTo: 'Participa en 20 torneos.',
      unlocked: torneosParticipados >= 20,
    },
    {
      title: 'Presion Maxima',
      description: 'Aqui es donde se separan los buenos.',
      howTo: 'Completa un sudoku sin errores en un torneo.',
      unlocked: completadosSinErrores >= 1,
    },
    {
      title: 'Dominio Total',
      description: 'Ya no compito... impongo.',
      howTo: 'Gana un torneo sin cometer errores.',
      unlocked: victoriasSinErrores >= 1,
    },
  ]
}

function seleccionarJuegoLogros(gameKey) {
  juegoLogrosActivo = gameKey
  renderLogrosJuegos()
  renderLogros()
}

function renderLogros() {
  logrosListEl.innerHTML = ''

  const game = GAMES.find((item) => item.key === juegoLogrosActivo) || GAMES[0]
  const resultado = resultadosPerfil.find((item) => item.juego === game.key)
  const logros = crearLogrosDeJuego(game, resultado)
  const desbloqueados = logros.filter((achievement) => achievement.unlocked).length

  logrosTituloJuegoEl.innerText = game.label
  logrosContadorEl.innerText = `${desbloqueados}/${logros.length}`

  logros.forEach((achievement) => {
    const div = document.createElement('div')
    div.className = `achievement-card${achievement.unlocked ? '' : ' locked'}`
    div.innerHTML = `
      <span class="achievement-state ${achievement.unlocked ? 'unlocked' : 'locked'}">${achievement.unlocked ? 'Desbloqueado' : 'Bloqueado'}</span>
      <br>
      <strong>${achievement.title}</strong>
      <p>${achievement.description}</p>
      <small>${achievement.howTo || ''}</small>
    `
    logrosListEl.appendChild(div)
  })
}

async function sincronizarXpDeLogros() {
  if (!usuario) return

  for (const game of GAMES) {
    const resultado = resultadosPerfil.find((item) => item.juego === game.key)
    const logros = crearLogrosDeJuego(game, resultado)
    await registrarXpPorLogros(usuario, logros, game.key)
  }
}

async function renderProgresoNivel() {
  if (!usuario) {
    nivelActualEl.innerText = '1'
    xpActualEl.innerText = '0 XP acumulado'
    porcentajeNivelEl.innerText = '0%'
    barraNivelEl.style.width = '0%'
    xpNivelDetalleEl.innerText = '0 / 100 XP'
    xpRestanteEl.innerText = 'Faltan 100 XP'
    pillNivelEl.innerText = 'Nivel: 1'
    recompensaSiguienteEl.innerText = 'Inicia sesion para ver recompensas.'
    rankingNivelListEl.innerHTML = '<div class="empty">No hay ranking de nivel disponible.</div>'
    return
  }

  const progreso = await obtenerProgresoNivel(usuario)
  const siguienteNivel = Math.min(NIVEL_MAXIMO, progreso.nivel + 1)
  const recompensa = progreso.nivel >= NIVEL_MAXIMO
    ? null
    : await obtenerRecompensaNivel(siguienteNivel)

  nivelActualEl.innerText = String(progreso.nivel)
  xpActualEl.innerText = `${progreso.xp} XP acumulado`
  porcentajeNivelEl.innerText = `${progreso.porcentaje}%`
  barraNivelEl.style.width = `${progreso.porcentaje}%`
  pillNivelEl.innerText = `Nivel: ${progreso.nivel}`

  if (progreso.nivel >= NIVEL_MAXIMO) {
    xpNivelDetalleEl.innerText = 'Nivel maximo alcanzado'
    xpRestanteEl.innerText = 'Temporada completada'
    recompensaSiguienteEl.innerText = 'Ya desbloqueaste todas las recompensas.'
  } else {
    xpNivelDetalleEl.innerText = `${progreso.xpEnNivel} / ${progreso.xpSiguiente} XP`
    xpRestanteEl.innerText = `Faltan ${progreso.xpParaSiguiente} XP`
    recompensaSiguienteEl.innerText = recompensa
      ? `Nivel ${recompensa.nivel}: ${formatearTipoRecompensa(recompensa.tipo)} - ${recompensa.valor}`
      : `Nivel ${siguienteNivel}: recompensa pendiente`
  }

  await renderRankingNivel()
}

async function renderRankingNivel() {
  const ranking = await obtenerRankingNivel(10)

  if (!ranking.length) {
    rankingNivelListEl.innerHTML = '<div class="empty">Todavia no hay jugadores con XP de nivel.</div>'
    return
  }

  rankingNivelListEl.innerHTML = ''
  ranking.forEach((item, index) => {
    const div = document.createElement('div')
    div.className = `level-row${item.usuario_id === usuario ? ' current' : ''}`
    div.innerHTML = `
      <div class="level-rank-pos">#${index + 1}</div>
      <div class="level-rank-user">
        <strong>${item.usuario_id}</strong>
        <br>
        <small>${item.xp} XP</small>
      </div>
      <div class="level-rank-score">Nivel ${item.nivel}</div>
    `
    rankingNivelListEl.appendChild(div)
  })
}

function formatearTipoRecompensa(tipo) {
  const labels = {
    titulo: 'Titulo',
    medalla: 'Medalla',
    estilo: 'Estilo',
    logro: 'Logro',
    xp_bonus: 'Bonus',
  }

  return labels[tipo] || tipo
}

function renderHistorial(resultados) {
  historialListEl.innerHTML = ''

  if (resultados.length === 0) {
    historialListEl.innerHTML = '<div class="empty">Todavia no hay historial de juegos para este usuario.</div>'
    return
  }

  resultados.forEach((result) => {
    const estado = getEstado(result)
    const div = document.createElement('div')
    div.className = 'history-item'
    div.innerHTML = `
      <div>
        <strong>${result.juegoLabel}</strong>
        <br>
        <small>Posicion #${result.posicion} de ${result.total} | Tiempo: ${formatearTiempo(result.tiempo)}</small>
        <br>
        <small>${result.motivo || 'Sin observaciones.'}</small>
      </div>
      <div class="history-state ${estado.className}">${estado.label}</div>
    `
    historialListEl.appendChild(div)
  })
}

window.recargarPerfil = cargarPerfil
window.seleccionarJuegoLogros = seleccionarJuegoLogros
window.volverMenu = function () {
  window.location.href = 'index.html'
}
window.cerrarSesion = function () {
  const confirmar = confirm('Quieres cerrar sesion en este navegador?')
  if (!confirmar) return

  localStorage.removeItem('usuario')
  window.location.href = 'index.html'
}

cargarPerfil()

supabase
  .channel('perfil-progreso-nivel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'progreso_nivel' }, () => {
    renderProgresoNivel()
  })
  .subscribe()
