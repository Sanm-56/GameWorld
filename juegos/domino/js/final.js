import { supabase } from '../../js/supabase.js'
import { volverDesdeFinal } from '../../js/mini-torneo.js'

const resultadoFinal = document.getElementById('resultadoFinal')
const podioDiv = document.getElementById('podio')
const rankingDiv = document.getElementById('ranking')
const usuario = localStorage.getItem('usuario')
const resultado = localStorage.getItem('dominoResultado') || 'Partida finalizada.'
const sinPosicion = localStorage.getItem('dominoSinPosicion') === 'true'
const estadisticasPendientes = localStorage.getItem('dominoEstadisticasPendientes') === 'true'

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

async function guardarEstadisticasDomino(posicion) {
  if (!usuario || !estadisticasPendientes || typeof posicion !== 'number') return

  const { data: actual, error: lecturaError } = await supabase
    .from('estadisticas_logros')
    .select('*')
    .eq('usuario', usuario)
    .eq('juego', 'domino')
    .maybeSingle()

  if (lecturaError) {
    console.warn('No se pudieron leer estadisticas de domino', lecturaError)
    return
  }

  const esVictoria = posicion === 1
  const esTop10 = posicion <= 10
  const rachaVictoriasActual = esVictoria ? (actual?.racha_victorias_torneos_actual || 0) + 1 : 0
  const rachaTop10Actual = esTop10 ? (actual?.racha_top10_torneos_actual || 0) + 1 : 0
  const rachaInvictoActual = esVictoria ? (actual?.domino_racha_invicto_actual || 0) + 1 : 0
  const mejorPosicionAnterior = actual?.mejor_posicion_torneo
  const mejorPosicionTorneo = typeof mejorPosicionAnterior === 'number'
    ? Math.min(mejorPosicionAnterior, posicion)
    : posicion

  const { error } = await supabase
    .from('estadisticas_logros')
    .upsert({
      usuario,
      juego: 'domino',
      completados: (actual?.completados || 0) + 1,
      torneos_participados: (actual?.torneos_participados || 0) + 1,
      mejor_posicion_torneo: mejorPosicionTorneo,
      victorias_torneos: (actual?.victorias_torneos || 0) + (esVictoria ? 1 : 0),
      racha_victorias_torneos_actual: rachaVictoriasActual,
      mejor_racha_victorias_torneos: Math.max(actual?.mejor_racha_victorias_torneos || 0, rachaVictoriasActual),
      racha_top10_torneos_actual: rachaTop10Actual,
      mejor_racha_top10_torneos: Math.max(actual?.mejor_racha_top10_torneos || 0, rachaTop10Actual),
      domino_racha_invicto_actual: rachaInvictoActual,
      domino_mejor_racha_invicto: Math.max(actual?.domino_mejor_racha_invicto || 0, rachaInvictoActual),
      ultima_posicion_torneo: posicion,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'usuario,juego' })

  if (error) {
    console.warn('No se pudieron guardar estadisticas de domino', error)
    return
  }

  localStorage.removeItem('dominoEstadisticasPendientes')
}

async function cargarResultados() {
  let result = await supabase
    .from('ranking_domino')
    .select('*')
    .eq('invalido', false)
    .order('tiempo', { ascending: true })

  if (result.error) {
    result = await supabase
      .from('ranking')
      .select('*')
      .eq('invalido', false)
      .eq('juego', 'domino')
      .order('tiempo', { ascending: true })
  }

  const data = result.data || []
  const posicionDiv = document.createElement('h2')

  if (sinPosicion) {
    posicionDiv.innerText = 'No clasificaste al ranking'
  } else {
    const posicion = data.findIndex((jugador) => jugador.usuario === usuario)

    if (posicion !== -1) {
      const posicionFinal = posicion + 1
      posicionDiv.innerText = `Quedaste #${posicionFinal} de ${data.length}`
      await guardarEstadisticasDomino(posicionFinal)
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
    rankingDiv.innerHTML = '<p>No hay resultados de domino todavia.</p>'
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
    localStorage.removeItem('dominoSinPosicion')
    localStorage.removeItem('dominoEstadisticasPendientes')
  })
}
