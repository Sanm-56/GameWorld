import {
  obtenerProgresoNivel,
  obtenerRangosDesdeNivel,
} from './progreso-nivel.js'
import { crearIdLibroDesdeTitulo } from './historia-core.js'
import { LIBROS_HISTORIA, obtenerLibroHistoria } from './historia-libros.js'

const shelfEl = document.getElementById('bookShelf')
const countEl = document.getElementById('bookCount')
const activeBookNameEl = document.getElementById('activeBookName')
const detailEl = document.getElementById('bookDetail')
const featuredEl = document.getElementById('featuredBook')
const hintEl = document.getElementById('libraryHint')

const usuario = localStorage.getItem('usuario')

const RANK_VISUALS = {
  novato: { emblem: 'NV', primary: '#38bdf8', secondary: '#22c55e', accent: '#a78bfa', rgb: '56,189,248' },
  amateur: { emblem: 'AM', primary: '#60a5fa', secondary: '#14b8a6', accent: '#facc15', rgb: '96,165,250' },
  aspirante: { emblem: 'AS', primary: '#34d399', secondary: '#38bdf8', accent: '#f472b6', rgb: '52,211,153' },
  profesional: { emblem: 'PR', primary: '#f59e0b', secondary: '#ef4444', accent: '#fde68a', rgb: '245,158,11' },
  competidor: { emblem: 'CO', primary: '#fb7185', secondary: '#f97316', accent: '#fef3c7', rgb: '251,113,133' },
  experto: { emblem: 'EX', primary: '#22d3ee', secondary: '#2563eb', accent: '#e0f2fe', rgb: '34,211,238' },
  elite: { emblem: 'EL', primary: '#a78bfa', secondary: '#6366f1', accent: '#f0abfc', rgb: '167,139,250' },
  maestro: { emblem: 'MA', primary: '#facc15', secondary: '#f97316', accent: '#fff7ed', rgb: '250,204,21' },
  'gran maestro': { emblem: 'GM', primary: '#fbbf24', secondary: '#dc2626', accent: '#fef3c7', rgb: '251,191,36' },
  leyenda: { emblem: 'LY', primary: '#fde047', secondary: '#f59e0b', accent: '#fff7ed', rgb: '253,224,71' },
  mitico: { emblem: 'MT', primary: '#c084fc', secondary: '#7c3aed', accent: '#f0abfc', rgb: '192,132,252' },
  supremo: { emblem: 'SP', primary: '#f8fafc', secondary: '#94a3b8', accent: '#38bdf8', rgb: '248,250,252' },
  titan: { emblem: 'TT', primary: '#fb7185', secondary: '#991b1b', accent: '#fecdd3', rgb: '251,113,133' },
  inmortal: { emblem: 'IM', primary: '#5eead4', secondary: '#0f766e', accent: '#ccfbf1', rgb: '94,234,212' },
  'leyenda maxima': { emblem: 'LM', primary: '#fef08a', secondary: '#ca8a04', accent: '#ffffff', rgb: '254,240,138' },
}

const THEMES = [
  { match: ['vacio', 'umbra', 'negro'], emblem: 'VX', primary: '#818cf8', secondary: '#111827', accent: '#c084fc', rgb: '129,140,248' },
  { match: ['astral', 'estrella', 'constelacion'], emblem: 'AS', primary: '#38bdf8', secondary: '#4338ca', accent: '#f0abfc', rgb: '56,189,248' },
  { match: ['carmesi', 'sangre', 'juicio'], emblem: 'CR', primary: '#fb7185', secondary: '#7f1d1d', accent: '#fecaca', rgb: '251,113,133' },
  { match: ['eco', 'ether', 'horizonte'], emblem: 'ET', primary: '#2dd4bf', secondary: '#0f766e', accent: '#a7f3d0', rgb: '45,212,191' },
  { match: ['eclipse', 'sombra', 'ruina'], emblem: 'EC', primary: '#a78bfa', secondary: '#312e81', accent: '#fbbf24', rgb: '167,139,250' },
  { match: ['infinito', 'eterno', 'eternidad'], emblem: 'IN', primary: '#f8fafc', secondary: '#64748b', accent: '#38bdf8', rgb: '248,250,252' },
  { match: ['trono', 'corona', 'reino'], emblem: 'TR', primary: '#facc15', secondary: '#92400e', accent: '#fff7ed', rgb: '250,204,21' },
  { match: ['abismo', 'fin', 'ultimo'], emblem: 'AB', primary: '#c084fc', secondary: '#1e1b4b', accent: '#60a5fa', rgb: '192,132,252' },
]

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function initials(title) {
  const parts = normalize(title).split(/\s+/).filter(Boolean)
  return parts.length ? parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase() : 'RX'
}

