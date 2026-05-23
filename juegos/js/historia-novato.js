const chapterListEl = document.getElementById('chapterList')
const pageLeftEl = document.getElementById('pageLeft')
const pageRightEl = document.getElementById('pageRight')
const prevPageEl = document.getElementById('prevPage')
const nextPageEl = document.getElementById('nextPage')
const pageIndicatorEl = document.getElementById('pageIndicator')

const mobileQuery = window.matchMedia('(max-width: 920px)')
const PROGRESS_KEY = 'historia_novato_progress'
const PENDING_KEY = 'historia_trial_pending'
const LAUNCH_KEY = 'solitario_game_launch'

const chapters = [
  {
    id: 'activacion',
    number: '01',
    title: 'La Activacion',
    trial: 'Sudoku',
    condition: 'Estabilizar el primer codigo numerico.',
    gameId: 'sudoku',
    gameUrl: 'juegos/sudoku/sudoku.html',
    lines: [
      'Una nueva conexion atraviesa el Nexus.',
      'La biblioteca despierta entre lineas de luz azul.',
      'Un fragmento sin nombre aparece frente al primer libro.',
      'El sistema observa. La prueba inicial comienza.',
    ],
  },
  {
    id: 'primer-codigo',
    number: '02',
    title: 'El Primer Codigo',
    trial: 'Matematicas',
    condition: 'Resolver la secuencia que abre la compuerta inicial.',
    gameId: 'matematicas',
    lines: [
      'El fragmento responde con un pulso inestable.',
      'Cifras antiguas aparecen sobre el borde de la pagina.',
      'El Nexus no pregunta quien eres.',
      'Solo mide si puedes seguir avanzando.',
    ],
  },
  {
    id: 'memorias-fragmentadas',
    number: '03',
    title: 'Memorias Fragmentadas',
    trial: 'Memoria',
    condition: 'Recomponer los primeros recuerdos del archivo.',
    gameId: 'memoria',
    lines: [
      'La biblioteca libera imagenes rotas.',
      'Cada una guarda una ruta, una perdida, una victoria ajena.',
      'Los ecos no hablan todavia.',
      'Pero recuerdan el camino.',
    ],
  },
  {
    id: 'camara-inicial',
    number: '04',
    title: 'La Camara Inicial',
    trial: 'FlashMind o NumCatch',
    condition: 'Sincronizar reflejos antes de que el pulso colapse.',
    gameId: 'flashmind',
    lines: [
      'La sala cambia de forma sin aviso.',
      'Luces veloces cruzan el suelo como advertencias.',
      'El libro no se cierra.',
      'Espera una respuesta mas rapida que el miedo.',
    ],
  },
  {
    id: 'conexion-establecida',
    number: '05',
    title: 'Conexion Establecida',
    trial: 'Prueba final del libro',
    condition: 'Completar el primer sello del rango Novato.',
    gameId: 'final-novato',
    lines: [
      'El fragmento deja de parpadear.',
      'La primera marca del jugador queda escrita en el archivo.',
      'El Nexus acepta la conexion.',
      'El siguiente libro permanece sellado, pero ya no parece tan lejano.',
    ],
  },
]

const introPages = [
  {
    type: 'cover',
    kicker: 'Libro Novato',
    title: 'El Despertar',
    lines: [
      'El primer tomo de la Biblioteca de Historias.',
      'Aqui el jugador deja de ser una senal desconocida y empieza a convertirse en competidor.',
    ],
    footer: 'Fase 3.1',
  },
  {
    type: 'index',
    kicker: 'Indice',
    title: 'Cinco sellos iniciales',
    lines: [
      'Cada capitulo representa una escena breve dentro del Nexus.',
      'Las pruebas jugables se conectaran en la Fase 4.1.',
    ],
    footer: 'Capitulos visuales',
  },
]

const pages = [
  ...introPages,
  ...chapters.map((chapter) => ({
    type: 'chapter',
    kicker: `Capitulo ${chapter.number}`,
    title: chapter.title,
    lines: chapter.lines,
    trial: chapter.trial,
    condition: chapter.condition,
    footer: 'Prueba preparada',
    chapterId: chapter.id,
  })),
  {
    type: 'seal',
    kicker: 'Sello del tomo',
    title: 'Primer fragmento',
    lines: [
      'Cuando las pruebas esten conectadas, este sello marcara el cierre del Libro Novato.',
      'Por ahora, la lectura define el ritmo, el tamano de texto y la sensacion del libro abierto.',
    ],
    footer: 'Pendiente Fase 4.1 y 5.1',
  },
]

let currentPage = 0
let progress = readProgress()

function limpiarPruebaPendienteDelLibro() {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null')
    if (pending?.bookId === 'novato') {
      localStorage.removeItem(PENDING_KEY)
    }
  } catch (error) {
    localStorage.removeItem(PENDING_KEY)
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isMobile() {
  return mobileQuery.matches
}

function readProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    return {
      completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
      lastCompletedAt: parsed.lastCompletedAt || '',
    }
  } catch (error) {
    return { completedChapters: [], lastCompletedAt: '' }
  }
}

function isCompleted(chapterId) {
  return progress.completedChapters.includes(chapterId)
}

function chapterIndex(chapterId) {
  return chapters.findIndex((chapter) => chapter.id === chapterId)
}

