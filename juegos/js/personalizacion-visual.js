import { obtenerCosmeticoEquipado } from "./tienda.js"
import {
  aplicarFondoCosmetico as aplicarFondoCosmeticoReal,
  instalarEstilosFondosCosmeticos,
  limpiarFondoCosmetico,
} from "./fondos-cosmeticos.js"
import {
  aplicarIdCosmetico,
  aplicarIdCosmeticoNombre,
  aplicarMarcoCosmetico,
  instalarEstilosIdentidadCosmeticos,
  limpiarIdCosmetico,
  limpiarMarcoCosmetico,
} from "./identidad-cosmeticos.js"

const solicitudesPersonalizacion = new WeakMap()

export async function aplicarPersonalizacionUsuario(elemento, usuario) {
  if (!elemento || !usuario) return

  const solicitud = (solicitudesPersonalizacion.get(elemento) || 0) + 1
  solicitudesPersonalizacion.set(elemento, solicitud)
  const esChat = elemento.classList.contains("chat-message") || elemento.classList.contains("chat-conversation")
  if (esChat) {
    limpiarPersonalizacion(elemento)
    return
  }

  const esPerfil = elemento.classList.contains("profile-card") || elemento.classList.contains("hero") || elemento.classList.contains("season-pass")
  const fondo = esPerfil ? await obtenerCosmeticoEquipado(usuario, "fondo") : null
  const marco = esPerfil ? await obtenerCosmeticoEquipado(usuario, "marco") : null
  const identificador = await obtenerCosmeticoEquipado(usuario, "id")
  const cosmetico = fondo || marco || identificador

  if (solicitudesPersonalizacion.get(elemento) !== solicitud) return
  limpiarPersonalizacion(elemento)
  if (!cosmetico) return

  if (!esPerfil) {
    const nombre = elemento.matches("[data-usuario-nombre], .ranking-user, strong, h3")
      ? elemento
      : elemento.querySelector("[data-usuario-nombre], .ranking-user, strong, h3")
    if (nombre) aplicarIdCosmeticoNombre(nombre, identificador)
    return
  }

  const rareza = claseRareza(cosmetico.rareza_visual || cosmetico.rareza)
  elemento.classList.add("cosmetic-card", `rarity-${rareza}`)
  elemento.dataset.cosmeticId = cosmetico.cosmetico_id || ""
  if (identificador) elemento.dataset.cosmeticTag = identificador.cosmetico_id || identificador.id || ""

  if (fondo && esPerfil) aplicarFondoCosmetico(elemento, fondo)
  if (marco && esPerfil) aplicarMarcoCosmetico(elemento, marco)
  if (identificador && esPerfil) aplicarIdCosmetico(elemento, identificador)
}

export function instalarEstilosPersonalizacion() {
  instalarEstilosFondosCosmeticos()
  instalarEstilosIdentidadCosmeticos()
  if (document.querySelector("[data-personalizacion-visual]")) return
  const style = document.createElement("style")
  style.dataset.personalizacionVisual = "true"
  style.textContent = `
    .cosmetic-card{ position:relative; overflow:hidden; }
    .cosmetic-card:not(.hero):not(.season-pass)::after{
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      border-radius:inherit;
      border:1px solid rgba(255,255,255,0.24);
      box-shadow:inset 0 0 28px rgba(255,255,255,0.08);
    }
    .rarity-normal{ background-image:linear-gradient(135deg, rgba(148,163,184,0.16), transparent); }
    .rarity-poco-comun{ background-image:linear-gradient(135deg, rgba(34,197,94,0.2), transparent); }
    .rarity-raro{ background-image:linear-gradient(135deg, rgba(56,189,248,0.22), transparent); }
    .rarity-epico{ background-image:linear-gradient(135deg, rgba(168,85,247,0.26), transparent); }
    .rarity-legendario{ background-image:linear-gradient(135deg, rgba(250,204,21,0.28), transparent); }
    .rarity-mitico{ background-image:linear-gradient(135deg, rgba(244,63,94,0.24), rgba(20,184,166,0.16)); }
    .perfil-fondo-equipado{
      isolation:isolate;
      box-shadow:
        0 22px 60px rgba(0,0,0,0.42),
        0 0 calc(var(--cosmetic-glow, 28) * 1px) hsl(var(--fondo-accent, 190) 92% 58% / 0.16),
        inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .season-pass.perfil-fondo-equipado{
      background:linear-gradient(145deg, rgba(2,6,23,0.82), rgba(15,23,42,0.94)) !important;
    }
    .perfil-marco-equipado{
      border-color:hsl(var(--cosmetic-marco-hue, 204) 92% 62% / 0.48) !important;
      box-shadow:
        0 22px 60px rgba(0,0,0,0.42),
        0 0 calc(var(--cosmetic-marco-glow, 28) * 1px) hsl(var(--cosmetic-marco-hue, 204) 92% 58% / 0.16),
        inset 0 0 0 1px hsl(var(--cosmetic-marco-accent, 280) 92% 64% / 0.2);
    }
  `
  document.head.appendChild(style)
}

function limpiarPersonalizacion(elemento) {
  limpiarFondoCosmetico(elemento)
  limpiarMarcoCosmetico(elemento)
  limpiarIdCosmetico(elemento)
  elemento.classList.remove(
    "cosmetic-card",
    "perfil-fondo-equipado",
    "perfil-marco-equipado",
    "rarity-normal",
    "rarity-poco-comun",
    "rarity-raro",
    "rarity-epico",
    "rarity-legendario",
    "rarity-mitico",
    "rarity-prohibido",
  )
  elemento.style.removeProperty("--cosmetic-hue")
  elemento.style.removeProperty("--cosmetic-accent")
  elemento.style.removeProperty("--cosmetic-glow")
  elemento.style.removeProperty("--cosmetic-marco-hue")
  elemento.style.removeProperty("--cosmetic-marco-accent")
  elemento.style.removeProperty("--cosmetic-marco-glow")
  delete elemento.dataset.cosmeticId
  delete elemento.dataset.cosmeticTag
}

function aplicarFondoCosmetico(elemento, cosmetico) {
  const brillo = Number(cosmetico?.diseno?.brillo || 5)
  const contexto = elemento.classList.contains("season-pass") ? "panel" : "perfil"
  aplicarFondoCosmeticoReal(elemento, cosmetico, contexto)
  elemento.style.setProperty("--cosmetic-glow", String(18 + brillo * 3))
}

function claseRareza(rareza) {
  return String(rareza || "normal")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
}