function hashText(value) {
  return [...String(value || '')].reduce((total, char) => ((total << 5) - total + char.charCodeAt(0)) | 0, 0)
}

function visualForRank(title, book = null) {
  if (book?.visual?.primary) {
    return {
      ...book.visual,
      emblem: book.visual.emblem || initials(title),
    }
  }

  const key = normalize(title)
  const base = RANK_VISUALS[key]
  if (base) return base

  const theme = THEMES.find((item) => item.match.some((fragment) => key.includes(fragment)))
    || THEMES[Math.abs(hashText(key)) % THEMES.length]

  return {
    ...theme,
    emblem: theme.emblem || initials(title),
  }
}

function styleVars(visual) {
  return [
    ['--rank-primary', visual.primary],
    ['--rank-secondary', visual.secondary],
    ['--rank-accent', visual.accent],
    ['--rank-rgb', visual.rgb],
  ].map(([name, value]) => `${name}:${value}`).join(';')
}

function setBookTheme(visual) {
  document.documentElement.style.setProperty('--book-primary', visual.primary)
  document.documentElement.style.setProperty('--book-secondary', visual.secondary)
  document.documentElement.style.setProperty('--book-accent', visual.accent)
  document.documentElement.style.setProperty('--book-rgb', visual.rgb)
}

function bookStatus(rank, level) {
  if (level >= rank.desde && level <= rank.hasta) return 'current'
  if (level >= rank.desde) return 'unlocked'
  return 'locked'
}

function statusText(status, registered = false) {
  if (status === 'current') return 'Actual'
  if (status === 'unlocked') return registered ? 'Listo' : 'Pendiente'
  return 'Sellado'
}

function renderFeatured(rank, visual, book = null) {
  if (!featuredEl) return
  const bookId = book?.id || crearIdLibroDesdeTitulo(rank.titulo)
  featuredEl.innerHTML = `
    <span class="featured-halo"></span>
    <div class="book-cover" data-book-id="${escapeHtml(bookId)}">
      <span class="book-spine"></span>
      <span class="book-emblem">${escapeHtml(visual.emblem)}</span>
      <span class="book-title">${escapeHtml(rank.titulo)}</span>
      <span class="book-sigil" aria-hidden="true"></span>
    </div>
    <div class="featured-info">
      <span>Relato seleccionado</span>
      <strong>${escapeHtml(book?.title || rank.titulo)}</strong>
    </div>
  `
}

function renderDetail(rank, status, visual, book = null) {
  if (!detailEl) return
  const range = rank.desde === rank.hasta ? `Nivel ${rank.desde}` : `Niveles ${rank.desde}-${rank.hasta}`
  const registered = Boolean(book)
  const phaseText = status === 'locked'
    ? registered
      ? 'Este relato aun esta sellado por rango, pero esta disponible para revisar su produccion.'
      : 'Este relato queda sellado hasta alcanzar su rango.'
    : registered
      ? 'Este relato ya esta registrado en el motor de Modo Historia.'
      : 'Este relato ya existe como resumen visual, pero su historia aun no esta producida.'
  const bookUrl = book?.readerUrl || `historia-libro.html?libro=${encodeURIComponent(crearIdLibroDesdeTitulo(rank.titulo))}`
  const action = registered
    ? `<button class="detail-open" type="button" data-open-book="${escapeHtml(bookUrl)}">${status === 'locked' ? 'Revisar' : 'Abrir'} ${escapeHtml(book.rankTitle || rank.titulo)}</button>`
    : `<button type="button" disabled>${status === 'locked' ? 'Relato sellado' : 'Relato pendiente'}</button>`

  detailEl.style.setProperty('--book-rgb', visual.rgb)
  detailEl.innerHTML = `
    <span class="detail-kicker">${status === 'current' ? 'Relato activo' : status === 'unlocked' ? 'Relato desbloqueado' : 'Relato sellado'}</span>
    <h2>${escapeHtml(book?.title ? `Relato ${rank.titulo}: ${book.title}` : `Relato ${rank.titulo}`)}</h2>
    <p>${escapeHtml(phaseText)} ${escapeHtml(book?.subtitle || 'Cuando se produzca, tendra historia, capitulos, pruebas y progreso propio.')}</p>
    <div class="detail-progress">
      <span>${escapeHtml(range)}</span>
      <strong>${escapeHtml(registered ? 'Registrado' : statusText(status, registered))}</strong>
    </div>
    ${action}
    <button class="detail-secondary" type="button" data-open-archive>Leer historias completas</button>
  `
}

