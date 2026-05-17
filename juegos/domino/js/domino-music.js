const DOMINO_MUSIC_TRACKS = [
  { title: "Musica Domino", src: "./music/dominomusic.mp3" },
  { title: "Lish Stip", src: "./music/Lish Stip.mp3" },
  { title: "Vloh Hip", src: "./music/Vloh Hip.mp3" },
  { title: "Organ Jil", src: "./music/Organ Jil.mp3" },
  { title: "Upbet Happ", src: "./music/Upbet Happ.mp3" },
  { title: "Blue Hall", src: "./music/Blue Hall.mp3" },
  { title: "Warv", src: "./music/Warv.mp3" },
  { title: "Miro Mic", src: "./music/Miro Mic.mp3" },
  { title: "Charn Kil", src: "./music/Charn Kil.mp3" }
]

const DOMINO_MUSIC_STORAGE = "domino_music_state"

const dominoMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaDomino(){
  try {
    return JSON.parse(sessionStorage.getItem(DOMINO_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioDomino(){
  return document.getElementById("dominoMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaDomino(){
  const audio = obtenerAudioDomino()
  sessionStorage.setItem(DOMINO_MUSIC_STORAGE, JSON.stringify({
    currentIndex: dominoMusicState.currentIndex,
    shuffle: dominoMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaDomino(){
  if(document.getElementById("dominoMusicStyles")) return

  const style = document.createElement("style")
  style.id = "dominoMusicStyles"
  style.textContent = `
.domino-music-menu{position:fixed;left:14px;bottom:78px;z-index:1200;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(248,250,252,0.28);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.domino-music-menu.abierto{display:block;}
.domino-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.domino-music-title{min-width:0;}
.domino-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.domino-music-title span{display:block;overflow:hidden;color:#cbd5e1;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.domino-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.domino-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.domino-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(148,163,184,0.42);border-radius:10px;padding:9px 10px;color:white;background:rgba(51,65,85,0.64);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.domino-music-shuffle.activo{border-color:rgba(248,250,252,0.82);background:rgba(100,116,139,0.46);}
.domino-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(203,213,225,0.58) rgba(15,23,42,0.42);}
.domino-music-list::-webkit-scrollbar{width:8px;}
.domino-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.domino-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(203,213,225,0.58);}
.domino-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.domino-music-track.activo{border-color:rgba(248,250,252,0.78);background:rgba(100,116,139,0.26);}
.domino-music-track:hover{border-color:rgba(248,250,252,0.5);background:rgba(51,65,85,0.8);}
.domino-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.domino-music-track small{flex:0 0 auto;color:#e2e8f0;font-size:11px;font-weight:800;}
.domino-music-track:focus-visible,.domino-music-shuffle:focus-visible,.domino-music-close:focus-visible{outline:2px solid rgba(248,250,252,0.78);outline-offset:2px;}
@media (max-width:520px){.domino-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.domino-music-list{max-height:calc(100dvh - 244px);}.domino-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaDomino(){
  const current = document.getElementById("dominoMusicCurrent")
  const shuffleButton = document.getElementById("dominoMusicShuffle")

  if(current){
    current.textContent = DOMINO_MUSIC_TRACKS[dominoMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = dominoMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", dominoMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(dominoMusicState.shuffle))
  }

  document.querySelectorAll("[data-domino-music-index]").forEach((button) => {
    const active = Number(button.dataset.dominoMusicIndex) === dominoMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosDomino(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionDomino(index, playNow, startTime = 0){
  const audio = obtenerAudioDomino()
  const track = DOMINO_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosDomino(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  dominoMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaDomino()
  guardarEstadoMusicaDomino()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionDomino(){
  if(DOMINO_MUSIC_TRACKS.length <= 1) return 0

  if(dominoMusicState.shuffle){
    let nextIndex = dominoMusicState.currentIndex
    while(nextIndex === dominoMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * DOMINO_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (dominoMusicState.currentIndex + 1) % DOMINO_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionDomino(){
  cargarCancionDomino(obtenerSiguienteCancionDomino(), true)
}

function seleccionarCancionDomino(index){
  const audio = obtenerAudioDomino()
  if(audio && index === dominoMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionDomino(index, true)
}

function reproducirMusicaDomino(){
  const audio = obtenerAudioDomino()
  if(!audio) return

  if(audio.paused){
    cargarCancionDomino(dominoMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaDomino()
  }
}

function manejarClickMusicaDomino(event){
  const now = Date.now()
  const isDoubleTap = now - dominoMusicState.lastClickAt < 320
  dominoMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(dominoMusicState.clickTimer)
    return
  }

  clearTimeout(dominoMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaDomino(event)
    return
  }

  dominoMusicState.clickTimer = setTimeout(reproducirMusicaDomino, 220)
}

function abrirMenuMusicaDomino(event){
  event?.preventDefault()
  clearTimeout(dominoMusicState.clickTimer)

  const menu = document.getElementById("dominoMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaDomino()
}

function cerrarMenuMusicaDomino(){
  const menu = document.getElementById("dominoMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaDomino(){
  if(document.getElementById("dominoMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "domino-music-menu"
  menu.id = "dominoMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="domino-music-menu-head">
      <div class="domino-music-title">
        <strong>Musica Domino</strong>
        <span id="dominoMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="domino-music-close" type="button" data-close-domino-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="domino-music-controls">
      <button class="domino-music-shuffle" type="button" id="dominoMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="domino-music-list" id="dominoMusicList" role="listbox" aria-label="Musicas de Domino"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaDomino(){
  const audio = obtenerAudioDomino()
  if(!audio) return

  asegurarEstilosMusicaDomino()
  crearMenuMusicaDomino()

  const saved = leerEstadoMusicaDomino()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && DOMINO_MUSIC_TRACKS[savedIndex]){
    dominoMusicState.currentIndex = savedIndex
  }
  dominoMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "dominoMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionDomino)
  audio.addEventListener("pause", guardarEstadoMusicaDomino)
  audio.addEventListener("play", guardarEstadoMusicaDomino)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaDomino()
  })

  const list = document.getElementById("dominoMusicList")
  if(list){
    list.innerHTML = ""
    DOMINO_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "domino-music-track"
      button.dataset.dominoMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionDomino(index))
      list.appendChild(button)
    })
  }

  document.getElementById("dominoMusicShuffle")?.addEventListener("click", () => {
    dominoMusicState.shuffle = !dominoMusicState.shuffle
    actualizarMenuMusicaDomino()
    guardarEstadoMusicaDomino()
  })

  document.querySelector("[data-close-domino-music]")?.addEventListener("click", cerrarMenuMusicaDomino)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("dominoMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaDomino()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaDomino()
  })

  cargarCancionDomino(dominoMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !dominoMusicState.restored){
    dominoMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaDomino)
}

window.reproducirMusica = reproducirMusicaDomino
window.reproducirMusicaDomino = reproducirMusicaDomino
window.manejarClickMusicaDomino = manejarClickMusicaDomino
window.abrirMenuMusicaDomino = abrirMenuMusicaDomino

inicializarMusicaDomino()
