import { supabase } from "../juegos/js/supabase.js"

const LEVELS = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  target: 80 + index * 25,
  title: `Nivel ${index + 1}`,
}))

const MINI_TOURNAMENT_GAMES = [
  { key: "ajedrez", label: "Ajedrez" },
  { key: "damas", label: "Damas" },
  { key: "domino", label: "Domino" },
  { key: "flashmind", label: "FlashMind" },
  { key: "matematicas", label: "Matematicas" },
  { key: "memoria", label: "Memoria" },
  { key: "numcatch", label: "NumCatch" },
  { key: "sudoku", label: "Sudoku" },
]

const state = {
  user: null,
  selectedLevel: 1,
  selectedGame: MINI_TOURNAMENT_GAMES[0].key,
  activeRoom: null,
  rankingGame: "todos",
  playersChannel: null,
  playersPoll: null,
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
  gamePicker: null,
  rankingGamePicker: null,
  generateCodeBtn: null,
  activeRoomsList: null,
  roomGame: null,
  openGameBtn: null,
}

init()

async function init() {
  enhanceMiniTournamentUi()
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
  els.startRoomBtn.addEventListener("click", startRoom)
  els.finishRoomBtn.addEventListener("click", finishRoom)
  els.scoreRoomBtn.addEventListener("click", addRoomPoints)
  els.refreshRankingsBtn.addEventListener("click", loadRankings)
  els.generateCodeBtn?.addEventListener("click", generateRoomCode)
  els.openGameBtn?.addEventListener("click", redirectToActiveGame)
}

function showAuth() {
  els.authView.hidden = false
  els.appView.hidden = true
  els.userPill.textContent = "Sin usuario"
}

async function showApp() {
  els.authView.hidden = true
  els.appView.hidden = false
  els.userPill.textContent = state.user.usuario
  renderLevels()
  await loadActiveRooms()
  await restoreActiveRoom()
  loadRankings()
}

function enhanceMiniTournamentUi() {
  injectMiniTournamentStyles()
  injectGamePicker()
  injectActiveRoomsList()
  injectRoomGameInfo()
  injectRankingGamePicker()
}

// Mini torneos vive dentro de Solitario, asi que la UI se agrega desde JS
// para no modificar el HTML base ni tocar las vistas de los juegos existentes.
function injectMiniTournamentStyles() {
  if (document.querySelector("[data-mini-tournament-style]")) return

  const style = document.createElement("style")
  style.dataset.miniTournamentStyle = "true"
  style.textContent = `
    .game-picker{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
    .game-option{border:1px solid rgba(148,163,184,.16);background:rgba(15,23,42,.72);padding:10px;border-radius:14px}
    .game-option.active{border-color:rgba(250,204,21,.5);background:rgba(250,204,21,.16)}
    .code-row{display:grid;grid-template-columns:1fr auto;gap:8px}
    .active-rooms{margin-bottom:16px}
    .active-room-row{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;border:1px solid rgba(148,163,184,.14);border-radius:14px;padding:12px;background:rgba(15,23,42,.64)}
    .mini-player-list{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
    .mini-player-pill{border:1px solid rgba(148,163,184,.18);border-radius:999px;padding:4px 8px;color:#dbeafe;font-size:12px;background:rgba(15,23,42,.72)}
    .room-game-pill{display:inline-flex;margin-top:6px;border:1px solid rgba(56,189,248,.32);border-radius:999px;padding:5px 9px;color:#bfdbfe;font-size:13px;font-weight:800}
    @media (max-width: 840px){.game-picker,.active-room-row,.code-row{grid-template-columns:1fr}}
  `
  document.head.appendChild(style)
}

