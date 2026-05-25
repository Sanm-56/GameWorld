import {
  capituloCompletado,
  capituloDesbloqueado,
  escaparHtml,
  leerProgresoLibro,
  limpiarPruebaPendienteDelLibro,
  normalizarIdHistoria,
  paginasDelLibro,
  prepararLanzamientoPrueba,
} from './historia-core.js'
import { obtenerLibroHistoria } from './historia-libros.js'

const chapterListEl = document.getElementById('chapterList')
const pageLeftEl = document.getElementById('pageLeft')
const pageRightEl = document.getElementById('pageRight')
const prevPageEl = document.getElementById('prevPage')
const nextPageEl = document.getElementById('nextPage')
const pageIndicatorEl = document.getElementById('pageIndicator')
const readerTitleEl = document.getElementById('readerTitle')
const readerSummaryEl = document.getElementById('readerSummary')
const readerBookLabelEl = document.getElementById('readerBookLabel')
const readerPhaseEl = document.getElementById('readerPhase')

const mobileQuery = window.matchMedia('(max-width: 920px)')
const params = new URLSearchParams(window.location.search)
const bookId = normalizarIdHistoria(params.get('libro') || params.get('rango') || document.body.dataset.bookId || '')
const book = obtenerLibroHistoria(bookId)
if (book?.id) {
  document.body.dataset.bookId = book.id
}

let currentPage = 0
let progress = book ? leerProgresoLibro(book.id) : null
let pages = book ? paginasDelLibro(book) : []

function isMobile() {
  return mobileQuery.matches
}

function pageCount() {
  return isMobile() ? pages.length : Math.ceil(pages.length / 2)
}

function leftPageIndex() {
  return isMobile() ? currentPage : currentPage * 2
}

function chapterForPage(page) {
  if (!book || !page?.chapterId) return null
  const chapters = Array.isArray(book.chapters) ? book.chapters : []
  return chapters.find((chapter) => chapter.id === page.chapterId) || null
}

function isCompleted(chapterId) {
  return capituloCompletado(progress, chapterId)
}

function isUnlocked(chapterId) {
  return capituloDesbloqueado(book, progress, chapterId)
}

