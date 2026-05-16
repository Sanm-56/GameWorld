const MEMORIA_MUSIC_TRACKS = [
  { title: "Musica Memoria", src: "./music/musicamemoria.mp3" },
  { title: "Puente de Hueso", src: "./music/Puente de Hueso.mp3" },
  { title: "Pusl K.O", src: "./music/Pusl K.O.mp3" },
  { title: "Pulso de Cemento", src: "./music/Pulso de Cemento.mp3" },
  { title: "Dance Dav", src: "./music/Dance Dav.mp3" },
  { title: "Baila la envidia", src: "./music/Baila la envidia.mp3" },
  { title: "Falk Ike", src: "./music/Falk Ike.mp3" }
]

const MEMORIA_MUSIC_STORAGE = "memoria_music_state"

const memoriaMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaMemoria(){
  try {
    return JSON.parse(sessionStorage.getItem(MEMORIA_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioMemoria(){
  return document.getElementById("memoriaMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaMemoria(){
  const audio = obtenerAudioMemoria()
  sessionStorage.setItem(MEMORIA_MUSIC_STORAGE, JSON.stringify({
    currentIndex: memoriaMusicState.currentIndex,
    shuffle: memoriaMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaMemoria(){
  if(document.getElementById("memoriaMusicStyles")) return

  const style = document.createElement("style")
  style.id = "memoriaMusicStyles"
  style.textContent = `
.memoria-music-menu{position:fixed;left:14px;bottom:78px;z-index:1200;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(244,114,182,0.34);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.memoria-music-menu.abierto{display:block;}
.memoria-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.memoria-music-title{min-width:0;}
.memoria-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.memoria-music-title span{display:block;overflow:hidden;color:#fbcfe8;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.memoria-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.memoria-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.memoria-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(244,114,182,0.38);border-radius:10px;padding:9px 10px;color:white;background:rgba(49,46,129,0.72);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.memoria-music-shuffle.activo{border-color:rgba(251,207,232,0.82);background:rgba(236,72,153,0.32);}
.memoria-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(244,114,182,0.58) rgba(15,23,42,0.42);}
.memoria-music-list::-webkit-scrollbar{width:8px;}
.memoria-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.memoria-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(244,114,182,0.58);}
.memoria-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.memoria-music-track.activo{border-color:rgba(251,207,232,0.78);background:rgba(236,72,153,0.22);}
.memoria-music-track:hover{border-color:rgba(251,207,232,0.5);background:rgba(51,65,85,0.8);}
.memoria-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.memoria-music-track small{flex:0 0 auto;color:#fbcfe8;font-size:11px;font-weight:800;}
.memoria-music-track:focus-visible,.memoria-music-shuffle:focus-visible,.memoria-music-close:focus-visible{outline:2px solid rgba(251,207,232,0.78);outline-offset:2px;}
@media (max-width:520px){.memoria-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.memoria-music-list{max-height:calc(100dvh - 244px);}.memoria-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaMemoria(){
  const current = document.getElementById("memoriaMusicCurrent")
  const shuffleButton = document.getElementById("memoriaMusicShuffle")

  if(current){
    current.textContent = MEMORIA_MUSIC_TRACKS[memoriaMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = memoriaMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", memoriaMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(memoriaMusicState.shuffle))
  }

  document.querySelectorAll("[data-memoria-music-index]").forEach((button) => {
    const active = Number(button.dataset.memoriaMusicIndex) === memoriaMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function cargarCancionMemoria(index, playNow, startTime = 0){
  const audio = obtenerAudioMemoria()
  const track = MEMORIA_MUSIC_TRACKS[index]
  if(!audio || !track) return

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  memoriaMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaMemoria()
  guardarEstadoMusicaMemoria()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionMemoria(){
  if(MEMORIA_MUSIC_TRACKS.length <= 1) return 0

  if(memoriaMusicState.shuffle){
    let nextIndex = memoriaMusicState.currentIndex
    while(nextIndex === memoriaMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * MEMORIA_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (memoriaMusicState.currentIndex + 1) % MEMORIA_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionMemoria(){
  cargarCancionMemoria(obtenerSiguienteCancionMemoria(), true)
}

function seleccionarCancionMemoria(index){
  const audio = obtenerAudioMemoria()
  if(audio && index === memoriaMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionMemoria(index, true)
}

function reproducirMusica(){
  const audio = obtenerAudioMemoria()
  if(!audio) return

  if(audio.paused){
    cargarCancionMemoria(memoriaMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaMemoria()
  }
}

function manejarClickMusicaMemoria(event){
  const now = Date.now()
  const isDoubleTap = now - memoriaMusicState.lastClickAt < 320
  memoriaMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(memoriaMusicState.clickTimer)
    return
  }

  clearTimeout(memoriaMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaMemoria(event)
    return
  }

  memoriaMusicState.clickTimer = setTimeout(reproducirMusica, 220)
}

function abrirMenuMusicaMemoria(event){
  event?.preventDefault()
  clearTimeout(memoriaMusicState.clickTimer)

  const menu = document.getElementById("memoriaMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaMemoria()
}

function cerrarMenuMusicaMemoria(){
  const menu = document.getElementById("memoriaMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaMemoria(){
  if(document.getElementById("memoriaMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "memoria-music-menu"
  menu.id = "memoriaMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="memoria-music-menu-head">
      <div class="memoria-music-title">
        <strong>Musica Memoria</strong>
        <span id="memoriaMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="memoria-music-close" type="button" data-close-memoria-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="memoria-music-controls">
      <button class="memoria-music-shuffle" type="button" id="memoriaMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="memoria-music-list" id="memoriaMusicList" role="listbox" aria-label="Musicas de Memoria"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaMemoria(){
  const audio = obtenerAudioMemoria()
  if(!audio) return

  asegurarEstilosMusicaMemoria()
  crearMenuMusicaMemoria()

  const saved = leerEstadoMusicaMemoria()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && MEMORIA_MUSIC_TRACKS[savedIndex]){
    memoriaMusicState.currentIndex = savedIndex
  }
  memoriaMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "memoriaMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionMemoria)
  audio.addEventListener("pause", guardarEstadoMusicaMemoria)
  audio.addEventListener("play", guardarEstadoMusicaMemoria)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaMemoria()
  })

  const list = document.getElementById("memoriaMusicList")
  if(list){
    list.innerHTML = ""
    MEMORIA_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "memoria-music-track"
      button.dataset.memoriaMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionMemoria(index))
      list.appendChild(button)
    })
  }

  document.getElementById("memoriaMusicShuffle")?.addEventListener("click", () => {
    memoriaMusicState.shuffle = !memoriaMusicState.shuffle
    actualizarMenuMusicaMemoria()
    guardarEstadoMusicaMemoria()
  })

  document.querySelector("[data-close-memoria-music]")?.addEventListener("click", cerrarMenuMusicaMemoria)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("memoriaMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaMemoria()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaMemoria()
  })

  cargarCancionMemoria(memoriaMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !memoriaMusicState.restored){
    memoriaMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaMemoria)
}

window.reproducirMusica = reproducirMusica
window.manejarClickMusicaMemoria = manejarClickMusicaMemoria
window.abrirMenuMusicaMemoria = abrirMenuMusicaMemoria

inicializarMusicaMemoria()
