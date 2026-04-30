import { supabase } from "../../js/supabase.js"
import { registrarPartidaDesdeRanking } from "../../js/partidas.js"

const DURACION = 600
const MAX_ADVERTENCIAS = 3
const ACIERTOS_POR_NIVEL = 20
const MAX_LEVEL = 11
const BASE_SPAWN_CADA = 0.95
const MIN_SPAWN_CADA = 0.55
const BASE_VELOCIDAD = 120
const MAX_VELOCIDAD = 245

const usuario = localStorage.getItem("usuario") || "Invitado"
document.getElementById("usuarioLabel").innerText = usuario

const gameEl = document.getElementById("game")
const condicionEl = document.getElementById("condicion")
const logEl = document.getElementById("log")

const aciertosEl = document.getElementById("aciertos")
const erroresEl = document.getElementById("errores")
const puntajeEl = document.getElementById("puntaje")
const velocidadEl = document.getElementById("velocidad")

let advertencias = 0
let resultadoEnviado = false
let descalificado = false
let juegoTerminado = false
let ultimoCambio = 0

let aciertos = 0
let errores = 0
let puntaje = 0
let nivel = 1

let condicionKey = "multiplos_3"

function getCondicion(key){
  switch(key){
    case "multiplos_2":
      return { label: "Condicion: multiplos de 2", fn: (n) => n % 2 === 0 }
    case "multiplos_3":
      return { label: "Condicion: multiplos de 3", fn: (n) => n % 3 === 0 }
    case "multiplos_5":
      return { label: "Condicion: multiplos de 5", fn: (n) => n % 5 === 0 }
    case "pares":
      return { label: "Condicion: pares", fn: (n) => n % 2 === 0 }
    case "impares":
      return { label: "Condicion: impares", fn: (n) => n % 2 !== 0 }
    default:
      return { label: "Condicion: multiplos de 3", fn: (n) => n % 3 === 0 }
  }
}

let condicion = getCondicion(condicionKey)
let esValido = condicion.fn
condicionEl.innerText = condicion.label

const numeros = new Map()
let idSeq = 0
let ultimoTs = 0
let spawnAcum = 0

function setLog(t) {
  logEl.innerText = t
}

function calcularNivel() {
  return Math.min(MAX_LEVEL, 1 + Math.floor(aciertos / ACIERTOS_POR_NIVEL))
}

function actualizarUI() {
  nivel = calcularNivel()
  aciertosEl.innerText = String(aciertos)
  erroresEl.innerText = String(errores)
  puntajeEl.innerText = String(puntaje)
  velocidadEl.innerText = String(nivel)
}

function getSpawnCada() {
  const progreso = (nivel - 1) / (MAX_LEVEL - 1)
  return BASE_SPAWN_CADA - (BASE_SPAWN_CADA - MIN_SPAWN_CADA) * progreso
}

