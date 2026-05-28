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
        <span class="rank-book-cover" data-archive-id="${escapeHtml(story.id)}" data-emblem="${escapeHtml(visual.emblem || 'AH')}"></span>
        <span class="rank-book-name">${escapeHtml(archiveTitle(story))}</span>
        <span class="rank-book-state">${loaded ? 'Disponible' : 'Pendiente'}</span>
      </button>
    `
  }).join('')
}

function updateShelfSelection(activeButton) {
  if (!shelfEl || !activeButton) return
  shelfEl.querySelectorAll('.rank-book').forEach((button) => {
    const selected = button === activeButton
    button.classList.toggle('selected', selected)
    if (!selected) animateArchiveBookHover(button, false)
  })
  animateArchiveBookHover(activeButton, true)
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
    { filter: 'brightness(1.18) saturate(1.16)' },
    { filter: 'brightness(1) saturate(1)', duration: 0.48, ease: 'power2.out', overwrite: true },
  )
}

function animateArchiveBookHover(button, active) {
  if (!canAnimate() || !button) return
  const cover = button.querySelector('.rank-book-cover')
  const state = button.querySelector('.rank-book-state')
  if (!cover) return

  window.gsap.to(cover, {
    y: active ? -10 : 0,
    rotate: active ? 0 : -1,
    scale: active ? 1.04 : 1,
    duration: active ? 0.28 : 0.34,
    ease: active ? 'power2.out' : 'power2.inOut',
    overwrite: true,
  })

  if (state) {
    window.gsap.to(state, {
      y: active ? -2 : 0,
      autoAlpha: active ? 1 : 0.86,
      duration: 0.24,
      ease: 'power2.out',
      overwrite: true,
    })
  }
}

function bindArchiveShelfAnimations() {
  if (!canAnimate() || !shelfEl) return

  shelfEl.querySelectorAll('.rank-book').forEach((button) => {
    button.addEventListener('mouseenter', () => animateArchiveBookHover(button, true))
    button.addEventListener('mouseleave', () => {
      if (button.classList.contains('selected')) return
      animateArchiveBookHover(button, false)
    })
    button.addEventListener('focus', () => animateArchiveBookHover(button, true))
    button.addEventListener('blur', () => {
      if (button.classList.contains('selected')) return
      animateArchiveBookHover(button, false)
    })
  })
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
  const description = loaded
    ? archiveSubtitle(story) || 'Kael avanza por una historia completa del Archivo, donde cada capitulo revela una parte mas profunda de su camino.'
    : 'Este tomo aun espera su historia completa. Cuando el Archivo lo abra, Kael podra seguir esa parte del camino como una lectura continua.'

  detailEl.style.setProperty('--book-rgb', visual.rgb || '56,189,248')
  detailEl.innerHTML = `
    <span class="detail-kicker">${loaded ? 'Historia completa' : 'Historia pendiente'}</span>
    <h2>${escapeHtml(archiveTitle(story))}</h2>
    <p>${escapeHtml(description)}</p>
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
  bindArchiveShelfAnimations()
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
