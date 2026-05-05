export function esMiniTorneo(juego) {
  return localStorage.getItem("solitario_origen") === "sala"
    && localStorage.getItem("solitario_sala_id")
    && localStorage.getItem("solitario_juego") === juego
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

  const { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  return data?.estado === "espera"
}

export function salidaTorneoUrl() {
  return esMiniTorneo(localStorage.getItem("solitario_juego"))
    ? "../../solitario/solitario.html"
    : "lobby.html"
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
