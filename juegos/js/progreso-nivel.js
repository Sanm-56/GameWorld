import { supabase } from './supabase.js'
import { obtenerBonusTemporada } from './experiencia-temporada.js'
import { obtenerBonusUsuario } from './tienda.js'

export const NIVEL_MAXIMO = 3000

const XP_ACCIONES = {
  partida_completada: 25,
  torneo_participacion: 50,
  logro_desbloqueado: 80,
}

const TITULOS_NIVEL = [
  { desde: 1, hasta: 25, titulo: 'Novato' },
  { desde: 26, hasta: 50, titulo: 'Amateur' },
  { desde: 51, hasta: 75, titulo: 'Aspirante' },
  { desde: 76, hasta: 100, titulo: 'Profesional' },
  { desde: 101, hasta: 125, titulo: 'Competidor' },
  { desde: 126, hasta: 150, titulo: 'Experto' },
  { desde: 151, hasta: 175, titulo: 'Elite' },
  { desde: 176, hasta: 200, titulo: 'Maestro' },
  { desde: 201, hasta: 225, titulo: 'Gran Maestro' },
  { desde: 226, hasta: 250, titulo: 'Leyenda' },
  { desde: 251, hasta: 275, titulo: 'Mitico' },
  { desde: 276, hasta: 300, titulo: 'Supremo' },
  { desde: 301, hasta: 325, titulo: 'Titan' },
  { desde: 326, hasta: 350, titulo: 'Inmortal' },
  { desde: 351, hasta: 365, titulo: 'Leyenda Maxima' },
  { desde: 366, hasta: 390, titulo: 'Arquitecto del Vacío' },
  { desde: 391, hasta: 415, titulo: 'Heraldo Astral' },
  { desde: 416, hasta: 440, titulo: 'Soberano Carmesí' },
  { desde: 441, hasta: 465, titulo: 'Devorador de Ecos' },
  { desde: 466, hasta: 490, titulo: 'Guardián del Eclipse' },
  { desde: 491, hasta: 515, titulo: 'Emperador Umbrío' },
  { desde: 516, hasta: 540, titulo: 'Portador del Infinito' },
  { desde: 541, hasta: 565, titulo: 'Rey de las Cenizas' },
  { desde: 566, hasta: 590, titulo: 'Dominador de Ether' },
  { desde: 591, hasta: 615, titulo: 'Monarca del Abismo' },
  { desde: 616, hasta: 640, titulo: 'Vigía de los Eternos' },
  { desde: 641, hasta: 665, titulo: 'Señor del Horizonte Negro' },
  { desde: 666, hasta: 690, titulo: 'Profeta del Fin' },
  { desde: 691, hasta: 715, titulo: 'Heredero de Umbra' },
  { desde: 716, hasta: 740, titulo: 'Tirano Celestial' },
  { desde: 741, hasta: 765, titulo: 'Custodio de la Última Llama' },
  { desde: 766, hasta: 790, titulo: 'Conquistador Astral' },
  { desde: 791, hasta: 815, titulo: 'Deidad del Eclipse' },
  { desde: 816, hasta: 840, titulo: 'Soberano del Vacío Viviente' },
  { desde: 841, hasta: 865, titulo: 'Portador de la Corona Negra' },
  { desde: 866, hasta: 890, titulo: 'Rey del Infinito Oscuro' },
  { desde: 891, hasta: 915, titulo: 'Guardián de las Ruinas Eternas' },
  { desde: 916, hasta: 940, titulo: 'Monarca del Ether Oscuro' },
  { desde: 941, hasta: 965, titulo: 'Heraldo del Horizonte Carmesí' },
  { desde: 966, hasta: 990, titulo: 'Emisario de los Titanes' },
  { desde: 991, hasta: 1015, titulo: 'Señor de las Estrellas Muertas' },
  { desde: 1016, hasta: 1040, titulo: 'Arquitecto del Eclipse Final' },
  { desde: 1041, hasta: 1065, titulo: 'Devastador de Imperios' },
  { desde: 1066, hasta: 1090, titulo: 'Trono Viviente' },
  { desde: 1091, hasta: 1115, titulo: 'Vigía del Abismo Eterno' },
  { desde: 1116, hasta: 1140, titulo: 'Portador del Noveno Sello' },
  { desde: 1141, hasta: 1165, titulo: 'Emperador de Umbra Prime' },
  { desde: 1166, hasta: 1190, titulo: 'Custodio del Fin Absoluto' },
  { desde: 1191, hasta: 1215, titulo: 'Rey del Reino Perdido' },
  { desde: 1216, hasta: 1240, titulo: 'Heraldo de la Última Aurora' },
  { desde: 1241, hasta: 1265, titulo: 'Dominador del Trono Astral' },
  { desde: 1266, hasta: 1290, titulo: 'Monarca de la Eternidad Negra' },
  { desde: 1291, hasta: 1315, titulo: 'Devorador del Horizonte' },
  { desde: 1316, hasta: 1340, titulo: 'Soberano de los Ecos Infinitos' },
  { desde: 1341, hasta: 1365, titulo: 'Guardián del Sol Muerto' },
  { desde: 1366, hasta: 1390, titulo: 'Portador del Juicio Final' },
  { desde: 1391, hasta: 1415, titulo: 'Rey de la Corona Eterna' },
  { desde: 1416, hasta: 1440, titulo: 'Emisario del Vacío Absoluto' },
  { desde: 1441, hasta: 1465, titulo: 'Titán del Eclipse Carmesí' },
  { desde: 1466, hasta: 1490, titulo: 'Custodio del Reino Celestial' },
  { desde: 1491, hasta: 1515, titulo: 'Señor de la Última Constelación' },
  { desde: 1516, hasta: 1540, titulo: 'Deidad de las Sombras Eternas' },
  { desde: 1541, hasta: 1565, titulo: 'Emperador del Horizonte Infinito' },
  { desde: 1566, hasta: 1590, titulo: 'Trascendente Astral' },
  { desde: 1591, hasta: 1615, titulo: 'Rey del Fin Eterno' },
  { desde: 1616, hasta: 1640, titulo: 'Heraldo del Vacío Primordial' },
  { desde: 1641, hasta: 1665, titulo: 'Arquitecto de la Eternidad' },
  { desde: 1666, hasta: 1690, titulo: 'Monarca del Eclipse Supremo' },
  { desde: 1691, hasta: 1715, titulo: 'Vigía del Reino Prohibido' },
  { desde: 1716, hasta: 1740, titulo: 'Portador de la Última Verdad' },
  { desde: 1741, hasta: 1765, titulo: 'Devastador del Infinito' },
  { desde: 1766, hasta: 1790, titulo: 'Señor del Trono Negro' },
  { desde: 1791, hasta: 1815, titulo: 'Custodio del Horizonte Final' },
  { desde: 1816, hasta: 1840, titulo: 'Emperador de los Mundos Caídos' },
  { desde: 1841, hasta: 1865, titulo: 'Heredero del Abismo Supremo' },
  { desde: 1866, hasta: 1890, titulo: 'Soberano de Ether Prime' },
  { desde: 1891, hasta: 1915, titulo: 'Rey del Vacío Eterno' },
  { desde: 1916, hasta: 1940, titulo: 'Guardián del Último Eclipse' },
  { desde: 1941, hasta: 1965, titulo: 'Trascendente del Ether Oscuro' },
  { desde: 1966, hasta: 1990, titulo: 'Monarca de la Ruina Celestial' },
  { desde: 1991, hasta: 2015, titulo: 'Deidad del Horizonte Negro' },
  { desde: 2016, hasta: 2040, titulo: 'Emisario de la Última Era' },
  { desde: 2041, hasta: 2065, titulo: 'Portador del Corazón Astral' },
  { desde: 2066, hasta: 2090, titulo: 'Rey de las Sombras Primordiales' },
  { desde: 2091, hasta: 2115, titulo: 'Custodio del Trono Eterno' },
  { desde: 2116, hasta: 2140, titulo: 'Soberano del Juicio Carmesí' },
  { desde: 2141, hasta: 2165, titulo: 'Arquitecto del Reino Absoluto' },
  { desde: 2166, hasta: 2190, titulo: 'Emperador del Vacío Infinito' },
  { desde: 2191, hasta: 2215, titulo: 'Vigía de los Dioses Caídos' },
  { desde: 2216, hasta: 2240, titulo: 'Portador del Horizonte Absoluto' },
  { desde: 2241, hasta: 2265, titulo: 'Monarca del Último Reino' },
  { desde: 2266, hasta: 2290, titulo: 'Heraldo de la Eternidad Carmesí' },
  { desde: 2291, hasta: 2315, titulo: 'Devorador de Estrellas Eternas' },
  { desde: 2316, hasta: 2340, titulo: 'Custodio del Trono del Fin' },
  { desde: 2341, hasta: 2365, titulo: 'Rey de Umbra Eterna' },
  { desde: 2366, hasta: 2390, titulo: 'Trascendente del Eclipse Infinito' },
  { desde: 2391, hasta: 2415, titulo: 'Emperador del Vacío Celestial' },
  { desde: 2416, hasta: 2440, titulo: 'Señor de los Ecos del Fin' },
  { desde: 2441, hasta: 2465, titulo: 'Arquitecto de los Mundos Eternos' },
  { desde: 2466, hasta: 2490, titulo: 'Deidad del Abismo Carmesí' },
  { desde: 2491, hasta: 2515, titulo: 'Portador de la Corona Final' },
  { desde: 2516, hasta: 2540, titulo: 'Vigía del Infinito Absoluto' },
  { desde: 2541, hasta: 2565, titulo: 'Monarca de la Última Ruina' },
  { desde: 2566, hasta: 2590, titulo: 'Heraldo del Eclipse Primordial' },
  { desde: 2591, hasta: 2615, titulo: 'Emperador de las Estrellas Muertas' },
  { desde: 2616, hasta: 2640, titulo: 'Rey del Trono Absoluto' },
  { desde: 2641, hasta: 2665, titulo: 'Guardián del Vacío Viviente' },
  { desde: 2666, hasta: 2690, titulo: 'Deidad de la Eternidad Negra' },
  { desde: 2691, hasta: 2715, titulo: 'Soberano de los Reinos Perdidos' },
  { desde: 2716, hasta: 2740, titulo: 'Custodio del Fin del Tiempo' },
  { desde: 2741, hasta: 2765, titulo: 'Portador de la Corona del Vacío' },
  { desde: 2766, hasta: 2790, titulo: 'Arquitecto del Eclipse Eterno' },
  { desde: 2791, hasta: 2815, titulo: 'Emisario de Umbra Infinita' },
  { desde: 2816, hasta: 2840, titulo: 'Monarca del Horizonte Supremo' },
  { desde: 2841, hasta: 2865, titulo: 'Rey de la Última Dimensión' },
  { desde: 2866, hasta: 2890, titulo: 'Devorador del Reino Astral' },
  { desde: 2891, hasta: 2915, titulo: 'Heraldo de las Sombras Eternas' },
  { desde: 2916, hasta: 2940, titulo: 'Emperador del Juicio Final' },
  { desde: 2941, hasta: 2965, titulo: 'Titán del Vacío Primordial' },
  { desde: 2966, hasta: 3000, titulo: 'El Último Ascendido' },
]

