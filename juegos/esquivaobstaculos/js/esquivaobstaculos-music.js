const DODGE_MUSIC_TRACKS = [
  { title: "Buss Busss", src: "./music/Buss Busss.mp3" },
  { title: "Styllis", src: "./music/Styllis.mp3" },
  { title: "Funn", src: "./music/Funn.mp3" },
  { title: "Upkip", src: "./music/Upkip.mp3" },
  { title: "Philk Mook", src: "./music/Philk Mook.mp3" },
  { title: "Corporat", src: "./music/Corporat.mp3" },
  { title: "Present", src: "./music/Present.mp3" }
]

const DODGE_MUSIC_STORAGE = "esquivaobstaculos_music_state"

const dodgeMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaDodge(){
  try {
    return JSON.parse(sessionStorage.getItem(DODGE_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioDodge(){
  return document.getElementById("dodgeMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaDodge(){
  const audio = obtenerAudioDodge()
  sessionStorage.setItem(DODGE_MUSIC_STORAGE, JSON.stringify({
    currentIndex: dodgeMusicState.currentIndex,
    shuffle: dodgeMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaDodge(){
  if(document.getElementById("dodgeMusicStyles")) return

  const style = document.createElement("style")
  style.id = "dodgeMusicStyles"
  style.textContent = `
.dodge-music-btn{position:fixed;left:14px;bottom:14px;z-index:1180;min-height:44px;max-width:calc(100vw - 28px);border:1px solid rgba(125,211,252,0.38);border-radius:14px;padding:10px 16px;color:#e0f2fe;background:linear-gradient(135deg,#0369a1,#fb7185);box-shadow:0 16px 34px rgba(0,0,0,0.28),0 0 26px rgba(56,189,248,0.16);cursor:pointer;font:inherit;font-size:14px;font-weight:900;line-height:1;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;}
.dodge-music-btn:hover{transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 18px 38px rgba(0,0,0,0.34),0 0 30px rgba(251,113,133,0.18);}
.dodge-music-btn:active{transform:translateY(1px) scale(.99);}
.dodge-music-menu{position:fixed;left:14px;bottom:72px;z-index:1190;display:none;width:min(350px, calc(100vw - 28px));max-height:calc(100dvh - 92px);overflow:hidden;border:1px solid rgba(125,211,252,0.36);border-radius:16px;background:rgba(7,17,31,0.98);box-shadow:0 24px 70px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.07);text-align:left;}
.dodge-music-menu.abierto{display:block;}
.dodge-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(125,211,252,0.14);background:linear-gradient(135deg,rgba(56,189,248,0.14),rgba(251,113,133,0.08));}
.dodge-music-title{min-width:0;}
.dodge-music-title strong{display:block;color:#f8fafc;font-size:15px;line-height:1.2;}
.dodge-music-title span{display:block;overflow:hidden;color:#bae6fd;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.dodge-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:#f8fafc;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.dodge-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.dodge-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(125,211,252,0.4);border-radius:10px;padding:9px 10px;color:#f8fafc;background:rgba(3,105,161,0.32);cursor:pointer;font:inherit;font-size:13px;font-weight:800;}
.dodge-music-shuffle.activo{border-color:rgba(251,113,133,0.78);background:rgba(190,18,60,0.32);}
.dodge-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 222px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(125,211,252,0.58) rgba(2,6,23,0.5);}
.dodge-music-list::-webkit-scrollbar{width:8px;}
.dodge-music-list::-webkit-scrollbar-track{background:rgba(2,6,23,0.5);border-radius:999px;}
.dodge-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(125,211,252,0.58);}
.dodge-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#f8fafc;background:rgba(15,23,42,0.72);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.dodge-music-track.activo{border-color:rgba(251,113,133,0.74);background:rgba(14,116,144,0.22);}
.dodge-music-track:hover{border-color:rgba(125,211,252,0.52);background:rgba(30,41,59,0.82);}
.dodge-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dodge-music-track small{flex:0 0 auto;color:#bae6fd;font-size:11px;font-weight:900;}
.dodge-music-btn:focus-visible,.dodge-music-track:focus-visible,.dodge-music-shuffle:focus-visible,.dodge-music-close:focus-visible{outline:2px solid rgba(125,211,252,0.82);outline-offset:2px;}
@media (max-width:520px){.dodge-music-btn{left:12px;bottom:12px;min-height:42px;padding:10px 14px;font-size:13px;}.dodge-music-menu{left:12px;right:12px;bottom:66px;width:auto;max-height:calc(100dvh - 82px);}.dodge-music-list{max-height:calc(100dvh - 232px);}.dodge-music-track{min-height:48px;font-size:14px;}}
@media (prefers-reduced-motion:reduce){.dodge-music-btn{transition:none;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaDodge(){
  const current = document.getElementById("dodgeMusicCurrent")
  const shuffleButton = document.getElementById("dodgeMusicShuffle")

  if(current){
    current.textContent = DODGE_MUSIC_TRACKS[dodgeMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = dodgeMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", dodgeMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(dodgeMusicState.shuffle))
  }

  document.querySelectorAll("[data-dodge-music-index]").forEach((button) => {
    const active = Number(button.dataset.dodgeMusicIndex) === dodgeMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosDodge(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionDodge(index, playNow, startTime = 0){
  const audio = obtenerAudioDodge()
  const track = DODGE_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosDodge(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  dodgeMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaDodge()
  guardarEstadoMusicaDodge()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionDodge(){
  if(DODGE_MUSIC_TRACKS.length <= 1) return 0

  if(dodgeMusicState.shuffle){
    let nextIndex = dodgeMusicState.currentIndex
    while(nextIndex === dodgeMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * DODGE_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (dodgeMusicState.currentIndex + 1) % DODGE_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionDodge(){
  cargarCancionDodge(obtenerSiguienteCancionDodge(), true)
}

function seleccionarCancionDodge(index){
  const audio = obtenerAudioDodge()
  if(audio && index === dodgeMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionDodge(index, true)
}

function reproducirMusicaDodge(){
  const audio = obtenerAudioDodge()
  if(!audio) return

  if(audio.paused){
    cargarCancionDodge(dodgeMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaDodge()
  }
}

function manejarClickMusicaDodge(event){
  const now = Date.now()
  const isDoubleTap = now - dodgeMusicState.lastClickAt < 320
  dodgeMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(dodgeMusicState.clickTimer)
    return
  }

  clearTimeout(dodgeMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaDodge(event)
    return
  }

  dodgeMusicState.clickTimer = setTimeout(reproducirMusicaDodge, 220)
}

function abrirMenuMusicaDodge(event){
  event?.preventDefault()
  clearTimeout(dodgeMusicState.clickTimer)

  const menu = document.getElementById("dodgeMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaDodge()
}

function cerrarMenuMusicaDodge(){
  const menu = document.getElementById("dodgeMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaDodge(){
  if(document.getElementById("dodgeMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "dodge-music-menu"
  menu.id = "dodgeMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="dodge-music-menu-head">
      <div class="dodge-music-title">
        <strong>Musica Esquiva Obstaculos</strong>
        <span id="dodgeMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="dodge-music-close" type="button" data-close-dodge-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="dodge-music-controls">
      <button class="dodge-music-shuffle" type="button" id="dodgeMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="dodge-music-list" id="dodgeMusicList" role="listbox" aria-label="Musicas de Esquiva Obstaculos"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaDodge(){
  const audio = obtenerAudioDodge()
  if(!audio) return

  asegurarEstilosMusicaDodge()
  crearMenuMusicaDodge()

  const saved = leerEstadoMusicaDodge()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && DODGE_MUSIC_TRACKS[savedIndex]){
    dodgeMusicState.currentIndex = savedIndex
  }
  dodgeMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "dodgeMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionDodge)
  audio.addEventListener("pause", guardarEstadoMusicaDodge)
  audio.addEventListener("play", guardarEstadoMusicaDodge)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaDodge()
  })

  const list = document.getElementById("dodgeMusicList")
  if(list){
    list.innerHTML = ""
    DODGE_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "dodge-music-track"
      button.dataset.dodgeMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionDodge(index))
      list.appendChild(button)
    })
  }

  document.getElementById("dodgeMusicShuffle")?.addEventListener("click", () => {
    dodgeMusicState.shuffle = !dodgeMusicState.shuffle
    actualizarMenuMusicaDodge()
    guardarEstadoMusicaDodge()
  })

  document.querySelector("[data-close-dodge-music]")?.addEventListener("click", cerrarMenuMusicaDodge)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("dodgeMusicMenu")
    const musicButton = document.querySelector(".dodge-music-btn, .musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaDodge()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaDodge()
  })

  cargarCancionDodge(dodgeMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !dodgeMusicState.restored){
    dodgeMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaDodge)
}

window.reproducirMusica = reproducirMusicaDodge
window.reproducirMusicaDodge = reproducirMusicaDodge
window.manejarClickMusicaDodge = manejarClickMusicaDodge
window.abrirMenuMusicaDodge = abrirMenuMusicaDodge

inicializarMusicaDodge()
