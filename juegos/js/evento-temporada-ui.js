import { formatearMultiplicador, obtenerJuegoDestacadoTemporada, temporadaTieneBonusActivo, tiempoRestanteTemporada } from "./experiencia-temporada.js"
import { eventoEstaActivo, obtenerEventoMonedasActual, resumenEventoMonedas } from "./bonus-monedas-evento.js"

const banner = document.getElementById("seasonEvent")
const coinBanner = document.getElementById("coinSeasonEvent")
let temporadaMostrada = null
let seasonEventTimer = null
let eventoMonedasMostrado = null
let coinEventTimer = null

async function initSeasonEvent() {
  if (!banner) return

  const destacado = await obtenerJuegoDestacadoTemporada()
  const temporada = destacado?.temporada
  temporadaMostrada = { destacado, temporada }
  if (!destacado || destacado.bonus <= 1 || !temporadaTieneBonusActivo(temporada)) {
    banner.style.display = "none"
    reiniciarSeasonEventTimer(false)
    return
  }

  banner.style.display = "flex"
  renderSeasonEvent()
  reiniciarSeasonEventTimer(true)
}

function renderSeasonEvent() {
  if (!banner) return
  const { destacado, temporada } = temporadaMostrada || {}
  if (!destacado || destacado.bonus <= 1 || !temporadaTieneBonusActivo(temporada)) {
    banner.style.display = "none"
    return
  }

  const nombre = temporada?.nombre ? ` - ${temporada.nombre}` : ""
  banner.innerHTML = `
    <strong>TEMPORADA ${temporada?.numero || ""}${nombre}</strong>
    <span>${destacado.label} da ${formatearMultiplicador(destacado.bonus)} experiencia | Finaliza en ${tiempoRestanteTemporada(temporada)}</span>
  `
}

function reiniciarSeasonEventTimer(activo) {
  if (seasonEventTimer) {
    clearInterval(seasonEventTimer)
    seasonEventTimer = null
  }
  if (!activo) return

  seasonEventTimer = setInterval(async () => {
    const temporada = temporadaMostrada?.temporada
    if (!temporadaTieneBonusActivo(temporada)) {
      await initSeasonEvent()
      return
    }
    renderSeasonEvent()
  }, 30000)
}

initSeasonEvent()
initCoinSeasonEvent()

async function initCoinSeasonEvent() {
  if (!coinBanner) return

  const evento = await obtenerEventoMonedasActual()
  eventoMonedasMostrado = evento
  if (!eventoEstaActivo(evento)) {
    coinBanner.style.display = "none"
    reiniciarCoinEventTimer(false)
    return
  }

  coinBanner.style.display = "flex"
  renderCoinSeasonEvent()
  reiniciarCoinEventTimer(true)
}

function renderCoinSeasonEvent() {
  if (!coinBanner) return
  const evento = eventoMonedasMostrado
  if (!eventoEstaActivo(evento)) {
    coinBanner.style.display = "none"
    return
  }

  const resumen = resumenEventoMonedas(evento)
  coinBanner.innerHTML = `
    <strong>BONUS DE MONEDAS ACTIVO</strong>
    <span>${resumen.juegoTexto} da ${resumen.multiplicadorTexto} monedas | Finaliza en ${resumen.restanteTexto}</span>
  `
}

function reiniciarCoinEventTimer(activo) {
  if (coinEventTimer) {
    clearInterval(coinEventTimer)
    coinEventTimer = null
  }
  if (!activo) return

  coinEventTimer = setInterval(async () => {
    if (!eventoEstaActivo(eventoMonedasMostrado)) {
      await initCoinSeasonEvent()
      return
    }
    renderCoinSeasonEvent()
  }, 30000)
}
