import {
  NIVEL_MAXIMO,
  calcularProgresoHaciaRango,
  obtenerProgresoNivel,
  obtenerRangosDesdeNivel,
} from './progreso-nivel.js'
import {
  calcularBonusRango,
  guardarRangoEquipado,
  guardarRangoEquipadoRemoto,
  leerRangoEquipado,
  sincronizarRangoEquipado,
} from './rango-bonus.js'
import {
  COSMETICOS,
  desequiparCosmetico,
  equiparCosmetico,
  obtenerCosmeticoEquipado,
} from './tienda.js'
import {
  instalarEstilosFondosCosmeticos,
  renderPreviewFondoCosmetico,
} from './fondos-cosmeticos.js'

const usuario = localStorage.getItem('usuario')
const roadEl = document.getElementById('routeRoad')
const statusEl = document.getElementById('routeStatus')
const equippedRankEl = document.getElementById('equippedRank')
const currentLevelEl = document.getElementById('currentLevel')
const refreshEl = document.getElementById('routeRefresh')
let fondoEquipadoActual = null

instalarEstilosFondosCosmeticos()

const RANGOS_BASE = {
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

const TEMAS_AVANZADOS = [
  { match: ['vacio', 'umbra', 'negro'], emblem: 'VX', primary: '#818cf8', secondary: '#111827', accent: '#c084fc', rgb: '129,140,248' },
  { match: ['astral', 'estrella', 'constelacion'], emblem: 'AS', primary: '#38bdf8', secondary: '#4338ca', accent: '#f0abfc', rgb: '56,189,248' },
  { match: ['carmesi', 'sangre', 'juicio'], emblem: 'CR', primary: '#fb7185', secondary: '#7f1d1d', accent: '#fecaca', rgb: '251,113,133' },
  { match: ['eco', 'ether', 'horizonte'], emblem: 'ET', primary: '#2dd4bf', secondary: '#0f766e', accent: '#a7f3d0', rgb: '45,212,191' },
  { match: ['eclipse', 'sombra', 'ruina'], emblem: 'EC', primary: '#a78bfa', secondary: '#312e81', accent: '#fbbf24', rgb: '167,139,250' },
  { match: ['infinito', 'eterno', 'eternidad'], emblem: 'IN', primary: '#f8fafc', secondary: '#64748b', accent: '#38bdf8', rgb: '248,250,252' },
  { match: ['trono', 'corona', 'reino'], emblem: 'TR', primary: '#facc15', secondary: '#92400e', accent: '#fff7ed', rgb: '250,204,21' },
  { match: ['abismo', 'fin', 'ultimo'], emblem: 'AB', primary: '#c084fc', secondary: '#1e1b4b', accent: '#60a5fa', rgb: '192,132,252' },
]

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatearNumero(valor) {
  return new Intl.NumberFormat('es-CO').format(Math.max(0, Math.trunc(Number(valor) || 0)))
}

function hashTextoVisual(valor) {
  return [...String(valor || '')].reduce((total, char) => ((total << 5) - total + char.charCodeAt(0)) | 0, 0)
}

function obtenerInicialesRango(titulo) {
  const partes = normalizarTexto(titulo).split(/\s+/).filter(Boolean)
  return partes.length ? partes.slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() : 'RX'
}

function obtenerVisualRango(titulo) {
  const clave = normalizarTexto(titulo)
  const base = RANGOS_BASE[clave]
  if (base) return base

  const tema = TEMAS_AVANZADOS.find((item) => item.match.some((fragmento) => clave.includes(fragmento)))
    || TEMAS_AVANZADOS[Math.abs(hashTextoVisual(clave)) % TEMAS_AVANZADOS.length]

  return {
    ...tema,
    emblem: tema.emblem || obtenerInicialesRango(titulo),
  }
}

function estiloVisualRango(visual) {
  return [
    ['--node-primary', visual.primary],
    ['--node-secondary', visual.secondary],
    ['--node-accent', visual.accent],
    ['--node-rgb', visual.rgb],
  ]
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
}

function aplicarTemaActual(titulo) {
  const visual = obtenerVisualRango(titulo)
  document.body.style.setProperty('--rank-primary', visual.primary)
  document.body.style.setProperty('--rank-secondary', visual.secondary)
  document.body.style.setProperty('--rank-accent', visual.accent)
  document.body.style.setProperty('--rank-rgb', visual.rgb)
}

function crearRangoGuardable(rango, rangos) {
  const lista = Array.isArray(rangos) && rangos.length ? rangos : obtenerRangosDesdeNivel(1)
  const index = Math.max(0, lista.findIndex((item) => normalizarTexto(item.titulo) === normalizarTexto(rango?.titulo)))
  return {
    titulo: rango?.titulo || 'Novato',
    desde: rango?.desde || 1,
    hasta: rango?.hasta || rango?.desde || 25,
    indice: index,
    totalRangos: lista.length || 1,
  }
}

function rangoEstaDesbloqueado(rango, nivel) {
  return Boolean(rango?.desde && rango.desde <= (Number(nivel) || 1))
}

function obtenerRangoPorTitulo(titulo, rangos) {
  return rangos.find((rango) => normalizarTexto(rango.titulo) === normalizarTexto(titulo))
}

function obtenerFondoCosmeticoRango(rango, rangos = obtenerRangosDesdeNivel(1)) {
  const indice = rangos.findIndex((item) => normalizarTexto(item.titulo) === normalizarTexto(rango?.titulo))
  const numero = (Math.max(0, indice) % 100) + 1
  return COSMETICOS.find((item) => item.id === `fondo_${String(numero).padStart(3, '0')}`)
}

function fondoEstaEquipado(cosmetico) {
  return Boolean(cosmetico?.id && fondoEquipadoActual?.cosmetico_id === cosmetico.id)
}

function renderPreviewFondoRango(rango, rangos) {
  const cosmetico = obtenerFondoCosmeticoRango(rango, rangos)
  if (!cosmetico) return ''

  return `
    <button class="route-cosmetic ${fondoEstaEquipado(cosmetico) ? 'equipped' : ''}" type="button" data-rank-action="${fondoEstaEquipado(cosmetico) ? 'unequip' : 'equip'}" data-rank-title="${escaparHtml(rango.titulo)}">
      ${renderPreviewFondoCosmetico(cosmetico, 'compacto')}
      <span>${fondoEstaEquipado(cosmetico) ? 'Fondo equipado' : cosmetico.nombre}</span>
    </button>
  `
}

async function equiparFondoDeRango(rango, action, rangos) {
  if (!usuario) return { ok: false, error: 'Usuario invalido' }
  if (action === 'unequip') {
    const resultado = await desequiparCosmetico(usuario, 'fondo')
    if (resultado?.ok) fondoEquipadoActual = null
    return resultado
  }

  const fondo = obtenerFondoCosmeticoRango(rango, rangos)
  if (!fondo) return { ok: false, error: 'Fondo de rango no disponible' }

  const resultado = await equiparCosmetico(usuario, fondo.id)
  if (resultado?.ok) fondoEquipadoActual = resultado.cosmetico
  return resultado
}

function renderRuta(progreso, rangos, rangoEquipado) {
  if (!roadEl) return

  const nivel = progreso?.nivel || 1
  const tituloEquipado = rangoEquipado?.titulo || 'Novato'
  const siguiente = rangos.find((rango) => rango.desde > nivel)
  aplicarTemaActual(tituloEquipado)

  if (equippedRankEl) equippedRankEl.textContent = tituloEquipado
  if (currentLevelEl) currentLevelEl.textContent = `${nivel} / ${NIVEL_MAXIMO}`
  if (statusEl) {
    if (!siguiente || nivel >= NIVEL_MAXIMO) {
      statusEl.textContent = 'Rango maximo alcanzado. La ruta completa sigue disponible para revisar tus rangos.'
    } else {
      const avance = calcularProgresoHaciaRango(progreso, siguiente)
      const niveles = Math.max(0, siguiente.desde - nivel)
      statusEl.textContent = `${niveles} niveles y ${formatearNumero(avance.faltante)} XP para ${siguiente.titulo}.`
    }
  }

  roadEl.innerHTML = rangos.map((rango) => {
    const desbloqueado = rangoEstaDesbloqueado(rango, nivel)
    const actual = nivel >= rango.desde && nivel <= rango.hasta
    const equipado = normalizarTexto(rango.titulo) === normalizarTexto(tituloEquipado)
    const progresoRango = calcularProgresoHaciaRango(progreso, rango)
    const visual = obtenerVisualRango(rango.titulo)
    const bonus = calcularBonusRango(crearRangoGuardable(rango, rangos), rangos.length)
    const clases = `${actual ? 'current' : ''} ${desbloqueado ? 'unlocked' : 'locked'} ${equipado ? 'equipped' : ''}`.trim()
    const rangoTexto = rango.desde === rango.hasta ? `Nivel ${rango.desde}` : `Nivel ${rango.desde}-${rango.hasta}`
    const estado = equipado ? 'Equipado' : actual ? 'Rango actual' : desbloqueado ? 'Desbloqueado' : 'Bloqueado'
    const boton = equipado
      ? `<button class="route-equip secondary" type="button" data-rank-action="unequip" data-rank-title="${escaparHtml(rango.titulo)}">Desequipar</button>`
      : desbloqueado
        ? `<button class="route-equip" type="button" data-rank-action="equip" data-rank-title="${escaparHtml(rango.titulo)}">Equipar</button>`
        : '<button class="route-equip secondary" type="button" disabled>Bloqueado</button>'

    return `
      <article class="route-node ${clases}" style="${estiloVisualRango(visual)}">
        <div class="route-node-head">
          <span class="route-emblem">${escaparHtml(visual.emblem)}</span>
          <span class="route-level">${escaparHtml(rangoTexto)}</span>
        </div>
        <strong class="route-name">${escaparHtml(rango.titulo)}</strong>
        <span class="route-detail">${desbloqueado ? `Requisito: nivel ${rango.desde}` : `Faltan ${formatearNumero(progresoRango.faltante)} XP`}</span>
        <span class="route-bonus">EXP ${escaparHtml(bonus.expTexto)} | Monedas ${escaparHtml(bonus.monedasTexto)}</span>
        ${desbloqueado ? renderPreviewFondoRango(rango, rangos) : ''}
        <span class="route-progress"><span style="width:${progresoRango.porcentaje}%"></span></span>
        <div class="route-actions">
          <span class="route-state">${estado}</span>
          ${boton}
        </div>
      </article>
    `
  }).join('')

  requestAnimationFrame(() => {
    const nodoActual = roadEl.querySelector('.route-node.equipped') || roadEl.querySelector('.route-node.current')
    nodoActual?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function cargarRuta() {
  if (!roadEl) return
  if (!usuario) {
    roadEl.innerHTML = '<div class="empty">Inicia sesion para ver tu ruta de rangos.</div>'
    if (statusEl) statusEl.textContent = 'No hay usuario activo en esta sesion.'
    return
  }

  if (refreshEl) refreshEl.disabled = true
  if (statusEl) statusEl.textContent = 'Cargando progreso...'

  const rangos = obtenerRangosDesdeNivel(1)
  const progreso = await obtenerProgresoNivel(usuario)
  const rangoEquipado = await sincronizarRangoEquipado(usuario, rangos)
  fondoEquipadoActual = await obtenerCosmeticoEquipado(usuario, 'fondo')
  renderRuta(progreso, rangos, rangoEquipado || leerRangoEquipado(usuario))

  if (refreshEl) refreshEl.disabled = false
}

roadEl?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-rank-action]')
  if (!button || !usuario) return

  const rangos = obtenerRangosDesdeNivel(1)
  const progreso = await obtenerProgresoNivel(usuario)
  const action = button.dataset.rankAction
  const titulo = action === 'unequip' ? 'Novato' : button.dataset.rankTitle
  const rango = obtenerRangoPorTitulo(titulo, rangos) || rangos[0]

  if (action === 'equip' && !rangoEstaDesbloqueado(rango, progreso.nivel)) return

  button.disabled = true
  button.textContent = action === 'unequip' ? 'Desequipando...' : 'Equipando...'

  const guardable = crearRangoGuardable(rango, rangos)
  const resultadoFondo = await equiparFondoDeRango(rango, action, rangos)
  if (!resultadoFondo?.ok) {
    console.warn('No se pudo equipar fondo desde ruta standalone', resultadoFondo?.error)
    button.disabled = false
    button.textContent = action === 'unequip' ? 'Desequipar' : 'Reintentar'
    return
  }

  guardarRangoEquipado(usuario, guardable)
  await guardarRangoEquipadoRemoto(usuario, guardable)
  renderRuta(progreso, rangos, guardable)
})

refreshEl?.addEventListener('click', cargarRuta)

cargarRuta()
