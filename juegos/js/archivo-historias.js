import { LIBROS_HISTORIA } from './historia-libros.js'
import { ARCHIVO_HISTORIAS } from './archivo-historias-data.js'

const shelfEl = document.getElementById('archiveShelf')
const detailEl = document.getElementById('archiveDetail')
const hintEl = document.getElementById('archiveHint')
const totalEl = document.getElementById('archiveTotal')
const loadedEl = document.getElementById('archiveLoaded')
const activeEl = document.getElementById('archiveActive')
const stories = Object.values(LIBROS_HISTORIA)
let selectedId = stories[0]?.id || ''

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function storyContent(storyId) {
  const content = ARCHIVO_HISTORIAS[storyId]
  return content && Array.isArray(content.capitulos) ? content : null
}

function hasContent(storyId) {
  return Boolean(storyContent(storyId)?.capitulos.length)
}

function archiveTitle(story) {
  return storyContent(story.id)?.titulo || story.title || story.rankTitle
}

function archiveSubtitle(story) {
  return storyContent(story.id)?.subtitulo || story.subtitle || ''
}

function archiveVisual(story) {
  return story.visual || storyContent(story.id)?.visual || {}
}

function archiveReaderUrl(storyId) {
  return `archivo-historia.html?libro=${encodeURIComponent(storyId)}`
}

function visualVars(story) {
  const visual = archiveVisual(story)
  return [
    ['--rank-primary', visual.primary || '#38bdf8'],
    ['--rank-secondary', visual.secondary || '#0f172a'],
    ['--rank-accent', visual.accent || '#fde68a'],
    ['--rank-rgb', visual.rgb || '56,189,248'],
  ].map(([name, value]) => `${name}:${value}`).join(';')
}

function selectedStory() {
  return stories.find((story) => story.id === selectedId) || stories[0] || null
}

function renderShelf() {
  if (!shelfEl) return

  shelfEl.innerHTML = stories.map((story) => {
    const loaded = hasContent(story.id)
    const visual = archiveVisual(story)
    return `
      <button class="rank-book ${story.id === selectedId ? 'selected' : ''} ${loaded ? 'registered' : 'pending'}" type="button" data-story-id="${escapeHtml(story.id)}" style="${visualVars(story)}">
        <span class="rank-book-cover" data-emblem="${escapeHtml(visual.emblem || 'AH')}"></span>
        <span class="rank-book-name">${escapeHtml(archiveTitle(story))}</span>
        <span class="rank-book-state">${loaded ? 'Disponible' : 'Pendiente'}</span>
      </button>
    `
  }).join('')
}

function renderDetail(story) {
  if (!detailEl || !story) return

  const content = storyContent(story.id)
  const loaded = Boolean(content?.capitulos.length)
  const range = story.levelFrom === story.levelTo ? `Nivel ${story.levelFrom}` : `Niveles ${story.levelFrom}-${story.levelTo}`
  const visual = archiveVisual(story)

  detailEl.style.setProperty('--book-rgb', visual.rgb || '56,189,248')
  detailEl.innerHTML = `
    <span class="detail-kicker">${loaded ? 'Historia completa' : 'Pendiente de texto'}</span>
    <h2>${escapeHtml(archiveTitle(story))}</h2>
    <p>${escapeHtml(loaded
      ? 'Esta historia completa ya esta cargada para lectura continua.'
      : 'Este relato ya tiene base visual. Cuando compartas la historia completa, aparecera aqui sin pruebas ni juegos.')} ${escapeHtml(archiveSubtitle(story))}</p>
    <div class="detail-progress">
      <span>${escapeHtml(range)}</span>
      <strong>${escapeHtml(story.rankTitle || story.id)}</strong>
    </div>
    <button class="detail-open" type="button" ${loaded ? `data-open-archive-reader="${escapeHtml(story.id)}"` : 'disabled'}>${loaded ? 'Leer historia' : 'Pendiente'}</button>
    <button class="detail-secondary" type="button" data-open-relato="${escapeHtml(story.readerUrl || 'historia.html')}">Abrir relato</button>
  `
}

function renderStatus() {
  const loaded = stories.filter((story) => hasContent(story.id)).length
  if (totalEl) totalEl.textContent = String(stories.length)
  if (loadedEl) loadedEl.textContent = String(loaded)
  if (activeEl) activeEl.textContent = selectedStory()?.rankTitle || 'Archivo'
  if (hintEl) hintEl.textContent = loaded
    ? `${loaded} historias completas cargadas.`
    : 'Sin historias completas cargadas todavia. El Archivo ya esta preparado para recibir tus textos.'
}

function renderArchive() {
  const story = selectedStory()
  if (!story) return

  renderStatus()
  renderShelf()
  renderDetail(story)
}

shelfEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-story-id]')
  if (!button) return
  selectedId = button.dataset.storyId
  renderArchive()
})

detailEl?.addEventListener('click', (event) => {
  const archiveReaderButton = event.target.closest('[data-open-archive-reader]')
  if (archiveReaderButton) {
    window.location.href = archiveReaderUrl(archiveReaderButton.dataset.openArchiveReader)
    return
  }

  const relatoButton = event.target.closest('[data-open-relato]')
  if (relatoButton) {
    window.location.href = relatoButton.dataset.openRelato
    return
  }
})

renderArchive()
