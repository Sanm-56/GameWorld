import { supabase } from '../../js/supabase.js'

const resultadoFinal = document.getElementById('resultadoFinal')
const podioDiv = document.getElementById('podio')
const rankingDiv = document.getElementById('ranking')
const usuario = localStorage.getItem('usuario')
const fin = localStorage.getItem('fin_juego')
const resultado = localStorage.getItem('ajedrezResultado') || 'Partida finalizada.'

resultadoFinal.innerText = fin === 'descalificado'
  ? 'Descalificado por actividad sospechosa'
  : resultado

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${minutos}:${seg < 10 ? '0' : ''}${seg}`
}

async function cargarResultados() {
  let result = await supabase
    .from('ranking_ajedrez')
    .select('*')
    .eq('invalido', false)
    .order('tiempo', { ascending: true })

  if (result.error) {
    console.warn('ranking_ajedrez no disponible, usando ranking generico', result.error)
    result = await supabase
      .from('ranking')
      .select('*')
      .eq('invalido', false)
      .eq('juego', 'ajedrez')
      .order('tiempo', { ascending: true })
  }

  const data = result.data
  if (!data) return

  const posicion = data.findIndex((j) => j.usuario === usuario)
  const posicionDiv = document.createElement('h2')

  if (posicion !== -1) {
    let mensaje = `Quedaste #${posicion + 1} de ${data.length}`
    if (posicion === 0) mensaje += ' - GANASTE'
    else if (posicion < 3) mensaje += ' - Podio'
    else mensaje += ' - Buen intento'
    posicionDiv.innerText = mensaje
  } else {
    posicionDiv.innerText = 'No estas en el ranking'
  }

  document.querySelector('.contenedor').insertBefore(posicionDiv, podioDiv)

  podioDiv.innerHTML = ''
  data.slice(0, 3).forEach((j, i) => {
    const etiqueta = ['#1', '#2', '#3'][i]
    const div = document.createElement('div')
    div.innerHTML = `
      <h3>${etiqueta} ${j.usuario}</h3>
      <p>${formatearTiempo(j.tiempo)}</p>
    `
    podioDiv.appendChild(div)
  })

  rankingDiv.innerHTML = ''
  if (data.length === 0) {
    rankingDiv.innerHTML = '<p>No hay resultados de ajedrez todavia.</p>'
  } else {
    data.forEach((j, i) => {
      const div = document.createElement('div')
      div.className = `ranking-row${j.usuario === usuario ? ' actual' : ''}`
      div.innerHTML = `
        <span>#${i + 1}</span>
        <strong>${j.usuario}</strong>
        <span>${formatearTiempo(j.tiempo)}</span>
      `
      rankingDiv.appendChild(div)
    })
  }
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
