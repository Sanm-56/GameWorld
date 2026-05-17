const CRICKET_MUSIC_TRACKS = [
  { title: "Thrill", src: "./musicc/Thrill.mp3" },
  { title: "Fashon", src: "./musicc/Fashon.mp3" },
  { title: "Laong", src: "./musicc/Laong.mp3" },
  { title: "Romani", src: "./musicc/Romani.mp3" },
  { title: "Contry", src: "./musicc/Contry.mp3" },
  { title: "Actin", src: "./musicc/Actin.mp3" },
  { title: "Commer", src: "./musicc/Commer.mp3" },
  { title: "Funh", src: "./musicc/Funh.mp3" },
  { title: "Award", src: "./musicc/Award.mp3" }
]

const CRICKET_MUSIC_STORAGE = "cricketarcade_music_state"

const cricketMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaCricket(){
  try {
    return JSON.parse(sessionStorage.getItem(CRICKET_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioCricket(){
  return document.getElementById("cricketMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaCricket(){
  const audio = obtenerAudioCricket()
  sessionStorage.setItem(CRICKET_MUSIC_STORAGE, JSON.stringify({
    currentIndex: cricketMusicState.currentIndex,
    shuffle: cricketMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaCricket(){
  if(document.getElementById("cricketMusicStyles")) return

  const style = document.createElement("style")
  style.id = "cricketMusicStyles"
  style.textContent = `
.cricket-music-btn{position:fixed;right:14px;bottom:14px;z-index:1180;min-height:44px;max-width:calc(100vw - 28px);border:1px solid rgba(250,204,21,0.34);border-radius:14px;padding:10px 16px;color:#052e16;background:linear-gradient(135deg,#facc15,#22c55e);box-shadow:0 16px 34px rgba(0,0,0,0.28),0 0 26px rgba(250,204,21,0.14);cursor:pointer;font:inherit;font-size:14px;font-weight:900;line-height:1;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;}
.cricket-music-btn:hover{transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 18px 38px rgba(0,0,0,0.34),0 0 30px rgba(34,197,94,0.18);}
.cricket-music-btn:active{transform:translateY(1px) scale(.99);}
.cricket-music-menu{position:fixed;right:14px;bottom:72px;z-index:1190;display:none;width:min(350px, calc(100vw - 28px));max-height:calc(100dvh - 92px);overflow:hidden;border:1px solid rgba(250,204,21,0.36);border-radius:16px;background:rgba(7,31,24,0.98);box-shadow:0 24px 70px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.07);text-align:left;}
.cricket-music-menu.abierto{display:block;}
.cricket-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(250,204,21,0.14);background:linear-gradient(135deg,rgba(34,197,94,0.14),rgba(250,204,21,0.08));}
.cricket-music-title{min-width:0;}
.cricket-music-title strong{display:block;color:#f8fafc;font-size:15px;line-height:1.2;}
.cricket-music-title span{display:block;overflow:hidden;color:#fde68a;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.cricket-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:#f8fafc;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.cricket-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.cricket-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(250,204,21,0.4);border-radius:10px;padding:9px 10px;color:#f8fafc;background:rgba(34,197,94,0.2);cursor:pointer;font:inherit;font-size:13px;font-weight:800;}
.cricket-music-shuffle.activo{border-color:rgba(250,204,21,0.86);background:rgba(132,204,22,0.28);}
.cricket-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 222px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(250,204,21,0.58) rgba(2,6,23,0.5);}
.cricket-music-list::-webkit-scrollbar{width:8px;}
.cricket-music-list::-webkit-scrollbar-track{background:rgba(2,6,23,0.5);border-radius:999px;}
.cricket-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(250,204,21,0.58);}
.cricket-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#f8fafc;background:rgba(15,23,42,0.72);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.cricket-music-track.activo{border-color:rgba(250,204,21,0.74);background:rgba(34,197,94,0.18);}
.cricket-music-track:hover{border-color:rgba(250,204,21,0.52);background:rgba(30,41,59,0.82);}
.cricket-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cricket-music-track small{flex:0 0 auto;color:#fde68a;font-size:11px;font-weight:900;}
.cricket-music-btn:focus-visible,.cricket-music-track:focus-visible,.cricket-music-shuffle:focus-visible,.cricket-music-close:focus-visible{outline:2px solid rgba(250,204,21,0.82);outline-offset:2px;}
@media (max-width:520px){.cricket-music-btn{right:12px;bottom:12px;min-height:42px;padding:10px 14px;font-size:13px;}.cricket-music-menu{left:12px;right:12px;bottom:66px;width:auto;max-height:calc(100dvh - 82px);}.cricket-music-list{max-height:calc(100dvh - 232px);}.cricket-music-track{min-height:48px;font-size:14px;}}
@media (prefers-reduced-motion:reduce){.cricket-music-btn{transition:none;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaCricket(){
  const current = document.getElementById("cricketMusicCurrent")
  const shuffleButton = document.getElementById("cricketMusicShuffle")

  if(current){
    current.textContent = CRICKET_MUSIC_TRACKS[cricketMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = cricketMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", cricketMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(cricketMusicState.shuffle))
  }

  document.querySelectorAll("[data-cricket-music-index]").forEach((button) => {
    const active = Number(button.dataset.cricketMusicIndex) === cricketMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosCricket(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionCricket(index, playNow, startTime = 0){
  const audio = obtenerAudioCricket()
  const track = CRICKET_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosCricket(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  cricketMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaCricket()
  guardarEstadoMusicaCricket()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionCricket(){
  if(CRICKET_MUSIC_TRACKS.length <= 1) return 0

  if(cricketMusicState.shuffle){
    let nextIndex = cricketMusicState.currentIndex
    while(nextIndex === cricketMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * CRICKET_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (cricketMusicState.currentIndex + 1) % CRICKET_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionCricket(){
  cargarCancionCricket(obtenerSiguienteCancionCricket(), true)
}

function seleccionarCancionCricket(index){
  const audio = obtenerAudioCricket()
  if(audio && index === cricketMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionCricket(index, true)
}

function reproducirMusicaCricket(){
  const audio = obtenerAudioCricket()
  if(!audio) return

  if(audio.paused){
    cargarCancionCricket(cricketMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaCricket()
  }
}

function manejarClickMusicaCricket(event){
  const now = Date.now()
  const isDoubleTap = now - cricketMusicState.lastClickAt < 320
  cricketMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(cricketMusicState.clickTimer)
    return
  }

  clearTimeout(cricketMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaCricket(event)
    return
  }

  cricketMusicState.clickTimer = setTimeout(reproducirMusicaCricket, 220)
}

function abrirMenuMusicaCricket(event){
  event?.preventDefault()
  clearTimeout(cricketMusicState.clickTimer)

  const menu = document.getElementById("cricketMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaCricket()
}

function cerrarMenuMusicaCricket(){
  const menu = document.getElementById("cricketMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaCricket(){
  if(document.getElementById("cricketMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "cricket-music-menu"
  menu.id = "cricketMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="cricket-music-menu-head">
      <div class="cricket-music-title">
        <strong>Musica Cricket Arcade</strong>
        <span id="cricketMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="cricket-music-close" type="button" data-close-cricket-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="cricket-music-controls">
      <button class="cricket-music-shuffle" type="button" id="cricketMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="cricket-music-list" id="cricketMusicList" role="listbox" aria-label="Musicas de Cricket Arcade"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaCricket(){
  const audio = obtenerAudioCricket()
  if(!audio) return

  asegurarEstilosMusicaCricket()
  crearMenuMusicaCricket()

  const saved = leerEstadoMusicaCricket()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && CRICKET_MUSIC_TRACKS[savedIndex]){
    cricketMusicState.currentIndex = savedIndex
  }
  cricketMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "cricketMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionCricket)
  audio.addEventListener("pause", guardarEstadoMusicaCricket)
  audio.addEventListener("play", guardarEstadoMusicaCricket)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaCricket()
  })

  const list = document.getElementById("cricketMusicList")
  if(list){
    list.innerHTML = ""
    CRICKET_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "cricket-music-track"
      button.dataset.cricketMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionCricket(index))
      list.appendChild(button)
    })
  }

  document.getElementById("cricketMusicShuffle")?.addEventListener("click", () => {
    cricketMusicState.shuffle = !cricketMusicState.shuffle
    actualizarMenuMusicaCricket()
    guardarEstadoMusicaCricket()
  })

  document.querySelector("[data-close-cricket-music]")?.addEventListener("click", cerrarMenuMusicaCricket)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("cricketMusicMenu")
    const musicButton = document.querySelector(".cricket-music-btn")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaCricket()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaCricket()
  })

  cargarCancionCricket(cricketMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !cricketMusicState.restored){
    cricketMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaCricket)
}

window.reproducirMusica = reproducirMusicaCricket
window.reproducirMusicaCricket = reproducirMusicaCricket
window.manejarClickMusicaCricket = manejarClickMusicaCricket
window.abrirMenuMusicaCricket = abrirMenuMusicaCricket

inicializarMusicaCricket()
