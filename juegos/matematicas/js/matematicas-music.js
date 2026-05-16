const MATEMATICAS_MUSIC_TRACKS = [
  { title: "Musica Matematicas", src: "./music/musicamatematicas.mp3" },
  { title: "Sillas En Silencio", src: "./music/Sillas En Silencio.mp3" },
  { title: "Sorc Jik", src: "./music/Sorc Jik.mp3" },
  { title: "Espejo Roto", src: "./music/Espejo Roto.mp3" },
  { title: "Sher Olkp", src: "./music/Sher Olkp.mp3" },
  { title: "Plus Jol", src: "./music/Plus Jol.mp3" },
  { title: "Comp Nev", src: "./music/Comp Nev.mp3" },
  { title: "Alko Mol", src: "./music/Alko Mol.mp3" }
]

const MATEMATICAS_MUSIC_STORAGE = "matematicas_music_state"

const matematicasMusicState = {
  currentIndex: 0,
  shuffle: false,
  clickTimer: null,
  lastClickAt: 0,
  restored: false
}

function leerEstadoMusicaMatematicas(){
  try {
    return JSON.parse(sessionStorage.getItem(MATEMATICAS_MUSIC_STORAGE) || "{}")
  } catch {
    return {}
  }
}

function obtenerAudioMatematicas(){
  return document.getElementById("matematicasMusicAudio") || document.querySelector("audio")
}

function guardarEstadoMusicaMatematicas(){
  const audio = obtenerAudioMatematicas()
  sessionStorage.setItem(MATEMATICAS_MUSIC_STORAGE, JSON.stringify({
    currentIndex: matematicasMusicState.currentIndex,
    shuffle: matematicasMusicState.shuffle,
    currentTime: audio?.currentTime || 0,
    playing: Boolean(audio && !audio.paused)
  }))
}

function asegurarEstilosMusicaMatematicas(){
  if(document.getElementById("matematicasMusicStyles")) return

  const style = document.createElement("style")
  style.id = "matematicasMusicStyles"
  style.textContent = `
.matematicas-music-menu{position:fixed;left:14px;bottom:78px;z-index:1200;display:none;width:min(340px, calc(100vw - 28px));max-height:calc(100dvh - 96px);overflow:hidden;border:1px solid rgba(34,197,94,0.34);border-radius:14px;background:rgba(15,23,42,0.97);box-shadow:0 24px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.06);text-align:left;}
.matematicas-music-menu.abierto{display:block;}
.matematicas-music-menu-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-bottom:1px solid rgba(255,255,255,0.1);}
.matematicas-music-title{min-width:0;}
.matematicas-music-title strong{display:block;color:white;font-size:15px;line-height:1.2;}
.matematicas-music-title span{display:block;overflow:hidden;color:#bbf7d0;font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;}
.matematicas-music-close{flex:0 0 auto;width:34px;min-width:34px;height:34px;min-height:34px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:white;background:rgba(255,255,255,0.1);cursor:pointer;font-size:18px;line-height:1;}
.matematicas-music-controls{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.08);}
.matematicas-music-shuffle{width:100%;min-height:42px;border:1px solid rgba(34,197,94,0.38);border-radius:10px;padding:9px 10px;color:white;background:rgba(21,128,61,0.34);cursor:pointer;font:inherit;font-size:13px;font-weight:700;}
.matematicas-music-shuffle.activo{border-color:rgba(187,247,208,0.82);background:rgba(34,197,94,0.26);}
.matematicas-music-list{display:grid;gap:8px;max-height:min(360px, calc(100dvh - 230px));overflow:auto;padding:12px 14px 14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(34,197,94,0.58) rgba(15,23,42,0.42);}
.matematicas-music-list::-webkit-scrollbar{width:8px;}
.matematicas-music-list::-webkit-scrollbar-track{background:rgba(15,23,42,0.42);border-radius:999px;}
.matematicas-music-list::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(34,197,94,0.58);}
.matematicas-music-track{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:46px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:white;background:rgba(30,41,59,0.74);cursor:pointer;font:inherit;font-size:13px;text-align:left;}
.matematicas-music-track.activo{border-color:rgba(187,247,208,0.78);background:rgba(34,197,94,0.18);}
.matematicas-music-track:hover{border-color:rgba(187,247,208,0.5);background:rgba(51,65,85,0.8);}
.matematicas-music-track span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.matematicas-music-track small{flex:0 0 auto;color:#bbf7d0;font-size:11px;font-weight:800;}
.matematicas-music-track:focus-visible,.matematicas-music-shuffle:focus-visible,.matematicas-music-close:focus-visible{outline:2px solid rgba(187,247,208,0.78);outline-offset:2px;}
@media (max-width:520px){.matematicas-music-menu{left:12px;right:12px;bottom:78px;width:auto;max-height:calc(100dvh - 92px);}.matematicas-music-list{max-height:calc(100dvh - 244px);}.matematicas-music-track{min-height:48px;font-size:14px;}}
`
  document.head.appendChild(style)
}

