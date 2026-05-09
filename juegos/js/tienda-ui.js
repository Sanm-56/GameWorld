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
const cosmeticTabs = [...document.querySelectorAll("[data-cosmetic-tab]")]
const rarityTabs = [...document.querySelectorAll("[data-rarity-tab]")]
const statusEl = document.getElementById("storeStatus")
const coinsEl = document.getElementById("storeCoins")
const activeEl = document.getElementById("storeActiveBooster")
const openButtons = document.querySelectorAll("[data-open-store]")
const closeButtons = document.querySelectorAll("[data-close-store]")

let timer = null
let cosmeticTabActiva = "fondo"
let rarezaTabActiva = "Normal"

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
  cosmeticTabs.forEach((button) => {
    button.addEventListener("click", () => {
      cosmeticTabActiva = button.dataset.cosmeticTab || "fondo"
      cosmeticTabs.forEach((tab) => tab.classList.toggle("active", tab === button))
      renderCosmeticos()
    })
  })
  rarityTabs.forEach((button) => {
    button.addEventListener("click", () => {
      rarezaTabActiva = button.dataset.rarityTab || "Normal"
      rarityTabs.forEach((tab) => tab.classList.toggle("active", tab === button))
      renderCosmeticos()
    })
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

  coinsEl.textContent = `${obtenerMonedas(usuario)} monedas`
  await actualizarBoosterActivo()

  boosterList.innerHTML = BOOSTERS_XP.map((booster) => `
    <article class="store-item booster-card booster-tier-${tierBooster(booster)} ${boosterDestacado(booster) ? "featured" : ""}">
      ${booster.etiqueta ? `<span class="store-badge">${escapeHtml(booster.etiqueta)}</span>` : ""}
      <div class="booster-sigil">
        <span>x${formatearMultiplicador(booster.multiplicador)}</span>
        <small>XP</small>
      </div>
      <div class="store-copy">
        <span class="store-kicker">${escapeHtml(booster.rareza || "Potenciador")}</span>
        <strong>${escapeHtml(booster.nombre)}</strong>
        <small>${duracionLabel(booster.duracionMs)} de progreso acelerado</small>
        <span class="store-price">${booster.precio.toLocaleString("es-CO")} monedas</span>
      </div>
      <div class="store-actions-inline">
        <button class="store-soft-btn" type="button" data-buy-booster="${booster.id}">Monedas</button>
        <button class="store-main-btn" type="button" data-real-buy="booster:${booster.id}">${booster.precioReal}</button>
      </div>
    </article>
  `).join("")

  coinList.innerHTML = PAQUETES_MONEDAS.map((paquete) => `
    <article class="store-item coin-card${paqueteDestacado(paquete) ? " popular" : ""}">
      ${paquete.etiqueta ? `<span class="store-badge">${escapeHtml(paquete.etiqueta)}</span>` : ""}
      <div class="coin-orb">
        <span>${paquete.cantidad >= 100000 ? "MAX" : paquete.cantidad >= 40000 ? "VIP" : paquete.cantidad >= 12000 ? "PRO" : "$"}</span>
      </div>
      <div class="store-copy">
        <span class="store-kicker">${paqueteDestacado(paquete) ? "Pack destacado" : "Pack de monedas"}</span>
        <strong>${paquete.cantidad.toLocaleString("es-CO")} monedas</strong>
        ${paquete.bonus ? `<small class="coin-bonus">+${paquete.bonus.toLocaleString("es-CO")} gratis</small>` : "<small>Entrega base para compras futuras</small>"}
        ${paquete.regalo ? `<small class="coin-gift">${escapeHtml(paquete.regalo)}</small>` : ""}
      </div>
      <button class="store-main-btn" type="button" data-real-buy="coins:${paquete.id}">${paquete.precioReal}</button>
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
  const categoria = obtenerCategoriaActiva()
  cosmeticsList.innerHTML = renderCategoriaCosmeticos(categoria)

  cosmeticsList.querySelectorAll("[data-buy-cosmetic]").forEach((button) => {
    button.addEventListener("click", () => comprarConMonedas("cosmetico", button.dataset.buyCosmetic))
  })
}

function obtenerCategoriaActiva() {
  return {
    fondo: { tipo: "fondo", titulo: "Fondos", detalle: "Banners y atmosferas de perfil." },
    id: { tipo: "id", titulo: "IDs", detalle: "Identidades visuales para destacar tu nombre." },
    marco: { tipo: "marco", titulo: "Marcos", detalle: "Bordes competitivos para tarjetas y ranking." },
  }[cosmeticTabActiva] || { tipo: "fondo", titulo: "Fondos", detalle: "Banners y atmosferas de perfil." }
}

function renderCategoriaCosmeticos(categoria) {
  const itemsCategoria = COSMETICOS.filter((item) => item.tipo === categoria.tipo)
  if (!itemsCategoria.length) return ""

  return `
    <section class="cosmetic-category">
      <header class="cosmetic-category-head">
        <div>
          <span>${escapeHtml(categoria.titulo)}</span>
          <small>${escapeHtml(categoria.detalle)}</small>
        </div>
        <strong>${itemsCategoria.length} piezas</strong>
      </header>
      <div class="cosmetic-rarity-stack">
        ${renderRarezaCosmeticos(itemsCategoria, rarezaTabActiva)}
      </div>
    </section>
  `
}

function renderRarezaCosmeticos(itemsCategoria, rareza) {
  const items = itemsCategoria.filter((item) => item.rareza === rareza)
  if (!items.length) return ""

  return `
    <section class="rarity-section rarity-${rarezaClase(rareza)}">
      <header class="rarity-head">
        <span>${escapeHtml(rarezaEtiqueta(rareza))}</span>
        <small>${items.length} piezas</small>
      </header>
      <div class="cosmetic-grid">
        ${items.map(renderCosmetico).join("")}
      </div>
    </section>
  `
}

function renderCosmetico(item) {
  return `
    <article class="store-item store-cosmetic cosmetic-${escapeHtml(item.tipo)} rarity-${rarezaClase(item.rareza)}${clasesVisualesCosmetico(item)}"${estiloVisualCosmetico(item)}>
      ${item.etiqueta ? `<span class="store-badge">${escapeHtml(item.etiqueta)}</span>` : ""}
      <div class="cosmetic-preview" aria-hidden="true">
        <div class="cosmetic-art">
          <span class="cosmetic-art-code">${escapeHtml(siglaCategoria(item.tipo))}</span>
          <span class="cosmetic-art-mark"></span>
        </div>
      </div>
      <div class="store-copy">
        <span class="store-kicker">${escapeHtml(item.categoria)}</span>
        <strong>${escapeHtml(item.nombre)}</strong>
        <p>${escapeHtml(item.descripcion)}</p>
        <small>${escapeHtml(item.diseno.patron)} / brillo ${item.diseno.brillo}</small>
        <span class="store-price">${item.precio.toLocaleString("es-CO")} monedas</span>
      </div>
      <div class="cosmetic-footer">
        <span class="rarity-tag">${escapeHtml(rarezaEtiqueta(item.rareza))}</span>
        <div class="cosmetic-actions">
          <button class="store-soft-btn" type="button" data-buy-cosmetic="${item.id}">Monedas</button>
          <button class="store-main-btn" type="button" data-real-buy="cosmetic:${item.id}">${escapeHtml(item.precioReal || "$0.79")}</button>
        </div>
      </div>
    </article>
  `
}

function clasesVisualesCosmetico(item) {
  const fondo = item.diseno?.fondo
  if (item.tipo !== "fondo" || !fondo) return ""
  return ` fondo-layout-${fondo.layout} fondo-textura-${fondo.textura} fondo-simbolo-${fondo.simbolo} fondo-panel-${fondo.panel}`
}

function estiloVisualCosmetico(item) {
  const fondo = item.diseno?.fondo
  if (item.tipo !== "fondo" || !fondo) return ""
  const estilo = [
    `--fondo-hue:${Number(fondo.hue || 200)}`,
    `--fondo-accent:${Number(fondo.accent || 190)}`,
    `--fondo-luz:${Number(fondo.luz || 18)}%`,
    `--fondo-depth:${Number(fondo.profundidad || 36)}%`,
    `--fondo-x:${Number(fondo.focoX || 50)}%`,
    `--fondo-y:${Number(fondo.focoY || 40)}%`,
    `--fondo-angle:${Number(fondo.angulo || 0)}deg`,
  ].join(";")
  return ` style="${estilo}"`
}

function siglaCategoria(tipo) {
  if (tipo === "fondo") return "BG"
  if (tipo === "marco") return "MR"
  return "ID"
}

function tierBooster(booster) {
  const valor = Number(booster.multiplicador || 1)
  if (valor >= 8) return "supreme"
  if (valor >= 6) return "legendary"
  if (valor >= 5) return "mythic"
  if (valor >= 4) return "legendary"
  if (valor >= 3) return "epic"
  if (valor >= 2.5) return "elite"
  if (valor >= 2) return "competitive"
  return "starter"
}

function boosterDestacado(booster) {
  return Number(booster.multiplicador || 1) >= 4 || ["Mejor valor", "Premium", "Maximo poder"].includes(booster.etiqueta)
}

function paqueteDestacado(paquete) {
  return Number(paquete.cantidad || 0) >= 12000 || Number(paquete.bonus || 0) > 0
}

function formatearMultiplicador(valor) {
  const numero = Number(valor || 1)
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(1)
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
    ? `Activo: x${formatearMultiplicador(activo.multiplicador)} - termina en ${tiempoRestante(activo.fecha_fin)}`
    : "Sin booster activo"
}

function duracionLabel(ms) {
  const horas = Math.round(ms / 3600000)
  if (horas < 24) return `${horas} horas`
  const dias = Math.round(ms / 86400000)
  if (dias >= 1) return dias === 1 ? "24 horas" : `${dias} dias`
  return "Temporal"
}

initStore()
