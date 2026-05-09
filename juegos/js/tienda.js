import { supabase } from "./supabase.js"
import { aplicarBonusMonedas, obtenerBonusRangoActivo } from "./rango-bonus.js"

export const BOOSTERS_XP = [
  { id: "xp15_6h", nombre: "Booster XP x1.5", multiplicador: 1.5, duracionMs: 6 * 60 * 60 * 1000, precio: 400, precioReal: "$0.49", rareza: "Inicial", etiqueta: "Oferta" },
  { id: "xp2_24h", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 24 * 60 * 60 * 1000, precio: 1200, precioReal: "$1.99", rareza: "Competitivo", etiqueta: "Popular" },
  { id: "xp2_3d", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 3 * 24 * 60 * 60 * 1000, precio: 2800, precioReal: "$3.99", rareza: "Competitivo", etiqueta: "Recomendado" },
  { id: "xp25_7d", nombre: "Booster XP x2.5", multiplicador: 2.5, duracionMs: 7 * 24 * 60 * 60 * 1000, precio: 5500, precioReal: "$6.99", rareza: "Elite", etiqueta: "Mejor valor" },
  { id: "xp3_7d", nombre: "Booster XP x3", multiplicador: 3, duracionMs: 7 * 24 * 60 * 60 * 1000, precio: 8000, precioReal: "$9.99", rareza: "Elite", etiqueta: "Popular" },
  { id: "xp3_15d", nombre: "Booster XP x3", multiplicador: 3, duracionMs: 15 * 24 * 60 * 60 * 1000, precio: 14000, precioReal: "$14.99", rareza: "Epico", etiqueta: "Recomendado" },
  { id: "xp4_30d", nombre: "Booster XP x4", multiplicador: 4, duracionMs: 30 * 24 * 60 * 60 * 1000, precio: 22000, precioReal: "$19.99", rareza: "Legendario", etiqueta: "Mejor valor" },
  { id: "xp5_30d", nombre: "Booster XP x5", multiplicador: 5, duracionMs: 30 * 24 * 60 * 60 * 1000, precio: 35000, precioReal: "$29.99", rareza: "Mitico", etiqueta: "Oferta" },
  { id: "xp6_45d", nombre: "Booster Legendario x6", multiplicador: 6, duracionMs: 45 * 24 * 60 * 60 * 1000, precio: 55000, precioReal: "$39.99", rareza: "Legendario", etiqueta: "Premium" },
  { id: "xp8_60d", nombre: "Booster Supremo x8", multiplicador: 8, duracionMs: 60 * 24 * 60 * 60 * 1000, precio: 95000, precioReal: "$59.99", rareza: "Supremo", etiqueta: "Maximo poder" },
]

