const SUDOKU_MUSIC_TRACKS = [
  { title: "Musica Sudoku", src: "./music/musicasudoku.mp3" },
  { title: "Piso de Humo", src: "./music/Piso de Humo.mp3" },
  { title: "Eco de Noche", src: "./music/Eco de Noche.mp3" },
  { title: "Calle Orbe", src: "./music/Calle Orbe.mp3" },
  { title: "Calle de Cobre", src: "./music/Calle de Cobre.mp3" },
  { title: "Patchwork Plus", src: "./music/Patchwork Plus.mp3" },
  { title: "Patchwork Boots", src: "./music/Patchwork Boots.mp3" }
]

const SUDOKU_MUSIC_STORAGE = "sudoku_music_state"

const sudokuMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaSudoku(){
  try {
    return JSON.parse(sessionStorage.getItem(SUDOKU_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function guardarEstadoMusicaSudoku(){
  const audio = obtenerAudioSudoku()
  sessionStorage.setItem(SUDOKU_MUSIC_STORAGE, JSON.stringify({
    currentIndex: sudokuMusicState.currentIndex,
    shuffle: sudokuMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function obtenerAudioSudoku(){
  return document.getElementById("sudokuMusicAudio") || document.querySelector("audio")
}

function actualizarMenuMusicaSudoku(){
  const current = document.getElementById("sudokuMusicCurrent")
  const shuffleButton = document.getElementById("sudokuMusicShuffle")

  if(current){
    current.textContent = SUDOKU_MUSIC_TRACKS[sudokuMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = sudokuMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", sudokuMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(sudokuMusicState.shuffle))
  }

  document.querySelectorAll("[data-sudoku-music-index]").forEach((button) => {
    const active = Number(button.dataset.sudokuMusicIndex) === sudokuMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function cargarCancionSudoku(index, playNow, startTime = 0){
  const audio = obtenerAudioSudoku()
  const track = SUDOKU_MUSIC_TRACKS[index]
  if(!audio || !track) return

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  sudokuMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaSudoku()
  guardarEstadoMusicaSudoku()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionSudoku(){
  if(SUDOKU_MUSIC_TRACKS.length <= 1) return 0

  if(sudokuMusicState.shuffle){
    let nextIndex = sudokuMusicState.currentIndex
    while(nextIndex === sudokuMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * SUDOKU_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (sudokuMusicState.currentIndex + 1) % SUDOKU_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionSudoku(){
  cargarCancionSudoku(obtenerSiguienteCancionSudoku(), true)
}

function seleccionarCancionSudoku(index){
  const audio = obtenerAudioSudoku()
  if(audio && index === sudokuMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionSudoku(index, true)
}

function reproducirMusica(){
  const audio = obtenerAudioSudoku()
  if(!audio) return

  if(audio.paused){
    cargarCancionSudoku(sudokuMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaSudoku()
  }
}

function manejarClickMusicaSudoku(event){
  const now = Date.now()
  const isDoubleTap = now - sudokuMusicState.lastClickAt < 320
  sudokuMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(sudokuMusicState.clickTimer)
    return
  }

  clearTimeout(sudokuMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaSudoku(event)
    return
  }

  sudokuMusicState.clickTimer = setTimeout(reproducirMusica, 220)
}

function abrirMenuMusicaSudoku(event){
  event?.preventDefault()
  clearTimeout(sudokuMusicState.clickTimer)

  const menu = document.getElementById("sudokuMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaSudoku()
}

function cerrarMenuMusicaSudoku(){
  const menu = document.getElementById("sudokuMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaSudoku(){
  if(document.getElementById("sudokuMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "sudoku-music-menu"
  menu.id = "sudokuMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="sudoku-music-menu-head">
      <div class="sudoku-music-title">
        <strong>Musica Sudoku</strong>
        <span id="sudokuMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="sudoku-music-close" type="button" data-close-sudoku-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="sudoku-music-controls">
      <button class="sudoku-music-shuffle" type="button" id="sudokuMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="sudoku-music-list" id="sudokuMusicList" role="listbox" aria-label="Musicas de Sudoku"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaSudoku(){
  const audio = obtenerAudioSudoku()
  if(!audio) return

  crearMenuMusicaSudoku()

  const saved = leerEstadoMusicaSudoku()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && SUDOKU_MUSIC_TRACKS[savedIndex]){
    sudokuMusicState.currentIndex = savedIndex
  }
  sudokuMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "sudokuMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionSudoku)
  audio.addEventListener("pause", guardarEstadoMusicaSudoku)
  audio.addEventListener("play", guardarEstadoMusicaSudoku)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaSudoku()
  })

  const list = document.getElementById("sudokuMusicList")
  if(list){
    list.innerHTML = ""
    SUDOKU_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "sudoku-music-track"
      button.dataset.sudokuMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionSudoku(index))
      list.appendChild(button)
    })
  }

  document.getElementById("sudokuMusicShuffle")?.addEventListener("click", () => {
    sudokuMusicState.shuffle = !sudokuMusicState.shuffle
    actualizarMenuMusicaSudoku()
    guardarEstadoMusicaSudoku()
  })

  document.querySelector("[data-close-sudoku-music]")?.addEventListener("click", cerrarMenuMusicaSudoku)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("sudokuMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaSudoku()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaSudoku()
  })

  cargarCancionSudoku(sudokuMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !sudokuMusicState.restored){
    sudokuMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaSudoku)
}

window.reproducirMusica = reproducirMusica
window.manejarClickMusicaSudoku = manejarClickMusicaSudoku
window.abrirMenuMusicaSudoku = abrirMenuMusicaSudoku

inicializarMusicaSudoku()
