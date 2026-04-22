import { supabase } from "../../js/supabase.js"

const DURACION = 600
const MAX_ADVERTENCIAS = 3

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
let juegoTerminado = false

let aciertos = 0
let errores = 0
let puntaje = 0
let nivel = 1

let condicionKey = "multiplos_3"

function getCondicion(key){
  switch(key){
    case "multiplos_2":
      return { label: "Condición: múltiplos de 2", fn: (n) => n % 2 === 0 }
    case "multiplos_3":
      return { label: "Condición: múltiplos de 3", fn: (n) => n % 3 === 0 }
    case "multiplos_5":
      return { label: "Condición: múltiplos de 5", fn: (n) => n % 5 === 0 }
    case "pares":
      return { label: "Condición: pares", fn: (n) => n % 2 === 0 }
    case "impares":
      return { label: "Condición: impares", fn: (n) => n % 2 !== 0 }
    default:
      return { label: "Condición: múltiplos de 3", fn: (n) => n % 3 === 0 }
  }
}

let condicion = getCondicion(condicionKey)
let esValido = condicion.fn
condicionEl.innerText = condicion.label

const numeros = new Map() // id -> {el, x, y, vy, valor, esCorrecto, vivo}
let idSeq = 0
let ultimoTs = 0
let spawnAcum = 0

function setLog(t) {
  logEl.innerText = t
}

function actualizarUI() {
  aciertosEl.innerText = String(aciertos)
  erroresEl.innerText = String(errores)
  puntajeEl.innerText = String(puntaje)
  velocidadEl.innerText = String(nivel)
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
    el.style.background = "linear-gradient(135deg, rgba(34,197,94,1), rgba(22,163,74,0.7))"
  } else {
    el.style.background = "linear-gradient(135deg, rgba(59,130,246,1), rgba(30,64,175,0.7))"
  }

  const id = ++idSeq

  el.onclick = () => clickNumero(id)
  gameEl.appendChild(el)

  const base = 120 + nivel * 18
  numeros.set(id, {
    el,
    x,
    y,
    vy: base,
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
    setLog(`✅ +10 (${item.valor})`)
  } else {
    errores++
    puntaje = Math.max(0, puntaje - 8)
    setLog(`❌ -8 (${item.valor})`)
  }

  // Acelerar con el puntaje
  const nuevoNivel = Math.min(20, 1 + Math.floor(puntaje / 80))
  if (nuevoNivel !== nivel) {
    nivel = nuevoNivel
    setLog(`⚡ ¡Subiste a nivel ${nivel}!`)
  }

  actualizarUI()
}

function loop(ts) {
  if (juegoTerminado) return
  if (!ultimoTs) ultimoTs = ts
  const dt = Math.min(0.05, (ts - ultimoTs) / 1000)
  ultimoTs = ts

  // Spawn: más rápido con el nivel
  const spawnCada = Math.max(0.28, 0.95 - nivel * 0.03)
  spawnAcum += dt
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
    item.y += item.vy * (1 + nivel * 0.06) * dt
    item.el.style.top = `${item.y}px`

    if (item.y > alto + 30) {
      // Se escapó
      item.vivo = false
      item.el.remove()

      if (item.esCorrecto) {
        // perder un correcto duele más
        errores++
        puntaje = Math.max(0, puntaje - 12)
        setLog(`😬 Se escapó ${item.valor} (correcto). -12`)
      }
      actualizarUI()
    }
  }

  requestAnimationFrame(loop)
}

function marcarAdvertencia() {
  advertencias++
  if (advertencias >= MAX_ADVERTENCIAS) {
    setLog("❌ Demasiados cambios de pestaña (marcado como inválido)")
  } else {
    setLog(`⚠️ Cambio de pestaña detectado (${advertencias}/${MAX_ADVERTENCIAS})`)
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !juegoTerminado) marcarAdvertencia()
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
      if (!resultadoEnviado) await enviarResultado("tiempo")
      window.location.href = "final.html"
      return
    }

    const min = Math.floor(restante / 60)
    const seg = restante % 60
    reloj.innerText = min + ":" + (seg < 10 ? "0" : "") + seg
  }

  tick()
  const intervalo = setInterval(tick, 1000)
}

async function enviarResultado(fin) {
  if (resultadoEnviado) return
  resultadoEnviado = true

  const sospechoso = advertencias > 0
  const invalido = advertencias >= MAX_ADVERTENCIAS
  const puntosFinal = invalido ? 0 : puntaje

  await supabase.from("ranking").upsert(
    {
      usuario,
      tiempo: puntosFinal,
      sospechoso,
      invalido,
      motivo: invalido
        ? "Demasiados cambios de pestaña"
        : sospechoso
          ? "Cambio de pestaña"
          : "",
      juego: "numcatch",
    },
    { onConflict: "usuario,juego" }
  )

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
setLog("Cargando condición del torneo...")

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
  setLog(`Listo. ${condicion.label.replace("Condición: ", "Toca solo ")}.`)
}

await cargarCondicionDesdeTorneo()

requestAnimationFrame(loop)
iniciarCronometro()
setInterval(revisarEstadoTorneo, 3000)

