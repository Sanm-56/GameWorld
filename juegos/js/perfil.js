import { supabase } from './supabase.js'

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
