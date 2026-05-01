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

cargarPerfil()

supabase
  .channel('perfil-progreso-nivel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'progreso_nivel' }, () => {
    renderProgresoNivel()
  })
  .subscribe()