export function obtenerTituloNivel(nivelActual = 1) {
  const nivel = Math.min(NIVEL_MAXIMO, Math.max(1, Math.trunc(Number(nivelActual) || 1)))
  return TITULOS_NIVEL.find((rango) => nivel >= rango.desde && nivel <= rango.hasta)?.titulo || 'El Último Ascendido'
}

export function xpNecesarioParaNivel(nivel) {
  if (nivel >= NIVEL_MAXIMO) return 0
  return (100 + Math.floor(Math.pow(nivel - 1, 1.45) * 35) + (nivel - 1) * 15) * 3
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

export function calcularProgresoNivelActual(nivelActual = 1, xpNivelActual = 0) {
  const nivel = Math.min(NIVEL_MAXIMO, Math.max(1, Math.trunc(Number(nivelActual) || 1)))
  const xp = Math.max(0, Number(xpNivelActual) || 0)
  const xpSiguiente = xpNecesarioParaNivel(nivel)
  const xpEnNivel = nivel >= NIVEL_MAXIMO ? 0 : Math.min(xp, xpSiguiente)
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

export function multiplicadorOrigenExperiencia(origen = 'torneo') {
  return origen === 'minitorneo' || origen === 'solitario' ? 0.5 : 1
}

export function crearRecompensaFallback(nivel) {
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
  return { ...base, ...calcularProgresoNivelActual(base.nivel, base.xp) }
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

export async function registrarXp({ usuario, accion, xpGanado, detalle = {}, accionKey = null, juego = null, origen = 'torneo', bonusXPAplicado = null }) {
  if (!usuario) return null

  const xpBase = Math.max(0, Number(xpGanado) || 0)
  if (!xpBase) return null

  const multiplicadorOrigen = multiplicadorOrigenExperiencia(origen)
  const bonusTemporada = Number.isFinite(Number(bonusXPAplicado))
    ? Number(bonusXPAplicado)
    : juego ? await obtenerBonusTemporada(juego) : 1
  const bonusUsuario = await obtenerBonusUsuario(usuario)
  const xp = Math.max(1, Math.round(xpBase * multiplicadorOrigen * bonusTemporada * bonusUsuario))
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
  const xpConGanancia = progresoAnterior.xp + xp
  const requisitoNivel = xpNecesarioParaNivel(progresoAnterior.nivel)
  const subioNivel = progresoAnterior.nivel < NIVEL_MAXIMO && xpConGanancia >= requisitoNivel
  const nuevoNivel = subioNivel ? Math.min(NIVEL_MAXIMO, progresoAnterior.nivel + 1) : progresoAnterior.nivel
  const nuevoXp = subioNivel ? 0 : xpConGanancia
  const calculado = calcularProgresoNivelActual(nuevoNivel, nuevoXp)

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
      detalle: {
        ...detalle,
        xpBase,
        juego,
        origen,
        multiplicadorOrigen,
        bonusTemporada,
        bonusUsuario,
      },
    })

  if (historialError) {
    console.warn('No se pudo registrar historial de XP', historialError)
  }

  if (subioNivel) {
    await desbloquearRecompensas(usuario, progresoAnterior.nivel + 1, calculado.nivel)
  }

  return {
    xpGanado: xp,
    xpBase,
    bonusTemporada,
    bonusUsuario,
    multiplicadorOrigen,
    nivelAnterior: progresoAnterior.nivel,
    nivelActual: calculado.nivel,
    subioNivel,
  }
}

export async function registrarXpPorPartida({ usuario, juego, posicion, partidaId = null, origen = 'torneo', bonusXPAplicado = null }) {
  if (!usuario || !juego) return []

  const baseKey = partidaId || `${juego}:${Date.now()}:${Math.random().toString(16).slice(2)}`
  const registros = [
    {
      usuario,
      accion: 'partida_completada',
      xpGanado: XP_ACCIONES.partida_completada,
      juego,
      origen,
      bonusXPAplicado,
      detalle: { juego, posicion, origen, bonusXPAplicado },
      accionKey: `partida:${baseKey}`,
    },
    {
      usuario,
      accion: 'torneo_participacion',
      xpGanado: XP_ACCIONES.torneo_participacion,
      juego,
      origen,
      bonusXPAplicado,
      detalle: { juego, posicion, origen, bonusXPAplicado },
      accionKey: `torneo:${baseKey}`,
    },
  ]

  const xpRanking = calcularXpRanking(posicion)
  if (xpRanking) {
    registros.push({
      usuario,
      accion: 'ranking_posicion',
      xpGanado: xpRanking,
      juego,
      origen,
      bonusXPAplicado,
      detalle: { juego, posicion, origen, bonusXPAplicado },
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
