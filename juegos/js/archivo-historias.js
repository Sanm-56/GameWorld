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

function canAnimate() {
  return Boolean(window.gsap) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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

function updateShelfSelection(activeButton) {
  if (!shelfEl || !activeButton) return
  shelfEl.querySelectorAll('.rank-book.selected').forEach((button) => {
    button.classList.remove('selected')
  })
  activeButton.classList.add('selected')
}

function animateShelfEntrance() {
  if (!canAnimate() || !shelfEl) return
  const books = shelfEl.querySelectorAll('.rank-book')
  if (!books.length) return

  window.gsap.set(books, { autoAlpha: 0, y: 16, rotate: -1 })
  window.gsap.to(books, {
    autoAlpha: 1,
    y: 0,
    rotate: 0,
    duration: 0.38,
    ease: 'power2.out',
    stagger: { each: 0.018, from: 0 },
    clearProps: 'transform,opacity,visibility',
  })
}

function pulseArchiveBook(button) {
  const cover = button?.querySelector('.rank-book-cover')
  if (!cover) return

  button.classList.remove('glitch-click')
  window.requestAnimationFrame(() => {
    button.classList.add('glitch-click')
    window.setTimeout(() => button.classList.remove('glitch-click'), 520)
  })

  if (!canAnimate()) return

  window.gsap.fromTo(cover,
    { y: -5, rotate: 0, scale: 0.98, filter: 'brightness(1.35) saturate(1.18)' },
    {
      y: -8,
      rotate: 0,
      scale: 1.05,
      filter: 'brightness(1.08) saturate(1.12)',
      duration: 0.18,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      clearProps: 'transform,filter',
    },
  )
}

function animateDetailChange() {
  if (!canAnimate() || !detailEl) return

  window.gsap.fromTo(detailEl,
    { autoAlpha: 0.78, y: 10 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.28,
      ease: 'power2.out',
      clearProps: 'transform,opacity,visibility',
    },
  )
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
  animateDetailChange()
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
  animateShelfEntrance()
}

shelfEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-story-id]')
  if (!button) return
  if (button.dataset.storyId === selectedId) {
    pulseArchiveBook(button)
    return
  }

  selectedId = button.dataset.storyId
  updateShelfSelection(button)
  renderStatus()
  renderDetail(selectedStory())
  pulseArchiveBook(button)
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