function isUnlocked(chapterId) {
  const index = chapterIndex(chapterId)
  if (index <= 0) return true
  return isCompleted(chapters[index - 1].id)
}

function pageCount() {
  return isMobile() ? pages.length : Math.ceil(pages.length / 2)
}

function leftPageIndex() {
  return isMobile() ? currentPage : currentPage * 2
}

function pageTemplate(page, index) {
  if (!page) return ''

  const body = page.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')
  const chapter = chapters.find((item) => item.id === page.chapterId)
  const unlocked = !chapter || isUnlocked(chapter.id)
  const completed = chapter ? isCompleted(chapter.id) : false
  const availableGame = chapter?.gameUrl && unlocked && !completed
  const action = chapter
    ? completed
      ? '<button class="trial-action completed" type="button" disabled>Sello estabilizado</button>'
      : availableGame
        ? `<button class="trial-action" type="button" data-start-trial="${escapeHtml(chapter.id)}">Iniciar prueba</button>`
        : `<button class="trial-action" type="button" disabled>${unlocked ? 'Prueba en Fase 4 futura' : 'Capitulo sellado'}</button>`
    : ''
  const trial = page.trial
    ? `
      <div class="trial-card">
        <span>Prueba futura</span>
        <strong>${escapeHtml(page.trial)}</strong>
        <small>${escapeHtml(page.condition)}</small>
        ${action}
      </div>
    `
    : ''

  return `
    <div>
      <span class="page-kicker">${escapeHtml(page.kicker)}</span>
      <h2>${escapeHtml(page.title)}</h2>
      ${body}
      ${trial}
    </div>
    <div class="page-mark">
      <span>${escapeHtml(page.footer)}</span>
      <span>${String(index + 1).padStart(2, '0')}</span>
    </div>
  `
}

function currentChapterId() {
  const page = pages[leftPageIndex()]
  if (page?.chapterId) return page.chapterId

  const visible = isMobile()
    ? [page]
    : [pages[leftPageIndex()], pages[leftPageIndex() + 1]]
  return visible.find((item) => item?.chapterId)?.chapterId || ''
}

function renderBook() {
  progress = readProgress()
  const leftIndex = leftPageIndex()
  const rightIndex = leftIndex + 1

  pageLeftEl.innerHTML = pageTemplate(pages[leftIndex], leftIndex)
  pageRightEl.innerHTML = isMobile() ? '' : pageTemplate(pages[rightIndex], rightIndex)

  const total = pageCount()
  pageIndicatorEl.textContent = `${currentPage + 1} / ${total}`
  prevPageEl.disabled = currentPage <= 0
  nextPageEl.disabled = currentPage >= total - 1

  const activeChapterId = currentChapterId()
  chapterListEl?.querySelectorAll('.chapter-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.chapterId === activeChapterId)
  })
}

function renderChapters() {
  if (!chapterListEl) return
  chapterListEl.innerHTML = chapters.map((chapter) => `
    <button class="chapter-tab ${isCompleted(chapter.id) ? 'completed' : ''} ${isUnlocked(chapter.id) ? 'unlocked' : 'locked'}" type="button" data-chapter-id="${escapeHtml(chapter.id)}">
      <span>${escapeHtml(chapter.number)}</span>
      <span>
        <strong>${escapeHtml(chapter.title)}</strong>
        <small>${escapeHtml(isCompleted(chapter.id) ? 'Completado' : isUnlocked(chapter.id) ? chapter.trial : 'Sellado')}</small>
      </span>
    </button>
  `).join('')
}

function goToPage(page) {
  const total = pageCount()
  currentPage = Math.max(0, Math.min(total - 1, page))
  renderBook()
}

function goToChapter(chapterId) {
  const index = pages.findIndex((page) => page.chapterId === chapterId)
  if (index < 0) return
  goToPage(isMobile() ? index : Math.floor(index / 2))
}

prevPageEl?.addEventListener('click', () => goToPage(currentPage - 1))
nextPageEl?.addEventListener('click', () => goToPage(currentPage + 1))

chapterListEl?.addEventListener('click', (event) => {
  const button = event.target.closest('.chapter-tab')
  if (!button) return
  goToChapter(button.dataset.chapterId)
})

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-start-trial]')
  if (!button) return
  const chapter = chapters.find((item) => item.id === button.dataset.startTrial)
  if (!chapter?.gameUrl || !isUnlocked(chapter.id) || isCompleted(chapter.id)) return

  localStorage.setItem(PENDING_KEY, JSON.stringify({
    bookId: 'novato',
    chapterId: chapter.id,
    gameId: chapter.gameId,
    returnUrl: 'historia-novato.html',
    startedAt: new Date().toISOString(),
  }))
  localStorage.setItem(LAUNCH_KEY, JSON.stringify({
    game: chapter.gameId,
    origin: 'historia',
    launchedAt: new Date().toISOString(),
  }))
  window.location.href = chapter.gameUrl
})

function handleViewportChange() {
  const visibleIndex = leftPageIndex()
  currentPage = mobileQuery.matches ? visibleIndex : Math.floor(visibleIndex / 2)
  renderBook()
}

if (typeof mobileQuery.addEventListener === 'function') {
  mobileQuery.addEventListener('change', handleViewportChange)
} else if (typeof mobileQuery.addListener === 'function') {
  mobileQuery.addListener(handleViewportChange)
}

limpiarPruebaPendienteDelLibro()
renderChapters()
renderBook()
