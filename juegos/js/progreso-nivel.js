import { supabase } from './supabase.js'

export const NIVEL_MAXIMO = 100

const XP_ACCIONES = {
  partida_completada: 25,
  torneo_participacion: 50,
  logro_desbloqueado: 80,
}

const RECOMPENSAS_BASE = [
  'Novato', 'Aspirante', 'Competidor', 'Calculador', 'Estratega',
  'Especialista', 'Veterano', 'Maestro', 'Campeon', 'Leyenda',
]

export function xpNecesarioParaNivel(nivel) {
  if (nivel >= NIVEL_MAXIMO) return 0
  return 100 + Math.floor(Math.pow(nivel - 1, 1.45) * 35) + (nivel - 1) * 15
}

export function xpAcumuladoParaNivel(nivel) {
  let total = 0
  for (let actual = 1; actual < nivel; actual += 1) {
    total += xpNecesarioParaNivel(actual)
  }
  return total
}

export function calcularNivelPorXp(xpTotal = 0) {
  const xp = Math.max(0, Number(xpTotal) || 0)
  let nivel = 1
  let inicioNivel = 0

  while (nivel < NIVEL_MAXIMO) {
    const requisito = xpNecesarioParaNivel(nivel)
    if (xp < inicioNivel + requisito) break
    inicioNivel += requisito
    nivel += 1
  }

  const xpSiguiente = xpNecesarioParaNivel(nivel)
  const xpEnNivel = nivel >= NIVEL_MAXIMO ? 0 : xp - inicioNivel
  const porcentaje = nivel >= NIVEL_MAXIMO
    ? 100
    : Math.min(100, Math.round((xpEnNivel / xpSiguiente) * 100))

  return {
    nivel,
    xp,
    xpEnNivel,
    xpSiguiente,
    xpParaSiguiente: nivel >= NIVEL_MAXIMO ? 0 : Math.max(0, xpSiguiente - xpEnNivel),
    porcentaje,
  }
}

export function calcularXpRanking(posicion) {
  const pos = Number(posicion)
  if (!Number.isFinite(pos) || pos <= 0) return 0
  if (pos === 1) return 150
  if (pos <= 3) return 110
  if (pos <= 10) return 75
  if (pos <= 25) return 45
  return 25
}

export function crearRecompensaFallback(nivel) {
  const titulo = RECOMPENSAS_BASE[Math.min(RECOMPENSAS_BASE.length - 1, Math.floor((nivel - 1) / 10))]

  if (nivel % 10 === 0) {
    return { nivel, tipo: 'titulo', valor: `${titulo} ${nivel}` }
  }

  if (nivel % 5 === 0) {
    return { nivel, tipo: 'medalla', valor: `Medalla nivel ${nivel}` }
  }

  if (nivel % 3 === 0) {
    return { nivel, tipo: 'estilo', valor: `Borde nivel ${nivel}` }
  }

  return { nivel, tipo: 'xp_bonus', valor: `Bonificacion nivel ${nivel}` }
}

export async function obtenerProgresoNivel(usuario) {
  if (!usuario) return calcularNivelPorXp(0)

  const { data, error } = await supabase
    .from('progreso_nivel')
    .select('*')
    .eq('usuario_id', usuario)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.warn('No se pudo cargar progreso de nivel', error)
  }

  const base = data || { usuario_id: usuario, xp: 0, nivel: 1 }
  return { ...base, ...calcularNivelPorXp(base.xp) }
}

export async function obtenerRankingNivel(limite = 10) {
  const { data, error } = await supabase
    .from('progreso_nivel')
    .select('usuario_id,xp,nivel,updated_at')
    .order('nivel', { ascending: false })
    .order('xp', { ascending: false })
    .limit(limite)

  if (error) {
    console.warn('No se pudo cargar ranking de nivel', error)
    return []
  }

  return data || []
}

export async function obtenerRecompensaNivel(nivel) {
  if (!nivel || nivel > NIVEL_MAXIMO) return null

  const { data, error } = await supabase
    .from('recompensas_nivel')
    .select('*')
    .eq('nivel', nivel)
    .limit(1)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.warn('No se pudo cargar recompensa de nivel', error)
  }

  return data || crearRecompensaFallback(nivel)
}

export async function obtenerRecompensasHastaNivel(nivel) {
  if (!nivel || nivel < 1) return []

  const { data, error } = await supabase
    .from('recompensas_nivel')
    .select('*')
    .lte('nivel', nivel)
    .order('nivel', { ascending: true })

  if (error) {
    console.warn('No se pudieron cargar recompensas desbloqueadas', error)
    return Array.from({ length: nivel }, (_, index) => crearRecompensaFallback(index + 1))
  }

  return data || []
}

