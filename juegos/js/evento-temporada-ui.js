import { formatearMultiplicador, obtenerJuegoDestacadoTemporada, temporadaTieneBonusActivo, tiempoRestanteTemporada } from "./experiencia-temporada.js"

const banner = document.getElementById("seasonEvent")
let temporadaMostrada = null
let seasonEventTimer = null

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
