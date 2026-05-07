import { BOOSTERS_XP, COSMETICOS, comprarBooster, comprarCosmetico, descontarMonedasDemo, obtenerBoosterActivo, obtenerMonedasDemo, tiempoRestante } from "./tienda.js"
import { escapeHtml, safeAlert } from "./mensajes.js"

const modal = document.getElementById("storeModal")
const boosterList = document.getElementById("storeBoosters")
const cosmeticsList = document.getElementById("storeCosmetics")
const statusEl = document.getElementById("storeStatus")
const coinsEl = document.getElementById("storeCoins")
const activeEl = document.getElementById("storeActiveBooster")
const openButtons = document.querySelectorAll("[data-open-store]")
const closeButtons = document.querySelectorAll("[data-close-store]")

let timer = null

function usuarioActual() {
  return localStorage.getItem("usuario") || localStorage.getItem("ultimo_usuario") || ""
}

function initStore() {
  if (!modal || !boosterList || !cosmeticsList) return

  openButtons.forEach((button) => button.addEventListener("click", abrirTienda))
  closeButtons.forEach((button) => button.addEventListener("click", cerrarTienda))
  modal.addEventListener("click", (event) => {
    if (event.target === modal) cerrarTienda()
  })
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("abierto")) cerrarTienda()
  })
}

async function abrirTienda() {
  modal.classList.add("abierto")
  modal.setAttribute("aria-hidden", "false")
  await renderTienda()
  clearInterval(timer)
  timer = setInterval(actualizarBoosterActivo, 30000)
}

function cerrarTienda() {
  modal.classList.remove("abierto")
  modal.setAttribute("aria-hidden", "true")
  clearInterval(timer)
}

async function renderTienda() {
  const usuario = usuarioActual()
  if (!usuario) {
    statusEl.textContent = "Entra a un juego con tu apodo para activar compras."
  } else {
    statusEl.textContent = "Los boosters se activan automaticamente al comprar."
  }

  coinsEl.textContent = `${obtenerMonedasDemo(usuario)} monedas`
  await actualizarBoosterActivo()

  boosterList.innerHTML = BOOSTERS_XP.map((booster) => `
    <article class="store-item">
      <div>
        <strong>${escapeHtml(booster.nombre)}</strong>
        <span>${duracionLabel(booster.duracionMs)} - ${booster.precio} monedas</span>
      </div>
      <button type="button" data-buy-booster="${booster.id}">Comprar</button>
    </article>
  `).join("")

  cosmeticsList.innerHTML = COSMETICOS.map((item) => `
    <article class="store-item rarity-${item.rareza.toLowerCase()}">
      <div>
        <strong>${escapeHtml(item.nombre)}</strong>
        <span>${escapeHtml(item.tipo)} - ${escapeHtml(item.rareza)} - ${item.precio} monedas</span>
      </div>
      <button type="button" data-buy-cosmetic="${item.id}">Comprar</button>
    </article>
  `).join("")

  boosterList.querySelectorAll("[data-buy-booster]").forEach((button) => {
    button.addEventListener("click", () => comprar("booster", button.dataset.buyBooster))
  })
  cosmeticsList.querySelectorAll("[data-buy-cosmetic]").forEach((button) => {
    button.addEventListener("click", () => comprar("cosmetico", button.dataset.buyCosmetic))
  })
}

async function comprar(tipo, id) {
  const usuario = usuarioActual()
  if (!usuario) {
    safeAlert("Primero entra a un juego con tu apodo.")
    return
  }

  const item = tipo === "booster"
    ? BOOSTERS_XP.find((booster) => booster.id === id)
    : COSMETICOS.find((cosmetico) => cosmetico.id === id)

  if (!item || !descontarMonedasDemo(usuario, item.precio)) {
    safeAlert("No tienes monedas suficientes.")
    return
  }

  const resultado = tipo === "booster"
    ? await comprarBooster(usuario, id)
    : await comprarCosmetico(usuario, id)

  if (!resultado.ok) {
    statusEl.textContent = "Compra guardada localmente. Aplica la tabla SQL para sincronizarla globalmente."
  } else {
    statusEl.textContent = "Compra activada."
  }

  await renderTienda()
}

async function actualizarBoosterActivo() {
  const usuario = usuarioActual()
  const activo = await obtenerBoosterActivo(usuario)
  activeEl.textContent = activo
    ? `Activo: x${Number(activo.multiplicador).toFixed(0)} - termina en ${tiempoRestante(activo.fecha_fin)}`
    : "Sin booster activo"
}

function duracionLabel(ms) {
  const dias = Math.round(ms / 86400000)
  if (dias >= 1) return dias === 1 ? "24 horas" : `${dias} dias`
  return "Temporal"
}

initStore()
