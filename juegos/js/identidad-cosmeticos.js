const CONTEXTOS_IDENTIDAD = {
  preview: { clase: "identidad-contexto-preview", labelId: "ID", labelMarco: "MR" },
  compacto: { clase: "identidad-contexto-compacto", labelId: "ID", labelMarco: "MR" },
  perfil: { clase: "identidad-contexto-perfil", labelId: "ID", labelMarco: "" },
}

const PREFIJOS_IDENTIDAD = [
  "rarity-",
  "id-shape-",
  "id-form-",
  "id-size-",
  "id-cut-",
  "id-plate-",
  "id-corner-",
  "id-border-",
  "id-line-",
  "id-panel-",
  "id-symbol-",
  "id-geo-",
  "id-texture-",
  "id-reflect-",
  "id-energy-",
  "id-pulse-",
  "marco-struct-",
  "marco-corner-",
  "marco-border-",
  "marco-line-",
  "marco-panel-",
  "marco-texture-",
  "marco-cut-",
  "marco-pulse-",
  "marco-glyph-",
  "marco-aura-",
  "marco-relic-",
  "marco-anomaly-",
]

const VARIABLES_IDENTIDAD = [
  "--id-hue",
  "--id-accent",
  "--id-luz",
  "--id-depth",
  "--id-angle",
  "--id-x",
  "--id-y",
  "--id-clip",
  "--id-radius",
  "--id-border-width",
  "--id-line-alpha",
  "--id-panel-alpha",
  "--id-mark-size",
  "--id-glow",
  "--id-pulse-duration",
  "--marco-hue",
  "--marco-accent",
  "--marco-luz",
  "--marco-depth",
  "--marco-angle",
  "--marco-clip",
  "--marco-radius",
  "--marco-border-width",
  "--marco-line-alpha",
  "--marco-panel-alpha",
  "--marco-glow",
  "--marco-mark-size",
  "--marco-anomaly-angle",
  "--marco-pulse-duration",
  "--cosmetic-marco-hue",
  "--cosmetic-marco-accent",
  "--cosmetic-marco-glow",
]

const ID_CLIPS = [
  "polygon(8% 0,92% 0,100% 28%,94% 100%,6% 100%,0 28%)",
  "polygon(0 0,84% 0,100% 34%,92% 100%,12% 100%,0 74%)",
  "polygon(14% 0,100% 0,100% 72%,84% 100%,0 100%,0 24%)",
  "polygon(0 18%,18% 0,82% 0,100% 18%,88% 50%,100% 82%,82% 100%,18% 100%,0 82%,12% 50%)",
  "polygon(10% 0,90% 0,90% 16%,100% 16%,100% 84%,90% 84%,90% 100%,10% 100%,10% 84%,0 84%,0 16%,10% 16%)",
  "polygon(12% 0,88% 0,100% 50%,88% 100%,12% 100%,0 50%)",
]

const MARCO_CLIPS = [
  "polygon(8% 0,92% 0,100% 16%,100% 84%,92% 100%,8% 100%,0 84%,0 16%)",
  "polygon(0 0,82% 0,100% 24%,92% 100%,14% 100%,0 74%)",
  "polygon(14% 0,100% 0,100% 70%,84% 100%,0 100%,0 24%)",
  "polygon(0 16%,16% 0,84% 0,100% 16%,86% 50%,100% 84%,84% 100%,16% 100%,0 84%,14% 50%)",
  "polygon(12% 0,88% 0,88% 14%,100% 14%,100% 86%,88% 86%,88% 100%,12% 100%,12% 86%,0 86%,0 14%,12% 14%)",
  "polygon(0 22%,22% 0,78% 0,100% 22%,100% 78%,78% 100%,22% 100%,0 78%)",
]

export function esIdentidadCosmetico(cosmetico) {
  return esIdCosmetico(cosmetico) || esMarcoCosmetico(cosmetico)
}

