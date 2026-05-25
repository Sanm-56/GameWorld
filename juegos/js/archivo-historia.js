import { escaparHtml, normalizarIdHistoria } from './historia-core.js'
import { LIBROS_HISTORIA, obtenerLibroHistoria } from './historia-libros.js'
import { ARCHIVO_HISTORIAS } from './archivo-historias-data.js'

const chapterListEl = document.getElementById('archiveChapterList')
const pageLeftEl = document.getElementById('archivePageLeft')
const pageRightEl = document.getElementById('archivePageRight')
const prevPageEl = document.getElementById('prevArchivePage')
const nextPageEl = document.getElementById('nextArchivePage')
const pageIndicatorEl = document.getElementById('archivePageIndicator')
const titleEl = document.getElementById('archiveReaderTitle')
const summaryEl = document.getElementById('archiveReaderSummary')
const labelEl = document.getElementById('archiveReaderBookLabel')
const phaseEl = document.getElementById('archiveReaderPhase')

const mobileQuery = window.matchMedia('(max-width: 920px)')
const params = new URLSearchParams(window.location.search)
const storyId = normalizarIdHistoria(params.get('libro') || params.get('historia') || '')
const story = obtenerLibroHistoria(storyId) || LIBROS_HISTORIA[storyId]
const content = ARCHIVO_HISTORIAS[storyId]

let currentPage = 0
let pages = []

function isMobile() {
  return mobileQuery.matches
}

function pageCount() {
  return isMobile() ? pages.length : Math.ceil(pages.length / 2)
}

function leftPageIndex() {
  return isMobile() ? currentPage : currentPage * 2
}

function chunkText(lines, size = 8) {
  const cleanLines = Array.isArray(lines)
    ? lines.filter((line) => String(line || '').trim())
    : [lines].filter((line) => String(line || '').trim())
  const chunks = []
  for (let index = 0; index < cleanLines.length; index += size) {
    chunks.push(cleanLines.slice(index, index + size))
  }
  return chunks.length ? chunks : [[]]
}

function buildPages() {
  const chapters = Array.isArray(content?.capitulos) ? content.capitulos : []
  return chapters.flatMap((chapter, chapterIndex) => {
    const chunks = chunkText(chapter.texto)
    return chunks.map((lines, chunkIndex) => ({
      chapterIndex,
      chapterTitle: chapter.titulo || `Capitulo ${chapterIndex + 1}`,
      kicker: chunkIndex === 0 ? `Capitulo ${chapterIndex + 1}` : `Capitulo ${chapterIndex + 1} / Continuacion`,
      title: chunkIndex === 0 ? (chapter.titulo || `Capitulo ${chapterIndex + 1}`) : 'Continuacion',
      lines,
      footer: content?.titulo || story?.title || 'Archivo de Historias',
    }))
  })
}

function pageTemplate(page, index) {
  if (!page) return ''
  const body = page.lines.map((line) => `<p>${escaparHtml(line)}</p>`).join('')
  return `
    <div>
      <span class="page-kicker">${escaparHtml(page.kicker)}</span>
      <h2>${escaparHtml(page.title)}</h2>
      ${body}
    </div>
    <div class="page-mark">
      <span>${escaparHtml(page.footer)}</span>
      <span>${String(index + 1).padStart(2, '0')}</span>
    </div>
  `
}

function activeChapterIndex() {
  const visible = isMobile()
    ? [pages[leftPageIndex()]]
    : [pages[leftPageIndex()], pages[leftPageIndex() + 1]]
  return visible.find((page) => page)?.chapterIndex ?? -1
}

function renderBook() {
  const leftIndex = leftPageIndex()
  const rightIndex = leftIndex + 1

  if (pageLeftEl) pageLeftEl.innerHTML = pageTemplate(pages[leftIndex], leftIndex)
  if (pageRightEl) pageRightEl.innerHTML = isMobile() ? '' : pageTemplate(pages[rightIndex], rightIndex)

  const total = pageCount()
  if (pageIndicatorEl) pageIndicatorEl.textContent = `${Math.min(currentPage + 1, total)} / ${total}`
  if (prevPageEl) prevPageEl.disabled = currentPage <= 0
  if (nextPageEl) nextPageEl.disabled = currentPage >= total - 1

  const chapterIndex = activeChapterIndex()
  chapterListEl?.querySelectorAll('.chapter-tab').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.chapterIndex) === chapterIndex)
  })
}

