import {
  BOOSTERS_MONEDAS,
  BOOSTERS_XP,
  COSMETICOS,
  PAQUETES_MONEDAS,
  PLANES_VIP,
  comprarBooster,
  comprarBoosterMonedas,
  comprarCosmetico,
  comprarMembresiaVip,
  iniciarSincronizacionRecompensasUsuario,
  obtenerBoosterActivo,
  obtenerBoosterMonedasActivo,
  obtenerMonedas,
  rarezaClase,
  rarezaEtiqueta,
  tiempoRestante,
} from "./tienda.js"
import { clearVipStatusCache, getVipStatus } from "./vip.js"
import { confirmAction, escapeHtml, safeAlert } from "./mensajes.js"
import { abrirCheckoutWompi } from "./wompi-tienda.js"

const modal = document.getElementById("storeModal")
const boosterList = document.getElementById("storeBoosters")
const coinBoosterList = document.getElementById("storeCoinBoosters")
const coinList = document.getElementById("storeCoinsPackages")
const vipList = document.getElementById("storeVipMemberships")
const cosmeticsList = document.getElementById("storeCosmetics")
const storeTabs = [...document.querySelectorAll("[data-store-tab]")]
const storePanels = [...document.querySelectorAll("[data-store-panel]")]
const cosmeticTabs = [...document.querySelectorAll("[data-cosmetic-tab]")]
const rarityTabs = [...document.querySelectorAll("[data-rarity-tab]")]
const statusEl = document.getElementById("storeStatus")
const coinsEl = document.getElementById("storeCoins")
const activeEl = document.getElementById("storeActiveBooster")
const openButtons = document.querySelectorAll("[data-open-store]")
const closeButtons = document.querySelectorAll("[data-close-store]")

let timer = null
let storeTabActiva = "boosters-xp"
let cosmeticTabActiva = "fondo"
let rarezaTabActiva = "Normal"

function usuarioActual() {
  return localStorage.getItem("usuario") || localStorage.getItem("ultimo_usuario") || ""
}