function selectBook(rank, status) {
  const book = obtenerLibroHistoria(crearIdLibroDesdeTitulo(rank.titulo))
  const visual = visualForRank(rank.titulo, book)
  setBookTheme(visual)
  renderFeatured(rank, visual, book)
  renderDetail(rank, status, visual, book)
  if (activeBookNameEl) activeBookNameEl.textContent = rank.titulo

  shelfEl?.querySelectorAll('.rank-book').forEach((button) => {
    button.classList.toggle('selected', button.dataset.rankTitle === rank.titulo)
  })
}

async function initLibrary() {
  if (!shelfEl) return

  const ranks = obtenerRangosDesdeNivel(1)
  const progress = await obtenerProgresoNivel(usuario)
  const level = Math.max(1, Math.trunc(Number(progress?.nivel) || 1))
  const currentRank = ranks.find((rank) => level >= rank.desde && level <= rank.hasta) || ranks[0]

  if (countEl) countEl.textContent = String(ranks.length)
  if (hintEl) {
    const registeredCount = Object.keys(LIBROS_HISTORIA).length
    hintEl.textContent = usuario
      ? `Nivel actual: ${level}. Relatos registrados: ${registeredCount} de ${ranks.length}.`
      : `Sin usuario activo: se muestra la biblioteca desde Novato. Relatos registrados: ${registeredCount} de ${ranks.length}.`
  }

  shelfEl.innerHTML = ranks.map((rank) => {
    const book = obtenerLibroHistoria(crearIdLibroDesdeTitulo(rank.titulo))
    const visual = visualForRank(rank.titulo, book)
    const status = bookStatus(rank, level)
    return `
      <button class="rank-book ${status} ${book ? 'registered' : 'pending'}" type="button" data-rank-title="${escapeHtml(rank.titulo)}" data-status="${status}" data-book-id="${escapeHtml(crearIdLibroDesdeTitulo(rank.titulo))}" style="${styleVars(visual)}">
        <span class="rank-book-cover" data-emblem="${escapeHtml(visual.emblem)}"></span>
        <span class="rank-book-name">${escapeHtml(rank.titulo)}</span>
        <span class="rank-book-state">${escapeHtml(book ? 'Registrado' : statusText(status, false))}</span>
      </button>
    `
  }).join('')

  selectBook(currentRank, bookStatus(currentRank, level))

  shelfEl.addEventListener('click', (event) => {
    const button = event.target.closest('.rank-book')
    if (!button) return
    const rank = ranks.find((item) => item.titulo === button.dataset.rankTitle)
    if (!rank) return
    selectBook(rank, button.dataset.status || 'locked')
  })
}

detailEl?.addEventListener('click', (event) => {
  const archiveButton = event.target.closest('[data-open-archive]')
  if (archiveButton) {
    window.location.href = 'archivo-historias.html'
    return
  }

  const button = event.target.closest('[data-open-book]')
  if (!button) return
  window.location.href = button.dataset.openBook
})

initLibrary().catch((error) => {
  console.warn('No se pudo cargar la biblioteca de historias', error)
})
