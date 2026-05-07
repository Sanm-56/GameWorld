import { supabase } from "./supabase.js"

export const BOOSTERS_XP = [
  { id: "xp2_24h", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 24 * 60 * 60 * 1000, precio: 1200, precioReal: "$1.99" },
  { id: "xp2_3d", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 3 * 24 * 60 * 60 * 1000, precio: 2800, precioReal: "$3.99" },
  { id: "xp4_30d", nombre: "Booster XP x4", multiplicador: 4, duracionMs: 30 * 24 * 60 * 60 * 1000, precio: 15000, precioReal: "$14.99" },
]

export const PAQUETES_MONEDAS = [
  { id: "coins_1000", cantidad: 1000, precioReal: "$0.99" },
  { id: "coins_5000", cantidad: 5000, precioReal: "$3.99" },
  { id: "coins_10000", cantidad: 10000, precioReal: "$6.99" },
  { id: "coins_25000", cantidad: 25000, precioReal: "$14.99" },
]

const RAREZAS = [
  { nombre: "Normal", precio: 500, clase: "normal" },
  { nombre: "Poco comun", etiqueta: "Poco común", precio: 950, clase: "poco-comun" },
  { nombre: "Raro", precio: 1600, clase: "raro" },
  { nombre: "Epico", etiqueta: "Épico", precio: 3200, clase: "epico" },
  { nombre: "Legendario", precio: 6200, clase: "legendario" },
  { nombre: "Mitico", etiqueta: "Mítico", precio: 11000, clase: "mitico" },
]

const TEMAS_VISUALES = [
  "Neon", "Aurora", "Solar", "Lunar", "Quantum", "Cyber", "Titan", "Nova", "Obsidiana", "Cristal",
  "Vortex", "Arcade", "Prisma", "Zenit", "Eclipse", "Omega", "Vector", "Plasma", "Onix", "Radiant",
]

const RAREZAS_PREMIUM = [
  { nombre: "Normal", precio: 500, clase: "normal" },
  { nombre: "Raro", precio: 1600, clase: "raro" },
  { nombre: "Epico", etiqueta: "Epico", precio: 3200, clase: "epico" },
  { nombre: "Legendario", precio: 6200, clase: "legendario" },
  { nombre: "Mitico", etiqueta: "Mitico", precio: 11000, clase: "mitico" },
  { nombre: "Prohibido", precio: 18000, clase: "prohibido" },
]

export const ORDEN_RAREZAS_TIENDA = RAREZAS_PREMIUM.map((rareza) => rareza.nombre)

const NUCLEOS_NOMBRE = [
  "Fragmento de Nyx", "Corona del Vacio", "Ecos de Helion", "Ojo Carmesi", "Trono Astral",
  "Abismo de Ether", "Sello de Valkor", "Horizonte Umbrio", "Ultima Constelacion", "Cenizas del Eclipse",
  "Oraculo de Nadir", "Lanza de Kael", "Nexo de Umbra", "Vigilia de Aster", "Llave de Noctis",
  "Catedral de Origen", "Pacto de Lyria", "Pulso de Kron", "Altar de Veyra", "Bastion de Obsidiana",
  "Eco del Primer Rey", "Manto de Seraph", "Umbral de Tharion", "Cicatriz de Orion", "Juramento de Erebos",
  "Nodo de Astra", "Llama de Icaron", "Torre de Kair", "Sombra de Velkan", "Jardin de Ruina",
  "Marca de Solenne", "Latido del Nexus", "Velo de Arkan", "Rastro de Polaris", "Corte de Tenebris",
  "Anillo de Sable", "Camino de Eon", "Cisma de Hel", "Noche de Calyx", "Voz de Ender",
]

const FORMAS_NOMBRE = [
  "El {base}", "{base} Perdido", "{base} Inmortal", "{base} del Exilio", "{base} Prime",
  "La Vigilia del {base}", "Custodio del {base}", "Ascenso del {base}", "Ruina del {base}", "Legado del {base}",
  "El {base} Silente", "{base} de la Arena Final", "Codigo {base}", "Dominio del {base}", "El Ultimo {base}",
]

const DESCRIPCIONES_LORE = [
  "Solo aparece ante quienes sobreviven.",
  "El vacio tambien observa.",
  "Nacido despues del ultimo eclipse.",
  "Nadie volvio igual tras verlo.",
  "Reservado para nombres que pesan en el ranking.",
  "Un juramento grabado antes de la victoria.",
  "Brilla cuando la partida se vuelve imposible.",
  "No concede poder; exige presencia.",
  "Forjado para quienes no retroceden.",
  "Su rastro queda incluso cuando termina el torneo.",
  "Los rivales lo reconocen antes del primer movimiento.",
  "Una senal breve de dominio absoluto.",
  "Donde cae su sombra, empieza la final.",
  "Hecho para sobrevivir al marcador.",
  "La arena recuerda a quien lo porta.",
]

export const COSMETICOS = [
  ...generarCosmeticos("fondo", 100),
  ...generarCosmeticos("id", 100),
  ...generarCosmeticos("marco", 100),
]

