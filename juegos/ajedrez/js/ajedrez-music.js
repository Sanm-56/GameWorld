const AJEDREZ_MUSIC_TRACKS = [
  { title: "Musica Ajedrez", src: "./music/ajedrezmusic.mp3" },
  { title: "Cybedas", src: "./music/Cybedas.mp3" },
  { title: "Korne", src: "./music/Korne.mp3" },
  { title: "Sleep", src: "./music/Sleep.mp3" },
  { title: "Branssho", src: "./music/Branssho.mp3" },
  { title: "Sonican", src: "./music/Sonican.mp3" },
  { title: "Inspirin", src: "./music/Inspirin.mp3" },
  { title: "Berry Bip", src: "./music/Berry Bip.mp3" },
  { title: "Roc Kop", src: "./music/Roc Kop.mp3" }
]

const AJEDREZ_MUSIC_STORAGE = "ajedrez_music_state"

const ajedrezMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaAjedrez(){
  try {
    return JSON.parse(sessionStorage.getItem(AJEDREZ_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioAjedrez(){
  return document.getElementById("ajedrezMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaAjedrez(){
  const audio = obtenerAudioAjedrez()
  sessionStorage.setItem(AJEDREZ_MUSIC_STORAGE, JSON.stringify({
    currentIndex: ajedrezMusicState.currentIndex,
    shuffle: ajedrezMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaAjedrez(){
  if(document.getElementById("ajedrezMusicStyles")) return

  const style = document.createElement("style")
  style.id = "ajedrezMusicStyles"
  style.textContent = `
.ajedrez-music-menu{position:fixed;left:14px;bottom:78px;z-index:1190;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(214,180,141,0.42);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.ajedrez-music-menu.abierto{display:block;}
.ajedrez-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.ajedrez-music-title{min-width:0;}
.ajedrez-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.ajedrez-music-title span{display:block;overflow:hidden;color:#fed7aa;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.ajedrez-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.ajedrez-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.ajedrez-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(214,180,141,0.42);border-radius:10px;padding:9px 10px;color:white;background:rgba(120,53,15,0.34);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.ajedrez-music-shuffle.activo{border-color:rgba(254,215,170,0.82);background:rgba(146,64,14,0.42);}
.ajedrez-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(214,180,141,0.62) rgba(15,23,42,0.42);}
.ajedrez-music-list::-webkit-scrollbar{width:8px;}
.ajedrez-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.ajedrez-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(214,180,141,0.62);}
.ajedrez-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.ajedrez-music-track.activo{border-color:rgba(254,215,170,0.78);background:rgba(146,64,14,0.22);}
.ajedrez-music-track:hover{border-color:rgba(254,215,170,0.5);background:rgba(51,65,85,0.8);}
.ajedrez-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ajedrez-music-track small{flex:0 0 auto;color:#fed7aa;font-size:11px;font-weight:800;}
.ajedrez-music-track:focus-visible,.ajedrez-music-shuffle:focus-visible,.ajedrez-music-close:focus-visible{outline:2px solid rgba(254,215,170,0.78);outline-offset:2px;}
@media (max-width:520px){.ajedrez-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.ajedrez-music-list{max-height:calc(100dvh - 244px);}.ajedrez-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaAjedrez(){
  const current = document.getElementById("ajedrezMusicCurrent")
  const shuffleButton = document.getElementById("ajedrezMusicShuffle")

  if(current){
    current.textContent = AJEDREZ_MUSIC_TRACKS[ajedrezMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = ajedrezMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", ajedrezMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(ajedrezMusicState.shuffle))
  }

  document.querySelectorAll("[data-ajedrez-music-index]").forEach((button) => {
    const active = Number(button.dataset.ajedrezMusicIndex) === ajedrezMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosAjedrez(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionAjedrez(index, playNow, startTime = 0){
  const audio = obtenerAudioAjedrez()
  const track = AJEDREZ_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosAjedrez(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  ajedrezMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaAjedrez()
  guardarEstadoMusicaAjedrez()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionAjedrez(){
  if(AJEDREZ_MUSIC_TRACKS.length <= 1) return 0

  if(ajedrezMusicState.shuffle){
    let nextIndex = ajedrezMusicState.currentIndex
    while(nextIndex === ajedrezMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * AJEDREZ_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (ajedrezMusicState.currentIndex + 1) % AJEDREZ_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionAjedrez(){
  cargarCancionAjedrez(obtenerSiguienteCancionAjedrez(), true)
}

function seleccionarCancionAjedrez(index){
  const audio = obtenerAudioAjedrez()
  if(audio && index === ajedrezMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionAjedrez(index, true)
}

function reproducirMusicaAjedrez(){
  const audio = obtenerAudioAjedrez()
  if(!audio) return

  if(audio.paused){
    cargarCancionAjedrez(ajedrezMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaAjedrez()
  }
}

function manejarClickMusicaAjedrez(event){
  const now = Date.now()
  const isDoubleTap = now - ajedrezMusicState.lastClickAt < 320
  ajedrezMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(ajedrezMusicState.clickTimer)
    return
  }

  clearTimeout(ajedrezMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaAjedrez(event)
    return
  }

  ajedrezMusicState.clickTimer = setTimeout(reproducirMusicaAjedrez, 220)
}

function abrirMenuMusicaAjedrez(event){
  event?.preventDefault()
  clearTimeout(ajedrezMusicState.clickTimer)

  const menu = document.getElementById("ajedrezMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaAjedrez()
}

function cerrarMenuMusicaAjedrez(){
  const menu = document.getElementById("ajedrezMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaAjedrez(){
  if(document.getElementById("ajedrezMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "ajedrez-music-menu"
  menu.id = "ajedrezMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="ajedrez-music-menu-head">
      <div class="ajedrez-music-title">
        <strong>Musica Ajedrez</strong>
        <span id="ajedrezMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="ajedrez-music-close" type="button" data-close-ajedrez-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="ajedrez-music-controls">
      <button class="ajedrez-music-shuffle" type="button" id="ajedrezMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="ajedrez-music-list" id="ajedrezMusicList" role="listbox" aria-label="Musicas de Ajedrez"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaAjedrez(){
  const audio = obtenerAudioAjedrez()
  if(!audio) return

  asegurarEstilosMusicaAjedrez()
  crearMenuMusicaAjedrez()

  const saved = leerEstadoMusicaAjedrez()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && AJEDREZ_MUSIC_TRACKS[savedIndex]){
    ajedrezMusicState.currentIndex = savedIndex
  }
  ajedrezMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "ajedrezMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionAjedrez)
  audio.addEventListener("pause", guardarEstadoMusicaAjedrez)
  audio.addEventListener("play", guardarEstadoMusicaAjedrez)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaAjedrez()
  })

  const list = document.getElementById("ajedrezMusicList")
  if(list){
    list.innerHTML = ""
    AJEDREZ_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "ajedrez-music-track"
      button.dataset.ajedrezMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionAjedrez(index))
      list.appendChild(button)
    })
  }

  document.getElementById("ajedrezMusicShuffle")?.addEventListener("click", () => {
    ajedrezMusicState.shuffle = !ajedrezMusicState.shuffle
    actualizarMenuMusicaAjedrez()
    guardarEstadoMusicaAjedrez()
  })

  document.querySelector("[data-close-ajedrez-music]")?.addEventListener("click", cerrarMenuMusicaAjedrez)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("ajedrezMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaAjedrez()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaAjedrez()
  })

  cargarCancionAjedrez(ajedrezMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !ajedrezMusicState.restored){
    ajedrezMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaAjedrez)
}

window.reproducirMusica = reproducirMusicaAjedrez
window.reproducirMusicaAjedrez = reproducirMusicaAjedrez
window.manejarClickMusicaAjedrez = manejarClickMusicaAjedrez
window.abrirMenuMusicaAjedrez = abrirMenuMusicaAjedrez

inicializarMusicaAjedrez()
