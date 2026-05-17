const FLASHMIND_MUSIC_TRACKS = [
  { title: "Musica FlashMind", src: "./musicc/flashmindmusic.mp3" },
  { title: "Inde Xil", src: "./musicc/Inde Xil.mp3" },
  { title: "Sentinel", src: "./musicc/Sentinel.mp3" },
  { title: "Uplif", src: "./musicc/Uplif.mp3" },
  { title: "Epiceme", src: "./musicc/Epiceme.mp3" },
  { title: "Gentl", src: "./musicc/Gentl.mp3" },
  { title: "Grolh Aventur", src: "./musicc/Grolh Aventur.mp3" },
  { title: "Grolh Epice", src: "./musicc/Grolh Epice.mp3" },
  { title: "Grolh Pon", src: "./musicc/Grolh Pon.mp3" }
]

const FLASHMIND_MUSIC_STORAGE = "flashmind_music_state"

const flashmindMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaFlashMind(){
  try {
    return JSON.parse(sessionStorage.getItem(FLASHMIND_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioFlashMind(){
  return document.getElementById("flashmindMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaFlashMind(){
  const audio = obtenerAudioFlashMind()
  sessionStorage.setItem(FLASHMIND_MUSIC_STORAGE, JSON.stringify({
    currentIndex: flashmindMusicState.currentIndex,
    shuffle: flashmindMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaFlashMind(){
  if(document.getElementById("flashmindMusicStyles")) return

  const style = document.createElement("style")
  style.id = "flashmindMusicStyles"
  style.textContent = `
.flashmind-music-menu{position:fixed;left:14px;bottom:78px;z-index:1200;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(34,211,238,0.42);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.flashmind-music-menu.abierto{display:block;}
.flashmind-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.flashmind-music-title{min-width:0;}
.flashmind-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.flashmind-music-title span{display:block;overflow:hidden;color:#a5f3fc;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.flashmind-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.flashmind-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.flashmind-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(34,211,238,0.42);border-radius:10px;padding:9px 10px;color:white;background:rgba(14,116,144,0.34);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.flashmind-music-shuffle.activo{border-color:rgba(103,232,249,0.84);background:rgba(37,99,235,0.42);}
.flashmind-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(34,211,238,0.62) rgba(15,23,42,0.42);}
.flashmind-music-list::-webkit-scrollbar{width:8px;}
.flashmind-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.flashmind-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(34,211,238,0.62);}
.flashmind-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.flashmind-music-track.activo{border-color:rgba(103,232,249,0.78);background:rgba(14,116,144,0.28);}
.flashmind-music-track:hover{border-color:rgba(103,232,249,0.54);background:rgba(51,65,85,0.8);}
.flashmind-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.flashmind-music-track small{flex:0 0 auto;color:#a5f3fc;font-size:11px;font-weight:800;}
.flashmind-music-track:focus-visible,.flashmind-music-shuffle:focus-visible,.flashmind-music-close:focus-visible{outline:2px solid rgba(103,232,249,0.78);outline-offset:2px;}
@media (max-width:520px){.flashmind-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.flashmind-music-list{max-height:calc(100dvh - 244px);}.flashmind-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaFlashMind(){
  const current = document.getElementById("flashmindMusicCurrent")
  const shuffleButton = document.getElementById("flashmindMusicShuffle")

  if(current){
    current.textContent = FLASHMIND_MUSIC_TRACKS[flashmindMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = flashmindMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", flashmindMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(flashmindMusicState.shuffle))
  }

  document.querySelectorAll("[data-flashmind-music-index]").forEach((button) => {
    const active = Number(button.dataset.flashmindMusicIndex) === flashmindMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosFlashMind(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionFlashMind(index, playNow, startTime = 0){
  const audio = obtenerAudioFlashMind()
  const track = FLASHMIND_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosFlashMind(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  flashmindMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaFlashMind()
  guardarEstadoMusicaFlashMind()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionFlashMind(){
  if(FLASHMIND_MUSIC_TRACKS.length <= 1) return 0

  if(flashmindMusicState.shuffle){
    let nextIndex = flashmindMusicState.currentIndex
    while(nextIndex === flashmindMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * FLASHMIND_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (flashmindMusicState.currentIndex + 1) % FLASHMIND_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionFlashMind(){
  cargarCancionFlashMind(obtenerSiguienteCancionFlashMind(), true)
}

function seleccionarCancionFlashMind(index){
  const audio = obtenerAudioFlashMind()
  if(audio && index === flashmindMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionFlashMind(index, true)
}

function reproducirMusicaFlashMind(){
  const audio = obtenerAudioFlashMind()
  if(!audio) return

  if(audio.paused){
    cargarCancionFlashMind(flashmindMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaFlashMind()
  }
}

function manejarClickMusicaFlashMind(event){
  const now = Date.now()
  const isDoubleTap = now - flashmindMusicState.lastClickAt < 320
  flashmindMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(flashmindMusicState.clickTimer)
    return
  }

  clearTimeout(flashmindMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaFlashMind(event)
    return
  }

  flashmindMusicState.clickTimer = setTimeout(reproducirMusicaFlashMind, 220)
}

function abrirMenuMusicaFlashMind(event){
  event?.preventDefault()
  clearTimeout(flashmindMusicState.clickTimer)

  const menu = document.getElementById("flashmindMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaFlashMind()
}

function cerrarMenuMusicaFlashMind(){
  const menu = document.getElementById("flashmindMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaFlashMind(){
  if(document.getElementById("flashmindMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "flashmind-music-menu"
  menu.id = "flashmindMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="flashmind-music-menu-head">
      <div class="flashmind-music-title">
        <strong>Musica FlashMind</strong>
        <span id="flashmindMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="flashmind-music-close" type="button" data-close-flashmind-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="flashmind-music-controls">
      <button class="flashmind-music-shuffle" type="button" id="flashmindMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="flashmind-music-list" id="flashmindMusicList" role="listbox" aria-label="Musicas de FlashMind"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaFlashMind(){
  const audio = obtenerAudioFlashMind()
  if(!audio) return

  asegurarEstilosMusicaFlashMind()
  crearMenuMusicaFlashMind()

  const saved = leerEstadoMusicaFlashMind()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && FLASHMIND_MUSIC_TRACKS[savedIndex]){
    flashmindMusicState.currentIndex = savedIndex
  }
  flashmindMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "flashmindMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionFlashMind)
  audio.addEventListener("pause", guardarEstadoMusicaFlashMind)
  audio.addEventListener("play", guardarEstadoMusicaFlashMind)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaFlashMind()
  })

  const list = document.getElementById("flashmindMusicList")
  if(list){
    list.innerHTML = ""
    FLASHMIND_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "flashmind-music-track"
      button.dataset.flashmindMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionFlashMind(index))
      list.appendChild(button)
    })
  }

  document.getElementById("flashmindMusicShuffle")?.addEventListener("click", () => {
    flashmindMusicState.shuffle = !flashmindMusicState.shuffle
    actualizarMenuMusicaFlashMind()
    guardarEstadoMusicaFlashMind()
  })

  document.querySelector("[data-close-flashmind-music]")?.addEventListener("click", cerrarMenuMusicaFlashMind)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("flashmindMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaFlashMind()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaFlashMind()
  })

  cargarCancionFlashMind(flashmindMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !flashmindMusicState.restored){
    flashmindMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaFlashMind)
}

window.reproducirMusica = reproducirMusicaFlashMind
window.reproducirMusicaFlashMind = reproducirMusicaFlashMind
window.manejarClickMusicaFlashMind = manejarClickMusicaFlashMind
window.abrirMenuMusicaFlashMind = abrirMenuMusicaFlashMind

inicializarMusicaFlashMind()
