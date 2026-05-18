import { canAccessVipGame } from "./vip.js"
import { escapeHtml, safeAlert } from "./mensajes.js"
import { VIP_GAME_TYPES } from "./vip-results.js"

export const VIP_GAMES = [
  {
    key: "reflejos-vip",
    title: "Reflejos VIP",
    detail: "Reto premium de precision, combo y velocidad exclusivo para miembros VIP.",
    url: "juegos/vip/reflejos/index.html",
    badge: "Juego",
    status: "available",
    type: VIP_GAME_TYPES.EXCLUSIVE,
    isVipOnly: true,
    category: "vip",
    origin: "vip",
    writesNormalRanking: false,
  },
  {
    key: "bingo-vip",
    title: "Bingo Online VIP",
    detail: "Sala VIP con carton automatico, numeros cantados, marcado valido y reclamo de bingo.",
    url: "juegos/vip/bingo/index.html",
    badge: "Online",
    status: "available",
    type: VIP_GAME_TYPES.EXCLUSIVE,
    isVipOnly: true,
    category: "vip",
    origin: "vip",
    writesNormalRanking: false,
  },
  {
    key: "ruleta-vip",
    title: "Ruleta de Premios VIP",
    detail: "Recompensas internas con cooldown. Se implementa en la Fase 4.",
    url: "",
    badge: "Fase 4",
    status: "coming-soon",
    type: VIP_GAME_TYPES.COMING_SOON,
    isVipOnly: true,
    category: "vip",
    origin: "vip",
    writesNormalRanking: false,
  },
]

export function getVipGamesByType(type) {
  return VIP_GAMES.filter((game) => game.isVipOnly && game.category === "vip" && game.type === type)
}

export function getVipGame(key) {
  return VIP_GAMES.find((game) => game.key === key && game.isVipOnly && game.category === "vip") || null
}

export async function openVipGame(key) {
  const game = getVipGame(key)
  if (!game) {
    await safeAlert("Juego VIP no disponible.")
    return false
  }

  if (game.status !== "available" || !game.url) {
    await safeAlert(`${game.title} estara disponible en una proxima fase.`)
    return false
  }

  if (!await canAccessVipGame()) return false

  localStorage.setItem("vip_game_launch", JSON.stringify({
    game: game.key,
    launchedAt: new Date().toISOString(),
  }))
  window.location.href = game.url
  return true
}

export function renderVipGames(container) {
  if (!container) return
  container.innerHTML = VIP_GAMES.map((game) => `
    <article class="vip-game-card${game.status !== "available" ? " locked" : ""}">
      <div>
        <span class="vip-game-badge">${escapeHtml(game.badge)}</span>
        <strong>${escapeHtml(game.title)}</strong>
        <p>${escapeHtml(game.detail)}</p>
      </div>
      <button class="vip-button ${game.status === "available" ? "primary" : ""}" type="button" data-vip-game="${escapeHtml(game.key)}">
        ${game.status === "available" ? "Jugar" : "Proximamente"}
      </button>
    </article>
  `).join("")

  container.querySelectorAll("[data-vip-game]").forEach((button) => {
    button.addEventListener("click", () => openVipGame(button.dataset.vipGame || ""))
  })
}