function goToPage(page) {
  const total = pageCount()
  currentPage = Math.max(0, Math.min(total - 1, page))
  renderBook()
}

function goToChapter(chapterIndex) {
  const index = pages.findIndex((page) => page.chapterIndex === chapterIndex)
  if (index < 0) return
  goToPage(isMobile() ? index : Math.floor(index / 2))
}

function renderChapters() {
  const chapters = Array.isArray(content?.capitulos) ? content.capitulos : []
  if (!chapterListEl) return

  if (!chapters.length) {
    chapterListEl.innerHTML = '<button class="chapter-tab locked" type="button" disabled><span>--</span><span><strong>Pendiente</strong><small>Sin texto completo</small></span></button>'
    return
  }

  chapterListEl.innerHTML = chapters.map((chapter, index) => `
    <button class="chapter-tab unlocked" type="button" data-chapter-index="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <span>
        <strong>${escaparHtml(chapter.titulo || `Capitulo ${index + 1}`)}</strong>
        <small>Historia completa</small>
      </span>
    </button>
  `).join('')
}

function applyVisual() {
  const visual = story?.visual || content?.visual || {}
  const root = document.documentElement
  if (visual.primary) root.style.setProperty('--book-primary', visual.primary)
  if (visual.secondary) root.style.setProperty('--book-secondary', visual.secondary)
  if (visual.accent) root.style.setProperty('--book-accent', visual.accent)
  if (visual.rgb) root.style.setProperty('--book-rgb', visual.rgb)
}

function renderMissing() {
  document.title = 'Historia no disponible'
  if (labelEl) labelEl.textContent = 'Archivo de Historias'
  if (titleEl) titleEl.textContent = 'Historia no disponible'
  if (summaryEl) summaryEl.textContent = 'Esta historia completa todavia no esta cargada en el Archivo.'
  if (phaseEl) phaseEl.textContent = 'AH'
  if (chapterListEl) chapterListEl.innerHTML = '<button class="chapter-tab locked" type="button" disabled><span>--</span><span><strong>Pendiente</strong><small>Sin texto completo</small></span></button>'
  if (pageLeftEl) {
    pageLeftEl.innerHTML = `
      <div>
        <span class="page-kicker">Archivo</span>
        <h2>Texto pendiente</h2>
        <p>El lector esta preparado para abrir historias completas con el mismo formato visual de Relatos.</p>
      </div>
      <div class="page-mark"><span>Archivo de Historias</span><span>AH</span></div>
    `
  }
  if (pageRightEl) pageRightEl.innerHTML = ''
  if (pageIndicatorEl) pageIndicatorEl.textContent = '1 / 1'
  if (prevPageEl) prevPageEl.disabled = true
  if (nextPageEl) nextPageEl.disabled = true
}

function applyMeta() {
  const title = content?.titulo || story?.title || 'Historia completa'
  document.title = `Archivo - ${title}`
  if (labelEl) labelEl.textContent = `Archivo ${story?.rankTitle || content?.subtitulo || ''}`.trim()
  if (titleEl) titleEl.textContent = title
  if (summaryEl) summaryEl.textContent = story?.subtitle || 'Historia completa para lectura continua, sin pruebas ni juegos.'
  if (phaseEl) phaseEl.textContent = 'AH'
}

prevPageEl?.addEventListener('click', () => goToPage(currentPage - 1))
nextPageEl?.addEventListener('click', () => goToPage(currentPage + 1))

chapterListEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chapter-index]')
  if (!button) return
  goToChapter(Number(button.dataset.chapterIndex))
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

if (!story || !content?.capitulos?.length) {
  renderMissing()
} else {
  pages = buildPages()
  applyVisual()
  applyMeta()
  renderChapters()
  renderBook()
}
