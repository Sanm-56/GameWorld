import { supabase } from "../../js/supabase.js"
import { registrarPartidaDesdeRanking } from "../../js/partidas.js"
import { bloquearFinalizacionInicialSolitario, debeSalirDelTorneo, obtenerTiempoRestanteTorneo, registrarPuntosMiniTorneo, salidaTorneoUrl } from "../../js/mini-torneo.js"

const DURACION = 600
const JUEGO_ACTUAL = "flashmind"
const MAX_ADVERTENCIAS = 3
const BASE_VENTANA_MS = 1300
const MAX_REACTION_CAP_MS = 550
const ACIERTOS_POR_NIVEL = 20
const PENALIZACION_TIMEOUT_MS = 2000
const PENALIZACION_ERROR_BASE_MS = 900

const usuario = localStorage.getItem("usuario") || "Invitado"
document.getElementById("usuarioLabel").innerText = usuario

const pantalla = document.getElementById("pantalla")
const logEl = document.getElementById("log")
const botonera = document.getElementById("botonera")

const rondaEl = document.getElementById("ronda")
const aciertosEl = document.getElementById("aciertos")
const nivelEl = document.getElementById("nivel")
const promedioEl = document.getElementById("promedio")

let advertencias = 0
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false
let ultimoCambio = 0

let ronda = 0
let aciertos = 0
let nivel = 1
let rachaCorrectas = 0
let mejorRachaCorrectas = 0

let esperando = false
let objetivoActual = null
let tInicio = 0
let timeoutId = null

let sumaMs = 0
let totalIntentos = 0

const opciones = [
  { key: "A", label: "A", name: "ROJO", color: "#ef4444", symbol: "\u25cf" },
  { key: "S", label: "S", name: "AZUL", color: "#3b82f6", symbol: "\u25a0" },
  { key: "K", label: "K", name: "VERDE", color: "#22c55e", symbol: "\u25b2" },
  { key: "L", label: "L", name: "AMARILLO", color: "#f59e0b", symbol: "\u25c6" },
]

function setLog(text) {
  logEl.innerText = text
}

function calcularNivel() {
  return 1 + Math.floor(aciertos / ACIERTOS_POR_NIVEL)
}

function actualizarStats() {
  nivel = calcularNivel()
  rondaEl.innerText = String(ronda)
  aciertosEl.innerText = String(aciertos)
  nivelEl.innerText = String(nivel)

  if (totalIntentos > 0) {
    const prom = Math.round(sumaMs / totalIntentos)
    promedioEl.innerText = `${prom} ms`
  } else {
    promedioEl.innerText = "-"
  }
}

function renderBotones() {
  botonera.innerHTML = ""
  opciones.forEach((op) => {
    const b = document.createElement("button")
    b.className = "btn"
    b.style.background = `linear-gradient(135deg, ${op.color}, rgba(255,255,255,0.08))`
    b.innerHTML = `${op.name}<span class="small">Tecla ${op.label}</span>`
    b.onclick = () => elegir(op.key)
    botonera.appendChild(b)
  })
}

function escogerObjetivo() {
  const op = opciones[Math.floor(Math.random() * opciones.length)]
  const tipo = Math.random() < 0.5 ? "color" : "symbol"
  return { op, tipo }
}

function mostrarObjetivo(obj) {
  if (obj.tipo === "color") {
    pantalla.innerText = " "
    pantalla.style.background = obj.op.color
    pantalla.style.color = "rgba(0,0,0,0.2)"
  } else {
    pantalla.innerText = obj.op.symbol
    pantalla.style.background = "rgba(15,23,42,0.75)"
    pantalla.style.color = obj.op.color
  }
}

function limpiarPantalla() {
  pantalla.innerText = "?"
  pantalla.style.background = "rgba(15,23,42,0.75)"
  pantalla.style.color = "#f8fafc"
}

function getVentanaMs() {
  const reduccion = Math.floor(aciertos / ACIERTOS_POR_NIVEL) * 80
  return Math.max(MAX_REACTION_CAP_MS, BASE_VENTANA_MS - reduccion)
}

function siguienteRonda() {
  if (juegoTerminado) return
  if (timeoutId) clearTimeout(timeoutId)

  ronda++
  actualizarStats()

  objetivoActual = escogerObjetivo()
  mostrarObjetivo(objetivoActual)
  esperando = true
  tInicio = performance.now()

  const ventana = getVentanaMs()
  setLog(`Ya. Ventana: ${ventana} ms`)

  timeoutId = setTimeout(() => {
    if (!esperando || juegoTerminado) return

    esperando = false
    totalIntentos++
    sumaMs += PENALIZACION_TIMEOUT_MS
    rachaCorrectas = 0
    setLog(`Muy lento. Penalizacion +${PENALIZACION_TIMEOUT_MS}ms`)
    limpiarPantalla()
    actualizarStats()
    setTimeout(siguienteRonda, 220)
  }, ventana)
}

