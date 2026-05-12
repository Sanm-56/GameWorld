import { obtenerCosmeticoEquipado } from "./tienda.js"

const solicitudesPersonalizacion = new WeakMap()

export async function aplicarPersonalizacionUsuario(elemento, usuario) {
  if (!elemento || !usuario) return

  const solicitud = (solicitudesPersonalizacion.get(elemento) || 0) + 1
  solicitudesPersonalizacion.set(elemento, solicitud)
  const esPerfil = elemento.classList.contains("profile-card") || elemento.classList.contains("hero") || elemento.classList.contains("season-pass")
  const fondo = await obtenerCosmeticoEquipado(usuario, "fondo")
  const marco = esPerfil ? await obtenerCosmeticoEquipado(usuario, "marco") : null
  const identificador = esPerfil ? await obtenerCosmeticoEquipado(usuario, "id") : null
  const cosmetico = fondo || marco || identificador

  if (solicitudesPersonalizacion.get(elemento) !== solicitud) return
  limpiarPersonalizacion(elemento)
  if (!cosmetico) return

  const rareza = claseRareza(cosmetico.rareza_visual || cosmetico.rareza)
  elemento.classList.add("cosmetic-card", `rarity-${rareza}`)
  elemento.dataset.cosmeticId = cosmetico.cosmetico_id || ""
  if (identificador) elemento.dataset.cosmeticTag = identificador.cosmetico_id || identificador.id || ""

  if (fondo && esPerfil) aplicarFondoCosmetico(elemento, fondo)
  if (marco && esPerfil) aplicarMarcoCosmetico(elemento, marco)
}

export function instalarEstilosPersonalizacion() {
  if (document.querySelector("[data-personalizacion-visual]")) return
  const style = document.createElement("style")
  style.dataset.personalizacionVisual = "true"
  style.textContent = `
    .cosmetic-card{ position:relative; overflow:hidden; }
    .cosmetic-card::after{
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
      background-image:
        radial-gradient(circle at 16% 14%, hsl(var(--cosmetic-hue, 204) 92% 58% / 0.28), transparent 34%),
        radial-gradient(circle at 82% 20%, hsl(var(--cosmetic-accent, 280) 92% 62% / 0.18), transparent 32%),
        linear-gradient(135deg, hsl(var(--cosmetic-hue, 204) 64% 18% / 0.9), rgba(2,6,23,0.96) 58%, hsl(var(--cosmetic-accent, 280) 70% 14% / 0.82));
      box-shadow:
        0 22px 60px rgba(0,0,0,0.42),
        0 0 calc(var(--cosmetic-glow, 28) * 1px) hsl(var(--cosmetic-hue, 204) 92% 58% / 0.16),
        inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .hero.profile-card.perfil-fondo-equipado,
    .hero.profile-card.perfil-fondo-equipado[data-rank-tier],
    .hero.profile-card.perfil-fondo-equipado[data-rank-tier^="advanced-"],
    .hero.profile-card.perfil-fondo-equipado[data-rank-tier^="entity-"],
    .hero.profile-card.perfil-fondo-equipado[data-rank-tier^="rupture-"],
    .hero.profile-card.perfil-fondo-equipado[data-rank-tier^="lawless-"],
    .hero.profile-card.perfil-fondo-equipado[data-rank-tier^="final-"]{
      background:
        radial-gradient(circle at 16% 14%, hsl(var(--cosmetic-hue, 204) 92% 58% / 0.28), transparent 34%),
        radial-gradient(circle at 82% 20%, hsl(var(--cosmetic-accent, 280) 92% 62% / 0.18), transparent 32%),
        linear-gradient(135deg, hsl(var(--cosmetic-hue, 204) 64% 18% / 0.9), rgba(2,6,23,0.96) 58%, hsl(var(--cosmetic-accent, 280) 70% 14% / 0.82));
    }
    .season-pass.perfil-fondo-equipado{
      background:
        radial-gradient(circle at 16% 14%, hsl(var(--cosmetic-hue, 204) 92% 58% / 0.28), transparent 34%),
        radial-gradient(circle at 82% 20%, hsl(var(--cosmetic-accent, 280) 92% 62% / 0.18), transparent 32%),
        linear-gradient(135deg, hsl(var(--cosmetic-hue, 204) 64% 18% / 0.9), rgba(2,6,23,0.96) 58%, hsl(var(--cosmetic-accent, 280) 70% 14% / 0.82)) !important;
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
  const fondo = cosmetico?.diseno?.fondo || {}
  const brillo = Number(cosmetico?.diseno?.brillo || 5)
  elemento.classList.add("perfil-fondo-equipado")
  elemento.style.setProperty("--cosmetic-hue", String(fondo.hue || 204))
  elemento.style.setProperty("--cosmetic-accent", String(fondo.accent || 280))
  elemento.style.setProperty("--cosmetic-glow", String(18 + brillo * 3))
}

function aplicarMarcoCosmetico(elemento, cosmetico) {
  const marco = cosmetico?.diseno?.marco || {}
  const brillo = Number(cosmetico?.diseno?.brillo || 5)
  elemento.classList.add("perfil-marco-equipado")
  elemento.style.setProperty("--cosmetic-marco-hue", String(marco.hue || 204))
  elemento.style.setProperty("--cosmetic-marco-accent", String(marco.accent || 280))
  elemento.style.setProperty("--cosmetic-marco-glow", String(16 + brillo * 3))
}

function claseRareza(rareza) {
  return String(rareza || "normal")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
}
