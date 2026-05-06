import { supabase } from '../../js/supabase.js'
import { volverDesdeFinal } from '../../js/mini-torneo.js'

const resultadoFinal = document.getElementById('resultadoFinal')
const podioDiv = document.getElementById('podio')
const rankingDiv = document.getElementById('ranking')
const usuario = localStorage.getItem('usuario')
const resultado = localStorage.getItem('damasResultado') || 'Partida finalizada.'
const sinPosicion = localStorage.getItem('damasSinPosicion') === 'true'
const estadisticasPendientes = localStorage.getItem('damasEstadisticasPendientes') === 'true'

resultadoFinal.innerText = resultado.toLowerCase().includes('descalificado')
  ? 'Descalificado por actividad sospechosa'
  : resultado

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${minutos}:${seg < 10 ? '0' : ''}${seg}`
}

function escapeHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function guardarEstadisticasDamas(posicion) {
  if (!usuario || !estadisticasPendientes || typeof posicion !== 'number') return

  const { data: actual, error: lecturaError } = await supabase
    .from('estadisticas_logros')
    .select('*')
    .eq('usuario', usuario)
    .eq('juego', 'damas')
    .maybeSingle()

  if (lecturaError) {
    console.warn('No se pudieron leer estadisticas de damas', lecturaError)
    return
  }

  const esVictoria = posicion === 1
  const esTop3 = posicion <= 3
  const esSegundo = posicion === 2
  const esTercero = posicion === 3
  const rachaVictoriasActual = esVictoria ? (actual?.racha_victorias_torneos_actual || 0) + 1 : 0
  const rachaTop3Actual = esTop3 ? (actual?.racha_top3_torneos_actual || 0) + 1 : 0
  const rachaSegundoActual = esSegundo ? (actual?.damas_racha_segundo_actual || 0) + 1 : 0
  const rachaTerceroActual = esTercero ? (actual?.damas_racha_tercero_actual || 0) + 1 : 0
  const mejorPosicionAnterior = actual?.mejor_posicion_torneo
  const mejorPosicionTorneo = typeof mejorPosicionAnterior === 'number'
    ? Math.min(mejorPosicionAnterior, posicion)
    : posicion

  const { error } = await supabase
    .from('estadisticas_logros')
    .upsert({
      usuario,
      juego: 'damas',
      completados: (actual?.completados || 0) + 1,
      torneos_participados: (actual?.torneos_participados || 0) + 1,
      mejor_posicion_torneo: mejorPosicionTorneo,
      victorias_torneos: (actual?.victorias_torneos || 0) + (esVictoria ? 1 : 0),
      racha_victorias_torneos_actual: rachaVictoriasActual,
      mejor_racha_victorias_torneos: Math.max(actual?.mejor_racha_victorias_torneos || 0, rachaVictoriasActual),
      top3_torneos: (actual?.top3_torneos || 0) + (esTop3 ? 1 : 0),
      racha_top3_torneos_actual: rachaTop3Actual,
      mejor_racha_top3_torneos: Math.max(actual?.mejor_racha_top3_torneos || 0, rachaTop3Actual),
      damas_racha_segundo_actual: rachaSegundoActual,
      damas_mejor_racha_segundo: Math.max(actual?.damas_mejor_racha_segundo || 0, rachaSegundoActual),
      damas_racha_tercero_actual: rachaTerceroActual,
      damas_mejor_racha_tercero: Math.max(actual?.damas_mejor_racha_tercero || 0, rachaTerceroActual),
      ultima_posicion_torneo: posicion,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'usuario,juego' })

  if (error) {
    console.warn('No se pudieron guardar estadisticas de damas', error)
    return
  }

  localStorage.removeItem('damasEstadisticasPendientes')
}

async function cargarResultados() {
  const rankingGeneral = await supabase
    .from('ranking')
    .select('*')
    .eq('invalido', false)
    .eq('juego', 'damas')
    .order('tiempo', { ascending: true })

  const rankingDamas = await supabase
    .from('ranking_damas')
    .select('*')
    .eq('invalido', false)
    .order('tiempo', { ascending: true })

  const resultadosPorUsuario = new Map()
  const resultados = [
    ...(rankingGeneral.error ? [] : rankingGeneral.data || []),
    ...(rankingDamas.error ? [] : rankingDamas.data || []),
  ]

  resultados.forEach((jugador) => {
    const actual = resultadosPorUsuario.get(jugador.usuario)
    if (!actual || jugador.tiempo < actual.tiempo) {
      resultadosPorUsuario.set(jugador.usuario, jugador)
    }
  })

  const data = Array.from(resultadosPorUsuario.values())
    .sort((a, b) => a.tiempo - b.tiempo)
  const posicionDiv = document.createElement('h2')

  if (sinPosicion) {
    posicionDiv.innerText = 'No clasificaste al ranking'
  } else {
    const posicion = data.findIndex((jugador) => jugador.usuario === usuario)

    if (posicion !== -1) {
      const posicionFinal = posicion + 1
      posicionDiv.innerText = `Quedaste #${posicionFinal} de ${data.length}`
      await guardarEstadisticasDamas(posicionFinal)
    } else {
      posicionDiv.innerText = 'No estas en el ranking'
    }
  }

  document.querySelector('.contenedor').insertBefore(posicionDiv, podioDiv)

  podioDiv.innerHTML = ''
  data.slice(0, 3).forEach((jugador, index) => {
    const etiqueta = ['#1', '#2', '#3'][index]
    const div = document.createElement('div')
    div.innerHTML = `
      <h3>${etiqueta} ${escapeHtml(jugador.usuario)}</h3>
      <p>${formatearTiempo(jugador.tiempo)}</p>
    `
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ''
  if (data.length === 0) {
    rankingDiv.innerHTML = '<p>No hay resultados de damas todavia.</p>'
    return
  }

  data.forEach((jugador, index) => {
    const div = document.createElement('div')
    div.className = `ranking-row${jugador.usuario === usuario && !sinPosicion ? ' actual' : ''}`
    div.innerHTML = `
      <span>#${index + 1}</span>
      <strong>${escapeHtml(jugador.usuario)}</strong>
      <span>${formatearTiempo(jugador.tiempo)}</span>
    `
    rankingDiv.appendChild(div)
  })
}

cargarResultados()

window.volverLobby = async function () {
  await volverDesdeFinal(supabase, () => {
    localStorage.removeItem('damasSinPosicion')
    localStorage.removeItem('damasEstadisticasPendientes')
  })
}