function pageTemplate(page, index) {
  if (!page) return ''

  const chapter = chapterForPage(page)
  const unlocked = !chapter || isUnlocked(chapter.id)
  const completed = chapter ? isCompleted(chapter.id) : false
  const sealedAfterTrial = Boolean(page.afterTrial && chapter && !completed)
  const sealedBookEnd = Boolean(page.lockedUntilBookComplete && !progress.bookCompleted)
  const useSealedLines = (sealedAfterTrial || sealedBookEnd) && Array.isArray(page.sealedLines)
  const visibleLines = useSealedLines ? page.sealedLines : page.lines
  const body = visibleLines.map((line) => `<p>${escaparHtml(line)}</p>`).join('')
  const availableGame = chapter?.gameUrl && unlocked && !completed
  const action = chapter
    ? completed
      ? '<button class="trial-action completed" type="button" disabled>Sello estabilizado</button>'
      : availableGame
        ? `<button class="trial-action" type="button" data-start-trial="${escaparHtml(chapter.id)}">Iniciar prueba</button>`
        : `<button class="trial-action" type="button" disabled>${unlocked ? 'Prueba pendiente' : 'Capitulo sellado'}</button>`
    : ''
  const trial = page.trial
    ? `
      <div class="trial-card">
        <span>Prueba del Nexus</span>
        <strong>${escaparHtml(page.trial)}</strong>
        <small>${escaparHtml(page.condition)}</small>
        ${action}
      </div>
    `
    : ''
  const pageKind = page.trial
    ? 'trial'
    : page.afterTrial
      ? 'consequence'
      : page.lockedUntilBookComplete || page.type === 'seal'
        ? 'seal'
        : page.type || 'story'

  return `
    <div class="page-content page-content-${escaparHtml(pageKind)}">
      <span class="page-kicker">${escaparHtml(page.kicker)}</span>
      <h2>${escaparHtml(page.title)}</h2>
      ${body}
      ${sealedAfterTrial ? '<div class="sealed-note">Pagina sellada hasta completar la prueba.</div>' : ''}
      ${sealedBookEnd ? '<div class="sealed-note">Cierre sellado hasta completar el relato.</div>' : ''}
      ${trial}
    </div>
    <div class="page-mark">
      <span>${escaparHtml(page.footer || '')}</span>
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
  if (!book) return
  progress = leerProgresoLibro(book.id)
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
  if (!book || !chapterListEl) return
  const chapters = Array.isArray(book.chapters) ? book.chapters : []
  chapterListEl.innerHTML = chapters.map((chapter) => `
    <button class="chapter-tab ${isCompleted(chapter.id) ? 'completed' : ''} ${isUnlocked(chapter.id) ? 'unlocked' : 'locked'}" type="button" data-chapter-id="${escaparHtml(chapter.id)}">
      <span>${escaparHtml(chapter.number)}</span>
      <span>
        <strong>${escaparHtml(chapter.title)}</strong>
        <small>${escaparHtml(isCompleted(chapter.id) ? 'Completado' : isUnlocked(chapter.id) ? `${chapter.pages.length} paginas` : 'Sellado')}</small>
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

function renderMissingBook() {
  document.title = 'Relato no configurado'
  if (readerBookLabelEl) readerBookLabelEl.textContent = 'Biblioteca'
  if (readerTitleEl) readerTitleEl.textContent = 'Relato no configurado'
  if (readerSummaryEl) readerSummaryEl.textContent = 'Este relato todavia no tiene historia registrada en la base de Modo Historia.'
  if (readerPhaseEl) readerPhaseEl.textContent = '9.0'
  if (chapterListEl) chapterListEl.innerHTML = '<button class="chapter-tab locked" type="button" disabled><span>--</span><span><strong>Pendiente</strong><small>Sin capitulos</small></span></button>'
  if (pageLeftEl) {
    pageLeftEl.innerHTML = `
      <div>
        <span class="page-kicker">Fase 9.0</span>
        <h2>Base preparada</h2>
        <p>El lector dinamico ya puede cargar relatos por identificador cuando sus datos esten registrados.</p>
        <p>Novato permanece en su lector actual hasta la migracion controlada de la Fase 9.1.</p>
      </div>
      <div class="page-mark"><span>Motor de relatos</span><span>01</span></div>
    `
  }
  if (pageRightEl) pageRightEl.innerHTML = ''
  if (pageIndicatorEl) pageIndicatorEl.textContent = '1 / 1'
  if (prevPageEl) prevPageEl.disabled = true
  if (nextPageEl) nextPageEl.disabled = true
}

function applyBookMeta() {
  document.title = `Relato ${book.rankTitle || book.title} - ${book.title}`
  if (readerBookLabelEl) readerBookLabelEl.textContent = `Relato ${book.rankTitle || book.title}`
  if (readerTitleEl) readerTitleEl.textContent = book.title
  if (readerSummaryEl) readerSummaryEl.textContent = book.subtitle || 'Relato registrado en la Biblioteca de Historias.'
  if (readerPhaseEl) readerPhaseEl.textContent = book.phase || '9.x'

  const visual = book.visual || {}
  const root = document.documentElement
  if (visual.primary) root.style.setProperty('--book-primary', visual.primary)
  if (visual.secondary) root.style.setProperty('--book-secondary', visual.secondary)
  if (visual.accent) root.style.setProperty('--book-accent', visual.accent)
  if (visual.rgb) root.style.setProperty('--book-rgb', visual.rgb)
}

prevPageEl?.addEventListener('click', () => goToPage(currentPage - 1))
nextPageEl?.addEventListener('click', () => goToPage(currentPage + 1))

chapterListEl?.addEventListener('click', (event) => {
  const button = event.target.closest('.chapter-tab')
  if (!button || !book) return
  if (!isUnlocked(button.dataset.chapterId)) return
  goToChapter(button.dataset.chapterId)
})

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-start-trial]')
  if (!button || !book) return
  const chapters = Array.isArray(book.chapters) ? book.chapters : []
  const chapter = chapters.find((item) => item.id === button.dataset.startTrial)
  if (!chapter?.gameUrl || !isUnlocked(chapter.id) || isCompleted(chapter.id)) return
  if (!prepararLanzamientoPrueba(book, chapter)) return
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

if (!book) {
  renderMissingBook()
} else {
  limpiarPruebaPendienteDelLibro(book.id)
  applyBookMeta()
  renderChapters()
  renderBook()
}