function actualizarMenuMusicaMatematicas(){
  const current = document.getElementById("matematicasMusicCurrent")
  const shuffleButton = document.getElementById("matematicasMusicShuffle")

  if(current){
    current.textContent = MATEMATICAS_MUSIC_TRACKS[matematicasMusicState.currentIndex]?.title || "Sin reproduccion"
  }

  if(shuffleButton){
    shuffleButton.textContent = matematicasMusicState.shuffle ? "Aleatorio: ON" : "Aleatorio: OFF"
    shuffleButton.classList.toggle("activo", matematicasMusicState.shuffle)
    shuffleButton.setAttribute("aria-pressed", String(matematicasMusicState.shuffle))
  }

  document.querySelectorAll("[data-matematicas-music-index]").forEach((button) => {
    const active = Number(button.dataset.matematicasMusicIndex) === matematicasMusicState.currentIndex
    button.classList.toggle("activo", active)
    button.setAttribute("aria-selected", String(active))
  })
}

function cargarCancionMatematicas(index, playNow, startTime = 0){
  const audio = obtenerAudioMatematicas()
  const track = MATEMATICAS_MUSIC_TRACKS[index]
  if(!audio || !track) return

  const nextSrc = new URL(track.src, window.location.href).href
  if(audio.src !== nextSrc){
    audio.pause()
    audio.src = track.src
    audio.load()
  }

  matematicasMusicState.currentIndex = index

  if(startTime > 0){
    audio.currentTime = startTime
  }

  actualizarMenuMusicaMatematicas()
  guardarEstadoMusicaMatematicas()

  if(playNow){
    audio.play().catch(() => {})
  }
}

function obtenerSiguienteCancionMatematicas(){
  if(MATEMATICAS_MUSIC_TRACKS.length <= 1) return 0

  if(matematicasMusicState.shuffle){
    let nextIndex = matematicasMusicState.currentIndex
    while(nextIndex === matematicasMusicState.currentIndex){
      nextIndex = Math.floor(Math.random() * MATEMATICAS_MUSIC_TRACKS.length)
    }
    return nextIndex
  }

  return (matematicasMusicState.currentIndex + 1) % MATEMATICAS_MUSIC_TRACKS.length
}

function reproducirSiguienteCancionMatematicas(){
  cargarCancionMatematicas(obtenerSiguienteCancionMatematicas(), true)
}

function seleccionarCancionMatematicas(index){
  const audio = obtenerAudioMatematicas()
  if(audio && index === matematicasMusicState.currentIndex){
    audio.currentTime = 0
  }
  cargarCancionMatematicas(index, true)
}

function reproducirMusica(){
  const audio = obtenerAudioMatematicas()
  if(!audio) return

  if(audio.paused){
    cargarCancionMatematicas(matematicasMusicState.currentIndex, true, audio.currentTime)
  } else {
    audio.pause()
    guardarEstadoMusicaMatematicas()
  }
}

function manejarClickMusicaMatematicas(event){
  const now = Date.now()
  const isDoubleTap = now - matematicasMusicState.lastClickAt < 320
  matematicasMusicState.lastClickAt = now

  if(event?.detail > 1){
    clearTimeout(matematicasMusicState.clickTimer)
    return
  }

  clearTimeout(matematicasMusicState.clickTimer)
  if(isDoubleTap){
    abrirMenuMusicaMatematicas(event)
    return
  }

  matematicasMusicState.clickTimer = setTimeout(reproducirMusica, 220)
}