export async function registrarXp({ usuario, accion, xpGanado, detalle = {}, accionKey = null }) {
  if (!usuario) return null

  const xp = Math.max(0, Number(xpGanado) || 0)
  if (!xp) return null

  const key = accionKey || `${accion}:${Date.now()}:${Math.random().toString(16).slice(2)}`

  const { data: existente } = await supabase
    .from('historial_xp')
    .select('id')
    .eq('usuario_id', usuario)
    .eq('accion_key', key)
    .maybeSingle()

  if (existente) return null

  const progresoAnterior = await obtenerProgresoNivel(usuario)
  const nuevoXp = progresoAnterior.xp + xp
  const calculado = calcularNivelPorXp(nuevoXp)

  const { error: progresoError } = await supabase
    .from('progreso_nivel')
    .upsert({
      usuario_id: usuario,
      xp: nuevoXp,
      nivel: calculado.nivel,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'usuario_id' })

  if (progresoError) {
    console.warn('No se pudo actualizar progreso de nivel', progresoError)
    return null
  }

  const { error: historialError } = await supabase
    .from('historial_xp')
    .insert({
      usuario_id: usuario,
      accion,
      accion_key: key,
      xp_ganado: xp,
      detalle,
    })

  if (historialError) {
    console.warn('No se pudo registrar historial de XP', historialError)
  }

  if (calculado.nivel > progresoAnterior.nivel) {
    await desbloquearRecompensas(usuario, progresoAnterior.nivel + 1, calculado.nivel)
  }

  return {
    xpGanado: xp,
    nivelAnterior: progresoAnterior.nivel,
    nivelActual: calculado.nivel,
    subioNivel: calculado.nivel > progresoAnterior.nivel,
  }
}

export async function registrarXpPorPartida({ usuario, juego, posicion, partidaId = null }) {
  if (!usuario || !juego) return []

  const baseKey = partidaId || `${juego}:${Date.now()}:${Math.random().toString(16).slice(2)}`
  const registros = [
    {
      usuario,
      accion: 'partida_completada',
      xpGanado: XP_ACCIONES.partida_completada,
      detalle: { juego, posicion },
      accionKey: `partida:${baseKey}`,
    },
    {
      usuario,
      accion: 'torneo_participacion',
      xpGanado: XP_ACCIONES.torneo_participacion,
      detalle: { juego, posicion },
      accionKey: `torneo:${baseKey}`,
    },
  ]

  const xpRanking = calcularXpRanking(posicion)
  if (xpRanking) {
    registros.push({
      usuario,
      accion: 'ranking_posicion',
      xpGanado: xpRanking,
      detalle: { juego, posicion },
      accionKey: `ranking:${baseKey}`,
    })
  }

  const resultados = []
  for (const registro of registros) {
    resultados.push(await registrarXp(registro))
  }
  return resultados
}

export async function registrarXpPorLogros(usuario, logros, origen = 'perfil') {
  if (!usuario || !Array.isArray(logros)) return []

  const desbloqueados = logros.filter((logro) => logro?.unlocked && logro?.title)
  const resultados = []

  for (const logro of desbloqueados) {
    resultados.push(await registrarXp({
      usuario,
      accion: 'logro_desbloqueado',
      xpGanado: XP_ACCIONES.logro_desbloqueado,
      detalle: { origen, titulo: logro.title },
      accionKey: `logro:${origen}:${logro.title}:${logro.howTo || ''}`,
    }))
  }

  return resultados
}

async function desbloquearRecompensas(usuario, desdeNivel, hastaNivel) {
  const recompensas = await obtenerRecompensasHastaNivel(hastaNivel)
  const nuevas = recompensas
    .filter((recompensa) => recompensa.nivel >= desdeNivel && recompensa.nivel <= hastaNivel)
    .map((recompensa) => ({
      usuario_id: usuario,
      nivel: recompensa.nivel,
      recompensa_id: recompensa.id || null,
      tipo: recompensa.tipo,
      valor: recompensa.valor,
    }))

  if (!nuevas.length) return

  const { error } = await supabase
    .from('recompensas_desbloqueadas')
    .upsert(nuevas, { onConflict: 'usuario_id,nivel,tipo,valor' })

  if (error) {
    console.warn('No se pudieron desbloquear recompensas', error)
  }
}
