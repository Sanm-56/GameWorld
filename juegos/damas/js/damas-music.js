const DAMAS_MUSIC_TRACKS = [
  { title: "Musica Damas", src: "./music/damasmusic.mp3" },
  { title: "Phul Fik", src: "./music/Phul Fik.mp3" },
  { title: "Acti Spot", src: "./music/Acti Spot.mp3" },
  { title: "Magpieg Musk", src: "./music/Magpieg Musk.mp3" },
  { title: "Gvidon Med", src: "./music/Gvidon Med.mp3" },
  { title: "Kontraa Mus", src: "./music/Kontraa Mus.mp3" },
  { title: "Fassounds", src: "./music/Fassounds.mp3" },
  { title: "Phon Bril", src: "./music/Phon Bril.mp3" },
  { title: "Phonk Log", src: "./music/Phonk Log.mp3" }
]

const DAMAS_MUSIC_STORAGE = "damas_music_state"

const damasMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaDamas(){
  try {
    return JSON.parse(sessionStorage.getItem(DAMAS_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioDamas(){
  return document.getElementById("damasMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaDamas(){
  const audio = obtenerAudioDamas()
  sessionStorage.setItem(DAMAS_MUSIC_STORAGE, JSON.stringify({
    currentIndex: damasMusicState.currentIndex,
    shuffle: damasMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaDamas(){
  if(document.getElementById("damasMusicStyles")) return

  const style = document.createElement("style")
  style.id = "damasMusicStyles"
  style.textContent = `
.damas-music-menu{position:fixed;left:14px;bottom:78px;z-index:1200;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(248,113,113,0.38);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.damas-music-menu.abierto{display:block;}
.damas-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.damas-music-title{min-width:0;}
.damas-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.damas-music-title span{display:block;overflow:hidden;color:#fecaca;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.damas-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.damas-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.damas-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(248,113,113,0.42);border-radius:10px;padding:9px 10px;color:white;background:rgba(127,29,29,0.44);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.damas-music-shuffle.activo{border-color:rgba(254,202,202,0.82);background:rgba(220,38,38,0.34);}
.damas-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(248,113,113,0.58) rgba(15,23,42,0.42);}
.damas-music-list::-webkit-scrollbar{width:8px;}
.damas-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.damas-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(248,113,113,0.58);}
.damas-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.damas-music-track.activo{border-color:rgba(254,202,202,0.78);background:rgba(220,38,38,0.2);}
.damas-music-track:hover{border-color:rgba(254,202,202,0.5);background:rgba(51,65,85,0.8);}
.damas-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.damas-music-track small{flex:0 0 auto;color:#fecaca;font-size:11px;font-weight:800;}
.damas-music-track:focus-visible,.damas-music-shuffle:focus-visible,.damas-music-close:focus-visible{outline:2px solid rgba(254,202,202,0.78);outline-offset:2px;}
@media (max-width:520px){.damas-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.damas-music-list{max-height:calc(100dvh - 244px);}.damas-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaDamas(){
  const current = document.getElementById("damasMusicCurrent")
  const shuffleButton = document.getElementById("damasMusicShuffle")

  if(current){
    current.textContent = DAMAS_MUSIC_TRACKS[damasMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = damasMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", damasMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(damasMusicState.shuffle))
  }

  document.querySelectorAll("[data-damas-music-index]").forEach((button) => {
    const active = Number(button.dataset.damasMusicIndex) === damasMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosDamas(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionDamas(index, playNow, startTime = 0){
  const audio = obtenerAudioDamas()
  const track = DAMAS_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosDamas(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  damasMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaDamas()
  guardarEstadoMusicaDamas()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionDamas(){
  if(DAMAS_MUSIC_TRACKS.length <= 1) return 0

  if(damasMusicState.shuffle){
    let nextIndex = damasMusicState.currentIndex
    while(nextIndex === damasMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * DAMAS_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (damasMusicState.currentIndex + 1) % DAMAS_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionDamas(){
  cargarCancionDamas(obtenerSiguienteCancionDamas(), true)
}

function seleccionarCancionDamas(index){
  const audio = obtenerAudioDamas()
  if(audio && index === damasMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionDamas(index, true)
}

function reproducirMusicaDamas(){
  const audio = obtenerAudioDamas()
  if(!audio) return

  if(audio.paused){
    cargarCancionDamas(damasMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaDamas()
  }
}

function manejarClickMusicaDamas(event){
  const now = Date.now()
  const isDoubleTap = now - damasMusicState.lastClickAt < 320
  damasMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(damasMusicState.clickTimer)
    return
  }

  clearTimeout(damasMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaDamas(event)
    return
  }

  damasMusicState.clickTimer = setTimeout(reproducirMusicaDamas, 220)
}

function abrirMenuMusicaDamas(event){
  event?.preventDefault()
  clearTimeout(damasMusicState.clickTimer)

  const menu = document.getElementById("damasMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaDamas()
}

function cerrarMenuMusicaDamas(){
  const menu = document.getElementById("damasMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaDamas(){
  if(document.getElementById("damasMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "damas-music-menu"
  menu.id = "damasMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="damas-music-menu-head">
      <div class="damas-music-title">
        <strong>Musica Damas</strong>
        <span id="damasMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="damas-music-close" type="button" data-close-damas-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="damas-music-controls">
      <button class="damas-music-shuffle" type="button" id="damasMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="damas-music-list" id="damasMusicList" role="listbox" aria-label="Musicas de Damas"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaDamas(){
  const audio = obtenerAudioDamas()
  if(!audio) return

  asegurarEstilosMusicaDamas()
  crearMenuMusicaDamas()

  const saved = leerEstadoMusicaDamas()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && DAMAS_MUSIC_TRACKS[savedIndex]){
    damasMusicState.currentIndex = savedIndex
  }
  damasMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "damasMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionDamas)
  audio.addEventListener("pause", guardarEstadoMusicaDamas)
  audio.addEventListener("play", guardarEstadoMusicaDamas)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaDamas()
  })

  const list = document.getElementById("damasMusicList")
  if(list){
    list.innerHTML = ""
    DAMAS_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "damas-music-track"
      button.dataset.damasMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionDamas(index))
      list.appendChild(button)
    })
  }

  document.getElementById("damasMusicShuffle")?.addEventListener("click", () => {
    damasMusicState.shuffle = !damasMusicState.shuffle
    actualizarMenuMusicaDamas()
    guardarEstadoMusicaDamas()
  })

  document.querySelector("[data-close-damas-music]")?.addEventListener("click", cerrarMenuMusicaDamas)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("damasMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaDamas()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaDamas()
  })

  cargarCancionDamas(damasMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !damasMusicState.restored){
    damasMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaDamas)
}

window.reproducirMusica = reproducirMusicaDamas
window.reproducirMusicaDamas = reproducirMusicaDamas
window.manejarClickMusicaDamas = manejarClickMusicaDamas
window.abrirMenuMusicaDamas = abrirMenuMusicaDamas

inicializarMusicaDamas()
