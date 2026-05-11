import { supabase } from './supabase.js'

export const RANGO_EQUIPADO_KEY = 'perfil_rango_equipado_usuario'
export const RANGO_EQUIPADO_REMOTO_PREFIX = 'rango:'

export const RANGO_BONUS_ESCALADO = [
  { hasta: 0, monedas: 0, exp: 0, etiqueta: 'Base' },
  { hasta: 0.15, monedas: 0.04, exp: 0.02, etiqueta: 'Inicial' },
  { hasta: 0.4, monedas: 0.11, exp: 0.06, etiqueta: 'Competitivo' },
  { hasta: 0.7, monedas: 0.21, exp: 0.11, etiqueta: 'Avanzado' },
  { hasta: 0.9, monedas: 0.29, exp: 0.15, etiqueta: 'Elite' },
  { hasta: 1, monedas: 0.35, exp: 0.18, etiqueta: 'Ascendido' },
]

export function normalizarTextoRango(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function leerRangoEquipado(usuario) {
  if (!usuario) return rangoBase()
  const valor = leerObjetoLocal(RANGO_EQUIPADO_KEY)[usuario]
  if (!valor) return rangoBase()
  if (typeof valor === 'string') return { ...rangoBase(), titulo: valor }
  return normalizarRangoGuardado(valor)
}

export function guardarRangoEquipado(usuario, rango) {
  if (!usuario) return
  const datos = leerObjetoLocal(RANGO_EQUIPADO_KEY)
  datos[usuario] = normalizarRangoGuardado(rango)
  localStorage.setItem(RANGO_EQUIPADO_KEY, JSON.stringify(datos))
}

export async function guardarRangoEquipadoRemoto(usuario, rango) {
  if (!usuario || !rango) return { ok: false, error: 'Rango invalido' }
  const limpio = normalizarRangoGuardado(rango)
  const cosmeticoId = `${RANGO_EQUIPADO_REMOTO_PREFIX}${slugRango(limpio.titulo)}`

  const { error: updateError } = await supabase
    .from('usuario_cosmeticos')
    .update({ equipado: false })
    .eq('usuario_id', usuario)
    .eq('tipo', 'efecto')
    .like('cosmetico_id', `${RANGO_EQUIPADO_REMOTO_PREFIX}%`)
    .eq('equipado', true)

  if (updateError && updateError.code !== '42501') {
    console.warn('No se pudieron desactivar rangos remotos previos', updateError)
  }

  const { error } = await supabase
    .from('usuario_cosmeticos')
    .upsert({
      usuario_id: usuario,
      cosmetico_id: cosmeticoId,
      tipo: 'efecto',
      rareza: 'Normal',
      equipado: true,
      created_at: new Date().toISOString(),
    }, { onConflict: 'usuario_id,cosmetico_id' })

  if (error) {
    console.warn('No se pudo guardar rango equipado remoto', error)
    return { ok: false, error }
  }

  return { ok: true, rango: limpio }
}

export async function sincronizarRangoEquipado(usuario, rangos = []) {
  const local = leerRangoEquipado(usuario)
  if (!usuario) return local

  const { data, error } = await supabase
    .from('usuario_cosmeticos')
    .select('cosmetico_id,equipado,created_at')
    .eq('usuario_id', usuario)
    .eq('tipo', 'efecto')
    .eq('equipado', true)
    .like('cosmetico_id', `${RANGO_EQUIPADO_REMOTO_PREFIX}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.warn('No se pudo sincronizar rango equipado remoto', error)
    return local
  }

  if (!data?.cosmetico_id) return local

  const slug = data.cosmetico_id.replace(RANGO_EQUIPADO_REMOTO_PREFIX, '')
  const remoto = (Array.isArray(rangos) ? rangos : [])
    .find((rango) => slugRango(rango.titulo) === slug)

  if (!remoto) return local
  const guardable = normalizarRangoGuardado({
    ...remoto,
    indice: Math.max(0, rangos.findIndex((rango) => slugRango(rango.titulo) === slug)),
    totalRangos: Math.max(1, rangos.length || 1),
  })
  guardarRangoEquipado(usuario, guardable)
  return guardable
}

export function calcularBonusRango(rango, totalRangos = null) {
  const limpio = normalizarRangoGuardado(rango)
  const total = Math.max(1, Math.trunc(Number(totalRangos || limpio.totalRangos) || 1))
  const indice = Math.max(0, Math.trunc(Number(limpio.indice) || 0))
  const progreso = total <= 1 ? 0 : Math.min(1, indice / (total - 1))
  const tramo = obtenerTramoBonus(progreso)
  const anterior = obtenerTramoAnterior(tramo)
  const inicio = anterior?.hasta ?? 0
  const ancho = Math.max(0.001, tramo.hasta - inicio)
  const local = Math.max(0, Math.min(1, (progreso - inicio) / ancho))
  const monedas = redondearPorcentaje(interpolar(anterior?.monedas ?? 0, tramo.monedas, local))
  const exp = redondearPorcentaje(interpolar(anterior?.exp ?? 0, tramo.exp, local))

  return {
    titulo: limpio.titulo,
    etiqueta: tramo.etiqueta,
    indice,
    totalRangos: total,
    progreso,
    monedas,
    exp,
    multiplicadorMonedas: redondearMultiplicador(1 + monedas),
    multiplicadorExp: redondearMultiplicador(1 + exp),
    monedasTexto: formatearBonus(monedas),
    expTexto: formatearBonus(exp),
  }
}

export function obtenerBonusRangoActivo(usuario) {
  return calcularBonusRango(leerRangoEquipado(usuario))
}

export function aplicarBonusMonedas(cantidad, bonusRango) {
  const base = Math.max(0, Math.trunc(Number(cantidad) || 0))
  const bonus = Math.max(0, Number(bonusRango?.monedas) || 0)
  const extra = bonus > 0 ? Math.floor(base * bonus) : 0
  return {
    base,
    bonusRango: extra,
    total: base + extra,
    porcentaje: bonus,
  }
}

export function formatearBonus(valor) {
  const porcentaje = Math.round((Number(valor) || 0) * 100)
  return porcentaje > 0 ? `+${porcentaje}%` : '+0%'
}

function rangoBase() {
  return { titulo: 'Novato', desde: 1, hasta: 25, indice: 0, totalRangos: 1 }
}

function normalizarRangoGuardado(rango) {
  if (!rango || typeof rango !== 'object') return rangoBase()
  return {
    titulo: String(rango.titulo || 'Novato'),
    desde: Math.max(1, Math.trunc(Number(rango.desde) || 1)),
    hasta: Math.max(1, Math.trunc(Number(rango.hasta) || rango.desde || 1)),
    indice: Math.max(0, Math.trunc(Number(rango.indice) || 0)),
    totalRangos: Math.max(1, Math.trunc(Number(rango.totalRangos) || 1)),
  }
}

function obtenerTramoBonus(progreso) {
  return RANGO_BONUS_ESCALADO.find((tramo) => progreso <= tramo.hasta) || RANGO_BONUS_ESCALADO[RANGO_BONUS_ESCALADO.length - 1]
}

function obtenerTramoAnterior(tramo) {
  const index = RANGO_BONUS_ESCALADO.indexOf(tramo)
  return index > 0 ? RANGO_BONUS_ESCALADO[index - 1] : null
}

function interpolar(inicio, fin, avance) {
  return inicio + ((fin - inicio) * avance)
}

function redondearPorcentaje(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100
}

function redondearMultiplicador(valor) {
  return Math.round((Number(valor) || 1) * 100) / 100
}

function leerObjetoLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') || {}
  } catch {
    return {}
  }
}

function slugRango(titulo) {
  return String(titulo || 'Novato')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'novato'
}
