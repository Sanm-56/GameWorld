import { marcarCierreTorneoLocal } from "./mini-torneo.js"

const FINAL_TTL_MS = 30 * 60 * 1000

function crearRunId(juego) {
  return `${juego}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function iniciarFinalProtegido(juego) {
  const runId = crearRunId(juego)
  localStorage.setItem(`${juego}_run_id`, runId)
  localStorage.removeItem(`${juego}_finished_run_id`)
  localStorage.removeItem(`${juego}_finished_at`)
  return runId
}

export function marcarFinalValido(juego) {
  let runId = localStorage.getItem(`${juego}_run_id`)

  if (!runId) {
    runId = crearRunId(juego)
    localStorage.setItem(`${juego}_run_id`, runId)
  }

  localStorage.setItem(`${juego}_finished_run_id`, runId)
  localStorage.setItem(`${juego}_finished_at`, new Date().toISOString())
  marcarCierreTorneoLocal(juego, "finalizado")
}

export function validarFinalReciente(juego, salida = "lobby.html") {
  const runId = localStorage.getItem(`${juego}_run_id`)
  const finishedRunId = localStorage.getItem(`${juego}_finished_run_id`)
  const finishedAt = Date.parse(localStorage.getItem(`${juego}_finished_at`) || "")
  const resultadoReciente = Number.isFinite(finishedAt) && Date.now() - finishedAt < FINAL_TTL_MS

  if (!runId || runId !== finishedRunId || !resultadoReciente) {
    window.location.replace(salida)
    return false
  }

  return true
}

export function limpiarFinalProtegido(juego) {
  localStorage.removeItem(`${juego}_run_id`)
  localStorage.removeItem(`${juego}_finished_run_id`)
  localStorage.removeItem(`${juego}_finished_at`)
}
