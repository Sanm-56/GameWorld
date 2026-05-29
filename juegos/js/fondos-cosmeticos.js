const CONTEXTOS_FONDO = {
  preview: {
    clase: "fondo-contexto-preview",
    minHeight: "148px",
    artMinHeight: "106px",
    markOpacity: "1",
    overlayOpacity: "1",
    label: "BG",
  },
  compacto: {
    clase: "fondo-contexto-compacto",
    minHeight: "58px",
    artMinHeight: "42px",
    markOpacity: "0.72",
    overlayOpacity: "0.72",
    label: "",
  },
  perfil: {
    clase: "fondo-contexto-perfil",
    minHeight: "100%",
    artMinHeight: "100%",
    markOpacity: "0.74",
    overlayOpacity: "0.62",
    label: "",
  },
  panel: {
    clase: "fondo-contexto-panel",
    minHeight: "100%",
    artMinHeight: "100%",
    markOpacity: "0.46",
    overlayOpacity: "0.44",
    label: "",
  },
}

const CLASES_FONDO = [
  "perfil-fondo-equipado",
  "fondo-cosmetico",
  "cosmetic-fondo",
  "fondo-contexto-preview",
  "fondo-contexto-compacto",
  "fondo-contexto-perfil",
  "fondo-contexto-panel",
]

const PREFIJOS_FONDO = [
  "rarity-",
  "fondo-layout-",
  "fondo-textura-",
  "fondo-simbolo-",
  "fondo-panel-",
  "fondo-energia-",
  "fondo-fractura-",
  "fondo-reliquia-",
]

const VARIABLES_FONDO = [
  "--fondo-hue",
  "--fondo-accent",
  "--fondo-luz",
  "--fondo-depth",
  "--fondo-x",
  "--fondo-y",
  "--fondo-angle",
  "--fondo-min-height",
  "--fondo-art-min-height",
  "--fondo-mark-opacity",
  "--fondo-overlay-opacity",
]

export function esFondoCosmetico(cosmetico) {
  return normalizarTipoCosmetico(cosmetico) === "fondo" && Boolean(cosmetico?.diseno?.fondo)
}

export function claseRarezaFondo(rareza) {
  return String(rareza || "normal")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "normal"
}

export function clasesFondoCosmetico(cosmetico, contexto = "preview") {
  if (!esFondoCosmetico(cosmetico)) return ""

  const fondo = cosmetico.diseno.fondo
  const contextoConfig = obtenerContextoFondo(contexto)
  const rareza = claseRarezaFondo(cosmetico.rareza_visual || cosmetico.rareza)
  return [
    "fondo-cosmetico",
    "cosmetic-fondo",
    contextoConfig.clase,
    `rarity-${rareza}`,
    claseNumerica("fondo-layout", fondo.layout),
    claseNumerica("fondo-textura", fondo.textura),
    claseNumerica("fondo-simbolo", fondo.simbolo),
    claseNumerica("fondo-panel", fondo.panel),
    claseNumerica("fondo-energia", fondo.energia),
    claseNumerica("fondo-fractura", fondo.fractura),
    claseNumerica("fondo-reliquia", fondo.reliquia),
  ].filter(Boolean).join(" ")
}

export function variablesFondoCosmetico(cosmetico, contexto = "preview") {
  if (!esFondoCosmetico(cosmetico)) return {}

  const fondo = cosmetico.diseno.fondo
  const contextoConfig = obtenerContextoFondo(contexto)
  return {
    "--fondo-hue": numeroCss(fondo.hue, 200),
    "--fondo-accent": numeroCss(fondo.accent, 190),
    "--fondo-luz": `${numeroCss(fondo.luz, 18)}%`,
    "--fondo-depth": `${numeroCss(fondo.profundidad, 36)}%`,
    "--fondo-x": `${numeroCss(fondo.focoX, 50)}%`,
    "--fondo-y": `${numeroCss(fondo.focoY, 40)}%`,
    "--fondo-angle": `${numeroCss(fondo.angulo, 0)}deg`,
    "--fondo-min-height": contextoConfig.minHeight,
    "--fondo-art-min-height": contextoConfig.artMinHeight,
    "--fondo-mark-opacity": contextoConfig.markOpacity,
    "--fondo-overlay-opacity": contextoConfig.overlayOpacity,
  }
}