function getVelocidadCaida() {
  const progreso = (nivel - 1) / (MAX_LEVEL - 1)
  return BASE_VELOCIDAD + (MAX_VELOCIDAD - BASE_VELOCIDAD) * progreso
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function spawnNumero() {
  if (juegoTerminado) return

  const valor = randInt(1, 99)
  const correcto = esValido(valor)
  const el = document.createElement("div")
  el.className = "numero"
  el.innerText = String(valor)

  const ancho = gameEl.clientWidth
  const x = randInt(10, Math.max(10, ancho - 64))
  const y = -70

  el.style.left = `${x}px`
  el.style.top = `${y}px`

  if (correcto) {
    el.style.background = "linear-gradient(135deg, rgba(34,197,94,1), rgba(22,163,74,0.72))"
  } else {
    el.style.background = "linear-gradient(135deg, rgba(59,130,246,1), rgba(30,64,175,0.72))"
  }

  const id = ++idSeq
  el.onclick = () => clickNumero(id)
  gameEl.appendChild(el)

  numeros.set(id, {
    el,
    y,
    vy: getVelocidadCaida(),
    valor,
    esCorrecto: correcto,
    vivo: true,
  })
}

function clickNumero(id) {
  if (juegoTerminado) return

  const item = numeros.get(id)
  if (!item || !item.vivo) return

  item.vivo = false
  item.el.remove()

  if (item.esCorrecto) {
    aciertos++
    puntaje += 10
    setLog(`+10 (${item.valor})`)
  } else {
    errores++
    puntaje = Math.max(0, puntaje - 8)
    setLog(`-8 (${item.valor})`)
  }

  const nivelAnterior = nivel
  actualizarUI()
  if (nivel > nivelAnterior) {
    setLog(`Subiste a nivel ${nivel}`)
  }
}

function loop(ts) {
  if (juegoTerminado) return
  if (!ultimoTs) ultimoTs = ts
  const dt = Math.min(0.05, (ts - ultimoTs) / 1000)
  ultimoTs = ts

  spawnAcum += dt
  const spawnCada = getSpawnCada()
  while (spawnAcum >= spawnCada) {
    spawnAcum -= spawnCada
    spawnNumero()
  }

  const alto = gameEl.clientHeight
  for (const [id, item] of numeros) {
    if (!item.vivo) {
      numeros.delete(id)
      continue
    }

    item.y += item.vy * dt
    item.el.style.top = `${item.y}px`

    if (item.y > alto + 30) {
      item.vivo = false
      item.el.remove()

      if (item.esCorrecto) {
        errores++
        puntaje = Math.max(0, puntaje - 12)
        setLog(`Se escapo ${item.valor} (correcto). -12`)
      }

      actualizarUI()
    }
  }

  requestAnimationFrame(loop)
}

async function descalificarPorActividadSospechosa() {
  if (juegoTerminado) return

  descalificado = true
  juegoTerminado = true
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

async function iniciarCronometro() {
  const reloj = document.getElementById("reloj")

  let { data: torneo } = await supabase
    .from("estado_torneo")
    .select("inicio_torneo")
    .eq("id", 1)
    .single()

  let { data: horaServer } = await supabase.rpc("ahora_servidor")

  const inicio = Date.parse(torneo.inicio_torneo)
  const ahora = Date.parse(horaServer)

  let restante = Math.floor((inicio + DURACION * 1000 - ahora) / 1000)
  if (isNaN(restante) || restante > DURACION) restante = DURACION

  async function tick() {
    restante--

    if (restante <= 0) {
      clearInterval(intervalo)
      reloj.innerText = "0:00"
      juegoTerminado = true
      if (!resultadoEnviado && !descalificado) await enviarResultado("tiempo")
      window.location.href = "final.html"
      return
    }

    const min = Math.floor(restante / 60)
    const seg = restante % 60
    reloj.innerText = min + ":" + (seg < 10 ? "0" : "") + seg
  }

  await tick()
  const intervalo = setInterval(tick, 1000)
}

async function eliminarResultadoNumcatch() {
  const ranking = await supabase
    .from("ranking")
    .delete()
    .eq("usuario", usuario)
    .eq("juego", "numcatch")

  if (ranking.error) {
    console.warn("No se pudo limpiar ranking de numcatch", ranking.error)
  }
}

async function guardarResultadoNumcatch(puntosFinal, sospechoso, invalido, motivo) {
  const payload = {
    usuario,
    tiempo: puntosFinal,
    sospechoso,
    invalido,
    motivo,
    juego: "numcatch",
  }

  let result = await supabase
    .from("ranking")
    .upsert(payload, { onConflict: "usuario,juego" })

  if (!result.error) {
    await registrarPartidaDesdeRanking({ usuario, juego: "numcatch", valor: puntosFinal, modo: "points", invalido })
    return true
  }

  result = await supabase
    .from("ranking")
    .update({
      tiempo: puntosFinal,
      sospechoso,
      invalido,
      motivo,
    })
    .select("usuario")
    .eq("usuario", usuario)
    .eq("juego", "numcatch")

  if (!result.error && result.data && result.data.length > 0) {
    await registrarPartidaDesdeRanking({ usuario, juego: "numcatch", valor: puntosFinal, modo: "points", invalido })
    return true
  }

  result = await supabase
    .from("ranking")
    .insert(payload)

  if (result.error) {
    console.error("No se pudo guardar resultado de numcatch", result.error)
    return false
  }

  await registrarPartidaDesdeRanking({ usuario, juego: "numcatch", valor: puntosFinal, modo: "points", invalido })
  return true
}

async function enviarResultado(fin) {
  if (resultadoEnviado) return
  resultadoEnviado = true

  const sospechoso = advertencias > 0
  const invalido = advertencias >= MAX_ADVERTENCIAS
  const puntosFinal = invalido ? 0 : puntaje

  if (puntosFinal <= 0 || invalido) {
    await eliminarResultadoNumcatch()
  } else {
    const guardado = await guardarResultadoNumcatch(
      puntosFinal,
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
  }

  localStorage.setItem("fin_juego", fin)
  localStorage.setItem("numcatch_puntos", String(puntosFinal))
}

async function revisarEstadoTorneo() {
  let { data } = await supabase
    .from("estado_torneo")
    .select("estado")
    .eq("id", 1)
    .single()

  if (data?.estado === "espera") {
    window.location.href = "lobby.html"
  }
}

actualizarUI()
setLog("Cargando condicion del torneo...")

async function cargarCondicionDesdeTorneo(){
  const { data } = await supabase
    .from("estado_torneo")
    .select("numcatch_condicion")
    .eq("id", 1)
    .single()

  const key = data?.numcatch_condicion || "multiplos_3"
  condicionKey = key
  condicion = getCondicion(condicionKey)
  esValido = condicion.fn
  condicionEl.innerText = condicion.label
  setLog(`Listo. ${condicion.label.replace("Condicion: ", "Toca solo ")}.`)
}

await cargarCondicionDesdeTorneo()

requestAnimationFrame(loop)
iniciarCronometro()
setInterval(revisarEstadoTorneo, 3000)
