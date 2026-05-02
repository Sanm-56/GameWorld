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

  if (game.key === 'flashmind') {
    return crearLogrosFlashmind(estadisticasLogros.flashmind || {})
  }

  if (game.key === 'numcatch') {
    return crearLogrosNumcatch(estadisticasLogros.numcatch || {})
  }

  if (game.key === 'ajedrez') {
    return crearLogrosAjedrez(estadisticasLogros.ajedrez || {})
  }

  if (game.key === 'domino') {
    return crearLogrosDomino(estadisticasLogros.domino || {})
  }

  if (game.key === 'damas') {
    return crearLogrosDamas(estadisticasLogros.damas || {})
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

function crearLogrosAjedrez(stats) {
  return [
    {
      title: 'La Corona del Silencio',
      description: 'El tablero call&oacute; cuando entendi&oacute; qui&eacute;n mandaba.',
      howTo: 'Gana una partida sin perder ninguna pieza.',
      unlocked: (stats.ajedrez_victorias_sin_perder_piezas || 0) >= 1,
    },
    {
      title: '&Uacute;ltimo Or&aacute;culo',
      description: 'Vi el jaque mate diez movimientos antes de que naciera.',
      howTo: 'Realiza un mate forzado despu&eacute;s de sacrificar tu reina.',
      unlocked: (stats.ajedrez_mate_tras_sacrificar_reina || 0) >= 1,
    },
    {
      title: 'Sombras sobre Eryndor',
      description: 'Los reyes tiemblan cuando las sombras aprenden a jugar.',
      howTo: 'Gana una partida utilizando &uacute;nicamente piezas menores y peones en el final.',
      unlocked: (stats.ajedrez_final_menores_peones || 0) >= 1,
    },
    {
      title: 'El Pacto de las Cenizas',
      description: 'De las ruinas de mi reino levant&eacute; la victoria.',
      howTo: 'Remonta una partida despu&eacute;s de estar con 15 puntos de material abajo.',
      unlocked: (stats.ajedrez_remontada_15_material || 0) >= 1,
    },
    {
      title: 'La Vigilia del Cuervo Blanco',
      description: 'Nadie entendi&oacute; el sacrificio... hasta que fue demasiado tarde.',
      howTo: 'Sacrifica dos piezas consecutivas y gana la partida.',
      unlocked: (stats.ajedrez_dos_sacrificios_consecutivos || 0) >= 1,
    },
    {
      title: 'Los Ecos de Nhar&rsquo;Zul',
      description: 'Cada movimiento dej&oacute; una cicatriz en el tiempo.',
      howTo: 'Juega una partida de m&aacute;s de 80 movimientos y gana.',
      unlocked: (stats.ajedrez_victorias_80_movimientos || 0) >= 1,
    },
    {
      title: 'El Trono Vac&iacute;o',
      description: 'El rey sobrevivi&oacute;, aunque todo lo dem&aacute;s pereci&oacute;.',
      howTo: 'Gana teniendo &uacute;nicamente al rey y un pe&oacute;n contra varias piezas enemigas.',
      unlocked: (stats.ajedrez_rey_peon_vs_piezas || 0) >= 1,
    },
    {
      title: 'L&aacute;grimas del Tit&aacute;n Negro',
      description: 'Hasta los gigantes caen cuando el destino mueve primero.',
      howTo: 'Derrota a un jugador con mucho mayor rango que t&uacute;.',
      unlocked: (stats.ajedrez_derrota_mayor_rango || 0) >= 1,
    },
    {
      title: 'El Ritual de las Trece Lunas',
      description: 'Cada jugada fue una ofrenda al caos.',
      howTo: 'Encadena 13 movimientos consecutivos sin cometer errores seg&uacute;n el an&aacute;lisis del juego.',
      unlocked: (stats.ajedrez_racha_13_sin_errores || 0) >= 1,
    },
    {
      title: 'La Puerta de Obsidiana',
      description: 'Entr&oacute; como aprendiz. Sali&oacute; como leyenda.',
      howTo: 'Gana 50 partidas clasificatorias.',
      unlocked: (stats.ajedrez_victorias_clasificatorias || 0) >= 50,
    },
    {
      title: 'El Susurro del Rey Ca&iacute;do',
      description: 'Escuch&eacute; el miedo detr&aacute;s del jaque.',
      howTo: 'Forza al enemigo a permanecer en jaque durante 5 turnos seguidos.',
      unlocked: (stats.ajedrez_jaque_5_turnos || 0) >= 1,
    },
    {
      title: 'Fuego en los Jardines de Helkar',
      description: 'Las diagonales ardieron bajo mi voluntad.',
      howTo: 'Gana una partida utilizando ambos alfiles para ejecutar el mate final.',
      unlocked: (stats.ajedrez_mate_dos_alfiles || 0) >= 1,
    },
    {
      title: 'La Danza del Abismo',
      description: 'Cada paso cerca de la derrota hizo m&aacute;s dulce la victoria.',
      howTo: 'Gana con menos de 10 segundos restantes en el reloj.',
      unlocked: (stats.ajedrez_victoria_menos_10s || 0) >= 1,
    },
    {
      title: 'El Heredero del Vac&iacute;o',
      description: 'No nac&iacute; para defender reinos... nac&iacute; para destruirlos.',
      howTo: 'Consigue jaque mate antes del movimiento 15.',
      unlocked: (stats.ajedrez_mate_antes_15 || 0) >= 1,
    },
    {
      title: 'Los Mil Ojos de Vareth',
      description: 'Nada escap&oacute; a mi mirada.',
      howTo: 'Detecta y castiga tres errores consecutivos del rival en una misma partida.',
      unlocked: (stats.ajedrez_castiga_3_errores || 0) >= 1,
    },
    {
      title: 'La Catedral de Huesos',
      description: 'Constru&iacute; mi victoria sobre los restos de los imprudentes.',
      howTo: 'Captura todas las piezas mayores enemigas antes del mate final.',
      unlocked: (stats.ajedrez_captura_mayores_antes_mate || 0) >= 1,
    },
    {
      title: 'El Eclipse del Monarca',
      description: 'Cuando la luz muri&oacute;, mi rey a&uacute;n respiraba.',
      howTo: 'Gana una partida sin enrocarte.',
      unlocked: (stats.ajedrez_victoria_sin_enrocar || 0) >= 1,
    },
    {
      title: 'El Guardi&aacute;n de la Octava Fila',
      description: 'Nadie cruza el umbral de los inmortales.',
      howTo: 'Corona tres peones en una sola partida.',
      unlocked: (stats.ajedrez_3_promociones || 0) >= 1,
    },
    {
      title: 'La Profec&iacute;a de Kael&rsquo;Thir',
      description: 'El destino ya estaba escrito en el primer movimiento.',
      howTo: 'Gana una partida usando exactamente la misma apertura durante 10 victorias consecutivas.',
      unlocked: (stats.ajedrez_mejor_racha_apertura || 0) >= 10,
    },
    {
      title: 'Donde Mueren los Reyes',
      description: 'Al final de todas las guerras... solo qued&oacute; mi nombre.',
      howTo: 'Convi&eacute;rtete en campe&oacute;n de un torneo invicto.',
      unlocked: (stats.ajedrez_campeon_invicto || 0) >= 1,
    },
    {
      title: 'El Ojo de Dren&rsquo;Kai',
      description: 'Nada escap&oacute; a tu dominio del tablero.',
      howTo: 'Gana 14 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 14,
    },
    {
      title: 'La Profec&iacute;a del Rey Negro',
      description: 'Todo estaba escrito desde tu primer movimiento.',
      howTo: 'Gana 15 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 15,
    },
    {
      title: 'Las Ruinas de Elyrion',
      description: 'Construiste tu imperio sobre derrotas ajenas.',
      howTo: 'Gana 15 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 15,
    },
    {
      title: 'El Ascenso de Drak&rsquo;Thul',
      description: 'Los d&eacute;biles rezan. Los reyes conquistan.',
      howTo: 'Gana 20 torneos seguidos sin bajar del primer puesto.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 20,
    },
    {
      title: 'El Juicio de las Cenizas',
      description: 'Solo aquellos que sobreviven al fuego merecen la corona.',
      howTo: 'Gana 30 torneos seguidos sin bajar del primer puesto.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 30,
    },
    {
      title: 'La &Uacute;ltima Marcha de Vorynth',
      description: 'Cada paso hacia la victoria fue una sentencia.',
      howTo: 'Gana 39 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 39,
    },
    {
      title: 'El Pacto Carmes&iacute;',
      description: 'La sangre del rey enemigo sell&oacute; tu destino.',
      howTo: 'Gana 53 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 53,
    },
    {
      title: 'El Reino sin Amanecer',
      description: 'Tras tu victoria, no volvi&oacute; a salir el sol.',
      howTo: 'Gana 75 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 75,
    },
    {
      title: 'La Llama de Morghast',
      description: 'El fuego consume. T&uacute; conquistaste.',
      howTo: 'Gana 96 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 96,
    },
    {
      title: 'La Noche de Vaelor',
      description: 'El tablero record&oacute; tu nombre con miedo.',
      howTo: 'Gana 5 torneos consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 5,
    },
    {
      title: 'El Eclipse de Nythera',
      description: 'Cuando lleg&oacute; tu sombra, el rey dej&oacute; de respirar.',
      howTo: 'Gana 25 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 25,
    },
    {
      title: 'Los Susurros de Vhalakor',
      description: 'Cada mate fue una sentencia escrita en oscuridad.',
      howTo: 'Gana 47 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 47,
    },
    {
      title: 'La Tumba de Aerthos',
      description: 'Los reyes ca&iacute;dos a&uacute;n pronuncian tu nombre.',
      howTo: 'Gana 58 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 58,
    },
    {
      title: 'El Trono de Ceniza Negra',
      description: 'El final siempre fue inevitable.',
      howTo: 'Gana 77 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 77,
    },
    {
      title: 'El C&aacute;ntico de Morraith',
      description: 'La &uacute;ltima jugada son&oacute; como una campana funeraria.',
      howTo: 'Gana 92 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 92,
    },
    {
      title: 'Las Sombras de Veyrath',
      description: 'Nadie escap&oacute; del destino que trazaste.',
      howTo: 'Gana 127 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 127,
    },
    {
      title: 'El &Uacute;ltimo Rey de Dravenhal',
      description: 'Solo uno pod&iacute;a permanecer sobre el tablero.',
      howTo: 'Gana 137 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 137,
    },
    {
      title: 'La Maldici&oacute;n de Thornek',
      description: 'Cada victoria enterr&oacute; otro reino.',
      howTo: 'Gana 147 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 147,
    },
    {
      title: 'El Ocaso Carmes&iacute;',
      description: 'El tablero ardi&oacute; bajo tu &uacute;ltima jugada.',
      howTo: 'Gana 177 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 177,
    },
    {
      title: 'La Profec&iacute;a de Umbrael',
      description: 'El rey cay&oacute; exactamente como fue anunciado.',
      howTo: 'Gana 207 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 207,
    },
    {
      title: 'El Trono de Umbraxis',
      description: 'Nadie vio venir al verdadero soberano.',
      howTo: 'Gana 7 torneos consecutivas usando aperturas diferentes.',
      unlocked: (stats.ajedrez_mejor_racha_aperturas_diferentes || 0) >= 7,
    },
    {
      title: 'La Ca&iacute;da de Arkaneth',
      description: 'Incluso los gigantes terminan arrodillados.',
      howTo: 'Gana 3 torneos seguidas en menos de 25 movimientos.',
      unlocked: (stats.ajedrez_mejor_racha_menos_25_movimientos || 0) >= 3,
    },
    {
      title: 'El Eco de los Mil Reyes',
      description: 'Cada victoria despert&oacute; un antiguo temor.',
      howTo: 'Gana 10 torneos consecutivas sin terminar en tablas.',
      unlocked: (stats.ajedrez_mejor_racha_sin_tablas || 0) >= 10,
    },
    {
      title: 'La Marca de Nethor',
      description: 'Tu estrategia dej&oacute; cicatrices eternas.',
      howTo: 'Gana 5 torneos seguidas sacrificando al menos una pieza.',
      unlocked: (stats.ajedrez_mejor_racha_sacrificio || 0) >= 5,
    },
    {
      title: 'El Despertar del Vac&iacute;o',
      description: 'Cuando abriste los ojos, el reino ya hab&iacute;a ca&iacute;do.',
      howTo: 'Gana 8 torneos consecutivas sin perder ninguna torre.',
      unlocked: (stats.ajedrez_mejor_racha_sin_perder_torre || 0) >= 8,
    },
    {
      title: 'Los Susurros de Valkerys',
      description: 'La derrota del enemigo comenz&oacute; antes del primer movimiento.',
      howTo: 'Gana 6 torneos consecutivas realizando jaque antes del movimiento 10.',
      unlocked: (stats.ajedrez_mejor_racha_jaque_antes_10 || 0) >= 6,
    },
    {
      title: 'El Legado de Thar&rsquo;Zul',
      description: 'Las leyendas nacen donde otros abandonan.',
      howTo: 'Gana 12 torneos consecutivas remontando desventaja material.',
      unlocked: (stats.ajedrez_mejor_racha_remontada_material || 0) >= 12,
    },
    {
      title: 'La Corona del Exiliado',
      description: 'Desterrado del reino... coronado por el destino.',
      howTo: 'Gana 5 torneos consecutivas despu&eacute;s de haber perdido una partida previa.',
      unlocked: (stats.ajedrez_mejor_racha_victoria_tras_derrota || 0) >= 5,
    },
  ]
}

function crearLogrosDomino(stats) {
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaTop10 = stats.mejor_racha_top10_torneos || 0
  const mejorRachaInvicto = stats.domino_mejor_racha_invicto || 0

  return [
    {
      title: 'El Imperio de Marfil Negro',
      description: 'Cada ficha colocada sell&oacute; otra victoria.',
      howTo: 'Gana 3 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 3,
    },
    {
      title: 'La Mesa de los Ca&iacute;dos',
      description: 'Nadie logr&oacute; romper tu racha.',
      howTo: 'Gana 5 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 5,
    },
    {
      title: 'El Legado de Varkhul',
      description: 'Las fichas obedecieron tu voluntad.',
      howTo: 'Gana 7 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 7,
    },
    {
      title: 'La Sombra del &Uacute;ltimo Jugador',
      description: 'Cuando te sentaste en la mesa, el destino ya estaba escrito.',
      howTo: 'Gana 4 torneos consecutivos sin perder una ronda.',
      unlocked: mejorRachaInvicto >= 4,
    },
    {
      title: 'El Trono de las Seis Caras',
      description: 'Los maestros del domin&oacute; inclinaron la cabeza ante ti.',
      howTo: 'Gana 10 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'El Pacto de las Fichas Eternas',
      description: 'Tu racha convirti&oacute; la mesa en territorio prohibido.',
      howTo: 'Gana 6 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 6,
    },
    {
      title: 'La Maldici&oacute;n de Korvath',
      description: 'Cada torneo ganado dej&oacute; otro rival en ruinas.',
      howTo: 'Gana 8 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 8,
    },
    {
      title: 'Los Ecos de la Mesa Oscura',
      description: 'Las fichas a&uacute;n recuerdan tu dominio absoluto.',
      howTo: 'Gana 12 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 12,
    },
    {
      title: 'El Ascenso de Draemor',
      description: 'No jugabas para ganar... jugabas para conquistar.',
      howTo: 'Gana 15 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 15,
    },
    {
      title: 'El Fin de los Invictos',
      description: 'Tu nombre termin&oacute; con todas las leyendas.',
      howTo: 'Gana 20 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 20,
    },
    {
      title: 'El Despertar de Nocthar',
      description: 'La mesa guard&oacute; silencio ante tu primera conquista.',
      howTo: 'Gana 33 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 33,
    },
    {
      title: 'Las Cenizas de Velkorr',
      description: 'Cada victoria aliment&oacute; una leyenda prohibida.',
      howTo: 'Gana 45 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 45,
    },
    {
      title: 'El Trono del Sexto Sello',
      description: 'Nadie pudo detener el avance de tu imperio.',
      howTo: 'Gana 87 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 87,
    },
    {
      title: 'La Profec&iacute;a de Umbrek',
      description: 'Tu dominio fue anunciado mucho antes de la primera ficha.',
      howTo: 'Gana 100 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 100,
    },
    {
      title: 'El Reino de las Fichas Perdidas',
      description: 'Los derrotados desaparecieron bajo tu sombra.',
      howTo: 'Gana 120 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 120,
    },
    {
      title: 'La Corona de Drael&rsquo;Vor',
      description: 'La mesa ya no distingu&iacute;a entre jugador y monstruo.',
      howTo: 'Gana 150 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 150,
    },
    {
      title: 'Los Susurros de Karzeth',
      description: 'Cada torneo ganado despert&oacute; nuevos temores.',
      howTo: 'Gana 180 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 180,
    },
    {
      title: 'La Noche del Dominio Eterno',
      description: 'Las fichas cayeron una tras otra ante tu voluntad.',
      howTo: 'Gana 200 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 200,
    },
    {
      title: 'El Juicio de Mordrake',
      description: 'Tu racha convirti&oacute; la esperanza en ruinas.',
      howTo: 'Gana 220 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 220,
    },
    {
      title: 'El Legado del Rey Vac&iacute;o',
      description: 'No dejaste rivales... solo recuerdos.',
      howTo: 'Gana 250 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 250,
    },
    {
      title: 'La Mesa de los Mil Ecos',
      description: 'Cada victoria repet&iacute;a tu nombre como una maldici&oacute;n.',
      howTo: 'Gana 300 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 300,
    },
    {
      title: 'El Eclipse de Var&rsquo;Khal',
      description: 'Cuando llegaste, la gloria de otros desapareci&oacute;.',
      howTo: 'Termina top 10 en 35 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 35,
    },
    {
      title: 'La &Uacute;ltima Ficha de Nareth',
      description: 'El destino del torneo siempre terminaba en tus manos.',
      howTo: 'Termina top 10 en 40 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 40,
    },
    {
      title: 'Las Ruinas de Thal&rsquo;Kor',
      description: 'Construiste tu reinado sobre generaciones derrotadas.',
      howTo: 'Termina top 10 en 45 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 45,
    },
    {
      title: 'El Guardi&aacute;n del Abismo Blanco',
      description: 'Nadie cruz&oacute; la frontera de tu dominio.',
      howTo: 'Termina top 10 en 50 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 50,
    },
    {
      title: 'El Ocaso de Vel&rsquo;Thar',
      description: 'Las mesas quedaron vac&iacute;as despu&eacute;s de tu paso.',
      howTo: 'Termina top 10 en 60 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 60,
    },
    {
      title: 'La Maldici&oacute;n del Emperador Gris',
      description: 'Cada torneo ganado apag&oacute; otra esperanza.',
      howTo: 'Termina top 10 en 70 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 70,
    },
    {
      title: 'El Portal de las Fichas Eternas',
      description: 'Tu racha trascendi&oacute; toda l&oacute;gica humana.',
      howTo: 'Termina top 10 en 80 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 80,
    },
    {
      title: 'El Fin de Arkhazar',
      description: 'Hasta las leyendas abandonaron la mesa.',
      howTo: 'Termina top 10 en 90 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 90,
    },
    {
      title: 'La Eternidad de Morvhaal',
      description: 'Tu nombre qued&oacute; grabado m&aacute;s all&aacute; del &uacute;ltimo torneo.',
      howTo: 'Termina top 10 en 100 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 100,
    },
  ]
}

function crearLogrosDamas(stats) {
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaSegundo = stats.damas_mejor_racha_segundo || 0
  const mejorRachaTercero = stats.damas_mejor_racha_tercero || 0

  return [
    {
      title: 'El Ascenso de Vol&rsquo;kol',
      description: 'Las coronas comenzaron a inclinarse ante ti.',
      howTo: 'Gana 3 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 3,
    },
    {
      title: 'La Sangre de los Cuatro Reinos',
      description: 'Cada tablero conquistado aliment&oacute; tu leyenda.',
      howTo: 'Gana 5 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 5,
    },
    {
      title: 'El Trono Carmes&iacute; de Nareth',
      description: 'Las damas enemigas desaparecieron bajo tu sombra.',
      howTo: 'Gana 7 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 7,
    },
    {
      title: 'Los Ecos de Nalkgot',
      description: 'Tu dominio reson&oacute; en cada rinc&oacute;n del tablero.',
      howTo: 'Gana 10 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'La Corona del Vac&iacute;o Blanco',
      description: 'Nadie logr&oacute; arrebatarte el primer puesto.',
      howTo: 'Gana 12 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 12,
    },
    {
      title: 'El Juicio de Mor&rsquo;Draven',
      description: 'Los campeones cayeron uno tras otro.',
      howTo: 'Gana 15 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 15,
    },
    {
      title: 'La Niebla de Tharvok',
      description: 'Tu nombre se volvi&oacute; sin&oacute;nimo de derrota ajena.',
      howTo: 'Gana 18 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 18,
    },
    {
      title: 'El Reino de las Damas Eternas',
      description: 'Cada torneo fortaleci&oacute; tu imperio silencioso.',
      howTo: 'Gana 20 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 20,
    },
    {
      title: 'El Eclipse de Vorath',
      description: 'El tablero perdi&oacute; la esperanza de vencerte.',
      howTo: 'Gana 25 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 25,
    },
    {
      title: 'La Profec&iacute;a de Kael&rsquo;Mor',
      description: 'El campe&oacute;n eterno finalmente despert&oacute;.',
      howTo: 'Gana 30 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 30,
    },
    {
      title: 'Las Cenizas de Drakoryn',
      description: 'No dejaste m&aacute;s que ruinas tras cada victoria.',
      howTo: 'Gana 35 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 35,
    },
    {
      title: 'El &Uacute;ltimo Emperador del Tablero',
      description: 'Las coronas rivales dejaron de tener valor.',
      howTo: 'Gana 40 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 40,
    },
    {
      title: 'La Maldici&oacute;n de Vhal&rsquo;Kreth',
      description: 'Cada torneo ganado enterr&oacute; otra leyenda.',
      howTo: 'Gana 45 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 45,
    },
    {
      title: 'El Ocaso de las Reinas Negras',
      description: 'El tablero se rindi&oacute; antes de empezar.',
      howTo: 'Gana 50 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 50,
    },
    {
      title: 'La Tumba de Elyrath',
      description: 'Los grandes maestros desaparecieron en tu camino.',
      howTo: 'Gana 60 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 60,
    },
    {
      title: 'El Guardi&aacute;n del Trono Sombr&iacute;o',
      description: 'Nadie cruz&oacute; el l&iacute;mite de tu dominio.',
      howTo: 'Gana 70 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 70,
    },
    {
      title: 'La Llama de Korveth',
      description: 'Tu racha ardi&oacute; m&aacute;s all&aacute; de toda l&oacute;gica.',
      howTo: 'Gana 80 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 80,
    },
    {
      title: 'Los Mil Tableros Ca&iacute;dos',
      description: 'Cada victoria a&ntilde;adi&oacute; otro reino a tu imperio.',
      howTo: 'Gana 90 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 90,
    },
    {
      title: 'El Fin de las Coronas Eternas',
      description: 'Hasta los invictos se arrodillaron ante ti.',
      howTo: 'Gana 100 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 100,
    },
    {
      title: 'La Eternidad de Vhaelor',
      description: 'Tu nombre qued&oacute; grabado en cada tablero conquistado.',
      howTo: 'Gana 120 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 120,
    },
    {
      title: 'El Ascenso de Velkar',
      description: 'El tablero inclin&oacute; su voluntad ante tu inicio.',
      howTo: 'Termina en 2er puesto en 2 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 2,
    },
    {
      title: 'La Marca de Therys',
      description: 'Cada victoria dej&oacute; una huella imposible de borrar.',
      howTo: 'Termina en 2er puesto en 3 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 3,
    },
    {
      title: 'El Trono de Khar&rsquo;Vel',
      description: 'Los reyes de damas reconocieron a su nuevo amo.',
      howTo: 'Termina en 2er puesto en 4 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 4,
    },
    {
      title: 'La Senda de Umbriel',
      description: 'Nadie logr&oacute; desviarte del destino marcado.',
      howTo: 'Termina en 2er puesto en 5 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 5,
    },
    {
      title: 'El Juramento de Valkor',
      description: 'Prometiste dominar... y cumpliste.',
      howTo: 'Termina en 2er puesto en 6 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 6,
    },
    {
      title: 'Las Sombras de Nareth',
      description: 'Cada torneo fue otro reino conquistado.',
      howTo: 'Termina en 2er puesto en 7 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 7,
    },
    {
      title: 'El Legado de Mor&rsquo;Thal',
      description: 'Tu nombre empez&oacute; a repetirse como una advertencia.',
      howTo: 'Termina en 2er puesto en 8 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 8,
    },
    {
      title: 'La Corona de Drezkal',
      description: 'El dominio ya no era casualidad... era ley.',
      howTo: 'Termina en 2er puesto en 9 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 9,
    },
    {
      title: 'El Eclipse de Varenth',
      description: 'Cuando jugabas, la luz de otros se apagaba.',
      howTo: 'Termina en 2er puesto en 10 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 10,
    },
    {
      title: 'El Reino de las Fichas Rojas',
      description: 'La victoria siempre eligi&oacute; tu lado.',
      howTo: 'Termina en 3er puesto en 12 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 12,
    },
    {
      title: 'El Juicio de Khaelor',
      description: 'Los rivales enfrentaron su destino al sentarse contigo.',
      howTo: 'Termina en 3er puesto en 14 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 14,
    },
    {
      title: 'La Profec&iacute;a de Zaryth',
      description: 'Todo estaba escrito desde tu primera jugada.',
      howTo: 'Termina en 3er puesto en 16 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 16,
    },
    {
      title: 'El Ocaso de Vel&rsquo;Rath',
      description: 'Las derrotas ajenas marcaron tu camino.',
      howTo: 'Termina en 3er puesto en 18 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 18,
    },
    {
      title: 'La Eternidad de Mor&rsquo;Khael',
      description: 'El tiempo dej&oacute; de importar ante tu dominio.',
      howTo: 'Termina en 3er puesto en 20 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 20,
    },
    {
      title: 'Las Ruinas de Thar&rsquo;Zel',
      description: 'Construiste tu imperio sobre campeones ca&iacute;dos.',
      howTo: 'Termina en 3er puesto en 25 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 25,
    },
    {
      title: 'El Trono Inquebrantable',
      description: 'Nadie pudo arrebatarte la cima.',
      howTo: 'Termina en 2er puesto en 30 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 30,
    },
    {
      title: 'La Maldici&oacute;n de Vornath',
      description: 'Cada torneo sell&oacute; el destino de otro rival.',
      howTo: 'Termina en 2er puesto en 35 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 35,
    },
    {
      title: 'El Portal de Damas Eternas',
      description: 'Tu racha trascendi&oacute; toda l&oacute;gica.',
      howTo: 'Termina en 2er puesto en 40 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 40,
    },
    {
      title: 'El Fin de los Aspirantes',
      description: 'Ya no quedaban contendientes dignos.',
      howTo: 'Termina en 3er puesto en 45 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 45,
    },
    {
      title: 'El Nombre que Perdura',
      description: 'M&aacute;s all&aacute; de la &uacute;ltima partida... solo quedaste t&uacute;.',
      howTo: 'Termina en 2er puesto en 50 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 50,
    },
  ]
}

function crearLogrosNumcatch(stats) {
  const mejorRachaAciertosVictoria = stats.numcatch_mejor_racha_aciertos_victoria || 0
  const minErroresVictoria = typeof stats.numcatch_min_errores_victoria === 'number'
    ? stats.numcatch_min_errores_victoria
    : null
  const victorias1Error = stats.numcatch_victorias_1_error || 0
  const victorias2Errores = stats.numcatch_victorias_2_errores || 0
  const victoriasMenos14Errores = stats.numcatch_victorias_menos_14_errores || 0
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const top3Torneos = stats.top3_torneos || 0
  const victoriaTrasFueraPodio = stats.numcatch_victoria_tras_fuera_podio || 0
  const mejorRachaTop3SinBajar = stats.numcatch_mejor_racha_top3_sin_bajar || 0
  const mejorRachaVictorias400 = stats.numcatch_mejor_racha_victorias_400 || 0
  const mejorRachaVictorias1200 = stats.numcatch_mejor_racha_victorias_1200 || 0

  return [
    {
      title: 'El Veredicto de Astryx',
      description: 'Cuando todo termina... solo quedo yo.',
      howTo: 'Gana un torneo superando los 500 aciertos seguidos.',
      unlocked: mejorRachaAciertosVictoria > 500,
    },
    {
      title: 'El Fragmento de Lurien',
      description: 'Una pieza... suficiente para dominar.',
      howTo: 'Gana un torneo con menos de 40 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 40,
    },
    {
      title: 'El Sello de Kaeroth',
      description: 'Cada fallo evitado... suma poder.',
      howTo: 'Gana un torneo con menos de 35 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 35,
    },
    {
      title: 'Pureza de Vhalion',
      description: 'La perfecci&oacute;n no es un mito.',
      howTo: 'Gana un torneo con menos de 30 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 30,
    },
    {
      title: 'El C&oacute;digo de Iryx',
      description: 'Todo sigue una l&oacute;gica impecable.',
      howTo: 'Gana un torneo con menos de 25 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 25,
    },
    {
      title: 'Juicio de Thalnor',
      description: 'Aqu&iacute; se mide la precisi&oacute;n real.',
      howTo: 'Gana un torneo con menos de 20 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 20,
    },
    {
      title: 'El Pulso de Zarek',
      description: 'Ni un solo temblor.',
      howTo: 'Gana un torneo con menos de 18 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 18,
    },
    {
      title: 'Trono de Elyssar',
      description: 'Solo los m&aacute;s precisos llegan aqu&iacute;.',
      howTo: 'Gana un torneo con menos de 15 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 15,
    },
    {
      title: 'La Marca de Orven',
      description: 'Cada movimiento... exacto.',
      howTo: 'Gana un torneo con menos de 12 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 12,
    },
    {
      title: 'Dominio de Khyron',
      description: 'El error pierde significado.',
      howTo: 'Gana un torneo con menos de 10 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 10,
    },
    {
      title: 'La Ruta de Veylor',
      description: 'Camino limpio hasta la cima.',
      howTo: 'Gana un torneo con menos de 9 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 9,
    },
    {
      title: 'El Ojo de Myrion',
      description: 'Nada se escapa.',
      howTo: 'Gana un torneo con menos de 8 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 8,
    },
    {
      title: 'Silencio de Drathis',
      description: 'Ni un fallo hace ruido.',
      howTo: 'Gana un torneo con menos de 7 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 7,
    },
    {
      title: 'El N&uacute;cleo de Xaleth',
      description: 'Todo permanece estable.',
      howTo: 'Gana un torneo con menos de 6 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 6,
    },
    {
      title: 'Pureza absoluta',
      description: 'Esto ya no es humano.',
      howTo: 'Gana un torneo con menos de 5 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 5,
    },
    {
      title: 'El Velo de Nyrax',
      description: 'El error no logra cruzar.',
      howTo: 'Gana un torneo con menos de 4 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 4,
    },
    {
      title: 'La Esencia de Lorthan',
      description: 'Nada sobra... nada falla.',
      howTo: 'Gana un torneo con menos de 3 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 3,
    },
    {
      title: 'El Juicio perfecto',
      description: 'No hubo margen para dudar.',
      howTo: 'Gana un torneo con menos de 2 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 2,
    },
    {
      title: 'Vac&iacute;o de error',
      description: 'No existi&oacute; el fallo.',
      howTo: 'Gana un torneo con 0 errores.',
      unlocked: minErroresVictoria === 0,
    },
    {
      title: 'El Origen de Kaelis',
      description: 'As&iacute; debi&oacute; ser desde el inicio.',
      howTo: 'Gana 15 torneos con exactamente 1 error.',
      unlocked: victorias1Error >= 15,
    },
    {
      title: 'Equilibrio de Varnox',
      description: 'Ni m&aacute;s... ni menos.',
      howTo: 'Gana 3 torneos con exactamente 2 errores.',
      unlocked: victorias2Errores >= 3,
    },
    {
      title: 'La Prueba de Eryndor',
      description: 'La precisi&oacute;n define al ganador.',
      howTo: 'Gana 5 torneos con menos de 14 errores.',
      unlocked: victoriasMenos14Errores >= 5,
    },
    {
      title: 'El N&uacute;cleo de Theryon',
      description: 'Todo gira a mi alrededor.',
      howTo: 'Gana 2 torneos consecutivos con m&aacute;s de 400 puntos.',
      unlocked: mejorRachaVictorias400 >= 2,
    },
    {
      title: 'El Eco de Dravok',
      description: 'La victoria se repite... sin explicaci&oacute;n.',
      howTo: 'Gana 4 torneos seguidos con m&aacute;s de 1200 puntos.',
      unlocked: mejorRachaVictorias1200 >= 4,
    },
    {
      title: 'Ascenso de Morvhal',
      description: 'No fue suerte... fue destino.',
      howTo: 'Gana 2 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 2,
    },
    {
      title: 'Cumbre de Elarion',
      description: 'El lugar m&aacute;s alto... y el m&aacute;s solitario.',
      howTo: 'Gana 5 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 5,
    },
    {
      title: 'El Juramento de Krynn',
      description: 'No fallar&eacute;... otra vez.',
      howTo: 'Gana 10 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'Dominio de Xerathis',
      description: 'No hay espacio para otros.',
      howTo: 'Gana 25 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 25,
    },
    {
      title: 'El Sello de Varok',
      description: 'Soy marcado como invencible.',
      howTo: 'Gana 36 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 36,
    },
    {
      title: 'Voluntad de Zenthra',
      description: 'No cedo... no dudo.',
      howTo: 'Gana 55 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 55,
    },
    {
      title: 'La Corona de Nyvex',
      description: 'No hay discusi&oacute;n... yo soy el rey.',
      howTo: 'Gana 75 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 75,
    },
    {
      title: 'El V&iacute;nculo de Artheon',
      description: 'Estoy conectado al triunfo.',
      howTo: 'Gana 88 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 88,
    },
    {
      title: 'El Final Infinito',
      description: 'Esto no termina... se transforma.',
      howTo: 'Gana 100 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 100,
    },
    {
      title: 'Sombras de Velkar',
      description: 'Nadie vio c&oacute;mo llegu&eacute;... pero llegu&eacute;.',
      howTo: 'Termina en el top 3 en 5 torneos diferentes.',
      unlocked: top3Torneos >= 5,
    },
    {
      title: 'La Llama de Iryth',
      description: 'Arde... y no se apaga.',
      howTo: 'Termina en el top 3 en 15 torneos diferentes.',
      unlocked: top3Torneos >= 15,
    },
    {
      title: 'El Tr&aacute;nsito de Noxar',
      description: 'Cruzo... y no regreso.',
      howTo: 'Termina en el top 3 en 25 torneos diferentes.',
      unlocked: top3Torneos >= 25,
    },
    {
      title: 'Rastro de Kelyth',
      description: 'Mi paso deja huella.',
      howTo: 'Termina en el top 3 en 36 torneos diferentes.',
      unlocked: top3Torneos >= 36,
    },
    {
      title: 'El Ocaso de Valenx',
      description: 'Cuando todos caen... yo sigo.',
      howTo: 'Gana un torneo despu&eacute;s de haber quedado fuera del podio en un torneo anterior.',
      unlocked: victoriaTrasFueraPodio >= 1,
    },
    {
      title: 'Senda de Orphion',
      description: 'Siempre hay un camino hacia arriba.',
      howTo: 'Termina en el top 3 en 46 torneos diferentes.',
      unlocked: top3Torneos >= 46,
    },
    {
      title: 'El Horizonte de Myrath',
      description: 'M&aacute;s all&aacute;... siempre m&aacute;s all&aacute;.',
      howTo: 'Termina en el top 3 en 8 torneos consecutivos sin bajar de posici&oacute;n.',
      unlocked: mejorRachaTop3SinBajar >= 8,
    },
    {
      title: 'Voluntad de Zenthra',
      description: 'No cedo... no dudo.',
      howTo: 'Termina en el top 3 en 28 torneos consecutivos sin bajar de posici&oacute;n.',
      unlocked: mejorRachaTop3SinBajar >= 28,
    },
  ]
}

function crearLogrosFlashmind(stats) {
  const mejorRachaCorrectas = stats.flashmind_mejor_racha_correctas || 0
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaTop3 = stats.mejor_racha_top3_torneos || 0
  const victoriasSinErrores = stats.victorias_sin_errores || 0
  const logros = [
    ['Encendido neuronal', 'Algo se activ&oacute;... y no se apag&oacute;.', 'Consigue 5 respuestas correctas seguidas.', 5],
    ['Chispa sostenida', 'Peque&ntilde;o inicio... gran se&ntilde;al.', 'Consigue 7 respuestas correctas consecutivas.', 7],
    ['Vector ascendente', 'Voy en subida constante.', 'Consigue 15 respuestas correctas seguidas.', 15],
    ['Pulso sincronizado', 'Todo late al mismo ritmo.', 'Consigue 17 respuestas correctas consecutivas.', 17],
    ['L&iacute;nea sin quiebre', 'Nada interrumpe el trazo.', 'Consigue 19 respuestas correctas seguidas.', 19],
    ['Tr&aacute;nsito limpio', 'Sin ruido... solo aciertos.', 'Consigue 21 respuestas correctas consecutivas.', 21],
    ['Frecuencia perfecta', 'Estoy en la misma onda.', 'Consigue 23 respuestas correctas seguidas.', 23],
    ['&Oacute;rbita estable', 'No me salgo del camino.', 'Consigue 31 respuestas correctas consecutivas.', 31],
    ['N&uacute;cleo activo', 'Todo gira alrededor de esto.', 'Consigue 37 respuestas correctas seguidas.', 37],
    ['El Umbral de Kairon', 'Algo antiguo despierta en silencio.', 'Consigue 44 respuestas correctas seguidas.', 44],
    ['Trayectoria pura', 'Cada paso tiene direcci&oacute;n.', 'Consigue 49 respuestas correctas consecutivas.', 49],
    ['Ciclo de Noctra', 'No termina... solo contin&uacute;a.', 'Consigue 48 respuestas correctas seguidas.', 48],
    ['Impulso constante', 'Nada desacelera.', 'Consigue 52 respuestas correctas seguidas.', 52],
    ['Ascenso de Kaelith', 'Subo... sin mirar atr&aacute;s.', 'Consigue 55 respuestas correctas consecutivas.', 55],
    ['Cascada de aciertos', 'Uno cae... luego otro... y otro.', 'Consigue 56 respuestas correctas consecutivas.', 56],
    ['Resonancia mental', 'Todo vibra igual.', 'Consigue 60 respuestas correctas seguidas.', 60],
    ['El Ojo de Virex', 'Nada escapa a mi vista.', 'Consigue 63 respuestas correctas seguidas.', 63],
    ['Susurro de Vantor', 'Escucho los n&uacute;meros antes de verlos.', 'Consigue 66 respuestas correctas consecutivas.', 66],
    ['Eje dominante', 'Todo gira bajo control.', 'Consigue 35 respuestas correctas consecutivas.', 35],
    ['Campo estable', 'Nada altera el equilibrio.', 'Consigue 40 respuestas correctas seguidas.', 40],
    ['Tramo invicto', 'No hay ruptura posible.', 'Consigue 45 respuestas correctas consecutivas.', 45],
    ['Matriz intacta', 'Todo sigue en orden perfecto.', 'Consigue 50 respuestas correctas seguidas.', 50],
    ['Arquitectura mental', 'Cada pieza encaja sin error.', 'Consigue 70 respuestas correctas consecutivas.', 70],
    ['Dominio de Tharion', 'Todo est&aacute; bajo mi control.', 'Consigue 72 respuestas correctas consecutivas.', 72],
    ['Horizonte claro', 'Nada nubla el camino.', 'Consigue 75 respuestas correctas seguidas.', 75],
    ['La Corona de Elyra', 'Esto ya no es normal.', 'Consigue 85 respuestas correctas seguidas.', 85],
    ['Dominio absoluto', 'Ya no hay oposici&oacute;n.', 'Consigue 100 respuestas correctas consecutivas.', 100],
    ['El Camino de Nyx', 'Oscuro... pero perfectamente claro.', 'Consigue 110 respuestas correctas consecutivas.', 110],
    ['El Vac&iacute;o responde', 'Y yo entiendo por qu&eacute;.', 'Consigue 116 respuestas correctas consecutivas.', 116],
    ['Runa de Helion', 'Graba su marca en cada acierto.', 'Consigue 120 respuestas correctas seguidas.', 120],
    ['C&oacute;digo &AElig;ther', 'No es c&aacute;lculo... es otra cosa.', 'Consigue 128 respuestas correctas seguidas.', 128],
    ['El Pulso de Orbis', 'Late dentro de cada decisi&oacute;n.', 'Consigue 140 respuestas correctas consecutivas.', 140],
    ['Fragmento de Eryon', 'Una pieza del todo... revelada.', 'Consigue 160 respuestas correctas seguidas.', 160],
    ['Ojo sobre humano', 'No hay nada que se escape de este ojo...', 'Consigue 170 respuestas correctas consecutivas.', 170],
    ['La Llave de Solkar', 'Algo se ha abierto.', 'Consigue 180 respuestas correctas consecutivas.', 180],
    ['Eco de Valtheris', 'Las respuestas regresan solas.', 'Consigue 210 respuestas correctas seguidas.', 210],
    ['El Rastro de Umbra', 'Sigo algo que no puedo ver.', 'Consigue 250 respuestas correctas consecutivas.', 250],
    ['Ojo bionico', 'Humano? Ya deje de serlo.', 'Consigue 275 respuestas correctas seguidas.', 275],
    ['Sello de Arkanis', 'Nada puede romper esto.', 'Consigue 290 respuestas correctas seguidas.', 290],
    ['El Giro de Lumen', 'Todo cambia... pero encaja.', 'Consigue 300 respuestas correctas consecutivas.', 300],
    ['V&iacute;nculo de Zareth', 'Estoy conectado a algo mayor.', 'Consigue 327 respuestas correctas seguidas.', 327],
    ['El demonio de los ojos', 'Tengo ojos por todos lados... yo lo veo todo.', 'Consigue 350 respuestas correctas consecutivas.', 350],
    ['La Trama de Ilyon', 'Cada hilo lleva al siguiente.', 'Consigue 420 respuestas correctas consecutivas.', 420],
  ]

  const logrosRachaCorrectas = logros.map(([title, description, howTo, requisito]) => ({
    title,
    description,
    howTo,
    unlocked: mejorRachaCorrectas >= requisito,
  }))

  return [
    ...logrosRachaCorrectas,
    {
      title: 'Trono de Aetherion',
      description: 'El primer lugar me reconoce.',
      howTo: 'Gana 2 torneo consecutivos.',
      unlocked: mejorRachaVictorias >= 2,
    },
    {
      title: 'Ascenso de Valkryon',
      description: 'Sub&iacute;... y no pienso bajar.',
      howTo: 'Gana 4 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 4,
    },
    {
      title: 'Marca de Elyndor',
      description: 'Mi nombre empieza a pesar.',
      howTo: 'Gana 6 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 6,
    },
    {
      title: 'Cima de Thalrex',
      description: 'Desde aqu&iacute; todo se ve distinto.',
      howTo: 'Termina en el top 3 en 4 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 4,
    },
    {
      title: 'Ecos de la victoria',
      description: 'El triunfo se repite.',
      howTo: 'Gana 8 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 8,
    },
    {
      title: 'Sello del Campe&oacute;n',
      description: 'Esto ya no es casualidad.',
      howTo: 'Gana 10 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'El Anillo de Vireon',
      description: 'Solo unos pocos llegan aqu&iacute;.',
      howTo: 'Termina en el top 3 en 10 torneos.',
      unlocked: mejorRachaTop3 >= 10,
    },
    {
      title: 'Legado de Zoryth',
      description: 'Mi rastro queda marcado.',
      howTo: 'Gana 12 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 12,
    },
    {
      title: 'Podio eterno',
      description: 'Siempre estoy arriba.',
      howTo: 'Termina en el top 3 en 14 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 14,
    },
    {
      title: 'Corona de Nythera',
      description: 'No hay discusi&oacute;n.',
      howTo: 'Gana 14 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 14,
    },
    {
      title: 'Dominio de Kharion',
      description: 'Nadie logra bajarme.',
      howTo: 'Gana 16 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 16,
    },
    {
      title: 'El pacto de Orlath',
      description: 'El triunfo ya es costumbre.',
      howTo: 'Termina en el top 3 en 25 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 25,
    },
    {
      title: 'Sombra del invicto',
      description: 'Nadie me alcanza.',
      howTo: 'Gana 18 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 18,
    },
    {
      title: 'El ciclo perfecto',
      description: 'Ganar... repetir... dominar.',
      howTo: 'Gana 20 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 20,
    },
    {
      title: 'Presencia de Valyrex',
      description: 'Estar arriba ya es normal.',
      howTo: 'Termina en el top 3 en 42 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 42,
    },
    {
      title: 'Imperio de Solthar',
      description: 'Todo gira a mi alrededor.',
      howTo: 'Gana 22 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 22,
    },
    {
      title: 'El juicio final',
      description: 'Aqu&iacute; se define todo.',
      howTo: 'Gana un torneo sin cometer ni un error.',
      unlocked: victoriasSinErrores >= 1,
    },
    {
      title: 'Leyenda de Umbryon',
      description: 'Mi nombre ya no se olvida.',
      howTo: 'Termina en el top 3 en 55 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 55,
    },
    {
      title: 'Voluntad absoluta',
      description: 'Nada me detiene.',
      howTo: 'Gana 400 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 400,
    },
    {
      title: 'El trono infinito',
      description: 'No hay final para esto.',
      howTo: 'Gana 100 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 100,
    },
  ]
}

function crearLogrosMatematicas(stats) {
  const totalCorrectas = stats.matematicas_total_correctas || 0
  const sesionesSinErrores = stats.matematicas_sesiones_sin_errores || 0
  const mejorRachaCorrectas = stats.matematicas_mejor_racha_correctas || 0
  const mejorRacha3s = stats.matematicas_mejor_racha_3s || 0
  const mejorRacha5s = stats.matematicas_mejor_racha_5s || 0
  const mejorCorrectas60s = stats.matematicas_mejor_correctas_60s || 0
  const ejerciciosMenos = (key) => stats[`matematicas_ejercicios_menos_${key}`] || 0
  const logrosRapidez = [
    {
      title: '¿Ya terminé?',
      description: 'Se sintió demasiado fácil.',
      howTo: 'Resuelve 4 ejercicios en menos de 14 segundos.',
      unlocked: ejerciciosMenos('14s') >= 4,
    },
    {
      title: 'Ni lo noté',
      description: 'Pasó sin darme cuenta.',
      howTo: 'Resuelve 5 ejercicios en menos de 13 segundos.',
      unlocked: ejerciciosMenos('13s') >= 5,
    },
    {
      title: 'Demasiado rápido',
      description: 'Eso no debería contar.',
      howTo: 'Resuelve 9 ejercicios en menos de 12 segundos.',
      unlocked: ejerciciosMenos('12s') >= 9,
    },
    {
      title: 'Fue automático',
      description: 'Mi mente fue sola.',
      howTo: 'Resuelve 11 ejercicios en menos de 11 segundos.',
      unlocked: ejerciciosMenos('11s') >= 11,
    },
    {
      title: 'Sin esfuerzo',
      description: 'Ni siquiera intenté.',
      howTo: 'Resuelve 17 ejercicios en menos de 10 segundos.',
      unlocked: ejerciciosMenos('10s') >= 17,
    },
    {
      title: 'Como respirar',
      description: 'Natural... instantáneo.',
      howTo: 'Resuelve 31 ejercicios en menos de 9 segundos.',
      unlocked: ejerciciosMenos('9s') >= 31,
    },
    {
      title: 'Casi instantáneo',
      description: 'Ni tiempo de pensar.',
      howTo: 'Resuelve 41 ejercicios en menos de 8 segundos.',
      unlocked: ejerciciosMenos('8s') >= 41,
    },
    {
      title: '¿En serio?',
      description: 'Esperaba algo más de este juego.',
      howTo: 'Resuelve 51 ejercicios en menos de 7 segundos.',
      unlocked: ejerciciosMenos('7s') >= 51,
    },
    {
      title: 'Flash mental',
      description: 'Un destello y ya.',
      howTo: 'Resuelve 12 ejercicios en menos de 6 segundos.',
      unlocked: ejerciciosMenos('6s') >= 12,
    },
    {
      title: 'Ni parpadeé',
      description: 'Y ya estaba lista la respuesta.',
      howTo: 'Resuelve 10 ejercicios en menos de 5 segundos.',
      unlocked: ejerciciosMenos('5s') >= 10,
    },
    {
      title: 'Demasiado fácil',
      description: 'Esto se está poniendo raro.',
      howTo: 'Resuelve 6 ejercicios en menos de 4 segundos.',
      unlocked: ejerciciosMenos('4s') >= 6,
    },
    {
      title: 'Reflejo puro',
      description: 'Ni lo procesé y ya tenía la respuesta.',
      howTo: 'Resuelve 14 ejercicios en menos de 3.5 segundos.',
      unlocked: ejerciciosMenos('3_5s') >= 14,
    },
    {
      title: 'Instinto activo',
      description: 'Solo reaccioné puro instinto.',
      howTo: 'Resuelve 7 ejercicios en menos de 3 segundos.',
      unlocked: ejerciciosMenos('3s') >= 7,
    },
    {
      title: 'Respuesta fantasma',
      description: 'Apareció sola sin que pensara.',
      howTo: 'Resuelve 3 ejercicios en menos de 2.5 segundos.',
      unlocked: ejerciciosMenos('2_5s') >= 3,
    },
    {
      title: 'Tiempo mínimo',
      description: 'Esto ya no es normal....',
      howTo: 'Resuelve 2 ejercicios en menos de 2 segundos.',
      unlocked: ejerciciosMenos('2s') >= 2,
    },
    {
      title: 'Rompí el reloj',
      description: 'Algo no cuadra....no debería contar o sí?.',
      howTo: 'Resuelve 1 ejercicio en menos de 1.8 segundos.',
      unlocked: ejerciciosMenos('1_8s') >= 1,
    },
    {
      title: 'Fuera del tiempo',
      description: 'El reloj se quedó atrás.',
      howTo: 'Resuelve 1 ejercicio en menos de 1.5 segundos.',
      unlocked: ejerciciosMenos('1_5s') >= 1,
    },
    {
      title: 'Antes de pensar',
      description: 'La respuesta llegó primero antes de que me diera cuenta.',
      howTo: 'Resuelve 1 ejercicio en menos de 1.2 segundos.',
      unlocked: ejerciciosMenos('1_2s') >= 1,
    },
    {
      title: 'Imposible',
      description: 'Esto no debería pasar....verdad?',
      howTo: 'Resuelve 1 ejercicio en menos de 1 segundo.',
      unlocked: ejerciciosMenos('1s') >= 1,
    },
    {
      title: 'Más rápido que la duda',
      description: 'Ni la duda es más rápida que yo...',
      howTo: 'Resuelve 1 ejercicio en menos de 0.8 segundos.',
      unlocked: ejerciciosMenos('0_8s') >= 1,
    },
  ]

  return [
    ...logrosRapidez,
    {
      title: 'Cerebro encendido',
      description: 'Algo hizo click... y no se apago.',
      howTo: 'Resuelve 12 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 12,
    },
    {
      title: 'El hilo invisible',
      description: 'Algo conecta cada respuesta... y no se rompe.',
      howTo: 'Resuelve 11 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 11,
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
      title: 'Destino numerico',
      description: 'Cada resultado ya estaba escrito.',
      howTo: 'Completa 23 operaciones consecutivas sin fallar.',
      unlocked: mejorRachaCorrectas >= 23,
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
      title: 'Alineacion perfecta',
      description: 'Todo cae justo donde debe.',
      howTo: 'Resuelve 7 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 7,
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
      title: 'La secuencia despierta',
      description: 'Los numeros empiezan a moverse solos.',
      howTo: 'Completa 44 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 44,
    },
    {
      title: 'Cadena de aciertos',
      description: 'Uno lleva al otro... y no se detiene.',
      howTo: 'Resuelve 74 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 74,
    },
    {
      title: 'Eco de precision',
      description: 'Una respuesta llama a la siguiente.',
      howTo: 'Resuelve 67 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 67,
    },
    {
      title: 'Cadena encantada',
      description: 'No hay forma de romper esto.',
      howTo: 'Completa 70 operaciones consecutivas sin fallar.',
      unlocked: mejorRachaCorrectas >= 70,
    },
    {
      title: 'Sin interrupciones',
      description: 'Nada se interpone entre yo y el resultado.',
      howTo: 'Completa 98 ejercicios consecutivos sin fallar.',
      unlocked: mejorRachaCorrectas >= 98,
    },
    {
      title: 'Rastro infinito',
      description: 'Voy dejando aciertos atras.',
      howTo: 'Resuelve 87 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 87,
    },
    {
      title: 'La formula eterna',
      description: 'Siempre hay una respuesta mas.',
      howTo: 'Completa 95 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 95,
    },
    {
      title: 'Mente en linea recta',
      description: 'No hay desvios... solo respuestas.',
      howTo: 'Resuelve 122 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 122,
    },
    {
      title: 'Conexion absoluta',
      description: 'Nada se pierde en el proceso.',
      howTo: 'Resuelve 111 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 111,
    },
    {
      title: 'Orden oculto',
      description: 'El caos... en realidad no existe.',
      howTo: 'Completa 128 operaciones consecutivas sin fallar.',
      unlocked: mejorRachaCorrectas >= 128,
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
      title: 'Pulso matematico',
      description: 'Late... y nunca se detiene.',
      howTo: 'Resuelve 137 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 137,
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
      title: 'La rueda gira',
      description: 'Y yo sigo dentro.',
      howTo: 'Completa 149 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 149,
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
    {
      title: 'Simetria mental',
      description: 'Yo soy uno con el juego...',
      howTo: 'Completa 200 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 200,
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
      title: 'Memoria de Pescado',
      description: 'Definitivamente estaba aqu&iacute; hace un segundo.',
      howTo: 'Levanta 5 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 5,
    },
    {
      title: 'El Or&aacute;culo Ciego',
      description: 'Tu intuici&oacute;n muri&oacute; hace varias cartas atr&aacute;s.',
      howTo: 'Levanta 7 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 7,
    },
    {
      title: 'Caos Cognitivo',
      description: 'Cada intento te alej&oacute; m&aacute;s de la respuesta.',
      howTo: 'Levanta 10 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 10,
    },
    {
      title: 'Arquitecto del Error',
      description: 'Construiste una derrota carta por carta.',
      howTo: 'Levanta 12 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 12,
    },
    {
      title: 'La Maldici&oacute;n de la Memoria Rota',
      description: 'Recordar era solo una ilusi&oacute;n.',
      howTo: 'Levanta 15 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 15,
    },
    {
      title: '&iquest;Seguro Que Era Esa?',
      description: 'La confianza cay&oacute; m&aacute;s r&aacute;pido que tus intentos.',
      howTo: 'Levanta 20 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 20,
    },
    {
      title: 'El Coleccionista de Fracasos',
      description: 'Cada carta equivocada encontr&oacute; su lugar contigo.',
      howTo: 'Levanta 25 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 25,
    },
    {
      title: 'Desconexi&oacute;n Neuronal',
      description: 'Tu cerebro abandon&oacute; la partida hace rato.',
      howTo: 'Levanta 30 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 30,
    },
    {
      title: 'La Niebla del Olvido',
      description: 'Todas las cartas comenzaron a verse iguales.',
      howTo: 'Levanta 40 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 40,
    },
    {
      title: 'Maestro del Desastre',
      description: 'Convertiste un juego de memoria en una ruina absoluta.',
      howTo: 'Levanta 50 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 50,
    },
    {
      title: 'El Abismo de la Duda',
      description: 'Cada elecci&oacute;n equivocada abri&oacute; otra herida en tu memoria.',
      howTo: 'Levanta 60 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 60,
    },
    {
      title: 'Cartas del Olvido Eterno',
      description: 'Ni el destino pudo ayudarte a recordar.',
      howTo: 'Levanta 75 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 75,
    },
    {
      title: 'Sinapsis Perdidas',
      description: 'Tus neuronas presentaron su renuncia colectiva.',
      howTo: 'Levanta 90 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 90,
    },
    {
      title: 'El Ritual del Error Infinito',
      description: 'Fallaste tantas veces que el tablero empez&oacute; a burlarse.',
      howTo: 'Levanta 100 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 100,
    },
    {
      title: 'La Ruina de la Memoria Humana',
      description: 'Cada carta revelada fue otra derrota inevitable.',
      howTo: 'Levanta 125 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 125,
    },
    {
      title: 'Olvido Absoluto',
      description: 'Ya no jugabas para ganar... jugabas para recordar qui&eacute;n eras.',
      howTo: 'Levanta 150 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 150,
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
      title: 'Prisionero del Tablero',
      description: 'El mundo afuera sigui&oacute; avanzando sin ti.',
      howTo: 'Juega 350 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 350 * 60 * 60,
    },
    {
      title: '&iquest;A&uacute;n Vive Tu Familia?',
      description: 'Hace d&iacute;as que no escuchas otra voz que no sean n&uacute;meros.',
      howTo: 'Juega 500 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 500 * 60 * 60,
    },
    {
      title: 'El Monje de los N&uacute;meros',
      description: 'Renunciaste al caos del mundo por una cuadr&iacute;cula perfecta.',
      howTo: 'Juega 750 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 750 * 60 * 60,
    },
    {
      title: 'Insomnio Matem&aacute;tico',
      description: 'Cerrar los ojos ya no apaga los patrones.',
      howTo: 'Juega 1000 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 1000 * 60 * 60,
    },
    {
      title: 'El Ermita&ntilde;o del Vac&iacute;o',
      description: 'Tu &uacute;nica compa&ntilde;&iacute;a fueron filas y columnas infinitas.',
      howTo: 'Juega 2000 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 2000 * 60 * 60,
    },
    {
      title: 'Ascensi&oacute;n del &Uacute;ltimo N&uacute;mero',
      description: 'Ya no resuelves sudokus... te conviertes en ellos.',
      howTo: 'Juega 3000 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 3000 * 60 * 60,
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