export const BOOSTERS_MONEDAS = [
  { id: "coins_boost12_24d", nombre: "Impulso Monedas x1.2", multiplicador: 1.2, duracionMs: 24 * 24 * 60 * 60 * 1000, precio: 5200, precioReal: "$4.99", rareza: "Inicial", etiqueta: "Recomendado", descripcion: "Ideal para jugadores casuales" },
  { id: "coins_boost13_18d", nombre: "Impulso Monedas x1.3", multiplicador: 1.3, duracionMs: 18 * 24 * 60 * 60 * 1000, precio: 4800, precioReal: "$4.49", rareza: "Competitivo", etiqueta: "Popular", descripcion: "Bonus estable y economico" },
  { id: "coins_boost15_12d", nombre: "Impulso Monedas x1.5", multiplicador: 1.5, duracionMs: 12 * 24 * 60 * 60 * 1000, precio: 6200, precioReal: "$5.99", rareza: "Elite", etiqueta: "Mejor Oferta", descripcion: "Balanceado entre duracion y ganancia" },
  { id: "coins_boost14_3d", nombre: "Impulso Monedas x1.4", multiplicador: 1.4, duracionMs: 3 * 24 * 60 * 60 * 1000, precio: 2600, precioReal: "$2.49", rareza: "Evento", etiqueta: "Evento", descripcion: "Larga duracion sin romper economia" },
  { id: "coins_boost18_2d", nombre: "Impulso Monedas x1.8", multiplicador: 1.8, duracionMs: 2 * 24 * 60 * 60 * 1000, precio: 3400, precioReal: "$3.49", rareza: "Premium", etiqueta: "Premium", descripcion: "Ideal para sesiones competitivas" },
  { id: "coins_boost27_8h", nombre: "Impulso Monedas x2.7", multiplicador: 2.7, duracionMs: 8 * 60 * 60 * 1000, precio: 4200, precioReal: "$4.49", rareza: "Legendario", etiqueta: "Destacado", descripcion: "Balanceado para jugadores activos" },
  { id: "coins_boost2_3h", nombre: "Impulso Monedas x2", multiplicador: 2, duracionMs: 3 * 60 * 60 * 1000, precio: 1800, precioReal: "$1.99", rareza: "Epico", etiqueta: "Epico", descripcion: "Boost intenso pero corto" },
  { id: "coins_boost22_2h", nombre: "Impulso Monedas x2.2", multiplicador: 2.2, duracionMs: 2 * 60 * 60 * 1000, precio: 2100, precioReal: "$2.49", rareza: "Limitado", etiqueta: "Limitado", descripcion: "Orientado a torneos rapidos" },
  { id: "coins_boost25_1h", nombre: "Impulso Monedas x2.5", multiplicador: 2.5, duracionMs: 60 * 60 * 1000, precio: 2400, precioReal: "$2.79", rareza: "Ultra", etiqueta: "Ultra", descripcion: "Muy fuerte pero controlado" },
  { id: "coins_boost3_1h", nombre: "Impulso Monedas x3", multiplicador: 3, duracionMs: 60 * 60 * 1000, precio: 3200, precioReal: "$3.49", rareza: "Extremo", etiqueta: "Extremo", descripcion: "Riesgo/recompensa alto" },
]

export const PAQUETES_MONEDAS = [
  { id: "coins_1000", cantidad: 1000, precioReal: "$0.99" },
  { id: "coins_2500", cantidad: 2500, precioReal: "$1.99" },
  { id: "coins_5000", cantidad: 5000, precioReal: "$3.99" },
  { id: "coins_8000", cantidad: 8000, precioReal: "$5.99", etiqueta: "Popular" },
  { id: "coins_12000", cantidad: 12000, precioReal: "$8.99", etiqueta: "Recomendado" },
  { id: "coins_18000", cantidad: 18000, precioReal: "$12.99" },
  { id: "coins_25000", cantidad: 25000, precioReal: "$16.99", etiqueta: "Competitivo" },
  { id: "coins_40000", cantidad: 40000, bonus: 5000, precioReal: "$24.99", etiqueta: "Mejor valor" },
  { id: "coins_65000", cantidad: 65000, bonus: 10000, precioReal: "$39.99", etiqueta: "Oferta" },
  { id: "coins_100000", cantidad: 100000, bonus: 20000, regalo: "Booster XP x2 gratis", precioReal: "$59.99", etiqueta: "Premium" },
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
  { nombre: "Normal", precio: 2000, clase: "normal" },
  { nombre: "Raro", precio: 5000, clase: "raro" },
  { nombre: "Epico", etiqueta: "Epico", precio: 12000, clase: "epico" },
  { nombre: "Legendario", precio: 30000, clase: "legendario" },
  { nombre: "Mitico", etiqueta: "Mitico", precio: 70000, clase: "mitico" },
  { nombre: "Prohibido", precio: 180000, clase: "prohibido" },
]

export const ORDEN_RAREZAS_TIENDA = RAREZAS_PREMIUM.map((rareza) => rareza.nombre)