export function esIdCosmetico(cosmetico) {
  return normalizarTipoCosmetico(cosmetico) === "id" && Boolean(cosmetico?.diseno?.id)
}

export function esMarcoCosmetico(cosmetico) {
  return normalizarTipoCosmetico(cosmetico) === "marco" && Boolean(cosmetico?.diseno?.marco)
}

export function clasesIdentidadCosmetico(cosmetico, contexto = "preview") {
  if (!esIdentidadCosmetico(cosmetico)) return ""

  const contextoConfig = obtenerContextoIdentidad(contexto)
  const rareza = claseRareza(cosmetico.rareza_visual || cosmetico.rareza)
  if (esIdCosmetico(cosmetico)) {
    const id = cosmetico.diseno.id
    return [
      "identidad-cosmetico",
      "identidad-id",
      "cosmetic-id",
      contextoConfig.clase,
      `rarity-${rareza}`,
      claseNumerica("id-shape", id.silueta),
      claseNumerica("id-form", id.forma),
      claseNumerica("id-size", id.tamano),
      claseNumerica("id-cut", id.corte),
      claseNumerica("id-plate", id.placa),
      claseNumerica("id-corner", id.esquina),
      claseNumerica("id-border", id.borde),
      claseNumerica("id-line", id.linea),
      claseNumerica("id-panel", id.panel),
      claseNumerica("id-symbol", id.simbolo),
      claseNumerica("id-geo", id.geometria),
      claseNumerica("id-texture", id.textura),
      claseNumerica("id-reflect", id.reflejo),
      claseNumerica("id-energy", id.energia),
      claseNumerica("id-pulse", id.pulso),
    ].filter(Boolean).join(" ")
  }

  const marco = cosmetico.diseno.marco
  return [
    "identidad-cosmetico",
    "identidad-marco",
    "cosmetic-marco",
    contextoConfig.clase,
    `rarity-${rareza}`,
    claseNumerica("marco-struct", marco.estructura),
    claseNumerica("marco-corner", marco.esquina),
    claseNumerica("marco-border", marco.borde),
    claseNumerica("marco-line", marco.linea),
    claseNumerica("marco-panel", marco.panel),
    claseNumerica("marco-texture", marco.textura),
    claseNumerica("marco-cut", marco.corte),
    claseNumerica("marco-pulse", marco.pulso),
    claseNumerica("marco-glyph", marco.glifo),
    claseNumerica("marco-aura", marco.aura),
    claseNumerica("marco-relic", marco.reliquia),
    claseNumerica("marco-anomaly", marco.anomalia),
  ].filter(Boolean).join(" ")
}

