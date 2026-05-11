import { supabase } from "./supabase.js"
import { registrarXpPorPartida } from "./progreso-nivel.js"
import { reportLevelResult, saveLastLevelResult } from "./solitario-niveles.js"
import { obtenerOrigenExperiencia } from "./mini-torneo.js"
import { obtenerMonedas, registrarMonedasPorActividad } from "./tienda.js"
import { limpiarSnapshotBonusXP, obtenerSnapshotBonusXP } from "./experiencia-temporada.js"

const FALLBACK_TABLES = {
  ajedrez: "ranking_ajedrez",
  domino: "ranking_domino",
  damas: "ranking_damas",
}

export async function registrarPartidaDesdeRanking({ usuario, juego, valor, modo, invalido = false }) {
  if (!usuario || !juego) return
  if (invalido) {
    await reportLevelResult(supabase, { usuario, juego, valor, modo, invalido, motivo: "Descalificado por actividad sospechosa." })
    return
  }

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

  const resultadoNivel = await reportLevelResult(supabase, { usuario, juego, valor: numero, modo, posicion, invalido })
  const origenExperiencia = resultadoNivel ? "solitario" : obtenerOrigenExperiencia(juego)
  const snapshotBonusXP = await obtenerSnapshotBonusXP(juego, origenExperiencia)
  const payloadConSnapshot = {
    ...payload,
    bonus_xp_aplicado: snapshotBonusXP?.bonusXPAplicado ?? 1,
    temporada_id: snapshotBonusXP?.temporadaId || null,
  }

  let { data: partidaGuardada, error } = await supabase
    .from("partidas")
    .insert(payloadConSnapshot)
    .select("id")
    .maybeSingle()

  if (error && esErrorColumnasInsert(error)) {
    const fallback = await supabase
      .from("partidas")
      .insert(payload)
      .select("id")
      .maybeSingle()
    partidaGuardada = fallback.data
    error = fallback.error

    if (error && esErrorColumnasInsert(error)) {
      const fallbackSinId = await supabase
        .from("partidas")
        .insert(payload)
      partidaGuardada = null
      error = fallbackSinId.error
    }
  }

  if (error) {
    console.warn("No se pudo registrar la partida", error)
    return
  }

  const xpResultados = await registrarXpPorPartida({
    usuario,
    juego,
    posicion,
    origen: origenExperiencia,
    bonusXPAplicado: snapshotBonusXP?.bonusXPAplicado,
  })
  const recompensasXp = xpResultados
    .filter(Boolean)
    .flatMap((item) => item.recompensas || [])

  const monedasAntes = obtenerMonedas(usuario)
  const saldoMonedas = await registrarMonedasPorActividad(usuario, {
    juego,
    origen: origenExperiencia,
    posicion,
    resultadoNivel,
    accionKey: partidaGuardada?.id
      ? `monedas:partida:${partidaGuardada.id}`
      : `monedas:partida:${usuario}:${juego}:${origenExperiencia}:${modo}:${numero}`,
  })
  const resumenRecompensas = {
    juego,
    origen: origenExperiencia,
    xpGanada: xpResultados.filter(Boolean).reduce((total, item) => total + Number(item.xpGanado || 0), 0),
    recompensasXp,
    monedasGanadas: Math.max(0, Number(saldoMonedas || 0) - monedasAntes),
    monedasSaldo: saldoMonedas,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(`ultimo_resultado_${juego}`, JSON.stringify(resumenRecompensas))
  if (resultadoNivel) {
    saveLastLevelResult({
      xpGanada: resumenRecompensas.xpGanada,
      recompensasXp: resumenRecompensas.recompensasXp,
      monedasGanadas: resumenRecompensas.monedasGanadas,
      monedasSaldo: resumenRecompensas.monedasSaldo,
    })
  }

  limpiarSnapshotBonusXP(juego)
}

function esErrorColumnasInsert(error) {
  const mensaje = String(error?.message || "")
  return error?.code === "42703"
    || mensaje.includes("bonus_xp_aplicado")
    || mensaje.includes("temporada_id")
    || mensaje.includes("column \"id\"")
    || mensaje.includes("Could not find the 'id'")
    || mensaje.includes("Could not find")
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
