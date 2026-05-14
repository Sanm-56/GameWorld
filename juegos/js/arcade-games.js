export const ARCADE_GAMES = [
  {
    key: "cricketarcade",
    label: "Cricket Arcade",
    icon: "CR",
    accent: "#22c55e",
    secondary: "#facc15",
    description: "Golpea en el momento justo y encadena tiros perfectos.",
    type: "timing",
  },
  {
    key: "esquivaobstaculos",
    label: "Esquiva Obstaculos",
    icon: "EO",
    accent: "#38bdf8",
    secondary: "#fb7185",
    description: "Muevete entre carriles, esquiva y sobrevive al aumento de velocidad.",
    type: "dodge",
  },
  {
    key: "torreinfinita",
    label: "Torre Infinita",
    icon: "TI",
    accent: "#a78bfa",
    secondary: "#34d399",
    description: "Apila bloques con precision para construir una torre cada vez mas alta.",
    type: "stack",
  },
  {
    key: "subelamontana",
    label: "Sube la Montana",
    icon: "SM",
    accent: "#f59e0b",
    secondary: "#60a5fa",
    description: "Salta plataformas, evita caidas y escala antes de perder impulso.",
    type: "climb",
  },
]

export const ARCADE_GAME_KEYS = ARCADE_GAMES.map((game) => game.key)

export function getArcadeGame(key) {
  return ARCADE_GAMES.find((game) => game.key === key) || ARCADE_GAMES[0]
}

export function isArcadeGame(key) {
  return ARCADE_GAME_KEYS.includes(key)
}
