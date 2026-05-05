import { supabase } from "../juegos/js/supabase.js"

const LEVELS = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  target: 80 + index * 25,
  title: `Nivel ${index + 1}`,
}))

const state = {
  user: null,
  selectedLevel: 1,
  activeRoom: null,
  playersChannel: null,
}

const els = {
  authView: document.getElementById("authView"),
  appView: document.getElementById("appView"),
  userPill: document.getElementById("userPill"),
  loginForm: document.getElementById("loginForm"),
  authStatus: document.getElementById("authStatus"),
  levelMap: document.getElementById("levelMap"),
  levelTitle: document.getElementById("levelTitle"),
  levelDescription: document.getElementById("levelDescription"),
  lastScore: document.getElementById("lastScore"),
  playLevelBtn: document.getElementById("playLevelBtn"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  createRoomForm: document.getElementById("createRoomForm"),
  joinRoomForm: document.getElementById("joinRoomForm"),
  roomStatus: document.getElementById("roomStatus"),
  roomDetail: document.getElementById("roomDetail"),
  activeRoomName: document.getElementById("activeRoomName"),
  activeRoomCode: document.getElementById("activeRoomCode"),
  roomState: document.getElementById("roomState"),
  playersList: document.getElementById("playersList"),
  startRoomBtn: document.getElementById("startRoomBtn"),
  finishRoomBtn: document.getElementById("finishRoomBtn"),
  scoreRoomBtn: document.getElementById("scoreRoomBtn"),
  globalRanking: document.getElementById("globalRanking"),
  weeklyRanking: document.getElementById("weeklyRanking"),
  winsRanking: document.getElementById("winsRanking"),
  rankingStatus: document.getElementById("rankingStatus"),
  refreshRankingsBtn: document.getElementById("refreshRankingsBtn"),
}

init()

async function init() {
  bindEvents()
  const savedUser = localStorage.getItem("usuario")

  if (!savedUser) {
    showAuth()
    return
  }

  await loadUser(savedUser)
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => changeView(button.dataset.view))
  })

  els.loginForm.addEventListener("submit", login)
  els.playLevelBtn.addEventListener("click", playSelectedLevel)
  els.resetProgressBtn.addEventListener("click", resetProgress)
  els.createRoomForm.addEventListener("submit", createRoom)
  els.joinRoomForm.addEventListener("submit", joinRoom)
  els.startRoomBtn.addEventListener("click", () => updateRoomState("en_juego"))
  els.finishRoomBtn.addEventListener("click", finishRoom)
  els.scoreRoomBtn.addEventListener("click", addRoomPoints)
  els.refreshRankingsBtn.addEventListener("click", loadRankings)
}

function showAuth() {
  els.authView.hidden = false
  els.appView.hidden = true
  els.userPill.textContent = "Sin usuario"
}

function showApp() {
  els.authView.hidden = true
  els.appView.hidden = false
  els.userPill.textContent = state.user.usuario
  renderLevels()
  loadRankings()
}

async function loadUser(usuario) {
  const cleanUser = usuario.trim()
  const { data, error } = await supabase
    .from("usuarios")
    .select("id,usuario")
    .eq("usuario", cleanUser)
    .maybeSingle()

  if (error || !data) {
    localStorage.removeItem("usuario")
    showAuth()
    return
  }

  state.user = {
    id: data.usuario || cleanUser,
    usuario: data.usuario || cleanUser,
  }
  showApp()
}

async function login(event) {
  event.preventDefault()
  const usuario = document.getElementById("loginUsuario").value.trim()
  const codigo = document.getElementById("loginCodigo").value.trim()

  if (!usuario || !codigo) {
    setText(els.authStatus, "Completa apodo y codigo.")
    return
  }

  setText(els.authStatus, "Validando...")
  const { data, error } = await supabase.rpc("login_usuario_torneo", {
    p_usuario: usuario,
    p_codigo: codigo,
  })

  if (error || !data?.ok) {
    setText(els.authStatus, data?.mensaje || "No se pudo validar el usuario.")
    return
  }

  localStorage.setItem("usuario", usuario)
  await loadUser(usuario)
}