export function variablesIdentidadCosmetico(cosmetico) {
  if (esIdCosmetico(cosmetico)) {
    const id = cosmetico.diseno.id
    return {
      "--id-hue": numeroCss(id.hue, 210),
      "--id-accent": numeroCss(id.accent, 190),
      "--id-luz": `${numeroCss(id.luz, 24)}%`,
      "--id-depth": `${numeroCss(id.profundidad, 36)}%`,
      "--id-angle": `${numeroCss((entero(id.silueta) * 19 + entero(id.linea) * 13 + entero(id.reflejo) * 11) % 360, 0)}deg`,
      "--id-x": `${16 + ((entero(id.placa) * 7 + entero(id.simbolo) * 5) % 68)}%`,
      "--id-y": `${18 + ((entero(id.panel) * 11 + entero(id.textura) * 3) % 58)}%`,
      "--id-clip": ID_CLIPS[(entero(id.silueta) + entero(id.corte)) % ID_CLIPS.length],
      "--id-radius": `${2 + ((entero(id.forma) + entero(id.esquina)) % 11)}px`,
      "--id-border-width": `${1 + (entero(id.borde) % 3)}px`,
      "--id-line-alpha": String(0.18 + ((entero(id.linea) + entero(id.reflejo)) % 6) * 0.07),
      "--id-panel-alpha": String(0.2 + ((entero(id.panel) + entero(id.textura)) % 5) * 0.07),
      "--id-mark-size": `${12 + ((entero(id.simbolo) + entero(id.geometria)) % 22)}px`,
      "--id-glow": `${10 + ((entero(id.energia) + entero(id.tamano)) % 26)}px`,
      "--id-pulse-duration": `${2.4 + (entero(id.pulso) % 6) * 0.45}s`,
    }
  }

  if (!esMarcoCosmetico(cosmetico)) return {}
  const marco = cosmetico.diseno.marco
  const brillo = numeroCss(cosmetico?.diseno?.brillo, 5)
  return {
    "--marco-hue": numeroCss(marco.hue, 204),
    "--marco-accent": numeroCss(marco.accent, 190),
    "--marco-luz": `${numeroCss(marco.luz, 24)}%`,
    "--marco-depth": `${numeroCss(marco.profundidad, 36)}%`,
    "--marco-angle": `${numeroCss((entero(marco.estructura) * 23 + entero(marco.linea) * 17) % 360, 0)}deg`,
    "--marco-clip": MARCO_CLIPS[(entero(marco.estructura) + entero(marco.corte)) % MARCO_CLIPS.length],
    "--marco-radius": `${3 + ((entero(marco.esquina) + entero(marco.panel)) % 13)}px`,
    "--marco-border-width": `${1 + (entero(marco.borde) % 3)}px`,
    "--marco-line-alpha": String(0.2 + ((entero(marco.linea) + entero(marco.textura)) % 6) * 0.07),
    "--marco-panel-alpha": String(0.18 + ((entero(marco.panel) + entero(marco.reliquia)) % 5) * 0.07),
    "--marco-glow": `${12 + ((entero(marco.aura) + entero(marco.glifo)) % 28)}px`,
    "--marco-mark-size": `${12 + ((entero(marco.glifo) + entero(marco.reliquia)) % 24)}px`,
    "--marco-anomaly-angle": `${-2 + (entero(marco.anomalia) % 5)}deg`,
    "--marco-pulse-duration": `${2.8 + (entero(marco.pulso) % 6) * 0.45}s`,
    "--cosmetic-marco-hue": numeroCss(marco.hue, 204),
    "--cosmetic-marco-accent": numeroCss(marco.accent, 280),
    "--cosmetic-marco-glow": 16 + brillo * 3,
  }
}

export function estiloIdentidadCosmetico(cosmetico) {
  return Object.entries(variablesIdentidadCosmetico(cosmetico))
    .map(([name, value]) => `${name}:${value}`)
    .join(";")
}

export function renderPreviewIdentidadCosmetico(cosmetico, contexto = "preview", opciones = {}) {
  if (!esIdentidadCosmetico(cosmetico)) return ""

  const contextoConfig = obtenerContextoIdentidad(contexto)
  const etiquetaPredeterminada = esIdCosmetico(cosmetico) ? contextoConfig.labelId : contextoConfig.labelMarco
  const etiqueta = opciones.etiqueta ?? etiquetaPredeterminada
  const ariaHidden = opciones.ariaHidden === false ? "" : ' aria-hidden="true"'
  return `
    <div class="${clasesIdentidadCosmetico(cosmetico, contexto)}" style="${estiloIdentidadCosmetico(cosmetico)}"${ariaHidden}>
      <div class="cosmetic-preview">
        <div class="cosmetic-art">
          ${etiqueta ? `<span class="cosmetic-art-code">${escapeHtml(etiqueta)}</span>` : ""}
          <span class="cosmetic-art-mark"></span>
        </div>
      </div>
    </div>
  `
}