function injectGamePicker() {
  if (!els.createRoomForm || document.getElementById("miniTournamentGamePicker")) return

  const title = document.createElement("label")
  title.textContent = "Juego del torneo"

  const picker = document.createElement("div")
  picker.id = "miniTournamentGamePicker"
  picker.className = "game-picker"
  picker.innerHTML = MINI_TOURNAMENT_GAMES.map((game) => `
    <button class="game-option ${game.key === state.selectedGame ? "active" : ""}" type="button" data-game="${game.key}">
      ${game.label}
    </button>
  `).join("")

  title.appendChild(picker)
  els.createRoomForm.insertBefore(title, els.createRoomForm.querySelector("button[type='submit']"))
  els.gamePicker = picker

  picker.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGame = button.dataset.game
      picker.querySelectorAll("[data-game]").forEach((item) => {
        item.classList.toggle("active", item === button)
      })
    })
  })

  const codeInput = document.getElementById("roomCode")
  if (codeInput && !document.getElementById("generateRoomCodeBtn")) {
    const row = document.createElement("div")
    row.className = "code-row"
    codeInput.parentNode.insertBefore(row, codeInput)
    row.appendChild(codeInput)

    const generateBtn = document.createElement("button")
    generateBtn.id = "generateRoomCodeBtn"
    generateBtn.type = "button"
    generateBtn.className = "ghost-button"
    generateBtn.textContent = "Generar"
    row.appendChild(generateBtn)
    els.generateCodeBtn = generateBtn
  }
}

