import { canAccessVipGame } from "./vip.js"
import { escapeHtml, safeAlert } from "./mensajes.js"

export const VIP_GAMES = [
  {
    key: "reflejos-vip",
    title: "Reflejos VIP",
    detail: "Reto rapido exclusivo para probar la categoria VIP.",
    url: "juegos/vip/reflejos/index.html",
    badge: "Juego",
    status: "available",
    isVipOnly: true,
    category: "vip",
  },
  {
    key: "bingo-vip",
    title: "Bingo Online VIP",
    detail: "Lobby y cartones premium. Se implementa en la Fase 3.",
    url: "",
    badge: "Fase 3",
    status: "coming-soon",
    isVipOnly: true,
    category: "vip",
  },
  {
    key: "ruleta-vip",
    title: "Ruleta de Premios VIP",
    detail: "Recompensas internas con cooldown. Se implementa en la Fase 4.",
    url: "",
    badge: "Fase 4",
    status: "coming-soon",
    isVipOnly: true,
    category: "vip",
  },
]

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