const PRECIOS_COSMETICOS = {
  fondo: {
    Normal: { monedas: 2500, real: "$0.99", etiqueta: "Popular" },
    Raro: { monedas: 6000, real: "$1.99", etiqueta: "Recomendado" },
    Epico: { monedas: 14000, real: "$4.99", etiqueta: "Premium" },
    Legendario: { monedas: 35000, real: "$9.99", etiqueta: "Exclusivo" },
    Mitico: { monedas: 80000, real: "$19.99", etiqueta: "Ultra raro" },
    Prohibido: { monedas: 200000, real: "$39.99", etiqueta: "Limitado" },
  },
  id: {
    Normal: { monedas: 2000, real: "$0.79", etiqueta: "Popular" },
    Raro: { monedas: 5000, real: "$1.79", etiqueta: "Recomendado" },
    Epico: { monedas: 12000, real: "$4.49", etiqueta: "Premium" },
    Legendario: { monedas: 30000, real: "$8.99", etiqueta: "Exclusivo" },
    Mitico: { monedas: 70000, real: "$17.99", etiqueta: "Ultra raro" },
    Prohibido: { monedas: 180000, real: "$34.99", etiqueta: "Limitado" },
  },
  marco: {
    Normal: { monedas: 2000, real: "$0.79", etiqueta: "Popular" },
    Raro: { monedas: 5000, real: "$1.79", etiqueta: "Recomendado" },
    Epico: { monedas: 12000, real: "$4.49", etiqueta: "Premium" },
    Legendario: { monedas: 30000, real: "$8.99", etiqueta: "Exclusivo" },
    Mitico: { monedas: 70000, real: "$17.99", etiqueta: "Ultra raro" },
    Prohibido: { monedas: 180000, real: "$34.99", etiqueta: "Limitado" },
  },
}

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
const COIN_BOOSTER_LOCAL_KEY = "tienda_coin_boosters_usuario"
const COSMETICOS_LOCAL_KEY = "tienda_cosmeticos_usuario"
const MONEDAS_LOCAL_KEY = "monedas_usuario_saldos"
const MONEDAS_HISTORIAL_KEY = "monedas_usuario_historial"
export const RECOMPENSAS_MONEDAS = {
  torneo: 300,
  minitorneo: 150,
  nivel: 150,
  posicion: {
    1: 200,
    2: 100,
    3: 50,
  },
}

export async function obtenerBonusUsuario(usuario) {
  const activo = await obtenerBoosterActivo(usuario)
  return activo?.multiplicador || 1
}

export async function obtenerBoosterActivo(usuario) {
  return obtenerBoosterTemporalActivo(usuario, BOOSTERS_XP, BOOSTER_LOCAL_KEY)
}

export async function obtenerBoosterMonedasActivo(usuario) {
  return obtenerBoosterTemporalActivo(usuario, BOOSTERS_MONEDAS, COIN_BOOSTER_LOCAL_KEY)
}

async function obtenerBoosterTemporalActivo(usuario, catalogo, localKey) {
  const ahoraIso = new Date().toISOString()
  const local = leerBoosterLocal(usuario, localKey, catalogo)
  const idsValidos = new Set(catalogo.map((item) => item.id))

  if (!usuario) return local

  const { data, error } = await supabase
    .from("usuario_boosters")
    .select("booster_id,multiplicador,fecha_fin")
    .eq("usuario_id", usuario)
    .gt("fecha_fin", ahoraIso)
    .order("multiplicador", { ascending: false })
    .order("fecha_fin", { ascending: false })
    .limit(20)

  if (error) {
    console.warn("No se pudo cargar booster activo", error)
    return local
  }

  return (data || []).find((row) => idsValidos.has(row.booster_id)) || local
}

export async function comprarBooster(usuario, boosterId) {
  const booster = BOOSTERS_XP.find((item) => item.id === boosterId)
  return comprarBoosterTemporal(usuario, booster, BOOSTER_LOCAL_KEY)
}

export async function comprarBoosterMonedas(usuario, boosterId) {
  const booster = BOOSTERS_MONEDAS.find((item) => item.id === boosterId)
  return comprarBoosterTemporal(usuario, booster, COIN_BOOSTER_LOCAL_KEY)
}