export function aplicarMarcoCosmetico(elemento, cosmetico) {
  if (!elemento || !esMarcoCosmetico(cosmetico)) return false

  limpiarMarcoCosmetico(elemento)
  elemento.classList.add("perfil-marco-equipado")
  aplicarVariables(elemento, variablesIdentidadCosmetico(cosmetico))
  elemento.dataset.marcoCosmeticoId = cosmetico.cosmetico_id || cosmetico.id || ""
  const capa = crearCapaIdentidad(cosmetico, "perfil", "")
  capa.classList.add("perfil-marco-capa")
  capa.dataset.marcoCosmeticoLayer = "true"
  elemento.prepend(capa)
  return true
}

export function aplicarIdCosmetico(elemento, cosmetico) {
  if (!elemento || !esIdCosmetico(cosmetico)) return false

  limpiarIdCosmetico(elemento)
  const nombre = elemento.querySelector("#nombreUsuario")
  if (!nombre) return false

  const capa = crearCapaIdentidad(cosmetico, "perfil", "ID")
  capa.classList.add("perfil-id-capa")
  capa.dataset.idCosmeticoLayer = "true"
  nombre.insertAdjacentElement("afterend", capa)
  elemento.dataset.idCosmeticoId = cosmetico.cosmetico_id || cosmetico.id || ""
  return true
}

export function limpiarMarcoCosmetico(elemento) {
  if (!elemento) return
  elemento.querySelectorAll(":scope > [data-marco-cosmetico-layer]").forEach((capa) => capa.remove())
  elemento.classList.remove("perfil-marco-equipado")
  limpiarVariables(elemento, "--marco-", "--cosmetic-marco-")
  delete elemento.dataset.marcoCosmeticoId
}

export function limpiarIdCosmetico(elemento) {
  if (!elemento) return
  elemento.querySelectorAll("[data-id-cosmetico-layer]").forEach((capa) => capa.remove())
  limpiarVariables(elemento, "--id-")
  delete elemento.dataset.idCosmeticoId
}

export function instalarEstilosIdentidadCosmeticos({ href = new URL("../css/identidad-cosmeticos.css", import.meta.url).href } = {}) {
  if (typeof document === "undefined") return null
  const absoluto = new URL(href, document.baseURI).href
  const existente = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find((link) => link.dataset.identidadCosmeticos === "true" || link.href === absoluto)
  if (existente) return existente

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.dataset.identidadCosmeticos = "true"
  document.head.appendChild(link)
  return link
}

function obtenerContextoIdentidad(contexto) {
  return CONTEXTOS_IDENTIDAD[contexto] || CONTEXTOS_IDENTIDAD.preview
}

function normalizarTipoCosmetico(cosmetico) {
  return String(cosmetico?.tipo || "").trim().toLowerCase()
}

function claseRareza(rareza) {
  return String(rareza || "normal")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "normal"
}

function claseNumerica(prefijo, valor) {
  if (valor === undefined || valor === null || valor === "") return ""
  return `${prefijo}-${entero(valor)}`
}

function entero(valor) {
  return Math.max(0, Math.trunc(Number(valor) || 0))
}

function numeroCss(valor, fallback) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : fallback
}

function aplicarVariables(elemento, variables) {
  Object.entries(variables).forEach(([name, value]) => elemento.style.setProperty(name, value))
}

function limpiarVariables(elemento, ...prefijos) {
  VARIABLES_IDENTIDAD
    .filter((variable) => prefijos.some((prefijo) => variable.startsWith(prefijo)))
    .forEach((variable) => elemento.style.removeProperty(variable))
}

function crearCapaIdentidad(cosmetico, contexto, etiqueta) {
  const capa = document.createElement("div")
  capa.className = clasesIdentidadCosmetico(cosmetico, contexto)
  capa.style.cssText = estiloIdentidadCosmetico(cosmetico)
  capa.setAttribute("aria-hidden", "true")
  capa.innerHTML = `
    <div class="cosmetic-preview">
      <div class="cosmetic-art">
        ${etiqueta ? `<span class="cosmetic-art-code">${escapeHtml(etiqueta)}</span>` : ""}
        <span class="cosmetic-art-mark"></span>
      </div>
    </div>
  `
  return capa
}

function escapeHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
