export const HISTORIA_PENDING_KEY = 'historia_trial_pending'
export const HISTORIA_LAUNCH_KEY = 'solitario_game_launch'

export function normalizarIdHistoria(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function crearIdLibroDesdeTitulo(title) {
  return normalizarIdHistoria(title) || 'libro'
}

export function obtenerClaveProgresoLibro(bookId) {
  return `historia_${normalizarIdHistoria(bookId)}_progress`
}

export function escaparHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function leerJsonLocal(key, fallback = null) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null')
    return parsed ?? fallback
  } catch (error) {
    return fallback
  }
}

export function escribirJsonLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function leerProgresoLibro(bookId) {
  const parsed = leerJsonLocal(obtenerClaveProgresoLibro(bookId), {})
  return {
    completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
    lastCompletedAt: parsed.lastCompletedAt || '',
    bookCompleted: Boolean(parsed.bookCompleted),
  }
}

export function guardarProgresoLibro(bookId, progress) {
  escribirJsonLocal(obtenerClaveProgresoLibro(bookId), {
    completedChapters: Array.isArray(progress?.completedChapters) ? progress.completedChapters : [],
    lastCompletedAt: progress?.lastCompletedAt || '',
    bookCompleted: Boolean(progress?.bookCompleted),
  })
}

export function capituloCompletado(progress, chapterId) {
  return Array.isArray(progress?.completedChapters) && progress.completedChapters.includes(chapterId)
}

export function indiceCapitulo(book, chapterId) {
  return Array.isArray(book?.chapters)
    ? book.chapters.findIndex((chapter) => chapter.id === chapterId)
    : -1
}

export function capituloDesbloqueado(book, progress, chapterId) {
  const index = indiceCapitulo(book, chapterId)
  if (index <= 0) return index === 0
  const previous = book.chapters[index - 1]
  return capituloCompletado(progress, previous.id)
}

export function relatoCompletado(book, progress) {
  const chapters = Array.isArray(book?.chapters) ? book.chapters : []
  return chapters.length > 0 && chapters.every((chapter) => capituloCompletado(progress, chapter.id))
}

export function paginasDelLibro(book) {
  const introPages = Array.isArray(book?.introPages) ? book.introPages : []
  const chapterPages = Array.isArray(book?.chapters)
    ? book.chapters.flatMap((chapter) => {
      const pages = Array.isArray(chapter.pages) ? chapter.pages : []
      return pages.map((chapterPage, pageIndex) => ({
        type: chapterPage.trial ? 'trial' : 'chapter',
        kicker: `Capitulo ${chapter.number || String(pageIndex + 1).padStart(2, '0')} - Pagina ${pageIndex + 1}`,
        title: pageIndex === 0 ? chapter.title : chapterPage.label,
        lines: chapterPage.lines || [],
        sealedLines: chapterPage.sealedLines || [],
        trial: chapterPage.trial ? chapter.trial : '',
        condition: chapterPage.trial ? chapter.condition : '',
        footer: chapterPage.trial ? 'Prueba preparada' : `${pageIndex + 1} de ${pages.length}`,
        afterTrial: Boolean(chapterPage.afterTrial),
        chapterId: chapter.id,
        chapterPageIndex: pageIndex,
      }))
    })
    : []
  const closingPages = Array.isArray(book?.closingPages) ? book.closingPages : []

  return [...introPages, ...chapterPages, ...closingPages]
}

export function limpiarPruebaPendienteDelLibro(bookId) {
  try {
    const pending = leerJsonLocal(HISTORIA_PENDING_KEY, null)
    if (pending?.bookId === bookId) localStorage.removeItem(HISTORIA_PENDING_KEY)
  } catch (error) {
    localStorage.removeItem(HISTORIA_PENDING_KEY)
  }
}

export function leerPruebaHistoriaPendiente() {
  return leerJsonLocal(HISTORIA_PENDING_KEY, null)
}

export function pruebaHistoriaActiva(gameId) {
  const launch = leerJsonLocal(HISTORIA_LAUNCH_KEY, null)
  const pending = leerPruebaHistoriaPendiente()
  return launch?.origin === 'historia'
    && launch?.game === gameId
    && pending?.gameId === gameId
    && Boolean(pending.bookId)
    && Boolean(pending.chapterId)
}

export function completarCapituloHistoria(gameId, options = {}) {
  const pending = leerPruebaHistoriaPendiente()
  if (!pending || pending.gameId !== gameId || !pending.bookId || !pending.chapterId) return false

  const progress = leerProgresoLibro(pending.bookId)
  const completedChapters = [...progress.completedChapters]
  if (!completedChapters.includes(pending.chapterId)) completedChapters.push(pending.chapterId)

  guardarProgresoLibro(pending.bookId, {
    ...progress,
    completedChapters,
    lastCompletedAt: new Date().toISOString(),
    bookCompleted: Boolean(options.bookCompleted || pending.finalChapter || progress.bookCompleted),
  })

  escribirJsonLocal(HISTORIA_PENDING_KEY, {
    ...pending,
    completed: true,
    completedAt: new Date().toISOString(),
  })

  return true
}

export function prepararLanzamientoPrueba(book, chapter) {
  if (!book?.id || !chapter?.id || !chapter?.gameId || !chapter?.gameUrl) return false
  const chapters = Array.isArray(book.chapters) ? book.chapters : []
  const finalChapter = chapters.length > 0 && chapters[chapters.length - 1]?.id === chapter.id

  escribirJsonLocal(HISTORIA_PENDING_KEY, {
    bookId: book.id,
    chapterId: chapter.id,
    gameId: chapter.gameId,
    returnUrl: book.readerUrl || `historia-libro.html?libro=${encodeURIComponent(book.id)}`,
    finalChapter,
    startedAt: new Date().toISOString(),
  })
  escribirJsonLocal(HISTORIA_LAUNCH_KEY, {
    game: chapter.gameId,
    origin: 'historia',
    launchedAt: new Date().toISOString(),
  })

  return true
}
