import { obtenerCosmeticoEquipado } from "./tienda.js"

export async function aplicarPersonalizacionUsuario(elemento, usuario) {
  if (!elemento || !usuario) return

  const cosmetico = await obtenerCosmeticoEquipado(usuario)
  if (!cosmetico) return

  elemento.classList.add("cosmetic-card", `rarity-${String(cosmetico.rareza || "normal").toLowerCase()}`)
  elemento.dataset.cosmeticId = cosmetico.cosmetico_id || ""
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
    .rarity-raro{ background-image:linear-gradient(135deg, rgba(56,189,248,0.22), transparent); }
    .rarity-epico{ background-image:linear-gradient(135deg, rgba(168,85,247,0.26), transparent); }
    .rarity-legendario{ background-image:linear-gradient(135deg, rgba(250,204,21,0.28), transparent); }
    .rarity-mitico{ background-image:linear-gradient(135deg, rgba(244,63,94,0.24), rgba(20,184,166,0.16)); }
  `
  document.head.appendChild(style)
}
