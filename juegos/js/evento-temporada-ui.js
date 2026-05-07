import { formatearMultiplicador, obtenerJuegoDestacadoTemporada } from "./experiencia-temporada.js"

const banner = document.getElementById("seasonEvent")

async function initSeasonEvent() {
  if (!banner) return

  const destacado = await obtenerJuegoDestacadoTemporada()
  if (!destacado || destacado.bonus <= 1) {
    banner.style.display = "none"
    return
  }

  banner.style.display = "flex"
  const temporada = destacado.temporada
  const nombre = temporada?.nombre ? ` - ${temporada.nombre}` : ""
  banner.innerHTML = `
    <strong>TEMPORADA ${temporada?.numero || ""}${nombre}</strong>
    <span>${destacado.label} da ${formatearMultiplicador(destacado.bonus)} experiencia</span>
  `
}

initSeasonEvent()