const BOOSTER_LOCAL_KEY = "tienda_boosters_usuario"
const COSMETICOS_LOCAL_KEY = "tienda_cosmeticos_usuario"
const MONEDAS_LOCAL_KEY = "monedas_usuario_saldos"
const MONEDAS_HISTORIAL_KEY = "monedas_usuario_historial"
const MONEDAS_POR_ACTIVIDAD = 100

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
    nombre: cosmetico.nombre,
    categoria: cosmetico.categoria,
    diseno: cosmetico.diseno,
    rareza_visual: cosmetico.rareza,
  }

  guardarCosmeticoLocal(usuario, payload)

  const remoto = {
    usuario_id: payload.usuario_id,
    cosmetico_id: payload.cosmetico_id,
    tipo: payload.tipo,
    rareza: rarezaCompatibleSupabase(payload.rareza),
    equipado: payload.equipado,
    created_at: payload.created_at,
  }

  const { error } = await supabase
    .from("usuario_cosmeticos")
    .upsert(remoto, { onConflict: "usuario_id,cosmetico_id" })

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

  return local || data
}

export function obtenerMonedas(usuario) {
  if (!usuario) return 0
  const monedas = Number(leerObjeto(MONEDAS_LOCAL_KEY)[usuario])
  if (Number.isFinite(monedas) && monedas >= 0) return monedas
  guardarMonedas(usuario, 0)
  return 0
}

export function sumarMonedas(usuario, cantidad, detalle = {}) {
  if (!usuario) return 0
  const monto = Math.max(0, Math.trunc(Number(cantidad) || 0))
  if (!monto) return obtenerMonedas(usuario)
  const nuevoSaldo = obtenerMonedas(usuario) + monto
  guardarMonedas(usuario, nuevoSaldo)
  guardarMovimientoMonedas(usuario, "ganancia", monto, detalle)
  return nuevoSaldo
}

export function descontarMonedas(usuario, costo, detalle = {}) {
  const monedas = obtenerMonedas(usuario)
  if (monedas < costo) return false
  guardarMonedas(usuario, monedas - costo)
  guardarMovimientoMonedas(usuario, "compra", -Math.max(0, Number(costo) || 0), detalle)
  return true
}

export function registrarMonedasPorActividad(usuario, { juego, origen = "torneo", accionKey = null } = {}) {
  if (!usuario) return 0
  const key = accionKey || `${origen}:${juego || "actividad"}:${Date.now()}`
  const historial = leerObjeto(MONEDAS_HISTORIAL_KEY)
  const movimientos = Array.isArray(historial[usuario]) ? historial[usuario] : []
  if (movimientos.some((movimiento) => movimiento.key === key)) return obtenerMonedas(usuario)
  return sumarMonedas(usuario, MONEDAS_POR_ACTIVIDAD, {
    key,
    juego,
    origen,
    motivo: "actividad_completada",
  })
}

export const obtenerMonedasDemo = obtenerMonedas
export const descontarMonedasDemo = descontarMonedas

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

export function rarezaEtiqueta(rareza) {
  return RAREZAS_PREMIUM.find((item) => item.nombre === rareza)?.etiqueta || rareza || "Normal"
}

export function rarezaClase(rareza) {
  return RAREZAS_PREMIUM.find((item) => item.nombre === rareza)?.clase || "normal"
}

function generarCosmeticos(tipo, cantidad) {
  const offsetTipo = { fondo: 0, id: 137, marco: 281 }[tipo] || 0
  return Array.from({ length: cantidad }, (_, index) => {
    const numero = index + 1
    const rareza = RAREZAS_PREMIUM[Math.min(RAREZAS_PREMIUM.length - 1, Math.floor(index / Math.ceil(cantidad / RAREZAS_PREMIUM.length)))]
    const intensidad = (index % 10) + 1
    const base = NUCLEOS_NOMBRE[(index + offsetTipo) % NUCLEOS_NOMBRE.length]
    const forma = FORMAS_NOMBRE[(index * 7 + offsetTipo) % FORMAS_NOMBRE.length]
    const nombre = forma.replace("{base}", base)
    return {
      id: `${tipo}_${String(numero).padStart(3, "0")}`,
      tipo,
      categoria: tipo === "id" ? "IDs especiales" : tipo === "marco" ? "Marcos epicos" : "Fondos competitivos",
      nombre,
      descripcion: DESCRIPCIONES_LORE[(index * 5 + tipo.length) % DESCRIPCIONES_LORE.length],
      rareza: rareza.nombre,
      precio: rareza.precio + intensidad * 75,
      diseno: {
        tema: TEMAS_VISUALES[index % TEMAS_VISUALES.length],
        brillo: intensidad,
        patron: ["lineas", "pulso", "anillo", "fragmentos", "halo"][index % 5],
      },
    }
  })
}

function rarezaCompatibleSupabase(rareza) {
  if (rareza === "Prohibido") return "Mitico"
  return rareza
}

function guardarMonedas(usuario, cantidad) {
  const actuales = leerObjeto(MONEDAS_LOCAL_KEY)
  actuales[usuario] = Math.max(0, Math.trunc(Number(cantidad) || 0))
  localStorage.setItem(MONEDAS_LOCAL_KEY, JSON.stringify(actuales))
}

function guardarMovimientoMonedas(usuario, tipo, cantidad, detalle) {
  const historial = leerObjeto(MONEDAS_HISTORIAL_KEY)
  const movimientos = Array.isArray(historial[usuario]) ? historial[usuario] : []
  movimientos.unshift({
    key: detalle?.key || `${tipo}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    tipo,
    cantidad,
    saldo: obtenerMonedas(usuario),
    detalle,
    fecha: new Date().toISOString(),
  })
  historial[usuario] = movimientos.slice(0, 80)
  localStorage.setItem(MONEDAS_HISTORIAL_KEY, JSON.stringify(historial))
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
