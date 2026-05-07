import { supabase } from "./supabase.js"

export const BOOSTERS_XP = [
  { id: "xp2_24h", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 24 * 60 * 60 * 1000, precio: 1200 },
  { id: "xp2_3d", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 3 * 24 * 60 * 60 * 1000, precio: 2800 },
  { id: "xp4_30d", nombre: "Booster XP x4", multiplicador: 4, duracionMs: 30 * 24 * 60 * 60 * 1000, precio: 15000 },
]

export const COSMETICOS = [
  { id: "fondo_neon", tipo: "fondo", nombre: "Fondo Neon", rareza: "Raro", precio: 1600 },
  { id: "tarjeta_celeste", tipo: "tarjeta", nombre: "Tarjeta Celeste", rareza: "Normal", precio: 700 },
  { id: "id_relampago", tipo: "id", nombre: "ID Relampago", rareza: "Epico", precio: 3200 },
  { id: "marco_corona", tipo: "marco", nombre: "Marco Corona", rareza: "Legendario", precio: 6200 },
  { id: "efecto_mistico", tipo: "efecto", nombre: "Efecto Mistico", rareza: "Mitico", precio: 11000 },
]

const BOOSTER_LOCAL_KEY = "tienda_boosters_usuario"
const COSMETICOS_LOCAL_KEY = "tienda_cosmeticos_usuario"
const MONEDAS_LOCAL_KEY = "tienda_monedas_usuario"

export async function obtenerBonusUsuario(usuario) {
  const activo = await obtenerBoosterActivo(usuario)
  return activo?.multiplicador || 1
}

export async function obtenerBoosterActivo(usuario) {
  const ahoraIso = new Date().toISOString()
  const local = leerBoosterLocal(usuario)

  if (!usuario) return local

  const { data, error } = await supabase
    .from("usuario_boosters")
    .select("booster_id,multiplicador,fecha_fin")
    .eq("usuario_id", usuario)
    .gt("fecha_fin", ahoraIso)
    .order("multiplicador", { ascending: false })
    .order("fecha_fin", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo cargar booster activo", error)
    return local
  }

  return data || local
}

export async function comprarBooster(usuario, boosterId) {
  const booster = BOOSTERS_XP.find((item) => item.id === boosterId)
  if (!usuario || !booster) return { ok: false, error: "Booster invalido" }

  const fechaInicio = new Date()
  const fechaFin = new Date(fechaInicio.getTime() + booster.duracionMs)
  const payload = {
    usuario_id: usuario,
    booster_id: booster.id,
    multiplicador: booster.multiplicador,
    fecha_inicio: fechaInicio.toISOString(),
    fecha_fin: fechaFin.toISOString(),
    activo: true,
  }

  guardarBoosterLocal(usuario, payload)

  const { error } = await supabase
    .from("usuario_boosters")
    .insert(payload)

  if (error) {
    console.warn("No se pudo guardar booster en Supabase", error)
    return { ok: false, booster: payload, error }
  }

  return { ok: true, booster: payload }
}

export async function comprarCosmetico(usuario, cosmeticoId) {
  const cosmetico = COSMETICOS.find((item) => item.id === cosmeticoId)
  if (!usuario || !cosmetico) return { ok: false, error: "Cosmetico invalido" }

  const payload = {
    usuario_id: usuario,
    cosmetico_id: cosmetico.id,
    tipo: cosmetico.tipo,
    rareza: cosmetico.rareza,
    equipado: true,
    created_at: new Date().toISOString(),
  }

  guardarCosmeticoLocal(usuario, payload)

  const { error } = await supabase
    .from("usuario_cosmeticos")
    .upsert(payload, { onConflict: "usuario_id,cosmetico_id" })

  if (error) {
    console.warn("No se pudo guardar cosmetico en Supabase", error)
    return { ok: false, cosmetico: payload, error }
  }

  return { ok: true, cosmetico: payload }
}

export async function obtenerCosmeticoEquipado(usuario) {
  const local = leerCosmeticoLocal(usuario)
  if (!usuario) return local

  const { data, error } = await supabase
    .from("usuario_cosmeticos")
    .select("cosmetico_id,tipo,rareza,equipado")
    .eq("usuario_id", usuario)
    .eq("equipado", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo cargar cosmetico equipado", error)
    return local
  }

  return data || local
}

export function obtenerMonedasDemo(usuario) {
  if (!usuario) return 0
  const monedas = Number(leerObjeto(MONEDAS_LOCAL_KEY)[usuario])
  if (Number.isFinite(monedas) && monedas >= 0) return monedas
  const iniciales = leerObjeto(MONEDAS_LOCAL_KEY)
  iniciales[usuario] = 25000
  localStorage.setItem(MONEDAS_LOCAL_KEY, JSON.stringify(iniciales))
  return iniciales[usuario]
}

export function descontarMonedasDemo(usuario, costo) {
  const monedas = obtenerMonedasDemo(usuario)
  if (monedas < costo) return false
  const actuales = leerObjeto(MONEDAS_LOCAL_KEY)
  actuales[usuario] = monedas - costo
  localStorage.setItem(MONEDAS_LOCAL_KEY, JSON.stringify(actuales))
  return true
}

export function tiempoRestante(fechaFin) {
  const restante = Date.parse(fechaFin) - Date.now()
  if (!Number.isFinite(restante) || restante <= 0) return "Expirado"
  const dias = Math.floor(restante / 86400000)
  const horas = Math.floor((restante % 86400000) / 3600000)
  const minutos = Math.floor((restante % 3600000) / 60000)
  if (dias > 0) return `${dias}d ${horas}h`
  if (horas > 0) return `${horas}h ${minutos}m`
  return `${Math.max(1, minutos)}m`
}

function leerBoosterLocal(usuario) {
  const row = leerObjeto(BOOSTER_LOCAL_KEY)[usuario]
  if (!row || Date.parse(row.fecha_fin) <= Date.now()) return null
  return row
}

function guardarBoosterLocal(usuario, booster) {
  const actuales = leerObjeto(BOOSTER_LOCAL_KEY)
  actuales[usuario] = booster
  localStorage.setItem(BOOSTER_LOCAL_KEY, JSON.stringify(actuales))
}

function leerCosmeticoLocal(usuario) {
  return leerObjeto(COSMETICOS_LOCAL_KEY)[usuario] || null
}

function guardarCosmeticoLocal(usuario, cosmetico) {
  const actuales = leerObjeto(COSMETICOS_LOCAL_KEY)
  actuales[usuario] = cosmetico
  localStorage.setItem(COSMETICOS_LOCAL_KEY, JSON.stringify(actuales))
}

function leerObjeto(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") || {}
  } catch {
    return {}
  }
}