// Lista publica de salas no finalizadas. Reutiliza la tabla salas y no lee nada
// del sistema admin principal.
function injectActiveRoomsList() {
  const roomsView = document.getElementById("roomsView")
  const roomGrid = roomsView?.querySelector(".room-grid")
  if (!roomsView || !roomGrid || document.getElementById("activeRoomsList")) return

  const wrapper = document.createElement("article")
  wrapper.className = "panel active-rooms"
  wrapper.innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">Disponibles</p>
        <h3>Torneos activos</h3>
      </div>
      <button class="ghost-button" type="button" id="refreshRoomsBtn">Actualizar</button>
    </div>
    <div id="activeRoomsList" class="players-list"></div>
  `

  roomsView.insertBefore(wrapper, roomGrid.nextSibling)
  els.activeRoomsList = document.getElementById("activeRoomsList")
  document.getElementById("refreshRoomsBtn")?.addEventListener("click", loadActiveRooms)
}

function injectRoomGameInfo() {
  const roomTitle = els.activeRoomCode?.closest("p")
  const roomActions = document.querySelector(".room-actions")
  if (roomTitle && !document.getElementById("roomGame")) {
    const gameLine = document.createElement("p")
    gameLine.className = "muted"
    gameLine.innerHTML = 'Juego: <strong id="roomGame"></strong>'
    roomTitle.insertAdjacentElement("afterend", gameLine)
    els.roomGame = document.getElementById("roomGame")
  }

  if (roomActions && !document.getElementById("openGameBtn")) {
    const openGameBtn = document.createElement("button")
    openGameBtn.id = "openGameBtn"
    openGameBtn.type = "button"
    openGameBtn.className = "ghost-button"
    openGameBtn.textContent = "Ir al juego"
    roomActions.insertBefore(openGameBtn, els.finishRoomBtn)
    els.openGameBtn = openGameBtn
  }
}

function injectRankingGamePicker() {
  const rankingsView = document.getElementById("rankingsView")
  if (!rankingsView || document.getElementById("rankingGamePicker")) return

  const pickerWrap = document.createElement("div")
  pickerWrap.style.marginBottom = "20px"
  pickerWrap.innerHTML = `
    <label for="rankingGamePicker">Filtrar por juego</label>
    <select id="rankingGamePicker" class="boton" style="width:100%; margin-top:8px; background:rgba(15,23,42,.8); color:white; border:1px solid rgba(148,163,184,.2)">
      <option value="todos">Todos los juegos</option>
      <option value="nivel">Mapa de Niveles</option>
      ${MINI_TOURNAMENT_GAMES.map(game => `<option value="${game.key}">${game.label}</option>`).join("")}
    </select>
  `

  const columns = rankingsView.querySelector(".columns")
  rankingsView.insertBefore(pickerWrap, columns || rankingsView.firstChild)
  els.rankingGamePicker = document.getElementById("rankingGamePicker")
  els.rankingGamePicker.addEventListener("change", (e) => {
    state.rankingGame = e.target.value
    loadRankings()
  })
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
  await showApp()
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
  if (view === "rooms") loadActiveRooms()
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
    game: "nivel",
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
  const codigo = normalizeCode(document.getElementById("roomCode").value)
  const juego = state.selectedGame

  if (!nombre || !codigo) {
    setText(els.roomStatus, "Completa nombre y codigo.")
    return
  }

  if (!isValidGame(juego)) {
    setText(els.roomStatus, "Selecciona un juego valido.")
    return
  }

  setText(els.roomStatus, "Creando sala...")
  const { data, error } = await supabase
    .from("salas")
    .insert([{ nombre, codigo, creador_id: state.user.id, estado: "esperando", max_jugadores: 40, juego }])
    .select()
    .single()

  if (error) {
    setText(els.roomStatus, "No se pudo crear la sala. Ejecuta la migracion de mini torneos para agregar el campo juego.")
    return
  }

  await joinRoomByRecord(data)
  await loadActiveRooms()
}

async function joinRoom(event) {
  event.preventDefault()
  const codigo = normalizeCode(document.getElementById("joinCode").value)
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

  if (data.estado === "finalizado") {
    setText(els.roomStatus, "Ese torneo ya finalizo.")
    return
  }

  await joinRoomByRecord(data)
}

async function joinRoomByRecord(room, { redirectOnActive = true } = {}) {
  if (!state.user) {
    setText(els.roomStatus, "Primero inicia sesion con tu apodo y codigo.")
    return
  }

  if (!isValidGame(room.juego)) {
    setText(els.roomStatus, "La sala no tiene un juego valido configurado.")
    return
  }

  const alreadyInRoom = await isCurrentUserInRoom(room.id)
  if (!alreadyInRoom) {
    const count = await countPlayers(room.id)
    if (count >= Number(room.max_jugadores || 40)) {
      setText(els.roomStatus, "La sala ya tiene el maximo de 40 jugadores.")
      return
    }
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
  startPlayersPolling()
  setText(els.roomStatus, "Dentro de la sala.")

  if (redirectOnActive && room.estado === "en_juego") redirectToActiveGame()
}

async function restoreActiveRoom() {
  const roomId = localStorage.getItem("solitario_sala_id")
  const roomGame = localStorage.getItem("solitario_juego")

  if (!roomId || !roomGame || state.activeRoom) return

  const { data, error } = await supabase
    .from("salas")
    .select("*")
    .eq("id", roomId)
    .maybeSingle()

  if (error || !data || data.estado === "finalizado" || data.juego !== roomGame) {
    clearMiniTournamentContext()
    return
  }

  await joinRoomByRecord(data, { redirectOnActive: false })
}

async function countPlayers(roomId) {
  const { count } = await supabase
    .from("sala_jugadores")
    .select("id", { count: "exact", head: true })
    .eq("sala_id", roomId)
  return count || 0
}

async function isCurrentUserInRoom(roomId) {
  const { data } = await supabase
    .from("sala_jugadores")
    .select("id")
    .eq("sala_id", roomId)
    .eq("usuario_id", state.user.id)
    .maybeSingle()

  return Boolean(data)
}

function renderRoom(room) {
  els.roomDetail.hidden = false
  els.activeRoomName.textContent = room.nombre
  els.activeRoomCode.textContent = room.codigo
  if (els.roomGame) els.roomGame.textContent = gameLabel(room.juego)
  els.roomState.textContent = stateLabel(room.estado)
  const isCreator = room.creador_id === state.user.id
  els.startRoomBtn.disabled = !isCreator || room.estado !== "esperando"
  els.finishRoomBtn.disabled = !isCreator || room.estado === "finalizado"
  els.scoreRoomBtn.disabled = room.estado === "finalizado"
  if (els.openGameBtn) els.openGameBtn.disabled = room.estado !== "en_juego"
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
    const wasWaiting = state.activeRoom.estado !== "en_juego"
    state.activeRoom = data
    renderRoom(data)
    if (wasWaiting && data.estado === "en_juego") redirectToActiveGame()
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
    els.playersList.innerHTML = '<div class="status">No se pudo cargar jugadores.</div>'
    return
  }

  els.playersList.innerHTML = (data || []).map((player, index) => `
    <div class="player-row ${player.usuario_id === state.user.id ? "current" : ""}">
      <span class="rank-pos">#${index + 1}</span>
      <strong>${escapeHtml(player.usuario || player.usuario_id || "Jugador")}</strong>
      <span>${Number(player.puntos || 0)} pts</span>
    </div>
  `).join("")
}

async function updateRoomState(estado) {
  if (!state.activeRoom) return false
  const payload = { estado }
  if (estado === "en_juego") payload.inicio_torneo = new Date().toISOString()
  if (estado === "finalizado") payload.fecha_fin = new Date().toISOString()
  const { error } = await supabase.from("salas").update(payload).eq("id", state.activeRoom.id)
  if (error) {
    setText(els.roomStatus, "No se pudo actualizar la sala. Revisa que solitario-mini-torneos.sql este aplicado.")
    return false
  }
  return true
}

async function addRoomPoints() {
  if (!state.activeRoom) return
  const entered = prompt("Puntos obtenidos en el juego")
  if (entered === null) return

  const gained = Number.parseInt(entered, 10)
  if (!Number.isFinite(gained) || gained < 0) {
    setText(els.roomStatus, "Ingresa un puntaje valido.")
    return
  }

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
  await registerResult({
    points: gained,
    victory: false,
    origin: "sala",
    roomId: state.activeRoom.id,
    game: state.activeRoom.juego,
  })
  await loadPlayers()
  await loadRankings()
}

async function finishRoom() {
  if (!state.activeRoom) return
  const { data } = await supabase
    .from("sala_jugadores")
    .select("usuario_id,usuario,puntos")
    .eq("sala_id", state.activeRoom.id)
    .order("puntos", { ascending: false })

  const winnerId = data?.[0]?.usuario_id
  const updated = await updateRoomState("finalizado")
  if (!updated) return

  if (data?.length) {
    await supabase.from("solitario_resultados").insert(data.map((player) => ({
      usuario_id: player.usuario_id,
      usuario: player.usuario || player.usuario_id,
      puntos: player.puntos,
      victoria: player.usuario_id === winnerId,
      sala_id: state.activeRoom.id,
      origen: "sala",
      juego: state.activeRoom.juego,
    })))
  }

  loadRankings()
  loadActiveRooms()
}

// Iniciar no copia juegos: marca la sala como en juego y redirige a la carpeta
// existente /juegos/{juego}/index.html.
async function startRoom() {
  if (!state.activeRoom) return
  if (!isValidGame(state.activeRoom.juego)) {
    setText(els.roomStatus, "Este torneo no tiene un juego valido.")
    return
  }

  const updated = await updateRoomState("en_juego")
  if (!updated) return
  await refreshRoom()
  redirectToActiveGame()
}

// Carga salas activas y permite unirse desde tarjetas, respetando el limite de
// jugadores antes de hacer upsert en sala_jugadores.
async function loadActiveRooms() {
  if (!els.activeRoomsList) return

  const { data, error } = await supabase
    .from("salas")
    .select("id,nombre,codigo,creador_id,estado,max_jugadores,juego,created_at")
    .neq("estado", "finalizado")
    .order("created_at", { ascending: false })
    .limit(12)

  if (error) {
    els.activeRoomsList.innerHTML = '<div class="status">No se pudieron cargar torneos activos.</div>'
    return
  }

  if (!data?.length) {
    els.activeRoomsList.innerHTML = '<div class="status">Todavia no hay mini torneos activos.</div>'
    return
  }

  const counts = await Promise.all(data.map(async (room) => ({
    id: room.id,
    count: await countPlayers(room.id),
  })))
  const countByRoom = new Map(counts.map((item) => [item.id, item.count]))

  const playersByRoom = await loadPlayersPreview(data.map((room) => room.id))

  els.activeRoomsList.innerHTML = data.map((room) => {
    const players = countByRoom.get(room.id) || 0
    const preview = playersByRoom.get(room.id) || []
    return `
      <div class="active-room-row">
        <div>
          <strong>${escapeHtml(room.nombre)}</strong>
          <span class="room-game-pill">${escapeHtml(gameLabel(room.juego))}</span>
          <p class="muted">Codigo ${escapeHtml(room.codigo)} - ${stateLabel(room.estado)} - ${players}/${room.max_jugadores || 40}</p>
          <div class="mini-player-list">
            ${preview.map((player) => `<span class="mini-player-pill">${escapeHtml(player)}</span>`).join("")}
          </div>
        </div>
        <!-- Código y botón de unirse eliminados para torneos privados -->
        <!-- <button class="ghost-button" type="button" data-copy-code="${escapeHtml(room.codigo)}">Copiar codigo</button> -->
        <!-- <button type="button" data-join-room="${room.id}">Unirse</button> -->
      </div>
    `
  }).join("")

  els.activeRoomsList.querySelectorAll("[data-join-room]").forEach((button) => {
    button.addEventListener("click", async () => {
      const room = data.find((item) => String(item.id) === button.dataset.joinRoom)
      // if (room) await joinRoomByRecord(room) // Funcionalidad de unirse eliminada de la lista pública
    })
  })

  els.activeRoomsList.querySelectorAll("[data-copy-code]").forEach((button) => {
    button.addEventListener("click", async () => {
      // await navigator.clipboard?.writeText(button.dataset.copyCode) // Funcionalidad de copiar código eliminada
      // setText(els.roomStatus, "Codigo copiado.")
    })
  })
}

async function loadPlayersPreview(roomIds) {
  if (!roomIds.length) return new Map()

  const { data } = await supabase
    .from("sala_jugadores")
    .select("sala_id,usuario_id,usuario")
    .in("sala_id", roomIds)
    .order("created_at", { ascending: true })

  const grouped = new Map()
  ;(data || []).forEach((player) => {
    const players = grouped.get(player.sala_id) || []
    if (players.length < 6) players.push(player.usuario || player.usuario_id || "Jugador")
    grouped.set(player.sala_id, players)
  })

  return grouped
}

function startPlayersPolling() {
  if (state.playersPoll) clearInterval(state.playersPoll)
  state.playersPoll = setInterval(() => {
    loadPlayers()
    refreshRoom()
  }, 3000)
}

function generateRoomCode() {
  const input = document.getElementById("roomCode")
  if (!input) return
  input.value = `GW${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

// Se guardan datos minimos de contexto para que el usuario sepa de que sala
// viene al volver; los juegos existentes se abren tal cual, sin duplicarlos.
function redirectToActiveGame() {
  if (!state.activeRoom || !isValidGame(state.activeRoom.juego)) return

  localStorage.setItem("solitario_sala_id", String(state.activeRoom.id))
  localStorage.setItem("solitario_sala_codigo", state.activeRoom.codigo)
  localStorage.setItem("solitario_juego", state.activeRoom.juego)
  localStorage.setItem("solitario_origen", "sala")
  window.location.href = `../juegos/${state.activeRoom.juego}/${state.activeRoom.juego}.html`
}

function clearMiniTournamentContext() {
  localStorage.removeItem("solitario_sala_id")
  localStorage.removeItem("solitario_sala_codigo")
  localStorage.removeItem("solitario_juego")
  localStorage.removeItem("solitario_origen")
}

async function registerResult({ points, victory, origin, roomId }) {

async function loadRankings() {
  if (!state.user) return
  setText(els.rankingStatus, "Cargando rankings...")
  
  let query = supabase
    .from("solitario_resultados")
    .select("usuario_id,usuario,puntos,victoria,created_at,juego")

  if (state.rankingGame !== "todos") {
    query = query.eq("juego", state.rankingGame)
  }
  const { data, error } = await query

  if (error) {
    console.error("Error cargando rankings de solitario", error)
    setText(els.rankingStatus, `No se pudieron cargar rankings: ${error.message || "revisa la consola de Supabase."}`)
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

function isValidGame(game) {
  return MINI_TOURNAMENT_GAMES.some((item) => item.key === game)
}

function gameLabel(game) {
  return MINI_TOURNAMENT_GAMES.find((item) => item.key === game)?.label || "Sin juego"
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "")
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
