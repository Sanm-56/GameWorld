import { supabase } from "./supabase.js"
import { registrarXpPorPartida } from "./progreso-nivel.js"
import { reportLevelResult } from "./solitario-niveles.js"

const FALLBACK_TABLES = {
  ajedrez: "ranking_ajedrez",
  domino: "ranking_domino",
  damas: "ranking_damas",
}

export async function registrarPartidaDesdeRanking({ usuario, juego, valor, modo, invalido = false }) {
  if (!usuario || !juego) return
  if (invalido) return

  const numero = Number(valor || 0)
  const posicion = await obtenerPosicion(usuario, juego, modo)
  const usuarioId = await obtenerUsuarioId(usuario)

  const payload = {
    usuario,
    usuario_id: usuarioId,
    juego,
    puntos: modo === "points" ? numero : 0,
    tiempo: modo === "time" ? numero : 0,
    posicion,
  }

  await reportLevelResult(supabase, { usuario, juego, valor: numero, modo, posicion, invalido })

  const { error } = await supabase.from("partidas").insert(payload)

  if (error) {
    console.warn("No se pudo registrar la partida", error)
    return
  }

  await registrarXpPorPartida({
    usuario,
    juego,
    posicion,
  })
}

async function obtenerPosicion(usuario, juego, modo) {
  const ascendente = modo === "time"
  let { data, error } = await supabase
    .from("ranking")
    .select("usuario,tiempo,juego,invalido")
    .eq("juego", juego)
    .eq("invalido", false)
    .order("tiempo", { ascending: ascendente })

  if ((!data || data.length === 0 || error) && FALLBACK_TABLES[juego]) {
    const fallback = await supabase
      .from(FALLBACK_TABLES[juego])
      .select("usuario,tiempo,juego,invalido")
      .eq("invalido", false)
      .order("tiempo", { ascending: ascendente })

    data = fallback.data
    error = fallback.error
  }

  if (error || !data) return null

  const index = data.findIndex((row) => row.usuario === usuario)
  return index >= 0 ? index + 1 : null
}

async function obtenerUsuarioId(usuario) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id")
    .eq("usuario", usuario)
    .maybeSingle()

  if (error || !data?.id) return null
  return data.id
}
