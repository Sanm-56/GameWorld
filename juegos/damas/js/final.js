import { supabase } from '../../js/supabase.js'

const resultadoFinal = document.getElementById('resultadoFinal')
const podioDiv = document.getElementById('podio')
const rankingDiv = document.getElementById('ranking')
const usuario = localStorage.getItem('usuario')
const resultado = localStorage.getItem('damasResultado') || 'Partida finalizada.'
const sinPosicion = localStorage.getItem('damasSinPosicion') === 'true'

resultadoFinal.innerText = resultado.toLowerCase().includes('descalificado')
  ? 'Descalificado por actividad sospechosa'
  : resultado

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${minutos}:${seg < 10 ? '0' : ''}${seg}`
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
      posicionDiv.innerText = `Quedaste #${posicion + 1} de ${data.length}`
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
      <h3>${etiqueta} ${jugador.usuario}</h3>
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
    const destacado = jugador.usuario === usuario && !sinPosicion
      ? 'style="color:#22c55e; font-weight:bold"'
      : ''

    rankingDiv.innerHTML += `
      <div ${destacado}>#${index + 1} - ${jugador.usuario} (${formatearTiempo(jugador.tiempo)})</div>
    `
  })
}

cargarResultados()

window.volverLobby = async function () {
  const { data } = await supabase
    .from('estado_torneo')
    .select('estado')
    .eq('id', 1)
    .single()

  if (data?.estado !== 'espera') {
    alert('Torneo aun activo')
    return
  }

  localStorage.removeItem('juego_actual')
  localStorage.removeItem('damasSinPosicion')
  window.location.href = 'lobby.html'
}
