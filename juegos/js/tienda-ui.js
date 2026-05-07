import {
  BOOSTERS_XP,
  COSMETICOS,
  PAQUETES_MONEDAS,
  comprarBooster,
  comprarCosmetico,
  descontarMonedas,
  obtenerBoosterActivo,
  obtenerMonedas,
  rarezaClase,
  rarezaEtiqueta,
  tiempoRestante,
} from "./tienda.js"
import { escapeHtml, safeAlert } from "./mensajes.js"

const modal = document.getElementById("storeModal")
const boosterList = document.getElementById("storeBoosters")
const coinList = document.getElementById("storeCoinsPackages")
const cosmeticsList = document.getElementById("storeCosmetics")
const cosmeticsFilter = document.getElementById("storeCosmeticsFilter")
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
  cosmeticsFilter?.addEventListener("change", renderCosmeticos)
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

  coinsEl.textContent = `${obtenerMonedas(usuario)} monedas`
  await actualizarBoosterActivo()

  boosterList.innerHTML = BOOSTERS_XP.map((booster) => `
    <article class="store-item">
      <div>
        <strong>${escapeHtml(booster.nombre)}</strong>
        <span>${duracionLabel(booster.duracionMs)} - ${booster.precio} monedas</span>
      </div>
      <div class="store-actions-inline">
        <button type="button" data-buy-booster="${booster.id}">Monedas</button>
        <button type="button" data-real-buy="booster:${booster.id}">${booster.precioReal}</button>
      </div>
    </article>
  `).join("")

  coinList.innerHTML = PAQUETES_MONEDAS.map((paquete) => `
    <article class="store-item">
      <div>
        <strong>${paquete.cantidad.toLocaleString("es-CO")} monedas</strong>
        <span>Compra futura con dinero real</span>
      </div>
      <button type="button" data-real-buy="coins:${paquete.id}">${paquete.precioReal}</button>
    </article>
  `).join("")

  renderCosmeticos()

  boosterList.querySelectorAll("[data-buy-booster]").forEach((button) => {
    button.addEventListener("click", () => comprarConMonedas("booster", button.dataset.buyBooster))
  })
  modal.querySelectorAll("[data-real-buy]").forEach((button) => {
    button.addEventListener("click", compraRealPendiente)
  })
}

function renderCosmeticos() {
  const filtro = cosmeticsFilter?.value || "todos"
  const visibles = COSMETICOS.filter((item) => filtro === "todos" || item.tipo === filtro)

  cosmeticsList.innerHTML = visibles.map((item) => `
    <article class="store-item store-cosmetic rarity-${rarezaClase(item.rareza)}">
      <div>
        <strong>${escapeHtml(item.nombre)}</strong>
        <span>${escapeHtml(item.categoria)} - ${escapeHtml(rarezaEtiqueta(item.rareza))} - ${item.precio} monedas</span>
        <small>${escapeHtml(item.diseno.tema)} / ${escapeHtml(item.diseno.patron)} / brillo ${item.diseno.brillo}</small>
      </div>
      <button type="button" data-buy-cosmetic="${item.id}">Comprar</button>
    </article>
  `).join("")

  cosmeticsList.querySelectorAll("[data-buy-cosmetic]").forEach((button) => {
    button.addEventListener("click", () => comprarConMonedas("cosmetico", button.dataset.buyCosmetic))
  })
}

async function comprarConMonedas(tipo, id) {
  const usuario = usuarioActual()
  if (!usuario) {
    safeAlert("Primero entra a un juego con tu apodo.")
    return
  }

  const item = tipo === "booster"
    ? BOOSTERS_XP.find((booster) => booster.id === id)
    : COSMETICOS.find((cosmetico) => cosmetico.id === id)

  if (!item || !descontarMonedas(usuario, item.precio, { tipo, id })) {
    safeAlert("No tienes monedas suficientes.")
    return
  }

  const resultado = tipo === "booster"
    ? await comprarBooster(usuario, id)
    : await comprarCosmetico(usuario, id)

  if (!resultado.ok) {
    statusEl.textContent = "Compra guardada para este usuario. La sincronizacion remota no esta disponible."
  } else {
    statusEl.textContent = "Compra activada."
  }

  await renderTienda()
}

function compraRealPendiente() {
  statusEl.textContent = "Compra con dinero real preparada visualmente. La pasarela de pago todavia no esta conectada."
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