async function comprarBoosterTemporal(usuario, booster, localKey) {
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

  guardarBoosterLocal(usuario, payload, localKey)

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

export function obtenerHistorialMonedas(usuario) {
  if (!usuario) return []
  const movimientos = leerObjeto(MONEDAS_HISTORIAL_KEY)[usuario]
  return Array.isArray(movimientos) ? movimientos : []
}

export function calcularRecompensaMonedas({ origen = "torneo", posicion = null, resultadoNivel = null } = {}) {
  const origenNormalizado = origen === "solitario" ? "nivel" : origen
  const esNivel = origenNormalizado === "nivel"
  const base = esNivel
    ? resultadoNivel?.newlyCompleted ? RECOMPENSAS_MONEDAS.nivel : 0
    : origenNormalizado === "minitorneo" ? RECOMPENSAS_MONEDAS.minitorneo : RECOMPENSAS_MONEDAS.torneo
  const bonus = esNivel ? 0 : RECOMPENSAS_MONEDAS.posicion[Number(posicion)] || 0
  return {
    base,
    bonus,
    total: base + bonus,
    origen: origenNormalizado,
  }
}

export async function registrarMonedasPorActividad(usuario, { juego, origen = "torneo", posicion = null, resultadoNivel = null, accionKey = null } = {}) {
  if (!usuario) return 0
  const recompensa = calcularRecompensaMonedas({ origen, posicion, resultadoNivel })
  if (!recompensa.total) return obtenerMonedas(usuario)
  const bonusRango = obtenerBonusRangoActivo(usuario)
  const recompensaConRango = aplicarBonusMonedas(recompensa.total, bonusRango)
  const boosterMonedas = await obtenerBoosterMonedasActivo(usuario)
  const recompensaConBooster = aplicarBoosterMonedas(recompensaConRango.total, boosterMonedas)
  const key = accionKey || `${recompensa.origen}:${juego || "actividad"}:${Date.now()}`
  const historial = leerObjeto(MONEDAS_HISTORIAL_KEY)
  const movimientos = Array.isArray(historial[usuario]) ? historial[usuario] : []
  if (movimientos.some((movimiento) => movimiento.key === key)) return obtenerMonedas(usuario)
  return sumarMonedas(usuario, recompensaConBooster.total, {
    key,
    juego,
    origen: recompensa.origen,
    posicion,
    recompensaBase: recompensa.base,
    bonusPosicion: recompensa.bonus,
    bonusRango: recompensaConRango.bonusRango,
    bonusRangoPorcentaje: bonusRango.monedas,
    boosterMonedas: boosterMonedas?.multiplicador || 1,
    bonusBoosterMonedas: recompensaConBooster.bonusBooster,
    boosterMonedasId: boosterMonedas?.booster_id || null,
    rangoActivo: bonusRango.titulo,
    motivo: recompensa.origen === "nivel" ? "nivel_completado" : `${recompensa.origen}_completado`,
    nivel: resultadoNivel?.level?.id || null,
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

function aplicarBoosterMonedas(cantidad, booster) {
  const base = Math.max(0, Math.trunc(Number(cantidad) || 0))
  const multiplicador = Math.max(1, Number(booster?.multiplicador) || 1)
  const total = Math.floor(base * multiplicador)
  return {
    base,
    multiplicador,
    bonusBooster: Math.max(0, total - base),
    total,
  }
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
    const precio = precioCosmetico(tipo, rareza.nombre)
    return {
      id: `${tipo}_${String(numero).padStart(3, "0")}`,
      tipo,
      categoria: tipo === "id" ? "IDs especiales" : tipo === "marco" ? "Marcos epicos" : "Fondos competitivos",
      nombre,
      descripcion: DESCRIPCIONES_LORE[(index * 5 + tipo.length) % DESCRIPCIONES_LORE.length],
      rareza: rareza.nombre,
      precio: precio.monedas,
      precioReal: precio.real,
      etiqueta: precio.etiqueta,
      diseno: crearDisenoCosmetico(tipo, rareza.nombre, index, intensidad),
    }
  })
}

function crearDisenoCosmetico(tipo, rareza, index, intensidad) {
  const base = {
    tema: TEMAS_VISUALES[index % TEMAS_VISUALES.length],
    brillo: intensidad,
    patron: ["lineas", "pulso", "anillo", "fragmentos", "halo"][index % 5],
  }

  if (tipo === "marco") {
    const perfilesMarco = {
      Normal: { hues: [204, 212, 198, 188, 220], accents: [190, 202, 184, 196, 210], luz: 18, luzVar: 16, profundidad: 30, profVar: 18, pulso: false },
      Raro: { hues: [192, 184, 174, 166, 202], accents: [188, 178, 160, 196, 172], luz: 38, luzVar: 24, profundidad: 48, profVar: 24, pulso: true },
      Epico: { hues: [268, 276, 286, 252, 296], accents: [292, 264, 318, 238, 284], luz: 42, luzVar: 26, profundidad: 58, profVar: 24, pulso: true },
      Legendario: { hues: [42, 36, 28, 4, 218], accents: [48, 38, 12, 0, 210], luz: 52, luzVar: 28, profundidad: 66, profVar: 22, pulso: true },
      Mitico: { hues: [194, 178, 268, 154, 210], accents: [184, 166, 286, 142, 224], luz: 48, luzVar: 28, profundidad: 70, profVar: 24, pulso: true },
      Prohibido: { hues: [270, 292, 352, 196, 0], accents: [188, 336, 0, 214, 286], luz: 34, luzVar: 26, profundidad: 78, profVar: 18, pulso: true },
    }
    const perfil = perfilesMarco[rareza] || perfilesMarco.Normal
    return {
      ...base,
      marco: {
        estructura: index % 16,
        esquina: (index * 5 + 2) % 14,
        borde: (index * 7 + 3) % 12,
        linea: (index * 11 + 1) % 12,
        panel: (index * 13 + 4) % 10,
        textura: (index * 17 + 6) % 10,
        luz: perfil.luz + ((index * 7) % perfil.luzVar),
        profundidad: perfil.profundidad + ((index * 11) % perfil.profVar),
        hue: perfil.hues[index % perfil.hues.length] + ((index * 3) % 10),
        accent: perfil.accents[index % perfil.accents.length] + ((index * 5) % 16),
        corte: (index * 19 + 5) % 12,
        pulso: perfil.pulso ? (index * 23 + intensidad) % 8 : -1,
        glifo: (index * 29 + 7) % 12,
        aura: (index * 31 + 3) % 10,
        reliquia: (index * 37 + 9) % 12,
        anomalia: (index * 41 + intensidad) % 10,
      },
    }
  }

  if (tipo === "id") {
    const perfilesId = {
      Normal: {
        hues: [214, 206, 198, 220, 188],
        accents: [190, 198, 184, 204, 212],
        luz: 16,
        luzVar: 12,
        profundidad: 24,
        profVar: 14,
        pulso: false,
        pools: {
          silueta: [0, 1, 2, 4, 5, 12],
          forma: [0, 1, 2, 5, 6, 11],
          tamano: [0, 1, 2, 3, 9],
          corte: [0, 1, 2, 5, 8, 10],
          placa: [2, 5, 7, 10],
          esquina: [0, 1, 4, 5, 10],
          borde: [0, 1, 2, 6, 10],
          linea: [0, 1, 2, 5, 7, 10],
          panel: [0, 1, 2, 5, 6],
          simbolo: [0, 2, 5, 7, 10, 12],
          geometria: [0, 1, 5, 8, 9],
          textura: [0, 1, 2, 5, 9],
          reflejo: [0, 5, 8],
          energia: [0, 4],
        },
      },
      Raro: {
        hues: [202, 192, 184, 174, 166],
        accents: [188, 180, 170, 196, 162],
        luz: 30,
        luzVar: 18,
        profundidad: 42,
        profVar: 18,
        pulso: true,
        pools: {
          silueta: [3, 6, 7, 8, 10, 11],
          forma: [1, 2, 3, 4, 8, 9],
          tamano: [1, 2, 4, 5, 6],
          corte: [1, 3, 4, 6, 7, 11],
          placa: [1, 3, 4, 6, 8],
          esquina: [1, 2, 3, 6, 7, 11],
          borde: [1, 2, 5, 7, 8, 9, 12],
          linea: [2, 3, 4, 6, 8, 9, 12],
          panel: [2, 3, 4, 7, 8],
          simbolo: [1, 3, 4, 6, 8, 9, 13],
          geometria: [1, 3, 4, 6, 7, 10],
          textura: [2, 3, 4, 6, 7, 10],
          reflejo: [1, 2, 3, 5, 6, 8],
          energia: [1, 2, 3, 5, 8],
        },
      },
      Epico: {
        hues: [262, 274, 286, 252, 296],
        accents: [292, 316, 278, 238, 304],
        luz: 36,
        luzVar: 22,
        profundidad: 54,
        profVar: 22,
        pulso: true,
        pools: {
          silueta: [9, 13, 14, 15, 16, 17, 18, 19],
          forma: [3, 4, 7, 8, 9, 10, 12],
          tamano: [2, 4, 5, 6, 7, 8],
          corte: [3, 4, 6, 7, 9, 11],
          placa: [1, 3, 4, 6, 9, 11, 12],
          esquina: [2, 3, 5, 7, 8, 10, 12],
          borde: [4, 5, 7, 8, 9, 12, 14, 15],
          linea: [3, 4, 5, 8, 9, 11, 13, 14],
          panel: [3, 4, 7, 8, 9, 10, 12],
          simbolo: [1, 3, 4, 6, 8, 9, 11, 13, 14],
          geometria: [3, 4, 6, 7, 8, 10, 11],
          textura: [3, 4, 6, 7, 8, 10, 11, 12],
          reflejo: [1, 2, 4, 6, 7, 8, 10],
          energia: [2, 3, 5, 6, 7, 8, 10],
        },
      },
      Legendario: {
        hues: [42, 36, 28, 8, 216],
        accents: [48, 38, 14, 2, 210],
        luz: 48,
        luzVar: 22,
        profundidad: 64,
        profVar: 22,
        pulso: true,
        pools: {
          silueta: [18, 19, 20, 21, 22, 23],
          forma: [4, 8, 9, 10, 12, 14, 15],
          tamano: [3, 5, 6, 7, 8],
          corte: [4, 7, 9, 10, 11, 12, 13],
          placa: [9, 11, 12, 13, 14, 15],
          esquina: [5, 8, 9, 10, 12, 13],
          borde: [12, 13, 14, 15, 16, 17],
          linea: [8, 9, 11, 13, 14, 15],
          panel: [8, 9, 10, 11, 12, 13],
          simbolo: [8, 9, 11, 13, 14, 15, 16],
          geometria: [6, 8, 10, 11, 12, 13],
          textura: [7, 8, 10, 11, 12, 13],
          reflejo: [4, 6, 7, 8, 9, 10, 11],
          energia: [3, 5, 6, 7, 8, 10, 11],
        },
      },
      Mitico: {
        hues: [184, 198, 166, 270, 154],
        accents: [174, 204, 150, 286, 222],
        luz: 44,
        luzVar: 24,
        profundidad: 68,
        profVar: 22,
        pulso: true,
        pools: {
          silueta: [20, 21, 23, 24, 25, 26],
          forma: [7, 9, 10, 12, 14, 15, 16],
          tamano: [4, 6, 7, 8, 9],
          corte: [7, 9, 11, 12, 13, 14],
          placa: [12, 13, 14, 15, 16, 17],
          esquina: [8, 9, 11, 12, 13, 14],
          borde: [15, 16, 17, 18, 19],
          linea: [9, 11, 13, 14, 15, 16],
          panel: [10, 11, 12, 13, 14],
          simbolo: [13, 14, 15, 16, 17, 18],
          geometria: [10, 11, 12, 13, 14],
          textura: [10, 11, 12, 13, 14],
          reflejo: [7, 8, 9, 10, 11, 12],
          energia: [6, 7, 8, 10, 11, 12],
        },
      },
      Prohibido: {
        hues: [268, 292, 352, 196, 0],
        accents: [188, 336, 0, 214, 286],
        luz: 30,
        luzVar: 22,
        profundidad: 76,
        profVar: 18,
        pulso: true,
        pools: {
          silueta: [24, 25, 26, 27, 28, 29],
          forma: [10, 12, 14, 15, 16, 17],
          tamano: [4, 6, 7, 8, 9],
          corte: [9, 11, 12, 13, 14, 15],
          placa: [14, 15, 16, 17, 18, 19],
          esquina: [9, 11, 12, 13, 14, 15],
          borde: [17, 18, 19, 20, 21],
          linea: [11, 13, 14, 15, 16, 17],
          panel: [11, 12, 13, 14, 15],
          simbolo: [15, 16, 17, 18, 19, 20],
          geometria: [11, 12, 13, 14, 15],
          textura: [11, 12, 13, 14, 15],
          reflejo: [8, 9, 10, 11, 12, 13],
          energia: [8, 10, 11, 12, 13],
        },
      },
    }
    const perfil = perfilesId[rareza] || perfilesId.Normal
    const pick = (nombre, paso, salto = 0) => {
      const pool = perfil.pools[nombre]
      const spread = index * paso + intensidad * (salto + 1) + salto
      return pool[((spread % pool.length) + pool.length) % pool.length]
    }
    return {
      ...base,
      id: {
        silueta: pick("silueta", 7, 1),
        forma: pick("forma", 5, 3),
        tamano: pick("tamano", 3, 5),
        corte: pick("corte", 11, 7),
        placa: pick("placa", 13, 2),
        esquina: pick("esquina", 17, 4),
        profundidad: perfil.profundidad + ((index * 13) % perfil.profVar),
        borde: pick("borde", 19, 6),
        linea: pick("linea", 23, 8),
        panel: pick("panel", 29, 10),
        simbolo: pick("simbolo", 31, 12),
        geometria: pick("geometria", 37, 14),
        textura: pick("textura", 41, 16),
        reflejo: pick("reflejo", 43, 18),
        energia: pick("energia", 47, 20),
        pulso: perfil.pulso ? (index * 53 + intensidad) % 8 : -1,
        hue: perfil.hues[index % perfil.hues.length] + ((index * 3) % 9),
        accent: perfil.accents[index % perfil.accents.length] + ((index * 5) % 14),
        luz: perfil.luz + ((index * 7) % perfil.luzVar),
      },
    }
  }

  if (tipo !== "fondo") return base

  const perfilesFondo = {
    Normal: { paleta: "normal", hue: 198 + ((index * 11) % 28), accent: 188 + ((index * 7) % 26), luz: 12 + ((index * 5) % 24), profundidad: 28 + ((index * 9) % 28) },
    Raro: { paleta: "rare", hue: 184 + ((index * 19) % 42), accent: 166 + ((index * 13) % 54), luz: 26 + ((index * 7) % 48), profundidad: 38 + ((index * 11) % 34) },
    Epico: { paleta: "epic", hue: 252 + ((index * 17) % 54), accent: 286 + ((index * 23) % 42), luz: 24 + ((index * 11) % 42), profundidad: 48 + ((index * 13) % 34) },
    Legendario: { paleta: "legendary", hue: 36 + ((index * 13) % 24), accent: [42, 32, 8, 48, 214][index % 5], luz: 34 + ((index * 7) % 38), profundidad: 56 + ((index * 17) % 30) },
    Mitico: { paleta: "mythic", hue: [184, 196, 172, 268, 154][index % 5] + ((index * 7) % 16), accent: [174, 204, 278, 150, 226][index % 5], luz: 30 + ((index * 13) % 42), profundidad: 62 + ((index * 11) % 26) },
    Prohibido: { paleta: "forbidden", hue: [268, 286, 352, 196, 0][index % 5] + ((index * 5) % 12), accent: [186, 354, 280, 210, 0][index % 5], luz: 18 + ((index * 17) % 34), profundidad: 70 + ((index * 19) % 24) },
  }

  const fondoBase = perfilesFondo[rareza]
  if (!fondoBase) return base

  return {
    ...base,
    fondo: {
      ...fondoBase,
      layout: index % 12,
      textura: Math.floor(index / 2) % 10,
      simbolo: (index * 5 + 3) % 12,
      panel: (index * 7 + 1) % 8,
      focoX: 18 + ((index * 17) % 64),
      focoY: 16 + ((index * 23) % 62),
      angulo: (index * 37) % 360,
      energia: (index * 11 + intensidad) % 12,
      fractura: (index * 13 + 2) % 10,
      reliquia: (index * 17 + 5) % 9,
    },
  }
}

function precioCosmetico(tipo, rareza) {
  return PRECIOS_COSMETICOS[tipo]?.[rareza] || {
    monedas: RAREZAS_PREMIUM.find((item) => item.nombre === rareza)?.precio || 2000,
    real: "$0.79",
    etiqueta: "Popular",
  }
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

function leerBoosterLocal(usuario, key = BOOSTER_LOCAL_KEY, catalogo = BOOSTERS_XP) {
  const row = leerObjeto(key)[usuario]
  if (!row || Date.parse(row.fecha_fin) <= Date.now()) return null
  if (!catalogo.some((item) => item.id === row.booster_id)) return null
  return row
}

function guardarBoosterLocal(usuario, booster, key = BOOSTER_LOCAL_KEY) {
  const actuales = leerObjeto(key)
  actuales[usuario] = booster
  localStorage.setItem(key, JSON.stringify(actuales))
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