function elegir(key) {
  if (!esperando || juegoTerminado) return
  if (!objetivoActual) return

  const ahora = performance.now()
  const rt = Math.max(0, Math.round(ahora - tInicio))

  const ok = key.toUpperCase() === objetivoActual.op.key
  esperando = false
  if (timeoutId) clearTimeout(timeoutId)

  totalIntentos++

  if (ok) {
    aciertos++
    rachaCorrectas++
    mejorRachaCorrectas = Math.max(mejorRachaCorrectas, rachaCorrectas)
    sumaMs += rt
    setLog(`Correcto: ${rt} ms`)
  } else {
    rachaCorrectas = 0
    sumaMs += Math.max(1200, rt + PENALIZACION_ERROR_BASE_MS)
    setLog(`Incorrecto (${key}). Penalizacion`)
  }

  actualizarStats()
  limpiarPantalla()
  setTimeout(siguienteRonda, 220)
}

async function descalificarPorActividadSospechosa() {
  if (juegoTerminado) return

  descalificado = true
  juegoTerminado = true
  if (timeoutId) clearTimeout(timeoutId)

  localStorage.setItem("fin_juego", "descalificado")
  alert("Descalificado por actividad sospechosa")
  await enviarResultado("descalificado")
  window.location.href = "final.html"
}

async function marcarAdvertencia() {
  advertencias++

  if (advertencias >= MAX_ADVERTENCIAS) {
    setLog("Descalificado por actividad sospechosa")
    await descalificarPorActividadSospechosa()
  } else {
    alert(advertencias === 1 ? "No cambies de pestana" : "Ultima advertencia")
    setLog(`Cambio de pestana detectado (${advertencias}/${MAX_ADVERTENCIAS})`)
  }
}

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden || juegoTerminado) return

  const ahora = Date.now()
  if (ahora - ultimoCambio < 3000) return
  ultimoCambio = ahora

  await marcarAdvertencia()
})

document.addEventListener("keydown", (e) => {
  const k = e.key.toUpperCase()
  if (["A", "S", "K", "L"].includes(k)) elegir(k)
})

async function iniciarCronometro() {
  const reloj = document.getElementById("reloj")

  let restante = await obtenerTiempoRestanteTorneo(supabase, JUEGO_ACTUAL, DURACION)
  if (restante === null) {
    console.warn("No hay inicio valido para flashmind")
    return
  }
  let intervalo = null

  function pintarReloj() {
    const min = Math.floor(restante / 60)
    const seg = restante % 60
    reloj.innerText = min + ":" + (seg < 10 ? "0" : "") + seg
  }

  async function tick() {
    restante--

    if (restante <= 0) {
      if (bloquearFinalizacionInicialSolitario(JUEGO_ACTUAL, "cronometro flashmind")) {
        restante = DURACION
        pintarReloj()
        return
      }

      clearInterval(intervalo)
      reloj.innerText = "0:00"
      juegoTerminado = true
      if (!resultadoEnviado && !descalificado) await enviarResultado("tiempo")
      window.location.href = "final.html"
      return
    }

    pintarReloj()
  }

  pintarReloj()
  intervalo = setInterval(tick, 1000)
}

async function eliminarResultadoFlashmind() {
  const ranking = await supabase
    .from("ranking")
    .delete()
    .eq("usuario", usuario)
    .eq("juego", "flashmind")

  if (ranking.error) {
    console.warn("No se pudo limpiar ranking de flashmind", ranking.error)
  }
}

async function guardarResultadoFlashmind(puntos, sospechoso, invalido, motivo) {
  const payload = {
    usuario,
    tiempo: puntos,
    sospechoso,
    invalido,
    motivo,
    juego: "flashmind",
  }

  let result = await supabase
    .from("ranking")
    .upsert(payload, { onConflict: "usuario,juego" })

  if (!result.error) {
    await registrarPartidaDesdeRanking({ usuario, juego: "flashmind", valor: puntos, modo: "points", invalido })
    await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalido ? 0 : puntos)
    return true
  }

  console.warn("Upsert de flashmind fallo, intentando update", result.error)

  result = await supabase
    .from("ranking")
    .update({
      tiempo: puntos,
      sospechoso,
      invalido,
      motivo,
    })
    .select("usuario")
    .eq("usuario", usuario)
    .eq("juego", "flashmind")

  if (!result.error && result.data && result.data.length > 0) {
    await registrarPartidaDesdeRanking({ usuario, juego: "flashmind", valor: puntos, modo: "points", invalido })
    await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalido ? 0 : puntos)
    return true
  }

  console.warn("Update de flashmind fallo, intentando insert", result.error)

  result = await supabase
    .from("ranking")
    .insert(payload)

  if (result.error) {
    console.error("No se pudo guardar resultado de flashmind", result.error)
    return false
  }

  await registrarPartidaDesdeRanking({ usuario, juego: "flashmind", valor: puntos, modo: "points", invalido })
  await registrarPuntosMiniTorneo(supabase, JUEGO_ACTUAL, invalido ? 0 : puntos)
  return true
}

