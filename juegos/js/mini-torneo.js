export function esMiniTorneo(juego) {
  return localStorage.getItem("solitario_origen") === "sala"
    && localStorage.getItem("solitario_sala_id")
    && localStorage.getItem("solitario_juego") === juego
}

function esNivelSolitario(juego) {
  const context = leerContextoNivel()
  return localStorage.getItem("solitario_origen") === "nivel"
    && context
    && context.game === juego
}

export async function obtenerInicioTorneo(supabase, juego) {
  if (esMiniTorneo(juego)) {
    const salaId = localStorage.getItem("solitario_sala_id")
    const { data } = await supabase
      .from("salas")
      .select("estado,juego,inicio_torneo,created_at")
      .eq("id", salaId)
      .maybeSingle()

    if (data?.estado !== "en_juego" || data?.juego !== juego) return null
    return data.inicio_torneo || data.created_at || new Date().toISOString()
  }

  if (esNivelSolitario(juego)) {
    return leerContextoNivel()?.startedAt || new Date().toISOString()
  }

  const { data } = await supabase
    .from("estado_torneo")
    .select("inicio_torneo")
    .eq("id", 1)
    .single()

  return data?.inicio_torneo || null
}

export async function debeSalirDelTorneo(supabase, juego) {
  if (esMiniTorneo(juego)) {
    const salaId = localStorage.getItem("solitario_sala_id")
    const { data } = await supabase
      .from("salas")
      .select("estado,juego")
      .eq("id", salaId)
      .maybeSingle()

    return !data || data.juego !== juego || data.estado === "finalizado"
  }

  if (esNivelSolitario(juego)) return false

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  return data?.estado === "espera"
}

export function salidaTorneoUrl() {
  if (esNivelSolitario(localStorage.getItem("solitario_juego"))) {
    return "../../solitario/solitario.html"
  }

  return esMiniTorneo(localStorage.getItem("solitario_juego"))
    ? "../../solitario/solitario.html"
    : "lobby.html"
}

export async function volverDesdeFinal(supabase, limpiar = () => {}) {
  const juego = localStorage.getItem("juego_actual") || localStorage.getItem("solitario_juego")

  if (esNivelSolitario(juego)) {
    limpiar()
    limpiarContextoNivel()
    localStorage.removeItem("juego_actual")
    window.location.href = "../../solitario/solitario.html"
    return
  }

  if (esMiniTorneo(juego)) {
    limpiar()
    localStorage.removeItem("juego_actual")
    window.location.href = "../../solitario/solitario.html"
    return
  }

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  if (data?.estado !== "espera") {
    alert("Torneo aun activo")
    return
  }

  limpiar()
  localStorage.removeItem("juego_actual")
  window.location.href = "lobby.html"
}

export async function registrarPuntosMiniTorneo(supabase, juego, puntos) {
  if (!esMiniTorneo(juego)) return

  const salaId = localStorage.getItem("solitario_sala_id")
  const usuario = localStorage.getItem("usuario")
  const puntosSeguros = Math.max(0, Number(puntos || 0))

  if (!salaId || !usuario) return

  await supabase
    .from("sala_jugadores")
    .update({ puntos: puntosSeguros, usuario })
    .eq("sala_id", salaId)
    .eq("usuario_id", usuario)

  await supabase
    .from("solitario_resultados")
    .insert([{
      usuario_id: usuario,
      usuario,
      puntos: puntosSeguros,
      victoria: false,
      sala_id: salaId,
      origen: "sala",
    }])
}

function leerContextoNivel() {
  try {
    return JSON.parse(localStorage.getItem("solitario_nivel_context") || "null")
  } catch {
    return null
  }
}

function limpiarContextoNivel() {
  localStorage.removeItem("solitario_nivel_context")
  if (localStorage.getItem("solitario_origen") === "nivel") {
    localStorage.removeItem("solitario_origen")
    localStorage.removeItem("solitario_juego")
  }
}