function initStore() {
  if (!modal || !boosterList || !coinBoosterList || !coinList || !vipList || !cosmeticsList) return
  const usuario = usuarioActual()
  if (usuario) {
    iniciarSincronizacionRecompensasUsuario(usuario, async () => {
      if (modal.classList.contains("abierto")) await renderTienda()
    })
  }

  openButtons.forEach((button) => button.addEventListener("click", abrirTienda))
  closeButtons.forEach((button) => button.addEventListener("click", cerrarTienda))
  modal.addEventListener("click", (event) => {
    if (event.target === modal) cerrarTienda()
  })
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("abierto")) cerrarTienda()
  })
  window.addEventListener("monedas:actualizadas", () => {
    const usuarioActivo = usuarioActual()
    if (coinsEl && usuarioActivo) coinsEl.textContent = `${obtenerMonedas(usuarioActivo)} monedas`
  })
  storeTabs.forEach((button) => {
    button.addEventListener("click", () => activarStoreTab(button.dataset.storeTab || "boosters-xp"))
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
  activarStoreTab(storeTabActiva)
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

  boosterList.innerHTML = BOOSTERS_XP.map((booster) => renderBoosterCard(booster, {
    tipo: "xp",
    unidad: "XP",
    boton: "Monedas",
    dataAttr: "data-buy-booster",
    detalle: "de progreso acelerado",
  })).join("")

  coinBoosterList.innerHTML = BOOSTERS_MONEDAS.map((booster) => renderBoosterCard(booster, {
    tipo: "coins",
    unidad: "MC",
    boton: "Monedas",
    dataAttr: "data-buy-coin-booster",
    detalle: "para premios de monedas",
  })).join("")

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

  await renderVipMemberships(usuario)
  renderCosmeticos()

  boosterList.querySelectorAll("[data-buy-booster]").forEach((button) => {
    button.addEventListener("click", () => comprarConMonedas("booster", button.dataset.buyBooster))
  })
  coinBoosterList.querySelectorAll("[data-buy-coin-booster]").forEach((button) => {
    button.addEventListener("click", () => comprarConMonedas("coin-booster", button.dataset.buyCoinBooster))
  })
  modal.querySelectorAll("[data-real-buy]").forEach((button) => {
    button.addEventListener("click", () => comprarConWompi(button.dataset.realBuy))
  })
  vipList.querySelectorAll("[data-buy-vip]").forEach((button) => {
    button.addEventListener("click", () => comprarVipConMonedas(button.dataset.buyVip))
  })
}

async function renderVipMemberships(usuario) {
  const vipStatus = usuario ? await getVipStatus({ force: true }) : null
  const statusText = vipStatus?.isVip
    ? vipStatus.expiresAt
      ? `Activo hasta ${new Date(vipStatus.expiresAt).toLocaleString("es-CO")}`
      : "VIP permanente activo"
    : "Sin VIP activo"

  vipList.innerHTML = `
    <article class="store-item vip-store-status">
      <span class="store-badge badge-premium">VIP</span>
      <div class="store-copy">
        <span class="store-kicker">Estado actual</span>
        <strong>${escapeHtml(statusText)}</strong>
        <p>La compra activa tu acceso en Supabase y se valida al entrar a la Zona VIP.</p>
      </div>
      <button class="store-main-btn" type="button" onclick="window.location.href='vip.html'">Zona VIP</button>
    </article>
    ${PLANES_VIP.map((plan) => `
      <article class="store-item booster-card ${plan.id === "30d" ? "featured" : ""}">
        ${plan.etiqueta ? `<span class="store-badge badge-${claseEtiqueta(plan.etiqueta)}">${escapeHtml(plan.etiqueta)}</span>` : ""}
        <div class="booster-sigil coin-booster-card">
          <span>${plan.dias ? plan.dias : "MAX"}</span>
          <small>${plan.dias ? "dias" : "VIP"}</small>
        </div>
        <div class="store-copy">
          <span class="store-kicker">Membresia VIP</span>
          <strong>${escapeHtml(plan.nombre)}</strong>
          <p>${escapeHtml(plan.descripcion)}</p>
          <span class="store-price">${plan.precio.toLocaleString("es-CO")} monedas</span>
        </div>
        <div class="store-actions-inline">
          <button class="store-soft-btn" type="button" data-buy-vip="${escapeHtml(plan.id)}">Monedas</button>
          <button class="store-main-btn" type="button" data-real-buy="vip:${escapeHtml(plan.id)}">${escapeHtml(plan.precioReal)}</button>
        </div>
      </article>
    `).join("")}
  `
}

function renderBoosterCard(booster, config) {
  const claseTipo = config.tipo === "coins" ? "coin-booster-card" : ""
  return `
    <article class="store-item booster-card booster-tier-${tierBooster(booster)} ${boosterDestacado(booster) ? "featured" : ""}">
      ${booster.etiqueta ? `<span class="store-badge badge-${claseEtiqueta(booster.etiqueta)}">${escapeHtml(booster.etiqueta)}</span>` : ""}
      <div class="booster-sigil ${claseTipo}">
        <span>x${formatearMultiplicador(booster.multiplicador)}</span>
        <small>${escapeHtml(config.unidad)}</small>
      </div>
      <div class="store-copy">
        <span class="store-kicker">${escapeHtml(booster.rareza || "Potenciador")}</span>
        <strong>${escapeHtml(booster.nombre)}</strong>
        ${booster.descripcion ? `<p>${escapeHtml(booster.descripcion)}</p>` : ""}
        <small>${duracionLabel(booster.duracionMs)} ${escapeHtml(config.detalle)}</small>
        <span class="store-price">${booster.precio.toLocaleString("es-CO")} monedas</span>
      </div>
      <div class="store-actions-inline">
        <button class="store-soft-btn" type="button" ${config.dataAttr}="${booster.id}">${escapeHtml(config.boton)}</button>
        <button class="store-main-btn" type="button" data-real-buy="booster:${booster.id}">${booster.precioReal}</button>
      </div>
    </article>
  `
}

function activarStoreTab(tab) {
  storeTabActiva = tab
  storeTabs.forEach((button) => {
    const activa = button.dataset.storeTab === tab
    button.classList.toggle("active", activa)
    button.setAttribute("aria-selected", activa ? "true" : "false")
  })
  storePanels.forEach((panel) => {
    const activa = panel.dataset.storePanel === tab
    panel.classList.toggle("active", activa)
    panel.hidden = !activa
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
  const idVisual = item.diseno?.id
  if (item.tipo === "id" && idVisual) {
    return ` id-shape-${idVisual.silueta} id-form-${idVisual.forma} id-size-${idVisual.tamano} id-cut-${idVisual.corte} id-plate-${idVisual.placa} id-corner-${idVisual.esquina} id-border-${idVisual.borde} id-line-${idVisual.linea} id-panel-${idVisual.panel} id-symbol-${idVisual.simbolo} id-geo-${idVisual.geometria} id-texture-${idVisual.textura} id-reflect-${idVisual.reflejo} id-energy-${idVisual.energia} id-pulse-${idVisual.pulso}`
  }
  const marco = item.diseno?.marco
  if (item.tipo === "marco" && marco) {
    return ` marco-struct-${marco.estructura} marco-corner-${marco.esquina} marco-border-${marco.borde} marco-line-${marco.linea} marco-panel-${marco.panel} marco-texture-${marco.textura} marco-cut-${marco.corte} marco-pulse-${marco.pulso} marco-glyph-${marco.glifo} marco-aura-${marco.aura} marco-relic-${marco.reliquia} marco-anomaly-${marco.anomalia}`
  }
  const fondo = item.diseno?.fondo
  if (item.tipo !== "fondo" || !fondo) return ""
  return ` fondo-layout-${fondo.layout} fondo-textura-${fondo.textura} fondo-simbolo-${fondo.simbolo} fondo-panel-${fondo.panel} fondo-energia-${fondo.energia} fondo-fractura-${fondo.fractura} fondo-reliquia-${fondo.reliquia}`
}

function estiloVisualCosmetico(item) {
  const idVisual = item.diseno?.id
  if (item.tipo === "id" && idVisual) {
    const estilo = [
      `--id-hue:${Number(idVisual.hue || 210)}`,
      `--id-accent:${Number(idVisual.accent || 190)}`,
      `--id-luz:${Number(idVisual.luz || 24)}%`,
      `--id-depth:${Number(idVisual.profundidad || 36)}%`,
      `--id-angle:${Number((idVisual.silueta * 19 + idVisual.linea * 13 + idVisual.reflejo * 11) % 360)}deg`,
      `--id-x:${Number(16 + ((idVisual.placa * 7 + idVisual.simbolo * 5) % 68))}%`,
      `--id-y:${Number(18 + ((idVisual.panel * 11 + idVisual.textura * 3) % 58))}%`,
    ].join(";")
    return ` style="${estilo}"`
  }
  const marco = item.diseno?.marco
  if (item.tipo === "marco" && marco) {
    const estilo = [
      `--marco-hue:${Number(marco.hue || 204)}`,
      `--marco-accent:${Number(marco.accent || 190)}`,
      `--marco-luz:${Number(marco.luz || 24)}%`,
      `--marco-depth:${Number(marco.profundidad || 36)}%`,
      `--marco-angle:${Number((marco.estructura * 23 + marco.linea * 17) % 360)}deg`,
    ].join(";")
    return ` style="${estilo}"`
  }
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
  if (valor >= 2.7) return "legendary"
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

function claseEtiqueta(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "default"
}

async function comprarConMonedas(tipo, id) {
  const usuario = usuarioActual()
  if (!usuario) {
    safeAlert("Primero entra a un juego con tu apodo.")
    return
  }

  const item = tipo === "booster"
    ? BOOSTERS_XP.find((booster) => booster.id === id)
    : tipo === "coin-booster"
      ? BOOSTERS_MONEDAS.find((booster) => booster.id === id)
    : COSMETICOS.find((cosmetico) => cosmetico.id === id)

  if (!item) {
    safeAlert("Item invalido.")
    return
  }

  statusEl.textContent = "Procesando compra segura..."
  const resultado = tipo === "booster"
    ? await comprarBooster(usuario, id)
    : tipo === "coin-booster"
      ? await comprarBoosterMonedas(usuario, id)
    : await comprarCosmetico(usuario, id)

  if (!resultado.ok) {
    statusEl.textContent = resultado.message || "No se pudo completar la compra."
    safeAlert(statusEl.textContent)
    if (Number.isFinite(Number(resultado.saldoNuevo))) coinsEl.textContent = `${resultado.saldoNuevo} monedas`
    return
  } else {
    statusEl.textContent = "Compra activada."
  }

  await renderTienda()
}

async function comprarVipConMonedas(planId) {
  const usuario = usuarioActual()
  const plan = PLANES_VIP.find((item) => item.id === planId)

  if (!usuario) {
    safeAlert("Primero entra a un juego con tu apodo.")
    return
  }

  if (!plan) {
    safeAlert("Plan VIP invalido.")
    return
  }

  const ok = await confirmAction(`Comprar ${plan.nombre} por ${plan.precio.toLocaleString("es-CO")} monedas?`, {
    title: "Comprar VIP",
    acceptText: "Comprar",
    cancelText: "Cancelar",
    danger: false,
  })
  if (!ok) return

  statusEl.textContent = "Activando membresia VIP..."
  const resultado = await comprarMembresiaVip(usuario, plan.id)

  if (!resultado.ok) {
    statusEl.textContent = resultado.message || "No se pudo activar VIP."
    safeAlert(statusEl.textContent)
    if (Number.isFinite(Number(resultado.saldoNuevo))) coinsEl.textContent = `${resultado.saldoNuevo} monedas`
    return
  }

  clearVipStatusCache()
  statusEl.textContent = resultado.alreadyPermanent
    ? "Ya tienes VIP permanente activo."
    : "Membresia VIP activada."
  await renderTienda()
}

async function comprarConWompi(producto) {
  const usuario = usuarioActual()
  if (!usuario) {
    safeAlert("Primero entra a un juego con tu apodo.")
    return
  }

  statusEl.textContent = "Creando pago seguro con Wompi..."
  const resultado = await abrirCheckoutWompi(producto)
  if (!resultado.ok) {
    statusEl.textContent = resultado.mensaje || "No se pudo iniciar el pago con Wompi."
    safeAlert(statusEl.textContent)
  }
}

async function actualizarBoosterActivo() {
  const usuario = usuarioActual()
  const [xpActivo, monedasActivo] = await Promise.all([
    obtenerBoosterActivo(usuario),
    obtenerBoosterMonedasActivo(usuario),
  ])
  const estados = []
  if (xpActivo) estados.push(`XP x${formatearMultiplicador(xpActivo.multiplicador)} ${tiempoRestante(xpActivo.fecha_fin)}`)
  if (monedasActivo) estados.push(`Monedas x${formatearMultiplicador(monedasActivo.multiplicador)} ${tiempoRestante(monedasActivo.fecha_fin)}`)
  activeEl.textContent = estados.length ? `Activo: ${estados.join(" | ")}` : "Sin booster activo"
}

function duracionLabel(ms) {
  const horas = Math.round(ms / 3600000)
  if (horas < 24) return `${horas} horas`
  const dias = Math.round(ms / 86400000)
  if (dias >= 1) return dias === 1 ? "24 horas" : `${dias} dias`
  return "Temporal"
}

initStore()
