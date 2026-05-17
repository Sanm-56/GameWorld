const TOWER_MUSIC_TRACKS = [
  { title: "Upbet", src: "./music/Upbet.mp3" },
  { title: "Stee", src: "./music/Stee.mp3" },
  { title: "Hetr", src: "./music/Hetr.mp3" },
  { title: "Movn", src: "./music/Movn.mp3" },
  { title: "Remen", src: "./music/Remen.mp3" },
  { title: "Rocki", src: "./music/Rocki.mp3" },
  { title: "Ancent", src: "./music/Ancent.mp3" },
  { title: "Panole", src: "./music/Panole.mp3" },
  { title: "Inspec", src: "./music/Inspec.mp3" }
]

const TOWER_MUSIC_STORAGE = "torreinfinita_music_state"

const towerMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaTower(){
  try {
    return JSON.parse(sessionStorage.getItem(TOWER_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioTower(){
  return document.getElementById("towerMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaTower(){
  const audio = obtenerAudioTower()
  sessionStorage.setItem(TOWER_MUSIC_STORAGE, JSON.stringify({
    currentIndex: towerMusicState.currentIndex,
    shuffle: towerMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaTower(){
  if(document.getElementById("towerMusicStyles")) return

  const style = document.createElement("style")
  style.id = "towerMusicStyles"
  style.textContent = `
.tower-music-btn{position:fixed;left:14px;bottom:14px;z-index:1180;min-height:44px;max-width:calc(100vw - 28px);border:1px solid rgba(196,181,253,0.4);border-radius:14px;padding:10px 16px;color:#f8fafc;background:linear-gradient(135deg,#7c3aed,#10b981);box-shadow:0 16px 34px rgba(0,0,0,0.28),0 0 26px rgba(167,139,250,0.18);cursor:pointer;font:inherit;font-size:14px;font-weight:900;line-height:1;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;}
.tower-music-btn:hover{transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 18px 38px rgba(0,0,0,0.34),0 0 30px rgba(52,211,153,0.18);}
.tower-music-btn:active{transform:translateY(1px) scale(.99);}
.arcade-music-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin-top:18px;}
.arcade-music-actions .back,.arcade-music-actions #volverMenuBtn,.arcade-music-actions .tower-music-btn{width:auto;min-width:min(220px,100%);margin:0 !important;}
.arcade-music-actions .tower-music-btn,.side .tower-music-btn{position:static !important;max-width:100%;min-height:48px;}
.side .tower-music-btn{width:100%;margin:0;}
.tower-music-menu{position:fixed;left:14px;bottom:72px;z-index:1190;display:none;width:min(350px, calc(100vw - 28px));max-height:calc(100dvh - 92px);overflow:hidden;border:1px solid rgba(196,181,253,0.36);border-radius:16px;background:rgba(7,11,24,0.98);box-shadow:0 24px 70px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.07);text-align:left;}
.tower-music-menu.abierto{display:block;}
.tower-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(196,181,253,0.14);background:linear-gradient(135deg,rgba(167,139,250,0.16),rgba(52,211,153,0.08));}
.tower-music-title{min-width:0;}
.tower-music-title strong{display:block;color:#f8fafc;font-size:15px;line-height:1.2;}
.tower-music-title span{display:block;overflow:hidden;color:#ddd6fe;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.tower-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:#f8fafc;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.tower-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.tower-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(196,181,253,0.4);border-radius:10px;padding:9px 10px;color:#f8fafc;background:rgba(91,33,182,0.34);cursor:pointer;font:inherit;font-size:13px;font-weight:800;}
.tower-music-shuffle.activo{border-color:rgba(52,211,153,0.78);background:rgba(16,185,129,0.26);}
.tower-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 222px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(196,181,253,0.58) rgba(2,6,23,0.5);}
.tower-music-list::-webkit-scrollbar{width:8px;}
.tower-music-list::-webkit-scrollbar-track{background:rgba(2,6,23,0.5);border-radius:999px;}
.tower-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(196,181,253,0.58);}
.tower-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#f8fafc;background:rgba(15,23,42,0.72);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.tower-music-track.activo{border-color:rgba(52,211,153,0.74);background:rgba(91,33,182,0.22);}
.tower-music-track:hover{border-color:rgba(196,181,253,0.52);background:rgba(30,41,59,0.82);}
.tower-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tower-music-track small{flex:0 0 auto;color:#ddd6fe;font-size:11px;font-weight:900;}
.tower-music-btn:focus-visible,.tower-music-track:focus-visible,.tower-music-shuffle:focus-visible,.tower-music-close:focus-visible{outline:2px solid rgba(196,181,253,0.82);outline-offset:2px;}
@media (max-width:520px){.tower-music-btn{left:12px;bottom:12px;min-height:42px;padding:10px 14px;font-size:13px;}.tower-music-menu{left:12px;right:12px;bottom:66px;width:auto;max-height:calc(100dvh - 82px);}.tower-music-list{max-height:calc(100dvh - 232px);}.tower-music-track{min-height:48px;font-size:14px;}.arcade-music-actions{gap:8px;}.arcade-music-actions .back,.arcade-music-actions #volverMenuBtn,.arcade-music-actions .tower-music-btn{width:100%;}}
@media (prefers-reduced-motion:reduce){.tower-music-btn{transition:none;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaTower(){
  const current = document.getElementById("towerMusicCurrent")
  const shuffleButton = document.getElementById("towerMusicShuffle")

  if(current){
    current.textContent = TOWER_MUSIC_TRACKS[towerMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = towerMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", towerMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(towerMusicState.shuffle))
  }

  document.querySelectorAll("[data-tower-music-index]").forEach((button) => {
    const active = Number(button.dataset.towerMusicIndex) === towerMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function pausarOtrosAudiosTower(audioActual){
  document.querySelectorAll("audio").forEach((audio) => {
    if(audio !== audioActual) audio.pause()
  })
}

function cargarCancionTower(index, playNow, startTime = 0){
  const audio = obtenerAudioTower()
  const track = TOWER_MUSIC_TRACKS[index]
  if(!audio || !track) return

  pausarOtrosAudiosTower(audio)

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  towerMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaTower()
  guardarEstadoMusicaTower()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionTower(){
  if(TOWER_MUSIC_TRACKS.length <= 1) return 0

  if(towerMusicState.shuffle){
    let nextIndex = towerMusicState.currentIndex
    while(nextIndex === towerMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * TOWER_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (towerMusicState.currentIndex + 1) % TOWER_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionTower(){
  cargarCancionTower(obtenerSiguienteCancionTower(), true)
}

function seleccionarCancionTower(index){
  const audio = obtenerAudioTower()
  if(audio && index === towerMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionTower(index, true)
}

function reproducirMusicaTower(){
  const audio = obtenerAudioTower()
  if(!audio) return

  if(audio.paused){
    cargarCancionTower(towerMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaTower()
  }
}

function manejarClickMusicaTower(event){
  const now = Date.now()
  const isDoubleTap = now - towerMusicState.lastClickAt < 320
  towerMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(towerMusicState.clickTimer)
    return
  }

  clearTimeout(towerMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaTower(event)
    return
  }

  towerMusicState.clickTimer = setTimeout(reproducirMusicaTower, 220)
}

function abrirMenuMusicaTower(event){
  event?.preventDefault()
  clearTimeout(towerMusicState.clickTimer)

  const menu = document.getElementById("towerMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaTower()
}

function cerrarMenuMusicaTower(){
  const menu = document.getElementById("towerMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaTower(){
  if(document.getElementById("towerMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "tower-music-menu"
  menu.id = "towerMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="tower-music-menu-head">
      <div class="tower-music-title">
        <strong>Musica Torre Infinita</strong>
        <span id="towerMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="tower-music-close" type="button" data-close-tower-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="tower-music-controls">
      <button class="tower-music-shuffle" type="button" id="towerMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="tower-music-list" id="towerMusicList" role="listbox" aria-label="Musicas de Torre Infinita"></div>
  `
  document.body.appendChild(menu)
}

function ubicarBotonMusicaTower(){
  const button = document.querySelector(".tower-music-btn")
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

function observarUbicacionBotonMusicaTower(){
  ubicarBotonMusicaTower()

  const observer = new MutationObserver(() => ubicarBotonMusicaTower())
  observer.observe(document.body, { childList: true, subtree: true })
  setTimeout(() => {
    ubicarBotonMusicaTower()
    observer.disconnect()
  }, 1200)
}

function inicializarMusicaTower(){
  const audio = obtenerAudioTower()
  if(!audio) return

  asegurarEstilosMusicaTower()
  crearMenuMusicaTower()
  observarUbicacionBotonMusicaTower()

  const saved = leerEstadoMusicaTower()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && TOWER_MUSIC_TRACKS[savedIndex]){
    towerMusicState.currentIndex = savedIndex
  }
  towerMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "towerMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionTower)
  audio.addEventListener("pause", guardarEstadoMusicaTower)
  audio.addEventListener("play", guardarEstadoMusicaTower)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaTower()
  })

  const list = document.getElementById("towerMusicList")
  if(list){
    list.innerHTML = ""
    TOWER_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "tower-music-track"
      button.dataset.towerMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionTower(index))
      list.appendChild(button)
    })
  }

  document.getElementById("towerMusicShuffle")?.addEventListener("click", () => {
    towerMusicState.shuffle = !towerMusicState.shuffle
    actualizarMenuMusicaTower()
    guardarEstadoMusicaTower()
  })

  document.querySelector("[data-close-tower-music]")?.addEventListener("click", cerrarMenuMusicaTower)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("towerMusicMenu")
    const musicButton = document.querySelector(".tower-music-btn, .musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaTower()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaTower()
  })

  cargarCancionTower(towerMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !towerMusicState.restored){
    towerMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaTower)
}

window.reproducirMusica = reproducirMusicaTower
window.reproducirMusicaTower = reproducirMusicaTower
window.manejarClickMusicaTower = manejarClickMusicaTower
window.abrirMenuMusicaTower = abrirMenuMusicaTower

inicializarMusicaTower()