async function obtenerPosicionFlashmind() {
  const { data, error } = await supabase
    .from("ranking")
    .select("usuario")
    .eq("juego", "flashmind")
    .eq("invalido", false)
    .order("tiempo", { ascending: false })

  if (error || !data) {
    console.warn("No se pudo calcular posicion de flashmind", error)
    return null
  }

  const index = data.findIndex((item) => item.usuario === usuario)
  return index >= 0 ? index + 1 : null
}

async function guardarEstadisticasFlashmind(posicion) {
  const { data: actual, error: lecturaError } = await supabase
    .from("estadisticas_logros")
    .select("*")
    .eq("usuario", usuario)
    .eq("juego", "flashmind")
    .maybeSingle()

  if (lecturaError) {
    console.warn("No se pudieron leer estadisticas de flashmind", lecturaError)
    return
  }

  const sinErrores = totalIntentos > 0 && aciertos === totalIntentos
  const rachaSinErroresActual = sinErrores ? (actual?.racha_sin_errores_actual || 0) + 1 : 0
  const esVictoria = posicion === 1
  const esTop3 = typeof posicion === "number" && posicion <= 3
  const rachaVictoriasActual = esVictoria ? (actual?.racha_victorias_torneos_actual || 0) + 1 : 0
  const rachaTop3Actual = esTop3 ? (actual?.racha_top3_torneos_actual || 0) + 1 : 0
  const mejorPosicionAnterior = actual?.mejor_posicion_torneo
  const mejorPosicionTorneo = typeof posicion === "number"
    ? (typeof mejorPosicionAnterior === "number" ? Math.min(mejorPosicionAnterior, posicion) : posicion)
    : mejorPosicionAnterior

  const payload = {
    usuario,
    juego: "flashmind",
    completados: (actual?.completados || 0) + 1,
    completados_sin_errores: (actual?.completados_sin_errores || 0) + (sinErrores ? 1 : 0),
    racha_sin_errores_actual: rachaSinErroresActual,
    mejor_racha_sin_errores: Math.max(actual?.mejor_racha_sin_errores || 0, rachaSinErroresActual),
    torneos_participados: (actual?.torneos_participados || 0) + 1,
    mejor_posicion_torneo: mejorPosicionTorneo,
    victorias_torneos: (actual?.victorias_torneos || 0) + (esVictoria ? 1 : 0),
    racha_victorias_torneos_actual: rachaVictoriasActual,
    mejor_racha_victorias_torneos: Math.max(actual?.mejor_racha_victorias_torneos || 0, rachaVictoriasActual),
    top3_torneos: (actual?.top3_torneos || 0) + (esTop3 ? 1 : 0),
    racha_top3_torneos_actual: rachaTop3Actual,
    mejor_racha_top3_torneos: Math.max(actual?.mejor_racha_top3_torneos || 0, rachaTop3Actual),
    victorias_sin_errores: (actual?.victorias_sin_errores || 0) + (esVictoria && sinErrores ? 1 : 0),
    ultima_posicion_torneo: posicion,
    flashmind_total_correctas: (actual?.flashmind_total_correctas || 0) + aciertos,
    flashmind_mejor_racha_correctas: Math.max(actual?.flashmind_mejor_racha_correctas || 0, mejorRachaCorrectas),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("estadisticas_logros")
    .upsert(payload, { onConflict: "usuario,juego" })

  if (error) {
    console.warn("No se pudieron guardar estadisticas de flashmind", error)
  }
}

async function enviarResultado(fin) {
  if (resultadoEnviado) return
  resultadoEnviado = true

  const sospechoso = advertencias > 0
  const invalido = advertencias >= MAX_ADVERTENCIAS
  const puntos = invalido ? 0 : aciertos

  if (puntos <= 0 || invalido) {
    await eliminarResultadoFlashmind()
  } else {
    const guardado = await guardarResultadoFlashmind(
      puntos,
      sospechoso,
      invalido,
      invalido
        ? "Actividad sospechosa"
        : sospechoso
          ? "Cambio de pestana"
          : ""
    )

    if (!guardado) {
      resultadoEnviado = false
      return
    }

    const posicion = await obtenerPosicionFlashmind()
    await guardarEstadisticasFlashmind(posicion)
  }

  localStorage.setItem("fin_juego", fin)
  localStorage.setItem("flashmind_puntos", String(puntos))
}

async function revisarEstadoTorneo() {
  if (await debeSalirDelTorneo(supabase, JUEGO_ACTUAL)) {
    window.location.href = salidaTorneoUrl()
  }
}

renderBotones()
actualizarStats()
setTimeout(siguienteRonda, 600)
iniciarCronometro()
setInterval(revisarEstadoTorneo, 3000)
