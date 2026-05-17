const NUMCATCH_MUSIC_TRACKS = [
  { title: "Musica NumCatch", src: "./musicc/numcatch.mp3" },
  { title: "Grolh Spor", src: "./musicc/Grolh Spor.mp3" },
  { title: "Chill KO", src: "./musicc/Chill KO.mp3" },
  { title: "Havov For", src: "./musicc/Havov For.mp3" },
  { title: "Boynd", src: "./musicc/Boynd.mp3" },
  { title: "Knap", src: "./musicc/Knap.mp3" },
  { title: "Honey", src: "./musicc/Honey.mp3" },
  { title: "Sage Nat", src: "./musicc/Sage Nat.mp3" }
]

const NUMCATCH_MUSIC_STORAGE = "numcatch_music_state"

const numcatchMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaNumCatch(){
  try {
    return JSON.parse(sessionStorage.getItem(NUMCATCH_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioNumCatch(){
  return document.getElementById("numcatchMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaNumCatch(){
  const audio = obtenerAudioNumCatch()
  sessionStorage.setItem(NUMCATCH_MUSIC_STORAGE, JSON.stringify({
    currentIndex: numcatchMusicState.currentIndex,
    shuffle: numcatchMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaNumCatch(){
  if(document.getElementById("numcatchMusicStyles")) return

  const style = document.createElement("style")
  style.id = "numcatchMusicStyles"
  style.textContent = `
.numcatch-music-menu{position:fixed;left:14px;bottom:78px;z-index:1200;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(34,197,94,0.42);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.numcatch-music-menu.abierto{display:block;}
.numcatch-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.numcatch-music-title{min-width:0;}
.numcatch-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.numcatch-music-title span{display:block;overflow:hidden;color:#bbf7d0;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.numcatch-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.numcatch-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.numcatch-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(34,197,94,0.42);border-radius:10px;padding:9px 10px;color:white;background:rgba(22,101,52,0.36);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.numcatch-music-shuffle.activo{border-color:rgba(190,242,100,0.84);background:rgba(77,124,15,0.42);}
.numcatch-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(34,197,94,0.62) rgba(15,23,42,0.42);}
.numcatch-music-list::-webkit-scrollbar{width:8px;}
.numcatch-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.numcatch-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(34,197,94,0.62);}
.numcatch-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.numcatch-music-track.activo{border-color:rgba(190,242,100,0.78);background:rgba(22,101,52,0.3);}
.numcatch-music-track:hover{border-color:rgba(190,242,100,0.54);background:rgba(51,65,85,0.8);}
.numcatch-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.numcatch-music-track small{flex:0 0 auto;color:#bbf7d0;font-size:11px;font-weight:800;}
.numcatch-music-track:focus-visible,.numcatch-music-shuffle:focus-visible,.numcatch-music-close:focus-visible{outline:2px solid rgba(190,242,100,0.78);outline-offset:2px;}
@media (max-width:520px){.numcatch-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.numcatch-music-list{max-height:calc(100dvh - 244px);}.numcatch-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaNumCatch(){
  const current = document.getElementById("numcatchMusicCurrent")
  const shuffleButton = document.getElementById("numcatchMusicShuffle")

  if(current){
    current.textContent = NUMCATCH_MUSIC_TRACKS[numcatchMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = numcatchMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", numcatchMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(numcatchMusicState.shuffle))
  }

  document.querySelectorAll("[data-numcatch-music-index]").forEach((button) => {
    const active = Number(button.dataset.numcatchMusicIndex) === numcatchMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosNumCatch(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionNumCatch(index, playNow, startTime = 0){
  const audio = obtenerAudioNumCatch()
  const track = NUMCATCH_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosNumCatch(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  numcatchMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaNumCatch()
  guardarEstadoMusicaNumCatch()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionNumCatch(){
  if(NUMCATCH_MUSIC_TRACKS.length <= 1) return 0

  if(numcatchMusicState.shuffle){
    let nextIndex = numcatchMusicState.currentIndex
    while(nextIndex === numcatchMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * NUMCATCH_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (numcatchMusicState.currentIndex + 1) % NUMCATCH_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionNumCatch(){
  cargarCancionNumCatch(obtenerSiguienteCancionNumCatch(), true)
}

function seleccionarCancionNumCatch(index){
  const audio = obtenerAudioNumCatch()
  if(audio && index === numcatchMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionNumCatch(index, true)
}

function reproducirMusicaNumCatch(){
  const audio = obtenerAudioNumCatch()
  if(!audio) return

  if(audio.paused){
    cargarCancionNumCatch(numcatchMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaNumCatch()
  }
}

function manejarClickMusicaNumCatch(event){
  const now = Date.now()
  const isDoubleTap = now - numcatchMusicState.lastClickAt < 320
  numcatchMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(numcatchMusicState.clickTimer)
    return
  }

  clearTimeout(numcatchMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaNumCatch(event)
    return
  }

  numcatchMusicState.clickTimer = setTimeout(reproducirMusicaNumCatch, 220)
}

function abrirMenuMusicaNumCatch(event){
  event?.preventDefault()
  clearTimeout(numcatchMusicState.clickTimer)

  const menu = document.getElementById("numcatchMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaNumCatch()
}

function cerrarMenuMusicaNumCatch(){
  const menu = document.getElementById("numcatchMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaNumCatch(){
  if(document.getElementById("numcatchMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "numcatch-music-menu"
  menu.id = "numcatchMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="numcatch-music-menu-head">
      <div class="numcatch-music-title">
        <strong>Musica NumCatch</strong>
        <span id="numcatchMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="numcatch-music-close" type="button" data-close-numcatch-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="numcatch-music-controls">
      <button class="numcatch-music-shuffle" type="button" id="numcatchMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="numcatch-music-list" id="numcatchMusicList" role="listbox" aria-label="Musicas de NumCatch"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaNumCatch(){
  const audio = obtenerAudioNumCatch()
  if(!audio) return

  asegurarEstilosMusicaNumCatch()
  crearMenuMusicaNumCatch()

  const saved = leerEstadoMusicaNumCatch()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && NUMCATCH_MUSIC_TRACKS[savedIndex]){
    numcatchMusicState.currentIndex = savedIndex
  }
  numcatchMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "numcatchMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionNumCatch)
  audio.addEventListener("pause", guardarEstadoMusicaNumCatch)
  audio.addEventListener("play", guardarEstadoMusicaNumCatch)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaNumCatch()
  })

  const list = document.getElementById("numcatchMusicList")
  if(list){
    list.innerHTML = ""
    NUMCATCH_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "numcatch-music-track"
      button.dataset.numcatchMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionNumCatch(index))
      list.appendChild(button)
    })
  }

  document.getElementById("numcatchMusicShuffle")?.addEventListener("click", () => {
    numcatchMusicState.shuffle = !numcatchMusicState.shuffle
    actualizarMenuMusicaNumCatch()
    guardarEstadoMusicaNumCatch()
  })

  document.querySelector("[data-close-numcatch-music]")?.addEventListener("click", cerrarMenuMusicaNumCatch)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("numcatchMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaNumCatch()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaNumCatch()
  })

  cargarCancionNumCatch(numcatchMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !numcatchMusicState.restored){
    numcatchMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaNumCatch)
}

window.reproducirMusica = reproducirMusicaNumCatch
window.reproducirMusicaNumCatch = reproducirMusicaNumCatch
window.manejarClickMusicaNumCatch = manejarClickMusicaNumCatch
window.abrirMenuMusicaNumCatch = abrirMenuMusicaNumCatch

inicializarMusicaNumCatch()