function changeView(view) {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view)
  })
  document.querySelectorAll(".view").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${view}View`)
  })
  if (view === "rankings") loadRankings()
}

function progressKey() {
  return `solitario_progreso_${state.user.usuario}`
}

function getProgress() {
  return JSON.parse(localStorage.getItem(progressKey()) || '{"unlocked":1,"done":[],"best":0}')
}

function saveProgress(progress) {
  localStorage.setItem(progressKey(), JSON.stringify(progress))
}

function renderLevels() {
  const progress = getProgress()
  els.levelMap.innerHTML = LEVELS.map((level) => {
    const done = progress.done.includes(level.id)
    const unlocked = level.id <= progress.unlocked
    const className = done ? "done" : unlocked ? "unlocked" : "locked"
    return `
      <button class="level-node ${className}" type="button" data-level="${level.id}" ${unlocked ? "" : "disabled"}>
        <span class="level-number">${level.id}</span>
        <strong>${level.title}</strong>
        <span>${done ? "Completado" : unlocked ? "Disponible" : "Bloqueado"}</span>
      </button>
    `
  }).join("")

  els.levelMap.querySelectorAll("[data-level]").forEach((button) => {
    button.addEventListener("click", () => selectLevel(Number(button.dataset.level)))
  })

  selectLevel(Math.min(state.selectedLevel, progress.unlocked))
}

function selectLevel(levelId) {
  state.selectedLevel = levelId
  const level = LEVELS.find((item) => item.id === levelId) || LEVELS[0]
  els.levelTitle.textContent = level.title
  els.levelDescription.textContent = `Supera ${level.target} puntos para desbloquear el siguiente nivel.`
}

async function playSelectedLevel() {
  const level = LEVELS.find((item) => item.id === state.selectedLevel) || LEVELS[0]
  const score = Math.floor(level.target * 0.7 + Math.random() * level.target * 0.65)
  const progress = getProgress()

  els.lastScore.textContent = String(score)

  if (score >= level.target) {
    progress.unlocked = Math.max(progress.unlocked, Math.min(level.id + 1, LEVELS.length))
    progress.done = [...new Set([...progress.done, level.id])]
    progress.best = Math.max(progress.best || 0, score)
    saveProgress(progress)
    renderLevels()
  }

  await registerResult({
    points: score,
    victory: score >= level.target,
    origin: "nivel",
    roomId: null,
  })
  loadRankings()
}

function resetProgress() {
  saveProgress({ unlocked: 1, done: [], best: 0 })
  state.selectedLevel = 1
  els.lastScore.textContent = "0"
  renderLevels()
}

async function createRoom(event) {
  event.preventDefault()
  const nombre = document.getElementById("roomName").value.trim()
  const codigo = document.getElementById("roomCode").value.trim().toUpperCase()

  if (!nombre || !codigo) {
    setText(els.roomStatus, "Completa nombre y codigo.")
    return
  }

  setText(els.roomStatus, "Creando sala...")
  const { data, error } = await supabase
    .from("salas")
    .insert([{ nombre, codigo, creador_id: state.user.id, estado: "esperando", max_jugadores: 40 }])
    .select()
    .single()

  if (error) {
    setText(els.roomStatus, "No se pudo crear la sala. Revisa que el SQL de Solitario este aplicado.")
    return
  }

  await joinRoomByRecord(data)
}

async function joinRoom(event) {
  event.preventDefault()
  const codigo = document.getElementById("joinCode").value.trim().toUpperCase()
  if (!codigo) return

  setText(els.roomStatus, "Buscando sala...")
  const { data, error } = await supabase
    .from("salas")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle()

  if (error || !data) {
    setText(els.roomStatus, "Sala no encontrada.")
    return
  }

  await joinRoomByRecord(data)
}

async function joinRoomByRecord(room) {
  const count = await countPlayers(room.id)
  if (count >= Number(room.max_jugadores || 40)) {
    setText(els.roomStatus, "La sala ya tiene el maximo de 40 jugadores.")
    return
  }

  const { error } = await supabase
    .from("sala_jugadores")
    .upsert([{
      sala_id: room.id,
      usuario_id: state.user.id,
      usuario: state.user.usuario,
      puntos: 0,
    }], { onConflict: "sala_id,usuario_id" })

  if (error) {
    setText(els.roomStatus, "No se pudo entrar a la sala.")
    return
  }

  state.activeRoom = room
  renderRoom(room)
  subscribeRoom(room.id)
  await loadPlayers()
  setText(els.roomStatus, "Dentro de la sala.")
}

async function countPlayers(roomId) {
  const { count } = await supabase
    .from("sala_jugadores")
    .select("id", { count: "exact", head: true })
    .eq("sala_id", roomId)
  return count || 0
}

function renderRoom(room) {
  els.roomDetail.hidden = false
  els.activeRoomName.textContent = room.nombre
  els.activeRoomCode.textContent = room.codigo
  els.roomState.textContent = stateLabel(room.estado)
  const isCreator = room.creador_id === state.user.id
  els.startRoomBtn.disabled = !isCreator || room.estado !== "esperando"
  els.finishRoomBtn.disabled = !isCreator || room.estado === "finalizado"
  els.scoreRoomBtn.disabled = room.estado === "finalizado"
}

function subscribeRoom(roomId) {
  if (state.playersChannel) supabase.removeChannel(state.playersChannel)
  state.playersChannel = supabase
    .channel(`solitario_sala_${roomId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "sala_jugadores", filter: `sala_id=eq.${roomId}` }, loadPlayers)
    .on("postgres_changes", { event: "*", schema: "public", table: "salas", filter: `id=eq.${roomId}` }, refreshRoom)
    .subscribe()
}

async function refreshRoom() {
  if (!state.activeRoom) return
  const { data } = await supabase.from("salas").select("*").eq("id", state.activeRoom.id).maybeSingle()
  if (data) {
    state.activeRoom = data
    renderRoom(data)
  }
}

