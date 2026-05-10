import { formatearMultiplicador, obtenerJuegoDestacadoTemporada, temporadaTieneBonusActivo, tiempoRestanteTemporada } from "./experiencia-temporada.js"

const banner = document.getElementById("seasonEvent")

async function initSeasonEvent() {
  if (!banner) return

  const destacado = await obtenerJuegoDestacadoTemporada()
  const temporada = destacado?.temporada
  if (!destacado || destacado.bonus <= 1 || !temporadaTieneBonusActivo(temporada)) {
    banner.style.display = "none"
    return
  }

  banner.style.display = "flex"
  const nombre = temporada?.nombre ? ` - ${temporada.nombre}` : ""
  banner.innerHTML = `
    <strong>TEMPORADA ${temporada?.numero || ""}${nombre}</strong>
    <span>${destacado.label} da ${formatearMultiplicador(destacado.bonus)} experiencia | Finaliza en ${tiempoRestanteTemporada(temporada)}</span>
  `
}

initSeasonEvent()