function abrirMenuMusicaMatematicas(event){
  event?.preventDefault()
  clearTimeout(matematicasMusicState.clickTimer)

  const menu = document.getElementById("matematicasMusicMenu")
  if(!menu) return

  menu.classList.toggle("abierto")
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("abierto")))
  actualizarMenuMusicaMatematicas()
}

function cerrarMenuMusicaMatematicas(){
  const menu = document.getElementById("matematicasMusicMenu")
  if(!menu) return
  menu.classList.remove("abierto")
  menu.setAttribute("aria-hidden", "true")
}

function crearMenuMusicaMatematicas(){
  if(document.getElementById("matematicasMusicMenu")) return

  const menu = document.createElement("div")
  menu.className = "matematicas-music-menu"
  menu.id = "matematicasMusicMenu"
  menu.setAttribute("aria-hidden", "true")
  menu.innerHTML = `
    <div class="matematicas-music-menu-head">
      <div class="matematicas-music-title">
        <strong>Musica Matematicas</strong>
        <span id="matematicasMusicCurrent">Sin reproduccion</span>
      </div>
      <button class="matematicas-music-close" type="button" data-close-matematicas-music aria-label="Cerrar musica">&times;</button>
    </div>
    <div class="matematicas-music-controls">
      <button class="matematicas-music-shuffle" type="button" id="matematicasMusicShuffle">Aleatorio: OFF</button>
    </div>
    <div class="matematicas-music-list" id="matematicasMusicList" role="listbox" aria-label="Musicas de Matematicas"></div>
  `
  document.body.appendChild(menu)
}

function inicializarMusicaMatematicas(){
  const audio = obtenerAudioMatematicas()
  if(!audio) return

  asegurarEstilosMusicaMatematicas()
  crearMenuMusicaMatematicas()

  const saved = leerEstadoMusicaMatematicas()
  const savedIndex = Number(saved.currentIndex)
  if(Number.isInteger(savedIndex) && MATEMATICAS_MUSIC_TRACKS[savedIndex]){
    matematicasMusicState.currentIndex = savedIndex
  }
  matematicasMusicState.shuffle = Boolean(saved.shuffle)

  audio.id = "matematicasMusicAudio"
  audio.loop = false
  audio.addEventListener("ended", reproducirSiguienteCancionMatematicas)
  audio.addEventListener("pause", guardarEstadoMusicaMatematicas)
  audio.addEventListener("play", guardarEstadoMusicaMatematicas)
  audio.addEventListener("timeupdate", () => {
    if(!audio.paused) guardarEstadoMusicaMatematicas()
  })

  const list = document.getElementById("matematicasMusicList")
  if(list){
    list.innerHTML = ""
    MATEMATICAS_MUSIC_TRACKS.forEach((track, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "matematicas-music-track"
      button.dataset.matematicasMusicIndex = String(index)
      button.setAttribute("role", "option")
      button.innerHTML = `<span>${track.title}</span><small>${index + 1}</small>`
      button.addEventListener("click", () => seleccionarCancionMatematicas(index))
      list.appendChild(button)
    })
  }

  document.getElementById("matematicasMusicShuffle")?.addEventListener("click", () => {
    matematicasMusicState.shuffle = !matematicasMusicState.shuffle
    actualizarMenuMusicaMatematicas()
    guardarEstadoMusicaMatematicas()
  })

  document.querySelector("[data-close-matematicas-music]")?.addEventListener("click", cerrarMenuMusicaMatematicas)

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("matematicasMusicMenu")
    const musicButton = document.querySelector(".musica-btn, .btn.musica")
    if(!menu?.classList.contains("abierto")) return
    if(menu.contains(event.target) || musicButton?.contains(event.target)) return
    cerrarMenuMusicaMatematicas()
  })

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") cerrarMenuMusicaMatematicas()
  })

  cargarCancionMatematicas(matematicasMusicState.currentIndex, false, Number(saved.currentTime) || 0)
  if(saved.playing && !matematicasMusicState.restored){
    matematicasMusicState.restored = true
    audio.play().catch(() => {})
  }

  window.addEventListener("beforeunload", guardarEstadoMusicaMatematicas)
}

window.reproducirMusica = reproducirMusica
window.manejarClickMusicaMatematicas = manejarClickMusicaMatematicas
window.abrirMenuMusicaMatematicas = abrirMenuMusicaMatematicas

inicializarMusicaMatematicas()