async function loadPlayers() {
  if (!state.activeRoom) return
  const { data, error } = await supabase
    .from("sala_jugadores")
    .select("usuario_id,usuario,puntos")
    .eq("sala_id", state.activeRoom.id)
    .order("puntos", { ascending: false })

  if (error) {
    setText(els.playersList, '<div class="status">No se pudo cargar jugadores.</div>')
    return
  }

  els.playersList.innerHTML = (data || []).map((player, index) => `
    <div class="player-row ${player.usuario_id === state.user.id ? "current" : ""}">
      <span class="rank-pos">#${index + 1}</span>
      <strong>${escapeHtml(player.usuario || player.usuario_id)}</strong>
      <span>${Number(player.puntos || 0)} pts</span>
    </div>
  `).join("")
}

async function updateRoomState(estado) {
  if (!state.activeRoom) return
  const { error } = await supabase.from("salas").update({ estado }).eq("id", state.activeRoom.id)
  if (error) setText(els.roomStatus, "No se pudo actualizar la sala.")
}

async function addRoomPoints() {
  if (!state.activeRoom) return
  const gained = Math.floor(40 + Math.random() * 120)
  const { data } = await supabase
    .from("sala_jugadores")
    .select("puntos")
    .eq("sala_id", state.activeRoom.id)
    .eq("usuario_id", state.user.id)
    .maybeSingle()

  await supabase
    .from("sala_jugadores")
    .update({ puntos: Number(data?.puntos || 0) + gained })
    .eq("sala_id", state.activeRoom.id)
    .eq("usuario_id", state.user.id)

  setText(els.roomStatus, `Sumaste ${gained} puntos.`)
  await loadPlayers()
}

async function finishRoom() {
  if (!state.activeRoom) return
  const { data } = await supabase
    .from("sala_jugadores")
    .select("usuario_id,usuario,puntos")
    .eq("sala_id", state.activeRoom.id)
    .order("puntos", { ascending: false })

  const winnerId = data?.[0]?.usuario_id
  await updateRoomState("finalizado")

  if (data?.length) {
    await supabase.from("solitario_resultados").insert(data.map((player) => ({
      usuario_id: player.usuario_id,
      usuario: player.usuario || player.usuario_id,
      puntos: Number(player.puntos || 0),
      victoria: player.usuario_id === winnerId,
      sala_id: state.activeRoom.id,
      origen: "sala",
    })))
  }

  loadRankings()
}

async function registerResult({ points, victory, origin, roomId }) {
  await supabase.from("solitario_resultados").insert([{
    usuario_id: state.user.id,
    usuario: state.user.usuario,
    puntos: points,
    victoria: victory,
    sala_id: roomId,
    origen: origin,
  }])
}

async function loadRankings() {
  if (!state.user) return
  setText(els.rankingStatus, "Cargando rankings...")
  const { data, error } = await supabase
    .from("solitario_resultados")
    .select("usuario_id,usuario,puntos,victoria,created_at")

  if (error) {
    setText(els.rankingStatus, "No se pudieron cargar rankings. Ejecuta solitario-supabase.sql en Supabase.")
    return
  }

  renderRanking(els.globalRanking, buildRanking(data || [], "global"))
  renderRanking(els.weeklyRanking, buildRanking(data || [], "weekly"))
  renderRanking(els.winsRanking, buildRanking(data || [], "wins"))
  setText(els.rankingStatus, "Rankings actualizados.")
}

function buildRanking(rows, type) {
  const weekStart = getWeekStart()
  const filtered = type === "weekly"
    ? rows.filter((row) => new Date(row.created_at) >= weekStart)
    : rows

  const grouped = new Map()
  filtered.forEach((row) => {
    const key = row.usuario_id || row.usuario
    const current = grouped.get(key) || { usuario: row.usuario || key, puntos: 0, victorias: 0 }
    current.puntos += Number(row.puntos || 0)
    current.victorias += row.victoria ? 1 : 0
    grouped.set(key, current)
  })

  return [...grouped.values()]
    .sort((a, b) => type === "wins" ? b.victorias - a.victorias || b.puntos - a.puntos : b.puntos - a.puntos || b.victorias - a.victorias)
    .slice(0, 15)
}

function renderRanking(target, rows) {
  target.innerHTML = rows.length ? rows.map((row, index) => `
    <div class="ranking-row ${row.usuario === state.user.usuario ? "current" : ""}">
      <span class="rank-pos">#${index + 1}</span>
      <strong>${escapeHtml(row.usuario)}</strong>
      <span>${row.puntos} pts - ${row.victorias} vict.</span>
    </div>
  `).join("") : '<div class="status">Todavia no hay resultados.</div>'
}

function getWeekStart() {
  const today = new Date()
  const day = today.getDay() || 7
  const start = new Date(today)
  start.setDate(today.getDate() - day + 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function stateLabel(estado) {
  return {
    esperando: "Esperando",
    en_juego: "En juego",
    finalizado: "Finalizado",
  }[estado] || "Esperando"
}

function setText(element, value) {
  element.textContent = value
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
