import { supabase } from '../../js/supabase.js'

const resultadoFinal = document.getElementById('resultadoFinal')
const podioDiv = document.getElementById('podio')
const rankingDiv = document.getElementById('ranking')
const usuario = localStorage.getItem('usuario')
const resultado = localStorage.getItem('damasResultado') || 'Partida finalizada.'

resultadoFinal.innerText = resultado

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${minutos}:${seg < 10 ? '0' : ''}${seg}`
}

async function cargarResultados() {
  let result = await supabase
    .from('ranking_damas')
    .select('*')
    .eq('invalido', false)
    .order('tiempo', { ascending: true })

  if (result.error) {
    result = await supabase
      .from('ranking')
      .select('*')
      .eq('invalido', false)
      .eq('juego', 'damas')
      .order('tiempo', { ascending: true })
  }

  const data = result.data || []
  const posicion = data.findIndex((jugador) => jugador.usuario === usuario)
  const posicionDiv = document.createElement('h2')

  if (posicion !== -1) {
    posicionDiv.innerText = `Quedaste #${posicion + 1} de ${data.length}`
  } else {
    posicionDiv.innerText = 'No estas en el ranking'
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
    const destacado = jugador.usuario === usuario
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
  window.location.href = 'lobby.html'
}