export function estiloFondoCosmetico(cosmetico, contexto = "preview") {
  const variables = variablesFondoCosmetico(cosmetico, contexto)
  return Object.entries(variables)
    .map(([name, value]) => `${name}:${value}`)
    .join(";")
}

export function renderPreviewFondoCosmetico(cosmetico, contexto = "preview", opciones = {}) {
  if (!esFondoCosmetico(cosmetico)) return ""

  const contextoConfig = obtenerContextoFondo(contexto)
  const clases = clasesFondoCosmetico(cosmetico, contexto)
  const estilo = estiloFondoCosmetico(cosmetico, contexto)
  const etiqueta = opciones.etiqueta ?? contextoConfig.label
  const ariaHidden = opciones.ariaHidden === false ? "" : ' aria-hidden="true"'

  return `
    <div class="${clases}" style="${estilo}"${ariaHidden}>
      <div class="cosmetic-preview">
        <div class="cosmetic-art">
          ${etiqueta ? `<span class="cosmetic-art-code">${escapeHtml(etiqueta)}</span>` : ""}
          <span class="cosmetic-art-mark"></span>
        </div>
      </div>
    </div>
  `
}

export function aplicarFondoCosmetico(elemento, cosmetico, contexto = "perfil") {
  if (!elemento || !esFondoCosmetico(cosmetico)) return false

  limpiarFondoCosmetico(elemento)
  elemento.classList.add("perfil-fondo-equipado", ...clasesFondoCosmetico(cosmetico, contexto).split(/\s+/).filter(Boolean))
  Object.entries(variablesFondoCosmetico(cosmetico, contexto)).forEach(([name, value]) => {
    elemento.style.setProperty(name, value)
  })
  elemento.dataset.fondoCosmeticoId = cosmetico.cosmetico_id || cosmetico.id || ""
  elemento.dataset.fondoCosmeticoContexto = contexto
  if (contexto === "perfil" || contexto === "panel") {
    elemento.prepend(crearCapaFondoCosmetico())
  }
  return true
}

export function limpiarFondoCosmetico(elemento) {
  if (!elemento) return

  elemento.querySelectorAll(":scope > [data-fondo-cosmetico-layer]").forEach((capa) => capa.remove())
  elemento.classList.remove(...CLASES_FONDO)
  ;[...elemento.classList].forEach((clase) => {
    if (PREFIJOS_FONDO.some((prefijo) => clase.startsWith(prefijo))) {
      elemento.classList.remove(clase)
    }
  })
  VARIABLES_FONDO.forEach((variable) => elemento.style.removeProperty(variable))
  delete elemento.dataset.fondoCosmeticoId
  delete elemento.dataset.fondoCosmeticoContexto
}

export function instalarEstilosFondosCosmeticos({ href = new URL("../css/fondos-cosmeticos.css", import.meta.url).href } = {}) {
  if (typeof document === "undefined") return null
  const absoluto = new URL(href, document.baseURI).href
  const existente = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find((link) => link.dataset.fondosCosmeticos === "true" || link.href === absoluto)
  if (existente) return existente

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.dataset.fondosCosmeticos = "true"
  document.head.appendChild(link)
  return link
}

function obtenerContextoFondo(contexto) {
  return CONTEXTOS_FONDO[contexto] || CONTEXTOS_FONDO.preview
}

function normalizarTipoCosmetico(cosmetico) {
  return String(cosmetico?.tipo || "").trim().toLowerCase()
}

function claseNumerica(prefijo, valor) {
  if (valor === undefined || valor === null || valor === "") return ""
  return `${prefijo}-${Math.max(0, Math.trunc(Number(valor) || 0))}`
}

function numeroCss(valor, fallback) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : fallback
}

function crearCapaFondoCosmetico() {
  const preview = document.createElement("div")
  preview.className = "cosmetic-preview"
  preview.dataset.fondoCosmeticoLayer = "true"
  preview.setAttribute("aria-hidden", "true")
  preview.innerHTML = '<div class="cosmetic-art"><span class="cosmetic-art-mark"></span></div>'
  return preview
}

function escapeHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
