const CLIMB_MUSIC_TRACKS = [
  { title: "Grolh Mix", src: "./music/Grolh Mix.mp3" },
  { title: "Dram Pace", src: "./music/Dram Pace.mp3" },
  { title: "Blues Solk", src: "./music/Blues Solk.mp3" },
  { title: "Destiny", src: "./music/Destiny.mp3" },
  { title: "Positiv", src: "./music/Positiv.mp3" },
  { title: "Moderns", src: "./music/Moderns.mp3" },
  { title: "Inspiration", src: "./music/Inspiration.mp3" },
  { title: "Summer", src: "./music/Summer.mp3" },
  { title: "Legen Snak", src: "./music/Legen Snak.mp3" },
  { title: "Classis", src: "./music/Classis.mp3" }
]
const CLIMB_MUSIC_STORAGE = "subelamontana_music_state"

const climbMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaClimb(){
  try {
    return JSON.parse(sessionStorage.getItem(CLIMB_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioClimb(){
  return document.getElementById("climbMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaClimb(){
  const audio = obtenerAudioClimb()
  sessionStorage.setItem(CLIMB_MUSIC_STORAGE, JSON.stringify({
    currentIndex: climbMusicState.currentIndex,
    shuffle: climbMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaClimb(){
  if(document.getElementById("climbMusicStyles")) return

  const style = document.createElement("style")
  style.id = "climbMusicStyles"
  style.textContent = `
.climb-music-btn{position:fixed;left:14px;bottom:14px;z-index:1180;min-height:44px;max-width:calc(100vw - 28px);border:1px solid rgba(254,215,170,0.4);border-radius:14px;padding:10px 16px;color:#f8fafc;background:linear-gradient(135deg,#f59e0b,#38bdf8);box-shadow:0 16px 34px rgba(0,0,0,0.28),0 0 26px rgba(167,139,250,0.18);cursor:pointer;font:inherit;font-size:14px;font-weight:900;line-height:1;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;}
.climb-music-btn:hover{transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 18px 38px rgba(0,0,0,0.34),0 0 30px rgba(125,211,252,0.18);}
.climb-music-btn:active{transform:translateY(1px) scale(.99);}
.arcade-music-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin-top:18px;}
.arcade-music-actions .back,.arcade-music-actions #volverMenuBtn,.arcade-music-actions .climb-music-btn{width:auto;min-width:min(220px,100%);margin:0 !important;}
.arcade-music-actions .climb-music-btn,.side .climb-music-btn{position:static !important;max-width:100%;min-height:48px;}
.side .climb-music-btn{width:100%;margin:0;}
.climb-music-menu{position:fixed;left:14px;bottom:72px;z-index:1190;display:none;width:min(350px, calc(100vw - 28px));max-height:calc(100dvh - 92px);overflow:hidden;border:1px solid rgba(254,215,170,0.36);border-radius:16px;background:rgba(9,33,59,0.98);box-shadow:0 24px 70px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.07);text-align:left;}
.climb-music-menu.abierto{display:block;}
.climb-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(254,215,170,0.14);background:linear-gradient(135deg,rgba(167,139,250,0.16),rgba(125,211,252,0.08));}
.climb-music-title{min-width:0;}
.climb-music-title strong{display:block;color:#f8fafc;font-size:15px;line-height:1.2;}
.climb-music-title span{display:block;overflow:hidden;color:#fed7aa;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.climb-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:#f8fafc;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.climb-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.climb-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(254,215,170,0.4);border-radius:10px;padding:9px 10px;color:#f8fafc;background:rgba(180,83,9,0.34);cursor:pointer;font:inherit;font-size:13px;font-weight:800;}
.climb-music-shuffle.activo{border-color:rgba(125,211,252,0.78);background:rgba(16,185,129,0.26);}
.climb-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 222px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(254,215,170,0.58) rgba(2,6,23,0.5);}
.climb-music-list::-webkit-scrollbar{width:8px;}
.climb-music-list::-webkit-scrollbar-track{background:rgba(2,6,23,0.5);border-radius:999px;}
.climb-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(254,215,170,0.58);}
.climb-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#f8fafc;background:rgba(15,23,42,0.72);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.climb-music-track.activo{border-color:rgba(125,211,252,0.74);background:rgba(180,83,9,0.22);}
.climb-music-track:hover{border-color:rgba(254,215,170,0.52);background:rgba(30,41,59,0.82);}
.climb-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.climb-music-track small{flex:0 0 auto;color:#fed7aa;font-size:11px;font-weight:900;}
.climb-music-btn:focus-visible,.climb-music-track:focus-visible,.climb-music-shuffle:focus-visible,.climb-music-close:focus-visible{outline:2px solid rgba(254,215,170,0.82);outline-offset:2px;}
@media (max-width:520px){.climb-music-btn{left:12px;bottom:12px;min-height:42px;padding:10px 14px;font-size:13px;}.climb-music-menu{left:12px;right:12px;bottom:66px;width:auto;max-height:calc(100dvh - 82px);}.climb-music-list{max-height:calc(100dvh - 232px);}.climb-music-track{min-height:48px;font-size:14px;}.arcade-music-actions{gap:8px;}.arcade-music-actions .back,.arcade-music-actions #volverMenuBtn,.arcade-music-actions .climb-music-btn{width:100%;}}
@media (prefers-reduced-motion:reduce){.climb-music-btn{transition:none;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaClimb(){
  const current = document.getElementById("climbMusicCurrent")
  const shuffleButton = document.getElementById("climbMusicShuffle")

  if(current){
    current.textContent = CLIMB_MUSIC_TRACKS[climbMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = climbMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", climbMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(climbMusicState.shuffle))
  }

  document.querySelectorAll("[data-climb-music-index]").forEach((button) => {
    const active = Number(button.dataset.climbMusicIndex) === climbMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosClimb(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionClimb(index, playNow, startTime = 0){
  const audio = obtenerAudioClimb()
  const track = CLIMB_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosClimb(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  climbMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaClimb()
  guardarEstadoMusicaClimb()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionClimb(){
  if(CLIMB_MUSIC_TRACKS.length <= 1) return 0

  if(climbMusicState.shuffle){
    let nextIndex = climbMusicState.currentIndex
    while(nextIndex === climbMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * CLIMB_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (climbMusicState.currentIndex + 1) % CLIMB_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionClimb(){
  cargarCancionClimb(obtenerSiguienteCancionClimb(), true)
}

function seleccionarCancionClimb(index){
  const audio = obtenerAudioClimb()
  if(audio && index === climbMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionClimb(index, true)
}

function reproducirMusicaClimb(){
  const audio = obtenerAudioClimb()
  if(!audio) return

  if(audio.paused){
    cargarCancionClimb(climbMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaClimb()
  }
}

function manejarClickMusicaClimb(event){
  const now = Date.now()
  const isDoubleTap = now - climbMusicState.lastClickAt < 320
  climbMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(climbMusicState.clickTimer)
    return
  }

  clearTimeout(climbMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaClimb(event)
    return
  }

  climbMusicState.clickTimer = setTimeout(reproducirMusicaClimb, 220)
}

function abrirMenuMusicaClimb(event){
  event?.preventDefault()
  clearTimeout(climbMusicState.clickTimer)

  const menu = document.getElementById("climbMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaClimb()
}

function cerrarMenuMusicaClimb(){
  const menu = document.getElementById("climbMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaClimb(){
  if(document.getElementById("climbMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "climb-music-menu"
  menu.id = "climbMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="climb-music-menu-head">
      <div class="climb-music-title">
        <strong>Musica Sube la Montana</strong>
        <span id="climbMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="climb-music-close" type="button" data-close-climb-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="climb-music-controls">
      <button class="climb-music-shuffle" type="button" id="climbMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="climb-music-list" id="climbMusicList" role="listbox" aria-label="Musicas de Sube la Montana"></div>
  `
  document.body.appendChild(menu)
}

function ubicarBotonMusicaClimb(){
  const button = document.querySelector(".climb-music-btn")
  if(!button) return

  const backButton = document.getElementById("volverMenuBtn") || document.getElementById("backBtn")
  if(backButton?.parentElement){
    let wrapper = backButton.parentElement.classList.contains("arcade-music-actions")
      ? backButton.parentElement
      : null

    if(!wrapper){
      wrapper = document.createElement("div")
      wrapper.className = "arcade-music-actions"
      backButton.parentElement.insertBefore(wrapper, backButton)
      wrapper.appendChild(backButton)
    }

    if(button.parentElement !== wrapper){
      wrapper.appendChild(button)
    }
    return
  }

  const side = document.querySelector(".side")
  const status = document.getElementById("status")
  if(side && button.parentElement !== side){
    side.insertBefore(button, status || null)
  }
}

function observarUbicacionBotonMusicaClimb(){
  ubicarBotonMusicaClimb()

  const observer = new MutationObserver(() => ubicarBotonMusicaClimb())
  observer.observe(document.body, { childList: true, subtree: true })
  setTimeout(() => {
    ubicarBotonMusicaClimb()
    observer.disconnect()
  }, 1200)
}

function inicializarMusicaClimb(){
  const audio = obtenerAudioClimb()
  if(!audio) return

  asegurarEstilosMusicaClimb()
  crearMenuMusicaClimb()
  observarUbicacionBotonMusicaClimb()

  const saved = leerEstadoMusicaClimb()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && CLIMB_MUSIC_TRACKS[savedIndex]){
    climbMusicState.currentIndex = savedIndex
  }
  climbMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "climbMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionClimb)
  audio.addEventListener("pause", guardarEstadoMusicaClimb)
  audio.addEventListener("play", guardarEstadoMusicaClimb)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaClimb()
  })

  const list = document.getElementById("climbMusicList")
  if(list){
    list.innerHTML = ""
    CLIMB_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "climb-music-track"
      button.dataset.climbMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionClimb(index))
      list.appendChild(button)
    })
  }

  document.getElementById("climbMusicShuffle")?.addEventListener("click", () => {
    climbMusicState.shuffle = !climbMusicState.shuffle
    actualizarMenuMusicaClimb()
    guardarEstadoMusicaClimb()
  })

  document.querySelector("[data-close-climb-music]")?.addEventListener("click", cerrarMenuMusicaClimb)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("climbMusicMenu")
    const musicButton = document.querySelector(".climb-music-btn, .musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaClimb()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaClimb()
  })

  cargarCancionClimb(climbMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !climbMusicState.restored){
    climbMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaClimb)
}

window.reproducirMusica = reproducirMusicaClimb
window.reproducirMusicaClimb = reproducirMusicaClimb
window.manejarClickMusicaClimb = manejarClickMusicaClimb
window.abrirMenuMusicaClimb = abrirMenuMusicaClimb

inicializarMusicaClimb()

