import { supabase } from './supabase.js'
import {
  COSMETICOS,
  RECOMPENSAS_MONEDAS,
  desequiparCosmetico,
  equiparCosmetico,
  iniciarSincronizacionRecompensasUsuario,
  obtenerHistorialMonedas,
  obtenerCosmeticoEquipado,
  obtenerMonedas,
  sincronizarMonedasUsuario,
} from './tienda.js'
import {
  NIVEL_MAXIMO,
  calcularProgresoHaciaRango,
  obtenerProgresoNivel,
  obtenerRangoNivel,
  obtenerRankingNivel,
  obtenerRecompensaNivel,
  obtenerRecompensasHastaNivel,
  obtenerRangosDesdeNivel,
  obtenerRangosHastaNivel,
  obtenerTituloNivel,
  registrarXpPorLogros,
} from './progreso-nivel.js'
import { aplicarPersonalizacionUsuario, instalarEstilosPersonalizacion } from './personalizacion-visual.js'
import {
  calcularBonusRango,
  guardarRangoEquipado as guardarRangoEquipadoBonus,
  guardarRangoEquipadoRemoto as guardarRangoEquipadoRemotoBonus,
  leerRangoEquipado as leerRangoEquipadoBonus,
  sincronizarRangoEquipado as sincronizarRangoEquipadoBonus,
} from './rango-bonus.js'

const usuario = localStorage.getItem('usuario')
instalarEstilosPersonalizacion()

const GAMES = [
  { key: 'sudoku', label: 'Sudoku', icon: 'S' },
  { key: 'memoria', label: 'Memoria', icon: 'M' },
  { key: 'matematicas', label: 'Matematicas', icon: '+' },
  { key: 'flashmind', label: 'FlashMind', icon: 'F' },
  { key: 'numcatch', label: 'NumCatch', icon: 'N' },
  { key: 'cricketarcade', label: 'Cricket Arcade', icon: 'C' },
  { key: 'esquivaobstaculos', label: 'Esquiva Obstaculos', icon: 'E' },
  { key: 'torreinfinita', label: 'Torre Infinita', icon: 'T' },
  { key: 'subelamontana', label: 'Sube la Montana', icon: 'S' },
  { key: 'ajedrez', label: 'Ajedrez', icon: 'A' },
  { key: 'domino', label: 'Domino', icon: 'D' },
  { key: 'damas', label: 'Damas', icon: 'K' },
]

let juegoLogrosActivo = GAMES[0].key
let resultadosPerfil = []
let estadisticasLogros = {}

const nombreUsuarioEl = document.getElementById('nombreUsuario')
const perfilAvatarEl = document.getElementById('perfilAvatar')
const perfilTituloRangoEl = document.getElementById('perfilTituloRango')
const perfilResumenEl = document.getElementById('perfilResumen')
const perfilEstadoEl = document.getElementById('perfilEstado')
const pillUsuarioEl = document.getElementById('pillUsuario')
const pillPartidasEl = document.getElementById('pillPartidas')
const pillMedallasEl = document.getElementById('pillMedallas')
const pillNivelEl = document.getElementById('pillNivel')
const pillBonusExpEl = document.getElementById('pillBonusExp')
const pillBonusMonedasEl = document.getElementById('pillBonusMonedas')
const statJuegosEl = document.getElementById('statJuegos')
const statOrosEl = document.getElementById('statOros')
const statPodiosEl = document.getElementById('statPodios')
const statMejorEl = document.getElementById('statMejor')
const medallasListEl = document.getElementById('medallasList')
const logrosJuegosEl = document.getElementById('logrosJuegos')
const logrosTituloJuegoEl = document.getElementById('logrosTituloJuego')
const logrosContadorEl = document.getElementById('logrosContador')
const logrosListEl = document.getElementById('logrosList')
const historialListEl = document.getElementById('historialList')
const rewardCoinsEl = document.getElementById('rewardCoins')
const rewardSummaryEl = document.getElementById('rewardSummary')
const rewardRecentEl = document.getElementById('rewardRecent')
const nivelActualEl = document.getElementById('nivelActual')
const xpActualEl = document.getElementById('xpActual')
const porcentajeNivelEl = document.getElementById('porcentajeNivel')
const barraNivelEl = document.getElementById('barraNivel')
const xpNivelDetalleEl = document.getElementById('xpNivelDetalle')
const xpRestanteEl = document.getElementById('xpRestante')
const recompensaSiguienteEl = document.getElementById('recompensaSiguiente')
const rankingNivelListEl = document.getElementById('rankingNivelList')
const rangoRutaListEl = document.getElementById('rangoRutaList')
const rangoProgresoTextoEl = document.getElementById('rangoProgresoTexto')
const perfilHeroEl = document.querySelector('.hero.profile-card')
const progresoPerfilEl = document.querySelector('.season-pass')
const rangoEquipadoTextoEl = document.getElementById('rangoEquipadoTexto')
const rangoBonusExpEl = document.getElementById('rangoBonusExp')
const rangoBonusMonedasEl = document.getElementById('rangoBonusMonedas')
const rangoBonusCategoriaEl = document.getElementById('rangoBonusCategoria')
const rangoBonusBarraEl = document.getElementById('rangoBonusBarra')
const proximoRangoNombreEl = document.getElementById('proximoRangoNombre')
const proximoRangoXpEl = document.getElementById('proximoRangoXp')
const proximoRangoFaltanteEl = document.getElementById('proximoRangoFaltante')
const chatGlobalListEl = document.getElementById('chatGlobalList')
const chatGlobalFormEl = document.getElementById('chatGlobalForm')
const chatGlobalInputEl = document.getElementById('chatGlobalInput')
const chatGlobalStatusEl = document.getElementById('chatGlobalStatus')
const chatPrivateSearchEl = document.getElementById('chatPrivateSearch')
const chatPrivateOpenEl = document.getElementById('chatPrivateOpen')
const chatPrivateTargetEl = document.getElementById('chatPrivateTarget')
const chatConversationListEl = document.getElementById('chatConversationList')
const chatPrivateListEl = document.getElementById('chatPrivateList')
const chatPrivateFormEl = document.getElementById('chatPrivateForm')
const chatPrivateInputEl = document.getElementById('chatPrivateInput')
const chatPrivateStatusEl = document.getElementById('chatPrivateStatus')
const chatPrivateClearViewEl = document.getElementById('chatPrivateClearView')
const chatPrivateDeleteOwnEl = document.getElementById('chatPrivateDeleteOwn')
const chatPrivateDeleteConversationEl = document.getElementById('chatPrivateDeleteConversation')
const chatConfirmOverlayEl = document.getElementById('chatConfirmOverlay')
const chatConfirmTitleEl = document.getElementById('chatConfirmTitle')
const chatConfirmMessageEl = document.getElementById('chatConfirmMessage')
const chatConfirmCancelEl = document.getElementById('chatConfirmCancel')
const chatConfirmAcceptEl = document.getElementById('chatConfirmAccept')
const CHAT_GLOBAL_TABLA = 'chat_global'
const CHAT_PRIVADO_TABLA = 'chat_privado'
const CHAT_LIMITE = 60
const CHAT_LECTURAS_KEY = `perfil_chat_privado_lecturas_${usuario || 'anon'}`
const CHAT_OCULTOS_KEY = `perfil_chat_privado_ocultos_${usuario || 'anon'}`
const RECOMPENSA_RANGO_FONDO_PREFIX = 'rango-fondo'
let rangoEquipadoActual = 'Novato'
let progresoNivelActual = null
let recompensasCosmeticasRuta = []
let fondoEquipadoActual = null
let chatGlobalCanal = null
let chatPrivadoCanal = null
let chatPrivadoDestino = ''
let refrescoPersonalizacionPerfil = 0

const RANGOS_VISUALES = {
  novato: { tier: 'novato', emblem: 'NV', motif: 'stars', era: 'astral', material: 'space-glass', density: 'minimal', geometry: 'particles' },
  amateur: { tier: 'amateur', emblem: 'AM', motif: 'grid', era: 'quantum', material: 'titanium', density: 'clean', geometry: 'vertical' },
  aspirante: { tier: 'aspirante', emblem: 'AS', motif: 'fracture', era: 'fractal', material: 'quantum-crystal', density: 'medium', geometry: 'triangles' },
  profesional: { tier: 'profesional', emblem: 'PR', motif: 'glitch', era: 'quantum', material: 'holographic-titanium', density: 'medium', geometry: 'offset' },
  competidor: { tier: 'competidor', emblem: 'CP', motif: 'flare', era: 'eclipse', material: 'plasma', density: 'dense', geometry: 'radial' },
  experto: { tier: 'experto', emblem: 'EX', motif: 'void', era: 'void', material: 'dark-matter', density: 'medium', geometry: 'gravity' },
  elite: { tier: 'elite', emblem: 'EL', motif: 'orbit', era: 'astral', material: 'space-glass', density: 'clean', geometry: 'orbital' },
  maestro: { tier: 'maestro', emblem: 'MA', motif: 'eclipse', era: 'eclipse', material: 'solar-glass', density: 'medium', geometry: 'halo' },
  'gran maestro': { tier: 'gran-maestro', emblem: 'GM', motif: 'rift', era: 'eclipse', material: 'liquid-metal', density: 'intense', geometry: 'cracks' },
  leyenda: { tier: 'leyenda', emblem: 'LY', motif: 'constellation', era: 'astral', material: 'nebula-glass', density: 'dense', geometry: 'constellation' },
  mitico: { tier: 'mitico', emblem: 'MT', motif: 'refraction', era: 'quantum', material: 'quantum-crystal', density: 'dense', geometry: 'prism' },
  supremo: { tier: 'supremo', emblem: 'SP', motif: 'halo', era: 'singularity', material: 'radiant-glass', density: 'minimal', geometry: 'centered' },
  titan: { tier: 'titan', emblem: 'TN', motif: 'gravity', era: 'void', material: 'obsidian', density: 'intense', geometry: 'compressed' },
  inmortal: { tier: 'inmortal', emblem: 'IM', motif: 'singularity', era: 'singularity', material: 'luminous-matter', density: 'clean', geometry: 'core' },
  'leyenda maxima': { tier: 'leyenda-maxima', emblem: 'LM', motif: 'ascension', era: 'singularity', material: 'prismatic-gold', density: 'intense', geometry: 'crownless-halo' },
  'soberano del vacio viviente': { tier: 'entity-living-void', emblem: 'VV', motif: 'living-void', power: '5', primary: '#1f123d', secondary: '#05050c', accent: '#6d5dfc', rgb: '109,93,252', title: '#eee9ff', era: 'void', material: 'dark-matter', density: 'minimal', geometry: 'gravity' },
  'portador de la corona negra': { tier: 'entity-black-crown', emblem: 'CN', motif: 'black-crown', power: '5', primary: '#d7c37a', secondary: '#090912', accent: '#3f3a58', rgb: '215,195,122', title: '#fff8d7', era: 'regal', material: 'obsidian', density: 'clean', geometry: 'crownless-halo' },
  'rey del infinito oscuro': { tier: 'entity-dark-infinity', emblem: 'IO', motif: 'dark-infinity', power: '4', primary: '#7dd3fc', secondary: '#17132e', accent: '#4c1d95', rgb: '125,211,252', title: '#e0f7ff', era: 'singularity', material: 'space-glass', density: 'minimal', geometry: 'core' },
  'guardian de las ruinas eternas': { tier: 'entity-eternal-ruins', emblem: 'RE', motif: 'eternal-ruins', power: '4', primary: '#9ca3af', secondary: '#38bdf8', accent: '#334155', rgb: '156,163,175', title: '#f1f5f9', era: 'fractal', material: 'holographic-titanium', density: 'dense', geometry: 'fragmented' },
  'monarca del ether oscuro': { tier: 'entity-dark-ether', emblem: 'EO', motif: 'dark-ether', power: '4', primary: '#c084fc', secondary: '#5b21b6', accent: '#22d3ee', rgb: '192,132,252', title: '#f3e8ff', era: 'quantum', material: 'plasma', density: 'clean', geometry: 'offset' },
  'heraldo del horizonte carmesi': { tier: 'entity-crimson-horizon', emblem: 'HC', motif: 'crimson-horizon', power: '4', primary: '#fb7185', secondary: '#7f1d1d', accent: '#fbbf24', rgb: '251,113,133', title: '#ffe4e6', era: 'eclipse', material: 'solar-glass', density: 'minimal', geometry: 'vertical' },
  'emisario de los titanes': { tier: 'entity-titans', emblem: 'TT', motif: 'titans', power: '4', primary: '#94a3b8', secondary: '#475569', accent: '#e2e8f0', rgb: '148,163,184', title: '#f8fafc', era: 'monolith', material: 'titanium', density: 'dense', geometry: 'vertical' },
  'senor de las estrellas muertas': { tier: 'entity-dead-stars', emblem: 'EM', motif: 'dead-stars', power: '4', primary: '#cbd5e1', secondary: '#64748b', accent: '#a16207', rgb: '203,213,225', title: '#f8fafc', era: 'astral', material: 'nebula-glass', density: 'clean', geometry: 'constellation' },
  'arquitecto del eclipse final': { tier: 'entity-final-eclipse', emblem: 'EF', motif: 'final-eclipse', power: '5', primary: '#fecaca', secondary: '#991b1b', accent: '#f97316', rgb: '254,202,202', title: '#fff1f2', era: 'eclipse', material: 'solar-glass', density: 'medium', geometry: 'halo' },
  'devastador de imperios': { tier: 'entity-empire-breaker', emblem: 'DI', motif: 'empire-breaker', power: '4', primary: '#f97316', secondary: '#dc2626', accent: '#facc15', rgb: '249,115,22', title: '#ffedd5', era: 'fracture', material: 'liquid-metal', density: 'dense', geometry: 'cracks' },
  'trono viviente': { tier: 'entity-living-throne', emblem: 'TV', motif: 'living-throne', power: '4', primary: '#34d399', secondary: '#064e3b', accent: '#a7f3d0', rgb: '52,211,153', title: '#d1fae5', era: 'bio-astral', material: 'luminous-matter', density: 'medium', geometry: 'core' },
  'vigia del abismo eterno': { tier: 'entity-abyss-watch', emblem: 'AE', motif: 'abyss-watch', power: '4', primary: '#38bdf8', secondary: '#020617', accent: '#1e3a8a', rgb: '56,189,248', title: '#e0f2fe', era: 'void', material: 'dark-matter', density: 'minimal', geometry: 'vertical' },
  'portador del noveno sello': { tier: 'entity-ninth-seal', emblem: '9S', motif: 'ninth-seal', power: '4', primary: '#2dd4bf', secondary: '#312e81', accent: '#fef3c7', rgb: '45,212,191', title: '#ccfbf1', era: 'quantum', material: 'quantum-crystal', density: 'dense', geometry: 'sigil' },
  'emperador de umbra prime': { tier: 'entity-umbra-prime', emblem: 'UP', motif: 'umbra-prime', power: '5', primary: '#d6bd77', secondary: '#0a0a10', accent: '#6b5b3e', rgb: '214,189,119', title: '#fff7dd', era: 'regal', material: 'prismatic-gold', density: 'minimal', geometry: 'centered' },
  'custodio del fin absoluto': { tier: 'entity-absolute-end', emblem: 'FA', motif: 'absolute-end', power: '4', primary: '#94a3b8', secondary: '#111827', accent: '#475569', rgb: '148,163,184', title: '#e5e7eb', era: 'entropy', material: 'dark-matter', density: 'clean', geometry: 'particles' },
  'rey del reino perdido': { tier: 'entity-lost-realm', emblem: 'RP', motif: 'lost-realm', power: '4', primary: '#67e8f9', secondary: '#155e75', accent: '#c4b5fd', rgb: '103,232,249', title: '#ecfeff', era: 'archive', material: 'holographic-titanium', density: 'medium', geometry: 'fragmented' },
  'heraldo de la ultima aurora': { tier: 'entity-last-aurora', emblem: 'UA', motif: 'last-aurora', power: '4', primary: '#fde68a', secondary: '#fb7185', accent: '#7dd3fc', rgb: '253,230,138', title: '#fff7ed', era: 'aurora', material: 'radiant-glass', density: 'clean', geometry: 'offset' },
  'dominador del trono astral': { tier: 'entity-astral-throne', emblem: 'TA', motif: 'astral-throne', power: '4', primary: '#a78bfa', secondary: '#38bdf8', accent: '#e0f2fe', rgb: '167,139,250', title: '#ede9fe', era: 'astral', material: 'space-glass', density: 'clean', geometry: 'orbital' },
  'monarca de la eternidad negra': { tier: 'entity-frozen-eternity', emblem: 'EN', motif: 'frozen-eternity', power: '5', primary: '#bfdbfe', secondary: '#111827', accent: '#818cf8', rgb: '191,219,254', title: '#eff6ff', era: 'stasis', material: 'quantum-crystal', density: 'minimal', geometry: 'centered' },
  'devorador del horizonte': { tier: 'entity-horizon-eater', emblem: 'DH', motif: 'horizon-eater', power: '5', primary: '#f8fafc', secondary: '#020617', accent: '#ef4444', rgb: '248,250,252', title: '#ffffff', era: 'final', material: 'obsidian', density: 'clean', geometry: 'gravity' },
  'soberano de los ecos infinitos': { tier: 'rupture-infinite-echoes', emblem: 'EI', motif: 'echo-waves', power: '5', primary: '#93c5fd', secondary: '#312e81', accent: '#c4b5fd', rgb: '147,197,253', title: '#eff6ff', era: 'resonance', material: 'resonant-glass', density: 'clean', geometry: 'waves' },
  'guardian del sol muerto': { tier: 'rupture-dead-sun', emblem: 'SM', motif: 'dying-star', power: '5', primary: '#fca5a5', secondary: '#7c2d12', accent: '#78350f', rgb: '252,165,165', title: '#fff1f2', era: 'decay', material: 'carbon-solar', density: 'dense', geometry: 'solar-cracks' },
  'portador del juicio final': { tier: 'rupture-final-judgment', emblem: 'JF', motif: 'judgment-beam', power: '5', primary: '#f8fafc', secondary: '#475569', accent: '#f59e0b', rgb: '248,250,252', title: '#ffffff', era: 'sentence', material: 'verdict-glass', density: 'medium', geometry: 'monumental-vertical' },
  'rey de la corona eterna': { tier: 'rupture-eternal-crown', emblem: 'CE', motif: 'crowned-orbit', power: '5', primary: '#fef3c7', secondary: '#a16207', accent: '#c084fc', rgb: '254,243,199', title: '#fff7ed', era: 'regal-orbit', material: 'ceremonial-gold', density: 'clean', geometry: 'orbital-crown' },
  'emisario del vacio absoluto': { tier: 'rupture-absolute-void', emblem: 'VA', motif: 'absolute-absence', power: '5', primary: '#64748b', secondary: '#000000', accent: '#1e1b4b', rgb: '100,116,139', title: '#e2e8f0', era: 'absence', material: 'null-matter', density: 'minimal', geometry: 'negative-space' },
  'titan del eclipse carmesi': { tier: 'rupture-crimson-eclipse-titan', emblem: 'TC', motif: 'fractured-corona', power: '5', primary: '#ef4444', secondary: '#450a0a', accent: '#fb923c', rgb: '239,68,68', title: '#fee2e2', era: 'crimson-collapse', material: 'solar-obsidian', density: 'intense', geometry: 'heavy-ring' },
  'custodio del reino celestial': { tier: 'rupture-celestial-realm', emblem: 'RC', motif: 'celestial-architecture', power: '4', primary: '#f8fafc', secondary: '#bae6fd', accent: '#a78bfa', rgb: '248,250,252', title: '#ffffff', era: 'divine-tech', material: 'white-holo-stone', density: 'medium', geometry: 'floating-arches' },
  'senor de la ultima constelacion': { tier: 'rupture-last-constellation', emblem: 'UC', motif: 'living-star-map', power: '4', primary: '#bfdbfe', secondary: '#38bdf8', accent: '#fef3c7', rgb: '191,219,254', title: '#eff6ff', era: 'last-map', material: 'astral-ink', density: 'clean', geometry: 'ordered-stars' },
  'deidad de las sombras eternas': { tier: 'rupture-eternal-shadows', emblem: 'SE', motif: 'sentient-shadows', power: '5', primary: '#a78bfa', secondary: '#030712', accent: '#4c1d95', rgb: '167,139,250', title: '#ede9fe', era: 'sentient-dark', material: 'living-shadow', density: 'dense', geometry: 'warped-silhouette' },
  'emperador del horizonte infinito': { tier: 'rupture-infinite-horizon', emblem: 'HI', motif: 'endless-horizon', power: '5', primary: '#7dd3fc', secondary: '#0f172a', accent: '#94a3b8', rgb: '125,211,252', title: '#e0f2fe', era: 'distance', material: 'deep-atmosphere', density: 'minimal', geometry: 'perspective-lines' },
  'trascendente astral': { tier: 'rupture-astral-transcendent', emblem: 'XA', motif: 'astral-ascension', power: '4', primary: '#e0e7ff', secondary: '#818cf8', accent: '#67e8f9', rgb: '224,231,255', title: '#ffffff', era: 'ascendant', material: 'soft-radiance', density: 'clean', geometry: 'levitation' },
  'rey del fin eterno': { tier: 'rupture-eternal-end', emblem: 'FE', motif: 'frozen-ending', power: '5', primary: '#cbd5e1', secondary: '#111827', accent: '#64748b', rgb: '203,213,225', title: '#f8fafc', era: 'frozen-decay', material: 'spent-light', density: 'minimal', geometry: 'suspended-dust' },
  'heraldo del vacio primordial': { tier: 'rupture-primordial-void', emblem: 'VP', motif: 'ancient-void', power: '5', primary: '#8b5cf6', secondary: '#09090b', accent: '#292524', rgb: '139,92,246', title: '#f5f3ff', era: 'primordial', material: 'ancient-darkmatter', density: 'dense', geometry: 'primitive-distortion' },
  'arquitecto de la eternidad': { tier: 'rupture-eternity-architect', emblem: 'AR', motif: 'infinite-architecture', power: '5', primary: '#5eead4', secondary: '#334155', accent: '#f8fafc', rgb: '94,234,212', title: '#ccfbf1', era: 'impossible-structure', material: 'dimensional-blueprint', density: 'dense', geometry: 'impossible-grid' },
  'monarca del eclipse supremo': { tier: 'rupture-supreme-eclipse', emblem: 'ES', motif: 'perfect-eclipse', power: '5', primary: '#fde68a', secondary: '#050505', accent: '#a16207', rgb: '253,230,138', title: '#fff7ed', era: 'perfect-eclipse', material: 'black-gold-glass', density: 'clean', geometry: 'sealed-light' },
  'vigia del reino prohibido': { tier: 'rupture-forbidden-realm', emblem: 'RF', motif: 'forbidden-gate', power: '4', primary: '#34d399', secondary: '#0f172a', accent: '#a78bfa', rgb: '52,211,153', title: '#d1fae5', era: 'forbidden', material: 'sealed-hologram', density: 'medium', geometry: 'gate-symbols' },
  'portador de la ultima verdad': { tier: 'rupture-last-truth', emblem: 'UV', motif: 'infinite-data', power: '5', primary: '#ffffff', secondary: '#38bdf8', accent: '#22c55e', rgb: '255,255,255', title: '#ffffff', era: 'omniscience', material: 'data-glass', density: 'dense', geometry: 'intelligent-grid' },
  'devastador del infinito': { tier: 'rupture-infinity-breaker', emblem: 'DI', motif: 'universal-fracture', power: '5', primary: '#fb7185', secondary: '#7c2d12', accent: '#fef08a', rgb: '251,113,133', title: '#ffe4e6', era: 'fractured-totality', material: 'ruptured-space', density: 'intense', geometry: 'broken-field' },
  'senor del trono negro': { tier: 'rupture-black-throne', emblem: 'TN', motif: 'dark-authority', power: '5', primary: '#d1d5db', secondary: '#030712', accent: '#71717a', rgb: '209,213,219', title: '#f9fafb', era: 'dominion', material: 'royal-obsidian', density: 'medium', geometry: 'throne-form' },
  'custodio del horizonte final': { tier: 'rupture-final-horizon', emblem: 'HF', motif: 'terminal-horizon', power: '5', primary: '#94a3b8', secondary: '#020617', accent: '#f87171', rgb: '148,163,184', title: '#f1f5f9', era: 'terminal-limit', material: 'vanishing-atmosphere', density: 'minimal', geometry: 'collapsing-line' },
  'emperador de los mundos caidos': { tier: 'rupture-fallen-worlds', emblem: 'MC', motif: 'fallen-civilizations', power: '5', primary: '#fbbf24', secondary: '#78350f', accent: '#64748b', rgb: '251,191,36', title: '#fef3c7', era: 'ruined-empires', material: 'planetary-rubble', density: 'dense', geometry: 'orbital-debris' },
  'heredero del abismo supremo': { tier: 'rupture-supreme-abyss', emblem: 'AS', motif: 'inherited-abyss', power: '5', primary: '#60a5fa', secondary: '#020617', accent: '#312e81', rgb: '96,165,250', title: '#dbeafe', era: 'abyssal-lineage', material: 'layered-depth', density: 'clean', geometry: 'descending-core' },
  'soberano de ether prime': { tier: 'rupture-ether-prime', emblem: 'EP', motif: 'prime-ether', power: '5', primary: '#c084fc', secondary: '#2dd4bf', accent: '#f0abfc', rgb: '192,132,252', title: '#f3e8ff', era: 'prime-ether', material: 'refined-fluid', density: 'clean', geometry: 'laminar-flow' },
  'rey del vacio eterno': { tier: 'rupture-eternal-void-king', emblem: 'VE', motif: 'silent-void', power: '5', primary: '#475569', secondary: '#000000', accent: '#111827', rgb: '71,85,105', title: '#e2e8f0', era: 'silent-absolute', material: 'stable-null', density: 'minimal', geometry: 'radial-silence' },
  'guardian del ultimo eclipse': { tier: 'rupture-last-eclipse-guardian', emblem: 'UE', motif: 'terminal-eclipse', power: '5', primary: '#fb923c', secondary: '#1c1917', accent: '#fef3c7', rgb: '251,146,60', title: '#ffedd5', era: 'last-sun', material: 'dying-halo', density: 'medium', geometry: 'protected-ring' },
  'trascendente del ether oscuro': { tier: 'rupture-corrupt-ether', emblem: 'EO', motif: 'forbidden-ether', power: '5', primary: '#d8b4fe', secondary: '#581c87', accent: '#0f172a', rgb: '216,180,254', title: '#faf5ff', era: 'corrupt-fluid', material: 'violet-oil', density: 'clean', geometry: 'translucent-layers' },
  'monarca de la ruina celestial': { tier: 'rupture-celestial-ruin', emblem: 'CR', motif: 'shattered-heaven', power: '5', primary: '#e0f2fe', secondary: '#64748b', accent: '#fef3c7', rgb: '224,242,254', title: '#ffffff', era: 'broken-divinity', material: 'fractured-white-stone', density: 'dense', geometry: 'fallen-arches' },
  'deidad del horizonte negro': { tier: 'rupture-black-horizon', emblem: 'HN', motif: 'black-frontier', power: '5', primary: '#818cf8', secondary: '#020617', accent: '#334155', rgb: '129,140,248', title: '#eef2ff', era: 'dark-frontier', material: 'heavy-vacuum', density: 'minimal', geometry: 'black-boundary' },
  'emisario de la ultima era': { tier: 'rupture-last-era', emblem: 'LE', motif: 'terminal-civilization', power: '4', primary: '#fca5a5', secondary: '#334155', accent: '#fde68a', rgb: '252,165,165', title: '#fff1f2', era: 'terminal-culture', material: 'degraded-hologram', density: 'medium', geometry: 'eroded-overlay' },
  'portador del corazon astral': { tier: 'rupture-astral-heart', emblem: 'CA', motif: 'cosmic-heart', power: '5', primary: '#f0abfc', secondary: '#38bdf8', accent: '#fef3c7', rgb: '240,171,252', title: '#fae8ff', era: 'cosmic-core', material: 'living-core-glass', density: 'clean', geometry: 'heart-orbits' },
  'rey de las sombras primordiales': { tier: 'lawless-primordial-shadows', emblem: 'SP', motif: 'ancient-shadows', power: '5', primary: '#6b7280', secondary: '#020202', accent: '#3b0764', rgb: '107,114,128', title: '#f3f4f6', era: 'pre-law', material: 'ancestral-ink', density: 'dense', geometry: 'deformed-masses' },
  'custodio del trono eterno': { tier: 'lawless-eternal-throne', emblem: 'TE', motif: 'immortal-throne', power: '5', primary: '#d6d3d1', secondary: '#1c1917', accent: '#78716c', rgb: '214,211,209', title: '#fafaf9', era: 'imperial-stasis', material: 'silent-monument', density: 'minimal', geometry: 'infinite-columns' },
  'soberano del juicio carmesi': { tier: 'lawless-crimson-judgment', emblem: 'JC', motif: 'crimson-sentence', power: '5', primary: '#ef4444', secondary: '#7f1d1d', accent: '#fecaca', rgb: '239,68,68', title: '#fee2e2', era: 'condemnation', material: 'compressed-verdict', density: 'intense', geometry: 'descending-law' },
  'arquitecto del reino absoluto': { tier: 'lawless-absolute-realm', emblem: 'RA', motif: 'universal-build', power: '5', primary: '#99f6e4', secondary: '#155e75', accent: '#e2e8f0', rgb: '153,246,228', title: '#ccfbf1', era: 'perfect-system', material: 'axiom-glass', density: 'dense', geometry: 'axiom-grid' },
  'emperador del vacio infinito': { tier: 'lawless-infinite-void', emblem: 'VI', motif: 'expansive-void', power: '5', primary: '#64748b', secondary: '#000000', accent: '#1e293b', rgb: '100,116,139', title: '#e2e8f0', era: 'aware-absence', material: 'endless-null', density: 'minimal', geometry: 'infinite-shells' },
  'vigia de los dioses caidos': { tier: 'lawless-fallen-gods', emblem: 'DC', motif: 'fallen-divinity', power: '5', primary: '#fde68a', secondary: '#57534e', accent: '#cbd5e1', rgb: '253,230,138', title: '#fff7ed', era: 'ruined-divine', material: 'broken-idol-stone', density: 'medium', geometry: 'suspended-idols' },
  'portador del horizonte absoluto': { tier: 'lawless-absolute-horizon', emblem: 'HA', motif: 'infinite-frontier', power: '5', primary: '#bae6fd', secondary: '#0f172a', accent: '#475569', rgb: '186,230,253', title: '#f0f9ff', era: 'last-frontier', material: 'cinematic-depth', density: 'minimal', geometry: 'vanishing-perspective' },
  'monarca del ultimo reino': { tier: 'lawless-last-kingdom', emblem: 'UR', motif: 'final-empire', power: '5', primary: '#f5f5f4', secondary: '#44403c', accent: '#d6bd77', rgb: '245,245,244', title: '#ffffff', era: 'terminal-royalty', material: 'monumental-ash', density: 'medium', geometry: 'floating-citadels' },
  'heraldo de la eternidad carmesi': { tier: 'lawless-crimson-eternity', emblem: 'EC', motif: 'red-eternity', power: '5', primary: '#fb7185', secondary: '#4c0519', accent: '#fda4af', rgb: '251,113,133', title: '#ffe4e6', era: 'corrupt-time', material: 'temporal-crimson', density: 'clean', geometry: 'time-strata' },
  'devorador de estrellas eternas': { tier: 'lawless-star-devourer', emblem: 'DE', motif: 'stellar-consumption', power: '5', primary: '#fef08a', secondary: '#020617', accent: '#fb7185', rgb: '254,240,138', title: '#fefce8', era: 'star-hunger', material: 'collapsed-light', density: 'dense', geometry: 'stellar-maw' },
  'custodio del trono del fin': { tier: 'lawless-end-throne', emblem: 'TF', motif: 'terminal-throne', power: '5', primary: '#a8a29e', secondary: '#0c0a09', accent: '#57534e', rgb: '168,162,158', title: '#e7e5e4', era: 'last-guard', material: 'extinguished-stone', density: 'minimal', geometry: 'closing-seat' },
  'rey de umbra eterna': { tier: 'lawless-eternal-umbra', emblem: 'UE', motif: 'infinite-umbra', power: '5', primary: '#a78bfa', secondary: '#020202', accent: '#312e81', rgb: '167,139,250', title: '#ede9fe', era: 'umbra-realm', material: 'fluid-black', density: 'clean', geometry: 'shadow-flow' },
  'trascendente del eclipse infinito': { tier: 'lawless-infinite-eclipse', emblem: 'EX', motif: 'warped-eclipse', power: '5', primary: '#fef3c7', secondary: '#111827', accent: '#8b5cf6', rgb: '254,243,199', title: '#fff7ed', era: 'transcendent-eclipse', material: 'bent-light', density: 'medium', geometry: 'distorted-orbit' },
  'emperador del vacio celestial': { tier: 'lawless-celestial-void', emblem: 'VC', motif: 'divine-void', power: '5', primary: '#e0f2fe', secondary: '#020617', accent: '#f8fafc', rgb: '224,242,254', title: '#ffffff', era: 'holy-absence', material: 'luminous-null', density: 'clean', geometry: 'soft-absorption' },
  'senor de los ecos del fin': { tier: 'lawless-end-echoes', emblem: 'EF', motif: 'terminal-echo', power: '5', primary: '#cbd5e1', secondary: '#334155', accent: '#7dd3fc', rgb: '203,213,225', title: '#f8fafc', era: 'last-resonance', material: 'decaying-soundglass', density: 'clean', geometry: 'fading-ripples' },
  'arquitecto de los mundos eternos': { tier: 'lawless-eternal-worlds', emblem: 'ME', motif: 'dimensional-creation', power: '5', primary: '#86efac', secondary: '#164e63', accent: '#e0f2fe', rgb: '134,239,172', title: '#dcfce7', era: 'world-forge', material: 'living-blueprint', density: 'dense', geometry: 'world-framework' },
  'deidad del abismo carmesi': { tier: 'lawless-crimson-abyss', emblem: 'AC', motif: 'red-abyss', power: '5', primary: '#f87171', secondary: '#450a0a', accent: '#c084fc', rgb: '248,113,113', title: '#fee2e2', era: 'sentient-chasm', material: 'deep-red-fluid', density: 'medium', geometry: 'liquid-descent' },
  'portador de la corona final': { tier: 'lawless-final-crown', emblem: 'CF', motif: 'last-crown', power: '5', primary: '#fde68a', secondary: '#292524', accent: '#f8fafc', rgb: '253,230,138', title: '#fff7ed', era: 'last-sovereign', material: 'crown-light', density: 'clean', geometry: 'suspended-diadem' },
  'vigia del infinito absoluto': { tier: 'lawless-absolute-infinity-watch', emblem: 'IA', motif: 'observed-infinity', power: '5', primary: '#93c5fd', secondary: '#020617', accent: '#64748b', rgb: '147,197,253', title: '#eff6ff', era: 'total-observer', material: 'perspective-silence', density: 'minimal', geometry: 'impossible-lines' },
  'monarca de la ultima ruina': { tier: 'lawless-last-ruin', emblem: 'LR', motif: 'terminal-ruin', power: '5', primary: '#d6d3d1', secondary: '#292524', accent: '#f59e0b', rgb: '214,211,209', title: '#fafaf9', era: 'final-remnant', material: 'refined-collapse', density: 'medium', geometry: 'slow-debris' },
  'heraldo del eclipse primordial': { tier: 'lawless-primordial-eclipse', emblem: 'EP', motif: 'first-eclipse', power: '5', primary: '#fbbf24', secondary: '#1c1917', accent: '#a78bfa', rgb: '251,191,36', title: '#fef3c7', era: 'first-shadow', material: 'primitive-corona', density: 'medium', geometry: 'uneven-crown' },
  'emperador de las estrellas muertas': { tier: 'lawless-dead-star-emperor', emblem: 'EM', motif: 'stellar-graveyard', power: '5', primary: '#cbd5e1', secondary: '#111827', accent: '#60a5fa', rgb: '203,213,225', title: '#f8fafc', era: 'cold-empire', material: 'cold-cinders', density: 'dense', geometry: 'dead-cores' },
  'rey del trono absoluto': { tier: 'lawless-absolute-throne', emblem: 'TA', motif: 'perfect-authority', power: '5', primary: '#f8fafc', secondary: '#18181b', accent: '#a1a1aa', rgb: '248,250,252', title: '#ffffff', era: 'perfect-rule', material: 'flawless-obsidian', density: 'minimal', geometry: 'pure-throne' },
  'guardian del vacio viviente': { tier: 'lawless-living-void-guardian', emblem: 'VV', motif: 'organic-void', power: '5', primary: '#7c3aed', secondary: '#020202', accent: '#34d399', rgb: '124,58,237', title: '#ede9fe', era: 'organic-null', material: 'reactive-darkmatter', density: 'medium', geometry: 'breathing-distortion' },
  'deidad de la eternidad negra': { tier: 'lawless-black-eternity', emblem: 'EN', motif: 'dark-eternity', power: '5', primary: '#94a3b8', secondary: '#000000', accent: '#1f2937', rgb: '148,163,184', title: '#f1f5f9', era: 'motionless-time', material: 'still-night', density: 'minimal', geometry: 'frozen-depth' },
  'soberano de los reinos perdidos': { tier: 'lawless-lost-realms', emblem: 'RP', motif: 'forgotten-realms', power: '5', primary: '#67e8f9', secondary: '#334155', accent: '#c4b5fd', rgb: '103,232,249', title: '#ecfeff', era: 'forgotten-empires', material: 'distant-hologram', density: 'medium', geometry: 'far-kingdoms' },
  'custodio del fin del tiempo': { tier: 'lawless-time-end', emblem: 'FT', motif: 'time-rupture', power: '5', primary: '#bfdbfe', secondary: '#312e81', accent: '#f8fafc', rgb: '191,219,254', title: '#eff6ff', era: 'last-instant', material: 'fractured-chronoglass', density: 'dense', geometry: 'temporal-splinters' },
  'portador de la corona del vacio': { tier: 'lawless-void-crown', emblem: 'CV', motif: 'empty-crown', power: '5', primary: '#a3a3a3', secondary: '#000000', accent: '#4c1d95', rgb: '163,163,163', title: '#f5f5f5', era: 'void-royalty', material: 'absorbing-regalia', density: 'minimal', geometry: 'crown-vacancy' },
  'arquitecto del eclipse eterno': { tier: 'lawless-eternal-eclipse-architect', emblem: 'EE', motif: 'eclipse-engine', power: '5', primary: '#fde68a', secondary: '#0f172a', accent: '#fb7185', rgb: '253,230,138', title: '#fff7ed', era: 'solar-design', material: 'orbital-solar-graph', density: 'dense', geometry: 'multi-eclipse' },
  'emisario de umbra infinita': { tier: 'lawless-infinite-umbra-emissary', emblem: 'UI', motif: 'living-infinite-umbra', power: '5', primary: '#c4b5fd', secondary: '#020202', accent: '#111827', rgb: '196,181,253', title: '#ede9fe', era: 'endless-umbra', material: 'advanced-shadow', density: 'clean', geometry: 'expanding-umbra' },
  'monarca del horizonte supremo': { tier: 'final-supreme-horizon', emblem: 'HS', motif: 'absolute-horizon', power: '5', primary: '#e0f2fe', secondary: '#020617', accent: '#94a3b8', rgb: '224,242,254', title: '#ffffff', era: 'endgame-frontier', material: 'limit-atmosphere', density: 'minimal', geometry: 'supreme-horizon' },
  'rey de la ultima dimension': { tier: 'final-last-dimension', emblem: 'UD', motif: 'collapsed-dimension', power: '5', primary: '#c4b5fd', secondary: '#172554', accent: '#67e8f9', rgb: '196,181,253', title: '#f5f3ff', era: 'last-dimension', material: 'folded-reality', density: 'dense', geometry: 'spatial-sheets' },
  'devorador del reino astral': { tier: 'final-astral-devourer', emblem: 'RA', motif: 'astral-consumption', power: '5', primary: '#fde68a', secondary: '#020617', accent: '#a78bfa', rgb: '253,230,138', title: '#fff7ed', era: 'astral-collapse', material: 'consumed-astral-light', density: 'medium', geometry: 'broken-constellations' },
  'heraldo de las sombras eternas': { tier: 'final-eternal-shadow-herald', emblem: 'SE', motif: 'conscious-shadows', power: '5', primary: '#a1a1aa', secondary: '#020202', accent: '#6d28d9', rgb: '161,161,170', title: '#fafafa', era: 'absolute-darkness', material: 'sentient-umbra', density: 'clean', geometry: 'giant-shadowforms' },
  'emperador del juicio final': { tier: 'final-judgment-emperor', emblem: 'EJ', motif: 'absolute-judgment', power: '5', primary: '#ffffff', secondary: '#1e293b', accent: '#f43f5e', rgb: '255,255,255', title: '#ffffff', era: 'final-verdict', material: 'monumental-light', density: 'medium', geometry: 'verdict-axis' },
  'titan del vacio primordial': { tier: 'final-primordial-void-titan', emblem: 'VP', motif: 'ultimate-primordial-void', power: '5', primary: '#8b5cf6', secondary: '#000000', accent: '#22d3ee', rgb: '139,92,246', title: '#f5f3ff', era: 'origin-null', material: 'living-origin-matter', density: 'dense', geometry: 'radial-origin' },
  'el ultimo ascendido': { tier: 'final-last-ascended', emblem: 'AX', motif: 'absolute-transcendence', power: '5', primary: '#ffffff', secondary: '#a78bfa', accent: '#e9d5ff', rgb: '255,255,255', title: '#ffffff', era: 'post-system', material: 'perfect-radiance', density: 'minimal', geometry: 'balanced-silence' },
}

const TEMAS_RANGO_AVANZADO = [
  {
    match: ['vacio', 'vac', 'umbra', 'sombras'],
    tier: 'advanced-void',
    motif: 'void',
    primary: '#8b5cf6',
    secondary: '#050816',
    accent: '#c084fc',
    rgb: '139,92,246',
    title: '#f3e8ff',
    era: 'void',
    material: 'obsidian',
    density: 'intense',
    geometry: 'gravity',
    glyphs: ['VX', 'UM', 'SV', 'VP'],
  },
  {
    match: ['astral', 'estrellas', 'constelacion', 'celestial', 'aurora'],
    tier: 'advanced-astral',
    motif: 'stars',
    primary: '#e0f2fe',
    secondary: '#38bdf8',
    accent: '#93c5fd',
    rgb: '224,242,254',
    title: '#ffffff',
    era: 'astral',
    material: 'space-glass',
    density: 'clean',
    geometry: 'constellation',
    glyphs: ['AR', 'ST', 'CE', 'AU'],
  },
  {
    match: ['carmesi', 'carmes', 'juicio', 'llama', 'cenizas'],
    tier: 'advanced-crimson',
    motif: 'flare',
    primary: '#fb7185',
    secondary: '#ef4444',
    accent: '#fbbf24',
    rgb: '251,113,133',
    title: '#ffe4e6',
    era: 'eclipse',
    material: 'plasma',
    density: 'dense',
    geometry: 'radial',
    glyphs: ['CR', 'JG', 'FL', 'CN'],
  },
  {
    match: ['eclipse', 'sol muerto'],
    tier: 'advanced-eclipse',
    motif: 'eclipse',
    primary: '#f8fafc',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    rgb: '248,250,252',
    title: '#ffffff',
    era: 'eclipse',
    material: 'solar-glass',
    density: 'medium',
    geometry: 'halo',
    glyphs: ['EC', 'SL', 'OR', 'NO'],
  },
  {
    match: ['ether', 'infinito', 'eternidad', 'eterno', 'absoluto'],
    tier: 'advanced-infinity',
    motif: 'infinity',
    primary: '#67e8f9',
    secondary: '#a78bfa',
    accent: '#f0abfc',
    rgb: '103,232,249',
    title: '#ecfeff',
    era: 'singularity',
    material: 'quantum-crystal',
    density: 'clean',
    geometry: 'core',
    glyphs: ['IN', 'ET', 'AE', 'OM'],
  },
  {
    match: ['abismo', 'ruina', 'ruinas', 'perdido', 'caidos', 'caid'],
    tier: 'advanced-abyss',
    motif: 'fracture',
    primary: '#22d3ee',
    secondary: '#0f172a',
    accent: '#64748b',
    rgb: '34,211,238',
    title: '#cffafe',
    era: 'fractal',
    material: 'dark-matter',
    density: 'dense',
    geometry: 'cracks',
    glyphs: ['AB', 'RN', 'CX', 'FD'],
  },
  {
    match: ['trono', 'corona', 'reino', 'rey', 'senor', 'monarca', 'soberano', 'emperador'],
    tier: 'advanced-crown',
    motif: 'crown',
    primary: '#fef08a',
    secondary: '#f59e0b',
    accent: '#f472b6',
    rgb: '254,240,138',
    title: '#fff7ed',
    era: 'fractal',
    material: 'prismatic-gold',
    density: 'intense',
    geometry: 'triangles',
    glyphs: ['KR', 'TR', 'RG', 'MN'],
  },
  {
    match: ['profeta', 'heraldo', 'emisario', 'portador', 'vigia', 'viga', 'guardian', 'guardi', 'custodio', 'heredero'],
    tier: 'advanced-oracle',
    motif: 'sigil',
    primary: '#34d399',
    secondary: '#06b6d4',
    accent: '#fef3c7',
    rgb: '52,211,153',
    title: '#d1fae5',
    era: 'quantum',
    material: 'holographic-titanium',
    density: 'medium',
    geometry: 'sigil',
    glyphs: ['SG', 'HR', 'PT', 'VG'],
  },
  {
    match: ['devorador', 'devastador', 'tiran', 'titan', 'conquistador'],
    tier: 'advanced-war',
    motif: 'blade',
    primary: '#f97316',
    secondary: '#dc2626',
    accent: '#fde047',
    rgb: '249,115,22',
    title: '#ffedd5',
    era: 'eclipse',
    material: 'liquid-metal',
    density: 'dense',
    geometry: 'fragmented',
    glyphs: ['WR', 'DV', 'TX', 'CQ'],
  },
]

let rutaDragInstalado = false

function formatearTiempo(segundos) {
  if (typeof segundos !== 'number' || Number.isNaN(segundos)) return '-'
  const minutos = Math.floor(segundos / 60)
  const seg = segundos % 60
  return `${minutos}:${seg < 10 ? '0' : ''}${seg}`
}

function inicialesUsuario(valor) {
  const limpio = String(valor || 'J').trim()
  return limpio.slice(0, 2).toUpperCase()
}

function normalizarTextoVisual(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatearNumero(valor) {
  return new Intl.NumberFormat('es-CO').format(Math.max(0, Math.trunc(Number(valor) || 0)))
}

function leerRangoEquipado(usuarioId) {
  if (!usuarioId) return 'Novato'
  return leerRangoEquipadoBonus(usuarioId).titulo || 'Novato'
}

function guardarRangoEquipado(usuarioId, rango) {
  if (!usuarioId) return
  guardarRangoEquipadoBonus(usuarioId, rango)
  guardarRangoEquipadoRemotoBonus(usuarioId, rango)
}

async function aplicarPersonalizacionPerfil() {
  if (!usuario) return
  const version = ++refrescoPersonalizacionPerfil
  const objetivos = [perfilHeroEl, progresoPerfilEl].filter(Boolean)
  await Promise.all(objetivos.map((elemento) => aplicarPersonalizacionUsuario(elemento, usuario)))
  if (version !== refrescoPersonalizacionPerfil) return
}

async function cargarRecompensasCosmeticasRuta(usuarioId, nivelActual = 1) {
  if (!usuarioId) return []

  const { data, error } = await supabase
    .from('recompensas_desbloqueadas')
    .select('nivel,recompensa_id,tipo,valor,fecha')
    .eq('usuario_id', usuarioId)
    .order('nivel', { ascending: true })

  if (error) {
    console.warn('No se pudieron cargar cosmeticos desbloqueados por ruta', error)
  }

  const desbloqueadas = error ? [] : (data || [])
  const recompensasPorNivel = await obtenerRecompensasHastaNivel(nivelActual)
  const recompensasDeRango = crearRecompensasFondoPorRango(nivelActual)
  const combinadas = [...desbloqueadas, ...recompensasPorNivel, ...recompensasDeRango]
  const vistas = new Set()

  return combinadas
    .filter((recompensa) => {
      const key = `${recompensa.nivel}:${recompensa.tipo}:${recompensa.valor}`
      if (vistas.has(key)) return false
      vistas.add(key)
      return true
    })
    .map((recompensa) => {
      const cosmetico = resolverCosmeticoRuta(recompensa)
      return cosmetico ? { ...recompensa, cosmetico } : null
    })
    .filter(Boolean)
}

function crearRecompensasFondoPorRango(nivelActual = 1) {
  return obtenerRangosHastaNivel(nivelActual)
    .map((rango) => {
      const cosmetico = obtenerFondoCosmeticoRango(rango)
      if (!cosmetico) return null
      return {
        nivel: rango.desde,
        recompensa_id: null,
        tipo: 'fondo',
        valor: cosmetico.id,
        origen: 'rango',
        key: `${RECOMPENSA_RANGO_FONDO_PREFIX}:${rango.desde}:${cosmetico.id}`,
      }
    })
    .filter(Boolean)
}

function obtenerFondoCosmeticoRango(rango) {
  const indice = obtenerRangosDesdeNivel(1)
    .findIndex((item) => normalizarTextoVisual(item.titulo) === normalizarTextoVisual(rango?.titulo))
  const numero = ((Math.max(0, indice) % 100) + 1)
  return COSMETICOS.find((item) => item.id === `fondo_${String(numero).padStart(3, '0')}`)
}

function resolverCosmeticoRuta(recompensa) {
  const tipo = normalizarTextoVisual(recompensa?.tipo)
  const valor = String(recompensa?.valor || '').trim()
  const porId = COSMETICOS.find((item) => item.id === valor)
  if (porId) return porId

  const tipoDirecto = ['fondo', 'id', 'marco'].includes(tipo) ? tipo : null
  if (tipoDirecto) {
    const porNombre = COSMETICOS.find((item) => item.tipo === tipoDirecto && normalizarTextoVisual(item.nombre) === normalizarTextoVisual(valor))
    if (porNombre) return porNombre
    return COSMETICOS.find((item) => item.id === `${tipoDirecto}_${numeroCosmeticoRuta(recompensa?.nivel)}`)
  }

  if (tipo === 'estilo') return COSMETICOS.find((item) => item.id === `marco_${numeroCosmeticoRuta(recompensa?.nivel)}`)
  if (tipo === 'medalla' || tipo === 'logro') return COSMETICOS.find((item) => item.id === `id_${numeroCosmeticoRuta(recompensa?.nivel)}`)
  return null
}

function numeroCosmeticoRuta(nivel) {
  const numero = ((Math.max(1, Math.trunc(Number(nivel) || 1)) - 1) % 100) + 1
  return String(numero).padStart(3, '0')
}

function obtenerCosmeticosDelRango(rango) {
  return recompensasCosmeticasRuta
    .filter((item) => item.nivel >= rango.desde && item.nivel <= rango.hasta)
    .sort((a, b) => prioridadCosmeticoRuta(a) - prioridadCosmeticoRuta(b))
    .filter((item, index, lista) => lista.findIndex((otro) => otro.cosmetico.id === item.cosmetico.id) === index)
}

function prioridadCosmeticoRuta(item) {
  if (item?.cosmetico?.tipo === 'fondo') return 0
  if (item?.cosmetico?.tipo === 'marco') return 1
  if (item?.cosmetico?.tipo === 'id') return 2
  return 3
}

function obtenerRecompensaCosmeticaDisponible(cosmeticoId) {
  const directa = recompensasCosmeticasRuta.find((item) => item.cosmetico.id === cosmeticoId)
  if (directa) return directa

  const nivel = progresoNivelActual?.nivel || 1
  const rango = obtenerRangosHastaNivel(nivel)
    .find((item) => obtenerFondoCosmeticoRango(item)?.id === cosmeticoId)
  if (!rango) return null

  const cosmetico = obtenerFondoCosmeticoRango(rango)
  return {
    nivel: rango.desde,
    recompensa_id: null,
    tipo: 'fondo',
    valor: cosmetico.id,
    origen: 'rango',
    cosmetico,
  }
}

async function equiparFondoDeRango(rango, action = 'equip') {
  if (!usuario) return { ok: false, error: 'Usuario invalido' }

  if (action === 'unequip') {
    const resultado = await desequiparCosmetico(usuario, 'fondo')
    if (resultado?.ok) fondoEquipadoActual = null
    return resultado
  }

  const fondo = obtenerFondoCosmeticoRango(rango)
  if (!fondo) return { ok: false, error: 'Fondo de rango no disponible' }

  const resultado = await equiparCosmetico(usuario, fondo.id)
  if (resultado?.ok) fondoEquipadoActual = resultado.cosmetico
  return resultado
}

function rangoEstaDesbloqueado(rango, nivel) {
  return Boolean(rango?.desde && rango.desde <= (Number(nivel) || 1))
}

function aplicarRangoEquipado(titulo) {
  rangoEquipadoActual = titulo || 'Novato'
  if (perfilTituloRangoEl) perfilTituloRangoEl.innerText = rangoEquipadoActual
  if (rangoEquipadoTextoEl) rangoEquipadoTextoEl.innerText = `Equipado: ${rangoEquipadoActual}`
  aplicarVisualRangoActual(rangoEquipadoActual)
  actualizarBonusRangoPerfil()
}

function hashTextoVisual(valor) {
  return [...String(valor || '')].reduce((total, char) => ((total << 5) - total + char.charCodeAt(0)) | 0, 0)
}

function obtenerTemaAvanzado(clave) {
  return TEMAS_RANGO_AVANZADO.find((tema) => tema.match.some((fragmento) => clave.includes(fragmento)))
    || TEMAS_RANGO_AVANZADO[Math.abs(hashTextoVisual(clave)) % TEMAS_RANGO_AVANZADO.length]
}

function obtenerInicialesRango(clave) {
  const partes = clave.split(/\s+/).filter(Boolean)
  return partes.length
    ? partes.slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()
    : 'RX'
}

function obtenerVisualRango(titulo) {
  const clave = normalizarTextoVisual(titulo)
  const visual = RANGOS_VISUALES[clave]

  if (visual) return visual

  const tema = obtenerTemaAvanzado(clave)
  const firma = Math.abs(hashTextoVisual(clave))
  const poder = 1 + (firma % 5)
  const glyph = tema.glyphs[firma % tema.glyphs.length] || obtenerInicialesRango(clave)

  return {
    tier: tema.tier,
    emblem: glyph,
    motif: tema.motif,
    power: String(poder),
    primary: tema.primary,
    secondary: tema.secondary,
    accent: tema.accent,
    rgb: tema.rgb,
    title: tema.title,
    era: tema.era,
    material: tema.material,
    density: tema.density,
    geometry: tema.geometry,
  }
}

function aplicarVisualRangoActual(titulo) {
  const visual = obtenerVisualRango(titulo)
  const poder = Number(visual.power || 1)

  document.body.dataset.rankTier = visual.tier
  document.body.dataset.rankMotif = visual.motif || 'core'
  document.body.dataset.rankEra = visual.era || 'core'
  document.body.dataset.rankMaterial = visual.material || 'dark-glass'
  document.body.dataset.rankPower = visual.power || '1'
  if (perfilHeroEl) perfilHeroEl.dataset.rankTier = visual.tier
  if (perfilHeroEl) perfilHeroEl.dataset.rankMotif = visual.motif || 'core'
  if (perfilHeroEl) perfilHeroEl.dataset.rankEra = visual.era || 'core'
  if (perfilHeroEl) perfilHeroEl.dataset.rankMaterial = visual.material || 'dark-glass'
  if (perfilAvatarEl) perfilAvatarEl.dataset.rankEmblem = visual.emblem
  if (perfilTituloRangoEl) perfilTituloRangoEl.dataset.rankEmblem = visual.emblem

  const rootVars = {
    '--rank-primary': visual.primary,
    '--rank-secondary': visual.secondary,
    '--rank-accent': visual.accent,
    '--rank-rgb': visual.rgb,
    '--rank-title': visual.title,
    '--rank-power': visual.power,
    '--rank-glow-boost': visual.power ? `${poder * 8}px` : '',
    '--rank-border': visual.rgb ? `rgba(${visual.rgb},${0.42 + (poder * 0.04)})` : '',
    '--rank-glow': visual.rgb ? `rgba(${visual.rgb},${0.26 + (poder * 0.035)})` : '',
    '--rank-glow-soft': visual.rgb ? `rgba(${visual.rgb},${0.13 + (poder * 0.02)})` : '',
  }

  Object.entries(rootVars).forEach(([name, value]) => {
    if (value) document.body.style.setProperty(name, value)
    else document.body.style.removeProperty(name)
  })
}

function renderPill(el, label, value) {
  if (!el) return

  el.innerHTML = `
    <span>
      <span class="pill-label">${escaparHtml(label)}</span>
      <span class="pill-value">${escaparHtml(value)}</span>
    </span>
  `
}

function crearRangoGuardable(rango, rangos) {
  const lista = Array.isArray(rangos) && rangos.length ? rangos : obtenerRangosDesdeNivel(1)
  const index = Math.max(0, lista.findIndex((item) => normalizarTextoVisual(item.titulo) === normalizarTextoVisual(rango?.titulo)))
  return {
    titulo: rango?.titulo || 'Novato',
    desde: rango?.desde || 1,
    hasta: rango?.hasta || rango?.desde || 25,
    indice: index,
    totalRangos: lista.length || 1,
  }
}

function actualizarBonusRangoPerfil(rango = null, rangos = null) {
  const lista = Array.isArray(rangos) && rangos.length ? rangos : obtenerRangosDesdeNivel(1)
  const base = rango || lista.find((item) => normalizarTextoVisual(item.titulo) === normalizarTextoVisual(rangoEquipadoActual)) || lista[0]
  const bonus = calcularBonusRango(crearRangoGuardable(base, lista), lista.length)
  const progresoBonus = Math.round((bonus.progreso || 0) * 100)

  renderPill(pillBonusExpEl, 'Bonus EXP', bonus.expTexto)
  renderPill(pillBonusMonedasEl, 'Bonus monedas', bonus.monedasTexto)
  if (rangoBonusExpEl) rangoBonusExpEl.innerText = bonus.expTexto
  if (rangoBonusMonedasEl) rangoBonusMonedasEl.innerText = bonus.monedasTexto
  if (rangoBonusCategoriaEl) rangoBonusCategoriaEl.innerText = `${bonus.etiqueta} - ${bonus.titulo}`
  if (rangoBonusBarraEl) rangoBonusBarraEl.style.width = `${progresoBonus}%`
}

function obtenerRangoVisual(nivelActual) {
  const nivel = Math.min(NIVEL_MAXIMO, Math.max(1, Math.trunc(Number(nivelActual) || 1)))
  const titulo = obtenerTituloNivel(nivel)
  let desde = nivel
  let hasta = nivel

  while (desde > 1 && obtenerTituloNivel(desde - 1) === titulo) desde -= 1
  while (hasta < NIVEL_MAXIMO && obtenerTituloNivel(hasta + 1) === titulo) hasta += 1

  return { desde, hasta, titulo }
}

function obtenerSiguientesRangos(nivelActual, cantidad = Infinity) {
  const rangos = []
  let cursor = Math.max(1, Math.trunc(Number(nivelActual) || 1))

  while (cursor <= NIVEL_MAXIMO && rangos.length < cantidad) {
    const rango = obtenerRangoVisual(cursor)
    rangos.push(rango)
    cursor = rango.hasta + 1
  }

  return rangos
}

function renderRutaRangos(progreso) {
  if (!rangoRutaListEl) return

  const nivel = progreso?.nivel || 1
  const rangos = obtenerRangosDesdeNivel(1)
  const siguiente = obtenerRangosDesdeNivel(nivel + 1).find((rango) => rango.desde > nivel)

  rangoRutaListEl.innerHTML = rangos.map((rango, index) => {
    const desbloqueado = rangoEstaDesbloqueado(rango, nivel)
    const esActual = nivel >= rango.desde && nivel <= rango.hasta
    const equipado = normalizarTextoVisual(rango.titulo) === normalizarTextoVisual(rangoEquipadoActual)
    const progresoRango = calcularProgresoHaciaRango(progreso, rango)
    const estado = equipado ? 'Equipado' : esActual ? 'Rango actual' : desbloqueado ? 'Desbloqueado' : 'Bloqueado'
    const clase = `${esActual ? 'current' : ''} ${desbloqueado ? 'unlocked' : 'locked'} ${equipado ? 'equipped' : ''}`.trim()
    const visual = obtenerVisualRango(rango.titulo)
    const bonus = calcularBonusRango(crearRangoGuardable(rango, rangos), rangos.length)
    const cosmeticosRuta = obtenerCosmeticosDelRango(rango)
    const rangoTexto = rango.desde === rango.hasta
      ? `Nivel ${rango.desde}`
      : `Nivel ${rango.desde}-${rango.hasta}`
    const boton = equipado
      ? `<button class="rank-equip-btn secondary" type="button" data-rank-action="unequip" data-rank-title="${escaparHtml(rango.titulo)}">Desequipar</button>`
      : desbloqueado
        ? `<button class="rank-equip-btn" type="button" data-rank-action="equip" data-rank-title="${escaparHtml(rango.titulo)}">Equipar</button>`
        : `<button class="rank-equip-btn secondary" type="button" disabled>Bloqueado</button>`
    const recompensasHtml = cosmeticosRuta.length
      ? `<div class="rank-node-cosmetics">
          ${cosmeticosRuta.slice(0, 2).map((item) => `
            <button class="rank-cosmetic-btn" type="button" data-cosmetic-action="${cosmeticoEstaEquipado(item.cosmetico) ? 'unequip' : 'equip'}" data-cosmetic-reward="${escaparHtml(item.cosmetico.id)}" ${desbloqueado ? '' : 'disabled'}>
              ${escaparHtml(etiquetaBotonCosmeticoRuta(item.cosmetico))}
            </button>
          `).join('')}
          ${cosmeticosRuta.length > 2 ? `<span class="rank-cosmetic-more">+${cosmeticosRuta.length - 2} mas</span>` : ''}
        </div>`
      : ''

    return `
      <div class="rank-node ${clase}" data-rank-tier="${visual.tier}" data-rank-motif="${visual.motif || 'core'}" data-rank-era="${visual.era || 'core'}" data-rank-material="${visual.material || 'dark-glass'}" data-rank-density="${visual.density || 'medium'}" data-rank-geometry="${visual.geometry || 'layered'}" data-rank-power="${visual.power || '1'}" style="${estiloVisualRango(visual)}">
        <div class="rank-node-head">
          <span class="rank-node-emblem">${escaparHtml(visual.emblem)}</span>
          <span class="rank-node-level">${rangoTexto}</span>
        </div>
        <span class="rank-node-name">${escaparHtml(rango.titulo)}</span>
        <span class="rank-node-requirement">${desbloqueado ? `Requisito: nivel ${rango.desde}` : `Faltan ${formatearNumero(progresoRango.faltante)} XP`}</span>
        <span class="rank-node-bonus">EXP ${bonus.expTexto} · Monedas ${bonus.monedasTexto}</span>
        <span class="rank-node-progress"><span style="width:${progresoRango.porcentaje}%"></span></span>
        <span class="rank-node-state">${estado}</span>
        ${recompensasHtml}
        ${boton}
      </div>
    `
  }).join('')

  instalarDragRutaRangos()
  instalarEventosRangos()

  const nodoActual = rangoRutaListEl.querySelector('.rank-node.equipped') || rangoRutaListEl.querySelector('.rank-node.current')
  if (nodoActual) {
    requestAnimationFrame(() => {
      nodoActual.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }

  if (!rangoProgresoTextoEl) return

  if (!siguiente || nivel >= NIVEL_MAXIMO) {
    rangoProgresoTextoEl.innerText = 'Rango maximo alcanzado'
    return
  }

  const restantes = Math.max(0, siguiente.desde - nivel)
  const avanceSiguiente = calcularProgresoHaciaRango(progreso, siguiente)
  rangoProgresoTextoEl.innerText = `${restantes} niveles y ${formatearNumero(avanceSiguiente.faltante)} XP para ${siguiente.titulo}`
}

function cosmeticoEstaEquipado(cosmetico) {
  return Boolean(cosmetico?.tipo === 'fondo' && fondoEquipadoActual?.cosmetico_id === cosmetico.id)
}

function etiquetaBotonCosmeticoRuta(cosmetico) {
  if (cosmeticoEstaEquipado(cosmetico)) return `Desequipar ${cosmetico.tipo}`
  return `${cosmetico.tipo} · ${cosmetico.nombre}`
}

function instalarEventosRangos() {
  if (!rangoRutaListEl) return
  rangoRutaListEl.querySelectorAll('[data-rank-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!usuario || !progresoNivelActual) return
      const action = button.dataset.rankAction
      const titulo = action === 'unequip' ? 'Novato' : button.dataset.rankTitle
      const rangosTodos = obtenerRangosDesdeNivel(1)
      const rango = obtenerRangosHastaNivel(progresoNivelActual.nivel)
        .find((item) => normalizarTextoVisual(item.titulo) === normalizarTextoVisual(titulo))

      if (action === 'equip' && !rangoEstaDesbloqueado(rango, progresoNivelActual.nivel)) return

      const rangoFinal = rango || rangosTodos[0]
      button.disabled = true
      button.textContent = action === 'unequip' ? 'Desequipando...' : 'Equipando...'
      const resultado = await equiparFondoDeRango(rangoFinal, action)
      if (!resultado?.ok) {
        console.warn('No se pudo equipar fondo desde ruta de rangos', resultado?.error)
        button.disabled = false
        button.textContent = action === 'unequip' ? 'Desequipar' : 'Reintentar'
        return
      }
      guardarRangoEquipado(usuario, crearRangoGuardable(rangoFinal, rangosTodos))
      aplicarRangoEquipado(rangoFinal.titulo)
      actualizarBonusRangoPerfil(rangoFinal, rangosTodos)
      if (resultado.sincronizado === false) console.warn('Fondo aplicado localmente, pero Supabase no confirmo la sincronizacion.')
      renderRutaRangos(progresoNivelActual)
      await aplicarPersonalizacionPerfil()
    })
  })

  rangoRutaListEl.querySelectorAll('[data-cosmetic-reward]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!usuario || button.disabled) return
      const cosmeticoId = button.dataset.cosmeticReward
      const action = button.dataset.cosmeticAction || 'equip'
      const recompensa = obtenerRecompensaCosmeticaDisponible(cosmeticoId)
      if (!recompensa || !rangoEstaDesbloqueado(obtenerRangoVisual(recompensa.nivel), progresoNivelActual?.nivel)) return

      button.disabled = true
      button.textContent = action === 'unequip' ? 'Desequipando...' : 'Equipando...'
      const resultado = action === 'unequip'
        ? await desequiparCosmetico(usuario, recompensa.cosmetico.tipo)
        : await equiparCosmetico(usuario, cosmeticoId)
      if (resultado?.ok) {
        if (recompensa.cosmetico.tipo === 'fondo') {
          fondoEquipadoActual = action === 'unequip' ? null : resultado.cosmetico
        }
        if (resultado.sincronizado === false) console.warn('Cosmetico aplicado localmente, pero Supabase no confirmo la sincronizacion.')
        renderRutaRangos(progresoNivelActual)
        await aplicarPersonalizacionPerfil()
      } else {
        console.warn('No se pudo equipar cosmetico de ruta', resultado?.error)
        button.disabled = false
        button.textContent = 'Reintentar'
      }
    })
  })
}

function estiloVisualRango(visual) {
  const poder = Number(visual.power || 1)
  const vars = {
    '--node-primary': visual.primary,
    '--node-secondary': visual.secondary,
    '--node-accent': visual.accent,
    '--node-rgb': visual.rgb,
    '--node-power': visual.power,
    '--node-border-alpha': visual.power ? String(0.32 + (poder * 0.035)) : '',
    '--node-glow-boost': visual.power ? `${poder * 4}px` : '',
    '--node-glow-boost-lg': visual.power ? `${poder * 7}px` : '',
    '--node-density': visual.density === 'minimal' ? '0.55' : visual.density === 'clean' ? '0.72' : visual.density === 'dense' ? '1.16' : visual.density === 'intense' ? '1.34' : '0.94',
  }

  return Object.entries(vars)
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
}

function instalarDragRutaRangos() {
  if (!rangoRutaListEl || rutaDragInstalado) return

  rutaDragInstalado = true
  rangoRutaListEl.tabIndex = 0
  rangoRutaListEl.setAttribute('role', 'region')
  rangoRutaListEl.setAttribute('aria-label', 'Ruta de rangos')

  let activo = false
  let inicioX = 0
  let scrollInicial = 0
  let ultimoX = 0
  let ultimaMarca = 0
  let velocidad = 0
  let raf = null
  let tecladoRaf = null
  let tecladoDelta = 0
  let tecladoTimeout = null

  const detenerInercia = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = null
  }

  const finalizarDesplazamientoTeclado = () => {
    rangoRutaListEl.classList.remove('keyboard-scrolling')
    tecladoTimeout = null
  }

  const prepararDesplazamientoTeclado = () => {
    rangoRutaListEl.classList.add('keyboard-scrolling')
    if (tecladoTimeout) clearTimeout(tecladoTimeout)
    tecladoTimeout = setTimeout(finalizarDesplazamientoTeclado, 130)
  }

  const aplicarDesplazamientoTeclado = () => {
    rangoRutaListEl.scrollLeft += tecladoDelta
    tecladoDelta = 0
    tecladoRaf = null
  }

  const desplazarConTeclado = (delta) => {
    detenerInercia()
    prepararDesplazamientoTeclado()
    tecladoDelta += delta

    if (!tecladoRaf) {
      tecladoRaf = requestAnimationFrame(aplicarDesplazamientoTeclado)
    }
  }

  const animarInercia = () => {
    if (Math.abs(velocidad) < 0.08) {
      raf = null
      return
    }

    rangoRutaListEl.scrollLeft -= velocidad * 16
    velocidad *= 0.92
    raf = requestAnimationFrame(animarInercia)
  }

  rangoRutaListEl.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') return
    if (event.button !== undefined && event.button !== 0) return
    if (event.target.closest('button, a, input, select, textarea, [role="button"]')) return
    activo = true
    inicioX = event.clientX
    scrollInicial = rangoRutaListEl.scrollLeft
    ultimoX = event.clientX
    ultimaMarca = performance.now()
    velocidad = 0
    detenerInercia()
    rangoRutaListEl.focus({ preventScroll: true })
    rangoRutaListEl.classList.add('dragging')
    rangoRutaListEl.setPointerCapture?.(event.pointerId)
  })

  rangoRutaListEl.addEventListener('pointermove', (event) => {
    if (!activo) return

    const ahora = performance.now()
    const dx = event.clientX - inicioX
    const dt = Math.max(16, ahora - ultimaMarca)
    velocidad = (event.clientX - ultimoX) / dt
    rangoRutaListEl.scrollLeft = scrollInicial - dx
    ultimoX = event.clientX
    ultimaMarca = ahora
    event.preventDefault()
  })

  const finalizarDrag = (event) => {
    if (!activo) return
    activo = false
    rangoRutaListEl.classList.remove('dragging')
    rangoRutaListEl.releasePointerCapture?.(event.pointerId)
    animarInercia()
  }

  rangoRutaListEl.addEventListener('pointerup', finalizarDrag)
  rangoRutaListEl.addEventListener('pointercancel', finalizarDrag)
  rangoRutaListEl.addEventListener('pointerleave', finalizarDrag)

  rangoRutaListEl.addEventListener('keydown', (event) => {
    const anchoPaso = Math.max(96, rangoRutaListEl.clientWidth * 0.34)
    const pasos = {
      ArrowRight: anchoPaso,
      ArrowLeft: -anchoPaso,
      PageDown: rangoRutaListEl.clientWidth * 0.82,
      PageUp: -rangoRutaListEl.clientWidth * 0.82,
      Home: -rangoRutaListEl.scrollWidth,
      End: rangoRutaListEl.scrollWidth,
    }

    if (!(event.key in pasos)) return

    event.preventDefault()
    desplazarConTeclado(pasos[event.key])
  })
}

function getEstado(result) {
  if (result.invalido) {
    return { label: 'Invalido', className: 'bad' }
  }

  if (result.sospechoso) {
    return { label: 'Sospechoso', className: 'warn' }
  }

  return { label: 'Valido', className: 'ok' }
}

async function obtenerRankingDeJuego(gameKey) {
  let query = supabase
    .from('ranking')
    .select('*')
    .eq('juego', gameKey)
    .order('tiempo', { ascending: true })

  let { data, error } = await query

  if ((!data || data.length === 0) && ['ajedrez', 'domino', 'damas'].includes(gameKey)) {
    const fallbackTable = {
      ajedrez: 'ranking_ajedrez',
      domino: 'ranking_domino',
      damas: 'ranking_damas',
    }[gameKey]

    const fallback = await supabase
      .from(fallbackTable)
      .select('*')
      .order('tiempo', { ascending: true })

    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error(`Error cargando ranking de ${gameKey}`, error)
  }

  return data || []
}

async function obtenerEstadisticasLogros() {
  if (!usuario) return {}

  const { data, error } = await supabase
    .from('estadisticas_logros')
    .select('*')
    .eq('usuario', usuario)

  if (error) {
    console.warn('No se pudieron cargar estadisticas de logros', error)
    return {}
  }

  return (data || []).reduce((acc, item) => {
    acc[item.juego] = item
    return acc
  }, {})
}

async function cargarPerfil() {
  if (!usuario) {
    nombreUsuarioEl.innerText = 'Sin sesion'
    if (perfilAvatarEl) perfilAvatarEl.innerText = '??'
    if (perfilTituloRangoEl) perfilTituloRangoEl.innerText = 'Sin rango'
    aplicarVisualRangoActual('Novato')
    renderPill(pillUsuarioEl, 'ID', '-')
    renderPill(pillPartidasEl, 'Partidas', '0')
    renderPill(pillMedallasEl, 'Medallas', '0')
    renderPill(pillNivelEl, 'Nivel', '1')
    perfilResumenEl.innerText = 'Todavia no hay un usuario activo en este navegador.'
    perfilEstadoEl.innerText = 'Primero entra a cualquier juego con tu apodo y codigo para construir tu perfil.'
    medallasListEl.innerHTML = '<div class="empty">Aun no hay medallas para mostrar.</div>'
    renderProgresoNivel()
    resultadosPerfil = []
    estadisticasLogros = {}
    renderLogrosJuegos()
    renderLogros()
    renderPanelMonedas()
    historialListEl.innerHTML = '<div class="empty">No hay historial disponible.</div>'
    return
  }

  nombreUsuarioEl.innerText = usuario
  if (perfilAvatarEl) perfilAvatarEl.innerText = inicialesUsuario(usuario)
  renderPill(pillUsuarioEl, 'ID', usuario)
  await aplicarPersonalizacionPerfil()
  await sincronizarMonedasUsuario(usuario)

  const { data: userData } = await supabase
    .from('usuarios')
    .select('usuario')
    .eq('usuario', usuario)
    .maybeSingle()

  const resultados = []
  estadisticasLogros = await obtenerEstadisticasLogros()

  for (const game of GAMES) {
    const ranking = await obtenerRankingDeJuego(game.key)
    const posicion = ranking.findIndex((item) => item.usuario === usuario)

    if (posicion !== -1) {
      resultados.push({
        ...ranking[posicion],
        juego: game.key,
        juegoLabel: game.label,
        posicion: posicion + 1,
        total: ranking.length,
      })
    }
  }

  resultados.sort((a, b) => {
    if (a.posicion !== b.posicion) return a.posicion - b.posicion
    return (a.tiempo || 9999) - (b.tiempo || 9999)
  })

  const oros = resultados.filter((item) => item.posicion === 1)
  const platas = resultados.filter((item) => item.posicion === 2)
  const bronces = resultados.filter((item) => item.posicion === 3)
  const podios = oros.length + platas.length + bronces.length
  const mejorPosicion = resultados.length ? Math.min(...resultados.map((item) => item.posicion)) : null

  statJuegosEl.innerText = String(resultados.length)
  statOrosEl.innerText = String(oros.length)
  statPodiosEl.innerText = String(podios)
  statMejorEl.innerText = mejorPosicion ? `#${mejorPosicion}` : '-'
  renderPill(pillPartidasEl, 'Partidas', String(resultados.length))
  renderPill(pillMedallasEl, 'Medallas', String(podios))

  perfilResumenEl.innerText = resultados.length
    ? `Tienes progreso registrado en ${resultados.length} juegos del torneo.`
    : 'Aun no tienes resultados guardados en el torneo.'

  perfilEstadoEl.innerText = userData
    ? 'Perfil activo y enlazado con tu usuario del torneo.'
    : 'No se encontro una ficha completa en la tabla de usuarios, pero si pudimos leer tus resultados.'

  renderMedallas(resultados)
  resultadosPerfil = resultados
  if (resultadosPerfil.length && !resultadosPerfil.some((item) => item.juego === juegoLogrosActivo)) {
    juegoLogrosActivo = resultadosPerfil[0].juego
  } else if (!GAMES.some((game) => game.key === juegoLogrosActivo)) {
    juegoLogrosActivo = GAMES[0].key
  }
  renderLogrosJuegos()
  renderLogros()
  renderPanelMonedas()
  renderHistorial(resultados)
  await sincronizarXpDeLogros()
  await renderProgresoNivel()
}

function renderPanelMonedas() {
  if (!rewardCoinsEl || !rewardSummaryEl || !rewardRecentEl) return

  if (!usuario) {
    rewardCoinsEl.innerText = '0'
    rewardSummaryEl.innerHTML = '<div class="coin-empty">Inicia sesion para ver tus monedas.</div>'
    rewardRecentEl.innerHTML = '<div class="coin-empty">Sin movimientos disponibles.</div>'
    return
  }

  const saldo = obtenerMonedas(usuario)
  const historial = obtenerHistorialMonedas(usuario)
  rewardCoinsEl.innerText = saldo.toLocaleString('es-CO')

  rewardSummaryEl.innerHTML = [
    { icon: 'TR', title: 'Torneo completado', value: `+${RECOMPENSAS_MONEDAS.torneo}`, detail: 'Base por participar y terminar' },
    { icon: 'MT', title: 'Minitorneo completado', value: `+${RECOMPENSAS_MONEDAS.minitorneo}`, detail: 'Base por sala finalizada' },
    { icon: 'NV', title: 'Nivel completado', value: `+${RECOMPENSAS_MONEDAS.nivel}`, detail: 'Solo primera finalizacion' },
  ].map((item) => `
    <div class="coin-rule-card">
      <span class="coin-rule-icon">${item.icon}</span>
      <div>
        <strong>${item.title}</strong>
        <small>${item.detail}</small>
      </div>
      <b>${item.value}</b>
    </div>
  `).join('')

  const bonus = [
    { pos: '1', value: RECOMPENSAS_MONEDAS.posicion[1], label: 'Campeon' },
    { pos: '2', value: RECOMPENSAS_MONEDAS.posicion[2], label: 'Finalista' },
    { pos: '3', value: RECOMPENSAS_MONEDAS.posicion[3], label: 'Podio' },
  ].map((item) => `
    <div class="coin-bonus-pill">
      <span>#${item.pos}</span>
      <strong>+${item.value}</strong>
      <small>${item.label}</small>
    </div>
  `).join('')

  const recientes = historial
    .filter((movimiento) => Number(movimiento.cantidad || 0) > 0)
    .slice(0, 3)

  rewardRecentEl.innerHTML = `
    <div class="coin-bonus-grid">${bonus}</div>
    ${recientes.length ? recientes.map((movimiento) => `
      <div class="coin-recent-row">
        <span>+${Number(movimiento.cantidad || 0).toLocaleString('es-CO')}</span>
        <div>
          <strong>${etiquetaMovimientoMonedas(movimiento)}</strong>
          <small>${fechaMovimientoMonedas(movimiento.fecha)}</small>
        </div>
      </div>
    `).join('') : '<div class="coin-empty">Aun no hay recompensas cobradas.</div>'}
  `
}

function etiquetaMovimientoMonedas(movimiento) {
  const detalle = movimiento?.detalle || {}
  if (detalle.motivo === 'nivel_completado') return `Nivel ${detalle.nivel || ''} completado`.trim()
  if (detalle.motivo === 'minitorneo_completado') return `Minitorneo${detalle.bonusPosicion ? ` + bonus #${detalle.posicion}` : ''}`
  if (detalle.motivo === 'torneo_completado') return `Torneo${detalle.bonusPosicion ? ` + bonus #${detalle.posicion}` : ''}`
  return 'Recompensa ganada'
}

function fechaMovimientoMonedas(fecha) {
  const date = Date.parse(fecha)
  if (!Number.isFinite(date)) return 'Movimiento reciente'
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

function renderMedallas(resultados) {
  medallasListEl.innerHTML = ''

  const medallas = []

  resultados.forEach((item) => {
    if (item.posicion === 1) {
      medallas.push({ title: `Campeon de ${item.juegoLabel}`, detail: `Primer lugar de ${item.total} jugadores`, className: 'gold', icon: '1' })
    } else if (item.posicion === 2) {
      medallas.push({ title: `Subcampeon de ${item.juegoLabel}`, detail: `Segundo lugar de ${item.total} jugadores`, className: 'silver', icon: '2' })
    } else if (item.posicion === 3) {
      medallas.push({ title: `Podio en ${item.juegoLabel}`, detail: `Tercer lugar de ${item.total} jugadores`, className: 'bronze', icon: '3' })
    }
  })

  if (medallas.length === 0) {
    medallasListEl.innerHTML = '<div class="empty">Todavia no hay medallas registradas.</div>'
    return
  }

  medallas.forEach((medal) => {
    const div = document.createElement('div')
    div.className = 'medal'
    div.innerHTML = `
      <div class="medal-icon ${medal.className}">${medal.icon}</div>
      <div>
        <strong>${medal.title}</strong>
        <br>
        <small>${medal.detail}</small>
      </div>
    `
    medallasListEl.appendChild(div)
  })
}

function renderLogrosJuegos() {
  logrosJuegosEl.innerHTML = ''

  GAMES.forEach((game) => {
    const resultado = resultadosPerfil.find((item) => item.juego === game.key)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `game-tab${game.key === juegoLogrosActivo ? ' active' : ''}`
    button.onclick = () => seleccionarJuegoLogros(game.key)
    button.innerHTML = `
      <span>${game.icon}</span>
      <span>${game.label}</span>
      ${resultado ? '<span class="history-state ok">OK</span>' : ''}
    `
    logrosJuegosEl.appendChild(button)
  })
}

function crearLogrosDeJuego(game, resultado) {
  if (game.key === 'sudoku') {
    return crearLogrosSudoku(estadisticasLogros.sudoku || {})
  }

  if (game.key === 'memoria') {
    return crearLogrosMemoria(estadisticasLogros.memoria || {})
  }

  if (game.key === 'matematicas') {
    return crearLogrosMatematicas(estadisticasLogros.matematicas || {})
  }

  if (game.key === 'flashmind') {
    return crearLogrosFlashmind(estadisticasLogros.flashmind || {})
  }

  if (game.key === 'numcatch') {
    return crearLogrosNumcatch(estadisticasLogros.numcatch || {})
  }

  if (game.key === 'cricketarcade') {
    return crearLogrosCricketArcade(estadisticasLogros.cricketarcade || {}, resultado)
  }

  if (game.key === 'esquivaobstaculos') {
    return crearLogrosEsquivaObstaculos(estadisticasLogros.esquivaobstaculos || {}, resultado)
  }

  if (game.key === 'torreinfinita') {
    return crearLogrosTorreInfinita(estadisticasLogros.torreinfinita || {})
  }

  if (game.key === 'subelamontana') {
    return crearLogrosSubeLaMontana(estadisticasLogros.subelamontana || {})
  }

  if (game.key === 'ajedrez') {
    return crearLogrosAjedrez(estadisticasLogros.ajedrez || {})
  }

  if (game.key === 'domino') {
    return crearLogrosDomino(estadisticasLogros.domino || {})
  }

  if (game.key === 'damas') {
    return crearLogrosDamas(estadisticasLogros.damas || {})
  }

  return [
    {
      title: `Primer intento en ${game.label}`,
      description: resultado
        ? `Ya tienes resultado guardado: posicion #${resultado.posicion} de ${resultado.total}.`
        : `Juega ${game.label} para registrar tu primer resultado.`,
      unlocked: Boolean(resultado),
    },
    {
      title: `Podio en ${game.label}`,
      description: resultado?.posicion <= 3
        ? `Alcanzaste el top 3 en ${game.label}.`
        : `Queda entre los 3 mejores de ${game.label}.`,
      unlocked: Boolean(resultado && resultado.posicion <= 3),
    },
    {
      title: `Campeon de ${game.label}`,
      description: resultado?.posicion === 1
        ? `Conseguiste el primer lugar en ${game.label}.`
        : `Consigue el puesto #1 en ${game.label}.`,
      unlocked: Boolean(resultado && resultado.posicion === 1),
    },
    {
      title: 'Logro personalizado',
      description: 'Reservado para el nombre y descripcion que me pases despues.',
      unlocked: false,
    },
  ]
}

function crearLogrosCricketArcade(stats, resultado) {
  const golpesTotal = stats.cricket_golpes_total || 0
  const mejorGolpesPartida = stats.cricket_mejor_golpes_partida || 0
  const mejorRachaGolpes = Math.max(stats.cricket_mejor_racha_golpes || 0, stats.mejor_racha_completados || 0)
  const mejorScore = Math.max(stats.cricket_mejor_puntaje || 0, Number(resultado?.tiempo || 0))
  const partidasUnaVida = stats.cricket_partidas_una_vida || 0
  const mejorTiempoUnaVida = stats.cricket_mejor_tiempo_una_vida || 0
  const partidasSinPerderTodas = stats.cricket_partidas_sin_perder_todas_las_vidas || 0
  const partidasDosVidas = stats.cricket_partidas_dos_vidas || 0
  const victoriasTorneos = stats.victorias_torneos || 0
  const tiempoJugadoHoras = Math.floor((stats.tiempo_jugado_total || 0) / 3600)

  const scoreActual = Number(mejorScore || 0)
  const logrosGolpear = [
    ['El Primer Eco', 'El estadio escuch&oacute; tu golpe... y jam&aacute;s volvi&oacute; al silencio.', 'Consigue tu primer golpe.', golpesTotal >= 1],
    ['Despertar del Bateador', 'Algo dentro de ti reaccion&oacute; antes que la pelota.', 'Consigue 14 golpes acumulados.', golpesTotal >= 14],
    ['Marca en el Polvo', 'Las gradas olvidan jugadores. El campo no.', 'Consigue 50 golpes acumulados.', golpesTotal >= 50],
    ['Ojo del Cometa', 'Golpeaste donde incluso el tiempo dud&oacute;.', 'Consigue 117 golpes acumulados.', golpesTotal >= 117],
    ['Pulso de Titanio', 'Ni el viento pudo mover tu precisi&oacute;n.', 'Consigue 125 golpes acumulados.', golpesTotal >= 125],
    ['El Punto Imposible', 'Durante un instante... la pelota obedeci&oacute;.', 'Consigue 145 golpes acumulados.', golpesTotal >= 145],
    ['Geometr&iacute;a Sagrada', 'Cada impacto parec&iacute;a escrito antes del partido.', 'Consigue 175 golpes acumulados.', golpesTotal >= 175],
  ]

  const logrosRacha = [
    ['Llama Incontenible', 'El ritmo ya no depend&iacute;a del juego... depend&iacute;a de ti.', 'Consigue 5 golpes seguidos sin fallar.', mejorRachaGolpes >= 5],
    ['Ritual del Impacto', 'Cada golpe despert&oacute; otro m&aacute;s violento.', 'Consigue 15 golpes seguidos sin fallar.', mejorRachaGolpes >= 15],
    ['Cadena Carmes&iacute;', 'La multitud dej&oacute; de contar despu&eacute;s del d&eacute;cimo impacto.', 'Consigue 35 golpes seguidos sin fallar.', mejorRachaGolpes >= 35],
    ['El Devorador de Lanzamientos', 'Las pelotas desaparec&iacute;an antes de tocar el suelo.', 'Consigue 75 golpes seguidos sin fallar.', mejorRachaGolpes >= 75],
    ['Sin Margen para Fallar', 'El error te observ&oacute; toda la partida... pero nunca te toc&oacute;.', 'Consigue 85 golpes seguidos sin fallar.', mejorRachaGolpes >= 85],
  ]

  const logrosVictorias = [
    ['El Rey de las Gradas', 'Cuando cay&oacute; la &uacute;ltima pelota, el estadio solo pronunci&oacute; un nombre.', 'Gana 1 torneo de Cricket Arcade.', 1],
    ['Corona de Impactos', 'Cada golpe dej&oacute; una grieta invisible sobre el campo.', 'Gana 3 torneos de Cricket Arcade.', 3],
    ['Donde Callan los Lanzadores', 'Los rivales dejaron de lanzar con esperanza.', 'Gana 5 torneos de Cricket Arcade.', 5],
    ['El &Uacute;ltimo Bateador', 'Uno a uno desaparecieron del marcador... menos t&uacute;.', 'Gana 7 torneos de Cricket Arcade.', 7],
    ['Trono Bajo las Luces', 'La noche del estadio te perteneci&oacute; por completo.', 'Gana 10 torneos de Cricket Arcade.', 10],
    ['Cenizas del Marcador', 'El contador sigui&oacute; subiendo incluso despu&eacute;s del final.', 'Gana 12 torneos de Cricket Arcade.', 12],
    ['La Ovaci&oacute;n Eterna', 'Algunos a&uacute;n siguen aplaudiendo aquel &uacute;ltimo golpe.', 'Gana 15 torneos de Cricket Arcade.', 15],
    ['Pulso de Campe&oacute;n', 'Ni el ruido, ni la presi&oacute;n, ni el miedo lograron desviarte.', 'Gana 18 torneos de Cricket Arcade.', 18],
    ['Ecos del Estadio Vac&iacute;o', 'Cuando todos se fueron, tu nombre segu&iacute;a all&iacute;.', 'Gana 20 torneos de Cricket Arcade.', 20],
    ['El Devorador de Finales', 'Las finales comenzaron a sentirse como simples tr&aacute;mites.', 'Gana 25 torneos de Cricket Arcade.', 25],
    ['El Bate de la Tormenta', 'Cada swing parec&iacute;a partir el cielo en dos.', 'Gana 30 torneos de Cricket Arcade.', 30],
    ['La Noche Imposible', 'Nadie esperaba verte sobrevivir a ese &uacute;ltimo lanzamiento.', 'Gana 35 torneos de Cricket Arcade.', 35],
    ['Fragmento del Campe&oacute;n', 'Algo antiguo despert&oacute; con cada victoria.', 'Gana 40 torneos de Cricket Arcade.', 40],
    ['El Nombre Prohibido', 'Los comentaristas dejaron de mencionar a los dem&aacute;s.', 'Gana 45 torneos de Cricket Arcade.', 45],
    ['El Silencio Antes del Golpe', 'El estadio aprendi&oacute; a temer ese instante exacto.', 'Gana 50 torneos de Cricket Arcade.', 50],
    ['M&aacute;s All&aacute; del Trofeo', 'Ya no jugabas por ganar... jugabas porque pod&iacute;as hacerlo.', 'Gana 60 torneos de Cricket Arcade.', 60],
    ['La Sombra del Campe&oacute;n', 'Incluso ausente, tu presencia pesaba sobre el torneo.', 'Gana 70 torneos de Cricket Arcade.', 70],
    ['El Trono Carmes&iacute;', 'Las victorias comenzaron a acumularse como cicatrices.', 'Gana 80 torneos de Cricket Arcade.', 80],
    ['Cuando el Estadio Ardi&oacute;', 'Aquella final nunca volvi&oacute; a repetirse.', 'Gana 90 torneos de Cricket Arcade.', 90],
    ['El Due&ntilde;o del &Uacute;ltimo Golpe', 'Al final de cada torneo, el destino terminaba encontr&aacute;ndote.', 'Gana 100 torneos de Cricket Arcade.', 100],
    ['El Rugido del Impacto', 'El sonido de tu bate atraves&oacute; todo el estadio.', 'Gana 120 torneos de Cricket Arcade.', 120],
    ['Bajo el Cielo El&eacute;ctrico', 'Aquella victoria ilumin&oacute; incluso las gradas vac&iacute;as.', 'Gana 140 torneos de Cricket Arcade.', 140],
    ['El Guardi&aacute;n del Pitch', 'Cada pelota que cruz&oacute; tu camino termin&oacute; derrotada.', 'Gana 146 torneos de Cricket Arcade.', 146],
    ['La Hora del Invicto', 'Durante ese torneo, el fracaso nunca encontr&oacute; entrada.', 'Gana 158 torneos de Cricket Arcade.', 158],
    ['El Martillo del Estadio', 'Los lanzamientos dejaron de parecer amenazas.', 'Gana 171 torneos de Cricket Arcade.', 171],
    ['Tempestad en las Gradas', 'La multitud no sab&iacute;a si gritar o escapar.', 'Gana 194 torneos de Cricket Arcade.', 194],
    ['El Horizonte Carm&iacute;n', 'La final termin&oacute; te&ntilde;ida por el eco de tus golpes.', 'Gana 216 torneos de Cricket Arcade.', 216],
    ['Donde Mueren los R&eacute;cords', 'Cada victoria borr&oacute; otra marca del pasado.', 'Gana 219 torneos de Cricket Arcade.', 219],
    ['El Juramento del Bateador', 'Prometiste dominar el torneo... y el estadio escuch&oacute;.', 'Gana 222 torneos de Cricket Arcade.', 222],
    ['El Eco de los Campeones', 'Las viejas leyendas comenzaron a sonar peque&ntilde;as.', 'Gana 226 torneos de Cricket Arcade.', 226],
    ['El Peso de la Corona', 'No todos sobreviven a tantas victorias consecutivas.', 'Gana 248 torneos de Cricket Arcade.', 248],
    ['Cenit del Lanzamiento', 'La pelota alcanz&oacute; su punto m&aacute;s alto antes de desaparecer.', 'Gana 232 torneos de Cricket Arcade.', 232],
    ['El Archivo Perdido', 'Tu nombre apareci&oacute; donde ning&uacute;n jugador hab&iacute;a llegado.', 'Gana 256 torneos de Cricket Arcade.', 256],
    ['La Marca del Trueno', 'Despu&eacute;s de aquel golpe, el silencio pareci&oacute; eterno.', 'Gana 272 torneos de Cricket Arcade.', 272],
    ['El Portador del &Uacute;ltimo Swing', 'Las finales comenzaban a terminar antes de empezar.', 'Gana 298 torneos de Cricket Arcade.', 298],
    ['Reino de Pelotas Rotas', 'Algo en el estadio dej&oacute; de funcionar normalmente.', 'Gana 355 torneos de Cricket Arcade.', 355],
    ['El Vigilante de Medianoche', 'Las luces segu&iacute;an encendidas mucho despu&eacute;s de tu victoria.', 'Gana 365 torneos de Cricket Arcade.', 365],
    ['La Jaula de los Lanzadores', 'Cada rival entraba sabiendo c&oacute;mo terminar&iacute;a todo.', 'Gana 375 torneos de Cricket Arcade.', 375],
    ['El Coraz&oacute;n del Coliseo', 'El estadio lati&oacute; contigo durante la final.', 'Gana 385 torneos de Cricket Arcade.', 385],
    ['La &Uacute;ltima Leyenda del Pitch', 'Cuando el torneo necesit&oacute; un campe&oacute;n... apareci&oacute; tu sombra.', 'Gana 420 torneos de Cricket Arcade.', 420],
  ]

  const logrosTiempo = [
    ['El Despertar de Aetherion', 'Las antiguas luces del estadio reaccionaron a tu llegada.', 'Juega 1 hora de Cricket Arcade.', 1],
    ['Cr&oacute;nicas del Primer Vigilante', 'El campo comenz&oacute; a registrar tus pasos entre sus viejas memorias.', 'Juega 2 horas de Cricket Arcade.', 2],
    ['El Juramento de Valtheris', 'El bate respondi&oacute; como si reconociera tu pulso.', 'Juega 3 horas de Cricket Arcade.', 3],
    ['Los Ecos de Lun&rsquo;Kael', 'Algo antiguo despert&oacute; entre las gradas vac&iacute;as.', 'Juega 5 horas de Cricket Arcade.', 5],
    ['El Portador del Sol Carmes&iacute;', 'Las noches del estadio ya no terminaban igual despu&eacute;s de tu llegada.', 'Juega 7 horas de Cricket Arcade.', 7],
    ['Las Campanas de Arkanor', 'Cada impacto comenz&oacute; a sonar como un antiguo ritual.', 'Juega 10 horas de Cricket Arcade.', 10],
    ['El Archivo de Veyrath', 'Tu nombre apareci&oacute; donde descansan los grandes campeones.', 'Juega 42 horas de Cricket Arcade.', 42],
    ['La Vigilia de Drak&rsquo;Thar', 'Mientras otros abandonaban el campo, t&uacute; permanec&iacute;as.', 'Juega 75 horas de Cricket Arcade.', 75],
    ['El C&oacute;dice del &Uacute;ltimo Swing', 'Las viejas leyendas empezaron a escribirse otra vez.', 'Juega 98 horas de Cricket Arcade.', 98],
    ['El Trono de las Gradas Eternas', 'Incluso el estadio inclin&oacute; sus luces ante tu presencia.', 'Juega 120 horas de Cricket Arcade.', 120],
    ['El Heraldo de Noctyra', 'Las sombras del pitch comenzaron a seguir tus movimientos.', 'Juega 164 horas de Cricket Arcade.', 164],
    ['La Corona de Elarith', 'No todos soportan tanto tiempo bajo las luces sagradas.', 'Juega 228 horas de Cricket Arcade.', 228],
    ['Los Sellos de Varkor', 'Cada partida abri&oacute; una puerta que deb&iacute;a permanecer cerrada.', 'Juega 232 horas de Cricket Arcade.', 232],
    ['El Guardi&aacute;n de las Mil Pelotas', 'El estadio dej&oacute; de verte como jugador... y comenz&oacute; a verte como leyenda.', 'Juega 336 horas de Cricket Arcade.', 336],
    ['El Coraz&oacute;n de Aer&rsquo;Vhal', 'Las antiguas paredes del coliseo a&uacute;n repiten tus golpes.', 'Juega 400 horas de Cricket Arcade.', 400],
    ['La Llama de los Antiguos Bateadores', 'El fuego de viejos campeones comenz&oacute; a arder nuevamente.', 'Juega 450 horas de Cricket Arcade.', 450],
    ['El Ocaso de Kael&rsquo;Zareth', 'Incluso el tiempo pareci&oacute; ralentizarse dentro del estadio.', 'Juega 500 horas de Cricket Arcade.', 500],
    ['La Reliquia del Pitch Dorado', 'Los antiguos s&iacute;mbolos del campo respondieron a tu presencia.', 'Juega 600 horas de Cricket Arcade.', 600],
    ['El Nombre Sellado en Obsidiana', 'Las leyendas ya no pod&iacute;an ocultar tu existencia.', 'Juega 750 horas de Cricket Arcade.', 750],
    ['El Trono Perdido de Asterion', 'Despu&eacute;s de tantas noches... el estadio finalmente te reconoci&oacute; como suyo.', 'Juega 1000 horas de Cricket Arcade.', 1000],
  ]

  return [
    ...logrosGolpear.map(([title, description, howTo, unlocked]) => ({ title, description, howTo, unlocked })),
    ...logrosRacha.map(([title, description, howTo, unlocked]) => ({ title, description, howTo, unlocked })),
    ...logrosVictorias.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: victoriasTorneos >= requisito,
    })),
    ...logrosTiempo.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: tiempoJugadoHoras >= requisito,
    })),
    {
      title: 'Lluvia sobre el Estadio',
      description: 'Los puntos comenzaron a caer como una tormenta eterna.',
      howTo: 'Supera 300 puntos.',
      unlocked: scoreActual > 300,
    },
    {
      title: 'El N&uacute;mero Prohibido',
      description: 'Nadie deb&iacute;a llegar tan lejos.',
      howTo: 'Supera 1.000 puntos.',
      unlocked: scoreActual > 1000,
    },
    {
      title: 'M&aacute;s All&aacute; del Marcador',
      description: 'El contador sigui&oacute; funcionando. Las reglas no.',
      howTo: 'Supera 2.800 puntos.',
      unlocked: scoreActual > 2800,
    },
    {
      title: 'El Partido Eterno',
      description: 'Algunos juraron que nunca terminaste de jugar.',
      howTo: 'Supera 5.000 puntos.',
      unlocked: scoreActual > 5000,
    },
    {
      title: 'Contra la &Uacute;ltima Bola',
      description: 'Sobreviviste cuando el estadio ya te daba por perdido.',
      howTo: 'Termina una partida con una sola vida restante.',
      unlocked: partidasUnaVida >= 1,
    },
    {
      title: 'Silencio en las Gradas',
      description: 'Nadie entend&iacute;a c&oacute;mo segu&iacute;as jugando.',
      howTo: 'Sobrevive durante 5 minutos con 1 vida.',
      unlocked: mejorTiempoUnaVida >= 5 * 60,
    },
    {
      title: 'La Noche del Invicto',
      description: 'Ni un fallo. Ni una grieta. Ni una duda.',
      howTo: 'Termina una partida sin perder todas las vidas.',
      unlocked: partidasSinPerderTodas >= 1,
    },
    {
      title: 'Pulso Inhumano',
      description: 'La velocidad aument&oacute;... y t&uacute; tambi&eacute;n.',
      howTo: 'Sobrevive con solo 2 vidas.',
      unlocked: partidasDosVidas >= 1,
    },
    {
      title: 'Partido Tallado en Bronce',
      description: 'Una partida no bast&oacute; para contener tu marca.',
      howTo: 'Consigue 40 golpes en una sola partida.',
      unlocked: mejorGolpesPartida >= 40,
    },
  ]
}

function crearLogrosEsquivaObstaculos(stats, resultado) {
  const tiempoJugadoHoras = Math.floor((stats.tiempo_jugado_total || 0) / 3600)
  const mejorScore = Number(resultado?.tiempo || 0)
  const partidasUnaVida = stats.esquiva_partidas_una_vida || 0
  const partidasDosVidas = stats.esquiva_partidas_dos_vidas || 0
  const partidasSinPerderVidas = stats.esquiva_partidas_sin_perder_vidas || 0
  const mejorTiempoUnaVida = stats.esquiva_mejor_tiempo_una_vida || 0
  const mejorTiempoDosVidas = stats.esquiva_mejor_tiempo_dos_vidas || 0
  const obstaculosEsquivados = stats.esquiva_obstaculos_esquivados || 0
  const partidasJugadas = stats.completados || 0
  const victoriasTorneos = stats.victorias_torneos || 0
  const logrosTiempo = [
    ['El Sendero de Nyx&rsquo;rael', 'El vac&iacute;o abri&oacute; su primer camino ante tus pasos.', 'Juega 1 hora de Esquiva Obst&aacute;culos.', 1],
    ['Las Runas del Errante', 'Las antiguas marcas comenzaron a seguir tu recorrido.', 'Juega 2 horas de Esquiva Obst&aacute;culos.', 2],
    ['El Pacto de Vel&rsquo;Khar', 'Tus reflejos despertaron algo que dorm&iacute;a entre las sombras.', 'Juega 3 horas de Esquiva Obst&aacute;culos.', 3],
    ['La Senda de los Mil Riesgos', 'Cada obst&aacute;culo evitado aliment&oacute; una vieja leyenda.', 'Juega 5 horas de Esquiva Obst&aacute;culos.', 5],
    ['El Vig&iacute;a de Obsidiana', 'Tus movimientos comenzaron a desafiar el destino mismo.', 'Juega 7 horas de Esquiva Obst&aacute;culos.', 7],
    ['Los Ojos de Vaelor', 'Incluso las trampas m&aacute;s r&aacute;pidas dejaron de sorprenderte.', 'Juega 10 horas de Esquiva Obst&aacute;culos.', 10],
    ['El Corredor de Etherion', 'El viento ya no pod&iacute;a alcanzarte.', 'Juega 12 horas de Esquiva Obst&aacute;culos.', 12],
    ['El Umbral de Kaer&rsquo;Thul', 'Hab&iacute;as cruzado m&aacute;s peligros de los que cualquier mortal soportar&iacute;a.', 'Juega 15 horas de Esquiva Obst&aacute;culos.', 15],
    ['Las Cr&oacute;nicas del Vac&iacute;o Carmes&iacute;', 'Las antiguas paredes comenzaron a recordar tus esquivas.', 'Juega 18 horas de Esquiva Obst&aacute;culos.', 18],
    ['El Portador de la &Uacute;ltima Ruta', 'Los caminos imposibles empezaron a abrirse ante ti.', 'Juega 20 horas de Esquiva Obst&aacute;culos.', 20],
    ['El Eco de las Sombras Eternas', 'Algo invisible segu&iacute;a cada uno de tus movimientos.', 'Juega 24 horas de Esquiva Obst&aacute;culos.', 24],
    ['El Santuario de Vorthalim', 'Sobreviviste donde otros desaparecieron sin dejar rastro.', 'Juega 28 horas de Esquiva Obst&aacute;culos.', 28],
    ['El Juramento del Caminante Antiguo', 'Tu nombre qued&oacute; unido a las rutas prohibidas.', 'Juega 32 horas de Esquiva Obst&aacute;culos.', 32],
    ['El Trono del &Uacute;ltimo Esquive', 'Las trampas dejaron de parecer amenazas reales.', 'Juega 36 horas de Esquiva Obst&aacute;culos.', 36],
    ['La Llama de Arkh&rsquo;Mora', 'Cada segundo vivo parec&iacute;a desafiar las leyes del caos.', 'Juega 40 horas de Esquiva Obst&aacute;culos.', 40],
    ['El Guardi&aacute;n de las Puertas Vac&iacute;as', 'Los corredores eternos ya conoc&iacute;an tu presencia.', 'Juega 45 horas de Esquiva Obst&aacute;culos.', 45],
    ['La Reliquia de los Pasos Perdidos', 'Tus huellas quedaron grabadas m&aacute;s all&aacute; del tiempo.', 'Juega 50 horas de Esquiva Obst&aacute;culos.', 50],
    ['El Heraldo del Laberinto Negro', 'Las antiguas rutas comenzaron a inclinarse ante tu velocidad.', 'Juega 60 horas de Esquiva Obst&aacute;culos.', 60],
    ['El Nombre Oculto en Basalto', 'Incluso las sombras aprendieron a temerte.', 'Juega 75 horas de Esquiva Obst&aacute;culos.', 75],
    ['El Trascender de Xhal&rsquo;Tor', 'Despu&eacute;s de incontables esquivas... dejaste de ser un simple corredor.', 'Juega 100 horas de Esquiva Obst&aacute;culos.', 100],
  ]
  const logrosPuntos = [
    ['El Primer Umbral', 'El caos apenas comenzaba a reconocerte.', 'Consigue 100 puntos.', 100],
    ['Fragmento de Velastra', 'Tus pasos dejaron marcas donde nadie sobreviv&iacute;a.', 'Consigue 250 puntos.', 250],
    ['El Corredor de Ceniza', 'Las rutas ard&iacute;an detr&aacute;s de ti.', 'Consigue 500 puntos.', 500],
    ['Los Ecos de Arkh&rsquo;Vel', 'El vac&iacute;o comenz&oacute; a memorizar tu trayectoria.', 'Consigue 750 puntos.', 750],
    ['El Ojo del Laberinto', 'Las trampas dejaron de atraparte.', 'Consigue 1.000 puntos.', 1000],
    ['El Sendero Carmes&iacute;', 'Cada obst&aacute;culo evitado aliment&oacute; una vieja leyenda.', 'Consigue 2.000 puntos.', 2000],
    ['La &Uacute;ltima Ruta de Vaelor', 'Incluso el peligro comenz&oacute; a abrirse ante ti.', 'Consigue 3.000 puntos.', 3000],
    ['El Trono del Vac&iacute;o Gris', 'Las rutas imposibles ya conoc&iacute;an tu nombre.', 'Consigue 5.000 puntos.', 5000],
    ['El Archivo del Caos', 'Tu recorrido qued&oacute; grabado entre corredores olvidados.', 'Consigue 7.500 puntos.', 7500],
    ['El Coraz&oacute;n de Xhaelor', 'M&aacute;s all&aacute; de este punto... pocos regresan.', 'Consigue 10.000 puntos.', 10000],
  ]
  const logrosVidas = [
    ['El &Uacute;ltimo Latido', 'La derrota estuvo cerca... demasiado cerca.', 'Sobrevive con 1 vida restante.', partidasUnaVida >= 1],
    ['Piel de Obsidiana', 'Ni una sola grieta logr&oacute; alcanzarte.', 'Termina una partida sin perder vidas.', partidasSinPerderVidas >= 1],
    ['El Instante Antes del Fin', 'El caos roz&oacute; tu sombra y fall&oacute;.', 'Sobrevive 20 segundos con 1 vida.', mejorTiempoUnaVida >= 20],
    ['Reliquia Viviente', 'Algo evit&oacute; que cayeras cuando deb&iacute;as hacerlo.', 'Sobrevive con 2 vidas restantes.', partidasDosVidas >= 1],
    ['El Pulso de Kael&rsquo;Rith', 'Tu coraz&oacute;n sigui&oacute; avanzando entre ruinas.', 'Sobrevive 50 segundos con 1 vida.', mejorTiempoUnaVida >= 50],
    ['El Juramento del Invicto', 'El da&ntilde;o nunca encontr&oacute; tu cuerpo.', 'Sobrevive 189 segundos con 1 vida.', mejorTiempoUnaVida >= 189],
    ['El Caminante Herido', 'Cada segundo vivo parec&iacute;a imposible.', 'Sobrevive 289 segundos con 1 vida.', mejorTiempoUnaVida >= 289],
    ['La Sangre del Vac&iacute;o', 'El peligro comenz&oacute; a alimentarse de otros jugadores.', 'Sobrevive 50 segundos con 2 vidas.', mejorTiempoDosVidas >= 50],
    ['El Eco del Sobreviviente', 'Las rutas prohibidas te dejaron pasar una vez m&aacute;s.', 'Sobrevive 300 segundos con 2 vidas.', mejorTiempoDosVidas >= 300],
    ['El Nombre que No Cay&oacute;', 'Incluso el abismo perdi&oacute; la paciencia contigo.', 'Sobrevive 500 segundos con 1 vida.', mejorTiempoUnaVida >= 500],
  ]
  const logrosObstaculos = [
    ['Primer Desv&iacute;o', 'Tu cuerpo reaccion&oacute; antes que el miedo.', 'Esquiva 25 obst&aacute;culos.', 25],
    ['El Camino entre Ruinas', 'Cada paso evit&oacute; una nueva ca&iacute;da.', 'Esquiva 50 obst&aacute;culos.', 50],
    ['Danza de Sombras', 'Te mov&iacute;as como si conocieras el futuro.', 'Esquiva 100 obst&aacute;culos.', 100],
    ['El Sendero Invisible', 'Los obst&aacute;culos dejaron de tocarte.', 'Esquiva 200 obst&aacute;culos.', 200],
    ['El Reflejo de Vael&rsquo;Kor', 'Ni el caos pudo seguir tu ritmo.', 'Esquiva 300 obst&aacute;culos.', 300],
    ['La Ruta del Fantasma', 'Pasaste entre peligros que nadie m&aacute;s ve&iacute;a.', 'Esquiva 500 obst&aacute;culos.', 500],
    ['El Archivo de los Intocables', 'Tu recorrido comenz&oacute; a convertirse en mito.', 'Esquiva 750 obst&aacute;culos.', 750],
    ['El Pulso del Vac&iacute;o', 'Las trampas parec&iacute;an apartarse solas.', 'Esquiva 1.000 obst&aacute;culos.', 1000],
    ['La Corona del Desv&iacute;o', 'Ya no esquivabas obst&aacute;culos... dominabas el corredor.', 'Esquiva 1.500 obst&aacute;culos.', 1500],
    ['El Nombre Bajo las Ruinas', 'Incluso el laberinto aprendi&oacute; a respetarte.', 'Esquiva 2.000 obst&aacute;culos.', 2000],
  ]
  const logrosPartidas = [
    ['El Regreso al Corredor', 'Volviste donde otros no se atreven.', 'Juega 5 partidas.', 5],
    ['El Ritual del Caminante', 'Cada partida fortaleci&oacute; tus reflejos.', 'Juega 10 partidas.', 10],
    ['El Habitante del Riesgo', 'El peligro comenz&oacute; a sentirse familiar.', 'Juega 25 partidas.', 25],
    ['Las Cr&oacute;nicas del Escape', 'Tu historia empez&oacute; a expandirse entre las rutas.', 'Juega 50 partidas.', 50],
    ['El Eco Persistente', 'El corredor ya conoc&iacute;a tus pasos.', 'Juega 75 partidas.', 75],
    ['El Vig&iacute;a del Vac&iacute;o', 'Pocas almas soportan regresar tantas veces.', 'Juega 100 partidas.', 100],
    ['El Peregrino de Noctyra', 'Las trampas comenzaron a esperarte.', 'Juega 150 partidas.', 150],
    ['La Marca del Sobreviviente', 'Tu presencia qued&oacute; grabada entre ruinas antiguas.', 'Juega 250 partidas.', 250],
    ['El Guardi&aacute;n del Laberinto', 'Las rutas eternas te reconocieron como uno de los suyos.', 'Juega 500 partidas.', 500],
    ['El &Uacute;ltimo Corredor', 'Despu&eacute;s de tantas ca&iacute;das y victorias... seguiste avanzando.', 'Juega 1.000 partidas.', 1000],
  ]
  const logrosTorneos = [
    ['El Trono de Anor&rsquo;Kai', 'Las rutas prohibidas eligieron a su primer soberano.', 'Gana 1 torneo.', 1],
    ['Las Cr&oacute;nicas de Vhalzeryn', 'Tu victoria qued&oacute; escrita entre nombres olvidados.', 'Gana 3 torneos.', 3],
    ['El Heraldo de Morveth', 'El corredor oscuro comenz&oacute; a abrirse ante tus pasos.', 'Gana 5 torneos.', 5],
    ['La Corona de Nythera', 'Los antiguos campeones observaron tu ascenso en silencio.', 'Gana 8 torneos.', 8],
    ['El Vig&iacute;a de Arkh&rsquo;Tyr', 'Ni el caos pudo apartarte del &uacute;ltimo camino.', 'Gana 12 torneos.', 12],
    ['El Eclipse de Vael&rsquo;Drakar', 'Aquella final apag&oacute; incluso las luces del coliseo.', 'Gana 15 torneos.', 15],
    ['Los Sellos de Aerthalion', 'Cada torneo roto liber&oacute; otra vieja leyenda.', 'Gana 20 torneos.', 20],
    ['El Reino de Vorth&rsquo;Kael', 'Las rutas eternas comenzaron a inclinarse ante ti.', 'Gana 25 torneos.', 25],
    ['El C&aacute;ntico de Noctharis', 'Las gradas vac&iacute;as a&uacute;n repiten aquella victoria.', 'Gana 35 torneos.', 35],
    ['El &Uacute;ltimo Emperador de Xareth', 'Cuando el caos necesit&oacute; un due&ntilde;o... apareci&oacute; tu nombre.', 'Gana 50 torneos.', 50],
    ['El Legado de Zepharion', 'Los corredores antiguos volvieron a abrirse tras tu victoria.', 'Gana 60 torneos.', 60],
    ['La Reliquia de Thal&rsquo;Veyra', 'Algo sellado durante siglos reaccion&oacute; a tu presencia.', 'Gana 70 torneos.', 70],
    ['El Trascender de Kaeloris', 'Tus reflejos comenzaron a desafiar las leyes del vac&iacute;o.', 'Gana 80 torneos.', 80],
    ['El C&oacute;dice de Umbraxis', 'Las finales empezaron a terminar antes de comenzar.', 'Gana 90 torneos.', 90],
    ['El Santuario de Valkyreth', 'Solo unos pocos nombres alcanzan las ruinas sagradas del corredor.', 'Gana 100 torneos.', 100],
    ['La Sombra de Drael&rsquo;Kor', 'Incluso ausente, tu leyenda segu&iacute;a dominando el torneo.', 'Gana 120 torneos.', 120],
    ['El Juramento de Myr&rsquo;Zareth', 'El caos dej&oacute; de verte como mortal hace mucho tiempo.', 'Gana 140 torneos.', 140],
    ['El Ocaso de Nytharion', 'Las rutas eternas guardaron silencio tras tu llegada.', 'Gana 160 torneos.', 160],
    ['El Trono Perdido de Velkarith', 'Los antiguos campeones ya no pod&iacute;an compararse contigo.', 'Gana 180 torneos.', 180],
    ['La Ascensi&oacute;n de Xer&rsquo;Valtor', 'Tu nombre cruz&oacute; el l&iacute;mite donde nacen las leyendas.', 'Gana 200 torneos.', 200],
  ]

  return [
    ...logrosTiempo.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: tiempoJugadoHoras >= requisito,
    })),
    ...logrosPuntos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: mejorScore >= requisito,
    })),
    ...logrosVidas.map(([title, description, howTo, unlocked]) => ({
      title,
      description,
      howTo,
      unlocked,
    })),
    ...logrosObstaculos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: obstaculosEsquivados >= requisito,
    })),
    ...logrosPartidas.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: partidasJugadas >= requisito,
    })),
    ...logrosTorneos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: victoriasTorneos >= requisito,
    })),
  ]
}

function crearLogrosTorreInfinita(stats) {
  const mejorAlturaMetros = stats.torre_mejor_altura_m || 0
  const puntosTotal = stats.torre_puntos_total || 0
  const partidasJugadas = stats.completados || 0
  const victoriasTorneos = stats.victorias_torneos || 0
  const logrosAltura = [
    ['El Umbral de Eryndor', 'La torre apenas permiti&oacute; tu primer ascenso.', 'Alcanza 10 m.', 10],
    ['Las Escaleras de Vael&rsquo;Thir', 'Cada pelda&ntilde;o comenz&oacute; a separarte del mundo.', 'Alcanza 100 m.', 100],
    ['El Santuario Suspendido', 'Las alturas empezaron a devorar el horizonte.', 'Alcanza 230 m.', 230],
    ['La Cornisa de Aer&rsquo;Kael', 'Muy pocos llegan donde el viento deja de sonar.', 'Alcanza 275 m.', 275],
    ['El Piso del Silencio Blanco', 'Incluso la torre guard&oacute; silencio a tu paso.', 'Alcanza 300 m.', 300],
    ['Los Muros de Nythara', 'Las nubes quedaron atrapadas bajo tus pies.', 'Alcanza 650 m.', 650],
    ['El Ascenso de Valkorim', 'La gravedad comenz&oacute; a sentirse lejana.', 'Alcanza 850 m.', 850],
    ['La Aguja de Xhal&rsquo;Vareth', 'La torre dej&oacute; de parecer construida por humanos.', 'Alcanza 1350 m.', 1350],
    ['El Trono sobre Etherion', 'Miraste el mundo desde donde nacen las tormentas.', 'Alcanza 1500 m.', 1500],
    ['El &Uacute;ltimo Piso de Aethernia', 'M&aacute;s arriba de este punto... solo existen leyendas.', 'Alcanza 2000 m.', 2000],
  ]
  const logrosPuntos = [
    ['La Primera Marca de Obsidiana', 'La torre registr&oacute; tu existencia por primera vez.', 'Consigue 1000 puntos.', 1000],
    ['El Pulso de Kaer&rsquo;Thul', 'Cada plataforma fortaleci&oacute; el ritmo del ascenso.', 'Consigue 25000 puntos.', 25000],
    ['El N&uacute;mero de los Antiguos', 'Las viejas piedras comenzaron a reaccionar.', 'Consigue 50000 puntos.', 50000],
    ['El Eco Vertical', 'Tu puntuaci&oacute;n empez&oacute; a romper antiguos registros.', 'Consigue 100000 puntos.', 100000],
    ['Las Cuentas de Valkyreth', 'La torre ya no pod&iacute;a ignorar tu presencia.', 'Consigue 250000 puntos.', 250000],
    ['El Archivo de Aerion', 'Tu recorrido qued&oacute; grabado entre escaladores perdidos.', 'Consigue 500000 puntos.', 500000],
    ['El C&oacute;digo del Horizonte', 'Las alturas comenzaron a inclinarse ante ti.', 'Consigue 750000 puntos.', 750000],
    ['El Ocaso de los Marcadores', 'Los n&uacute;meros dejaron de tener significado.', 'Consigue 1000000 puntos.', 1000000],
    ['El Fragmento de Lumyra', 'Algo antiguo despert&oacute; dentro de la torre.', 'Consigue 1500000 puntos.', 1500000],
    ['El C&aacute;liz del Ascenso Eterno', 'La cima comenz&oacute; a parecer alcanzable.', 'Consigue 2500000 puntos.', 2500000],
  ]
  const logrosPartidas = [
    ['Regreso al Primer Pelda&ntilde;o', 'La torre volvi&oacute; a abrir sus puertas para ti.', 'Juega 5 partidas.', 5],
    ['El Ritual del Ascenso', 'Cada ca&iacute;da aliment&oacute; tu siguiente intento.', 'Juega 100 partidas.', 100],
    ['Habitante de las Cornisas', 'Las alturas comenzaron a sentirse familiares.', 'Juega 250 partidas.', 250],
    ['El Eco del Escalador', 'Tus pasos resonaron una y otra vez.', 'Juega 500 partidas.', 500],
    ['El Vig&iacute;a de la Torre Gris', 'Las viejas piedras ya reconoc&iacute;an tu presencia.', 'Juega 1000 partidas.', 1000],
    ['El Peregrino de Valkor', 'Pocos regresan tantas veces al vac&iacute;o.', 'Juega 1500 partidas.', 1500],
    ['Las Cr&oacute;nicas de Aer&rsquo;Vhal', 'Tu historia comenz&oacute; a mezclarse con la de la torre.', 'Juega 2500 partidas.', 2500],
    ['El Guardi&aacute;n del Horizonte Vertical', 'Las alturas dejaron de ser territorio desconocido.', 'Juega 5000 partidas.', 5000],
    ['La Sombra de las Mil Subidas', 'Tus intentos comenzaron a parecer eternos.', 'Juega 750 partidas.', 750],
    ['El &Uacute;ltimo Escalador de Noctyra', 'Cuando todos dejaron de subir... t&uacute; continuaste.', 'Juega 1800 partidas.', 1800],
  ]
  const logrosTorneos = [
    ['La Corona de Aer&rsquo;Thal', 'La torre eligi&oacute; a su primer soberano.', 'Gana 1 torneo.', 1],
    ['El Se&ntilde;or de las Cornisas Eternas', 'Tus rivales quedaron atrapados bajo tu sombra.', 'Gana 3 torneos.', 3],
    ['El Trono de Valkerys', 'Las alturas comenzaron a inclinarse ante tu nombre.', 'Gana 5 torneos.', 5],
    ['El Heraldo de Xhaelor', 'Cada torneo roto abri&oacute; otro camino hacia la cima.', 'Gana 10 torneos.', 10],
    ['El Reino Suspendido de Nythar', 'Las nubes dejaron de ocultar tu ascenso.', 'Gana 250 torneos.', 250],
    ['El Emperador de las Agujas Blancas', 'La torre ya no aceptaba otro gobernante.', 'Gana 500 torneos.', 500],
    ['La Ascensi&oacute;n de Vael&rsquo;Korim', 'Incluso el vac&iacute;o guard&oacute; silencio ante tu victoria.', 'Gana 1000 torneos.', 1000],
    ['El Trono Perdido de Etherion', 'Las antiguas alturas finalmente encontraron due&ntilde;o.', 'Gana 150 torneos.', 150],
    ['El Monarca del Horizonte Infinito', 'M&aacute;s all&aacute; de las nubes... segu&iacute;as ascendiendo.', 'Gana 2000 torneos.', 2000],
    ['El &Uacute;ltimo Soberano de Aethernia', 'Cuando la torre necesit&oacute; una leyenda... apareciste t&uacute;.', 'Gana 3000 torneos.', 3000],
  ]

  return [
    ...logrosAltura.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: mejorAlturaMetros >= requisito,
    })),
    ...logrosPuntos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: puntosTotal >= requisito,
    })),
    ...logrosPartidas.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: partidasJugadas >= requisito,
    })),
    ...logrosTorneos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: victoriasTorneos >= requisito,
    })),
  ]
}

function crearLogrosSubeLaMontana(stats) {
  const mejorAlturaMetros = stats.montana_mejor_altura_m || 0
  const puntosTotal = stats.montana_puntos_total || 0
  const partidasJugadas = stats.completados || 0
  const victoriasTorneos = stats.victorias_torneos || 0
  const partidasUnaVida = stats.montana_partidas_una_vida || 0
  const partidasDosVidas = stats.montana_partidas_dos_vidas || 0
  const mejorTiempoUnaVida = stats.montana_mejor_tiempo_una_vida || 0
  const mejorTiempoDosVidas = stats.montana_mejor_tiempo_dos_vidas || 0
  const logrosAltura = [
    ['El Primer Paso de Eryndhal', 'La monta&ntilde;a escuch&oacute; por primera vez tus botas sobre la roca.', 'Alcanza 100 m.', 100],
    ['Los Senderos de Kael&rsquo;Drim', 'Las viejas piedras comenzaron a aceptar tu ascenso.', 'Alcanza 250 m.', 250],
    ['La Ladera de Aerthion', 'El fr&iacute;o dej&oacute; de sentirse como enemigo.', 'Alcanza 500 m.', 500],
    ['El Refugio de Nythara', 'Las nubes comenzaron a esconder el mundo bajo tus pies.', 'Alcanza 1000 m.', 1000],
    ['Las Agujas de Valkor', 'Muy pocos llegan donde el viento cambia de voz.', 'Alcanza 1500 m.', 1500],
    ['El Silencio de las Cumbres Blancas', 'Incluso la tormenta guard&oacute; distancia de tu camino.', 'Alcanza 2500 m.', 2500],
    ['El Horizonte de Vael&rsquo;Thar', 'La monta&ntilde;a comenz&oacute; a parecer infinita.', 'Alcanza 5000 m.', 5000],
    ['El Santuario de las Nieves Eternas', 'Las alturas dejaron de pertenecer al mundo mortal.', 'Alcanza 7500 m.', 7500],
    ['La Corona de Etherion', 'Tu sombra apareci&oacute; m&aacute;s arriba que las nubes.', 'Alcanza 10000 m.', 10000],
    ['El Pico de Xhal&rsquo;Vareth', 'La monta&ntilde;a comenz&oacute; a recordar tu nombre.', 'Alcanza 15000 m.', 15000],
    ['El Reino Suspendido de Aethra', 'Ya no exist&iacute;a nada sobre ti excepto el cielo.', 'Alcanza 20000 m.', 20000],
    ['Donde Muere el Viento', 'M&aacute;s all&aacute; de esta altura... solo sobreviven las leyendas.', 'Alcanza 30000 m.', 30000],
  ]
  const logrosPuntos = [
    ['Marca sobre la Escarcha', 'Tus primeros pasos quedaron grabados en la nieve antigua.', 'Consigue 1.000 puntos acumulados.', 1000],
    ['El Pulso de la Cordillera', 'Cada ascenso fortaleci&oacute; tu leyenda.', 'Consigue 5.000 puntos acumulados.', 5000],
    ['Las Cr&oacute;nicas del Sendero Blanco', 'Las monta&ntilde;as comenzaron a registrar tu historia.', 'Consigue 10.000 puntos acumulados.', 10000],
    ['El Archivo de Aer&rsquo;Khal', 'Tu nombre apareci&oacute; entre antiguos escaladores.', 'Consigue 25.000 puntos acumulados.', 25000],
    ['La Reliquia de la Nieve Gris', 'Algo olvidado despert&oacute; con tu progreso.', 'Consigue 50.000 puntos acumulados.', 50000],
    ['El Eco de las Alturas Eternas', 'Cada punto parec&iacute;a un paso hacia otro mundo.', 'Consigue 75.000 puntos acumulados.', 75000],
    ['El Ocaso del Valle Fr&iacute;o', 'Las monta&ntilde;as dejaron de parecer imposibles.', 'Consigue 100.000 puntos acumulados.', 100000],
    ['El C&aacute;liz de las Cumbres', 'Tus ascensos comenzaron a romper viejas marcas.', 'Consigue 150.000 puntos acumulados.', 150000],
    ['El Coraz&oacute;n de Valkerys', 'La nieve comenz&oacute; a guardar memoria de tus pasos.', 'Consigue 250.000 puntos acumulados.', 250000],
    ['El Fragmento de Noctharis', 'Las cumbres antiguas reaccionaron a tu presencia.', 'Consigue 500.000 puntos acumulados.', 500000],
    ['La Leyenda del Ascenso Blanco', 'Tu recorrido ya no pod&iacute;a ocultarse entre la tormenta.', 'Consigue 750.000 puntos acumulados.', 750000],
    ['El Nombre Tallado en Hielo', 'Incluso las monta&ntilde;as eternas pronunciaron tu existencia.', 'Consigue 1.000.000 puntos acumulados.', 1000000],
  ]
  const logrosPartidas = [
    ['Regreso al Sendero Helado', 'La monta&ntilde;a volvi&oacute; a abrir sus caminos para ti.', 'Juega 50 partidas.', 50],
    ['El Ritual de la Ladera Blanca', 'Cada ca&iacute;da aliment&oacute; tu siguiente ascenso.', 'Juega 100 partidas.', 100],
    ['Habitante del Refugio Gris', 'Las alturas comenzaron a sentirse familiares.', 'Juega 250 partidas.', 250],
    ['El Eco de las Botas Antiguas', 'Tus pasos resonaron una y otra vez sobre la nieve.', 'Juega 500 partidas.', 500],
    ['El Peregrino de Valkareth', 'Pocos regresan tantas veces a la monta&ntilde;a.', 'Juega 1000 partidas.', 1000],
    ['Las Cr&oacute;nicas del Ascenso Eterno', 'Tu historia comenz&oacute; a mezclarse con las tormentas.', 'Juega 1500 partidas.', 1500],
    ['El Vig&iacute;a del Horizonte Blanco', 'Las cumbres comenzaron a reconocer tu presencia.', 'Juega 2500 partidas.', 2500],
    ['El Guardi&aacute;n del Refugio Perdido', 'La monta&ntilde;a dej&oacute; de verte como visitante.', 'Juega 5000 partidas.', 5000],
    ['El &Uacute;ltimo Caminante de Etherion', 'Tus intentos comenzaron a parecer infinitos.', 'Juega 7500 partidas.', 7500],
    ['La Sombra de las Mil Subidas', 'Las rutas heladas ya conoc&iacute;an tu nombre.', 'Juega 10.000 partidas.', 10000],
    ['El Heraldo de las Cumbres Eternas', 'Incluso la tormenta comenz&oacute; a esperarte.', 'Juega 15.000 partidas.', 15000],
    ['El &Uacute;ltimo Monta&ntilde;ista de Aethra', 'Cuando todos abandonaron la subida... t&uacute; continuaste.', 'Juega 20.000 partidas.', 20000],
  ]
  const logrosTorneos = [
    ['La Corona del Primer Pico', 'La monta&ntilde;a eligi&oacute; a su nuevo escalador.', 'Gana 1 torneo.', 1],
    ['El Se&ntilde;or de las Laderas Eternas', 'Las rutas heladas comenzaron a inclinarse ante ti.', 'Gana 3 torneos.', 3],
    ['El Trono de Valkorim', 'Las alturas dejaron de pertenecer a otros.', 'Gana 5 torneos.', 5],
    ['El Heraldo de la Nieve Negra', 'Cada torneo roto fortaleci&oacute; tu leyenda.', 'Gana 10 torneos.', 10],
    ['El Reino Suspendido de Aerthys', 'Incluso las tormentas guardaron silencio a tu paso.', 'Gana 15 torneos.', 15],
    ['El Emperador de las Cumbres Blancas', 'La monta&ntilde;a ya no aceptaba otro soberano.', 'Gana 25 torneos.', 25],
    ['La Ascensi&oacute;n de Xhal&rsquo;Vareth', 'Las nubes quedaron atrapadas bajo tu sombra.', 'Gana 35 torneos.', 35],
    ['El Trono Perdido de Etherion', 'Las viejas alturas finalmente encontraron due&ntilde;o.', 'Gana 50 torneos.', 50],
    ['El Monarca del Horizonte Helado', 'M&aacute;s arriba de las tormentas... segu&iacute;as ascendiendo.', 'Gana 75 torneos.', 75],
    ['El &Uacute;ltimo Soberano de las Nieves Eternas', 'Cuando la monta&ntilde;a necesit&oacute; una leyenda... apareciste t&uacute;.', 'Gana 100 torneos.', 100],
    ['El Eclipse de las Cumbres Antiguas', 'Las monta&ntilde;as guardaron silencio tras tu victoria.', 'Gana 150 torneos.', 150],
    ['La Corona de Aethernia', 'Tu nombre alcanz&oacute; donde nacen las leyendas del hielo.', 'Gana 200 torneos.', 200],
  ]
  const logrosUnaVida = [
    ['El &Uacute;ltimo Aliento de Kaelor', 'La monta&ntilde;a crey&oacute; que caer&iacute;as primero.', 'Sobrevive 20 segundos con 1 vida.', 20],
    ['Sangre sobre la Escarcha', 'El fr&iacute;o no logr&oacute; apagar tu ascenso.', 'Sobrevive 30 segundos con 1 vida.', 30],
    ['El Pulso de la Cornisa Negra', 'Cada segundo parec&iacute;a el &uacute;ltimo.', 'Sobrevive 45 segundos con 1 vida.', 45],
    ['La Vigilia del Herido', 'Tus pasos continuaron incluso al borde del abismo.', 'Sobrevive 1 minuto con 1 vida.', 60],
    ['El Coraz&oacute;n de Valkerys', 'La tormenta esperaba verte caer... y fall&oacute;.', 'Sobrevive 90 segundos con 1 vida.', 90],
    ['El Refugio del &Uacute;ltimo Escalador', 'Las alturas comenzaron a respetar tu resistencia.', 'Sobrevive 2 minutos con 1 vida.', 120],
    ['La Llama Bajo la Nieve', 'Algo dentro de ti sigui&oacute; ardiendo contra el hielo.', 'Sobrevive 3 minutos con 1 vida.', 180],
    ['El Juramento de las Cumbres Eternas', 'La ca&iacute;da estuvo cerca demasiadas veces.', 'Sobrevive 4 minutos con 1 vida.', 240],
    ['El Eco del Invicto Blanco', 'La monta&ntilde;a dej&oacute; de intentar detenerte.', 'Sobrevive 5 minutos con 1 vida.', 300],
    ['El &Uacute;ltimo Guardi&aacute;n de Etherion', 'Ni el vac&iacute;o ni la tormenta lograron reclamarte.', 'Sobrevive 6 minutos con 1 vida.', 360],
    ['La Reliquia del Sobreviviente', 'Tus heridas comenzaron a parecer parte de la leyenda.', 'Sobrevive una partida completa con 1 vida.', null],
    ['El Nombre que No Cay&oacute;', 'Incluso la monta&ntilde;a perdi&oacute; la paciencia contigo.', 'Sobrevive 8 minutos con 1 vida.', 480],
    ['El Ascenso del Heraldo Gris', 'Tus manos siguieron avanzando pese al agotamiento.', 'Sobrevive 10 minutos con 1 vida.', 600],
  ]
  const logrosDosVidas = [
    ['Las Dos Llamas de Aerthys', 'Todav&iacute;a quedaban fuerzas... y la monta&ntilde;a lo sab&iacute;a.', 'Sobrevive 20 segundos con 2 vidas.', 20],
    ['El Sendero de las Nieves Rojas', 'Cada paso dej&oacute; marcas invisibles sobre el hielo.', 'Sobrevive 30 segundos con 2 vidas.', 30],
    ['El Vig&iacute;a del Abismo Blanco', 'Las alturas comenzaron a observar tu resistencia.', 'Sobrevive 45 segundos con 2 vidas.', 45],
    ['El Pulso de la Escarcha Eterna', 'El fr&iacute;o mord&iacute;a la roca, pero no tu voluntad.', 'Sobrevive 1 minuto con 2 vidas.', 60],
    ['La Reliquia de Kael&rsquo;Thor', 'Tus botas siguieron avanzando sobre cornisas imposibles.', 'Sobrevive 90 segundos con 2 vidas.', 90],
    ['El Refugio de las Sombras Nevadas', 'Las tormentas comenzaron a rodearte en silencio.', 'Sobrevive 2 minutos con 2 vidas.', 120],
    ['La Corona del Viento Gris', 'El vac&iacute;o qued&oacute; bajo tus pies una vez m&aacute;s.', 'Sobrevive 3 minutos con 2 vidas.', 180],
    ['El Juramento de Valkareth', 'Las monta&ntilde;as antiguas reconocieron tu perseverancia.', 'Sobrevive 4 minutos con 2 vidas.', 240],
    ['El Horizonte de Noctyra', 'Las cumbres dejaron de parecer inalcanzables.', 'Sobrevive 5 minutos con 2 vidas.', 300],
    ['La Vigilia del Escalador Carmes&iacute;', 'Tus movimientos resistieron incluso bajo la tormenta.', 'Sobrevive 6 minutos con 2 vidas.', 360],
    ['El Eco de las Alturas Eternas', 'La monta&ntilde;a comenz&oacute; a guardar memoria de tus pasos.', 'Sobrevive una partida completa con 2 vidas.', null],
    ['El Guardi&aacute;n del Pico Sombr&iacute;o', 'Muy pocos llegan tan lejos sin desaparecer en la nieve.', 'Sobrevive 8 minutos con 2 vidas.', 480],
    ['Las Campanas de Etherion', 'Cada segundo vivo parec&iacute;a una victoria robada al abismo.', 'Sobrevive 10 minutos con 2 vidas.', 600],
  ]

  return [
    ...logrosAltura.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: mejorAlturaMetros >= requisito,
    })),
    ...logrosPuntos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: puntosTotal >= requisito,
    })),
    ...logrosPartidas.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: partidasJugadas >= requisito,
    })),
    ...logrosTorneos.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: victoriasTorneos >= requisito,
    })),
    ...logrosUnaVida.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: requisito === null ? partidasUnaVida >= 1 : mejorTiempoUnaVida >= requisito,
    })),
    ...logrosDosVidas.map(([title, description, howTo, requisito]) => ({
      title,
      description,
      howTo,
      unlocked: requisito === null ? partidasDosVidas >= 1 : mejorTiempoDosVidas >= requisito,
    })),
  ]
}

function crearLogrosAjedrez(stats) {
  return [
    {
      title: 'La Corona del Silencio',
      description: 'El tablero call&oacute; cuando entendi&oacute; qui&eacute;n mandaba.',
      howTo: 'Gana una partida sin perder ninguna pieza.',
      unlocked: (stats.ajedrez_victorias_sin_perder_piezas || 0) >= 1,
    },
    {
      title: '&Uacute;ltimo Or&aacute;culo',
      description: 'Vi el jaque mate diez movimientos antes de que naciera.',
      howTo: 'Realiza un mate forzado despu&eacute;s de sacrificar tu reina.',
      unlocked: (stats.ajedrez_mate_tras_sacrificar_reina || 0) >= 1,
    },
    {
      title: 'Sombras sobre Eryndor',
      description: 'Los reyes tiemblan cuando las sombras aprenden a jugar.',
      howTo: 'Gana una partida utilizando &uacute;nicamente piezas menores y peones en el final.',
      unlocked: (stats.ajedrez_final_menores_peones || 0) >= 1,
    },
    {
      title: 'El Pacto de las Cenizas',
      description: 'De las ruinas de mi reino levant&eacute; la victoria.',
      howTo: 'Remonta una partida despu&eacute;s de estar con 15 puntos de material abajo.',
      unlocked: (stats.ajedrez_remontada_15_material || 0) >= 1,
    },
    {
      title: 'La Vigilia del Cuervo Blanco',
      description: 'Nadie entendi&oacute; el sacrificio... hasta que fue demasiado tarde.',
      howTo: 'Sacrifica dos piezas consecutivas y gana la partida.',
      unlocked: (stats.ajedrez_dos_sacrificios_consecutivos || 0) >= 1,
    },
    {
      title: 'Los Ecos de Nhar&rsquo;Zul',
      description: 'Cada movimiento dej&oacute; una cicatriz en el tiempo.',
      howTo: 'Juega una partida de m&aacute;s de 80 movimientos y gana.',
      unlocked: (stats.ajedrez_victorias_80_movimientos || 0) >= 1,
    },
    {
      title: 'El Trono Vac&iacute;o',
      description: 'El rey sobrevivi&oacute;, aunque todo lo dem&aacute;s pereci&oacute;.',
      howTo: 'Gana teniendo &uacute;nicamente al rey y un pe&oacute;n contra varias piezas enemigas.',
      unlocked: (stats.ajedrez_rey_peon_vs_piezas || 0) >= 1,
    },
    {
      title: 'L&aacute;grimas del Tit&aacute;n Negro',
      description: 'Hasta los gigantes caen cuando el destino mueve primero.',
      howTo: 'Derrota a un jugador con mucho mayor rango que t&uacute;.',
      unlocked: (stats.ajedrez_derrota_mayor_rango || 0) >= 1,
    },
    {
      title: 'El Ritual de las Trece Lunas',
      description: 'Cada jugada fue una ofrenda al caos.',
      howTo: 'Encadena 13 movimientos consecutivos sin cometer errores seg&uacute;n el an&aacute;lisis del juego.',
      unlocked: (stats.ajedrez_racha_13_sin_errores || 0) >= 1,
    },
    {
      title: 'La Puerta de Obsidiana',
      description: 'Entr&oacute; como aprendiz. Sali&oacute; como leyenda.',
      howTo: 'Gana 50 partidas clasificatorias.',
      unlocked: (stats.ajedrez_victorias_clasificatorias || 0) >= 50,
    },
    {
      title: 'El Susurro del Rey Ca&iacute;do',
      description: 'Escuch&eacute; el miedo detr&aacute;s del jaque.',
      howTo: 'Forza al enemigo a permanecer en jaque durante 5 turnos seguidos.',
      unlocked: (stats.ajedrez_jaque_5_turnos || 0) >= 1,
    },
    {
      title: 'Fuego en los Jardines de Helkar',
      description: 'Las diagonales ardieron bajo mi voluntad.',
      howTo: 'Gana una partida utilizando ambos alfiles para ejecutar el mate final.',
      unlocked: (stats.ajedrez_mate_dos_alfiles || 0) >= 1,
    },
    {
      title: 'La Danza del Abismo',
      description: 'Cada paso cerca de la derrota hizo m&aacute;s dulce la victoria.',
      howTo: 'Gana con menos de 10 segundos restantes en el reloj.',
      unlocked: (stats.ajedrez_victoria_menos_10s || 0) >= 1,
    },
    {
      title: 'El Heredero del Vac&iacute;o',
      description: 'No nac&iacute; para defender reinos... nac&iacute; para destruirlos.',
      howTo: 'Consigue jaque mate antes del movimiento 15.',
      unlocked: (stats.ajedrez_mate_antes_15 || 0) >= 1,
    },
    {
      title: 'Los Mil Ojos de Vareth',
      description: 'Nada escap&oacute; a mi mirada.',
      howTo: 'Detecta y castiga tres errores consecutivos del rival en una misma partida.',
      unlocked: (stats.ajedrez_castiga_3_errores || 0) >= 1,
    },
    {
      title: 'La Catedral de Huesos',
      description: 'Constru&iacute; mi victoria sobre los restos de los imprudentes.',
      howTo: 'Captura todas las piezas mayores enemigas antes del mate final.',
      unlocked: (stats.ajedrez_captura_mayores_antes_mate || 0) >= 1,
    },
    {
      title: 'El Eclipse del Monarca',
      description: 'Cuando la luz muri&oacute;, mi rey a&uacute;n respiraba.',
      howTo: 'Gana una partida sin enrocarte.',
      unlocked: (stats.ajedrez_victoria_sin_enrocar || 0) >= 1,
    },
    {
      title: 'El Guardi&aacute;n de la Octava Fila',
      description: 'Nadie cruza el umbral de los inmortales.',
      howTo: 'Corona tres peones en una sola partida.',
      unlocked: (stats.ajedrez_3_promociones || 0) >= 1,
    },
    {
      title: 'La Profec&iacute;a de Kael&rsquo;Thir',
      description: 'El destino ya estaba escrito en el primer movimiento.',
      howTo: 'Gana una partida usando exactamente la misma apertura durante 10 victorias consecutivas.',
      unlocked: (stats.ajedrez_mejor_racha_apertura || 0) >= 10,
    },
    {
      title: 'Donde Mueren los Reyes',
      description: 'Al final de todas las guerras... solo qued&oacute; mi nombre.',
      howTo: 'Convi&eacute;rtete en campe&oacute;n de un torneo invicto.',
      unlocked: (stats.ajedrez_campeon_invicto || 0) >= 1,
    },
    {
      title: 'El Ojo de Dren&rsquo;Kai',
      description: 'Nada escap&oacute; a tu dominio del tablero.',
      howTo: 'Gana 14 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 14,
    },
    {
      title: 'La Profec&iacute;a del Rey Negro',
      description: 'Todo estaba escrito desde tu primer movimiento.',
      howTo: 'Gana 15 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 15,
    },
    {
      title: 'Las Ruinas de Elyrion',
      description: 'Construiste tu imperio sobre derrotas ajenas.',
      howTo: 'Gana 15 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 15,
    },
    {
      title: 'El Ascenso de Drak&rsquo;Thul',
      description: 'Los d&eacute;biles rezan. Los reyes conquistan.',
      howTo: 'Gana 20 torneos seguidos sin bajar del primer puesto.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 20,
    },
    {
      title: 'El Juicio de las Cenizas',
      description: 'Solo aquellos que sobreviven al fuego merecen la corona.',
      howTo: 'Gana 30 torneos seguidos sin bajar del primer puesto.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 30,
    },
    {
      title: 'La &Uacute;ltima Marcha de Vorynth',
      description: 'Cada paso hacia la victoria fue una sentencia.',
      howTo: 'Gana 39 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 39,
    },
    {
      title: 'El Pacto Carmes&iacute;',
      description: 'La sangre del rey enemigo sell&oacute; tu destino.',
      howTo: 'Gana 53 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 53,
    },
    {
      title: 'El Reino sin Amanecer',
      description: 'Tras tu victoria, no volvi&oacute; a salir el sol.',
      howTo: 'Gana 75 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 75,
    },
    {
      title: 'La Llama de Morghast',
      description: 'El fuego consume. T&uacute; conquistaste.',
      howTo: 'Gana 96 torneos consecutivas.',
      unlocked: (stats.mejor_racha_victorias_torneos || 0) >= 96,
    },
    {
      title: 'La Noche de Vaelor',
      description: 'El tablero record&oacute; tu nombre con miedo.',
      howTo: 'Gana 5 torneos consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 5,
    },
    {
      title: 'El Eclipse de Nythera',
      description: 'Cuando lleg&oacute; tu sombra, el rey dej&oacute; de respirar.',
      howTo: 'Gana 25 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 25,
    },
    {
      title: 'Los Susurros de Vhalakor',
      description: 'Cada mate fue una sentencia escrita en oscuridad.',
      howTo: 'Gana 47 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 47,
    },
    {
      title: 'La Tumba de Aerthos',
      description: 'Los reyes ca&iacute;dos a&uacute;n pronuncian tu nombre.',
      howTo: 'Gana 58 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 58,
    },
    {
      title: 'El Trono de Ceniza Negra',
      description: 'El final siempre fue inevitable.',
      howTo: 'Gana 77 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 77,
    },
    {
      title: 'El C&aacute;ntico de Morraith',
      description: 'La &uacute;ltima jugada son&oacute; como una campana funeraria.',
      howTo: 'Gana 92 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 92,
    },
    {
      title: 'Las Sombras de Veyrath',
      description: 'Nadie escap&oacute; del destino que trazaste.',
      howTo: 'Gana 127 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 127,
    },
    {
      title: 'El &Uacute;ltimo Rey de Dravenhal',
      description: 'Solo uno pod&iacute;a permanecer sobre el tablero.',
      howTo: 'Gana 137 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 137,
    },
    {
      title: 'La Maldici&oacute;n de Thornek',
      description: 'Cada victoria enterr&oacute; otro reino.',
      howTo: 'Gana 147 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 147,
    },
    {
      title: 'El Ocaso Carmes&iacute;',
      description: 'El tablero ardi&oacute; bajo tu &uacute;ltima jugada.',
      howTo: 'Gana 177 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 177,
    },
    {
      title: 'La Profec&iacute;a de Umbrael',
      description: 'El rey cay&oacute; exactamente como fue anunciado.',
      howTo: 'Gana 207 partidas consecutivas terminando con jaque mate.',
      unlocked: (stats.ajedrez_mejor_racha_mate || 0) >= 207,
    },
    {
      title: 'El Trono de Umbraxis',
      description: 'Nadie vio venir al verdadero soberano.',
      howTo: 'Gana 7 torneos consecutivas usando aperturas diferentes.',
      unlocked: (stats.ajedrez_mejor_racha_aperturas_diferentes || 0) >= 7,
    },
    {
      title: 'La Ca&iacute;da de Arkaneth',
      description: 'Incluso los gigantes terminan arrodillados.',
      howTo: 'Gana 3 torneos seguidas en menos de 25 movimientos.',
      unlocked: (stats.ajedrez_mejor_racha_menos_25_movimientos || 0) >= 3,
    },
    {
      title: 'El Eco de los Mil Reyes',
      description: 'Cada victoria despert&oacute; un antiguo temor.',
      howTo: 'Gana 10 torneos consecutivas sin terminar en tablas.',
      unlocked: (stats.ajedrez_mejor_racha_sin_tablas || 0) >= 10,
    },
    {
      title: 'La Marca de Nethor',
      description: 'Tu estrategia dej&oacute; cicatrices eternas.',
      howTo: 'Gana 5 torneos seguidas sacrificando al menos una pieza.',
      unlocked: (stats.ajedrez_mejor_racha_sacrificio || 0) >= 5,
    },
    {
      title: 'El Despertar del Vac&iacute;o',
      description: 'Cuando abriste los ojos, el reino ya hab&iacute;a ca&iacute;do.',
      howTo: 'Gana 8 torneos consecutivas sin perder ninguna torre.',
      unlocked: (stats.ajedrez_mejor_racha_sin_perder_torre || 0) >= 8,
    },
    {
      title: 'Los Susurros de Valkerys',
      description: 'La derrota del enemigo comenz&oacute; antes del primer movimiento.',
      howTo: 'Gana 6 torneos consecutivas realizando jaque antes del movimiento 10.',
      unlocked: (stats.ajedrez_mejor_racha_jaque_antes_10 || 0) >= 6,
    },
    {
      title: 'El Legado de Thar&rsquo;Zul',
      description: 'Las leyendas nacen donde otros abandonan.',
      howTo: 'Gana 12 torneos consecutivas remontando desventaja material.',
      unlocked: (stats.ajedrez_mejor_racha_remontada_material || 0) >= 12,
    },
    {
      title: 'La Corona del Exiliado',
      description: 'Desterrado del reino... coronado por el destino.',
      howTo: 'Gana 5 torneos consecutivas despu&eacute;s de haber perdido una partida previa.',
      unlocked: (stats.ajedrez_mejor_racha_victoria_tras_derrota || 0) >= 5,
    },
  ]
}

function crearLogrosDomino(stats) {
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaTop10 = stats.mejor_racha_top10_torneos || 0
  const mejorRachaInvicto = stats.domino_mejor_racha_invicto || 0

  return [
    {
      title: 'El Imperio de Marfil Negro',
      description: 'Cada ficha colocada sell&oacute; otra victoria.',
      howTo: 'Gana 3 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 3,
    },
    {
      title: 'La Mesa de los Ca&iacute;dos',
      description: 'Nadie logr&oacute; romper tu racha.',
      howTo: 'Gana 5 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 5,
    },
    {
      title: 'El Legado de Varkhul',
      description: 'Las fichas obedecieron tu voluntad.',
      howTo: 'Gana 7 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 7,
    },
    {
      title: 'La Sombra del &Uacute;ltimo Jugador',
      description: 'Cuando te sentaste en la mesa, el destino ya estaba escrito.',
      howTo: 'Gana 4 torneos consecutivos sin perder una ronda.',
      unlocked: mejorRachaInvicto >= 4,
    },
    {
      title: 'El Trono de las Seis Caras',
      description: 'Los maestros del domin&oacute; inclinaron la cabeza ante ti.',
      howTo: 'Gana 10 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'El Pacto de las Fichas Eternas',
      description: 'Tu racha convirti&oacute; la mesa en territorio prohibido.',
      howTo: 'Gana 6 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 6,
    },
    {
      title: 'La Maldici&oacute;n de Korvath',
      description: 'Cada torneo ganado dej&oacute; otro rival en ruinas.',
      howTo: 'Gana 8 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 8,
    },
    {
      title: 'Los Ecos de la Mesa Oscura',
      description: 'Las fichas a&uacute;n recuerdan tu dominio absoluto.',
      howTo: 'Gana 12 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 12,
    },
    {
      title: 'El Ascenso de Draemor',
      description: 'No jugabas para ganar... jugabas para conquistar.',
      howTo: 'Gana 15 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 15,
    },
    {
      title: 'El Fin de los Invictos',
      description: 'Tu nombre termin&oacute; con todas las leyendas.',
      howTo: 'Gana 20 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 20,
    },
    {
      title: 'El Despertar de Nocthar',
      description: 'La mesa guard&oacute; silencio ante tu primera conquista.',
      howTo: 'Gana 33 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 33,
    },
    {
      title: 'Las Cenizas de Velkorr',
      description: 'Cada victoria aliment&oacute; una leyenda prohibida.',
      howTo: 'Gana 45 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 45,
    },
    {
      title: 'El Trono del Sexto Sello',
      description: 'Nadie pudo detener el avance de tu imperio.',
      howTo: 'Gana 87 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 87,
    },
    {
      title: 'La Profec&iacute;a de Umbrek',
      description: 'Tu dominio fue anunciado mucho antes de la primera ficha.',
      howTo: 'Gana 100 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 100,
    },
    {
      title: 'El Reino de las Fichas Perdidas',
      description: 'Los derrotados desaparecieron bajo tu sombra.',
      howTo: 'Gana 120 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 120,
    },
    {
      title: 'La Corona de Drael&rsquo;Vor',
      description: 'La mesa ya no distingu&iacute;a entre jugador y monstruo.',
      howTo: 'Gana 150 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 150,
    },
    {
      title: 'Los Susurros de Karzeth',
      description: 'Cada torneo ganado despert&oacute; nuevos temores.',
      howTo: 'Gana 180 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 180,
    },
    {
      title: 'La Noche del Dominio Eterno',
      description: 'Las fichas cayeron una tras otra ante tu voluntad.',
      howTo: 'Gana 200 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 200,
    },
    {
      title: 'El Juicio de Mordrake',
      description: 'Tu racha convirti&oacute; la esperanza en ruinas.',
      howTo: 'Gana 220 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 220,
    },
    {
      title: 'El Legado del Rey Vac&iacute;o',
      description: 'No dejaste rivales... solo recuerdos.',
      howTo: 'Gana 250 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 250,
    },
    {
      title: 'La Mesa de los Mil Ecos',
      description: 'Cada victoria repet&iacute;a tu nombre como una maldici&oacute;n.',
      howTo: 'Gana 300 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 300,
    },
    {
      title: 'El Eclipse de Var&rsquo;Khal',
      description: 'Cuando llegaste, la gloria de otros desapareci&oacute;.',
      howTo: 'Termina top 10 en 35 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 35,
    },
    {
      title: 'La &Uacute;ltima Ficha de Nareth',
      description: 'El destino del torneo siempre terminaba en tus manos.',
      howTo: 'Termina top 10 en 40 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 40,
    },
    {
      title: 'Las Ruinas de Thal&rsquo;Kor',
      description: 'Construiste tu reinado sobre generaciones derrotadas.',
      howTo: 'Termina top 10 en 45 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 45,
    },
    {
      title: 'El Guardi&aacute;n del Abismo Blanco',
      description: 'Nadie cruz&oacute; la frontera de tu dominio.',
      howTo: 'Termina top 10 en 50 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 50,
    },
    {
      title: 'El Ocaso de Vel&rsquo;Thar',
      description: 'Las mesas quedaron vac&iacute;as despu&eacute;s de tu paso.',
      howTo: 'Termina top 10 en 60 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 60,
    },
    {
      title: 'La Maldici&oacute;n del Emperador Gris',
      description: 'Cada torneo ganado apag&oacute; otra esperanza.',
      howTo: 'Termina top 10 en 70 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 70,
    },
    {
      title: 'El Portal de las Fichas Eternas',
      description: 'Tu racha trascendi&oacute; toda l&oacute;gica humana.',
      howTo: 'Termina top 10 en 80 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 80,
    },
    {
      title: 'El Fin de Arkhazar',
      description: 'Hasta las leyendas abandonaron la mesa.',
      howTo: 'Termina top 10 en 90 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 90,
    },
    {
      title: 'La Eternidad de Morvhaal',
      description: 'Tu nombre qued&oacute; grabado m&aacute;s all&aacute; del &uacute;ltimo torneo.',
      howTo: 'Termina top 10 en 100 torneos consecutivos.',
      unlocked: mejorRachaTop10 >= 100,
    },
  ]
}

function crearLogrosDamas(stats) {
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaSegundo = stats.damas_mejor_racha_segundo || 0
  const mejorRachaTercero = stats.damas_mejor_racha_tercero || 0

  return [
    {
      title: 'El Ascenso de Vol&rsquo;kol',
      description: 'Las coronas comenzaron a inclinarse ante ti.',
      howTo: 'Gana 3 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 3,
    },
    {
      title: 'La Sangre de los Cuatro Reinos',
      description: 'Cada tablero conquistado aliment&oacute; tu leyenda.',
      howTo: 'Gana 5 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 5,
    },
    {
      title: 'El Trono Carmes&iacute; de Nareth',
      description: 'Las damas enemigas desaparecieron bajo tu sombra.',
      howTo: 'Gana 7 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 7,
    },
    {
      title: 'Los Ecos de Nalkgot',
      description: 'Tu dominio reson&oacute; en cada rinc&oacute;n del tablero.',
      howTo: 'Gana 10 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'La Corona del Vac&iacute;o Blanco',
      description: 'Nadie logr&oacute; arrebatarte el primer puesto.',
      howTo: 'Gana 12 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 12,
    },
    {
      title: 'El Juicio de Mor&rsquo;Draven',
      description: 'Los campeones cayeron uno tras otro.',
      howTo: 'Gana 15 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 15,
    },
    {
      title: 'La Niebla de Tharvok',
      description: 'Tu nombre se volvi&oacute; sin&oacute;nimo de derrota ajena.',
      howTo: 'Gana 18 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 18,
    },
    {
      title: 'El Reino de las Damas Eternas',
      description: 'Cada torneo fortaleci&oacute; tu imperio silencioso.',
      howTo: 'Gana 20 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 20,
    },
    {
      title: 'El Eclipse de Vorath',
      description: 'El tablero perdi&oacute; la esperanza de vencerte.',
      howTo: 'Gana 25 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 25,
    },
    {
      title: 'La Profec&iacute;a de Kael&rsquo;Mor',
      description: 'El campe&oacute;n eterno finalmente despert&oacute;.',
      howTo: 'Gana 30 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 30,
    },
    {
      title: 'Las Cenizas de Drakoryn',
      description: 'No dejaste m&aacute;s que ruinas tras cada victoria.',
      howTo: 'Gana 35 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 35,
    },
    {
      title: 'El &Uacute;ltimo Emperador del Tablero',
      description: 'Las coronas rivales dejaron de tener valor.',
      howTo: 'Gana 40 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 40,
    },
    {
      title: 'La Maldici&oacute;n de Vhal&rsquo;Kreth',
      description: 'Cada torneo ganado enterr&oacute; otra leyenda.',
      howTo: 'Gana 45 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 45,
    },
    {
      title: 'El Ocaso de las Reinas Negras',
      description: 'El tablero se rindi&oacute; antes de empezar.',
      howTo: 'Gana 50 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 50,
    },
    {
      title: 'La Tumba de Elyrath',
      description: 'Los grandes maestros desaparecieron en tu camino.',
      howTo: 'Gana 60 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 60,
    },
    {
      title: 'El Guardi&aacute;n del Trono Sombr&iacute;o',
      description: 'Nadie cruz&oacute; el l&iacute;mite de tu dominio.',
      howTo: 'Gana 70 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 70,
    },
    {
      title: 'La Llama de Korveth',
      description: 'Tu racha ardi&oacute; m&aacute;s all&aacute; de toda l&oacute;gica.',
      howTo: 'Gana 80 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 80,
    },
    {
      title: 'Los Mil Tableros Ca&iacute;dos',
      description: 'Cada victoria a&ntilde;adi&oacute; otro reino a tu imperio.',
      howTo: 'Gana 90 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 90,
    },
    {
      title: 'El Fin de las Coronas Eternas',
      description: 'Hasta los invictos se arrodillaron ante ti.',
      howTo: 'Gana 100 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 100,
    },
    {
      title: 'La Eternidad de Vhaelor',
      description: 'Tu nombre qued&oacute; grabado en cada tablero conquistado.',
      howTo: 'Gana 120 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 120,
    },
    {
      title: 'El Ascenso de Velkar',
      description: 'El tablero inclin&oacute; su voluntad ante tu inicio.',
      howTo: 'Termina en 2er puesto en 2 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 2,
    },
    {
      title: 'La Marca de Therys',
      description: 'Cada victoria dej&oacute; una huella imposible de borrar.',
      howTo: 'Termina en 2er puesto en 3 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 3,
    },
    {
      title: 'El Trono de Khar&rsquo;Vel',
      description: 'Los reyes de damas reconocieron a su nuevo amo.',
      howTo: 'Termina en 2er puesto en 4 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 4,
    },
    {
      title: 'La Senda de Umbriel',
      description: 'Nadie logr&oacute; desviarte del destino marcado.',
      howTo: 'Termina en 2er puesto en 5 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 5,
    },
    {
      title: 'El Juramento de Valkor',
      description: 'Prometiste dominar... y cumpliste.',
      howTo: 'Termina en 2er puesto en 6 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 6,
    },
    {
      title: 'Las Sombras de Nareth',
      description: 'Cada torneo fue otro reino conquistado.',
      howTo: 'Termina en 2er puesto en 7 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 7,
    },
    {
      title: 'El Legado de Mor&rsquo;Thal',
      description: 'Tu nombre empez&oacute; a repetirse como una advertencia.',
      howTo: 'Termina en 2er puesto en 8 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 8,
    },
    {
      title: 'La Corona de Drezkal',
      description: 'El dominio ya no era casualidad... era ley.',
      howTo: 'Termina en 2er puesto en 9 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 9,
    },
    {
      title: 'El Eclipse de Varenth',
      description: 'Cuando jugabas, la luz de otros se apagaba.',
      howTo: 'Termina en 2er puesto en 10 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 10,
    },
    {
      title: 'El Reino de las Fichas Rojas',
      description: 'La victoria siempre eligi&oacute; tu lado.',
      howTo: 'Termina en 3er puesto en 12 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 12,
    },
    {
      title: 'El Juicio de Khaelor',
      description: 'Los rivales enfrentaron su destino al sentarse contigo.',
      howTo: 'Termina en 3er puesto en 14 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 14,
    },
    {
      title: 'La Profec&iacute;a de Zaryth',
      description: 'Todo estaba escrito desde tu primera jugada.',
      howTo: 'Termina en 3er puesto en 16 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 16,
    },
    {
      title: 'El Ocaso de Vel&rsquo;Rath',
      description: 'Las derrotas ajenas marcaron tu camino.',
      howTo: 'Termina en 3er puesto en 18 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 18,
    },
    {
      title: 'La Eternidad de Mor&rsquo;Khael',
      description: 'El tiempo dej&oacute; de importar ante tu dominio.',
      howTo: 'Termina en 3er puesto en 20 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 20,
    },
    {
      title: 'Las Ruinas de Thar&rsquo;Zel',
      description: 'Construiste tu imperio sobre campeones ca&iacute;dos.',
      howTo: 'Termina en 3er puesto en 25 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 25,
    },
    {
      title: 'El Trono Inquebrantable',
      description: 'Nadie pudo arrebatarte la cima.',
      howTo: 'Termina en 2er puesto en 30 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 30,
    },
    {
      title: 'La Maldici&oacute;n de Vornath',
      description: 'Cada torneo sell&oacute; el destino de otro rival.',
      howTo: 'Termina en 2er puesto en 35 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 35,
    },
    {
      title: 'El Portal de Damas Eternas',
      description: 'Tu racha trascendi&oacute; toda l&oacute;gica.',
      howTo: 'Termina en 2er puesto en 40 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 40,
    },
    {
      title: 'El Fin de los Aspirantes',
      description: 'Ya no quedaban contendientes dignos.',
      howTo: 'Termina en 3er puesto en 45 torneos consecutivos.',
      unlocked: mejorRachaTercero >= 45,
    },
    {
      title: 'El Nombre que Perdura',
      description: 'M&aacute;s all&aacute; de la &uacute;ltima partida... solo quedaste t&uacute;.',
      howTo: 'Termina en 2er puesto en 50 torneos consecutivos.',
      unlocked: mejorRachaSegundo >= 50,
    },
  ]
}

function crearLogrosNumcatch(stats) {
  const mejorRachaAciertosVictoria = stats.numcatch_mejor_racha_aciertos_victoria || 0
  const minErroresVictoria = typeof stats.numcatch_min_errores_victoria === 'number'
    ? stats.numcatch_min_errores_victoria
    : null
  const victorias1Error = stats.numcatch_victorias_1_error || 0
  const victorias2Errores = stats.numcatch_victorias_2_errores || 0
  const victoriasMenos14Errores = stats.numcatch_victorias_menos_14_errores || 0
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const top3Torneos = stats.top3_torneos || 0
  const victoriaTrasFueraPodio = stats.numcatch_victoria_tras_fuera_podio || 0
  const mejorRachaTop3SinBajar = stats.numcatch_mejor_racha_top3_sin_bajar || 0
  const mejorRachaVictorias400 = stats.numcatch_mejor_racha_victorias_400 || 0
  const mejorRachaVictorias1200 = stats.numcatch_mejor_racha_victorias_1200 || 0

  return [
    {
      title: 'El Veredicto de Astryx',
      description: 'Cuando todo termina... solo quedo yo.',
      howTo: 'Gana un torneo superando los 500 aciertos seguidos.',
      unlocked: mejorRachaAciertosVictoria > 500,
    },
    {
      title: 'El Fragmento de Lurien',
      description: 'Una pieza... suficiente para dominar.',
      howTo: 'Gana un torneo con menos de 40 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 40,
    },
    {
      title: 'El Sello de Kaeroth',
      description: 'Cada fallo evitado... suma poder.',
      howTo: 'Gana un torneo con menos de 35 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 35,
    },
    {
      title: 'Pureza de Vhalion',
      description: 'La perfecci&oacute;n no es un mito.',
      howTo: 'Gana un torneo con menos de 30 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 30,
    },
    {
      title: 'El C&oacute;digo de Iryx',
      description: 'Todo sigue una l&oacute;gica impecable.',
      howTo: 'Gana un torneo con menos de 25 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 25,
    },
    {
      title: 'Juicio de Thalnor',
      description: 'Aqu&iacute; se mide la precisi&oacute;n real.',
      howTo: 'Gana un torneo con menos de 20 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 20,
    },
    {
      title: 'El Pulso de Zarek',
      description: 'Ni un solo temblor.',
      howTo: 'Gana un torneo con menos de 18 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 18,
    },
    {
      title: 'Trono de Elyssar',
      description: 'Solo los m&aacute;s precisos llegan aqu&iacute;.',
      howTo: 'Gana un torneo con menos de 15 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 15,
    },
    {
      title: 'La Marca de Orven',
      description: 'Cada movimiento... exacto.',
      howTo: 'Gana un torneo con menos de 12 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 12,
    },
    {
      title: 'Dominio de Khyron',
      description: 'El error pierde significado.',
      howTo: 'Gana un torneo con menos de 10 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 10,
    },
    {
      title: 'La Ruta de Veylor',
      description: 'Camino limpio hasta la cima.',
      howTo: 'Gana un torneo con menos de 9 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 9,
    },
    {
      title: 'El Ojo de Myrion',
      description: 'Nada se escapa.',
      howTo: 'Gana un torneo con menos de 8 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 8,
    },
    {
      title: 'Silencio de Drathis',
      description: 'Ni un fallo hace ruido.',
      howTo: 'Gana un torneo con menos de 7 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 7,
    },
    {
      title: 'El N&uacute;cleo de Xaleth',
      description: 'Todo permanece estable.',
      howTo: 'Gana un torneo con menos de 6 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 6,
    },
    {
      title: 'Pureza absoluta',
      description: 'Esto ya no es humano.',
      howTo: 'Gana un torneo con menos de 5 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 5,
    },
    {
      title: 'El Velo de Nyrax',
      description: 'El error no logra cruzar.',
      howTo: 'Gana un torneo con menos de 4 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 4,
    },
    {
      title: 'La Esencia de Lorthan',
      description: 'Nada sobra... nada falla.',
      howTo: 'Gana un torneo con menos de 3 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 3,
    },
    {
      title: 'El Juicio perfecto',
      description: 'No hubo margen para dudar.',
      howTo: 'Gana un torneo con menos de 2 errores.',
      unlocked: minErroresVictoria !== null && minErroresVictoria < 2,
    },
    {
      title: 'Vac&iacute;o de error',
      description: 'No existi&oacute; el fallo.',
      howTo: 'Gana un torneo con 0 errores.',
      unlocked: minErroresVictoria === 0,
    },
    {
      title: 'El Origen de Kaelis',
      description: 'As&iacute; debi&oacute; ser desde el inicio.',
      howTo: 'Gana 15 torneos con exactamente 1 error.',
      unlocked: victorias1Error >= 15,
    },
    {
      title: 'Equilibrio de Varnox',
      description: 'Ni m&aacute;s... ni menos.',
      howTo: 'Gana 3 torneos con exactamente 2 errores.',
      unlocked: victorias2Errores >= 3,
    },
    {
      title: 'La Prueba de Eryndor',
      description: 'La precisi&oacute;n define al ganador.',
      howTo: 'Gana 5 torneos con menos de 14 errores.',
      unlocked: victoriasMenos14Errores >= 5,
    },
    {
      title: 'El N&uacute;cleo de Theryon',
      description: 'Todo gira a mi alrededor.',
      howTo: 'Gana 2 torneos consecutivos con m&aacute;s de 400 puntos.',
      unlocked: mejorRachaVictorias400 >= 2,
    },
    {
      title: 'El Eco de Dravok',
      description: 'La victoria se repite... sin explicaci&oacute;n.',
      howTo: 'Gana 4 torneos seguidos con m&aacute;s de 1200 puntos.',
      unlocked: mejorRachaVictorias1200 >= 4,
    },
    {
      title: 'Ascenso de Morvhal',
      description: 'No fue suerte... fue destino.',
      howTo: 'Gana 2 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 2,
    },
    {
      title: 'Cumbre de Elarion',
      description: 'El lugar m&aacute;s alto... y el m&aacute;s solitario.',
      howTo: 'Gana 5 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 5,
    },
    {
      title: 'El Juramento de Krynn',
      description: 'No fallar&eacute;... otra vez.',
      howTo: 'Gana 10 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'Dominio de Xerathis',
      description: 'No hay espacio para otros.',
      howTo: 'Gana 25 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 25,
    },
    {
      title: 'El Sello de Varok',
      description: 'Soy marcado como invencible.',
      howTo: 'Gana 36 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 36,
    },
    {
      title: 'Voluntad de Zenthra',
      description: 'No cedo... no dudo.',
      howTo: 'Gana 55 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 55,
    },
    {
      title: 'La Corona de Nyvex',
      description: 'No hay discusi&oacute;n... yo soy el rey.',
      howTo: 'Gana 75 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 75,
    },
    {
      title: 'El V&iacute;nculo de Artheon',
      description: 'Estoy conectado al triunfo.',
      howTo: 'Gana 88 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 88,
    },
    {
      title: 'El Final Infinito',
      description: 'Esto no termina... se transforma.',
      howTo: 'Gana 100 torneos seguidos sin bajar del primer puesto.',
      unlocked: mejorRachaVictorias >= 100,
    },
    {
      title: 'Sombras de Velkar',
      description: 'Nadie vio c&oacute;mo llegu&eacute;... pero llegu&eacute;.',
      howTo: 'Termina en el top 3 en 5 torneos diferentes.',
      unlocked: top3Torneos >= 5,
    },
    {
      title: 'La Llama de Iryth',
      description: 'Arde... y no se apaga.',
      howTo: 'Termina en el top 3 en 15 torneos diferentes.',
      unlocked: top3Torneos >= 15,
    },
    {
      title: 'El Tr&aacute;nsito de Noxar',
      description: 'Cruzo... y no regreso.',
      howTo: 'Termina en el top 3 en 25 torneos diferentes.',
      unlocked: top3Torneos >= 25,
    },
    {
      title: 'Rastro de Kelyth',
      description: 'Mi paso deja huella.',
      howTo: 'Termina en el top 3 en 36 torneos diferentes.',
      unlocked: top3Torneos >= 36,
    },
    {
      title: 'El Ocaso de Valenx',
      description: 'Cuando todos caen... yo sigo.',
      howTo: 'Gana un torneo despu&eacute;s de haber quedado fuera del podio en un torneo anterior.',
      unlocked: victoriaTrasFueraPodio >= 1,
    },
    {
      title: 'Senda de Orphion',
      description: 'Siempre hay un camino hacia arriba.',
      howTo: 'Termina en el top 3 en 46 torneos diferentes.',
      unlocked: top3Torneos >= 46,
    },
    {
      title: 'El Horizonte de Myrath',
      description: 'M&aacute;s all&aacute;... siempre m&aacute;s all&aacute;.',
      howTo: 'Termina en el top 3 en 8 torneos consecutivos sin bajar de posici&oacute;n.',
      unlocked: mejorRachaTop3SinBajar >= 8,
    },
    {
      title: 'Voluntad de Zenthra',
      description: 'No cedo... no dudo.',
      howTo: 'Termina en el top 3 en 28 torneos consecutivos sin bajar de posici&oacute;n.',
      unlocked: mejorRachaTop3SinBajar >= 28,
    },
  ]
}

function crearLogrosFlashmind(stats) {
  const mejorRachaCorrectas = stats.flashmind_mejor_racha_correctas || 0
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaTop3 = stats.mejor_racha_top3_torneos || 0
  const victoriasSinErrores = stats.victorias_sin_errores || 0
  const logros = [
    ['Encendido neuronal', 'Algo se activ&oacute;... y no se apag&oacute;.', 'Consigue 5 respuestas correctas seguidas.', 5],
    ['Chispa sostenida', 'Peque&ntilde;o inicio... gran se&ntilde;al.', 'Consigue 7 respuestas correctas consecutivas.', 7],
    ['Vector ascendente', 'Voy en subida constante.', 'Consigue 15 respuestas correctas seguidas.', 15],
    ['Pulso sincronizado', 'Todo late al mismo ritmo.', 'Consigue 17 respuestas correctas consecutivas.', 17],
    ['L&iacute;nea sin quiebre', 'Nada interrumpe el trazo.', 'Consigue 19 respuestas correctas seguidas.', 19],
    ['Tr&aacute;nsito limpio', 'Sin ruido... solo aciertos.', 'Consigue 21 respuestas correctas consecutivas.', 21],
    ['Frecuencia perfecta', 'Estoy en la misma onda.', 'Consigue 23 respuestas correctas seguidas.', 23],
    ['&Oacute;rbita estable', 'No me salgo del camino.', 'Consigue 31 respuestas correctas consecutivas.', 31],
    ['N&uacute;cleo activo', 'Todo gira alrededor de esto.', 'Consigue 37 respuestas correctas seguidas.', 37],
    ['El Umbral de Kairon', 'Algo antiguo despierta en silencio.', 'Consigue 44 respuestas correctas seguidas.', 44],
    ['Trayectoria pura', 'Cada paso tiene direcci&oacute;n.', 'Consigue 49 respuestas correctas consecutivas.', 49],
    ['Ciclo de Noctra', 'No termina... solo contin&uacute;a.', 'Consigue 48 respuestas correctas seguidas.', 48],
    ['Impulso constante', 'Nada desacelera.', 'Consigue 52 respuestas correctas seguidas.', 52],
    ['Ascenso de Kaelith', 'Subo... sin mirar atr&aacute;s.', 'Consigue 55 respuestas correctas consecutivas.', 55],
    ['Cascada de aciertos', 'Uno cae... luego otro... y otro.', 'Consigue 56 respuestas correctas consecutivas.', 56],
    ['Resonancia mental', 'Todo vibra igual.', 'Consigue 60 respuestas correctas seguidas.', 60],
    ['El Ojo de Virex', 'Nada escapa a mi vista.', 'Consigue 63 respuestas correctas seguidas.', 63],
    ['Susurro de Vantor', 'Escucho los n&uacute;meros antes de verlos.', 'Consigue 66 respuestas correctas consecutivas.', 66],
    ['Eje dominante', 'Todo gira bajo control.', 'Consigue 35 respuestas correctas consecutivas.', 35],
    ['Campo estable', 'Nada altera el equilibrio.', 'Consigue 40 respuestas correctas seguidas.', 40],
    ['Tramo invicto', 'No hay ruptura posible.', 'Consigue 45 respuestas correctas consecutivas.', 45],
    ['Matriz intacta', 'Todo sigue en orden perfecto.', 'Consigue 50 respuestas correctas seguidas.', 50],
    ['Arquitectura mental', 'Cada pieza encaja sin error.', 'Consigue 70 respuestas correctas consecutivas.', 70],
    ['Dominio de Tharion', 'Todo est&aacute; bajo mi control.', 'Consigue 72 respuestas correctas consecutivas.', 72],
    ['Horizonte claro', 'Nada nubla el camino.', 'Consigue 75 respuestas correctas seguidas.', 75],
    ['La Corona de Elyra', 'Esto ya no es normal.', 'Consigue 85 respuestas correctas seguidas.', 85],
    ['Dominio absoluto', 'Ya no hay oposici&oacute;n.', 'Consigue 100 respuestas correctas consecutivas.', 100],
    ['El Camino de Nyx', 'Oscuro... pero perfectamente claro.', 'Consigue 110 respuestas correctas consecutivas.', 110],
    ['El Vac&iacute;o responde', 'Y yo entiendo por qu&eacute;.', 'Consigue 116 respuestas correctas consecutivas.', 116],
    ['Runa de Helion', 'Graba su marca en cada acierto.', 'Consigue 120 respuestas correctas seguidas.', 120],
    ['C&oacute;digo &AElig;ther', 'No es c&aacute;lculo... es otra cosa.', 'Consigue 128 respuestas correctas seguidas.', 128],
    ['El Pulso de Orbis', 'Late dentro de cada decisi&oacute;n.', 'Consigue 140 respuestas correctas consecutivas.', 140],
    ['Fragmento de Eryon', 'Una pieza del todo... revelada.', 'Consigue 160 respuestas correctas seguidas.', 160],
    ['Ojo sobre humano', 'No hay nada que se escape de este ojo...', 'Consigue 170 respuestas correctas consecutivas.', 170],
    ['La Llave de Solkar', 'Algo se ha abierto.', 'Consigue 180 respuestas correctas consecutivas.', 180],
    ['Eco de Valtheris', 'Las respuestas regresan solas.', 'Consigue 210 respuestas correctas seguidas.', 210],
    ['El Rastro de Umbra', 'Sigo algo que no puedo ver.', 'Consigue 250 respuestas correctas consecutivas.', 250],
    ['Ojo bionico', 'Humano? Ya deje de serlo.', 'Consigue 275 respuestas correctas seguidas.', 275],
    ['Sello de Arkanis', 'Nada puede romper esto.', 'Consigue 290 respuestas correctas seguidas.', 290],
    ['El Giro de Lumen', 'Todo cambia... pero encaja.', 'Consigue 300 respuestas correctas consecutivas.', 300],
    ['V&iacute;nculo de Zareth', 'Estoy conectado a algo mayor.', 'Consigue 327 respuestas correctas seguidas.', 327],
    ['El demonio de los ojos', 'Tengo ojos por todos lados... yo lo veo todo.', 'Consigue 350 respuestas correctas consecutivas.', 350],
    ['La Trama de Ilyon', 'Cada hilo lleva al siguiente.', 'Consigue 420 respuestas correctas consecutivas.', 420],
  ]

  const logrosRachaCorrectas = logros.map(([title, description, howTo, requisito]) => ({
    title,
    description,
    howTo,
    unlocked: mejorRachaCorrectas >= requisito,
  }))

  return [
    ...logrosRachaCorrectas,
    {
      title: 'Trono de Aetherion',
      description: 'El primer lugar me reconoce.',
      howTo: 'Gana 2 torneo consecutivos.',
      unlocked: mejorRachaVictorias >= 2,
    },
    {
      title: 'Ascenso de Valkryon',
      description: 'Sub&iacute;... y no pienso bajar.',
      howTo: 'Gana 4 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 4,
    },
    {
      title: 'Marca de Elyndor',
      description: 'Mi nombre empieza a pesar.',
      howTo: 'Gana 6 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 6,
    },
    {
      title: 'Cima de Thalrex',
      description: 'Desde aqu&iacute; todo se ve distinto.',
      howTo: 'Termina en el top 3 en 4 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 4,
    },
    {
      title: 'Ecos de la victoria',
      description: 'El triunfo se repite.',
      howTo: 'Gana 8 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 8,
    },
    {
      title: 'Sello del Campe&oacute;n',
      description: 'Esto ya no es casualidad.',
      howTo: 'Gana 10 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 10,
    },
    {
      title: 'El Anillo de Vireon',
      description: 'Solo unos pocos llegan aqu&iacute;.',
      howTo: 'Termina en el top 3 en 10 torneos.',
      unlocked: mejorRachaTop3 >= 10,
    },
    {
      title: 'Legado de Zoryth',
      description: 'Mi rastro queda marcado.',
      howTo: 'Gana 12 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 12,
    },
    {
      title: 'Podio eterno',
      description: 'Siempre estoy arriba.',
      howTo: 'Termina en el top 3 en 14 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 14,
    },
    {
      title: 'Corona de Nythera',
      description: 'No hay discusi&oacute;n.',
      howTo: 'Gana 14 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 14,
    },
    {
      title: 'Dominio de Kharion',
      description: 'Nadie logra bajarme.',
      howTo: 'Gana 16 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 16,
    },
    {
      title: 'El pacto de Orlath',
      description: 'El triunfo ya es costumbre.',
      howTo: 'Termina en el top 3 en 25 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 25,
    },
    {
      title: 'Sombra del invicto',
      description: 'Nadie me alcanza.',
      howTo: 'Gana 18 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 18,
    },
    {
      title: 'El ciclo perfecto',
      description: 'Ganar... repetir... dominar.',
      howTo: 'Gana 20 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 20,
    },
    {
      title: 'Presencia de Valyrex',
      description: 'Estar arriba ya es normal.',
      howTo: 'Termina en el top 3 en 42 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 42,
    },
    {
      title: 'Imperio de Solthar',
      description: 'Todo gira a mi alrededor.',
      howTo: 'Gana 22 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 22,
    },
    {
      title: 'El juicio final',
      description: 'Aqu&iacute; se define todo.',
      howTo: 'Gana un torneo sin cometer ni un error.',
      unlocked: victoriasSinErrores >= 1,
    },
    {
      title: 'Leyenda de Umbryon',
      description: 'Mi nombre ya no se olvida.',
      howTo: 'Termina en el top 3 en 55 torneos consecutivos.',
      unlocked: mejorRachaTop3 >= 55,
    },
    {
      title: 'Voluntad absoluta',
      description: 'Nada me detiene.',
      howTo: 'Gana 400 torneos seguidos.',
      unlocked: mejorRachaVictorias >= 400,
    },
    {
      title: 'El trono infinito',
      description: 'No hay final para esto.',
      howTo: 'Gana 100 torneos consecutivos.',
      unlocked: mejorRachaVictorias >= 100,
    },
  ]
}

function crearLogrosMatematicas(stats) {
  const totalCorrectas = stats.matematicas_total_correctas || 0
  const sesionesSinErrores = stats.matematicas_sesiones_sin_errores || 0
  const mejorRachaCorrectas = stats.matematicas_mejor_racha_correctas || 0
  const mejorRacha3s = stats.matematicas_mejor_racha_3s || 0
  const mejorRacha5s = stats.matematicas_mejor_racha_5s || 0
  const mejorCorrectas60s = stats.matematicas_mejor_correctas_60s || 0
  const ejerciciosMenos = (key) => stats[`matematicas_ejercicios_menos_${key}`] || 0
  const logrosRapidez = [
    {
      title: '¿Ya terminé?',
      description: 'Se sintió demasiado fácil.',
      howTo: 'Resuelve 4 ejercicios en menos de 14 segundos.',
      unlocked: ejerciciosMenos('14s') >= 4,
    },
    {
      title: 'Ni lo noté',
      description: 'Pasó sin darme cuenta.',
      howTo: 'Resuelve 5 ejercicios en menos de 13 segundos.',
      unlocked: ejerciciosMenos('13s') >= 5,
    },
    {
      title: 'Demasiado rápido',
      description: 'Eso no debería contar.',
      howTo: 'Resuelve 9 ejercicios en menos de 12 segundos.',
      unlocked: ejerciciosMenos('12s') >= 9,
    },
    {
      title: 'Fue automático',
      description: 'Mi mente fue sola.',
      howTo: 'Resuelve 11 ejercicios en menos de 11 segundos.',
      unlocked: ejerciciosMenos('11s') >= 11,
    },
    {
      title: 'Sin esfuerzo',
      description: 'Ni siquiera intenté.',
      howTo: 'Resuelve 17 ejercicios en menos de 10 segundos.',
      unlocked: ejerciciosMenos('10s') >= 17,
    },
    {
      title: 'Como respirar',
      description: 'Natural... instantáneo.',
      howTo: 'Resuelve 31 ejercicios en menos de 9 segundos.',
      unlocked: ejerciciosMenos('9s') >= 31,
    },
    {
      title: 'Casi instantáneo',
      description: 'Ni tiempo de pensar.',
      howTo: 'Resuelve 41 ejercicios en menos de 8 segundos.',
      unlocked: ejerciciosMenos('8s') >= 41,
    },
    {
      title: '¿En serio?',
      description: 'Esperaba algo más de este juego.',
      howTo: 'Resuelve 51 ejercicios en menos de 7 segundos.',
      unlocked: ejerciciosMenos('7s') >= 51,
    },
    {
      title: 'Flash mental',
      description: 'Un destello y ya.',
      howTo: 'Resuelve 12 ejercicios en menos de 6 segundos.',
      unlocked: ejerciciosMenos('6s') >= 12,
    },
    {
      title: 'Ni parpadeé',
      description: 'Y ya estaba lista la respuesta.',
      howTo: 'Resuelve 10 ejercicios en menos de 5 segundos.',
      unlocked: ejerciciosMenos('5s') >= 10,
    },
    {
      title: 'Demasiado fácil',
      description: 'Esto se está poniendo raro.',
      howTo: 'Resuelve 6 ejercicios en menos de 4 segundos.',
      unlocked: ejerciciosMenos('4s') >= 6,
    },
    {
      title: 'Reflejo puro',
      description: 'Ni lo procesé y ya tenía la respuesta.',
      howTo: 'Resuelve 14 ejercicios en menos de 3.5 segundos.',
      unlocked: ejerciciosMenos('3_5s') >= 14,
    },
    {
      title: 'Instinto activo',
      description: 'Solo reaccioné puro instinto.',
      howTo: 'Resuelve 7 ejercicios en menos de 3 segundos.',
      unlocked: ejerciciosMenos('3s') >= 7,
    },
    {
      title: 'Respuesta fantasma',
      description: 'Apareció sola sin que pensara.',
      howTo: 'Resuelve 3 ejercicios en menos de 2.5 segundos.',
      unlocked: ejerciciosMenos('2_5s') >= 3,
    },
    {
      title: 'Tiempo mínimo',
      description: 'Esto ya no es normal....',
      howTo: 'Resuelve 2 ejercicios en menos de 2 segundos.',
      unlocked: ejerciciosMenos('2s') >= 2,
    },
    {
      title: 'Rompí el reloj',
      description: 'Algo no cuadra....no debería contar o sí?.',
      howTo: 'Resuelve 1 ejercicio en menos de 1.8 segundos.',
      unlocked: ejerciciosMenos('1_8s') >= 1,
    },
    {
      title: 'Fuera del tiempo',
      description: 'El reloj se quedó atrás.',
      howTo: 'Resuelve 1 ejercicio en menos de 1.5 segundos.',
      unlocked: ejerciciosMenos('1_5s') >= 1,
    },
    {
      title: 'Antes de pensar',
      description: 'La respuesta llegó primero antes de que me diera cuenta.',
      howTo: 'Resuelve 1 ejercicio en menos de 1.2 segundos.',
      unlocked: ejerciciosMenos('1_2s') >= 1,
    },
    {
      title: 'Imposible',
      description: 'Esto no debería pasar....verdad?',
      howTo: 'Resuelve 1 ejercicio en menos de 1 segundo.',
      unlocked: ejerciciosMenos('1s') >= 1,
    },
    {
      title: 'Más rápido que la duda',
      description: 'Ni la duda es más rápida que yo...',
      howTo: 'Resuelve 1 ejercicio en menos de 0.8 segundos.',
      unlocked: ejerciciosMenos('0_8s') >= 1,
    },
  ]

  return [
    ...logrosRapidez,
    {
      title: 'Cerebro encendido',
      description: 'Algo hizo click... y no se apago.',
      howTo: 'Resuelve 12 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 12,
    },
    {
      title: 'El hilo invisible',
      description: 'Algo conecta cada respuesta... y no se rompe.',
      howTo: 'Resuelve 11 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 11,
    },
    {
      title: 'Error inexistente',
      description: 'Busque fallar... no lo encontre.',
      howTo: 'Completa una sesion sin errores.',
      unlocked: sesionesSinErrores >= 1,
    },
    {
      title: 'Calculo silencioso',
      description: 'Ni movi los labios.',
      howTo: 'Resuelve 15 ejercicios seguidos en menos de 3 segundos cada uno.',
      unlocked: mejorRacha3s >= 15,
    },
    {
      title: 'Ritmo perfecto',
      description: 'Todo fluye... sin esfuerzo.',
      howTo: 'Resuelve 20 ejercicios consecutivos.',
      unlocked: mejorRachaCorrectas >= 20,
    },
    {
      title: 'Destino numerico',
      description: 'Cada resultado ya estaba escrito.',
      howTo: 'Completa 23 operaciones consecutivas sin fallar.',
      unlocked: mejorRachaCorrectas >= 23,
    },
    {
      title: 'Tiempo comprimido',
      description: 'Un minuto... muchas respuestas.',
      howTo: 'Resuelve 18 ejercicios en menos de 60 segundos.',
      unlocked: mejorCorrectas60s >= 18,
    },
    {
      title: 'Dominio creciente',
      description: 'Cada vez mas rapido... mas preciso.',
      howTo: 'Resuelve 175 ejercicios en total.',
      unlocked: totalCorrectas >= 175,
    },
    {
      title: 'Eco mental',
      description: 'La respuesta llega antes que la duda.',
      howTo: 'Resuelve 14 ejercicios seguidos en menos de 5 segundos cada uno.',
      unlocked: mejorRacha5s >= 14,
    },
    {
      title: 'Alineacion perfecta',
      description: 'Todo cae justo donde debe.',
      howTo: 'Resuelve 7 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 7,
    },
    {
      title: 'Concentracion absoluta',
      description: 'Nada me distrae.',
      howTo: 'Resuelve 29 ejercicios seguidos en menos de 5 segundos cada uno.',
      unlocked: mejorRacha5s >= 29,
    },
    {
      title: 'La ultima operacion',
      description: 'Despues de esto... todo tiene sentido.',
      howTo: 'Resuelve 40 ejercicios seguidos.',
      unlocked: mejorRachaCorrectas >= 40,
    },
    {
      title: 'La secuencia despierta',
      description: 'Los numeros empiezan a moverse solos.',
      howTo: 'Completa 44 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 44,
    },
    {
      title: 'Cadena de aciertos',
      description: 'Uno lleva al otro... y no se detiene.',
      howTo: 'Resuelve 74 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 74,
    },
    {
      title: 'Eco de precision',
      description: 'Una respuesta llama a la siguiente.',
      howTo: 'Resuelve 67 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 67,
    },
    {
      title: 'Cadena encantada',
      description: 'No hay forma de romper esto.',
      howTo: 'Completa 70 operaciones consecutivas sin fallar.',
      unlocked: mejorRachaCorrectas >= 70,
    },
    {
      title: 'Sin interrupciones',
      description: 'Nada se interpone entre yo y el resultado.',
      howTo: 'Completa 98 ejercicios consecutivos sin fallar.',
      unlocked: mejorRachaCorrectas >= 98,
    },
    {
      title: 'Rastro infinito',
      description: 'Voy dejando aciertos atras.',
      howTo: 'Resuelve 87 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 87,
    },
    {
      title: 'La formula eterna',
      description: 'Siempre hay una respuesta mas.',
      howTo: 'Completa 95 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 95,
    },
    {
      title: 'Mente en linea recta',
      description: 'No hay desvios... solo respuestas.',
      howTo: 'Resuelve 122 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 122,
    },
    {
      title: 'Conexion absoluta',
      description: 'Nada se pierde en el proceso.',
      howTo: 'Resuelve 111 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 111,
    },
    {
      title: 'Orden oculto',
      description: 'El caos... en realidad no existe.',
      howTo: 'Completa 128 operaciones consecutivas sin fallar.',
      unlocked: mejorRachaCorrectas >= 128,
    },
    {
      title: 'Ritual de numeros',
      description: 'Cada operacion forma parte de algo mayor.',
      howTo: 'Completa 26 ejercicios consecutivos.',
      unlocked: mejorRachaCorrectas >= 26,
    },
    {
      title: 'Secuencia perfecta',
      description: 'Todo encaja... uno tras otro.',
      howTo: 'Resuelve 80 ejercicios seguidos sin errores.',
      unlocked: mejorRachaCorrectas >= 80,
    },
    {
      title: 'Camino inevitable',
      description: 'Cada paso ya estaba escrito.',
      howTo: 'Completa 134 ejercicios consecutivos correctamente.',
      unlocked: mejorRachaCorrectas >= 134,
    },
    {
      title: 'Pulso matematico',
      description: 'Late... y nunca se detiene.',
      howTo: 'Resuelve 137 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 137,
    },
    {
      title: 'Dominio progresivo',
      description: 'Mientras mas avanzo... mas claro se vuelve.',
      howTo: 'Resuelve 38 ejercicios seguidos sin fallar.',
      unlocked: mejorRachaCorrectas >= 38,
    },
    {
      title: 'Flujo matematico',
      description: 'No pienso... solo continuo.',
      howTo: 'Completa 142 ejercicios consecutivos.',
      unlocked: mejorRachaCorrectas >= 142,
    },
    {
      title: 'La rueda gira',
      description: 'Y yo sigo dentro.',
      howTo: 'Completa 149 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 149,
    },
    {
      title: 'Inercia mental',
      description: 'Ya no puedo parar aunque quiera.',
      howTo: 'Resuelve 48 ejercicios seguidos correctamente.',
      unlocked: mejorRachaCorrectas >= 48,
    },
    {
      title: 'Tramo infinito',
      description: 'No veo el final... y sigo.',
      howTo: 'Completa 156 ejercicios consecutivos sin errores.',
      unlocked: mejorRachaCorrectas >= 156,
    },
    {
      title: 'Simetria mental',
      description: 'Yo soy uno con el juego...',
      howTo: 'Completa 200 operaciones consecutivas sin errores.',
      unlocked: mejorRachaCorrectas >= 200,
    },
  ]
}

function crearLogrosMemoria(stats) {
  const completados = stats.completados || 0
  const completadosSinErrores = stats.completados_sin_errores || 0
  const mejorRachaCompletados = stats.mejor_racha_completados || 0
  const mejorRachaPares = stats.memoria_mejor_racha_pares || 0
  const mejorRachaFallos = stats.memoria_mejor_racha_fallos || 0
  const maxErroresPartida = stats.memoria_max_errores_partida || 0
  const minErroresPartida = typeof stats.memoria_min_errores_partida === 'number' ? stats.memoria_min_errores_partida : null
  const mejorTiempo = typeof stats.mejor_tiempo === 'number' ? stats.mejor_tiempo : null
  const mejorTiempoSinErrores = typeof stats.memoria_mejor_tiempo_sin_errores === 'number' ? stats.memoria_mejor_tiempo_sin_errores : null
  const paresAntes1Minuto = stats.memoria_pares_antes_1min || 0
  const mejorPartidas10Min = stats.memoria_mejor_partidas_10min || 0
  const falloUltimoPar = stats.memoria_fallo_ultimo_par || 0
  const aciertoTras5Fallos = stats.memoria_acierto_tras_5_fallos || 0
  const parMenos2s = stats.memoria_par_menos_2s || 0
  const parMenos20s = stats.memoria_par_menos_20s || 0
  const aciertoTras2Fallos = stats.memoria_acierto_tras_2_fallos || 0
  const parSinVerPrevio = stats.memoria_par_sin_ver_previo || 0
  const menos20Movimientos = stats.memoria_menos_20_movimientos || 0
  const mejorasTiempo = stats.memoria_mejoras_tiempo || 0
  const maxIntentosPartida = stats.memoria_max_intentos_partida || 0
  const sinRepetirErrorPar = stats.memoria_sin_repetir_error_par || 0
  const primerMovimientoPar = stats.memoria_primer_movimiento_par || 0
  const lineal = stats.memoria_lineal || 0
  const sinPatronRepetido = stats.memoria_sin_patron_repetido || 0
  const anticipacion = stats.memoria_anticipacion || 0
  const sinCartasFalladasRepetidas = stats.memoria_sin_cartas_falladas_repetidas || 0
  const inicio4Pares = stats.memoria_inicio_4_pares || 0
  const final4Pares = stats.memoria_final_4_pares || 0
  const mejorPartidas15Min = stats.memoria_mejor_partidas_15min || 0

  return [
    {
      title: 'Donde estaba?',
      description: 'Lo tenia claro... hace un segundo.',
      howTo: 'Encuentra 5 pares seguidos sin fallar.',
      unlocked: mejorRachaPares >= 5,
    },
    {
      title: 'Memoria sospechosa',
      description: 'Esto ya no es normal.',
      howTo: 'Completa una partida sin equivocarte.',
      unlocked: completadosSinErrores >= 1,
    },
    {
      title: 'Corto circuito',
      description: 'Mi cerebro hizo "click".',
      howTo: 'Falla 10 veces en una sola partida y aun asi termina.',
      unlocked: maxErroresPartida >= 10 && completados >= 1,
    },
    {
      title: 'Visual fotografico',
      description: 'Lo vi una vez... y fue suficiente.',
      howTo: 'Encuentra todos los pares en menos de 2 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 120,
    },
    {
      title: 'Confianza excesiva',
      description: 'Seguro esta aqui... no?',
      howTo: 'Levanta 3 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 3,
    },
    {
      title: 'Memoria de Pescado',
      description: 'Definitivamente estaba aqu&iacute; hace un segundo.',
      howTo: 'Levanta 5 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 5,
    },
    {
      title: 'El Or&aacute;culo Ciego',
      description: 'Tu intuici&oacute;n muri&oacute; hace varias cartas atr&aacute;s.',
      howTo: 'Levanta 7 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 7,
    },
    {
      title: 'Caos Cognitivo',
      description: 'Cada intento te alej&oacute; m&aacute;s de la respuesta.',
      howTo: 'Levanta 10 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 10,
    },
    {
      title: 'Arquitecto del Error',
      description: 'Construiste una derrota carta por carta.',
      howTo: 'Levanta 12 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 12,
    },
    {
      title: 'La Maldici&oacute;n de la Memoria Rota',
      description: 'Recordar era solo una ilusi&oacute;n.',
      howTo: 'Levanta 15 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 15,
    },
    {
      title: '&iquest;Seguro Que Era Esa?',
      description: 'La confianza cay&oacute; m&aacute;s r&aacute;pido que tus intentos.',
      howTo: 'Levanta 20 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 20,
    },
    {
      title: 'El Coleccionista de Fracasos',
      description: 'Cada carta equivocada encontr&oacute; su lugar contigo.',
      howTo: 'Levanta 25 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 25,
    },
    {
      title: 'Desconexi&oacute;n Neuronal',
      description: 'Tu cerebro abandon&oacute; la partida hace rato.',
      howTo: 'Levanta 30 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 30,
    },
    {
      title: 'La Niebla del Olvido',
      description: 'Todas las cartas comenzaron a verse iguales.',
      howTo: 'Levanta 40 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 40,
    },
    {
      title: 'Maestro del Desastre',
      description: 'Convertiste un juego de memoria en una ruina absoluta.',
      howTo: 'Levanta 50 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 50,
    },
    {
      title: 'El Abismo de la Duda',
      description: 'Cada elecci&oacute;n equivocada abri&oacute; otra herida en tu memoria.',
      howTo: 'Levanta 60 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 60,
    },
    {
      title: 'Cartas del Olvido Eterno',
      description: 'Ni el destino pudo ayudarte a recordar.',
      howTo: 'Levanta 75 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 75,
    },
    {
      title: 'Sinapsis Perdidas',
      description: 'Tus neuronas presentaron su renuncia colectiva.',
      howTo: 'Levanta 90 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 90,
    },
    {
      title: 'El Ritual del Error Infinito',
      description: 'Fallaste tantas veces que el tablero empez&oacute; a burlarse.',
      howTo: 'Levanta 100 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 100,
    },
    {
      title: 'La Ruina de la Memoria Humana',
      description: 'Cada carta revelada fue otra derrota inevitable.',
      howTo: 'Levanta 125 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 125,
    },
    {
      title: 'Olvido Absoluto',
      description: 'Ya no jugabas para ganar... jugabas para recordar qui&eacute;n eras.',
      howTo: 'Levanta 150 pares incorrectos seguidos.',
      unlocked: mejorRachaFallos >= 150,
    },
    {
      title: 'Ahora si me acuerdo',
      description: 'Ok... ya entendi como funciona.',
      howTo: 'Completa 3 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 3,
    },
    {
      title: 'Memoria en modo turbo',
      description: 'No necesito pensar tanto.',
      howTo: 'Encuentra 10 pares en menos de 1 minuto.',
      unlocked: paresAntes1Minuto >= 10,
    },
    {
      title: 'Patron descubierto',
      description: 'Todo empieza a tener sentido.',
      howTo: 'Encuentra 8 pares seguidos correctamente.',
      unlocked: mejorRachaPares >= 8,
    },
    {
      title: 'Sobrecarga mental',
      description: 'Demasiada informacion... pero sigo.',
      howTo: 'Juega 5 partidas en menos de 10 minutos.',
      unlocked: mejorPartidas10Min >= 5,
    },
    {
      title: 'Imposible olvidar',
      description: 'Esto se quedo grabado.',
      howTo: 'Completa 15 partidas en total.',
      unlocked: completados >= 15,
    },
    {
      title: 'Casi lo tenia',
      description: 'Estuve tan cerca... que duele.',
      howTo: 'Falla el ultimo par antes de completar una partida.',
      unlocked: falloUltimoPar >= 1,
    },
    {
      title: 'Memoria selectiva',
      description: 'Recuerdo lo importante... a veces.',
      howTo: 'Acierta un par despues de 5 intentos fallidos seguidos.',
      unlocked: aciertoTras5Fallos >= 1,
    },
    {
      title: 'Caos controlado',
      description: 'No se que hago... pero funciona.',
      howTo: 'Completa una partida con mas de 15 errores.',
      unlocked: maxErroresPartida > 15,
    },
    {
      title: 'Reflejo mental',
      description: 'Ni lo pense... solo paso.',
      howTo: 'Encuentra un par en menos de 2 segundos.',
      unlocked: parMenos2s >= 1,
    },
    {
      title: 'Doble o nada',
      description: 'Si fallo otra vez... mejor no digo nada.',
      howTo: 'Acierta un par justo despues de fallar el mismo dos veces.',
      unlocked: aciertoTras2Fallos >= 1,
    },
    {
      title: 'Conexion inesperada',
      description: 'Ah... estaban ahi todo el tiempo.',
      howTo: 'Encuentra un par sin haber volteado esas cartas antes.',
      unlocked: parSinVerPrevio >= 1,
    },
    {
      title: 'Orden en el desorden',
      description: 'Todo parecia aleatorio... hasta que no.',
      howTo: 'Completa una partida usando menos de 20 movimientos.',
      unlocked: menos20Movimientos >= 1,
    },
    {
      title: 'Memoria en construccion',
      description: 'Voy mejorando... creo.',
      howTo: 'Mejora tu tiempo respecto a tu partida anterior.',
      unlocked: mejorasTiempo >= 1,
    },
    {
      title: 'Persistente nivel dios',
      description: 'No me rendi... y aqui estamos.',
      howTo: 'Termina una partida despues de mas de 25 intentos.',
      unlocked: maxIntentosPartida > 25,
    },
    {
      title: 'Todo encaja',
      description: 'Por fin... todo tiene sentido.',
      howTo: 'Completa una partida sin repetir errores en el mismo par.',
      unlocked: sinRepetirErrorPar >= 1,
    },
    {
      title: 'Memoria instantanea',
      description: 'Lo vi... y nunca mas lo olvide.',
      howTo: 'Encuentra un par usando exactamente los dos primeros movimientos de la partida.',
      unlocked: primerMovimientoPar >= 1,
    },
    {
      title: 'Cambio de estrategia',
      description: 'Ok... asi no era.',
      howTo: 'Encuentra un par inmediatamente despues de equivocarte 2 veces.',
      unlocked: aciertoTras2Fallos >= 1,
    },
    {
      title: 'Barrido perfecto',
      description: 'De izquierda a derecha... sin perder el ritmo.',
      howTo: 'Completa una partida siguiendo un orden lineal sin saltarte cartas.',
      unlocked: lineal >= 1,
    },
    {
      title: 'Patron invisible',
      description: 'No se como lo vi... pero lo vi.',
      howTo: 'Encuentra 6 pares seguidos sin equivocarte.',
      unlocked: mejorRachaPares >= 6,
    },
    {
      title: 'Cierre quirurgico',
      description: 'Ni un movimiento extra.',
      howTo: 'Completa la partida usando el numero minimo posible de movimientos.',
      unlocked: typeof stats.memoria_mejor_movimientos === 'number' && stats.memoria_mejor_movimientos <= 18,
    },
    {
      title: 'Memoria a largo plazo',
      description: 'Eso lo vi hace rato...',
      howTo: 'Encuentra un par en menos de 20 segundos.',
      unlocked: parMenos20s >= 1,
    },
    {
      title: 'Desorden calculado',
      description: 'Parece caos... pero no lo es.',
      howTo: 'Completa una partida sin seguir ningun patron repetido de seleccion.',
      unlocked: sinPatronRepetido >= 1,
    },
    {
      title: 'Anticipacion total',
      description: 'Ya sabia donde estaba antes de verlo.',
      howTo: 'Selecciona correctamente la segunda carta de un par sin haber visto esa posicion en los ultimos 5 movimientos.',
      unlocked: anticipacion >= 1,
    },
    {
      title: 'Sin referencias',
      description: 'Ni pistas... ni ayudas... solo mente.',
      howTo: 'Completa una partida sin repetir ninguna carta fallada anteriormente.',
      unlocked: sinCartasFalladasRepetidas >= 1,
    },
    {
      title: 'Lectura del tablero',
      description: 'No memorizo... entiendo.',
      howTo: 'Completa la partida sin intentar dos veces la misma combinacion incorrecta.',
      unlocked: sinRepetirErrorPar >= 1,
    },
    {
      title: 'Velocidad pura',
      description: 'No hubo tiempo ni de pensar.',
      howTo: 'Completa una partida en menos de 2 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 120,
    },
    {
      title: 'Paso firme',
      description: 'Sin prisa... pero sin pausa.',
      howTo: 'Completa una partida en menos de 3 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 180,
    },
    {
      title: 'Ritmo constante',
      description: 'Ni muy rapido, ni muy lento... perfecto.',
      howTo: 'Completa 4 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 4,
    },
    {
      title: 'Sin margen de error',
      description: 'Aqui no se perdona nada.',
      howTo: 'Completa 2 partidas consecutivas sin fallos.',
      unlocked: (stats.mejor_racha_sin_errores || 0) >= 2,
    },
    {
      title: 'Precision rapida',
      description: 'Rapido... y bien hecho...',
      howTo: 'Completa una partida en menos de 2 minutos sin errores.',
      unlocked: mejorTiempoSinErrores !== null && mejorTiempoSinErrores < 120,
    },
    {
      title: 'Inicio dominante',
      description: 'Desde el comienzo marque el ritmo.',
      howTo: 'Encuentra 4 pares correctos seguidos al iniciar una partida.',
      unlocked: inicio4Pares >= 1,
    },
    {
      title: 'Final limpio',
      description: 'Cerre como se debe.',
      howTo: 'Encuentra los ultimos 4 pares sin equivocarte.',
      unlocked: final4Pares >= 1,
    },
    {
      title: 'Resistencia activa',
      description: 'No me detuve ni un segundo.',
      howTo: 'Completa 6 partidas en menos de 15 minutos.',
      unlocked: mejorPartidas15Min >= 6,
    },
    {
      title: 'Control total',
      description: 'Todo bajo control... siempre.',
      howTo: 'Completa una partida con menos de 5 errores.',
      unlocked: minErroresPartida !== null && minErroresPartida < 5,
    },
    {
      title: 'Constancia mental',
      description: 'Una tras otra... sin fallar.',
      howTo: 'Completa 12 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 12,
    },
    {
      title: 'El punto sin retorno',
      description: 'En algun momento pude parar... creo.',
      howTo: 'Completa 36 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 36,
    },
    {
      title: 'Susurros del tablero',
      description: 'Siento que el juego ya me habla.',
      howTo: 'Completa 54 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 54,
    },
    {
      title: 'Juramento silencioso',
      description: 'No dije nada... pero sabia que no iba a parar.',
      howTo: 'Completa 72 partidas sin interrupcion.',
      unlocked: mejorRachaCompletados >= 72,
    },
    {
      title: 'La mirada infinita',
      description: 'Parpadear es opcional.',
      howTo: 'Completa 160 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 160,
    },
    {
      title: 'El inicio del fin',
      description: 'Aqui fue donde deje de contar.',
      howTo: 'Completa 160 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 160,
    },
    {
      title: 'Horizonte sin limite',
      description: 'Sigo avanzando... pero nunca llego.',
      howTo: 'Completa 176 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 176,
    },
    {
      title: 'Ecos en la mente',
      description: 'Las cartas aparecen antes de verlas.',
      howTo: 'Completa 188 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 188,
    },
    {
      title: 'Memoria trascendida',
      description: 'Ya no recuerdo... simplemente se.',
      howTo: 'Completa 192 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 192,
    },
    {
      title: 'Pulso inquebrantable',
      description: 'Nada me hace dudar.',
      howTo: 'Completa 208 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 208,
    },
    {
      title: 'Dimension paralela',
      description: 'El tiempo aqui funciona diferente.',
      howTo: 'Completa 224 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 224,
    },
    {
      title: 'El ciclo no se rompe',
      description: 'Empieza... termina... vuelve a empezar.',
      howTo: 'Completa 226 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 226,
    },
    {
      title: 'La rutina perfecta',
      description: 'Cada movimiento... inevitable.',
      howTo: 'Completa 240 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 240,
    },
    {
      title: 'Mas alla del jugador',
      description: 'Esto ya no es un juego.',
      howTo: 'Completa 256 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 256,
    },
    {
      title: 'Codigo interno',
      description: 'Creo que descifre todo.',
      howTo: 'Completa 272 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 272,
    },
    {
      title: 'Mas alla del cansancio humano',
      description: 'Esto ya no deberia ser posible.',
      howTo: 'Completa 288 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 288,
    },
    {
      title: 'El observador eterno',
      description: 'Siempre estoy... siempre veo.',
      howTo: 'Completa 288 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 288,
    },
    {
      title: 'El tablero te eligio',
      description: 'Ya no juegas tu... juega a traves de ti.',
      howTo: 'Completa 304 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 304,
    },
    {
      title: 'Sin principio ni final',
      description: 'No recuerdo cuando empezo.',
      howTo: 'Completa 304 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 304,
    },
    {
      title: 'Ritual interminable',
      description: 'Siempre hay otra mas... siempre.',
      howTo: 'Completa 320 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 320,
    },
    {
      title: 'Conciencia del tablero',
      description: 'Entiendo cada rincon.',
      howTo: 'Completa 320 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 320,
    },
    {
      title: 'Latido constante',
      description: 'Uno mas... siempre uno mas.',
      howTo: 'Completa 336 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 336,
    },
    {
      title: 'Frontera inexistente',
      description: 'No hay limite que alcanzar.',
      howTo: 'Completa 352 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 352,
    },
    {
      title: 'Realidad alterada',
      description: 'Esto ya no se siente normal.',
      howTo: 'Completa 368 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 368,
    },
    {
      title: 'El ciclo perfecto',
      description: 'Nada falla... nada cambia.',
      howTo: 'Completa 384 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 384,
    },
    {
      title: 'Presencia absoluta',
      description: 'Estoy en cada movimiento.',
      howTo: 'Completa 400 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 400,
    },
    {
      title: 'El final que no llega',
      description: 'Pense que terminaria... pero no.',
      howTo: 'Completa 420 partidas consecutivas.',
      unlocked: mejorRachaCompletados >= 420,
    },
    {
      title: 'El ultimo recuerdo',
      description: 'Despues de esto... todo cambia.',
      howTo: 'Completa 444 partidas seguidas.',
      unlocked: mejorRachaCompletados >= 444,
    },
  ]
}

function crearLogrosSudoku(stats) {
  const completados = stats.completados || 0
  const completadosSinErrores = stats.completados_sin_errores || 0
  const mejorRachaCompletados = stats.mejor_racha_completados || stats.completados || 0
  const mejorRachaSinErrores = stats.mejor_racha_sin_errores || 0
  const tiempoJugadoTotal = stats.tiempo_jugado_total || 0
  const mejorRachaTiempoJugado = stats.mejor_racha_tiempo_jugado || 0
  const torneosParticipados = stats.torneos_participados || 0
  const mejorPosicionTorneo = typeof stats.mejor_posicion_torneo === 'number' ? stats.mejor_posicion_torneo : null
  const victoriasTorneos = stats.victorias_torneos || 0
  const mejorRachaTop10Torneos = stats.mejor_racha_top10_torneos || 0
  const victoriasSinErrores = stats.victorias_sin_errores || 0
  const top15Torneos = stats.top15_torneos || 0
  const cuartosLugares = stats.cuartos_lugares || 0
  const posicionesMejoradas = stats.posiciones_mejoradas || 0
  const maxPosicionesSubidas = stats.max_posiciones_subidas || 0
  const mejoresHistoricasSuperadas = stats.mejores_historicas_superadas || 0
  const jugadoresMejorRankeadosSuperados = stats.jugadores_mejor_rankeados_superados || 0
  const maxJugadoresMejorRankeadosSuperados = stats.max_jugadores_mejor_rankeados_superados || 0
  const mejorTorneosMismoDia = stats.mejor_torneos_mismo_dia || 0
  const mejorTiempo = typeof stats.mejor_tiempo === 'number' ? stats.mejor_tiempo : null

  return [
    {
      title: 'Primer Numero',
      description: 'Yo que hago aqui completando un tablero de....numeros?',
      howTo: 'Completa tu primer sudoku.',
      unlocked: completados >= 1,
    },
    {
      title: 'Mente en Marcha',
      description: 'Cada vez mas cerca de volverme un profesional.',
      howTo: 'Completa 3 sudokus.',
      unlocked: completados >= 3,
    },
    {
      title: 'Ritmo Constante',
      description: 'Este juego esta muy facil...cuando se acaba el tutorial?',
      howTo: 'Completa 15 sudokus.',
      unlocked: completados >= 15,
    },
    {
      title: 'Racha Imparable',
      description: 'No hay nada que me pare.....verdad que no?',
      howTo: 'Completa 35 sudokus.',
      unlocked: completados >= 35,
    },
    {
      title: 'Maestro del Sudoku',
      description: 'Acaso ya me estoy convirtiendo en un sabio en este juego?',
      howTo: 'Completa 80 sudokus.',
      unlocked: completados >= 80,
    },
    {
      title: 'Gran maestro del Sudoku',
      description: 'Cada vez mas cerca de ser un sabio....',
      howTo: 'Completa 100 sudokus.',
      unlocked: completados >= 100,
    },
    {
      title: 'Sabio del Sudoku',
      description: 'Ya este juego me lo he pasado....o tal vez no?',
      howTo: 'Completa 250 sudokus.',
      unlocked: completados >= 250,
    },
    {
      title: 'Anciano del Sudoku',
      description: 'Que recuerdos cuando inicie en este juego.',
      howTo: 'Completa 350 sudokus.',
      unlocked: completados >= 350,
    },
    {
      title: 'Adiccion Numerica',
      description: 'Creo que ya no puedo dejar este juego... ayuda.',
      howTo: 'Completa 500 sudokus.',
      unlocked: completados >= 500,
    },
    {
      title: 'Leyenda Viva',
      description: 'Dicen que existo... pero nadie me ha visto fallar.',
      howTo: 'Completa 750 sudokus.',
      unlocked: completados >= 750,
    },
    {
      title: 'Mas alla del limite',
      description: 'Ya no estoy jugando... estoy dominando.',
      howTo: 'Completa 1000 sudokus.',
      unlocked: completados >= 1000,
    },
    {
      title: 'Sin Fallos',
      description: 'Ya este juego me lo se de memoria.',
      howTo: 'Termina un sudoku sin cometer errores.',
      unlocked: completadosSinErrores >= 1,
    },
    {
      title: 'Perfecto... otra vez',
      description: 'Otra partida perfecta... que sorpresa.',
      howTo: 'Completa 5 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 5,
    },
    {
      title: 'Precision Total',
      description: 'No hay algo mas dificil?....Me estoy aburriendo.',
      howTo: 'Completa 15 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 15,
    },
    {
      title: 'Maquina de precision',
      description: 'Error? No se que es eso.',
      howTo: 'Completa 25 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 25,
    },
    {
      title: 'Ojo de alcon',
      description: 'Con este ojo no hay nada que no pueda completar.',
      howTo: 'Completa 80 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 80,
    },
    {
      title: 'Modo automatico',
      description: 'Creo que mis manos juegan solas.',
      howTo: 'Completa 100 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 100,
    },
    {
      title: 'Soy un....robot?',
      description: 'Cada vez me estoy convirtiendo mas en un robot.',
      howTo: 'Completa 250 sudokus seguidos sin errores.',
      unlocked: mejorRachaSinErrores >= 250,
    },
    {
      title: 'Velocidad Mental',
      description: 'Con esta cabeza todo es facil...',
      howTo: 'Resuelve un sudoku en menos de 7 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 420,
    },
    {
      title: 'Calentando motores',
      description: 'Eso fue rapido... pero puedo hacerlo mejor.',
      howTo: 'Resuelve un sudoku en menos de 6 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 360,
    },
    {
      title: 'Rayo Numerico',
      description: 'Oye...creo que no soy humano.',
      howTo: 'Resuelve un sudoku en menos de 5 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 300,
    },
    {
      title: 'Casi instantaneo',
      description: 'Parpadee... y ya habia terminado.',
      howTo: 'Resuelve un sudoku en menos de 4 minutos.',
      unlocked: mejorTiempo !== null && mejorTiempo < 240,
    },
    {
      title: 'Estratega Silencioso',
      description: 'No hay tablero que no pueda resolver.',
      howTo: 'Completa un sudoku en menos de 1 minuto.',
      unlocked: mejorTiempo !== null && mejorTiempo < 60,
    },
    {
      title: 'Sin descanso',
      description: 'Descansar esta sobrevalorado.',
      howTo: 'Completa 10 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 10,
    },
    {
      title: 'No me detengo',
      description: 'Parar? No esta en mis planes.',
      howTo: 'Completa 25 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 25,
    },
    {
      title: 'Modo infinito',
      description: 'Esto no tiene fin... y no quiero que lo tenga.',
      howTo: 'Completa 40 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 40,
    },
    {
      title: 'Sin pausas',
      description: 'Pausa? Eso que es?',
      howTo: 'Completa 65 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 65,
    },
    {
      title: 'Flujo constante',
      description: 'Ya entre en ritmo... y no pienso salir.',
      howTo: 'Completa 80 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 80,
    },
    {
      title: 'Resistencia mental',
      description: 'Mi mente ya no se cansa.',
      howTo: 'Completa 100 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 100,
    },
    {
      title: 'Inquebrantable',
      description: 'Nada me saca de aqui.',
      howTo: 'Completa 150 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 150,
    },
    {
      title: 'Automatico',
      description: 'Ya ni lo pienso... solo lo hago.',
      howTo: 'Completa 260 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 260,
    },
    {
      title: 'Desconectado del mundo',
      description: 'El mundo sigue... yo sigo jugando.',
      howTo: 'Completa 370 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 370,
    },
    {
      title: 'Mas alla del cansancio',
      description: 'El cansancio se rindio antes que yo.',
      howTo: 'Completa 480 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 480,
    },
    {
      title: 'Nunca es suficiente',
      description: 'Siempre hay espacio para uno mas.',
      howTo: 'Completa 1000 sudokus seguidos.',
      unlocked: mejorRachaCompletados >= 1000,
    },
    {
      title: 'Trasnochador Numerico',
      description: 'Una mas... y ya duermo... lo juro.',
      howTo: 'Juega 2 horas seguidas en sudoku.',
      unlocked: mejorRachaTiempoJugado >= 2 * 60 * 60,
    },
    {
      title: 'Noches de Sudoku',
      description: 'El reloj avanza... yo tambien.',
      howTo: 'Juega 3 horas seguidas en sudoku.',
      unlocked: mejorRachaTiempoJugado >= 3 * 60 * 60,
    },
    {
      title: 'Inquebrantable',
      description: 'Nada me distrae... absolutamente nada.',
      howTo: 'Juega 5 horas seguidas en sudoku.',
      unlocked: mejorRachaTiempoJugado >= 5 * 60 * 60,
    },
    {
      title: 'Sesion Eterna',
      description: 'Creo que el tiempo dejo de existir hace rato.',
      howTo: 'Juega 4 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 4 * 60 * 60,
    },
    {
      title: 'Sin Parpadear',
      description: 'Juraria que no he cerrado los ojos en horas.',
      howTo: 'Juega 6 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 6 * 60 * 60,
    },
    {
      title: 'Turno Completo',
      description: 'Esto ya parece un trabajo de tiempo completo.',
      howTo: 'Juega 8 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 8 * 60 * 60,
    },
    {
      title: 'Absorcion Total',
      description: 'Este juego ya es parte de mi.',
      howTo: 'Juega 10 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 10 * 60 * 60,
    },
    {
      title: 'Modo Ermitano',
      description: 'Salir? No, gracias... tengo numeros.',
      howTo: 'Juega 15 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 15 * 60 * 60,
    },
    {
      title: 'Fuera del Tiempo',
      description: 'No se que dia es... pero sigo jugando.',
      howTo: 'Juega 20 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 20 * 60 * 60,
    },
    {
      title: 'Vida Alternativa',
      description: 'Creo que vivo mas aqui que en la vida real.',
      howTo: 'Juega 25 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 25 * 60 * 60,
    },
    {
      title: 'En otro mundo',
      description: 'Ya ni se si estoy en la tierra....lo estare?',
      howTo: 'Juega 35 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 35 * 60 * 60,
    },
    {
      title: 'Esto ya es un vicio',
      description: 'No puedo creer que no pueda parar de jugar.',
      howTo: 'Juega 100 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 100 * 60 * 60,
    },
    {
      title: 'Toca cesped',
      description: 'Creo que ya es hora de tocar cesped....verdad?',
      howTo: 'Juega 200 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 200 * 60 * 60,
    },
    {
      title: 'Prisionero del Tablero',
      description: 'El mundo afuera sigui&oacute; avanzando sin ti.',
      howTo: 'Juega 350 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 350 * 60 * 60,
    },
    {
      title: '&iquest;A&uacute;n Vive Tu Familia?',
      description: 'Hace d&iacute;as que no escuchas otra voz que no sean n&uacute;meros.',
      howTo: 'Juega 500 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 500 * 60 * 60,
    },
    {
      title: 'El Monje de los N&uacute;meros',
      description: 'Renunciaste al caos del mundo por una cuadr&iacute;cula perfecta.',
      howTo: 'Juega 750 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 750 * 60 * 60,
    },
    {
      title: 'Insomnio Matem&aacute;tico',
      description: 'Cerrar los ojos ya no apaga los patrones.',
      howTo: 'Juega 1000 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 1000 * 60 * 60,
    },
    {
      title: 'El Ermita&ntilde;o del Vac&iacute;o',
      description: 'Tu &uacute;nica compa&ntilde;&iacute;a fueron filas y columnas infinitas.',
      howTo: 'Juega 2000 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 2000 * 60 * 60,
    },
    {
      title: 'Ascensi&oacute;n del &Uacute;ltimo N&uacute;mero',
      description: 'Ya no resuelves sudokus... te conviertes en ellos.',
      howTo: 'Juega 3000 horas acumuladas en sudoku.',
      unlocked: tiempoJugadoTotal >= 3000 * 60 * 60,
    },
    {
      title: 'Primera Competencia',
      description: 'Ok... esto ya no es solo por diversion.',
      howTo: 'Participa en tu primer torneo.',
      unlocked: torneosParticipados >= 1,
    },
    {
      title: 'En la pelea',
      description: 'No vine a perder tan facil.',
      howTo: 'Termina en el top 50 de un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 50,
    },
    {
      title: 'Debut Prometedor',
      description: 'No gane... pero ya me estan mirando.',
      howTo: 'Termina en el top 25 de un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 25,
    },
    {
      title: 'Top Competidor',
      description: 'Esto ya se esta poniendo serio.',
      howTo: 'Termina en el top 10 de un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 10,
    },
    {
      title: 'Podio',
      description: 'Creo que estoy empezando a destacar.',
      howTo: 'Termina entre los 3 primeros en un torneo.',
      unlocked: mejorPosicionTorneo !== null && mejorPosicionTorneo <= 3,
    },
    {
      title: 'Al Filo del Podio',
      description: 'Tan cerca... lo puedo sentir.',
      howTo: 'Termina en el 4 lugar en un torneo.',
      unlocked: cuartosLugares >= 1,
    },
    {
      title: 'Campeon',
      description: 'No era suerte... era inevitable.',
      howTo: 'Gana un torneo.',
      unlocked: victoriasTorneos >= 1,
    },
    {
      title: 'Escalando Posiciones',
      description: 'Poco a poco... pero sin parar.',
      howTo: 'Mejora tu posicion respecto al torneo anterior.',
      unlocked: posicionesMejoradas >= 1,
    },
    {
      title: 'Sorpresa del Torneo',
      description: 'Nadie lo vio venir... ni yo.',
      howTo: 'Sube mas de 20 posiciones respecto a tu ranking inicial en un torneo.',
      unlocked: maxPosicionesSubidas > 20,
    },
    {
      title: 'Golpe de Autoridad',
      description: 'Hoy vine diferente.',
      howTo: 'Supera tu mejor posicion historica en un torneo.',
      unlocked: mejoresHistoricasSuperadas >= 1,
    },
    {
      title: 'Competidor Incansable',
      description: 'Otra ronda? Vamos.',
      howTo: 'Participa en 3 torneos en un mismo dia.',
      unlocked: mejorTorneosMismoDia >= 3,
    },
    {
      title: 'Rival a Temer',
      description: 'Ya empiezan a reconocer mi nombre.',
      howTo: 'Derrota a un jugador mejor rankeado que tu en un torneo.',
      unlocked: jugadoresMejorRankeadosSuperados >= 1,
    },
    {
      title: 'Cazador de Gigantes',
      description: 'Entre mas alto caen... mejor.',
      howTo: 'Supera a 5 jugadores mejor rankeados en un mismo torneo.',
      unlocked: maxJugadoresMejorRankeadosSuperados >= 5,
    },
    {
      title: 'Consistencia Competitiva',
      description: 'No es suerte... es nivel.',
      howTo: 'Termina en el top 15 en 5 torneos diferentes.',
      unlocked: top15Torneos >= 5,
    },
    {
      title: 'Racha Competitiva',
      description: 'Estoy en mi mejor momento.',
      howTo: 'Termina en el top 10 en 3 torneos seguidos.',
      unlocked: mejorRachaTop10Torneos >= 3,
    },
    {
      title: 'Imparable en Torneos',
      description: 'Que alguien me detenga... si puede.',
      howTo: 'Gana 3 torneos.',
      unlocked: victoriasTorneos >= 3,
    },
    {
      title: 'Constancia de Hierro',
      description: 'Siempre estoy ahi.',
      howTo: 'Participa en 10 torneos.',
      unlocked: torneosParticipados >= 10,
    },
    {
      title: 'Siempre Presente',
      description: 'No importa el resultado... siempre aparezco.',
      howTo: 'Participa en 20 torneos.',
      unlocked: torneosParticipados >= 20,
    },
    {
      title: 'Presion Maxima',
      description: 'Aqui es donde se separan los buenos.',
      howTo: 'Completa un sudoku sin errores en un torneo.',
      unlocked: completadosSinErrores >= 1,
    },
    {
      title: 'Dominio Total',
      description: 'Ya no compito... impongo.',
      howTo: 'Gana un torneo sin cometer errores.',
      unlocked: victoriasSinErrores >= 1,
    },
  ]
}

function seleccionarJuegoLogros(gameKey) {
  juegoLogrosActivo = gameKey
  renderLogrosJuegos()
  renderLogros()
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function textoPlano(valor) {
  const div = document.createElement('div')
  div.innerHTML = String(valor ?? '')
  return div.textContent || div.innerText || ''
}

function obtenerPrimerNumero(texto) {
  const coincidencia = String(texto).replace(/,/g, '').match(/\d+/)
  return coincidencia ? Number(coincidencia[0]) : null
}

function obtenerNumeroDeTorneos(texto) {
  const coincidencias = [...String(texto).replace(/,/g, '').matchAll(/(\d+)\s+torneos?/g)]
  if (!coincidencias.length) return null
  return Number(coincidencias[coincidencias.length - 1][1])
}

function limitarProgreso(actual, objetivo) {
  if (!objetivo || objetivo <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((actual / objetivo) * 100)))
}

function describirNumero(actual, objetivo, unidad = '') {
  const sufijo = unidad ? ` ${unidad}` : ''
  return `${Math.min(actual, objetivo)} / ${objetivo}${sufijo}`
}

function obtenerProgresoSudoku(achievement, stats) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const objetivo = obtenerPrimerNumero(objetivoTexto)
  const completados = stats.completados || 0
  const completadosSinErrores = stats.completados_sin_errores || 0
  const mejorRachaCompletados = stats.mejor_racha_completados || stats.completados || 0
  const mejorRachaSinErrores = stats.mejor_racha_sin_errores || 0
  const tiempoJugadoTotalHoras = Math.floor((stats.tiempo_jugado_total || 0) / 3600)
  const mejorRachaTiempoHoras = Math.floor((stats.mejor_racha_tiempo_jugado || 0) / 3600)
  const torneosParticipados = stats.torneos_participados || 0
  const victoriasTorneos = stats.victorias_torneos || 0
  const top15Torneos = stats.top15_torneos || 0
  const mejorRachaTop10 = stats.mejor_racha_top10_torneos || 0
  const cuartosLugares = stats.cuartos_lugares || 0
  const posicionesMejoradas = stats.posiciones_mejoradas || 0
  const maxPosicionesSubidas = stats.max_posiciones_subidas || 0
  const mejoresHistoricasSuperadas = stats.mejores_historicas_superadas || 0
  const jugadoresMejorRankeadosSuperados = stats.jugadores_mejor_rankeados_superados || 0
  const maxJugadoresMejorRankeadosSuperados = stats.max_jugadores_mejor_rankeados_superados || 0
  const mejorTorneosMismoDia = stats.mejor_torneos_mismo_dia || 0
  const mejorTiempo = typeof stats.mejor_tiempo === 'number' ? stats.mejor_tiempo : null
  const victoriasSinErrores = stats.victorias_sin_errores || 0
  const mejorPosicion = typeof stats.mejor_posicion_torneo === 'number' ? stats.mejor_posicion_torneo : null

  if (objetivoTexto.includes('horas acumuladas')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(tiempoJugadoTotalHoras, target), label: describirNumero(tiempoJugadoTotalHoras, target, 'h'), target }
  }

  if (objetivoTexto.includes('horas seguidas')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaTiempoHoras, target), label: describirNumero(mejorRachaTiempoHoras, target, 'h'), target }
  }

  if (objetivoTexto.includes('sin errores') && objetivoTexto.includes('seguid')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaSinErrores, target), label: describirNumero(mejorRachaSinErrores, target), target }
  }

  if (objetivoTexto.includes('sudokus seguidos') || objetivoTexto.includes('sudokus consecutivos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaCompletados, target), label: describirNumero(mejorRachaCompletados, target), target }
  }

  if (objetivoTexto.includes('sin cometer errores') || objetivoTexto.includes('sin errores')) {
    return { percent: limitarProgreso(completadosSinErrores, 1), label: describirNumero(completadosSinErrores, 1), target: 1 }
  }

  if (objetivoTexto.includes('completa') && objetivoTexto.includes('sudoku')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(completados, target), label: describirNumero(completados, target), target }
  }

  if (objetivoTexto.includes('menos de') && objetivoTexto.includes('minuto')) {
    const targetMinutes = objetivo || 1
    const targetSeconds = targetMinutes * 60
    const percent = mejorTiempo === null ? 0 : mejorTiempo < targetSeconds ? 100 : Math.max(5, Math.min(95, Math.round((targetSeconds / mejorTiempo) * 100)))
    return { percent, label: mejorTiempo === null ? `0 / ${targetMinutes} min` : `${formatearTiempo(mejorTiempo)} / ${targetMinutes}:00`, target: targetMinutes }
  }

  if (objetivoTexto.includes('participa')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(torneosParticipados, target), label: describirNumero(torneosParticipados, target), target }
  }

  if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo') && objetivoTexto.includes('sin cometer errores')) {
    return { percent: limitarProgreso(victoriasSinErrores, 1), label: describirNumero(victoriasSinErrores, 1), target: 1 }
  }

  if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(victoriasTorneos, target), label: describirNumero(victoriasTorneos, target), target }
  }

  if (objetivoTexto.includes('top 10') && objetivoTexto.includes('seguid')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaTop10, target), label: describirNumero(mejorRachaTop10, target), target }
  }

  if (objetivoTexto.includes('top 15') && objetivoTexto.includes('torneos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(top15Torneos, target), label: describirNumero(top15Torneos, target), target }
  }

  if (objetivoTexto.includes('top ') || objetivoTexto.includes('primeros') || objetivoTexto.includes('4 lugar')) {
    const target = objetivoTexto.includes('top 50') ? 50 : objetivoTexto.includes('top 25') ? 25 : objetivoTexto.includes('top 10') ? 10 : objetivoTexto.includes('4 lugar') ? 4 : 3
    const ok = mejorPosicion !== null && mejorPosicion <= target
    const label = mejorPosicion === null ? `sin marca / top ${target}` : `#${mejorPosicion} / top ${target}`
    return { percent: ok ? 100 : 0, label, target }
  }

  if (objetivoTexto.includes('4 lugar')) return { percent: limitarProgreso(cuartosLugares, 1), label: describirNumero(cuartosLugares, 1), target: 1 }
  if (objetivoTexto.includes('mejora tu posicion')) return { percent: limitarProgreso(posicionesMejoradas, 1), label: describirNumero(posicionesMejoradas, 1), target: 1 }
  if (objetivoTexto.includes('20 posiciones')) return { percent: limitarProgreso(maxPosicionesSubidas, 21), label: `${maxPosicionesSubidas} / 21`, target: 21 }
  if (objetivoTexto.includes('mejor posicion historica')) return { percent: limitarProgreso(mejoresHistoricasSuperadas, 1), label: describirNumero(mejoresHistoricasSuperadas, 1), target: 1 }
  if (objetivoTexto.includes('mismo dia')) return { percent: limitarProgreso(mejorTorneosMismoDia, objetivo || 1), label: describirNumero(mejorTorneosMismoDia, objetivo || 1), target: objetivo || 1 }
  if (objetivoTexto.includes('5 jugadores')) return { percent: limitarProgreso(maxJugadoresMejorRankeadosSuperados, 5), label: describirNumero(maxJugadoresMejorRankeadosSuperados, 5), target: 5 }
  if (objetivoTexto.includes('mejor rankeado')) return { percent: limitarProgreso(jugadoresMejorRankeadosSuperados, 1), label: describirNumero(jugadoresMejorRankeadosSuperados, 1), target: 1 }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerRarezaSudoku(progress, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = progress.target || 1
  if (objetivoTexto.includes('3000') || objetivoTexto.includes('2000') || target >= 300 || objetivoTexto.includes('leyenda')) return 'legendary'
  if (target >= 80 || objetivoTexto.includes('1000') || objetivoTexto.includes('500') || objetivoTexto.includes('campeon')) return 'epic'
  if (target >= 10 || objetivoTexto.includes('torneo') || objetivoTexto.includes('tiempo')) return 'rare'
  return 'common'
}

function obtenerIconoSudoku(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('tiempo') || objetivoTexto.includes('horas') || objetivoTexto.includes('minuto')) return '⌁'
  if (objetivoTexto.includes('torneo') || objetivoTexto.includes('top') || objetivoTexto.includes('gana')) return '◇'
  if (objetivoTexto.includes('sin errores') || objetivoTexto.includes('sin cometer')) return '∴'
  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('consecut')) return '∞'
  return '3×3'
}

function obtenerIconoSudokuVisual(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('tiempo') || objetivoTexto.includes('horas') || objetivoTexto.includes('minuto')) {
    return { label: 'TIME', className: 'time' }
  }
  if (objetivoTexto.includes('torneo') || objetivoTexto.includes('top') || objetivoTexto.includes('gana')) {
    return { label: 'CROWN', className: 'crown' }
  }
  if (objetivoTexto.includes('sin errores') || objetivoTexto.includes('sin cometer')) {
    return { label: 'EYE', className: 'precision' }
  }
  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('consecut')) {
    return { label: 'CHAIN', className: 'streak' }
  }
  return { label: '3x3', className: 'grid' }
}

function obtenerVarianteComunSudoku(achievement) {
  const texto = textoPlano(`${achievement.title || ''} ${achievement.howTo || ''}`)
  let hash = 0
  for (let i = 0; i < texto.length; i += 1) hash = (hash + texto.charCodeAt(i) * (i + 1)) % 8
  return `sudoku-common-v${hash + 1}`
}

function obtenerVarianteRaraSudoku(achievement) {
  const texto = textoPlano(`${achievement.title || ''} ${achievement.description || ''} ${achievement.howTo || ''}`)
  let hash = 0
  for (let i = 0; i < texto.length; i += 1) hash = (hash + texto.charCodeAt(i) * (i + 3)) % 8
  return `sudoku-rare-v${hash + 1}`
}

function renderLogroSudoku(achievement, stats) {
  const progress = obtenerProgresoSudoku(achievement, stats)
  const rarity = obtenerRarezaSudoku(progress, achievement)
  const icon = obtenerIconoSudokuVisual(achievement)
  const visualVariant = rarity === 'common'
    ? ` ${obtenerVarianteComunSudoku(achievement)}`
    : rarity === 'rare'
      ? ` ${obtenerVarianteRaraSudoku(achievement)}`
      : ''
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  const div = document.createElement('div')
  div.className = `achievement-card sudoku-relic ${rarity}${visualVariant}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.innerHTML = `
    <div class="sudoku-relic-header">
      <div class="sudoku-relic-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="sudoku-relic-badges">
        <span class="sudoku-relic-rarity">${rarityLabel}</span>
        <span class="sudoku-relic-state">${achievement.unlocked ? 'Desbloqueado' : 'Sellado'}</span>
      </div>
    </div>
    <div class="sudoku-relic-main">
      <strong class="sudoku-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="sudoku-relic-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="sudoku-objective">
        <span>Objetivo</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="sudoku-progress" aria-label="Progreso">
        <div class="sudoku-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="sudoku-progress-track">
          <div class="sudoku-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function obtenerProgresoMemoria(achievement, stats) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const objetivo = obtenerPrimerNumero(objetivoTexto)
  const completados = stats.completados || 0
  const completadosSinErrores = stats.completados_sin_errores || 0
  const mejorRachaCompletados = stats.mejor_racha_completados || 0
  const mejorRachaSinErrores = stats.mejor_racha_sin_errores || 0
  const mejorRachaPares = stats.memoria_mejor_racha_pares || 0
  const mejorRachaFallos = stats.memoria_mejor_racha_fallos || 0
  const maxErroresPartida = stats.memoria_max_errores_partida || 0
  const minErroresPartida = typeof stats.memoria_min_errores_partida === 'number' ? stats.memoria_min_errores_partida : null
  const mejorTiempo = typeof stats.mejor_tiempo === 'number' ? stats.mejor_tiempo : null
  const mejorTiempoSinErrores = typeof stats.memoria_mejor_tiempo_sin_errores === 'number' ? stats.memoria_mejor_tiempo_sin_errores : null
  const paresAntes1Minuto = stats.memoria_pares_antes_1min || 0
  const mejorPartidas10Min = stats.memoria_mejor_partidas_10min || 0
  const mejorPartidas15Min = stats.memoria_mejor_partidas_15min || 0
  const maxIntentosPartida = stats.memoria_max_intentos_partida || 0

  const flags = [
    ['falloUltimoPar', stats.memoria_fallo_ultimo_par || 0, 'ultimo par'],
    ['aciertoTras5Fallos', stats.memoria_acierto_tras_5_fallos || 0, '5 intentos fallidos'],
    ['aciertoTras2Fallos', stats.memoria_acierto_tras_2_fallos || 0, 'fallar el mismo dos veces'],
    ['parSinVerPrevio', stats.memoria_par_sin_ver_previo || 0, 'sin haber volteado'],
    ['menos20Movimientos', stats.memoria_menos_20_movimientos || 0, 'menos de 20 movimientos'],
    ['mejorasTiempo', stats.memoria_mejoras_tiempo || 0, 'mejora tu tiempo'],
    ['sinRepetirErrorPar', stats.memoria_sin_repetir_error_par || 0, 'sin repetir errores'],
    ['primerMovimientoPar', stats.memoria_primer_movimiento_par || 0, 'dos primeros movimientos'],
    ['lineal', stats.memoria_lineal || 0, 'orden lineal'],
    ['sinPatronRepetido', stats.memoria_sin_patron_repetido || 0, 'patron repetido'],
    ['anticipacion', stats.memoria_anticipacion || 0, 'ultimos 5 movimientos'],
    ['sinCartasFalladasRepetidas', stats.memoria_sin_cartas_falladas_repetidas || 0, 'carta fallada'],
    ['inicio4Pares', stats.memoria_inicio_4_pares || 0, 'al iniciar'],
    ['final4Pares', stats.memoria_final_4_pares || 0, 'ultimos 4 pares'],
  ]

  if (objetivoTexto.includes('pares incorrectos seguidos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaFallos, target), label: describirNumero(mejorRachaFallos, target), target }
  }

  if ((objetivoTexto.includes('pares seguidos') || objetivoTexto.includes('seguidos correctamente')) && !objetivoTexto.includes('incorrectos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaPares, target), label: describirNumero(mejorRachaPares, target), target }
  }

  if (objetivoTexto.includes('sin equivocarte') || objetivoTexto.includes('sin fallos')) {
    const target = objetivoTexto.includes('consecutiv') || objetivoTexto.includes('seguid') ? (objetivo || 1) : 1
    const actual = target > 1 ? mejorRachaSinErrores : completadosSinErrores
    return { percent: limitarProgreso(actual, target), label: describirNumero(actual, target), target }
  }

  if (objetivoTexto.includes('partidas seguidas') || objetivoTexto.includes('partidas consecutivas') || objetivoTexto.includes('sin interrupcion')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaCompletados, target), label: describirNumero(mejorRachaCompletados, target), target }
  }

  if (objetivoTexto.includes('partidas en total')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(completados, target), label: describirNumero(completados, target), target }
  }

  if (objetivoTexto.includes('partidas en menos de 10 minutos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorPartidas10Min, target), label: describirNumero(mejorPartidas10Min, target), target }
  }

  if (objetivoTexto.includes('partidas en menos de 15 minutos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorPartidas15Min, target), label: describirNumero(mejorPartidas15Min, target), target }
  }

  if (objetivoTexto.includes('pares en menos de 1 minuto')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(paresAntes1Minuto, target), label: describirNumero(paresAntes1Minuto, target), target }
  }

  if (objetivoTexto.includes('menos de') && objetivoTexto.includes('minuto')) {
    const targetMinutes = objetivo || 1
    const targetSeconds = targetMinutes * 60
    const tiempoReferencia = objetivoTexto.includes('sin errores') ? mejorTiempoSinErrores : mejorTiempo
    const percent = tiempoReferencia === null ? 0 : tiempoReferencia < targetSeconds ? 100 : Math.max(5, Math.min(95, Math.round((targetSeconds / tiempoReferencia) * 100)))
    return { percent, label: tiempoReferencia === null ? `0 / ${targetMinutes} min` : `${formatearTiempo(tiempoReferencia)} / ${targetMinutes}:00`, target: targetMinutes }
  }

  if (objetivoTexto.includes('mas de') && objetivoTexto.includes('errores')) {
    const target = (objetivo || 1) + 1
    return { percent: limitarProgreso(maxErroresPartida, target), label: describirNumero(maxErroresPartida, target), target }
  }

  if (objetivoTexto.includes('falla') && objetivoTexto.includes('veces')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(maxErroresPartida, target), label: describirNumero(maxErroresPartida, target), target }
  }

  if (objetivoTexto.includes('menos de') && objetivoTexto.includes('errores')) {
    const target = objetivo || 1
    const ok = minErroresPartida !== null && minErroresPartida < target
    return { percent: ok ? 100 : 0, label: minErroresPartida === null ? `sin marca / < ${target}` : `${minErroresPartida} / < ${target}`, target }
  }

  if (objetivoTexto.includes('mas de') && objetivoTexto.includes('intentos')) {
    const target = (objetivo || 1) + 1
    return { percent: limitarProgreso(maxIntentosPartida, target), label: describirNumero(maxIntentosPartida, target), target }
  }

  const flag = flags.find(([, , token]) => objetivoTexto.includes(token))
  if (flag) {
    const actual = flag[1]
    return { percent: limitarProgreso(actual, 1), label: describirNumero(actual, 1), target: 1 }
  }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerRarezaMemoria(progress, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = progress.target || 1
  if (target >= 100 || objetivoTexto.includes('150') || objetivoTexto.includes('absoluto')) return 'legendary'
  if (target >= 40 || objetivoTexto.includes('sin errores') || objetivoTexto.includes('quirurgico')) return 'epic'
  if (target >= 8 || objetivoTexto.includes('menos de') || objetivoTexto.includes('incorrectos')) return 'rare'
  return 'common'
}

function obtenerIconoMemoria(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('incorrectos') || objetivoTexto.includes('fall')) return { label: 'ERROR', className: 'error' }
  if (objetivoTexto.includes('menos de') || objetivoTexto.includes('rapida')) return { label: 'TIME', className: 'speed' }
  if (objetivoTexto.includes('sin') || objetivoTexto.includes('perfect')) return { label: 'FOCUS', className: 'perfect' }
  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('consecut')) return { label: 'CHAIN', className: 'streak' }
  return { label: 'PAIR', className: 'pair' }
}

function renderLogroMemoria(achievement, stats) {
  const progress = obtenerProgresoMemoria(achievement, stats)
  const rarity = obtenerRarezaMemoria(progress, achievement)
  const icon = obtenerIconoMemoria(achievement)
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  const div = document.createElement('div')
  div.className = `achievement-card memory-relic ${rarity}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.innerHTML = `
    <div class="memory-relic-header">
      <div class="memory-relic-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="memory-relic-badges">
        <span class="memory-relic-rarity">${rarityLabel}</span>
        <span class="memory-relic-state">${achievement.unlocked ? 'Recordado' : 'Olvidado'}</span>
      </div>
    </div>
    <div class="memory-relic-main">
      <strong class="memory-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="memory-relic-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="memory-objective">
        <span>Recuerdo</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="memory-progress" aria-label="Progreso">
        <div class="memory-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="memory-progress-track">
          <div class="memory-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function obtenerKeyRapidezMatematica(segundosTexto) {
  return segundosTexto.replace('.', '_').replace(',', '_') + 's'
}

function obtenerProgresoMatematicas(achievement, stats) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const objetivo = obtenerPrimerNumero(objetivoTexto)
  const totalCorrectas = stats.matematicas_total_correctas || 0
  const sesionesSinErrores = stats.matematicas_sesiones_sin_errores || 0
  const mejorRachaCorrectas = stats.matematicas_mejor_racha_correctas || 0
  const mejorRacha3s = stats.matematicas_mejor_racha_3s || 0
  const mejorRacha5s = stats.matematicas_mejor_racha_5s || 0
  const mejorCorrectas60s = stats.matematicas_mejor_correctas_60s || 0

  if (objetivoTexto.includes('menos de') && objetivoTexto.includes('segundos')) {
    const match = objetivoTexto.match(/menos de ([\d.,]+) segundos/)
    const limite = match ? obtenerKeyRapidezMatematica(match[1]) : null
    const actual = limite ? (stats[`matematicas_ejercicios_menos_${limite}`] || 0) : 0
    const target = objetivo || 1
    return { percent: limitarProgreso(actual, target), label: describirNumero(actual, target), target }
  }

  if (objetivoTexto.includes('menos de 3 segundos cada uno')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRacha3s, target), label: describirNumero(mejorRacha3s, target), target }
  }

  if (objetivoTexto.includes('menos de 5 segundos cada uno')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRacha5s, target), label: describirNumero(mejorRacha5s, target), target }
  }

  if (objetivoTexto.includes('menos de 60 segundos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorCorrectas60s, target), label: describirNumero(mejorCorrectas60s, target), target }
  }

  if (objetivoTexto.includes('sesion sin errores')) {
    return { percent: limitarProgreso(sesionesSinErrores, 1), label: describirNumero(sesionesSinErrores, 1), target: 1 }
  }

  if (objetivoTexto.includes('en total')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(totalCorrectas, target), label: describirNumero(totalCorrectas, target), target }
  }

  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('consecutiv') || objetivoTexto.includes('operaciones consecutivas')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaCorrectas, target), label: describirNumero(mejorRachaCorrectas, target), target }
  }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerRarezaMatematicas(progress, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = progress.target || 1
  if (target >= 180 || objetivoTexto.includes('0.8') || objetivoTexto.includes('1 segundo')) return 'legendary'
  if (target >= 70 || objetivoTexto.includes('1.2') || objetivoTexto.includes('1.5') || objetivoTexto.includes('2 segundos')) return 'epic'
  if (target >= 10 || objetivoTexto.includes('menos de') || objetivoTexto.includes('sin errores')) return 'rare'
  return 'common'
}

function obtenerIconoMatematicas(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('menos de')) return { label: 'TIME', className: 'speed' }
  if (objetivoTexto.includes('sin errores') || objetivoTexto.includes('sin fallar')) return { label: 'PROOF', className: 'perfect' }
  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('consecut')) return { label: 'CHAIN', className: 'streak' }
  return { label: 'FORM', className: 'formula' }
}

function renderLogroMatematicas(achievement, stats) {
  const progress = obtenerProgresoMatematicas(achievement, stats)
  const rarity = obtenerRarezaMatematicas(progress, achievement)
  const icon = obtenerIconoMatematicas(achievement)
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  const div = document.createElement('div')
  div.className = `achievement-card math-relic ${rarity}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.innerHTML = `
    <div class="math-relic-header">
      <div class="math-relic-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="math-relic-badges">
        <span class="math-relic-rarity">${rarityLabel}</span>
        <span class="math-relic-state">${achievement.unlocked ? 'Resuelto' : 'Cifrado'}</span>
      </div>
    </div>
    <div class="math-relic-main">
      <strong class="math-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="math-relic-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="math-objective">
        <span>Teorema</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="math-progress" aria-label="Progreso">
        <div class="math-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="math-progress-track">
          <div class="math-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function obtenerProgresoFlashmind(achievement, stats) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const objetivo = obtenerPrimerNumero(objetivoTexto)
  const mejorRachaCorrectas = stats.flashmind_mejor_racha_correctas || 0
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const mejorRachaTop3 = stats.mejor_racha_top3_torneos || 0
  const victoriasSinErrores = stats.victorias_sin_errores || 0

  if (objetivoTexto.includes('respuesta') || objetivoTexto.includes('correcta')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaCorrectas, target), label: describirNumero(mejorRachaCorrectas, target), target }
  }

  if (objetivoTexto.includes('sin cometer') || objetivoTexto.includes('sin error')) {
    return { percent: limitarProgreso(victoriasSinErrores, 1), label: describirNumero(victoriasSinErrores, 1), target: 1 }
  }

  if (objetivoTexto.includes('top 3')) {
    const target = obtenerNumeroDeTorneos(objetivoTexto) || objetivo || 1
    return { percent: limitarProgreso(mejorRachaTop3, target), label: describirNumero(mejorRachaTop3, target), target }
  }

  if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaVictorias, target), label: describirNumero(mejorRachaVictorias, target), target }
  }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerProgresoNumcatch(achievement, stats) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const objetivo = obtenerPrimerNumero(objetivoTexto)
  const mejorRachaAciertosVictoria = stats.numcatch_mejor_racha_aciertos_victoria || 0
  const minErroresVictoria = typeof stats.numcatch_min_errores_victoria === 'number'
    ? stats.numcatch_min_errores_victoria
    : null
  const victorias1Error = stats.numcatch_victorias_1_error || 0
  const victorias2Errores = stats.numcatch_victorias_2_errores || 0
  const victoriasMenos14Errores = stats.numcatch_victorias_menos_14_errores || 0
  const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
  const top3Torneos = stats.top3_torneos || 0
  const victoriaTrasFueraPodio = stats.numcatch_victoria_tras_fuera_podio || 0
  const mejorRachaTop3SinBajar = stats.numcatch_mejor_racha_top3_sin_bajar || 0
  const mejorRachaVictorias400 = stats.numcatch_mejor_racha_victorias_400 || 0
  const mejorRachaVictorias1200 = stats.numcatch_mejor_racha_victorias_1200 || 0

  if (objetivoTexto.includes('aciertos seguidos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaAciertosVictoria, target), label: describirNumero(mejorRachaAciertosVictoria, target), target }
  }

  if (objetivoTexto.includes('exactamente 1 error')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(victorias1Error, target), label: describirNumero(victorias1Error, target), target }
  }

  if (objetivoTexto.includes('exactamente 2 errores')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(victorias2Errores, target), label: describirNumero(victorias2Errores, target), target }
  }

  if (objetivoTexto.includes('menos de 14 errores') && objetivoTexto.includes('torneos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(victoriasMenos14Errores, target), label: describirNumero(victoriasMenos14Errores, target), target }
  }

  if (objetivoTexto.includes('menos de') && objetivoTexto.includes('errores')) {
    const target = objetivo || 1
    const percent = minErroresVictoria === null
      ? 0
      : minErroresVictoria < target
        ? 100
        : Math.max(5, Math.min(95, Math.round((target / Math.max(minErroresVictoria, 1)) * 100)))
    const label = minErroresVictoria === null ? `sin marca / < ${target}` : `${minErroresVictoria} / < ${target}`
    return { percent, label, target }
  }

  if (objetivoTexto.includes('0 errores')) {
    const percent = minErroresVictoria === 0 ? 100 : 0
    const label = minErroresVictoria === null ? 'sin marca / 0' : `${minErroresVictoria} / 0`
    return { percent, label, target: 1 }
  }

  if (objetivoTexto.includes('mas de 400 puntos') || objetivoTexto.includes('más de 400 puntos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaVictorias400, target), label: describirNumero(mejorRachaVictorias400, target), target }
  }

  if (objetivoTexto.includes('mas de 1200 puntos') || objetivoTexto.includes('más de 1200 puntos')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaVictorias1200, target), label: describirNumero(mejorRachaVictorias1200, target), target }
  }

  if (objetivoTexto.includes('fuera del podio')) {
    return { percent: limitarProgreso(victoriaTrasFueraPodio, 1), label: describirNumero(victoriaTrasFueraPodio, 1), target: 1 }
  }

  if (objetivoTexto.includes('top 3') && objetivoTexto.includes('sin bajar')) {
    const target = obtenerNumeroDeTorneos(objetivoTexto) || objetivo || 1
    return { percent: limitarProgreso(mejorRachaTop3SinBajar, target), label: describirNumero(mejorRachaTop3SinBajar, target), target }
  }

  if (objetivoTexto.includes('top 3')) {
    const target = obtenerNumeroDeTorneos(objetivoTexto) || objetivo || 1
    return { percent: limitarProgreso(top3Torneos, target), label: describirNumero(top3Torneos, target), target }
  }

  if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo')) {
    const target = objetivo || 1
    return { percent: limitarProgreso(mejorRachaVictorias, target), label: describirNumero(mejorRachaVictorias, target), target }
  }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerRarezaArcana(progress, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = progress.target || 1
  if (target >= 250 || objetivoTexto.includes('400 torneos') || objetivoTexto.includes('100 torneos') || objetivoTexto.includes('0 errores')) return 'legendary'
  if (target >= 70 || objetivoTexto.includes('55') || objetivoTexto.includes('75') || objetivoTexto.includes('1200') || objetivoTexto.includes('sin cometer')) return 'epic'
  if (target >= 10 || objetivoTexto.includes('torneo') || objetivoTexto.includes('menos de') || objetivoTexto.includes('top 3')) return 'rare'
  return 'common'
}

function obtenerRarezaCricket(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = obtenerNumeroCricket(objetivoTexto) || 1

  if (objetivoTexto.includes('torneo')) {
    if (target >= 100) return 'legendary'
    if (target >= 25) return 'epic'
    if (target >= 3) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('hora')) {
    if (target >= 500) return 'legendary'
    if (target >= 75) return 'epic'
    if (target >= 5) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('punto')) {
    if (target >= 5000) return 'legendary'
    if (target >= 1000) return 'epic'
    if (target >= 300) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('vida')) {
    if (objetivoTexto.includes('5 minutos') || objetivoTexto.includes('sin perder')) return 'epic'
    return 'rare'
  }

  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('sin fallar')) {
    if (target >= 85) return 'legendary'
    if (target >= 35) return 'epic'
    if (target >= 5) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('golpe')) {
    if (target >= 145) return 'legendary'
    if (target >= 50) return 'epic'
    if (target >= 14) return 'rare'
    return 'common'
  }

  return achievement.unlocked ? 'rare' : 'common'
}

function obtenerNumeroCricket(texto) {
  const limpio = String(texto || '').replace(/\./g, '').replace(/,/g, '')
  const coincidencia = limpio.match(/\d+/)
  return coincidencia ? Number(coincidencia[0]) : null
}

function obtenerRarezaEsquivaObstaculos(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = obtenerNumeroCricket(objetivoTexto) || 1
  if (objetivoTexto.includes('punto')) {
    if (target >= 7500) return 'legendary'
    if (target >= 2000) return 'epic'
    if (target >= 750) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('vida')) {
    if (objetivoTexto.includes('500') || objetivoTexto.includes('300')) return 'legendary'
    if (objetivoTexto.includes('189') || objetivoTexto.includes('289') || objetivoTexto.includes('sin perder')) return 'epic'
    if (objetivoTexto.includes('50')) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('obstaculo') || objetivoTexto.includes('obst&aacute;culo') || objetivoTexto.includes('obstáculo')) {
    if (target >= 1500) return 'legendary'
    if (target >= 500) return 'epic'
    if (target >= 100) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('partida')) {
    if (target >= 500) return 'legendary'
    if (target >= 100) return 'epic'
    if (target >= 25) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('torneo')) {
    if (target >= 100) return 'legendary'
    if (target >= 35) return 'epic'
    if (target >= 8) return 'rare'
    return 'common'
  }

  if (target >= 75) return 'legendary'
  if (target >= 28) return 'epic'
  if (target >= 7) return 'rare'
  return 'common'
}

function obtenerRarezaTorreInfinita(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = obtenerNumeroCricket(objetivoTexto) || 1
  if (objetivoTexto.includes('punto')) {
    if (target >= 1000000) return 'legendary'
    if (target >= 250000) return 'epic'
    if (target >= 50000) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('partida')) {
    if (target >= 1000) return 'legendary'
    if (target >= 500) return 'epic'
    if (target >= 100) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('torneo')) {
    if (target >= 1000) return 'legendary'
    if (target >= 150) return 'epic'
    if (target >= 10) return 'rare'
    return 'common'
  }

  if (target >= 1500) return 'legendary'
  if (target >= 650) return 'epic'
  if (target >= 230) return 'rare'
  return 'common'
}

function obtenerRarezaSubeLaMontana(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const target = obtenerNumeroCricket(objetivoTexto) || 1
  if (objetivoTexto.includes('punto')) {
    if (target >= 500000) return 'legendary'
    if (target >= 100000) return 'epic'
    if (target >= 25000) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('partida')) {
    if (target >= 10000) return 'legendary'
    if (target >= 2500) return 'epic'
    if (target >= 250) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('torneo')) {
    if (target >= 100) return 'legendary'
    if (target >= 35) return 'epic'
    if (target >= 10) return 'rare'
    return 'common'
  }

  if (objetivoTexto.includes('vida')) {
    if (objetivoTexto.includes('10 minuto') || objetivoTexto.includes('8 minuto') || objetivoTexto.includes('partida completa')) return 'legendary'
    if (objetivoTexto.includes('5 minuto') || objetivoTexto.includes('6 minuto') || objetivoTexto.includes('4 minuto')) return 'epic'
    if (objetivoTexto.includes('90') || objetivoTexto.includes('2 minuto') || objetivoTexto.includes('3 minuto')) return 'rare'
    return 'common'
  }

  if (target >= 10000) return 'legendary'
  if (target >= 2500) return 'epic'
  if (target >= 500) return 'rare'
  return 'common'
}

function obtenerProgresoCricket(achievement, stats, resultado) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  const objetivo = obtenerNumeroCricket(objetivoTexto) || 1
  const golpesTotal = stats.cricket_golpes_total || 0
  const mejorGolpesPartida = stats.cricket_mejor_golpes_partida || 0
  const mejorRachaGolpes = Math.max(stats.cricket_mejor_racha_golpes || 0, stats.mejor_racha_completados || 0)
  const mejorScore = Math.max(stats.cricket_mejor_puntaje || 0, Number(resultado?.tiempo || 0))
  const victoriasTorneos = stats.victorias_torneos || 0
  const tiempoJugadoHoras = Math.floor((stats.tiempo_jugado_total || 0) / 3600)
  const partidasUnaVida = stats.cricket_partidas_una_vida || 0
  const mejorTiempoUnaVida = stats.cricket_mejor_tiempo_una_vida || 0
  const partidasSinPerderTodas = stats.cricket_partidas_sin_perder_todas_las_vidas || 0
  const partidasDosVidas = stats.cricket_partidas_dos_vidas || 0

  if (objetivoTexto.includes('torneo')) {
    return { percent: limitarProgreso(victoriasTorneos, objetivo), label: describirNumero(victoriasTorneos, objetivo), target: objetivo }
  }

  if (objetivoTexto.includes('hora')) {
    return { percent: limitarProgreso(tiempoJugadoHoras, objetivo), label: describirNumero(tiempoJugadoHoras, objetivo, 'h'), target: objetivo }
  }

  if (objetivoTexto.includes('punto')) {
    return { percent: limitarProgreso(mejorScore, objetivo), label: describirNumero(mejorScore, objetivo, 'pts'), target: objetivo }
  }

  if (objetivoTexto.includes('5 minutos') && objetivoTexto.includes('1 vida')) {
    const targetSeconds = 5 * 60
    return { percent: limitarProgreso(mejorTiempoUnaVida, targetSeconds), label: describirNumero(mejorTiempoUnaVida, targetSeconds, 's'), target: targetSeconds }
  }

  if (objetivoTexto.includes('una sola vida') || objetivoTexto.includes('1 vida')) {
    return { percent: limitarProgreso(partidasUnaVida, 1), label: describirNumero(partidasUnaVida, 1), target: 1 }
  }

  if (objetivoTexto.includes('solo 2 vidas')) {
    return { percent: limitarProgreso(partidasDosVidas, 1), label: describirNumero(partidasDosVidas, 1), target: 1 }
  }

  if (objetivoTexto.includes('sin perder todas las vidas')) {
    return { percent: limitarProgreso(partidasSinPerderTodas, 1), label: describirNumero(partidasSinPerderTodas, 1), target: 1 }
  }

  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('sin fallar')) {
    return { percent: limitarProgreso(mejorRachaGolpes, objetivo), label: describirNumero(mejorRachaGolpes, objetivo), target: objetivo }
  }

  if (objetivoTexto.includes('una sola partida')) {
    return { percent: limitarProgreso(mejorGolpesPartida, objetivo), label: describirNumero(mejorGolpesPartida, objetivo), target: objetivo }
  }

  if (objetivoTexto.includes('golpe')) {
    return { percent: limitarProgreso(golpesTotal, objetivo), label: describirNumero(golpesTotal, objetivo), target: objetivo }
  }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerIconoCricket(achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('torneo')) return { label: 'CUP', className: 'crown' }
  if (objetivoTexto.includes('hora')) return { label: 'TIME', className: 'speed' }
  if (objetivoTexto.includes('punto')) return { label: 'SCORE', className: 'precision' }
  if (objetivoTexto.includes('vida')) return { label: 'LIVE', className: 'rebound' }
  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('sin fallar')) return { label: 'CHAIN', className: 'streak' }
  return { label: 'BAT', className: 'core' }
}

function renderLogroCricket(achievement, stats, resultado) {
  const progress = obtenerProgresoCricket(achievement, stats, resultado)
  const rarity = obtenerRarezaCricket(achievement)
  const icon = obtenerIconoCricket(achievement)
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  const div = document.createElement('div')
  div.className = `achievement-card arcane-relic cricket-relic ${rarity}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.setAttribute('data-sigil', '22 55 85 CRICKET')
  div.innerHTML = `
    <div class="arcane-relic-header">
      <div class="arcane-relic-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="arcane-relic-badges">
        <span class="arcane-relic-rarity">${rarityLabel}</span>
        <span class="arcane-relic-state">${achievement.unlocked ? 'Coronado' : 'Sellado'}</span>
      </div>
    </div>
    <div class="arcane-relic-main">
      <strong class="arcane-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="arcane-relic-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="arcane-objective">
        <span>Estadio</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="arcane-progress" aria-label="Progreso">
        <div class="arcane-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="arcane-progress-track">
          <div class="arcane-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function obtenerIconoArcano(gameKey, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('menos de') || objetivoTexto.includes('0 errores') || objetivoTexto.includes('exactamente')) {
    return { label: gameKey === 'numcatch' ? 'EYE' : 'FOCUS', className: 'precision' }
  }
  if (objetivoTexto.includes('respuesta') || objetivoTexto.includes('acierto')) {
    return { label: gameKey === 'flashmind' ? 'MIND' : 'LOCK', className: 'speed' }
  }
  if (objetivoTexto.includes('top 3') || objetivoTexto.includes('gana') || objetivoTexto.includes('torneo')) {
    return { label: 'CROWN', className: 'crown' }
  }
  if (objetivoTexto.includes('seguid') || objetivoTexto.includes('consecut')) {
    return { label: 'CHAIN', className: 'streak' }
  }
  if (objetivoTexto.includes('fuera del podio')) {
    return { label: 'RISE', className: 'rebound' }
  }
  return { label: gameKey === 'flashmind' ? 'MIND' : 'NUM', className: 'core' }
}

function renderLogroArcano(achievement, stats, gameKey) {
  const progress = gameKey === 'flashmind'
    ? obtenerProgresoFlashmind(achievement, stats)
    : obtenerProgresoNumcatch(achievement, stats)
  const rarity = obtenerRarezaArcana(progress, achievement)
  const icon = obtenerIconoArcano(gameKey, achievement)
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  const gameCopy = gameKey === 'flashmind'
    ? { stateOn: 'Encendido', stateOff: 'Dormido', objective: 'Vision', sigil: '01 13 21 34 MIND' }
    : { stateOn: 'Capturado', stateOff: 'Sellado', objective: 'Caceria', sigil: '07 42 99 NUM' }
  const div = document.createElement('div')
  div.className = `achievement-card arcane-relic ${gameKey}-relic ${rarity}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.setAttribute('data-sigil', gameCopy.sigil)
  div.innerHTML = `
    <div class="arcane-relic-header">
      <div class="arcane-relic-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="arcane-relic-badges">
        <span class="arcane-relic-rarity">${rarityLabel}</span>
        <span class="arcane-relic-state">${achievement.unlocked ? gameCopy.stateOn : gameCopy.stateOff}</span>
      </div>
    </div>
    <div class="arcane-relic-main">
      <strong class="arcane-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="arcane-relic-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="arcane-objective">
        <span>${gameCopy.objective}</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="arcane-progress" aria-label="Progreso">
        <div class="arcane-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="arcane-progress-track">
          <div class="arcane-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function obtenerProgresoTablero(achievement, stats, gameKey) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const objetivo = obtenerPrimerNumero(objetivoTexto)

  if (gameKey === 'domino') {
    const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
    const mejorRachaTop10 = stats.mejor_racha_top10_torneos || 0
    const mejorRachaInvicto = stats.domino_mejor_racha_invicto || 0

    if (objetivoTexto.includes('sin perder')) {
      const target = objetivo || 1
      return { percent: limitarProgreso(mejorRachaInvicto, target), label: describirNumero(mejorRachaInvicto, target), target }
    }

    if (objetivoTexto.includes('top 10')) {
      const target = obtenerNumeroDeTorneos(objetivoTexto) || objetivo || 1
      return { percent: limitarProgreso(mejorRachaTop10, target), label: describirNumero(mejorRachaTop10, target), target }
    }

    if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo')) {
      const target = objetivo || 1
      return { percent: limitarProgreso(mejorRachaVictorias, target), label: describirNumero(mejorRachaVictorias, target), target }
    }
  }

  if (gameKey === 'damas') {
    const mejorRachaVictorias = stats.mejor_racha_victorias_torneos || 0
    const mejorRachaSegundo = stats.damas_mejor_racha_segundo || 0
    const mejorRachaTercero = stats.damas_mejor_racha_tercero || 0
    const torneosObjetivo = obtenerNumeroDeTorneos(objetivoTexto) || objetivo || 1

    if (objetivoTexto.includes('2er puesto')) {
      const target = torneosObjetivo
      return { percent: limitarProgreso(mejorRachaSegundo, target), label: describirNumero(mejorRachaSegundo, target), target }
    }

    if (objetivoTexto.includes('3er puesto')) {
      const target = torneosObjetivo
      return { percent: limitarProgreso(mejorRachaTercero, target), label: describirNumero(mejorRachaTercero, target), target }
    }

    if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo')) {
      const target = torneosObjetivo
      return { percent: limitarProgreso(mejorRachaVictorias, target), label: describirNumero(mejorRachaVictorias, target), target }
    }
  }

  if (gameKey === 'ajedrez') {
    const metricas = [
      ['sin perder ninguna pieza', stats.ajedrez_victorias_sin_perder_piezas || 0, 1],
      ['sacrificar tu reina', stats.ajedrez_mate_tras_sacrificar_reina || 0, 1],
      ['piezas menores y peones', stats.ajedrez_final_menores_peones || 0, 1],
      ['15 puntos de material abajo', stats.ajedrez_remontada_15_material || 0, 1],
      ['dos piezas consecutivas', stats.ajedrez_dos_sacrificios_consecutivos || 0, 1],
      ['mas de 80 movimientos', stats.ajedrez_victorias_80_movimientos || 0, 1],
      ['rey y un peon', stats.ajedrez_rey_peon_vs_piezas || 0, 1],
      ['mayor rango', stats.ajedrez_derrota_mayor_rango || 0, 1],
      ['13 movimientos consecutivos sin cometer errores', stats.ajedrez_racha_13_sin_errores || 0, 1],
      ['50 partidas clasificatorias', stats.ajedrez_victorias_clasificatorias || 0, 50],
      ['5 turnos seguidos', stats.ajedrez_jaque_5_turnos || 0, 1],
      ['ambos alfiles', stats.ajedrez_mate_dos_alfiles || 0, 1],
      ['menos de 10 segundos', stats.ajedrez_victoria_menos_10s || 0, 1],
      ['antes del movimiento 15', stats.ajedrez_mate_antes_15 || 0, 1],
      ['tres errores consecutivos', stats.ajedrez_castiga_3_errores || 0, 1],
      ['piezas mayores enemigas', stats.ajedrez_captura_mayores_antes_mate || 0, 1],
      ['sin enrocarte', stats.ajedrez_victoria_sin_enrocar || 0, 1],
      ['corona tres peones', stats.ajedrez_3_promociones || 0, 1],
      ['misma apertura', stats.ajedrez_mejor_racha_apertura || 0, objetivo || 10],
      ['campeon de un torneo invicto', stats.ajedrez_campeon_invicto || 0, 1],
      ['jaque mate', stats.ajedrez_mejor_racha_mate || 0, objetivo || 1],
      ['aperturas diferentes', stats.ajedrez_mejor_racha_aperturas_diferentes || 0, objetivo || 1],
      ['menos de 25 movimientos', stats.ajedrez_mejor_racha_menos_25_movimientos || 0, objetivo || 1],
      ['sin empates', stats.ajedrez_mejor_racha_sin_tablas || 0, objetivo || 1],
      ['sacrificio', stats.ajedrez_mejor_racha_sacrificio || 0, objetivo || 1],
      ['sin perder ninguna torre', stats.ajedrez_mejor_racha_sin_perder_torre || 0, objetivo || 1],
      ['jaque antes del movimiento 10', stats.ajedrez_mejor_racha_jaque_antes_10 || 0, objetivo || 1],
      ['remontando desventaja material', stats.ajedrez_mejor_racha_remontada_material || 0, objetivo || 1],
      ['despues de haber perdido', stats.ajedrez_mejor_racha_victoria_tras_derrota || 0, objetivo || 1],
    ]
    const metrica = metricas.find(([patron]) => objetivoTexto.includes(patron))
    if (metrica) {
      const [, actual, target] = metrica
      return { percent: limitarProgreso(actual, target), label: describirNumero(actual, target), target }
    }

    if (objetivoTexto.includes('gana') && objetivoTexto.includes('torneo')) {
      const target = objetivo || 1
      const actual = stats.mejor_racha_victorias_torneos || 0
      return { percent: limitarProgreso(actual, target), label: describirNumero(actual, target), target }
    }
  }

  return { percent: achievement.unlocked ? 100 : 0, label: achievement.unlocked ? 'completo' : 'pendiente', target: 1 }
}

function obtenerRarezaTablero(progress, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const target = progress.target || 1
  if (target >= 100 || objetivoTexto.includes('campeon') || objetivoTexto.includes('invicto') || objetivoTexto.includes('sacrificar tu reina') || objetivoTexto.includes('0 errores')) return 'legendary'
  if (target >= 35 || objetivoTexto.includes('15 puntos') || objetivoTexto.includes('80 movimientos') || objetivoTexto.includes('13 movimientos') || objetivoTexto.includes('jaque mate')) return 'epic'
  if (target >= 5 || objetivoTexto.includes('sin perder') || objetivoTexto.includes('top 10') || objetivoTexto.includes('menos de') || objetivoTexto.includes('consecutiv')) return 'rare'
  return 'common'
}

function obtenerPiezaAjedrezLogro(achievement) {
  const objetivoTexto = textoPlano(`${achievement.title || ''} ${achievement.howTo || ''}`).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (objetivoTexto.includes('reina')) return { label: 'Q', className: 'piece-queen' }
  if (objetivoTexto.includes('rey')) return { label: 'K', className: 'piece-king' }
  if (objetivoTexto.includes('caballo')) return { label: 'N', className: 'piece-knight' }
  if (objetivoTexto.includes('torre')) return { label: 'R', className: 'piece-rook' }
  if (objetivoTexto.includes('alfil')) return { label: 'B', className: 'piece-bishop' }
  if (objetivoTexto.includes('peon') || objetivoTexto.includes('promocion') || objetivoTexto.includes('corona')) return { label: 'P', className: 'piece-pawn' }
  if (objetivoTexto.includes('sacrificio') || objetivoTexto.includes('sacrificar')) return { label: 'Q', className: 'piece-queen' }
  if (objetivoTexto.includes('mate') || objetivoTexto.includes('campeon') || objetivoTexto.includes('invicto') || objetivoTexto.includes('gana')) return { label: 'K', className: 'piece-king' }
  if (objetivoTexto.includes('apertura') || objetivoTexto.includes('diagonal')) return { label: 'B', className: 'piece-bishop' }
  if (objetivoTexto.includes('remont') || objetivoTexto.includes('ataque') || objetivoTexto.includes('jaque')) return { label: 'N', className: 'piece-knight' }
  return { label: 'P', className: 'piece-pawn' }
}

function obtenerIconoTablero(gameKey, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (gameKey === 'ajedrez') {
    const pieza = obtenerPiezaAjedrezLogro(achievement)
    return { label: pieza.label, className: `chess-piece ${pieza.className}` }
  }
  if (objetivoTexto.includes('menos de') || objetivoTexto.includes('tiempo')) return { label: 'TIME', className: 'clock' }
  if (objetivoTexto.includes('errores') || objetivoTexto.includes('detecta') || objetivoTexto.includes('sin perder')) return { label: 'EYE', className: 'eye' }
  if (objetivoTexto.includes('racha') || objetivoTexto.includes('consecutiv') || objetivoTexto.includes('seguid')) return { label: 'FIRE', className: 'flame' }
  if (objetivoTexto.includes('campeon') || objetivoTexto.includes('gana') || objetivoTexto.includes('trono') || objetivoTexto.includes('top')) return { label: 'CROWN', className: 'crown' }
  if (objetivoTexto.includes('apertura') || objetivoTexto.includes('mate') || objetivoTexto.includes('sacrificio')) return { label: gameKey === 'ajedrez' ? 'MATE' : 'SEAL', className: 'spiral' }
  if (gameKey === 'damas') return { label: 'DAMA', className: 'grid' }
  return { label: gameKey === 'ajedrez' ? 'GRID' : 'TILE', className: 'grid' }
}

function renderLogroTablero(achievement, stats, gameKey) {
  const progress = obtenerProgresoTablero(achievement, stats, gameKey)
  const rarity = obtenerRarezaTablero(progress, achievement)
  const icon = obtenerIconoTablero(gameKey, achievement)
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  if (gameKey === 'ajedrez') {
    const div = document.createElement('div')
    div.className = `achievement-card chess-relic chess-${rarity} ${icon.className}${achievement.unlocked ? ' unlocked' : ' locked'}`
    div.innerHTML = `
      <div class="chess-relic-frame" aria-hidden="true">
        <div class="chess-relic-piece">
          <span>${escaparHtml(icon.label)}</span>
        </div>
      </div>
      <div class="chess-relic-content">
        <div class="chess-relic-badges">
          <span class="chess-relic-rarity">${rarityLabel}</span>
          <span class="chess-relic-state">${achievement.unlocked ? 'Coronado' : 'Sellado'}</span>
        </div>
        <strong class="chess-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
        <p class="chess-relic-description">${escaparHtml(textoPlano(achievement.description))}</p>
        <div class="chess-relic-objective">
          <span>Desbloqueo</span>
          <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
        </div>
        <div class="chess-relic-progress" aria-label="Progreso">
          <div class="chess-relic-progress-meta">
            <span>Progreso</span>
            <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
          </div>
          <div class="chess-relic-progress-track">
            <div class="chess-relic-progress-fill" style="width:${progress.percent}%"></div>
          </div>
        </div>
      </div>
    `
    return div
  }
  const gameCopy = gameKey === 'ajedrez'
    ? { stateOn: 'Coronado', stateOff: 'Sellado', objective: 'Desbloqueo', sigil: 'K Q R B N 64' }
    : gameKey === 'damas'
      ? { stateOn: 'Coronado', stateOff: 'Sellado', objective: 'Racha real', sigil: '8 12 32 DAMA' }
      : { stateOn: 'Dominado', stateOff: 'Sellado', objective: 'Rito de mesa', sigil: '0 6 12 28 TILE' }
  const div = document.createElement('div')
  div.className = `achievement-card board-relic ${gameKey}-relic ${rarity}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.setAttribute('data-sigil', gameCopy.sigil)
  div.innerHTML = `
    <div class="board-relic-header">
      <div class="board-relic-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="board-relic-badges">
        <span class="board-relic-rarity">${rarityLabel}</span>
        <span class="board-relic-state">${achievement.unlocked ? gameCopy.stateOn : gameCopy.stateOff}</span>
      </div>
    </div>
    <div class="board-relic-main">
      <strong class="board-relic-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="board-relic-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="board-objective">
        <span>${gameCopy.objective}</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="board-progress" aria-label="Progreso">
        <div class="board-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="board-progress-track">
          <div class="board-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function obtenerProgresoArcadeTematico(achievement) {
  return {
    percent: achievement.unlocked ? 100 : 0,
    label: achievement.unlocked ? 'completo' : 'pendiente',
    target: 1,
  }
}

function obtenerIconoArcadeTematico(gameKey, achievement) {
  const objetivoTexto = textoPlano(achievement.howTo).toLowerCase()
  if (objetivoTexto.includes('torneo') || objetivoTexto.includes('gana')) return { label: 'CUP', className: 'crown' }
  if (objetivoTexto.includes('punto')) return { label: 'SCORE', className: 'precision' }
  if (objetivoTexto.includes('vida') || objetivoTexto.includes('sin perder')) return { label: gameKey === 'subelamontana' ? 'ROPE' : 'LIVE', className: 'rebound' }
  if (objetivoTexto.includes('obstaculo') || objetivoTexto.includes('obst&aacute;culo') || objetivoTexto.includes('obstÃ¡culo')) return { label: 'DANGER', className: 'hazard' }
  if (objetivoTexto.includes('partida')) return { label: 'RUN', className: 'speed' }
  if (gameKey === 'torreinfinita') return { label: 'STACK', className: 'stack' }
  if (gameKey === 'subelamontana') return { label: 'PEAK', className: 'peak' }
  return { label: 'WARN', className: 'hazard' }
}

function renderLogroArcadeTematico(achievement, gameKey) {
  const rarity = gameKey === 'esquivaobstaculos'
    ? obtenerRarezaEsquivaObstaculos(achievement)
    : gameKey === 'torreinfinita'
      ? obtenerRarezaTorreInfinita(achievement)
      : obtenerRarezaSubeLaMontana(achievement)
  const progress = obtenerProgresoArcadeTematico(achievement)
  const icon = obtenerIconoArcadeTematico(gameKey, achievement)
  const rarityLabel = {
    common: 'Comun',
    rare: 'Raro',
    epic: 'Epico',
    legendary: 'Legendario',
  }[rarity]
  const gameCopy = gameKey === 'esquivaobstaculos'
    ? { stateOn: 'Sobrevivido', stateOff: 'En riesgo', objective: 'Zona roja', sigil: '!! 45 90 DANGER' }
    : gameKey === 'torreinfinita'
      ? { stateOn: 'Elevado', stateOff: 'Sin construir', objective: 'Altura', sigil: '12 24 48 STACK' }
      : { stateOn: 'Conquistado', stateOff: 'Por escalar', objective: 'Cumbre', sigil: 'N 4.8K PEAK' }
  const div = document.createElement('div')
  div.className = `achievement-card arcade-theme-relic ${gameKey}-relic ${rarity}${achievement.unlocked ? ' unlocked' : ' locked'}`
  div.setAttribute('data-sigil', gameCopy.sigil)
  div.innerHTML = `
    <div class="arcade-theme-header">
      <div class="arcade-theme-icon ${escaparHtml(icon.className)}" aria-hidden="true">
        <span>${escaparHtml(icon.label)}</span>
      </div>
      <div class="arcade-theme-badges">
        <span class="arcade-theme-rarity">${rarityLabel}</span>
        <span class="arcade-theme-state">${achievement.unlocked ? gameCopy.stateOn : gameCopy.stateOff}</span>
      </div>
    </div>
    <div class="arcade-theme-main">
      <strong class="arcade-theme-title">${escaparHtml(textoPlano(achievement.title))}</strong>
      <p class="arcade-theme-prophecy">${escaparHtml(textoPlano(achievement.description))}</p>
      <div class="arcade-theme-objective">
        <span>${gameCopy.objective}</span>
        <small>${escaparHtml(textoPlano(achievement.howTo || ''))}</small>
      </div>
      <div class="arcade-theme-progress" aria-label="Progreso">
        <div class="arcade-theme-progress-meta">
          <span>Progreso</span>
          <span>${progress.percent}% - ${escaparHtml(progress.label)}</span>
        </div>
        <div class="arcade-theme-progress-track">
          <div class="arcade-theme-progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
    </div>
  `
  return div
}

function reproducirSonidoSudoku() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(96, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.42)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.48)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch (error) {
    // El navegador puede bloquear audio sin interaccion previa.
  }
}

function mostrarPopupSudoku(achievement) {
  const popup = document.createElement('div')
  popup.className = 'sudoku-unlock-popup'
  popup.innerHTML = `
    <div class="sudoku-unlock-panel">
      <span>Logro desbloqueado</span>
      <strong>${escaparHtml(textoPlano(achievement.title))}</strong>
      <p>"${escaparHtml(textoPlano(achievement.description))}"</p>
    </div>
  `
  document.body.classList.add('sudoku-screen-shake')
  document.body.appendChild(popup)
  reproducirSonidoSudoku()
  setTimeout(() => document.body.classList.remove('sudoku-screen-shake'), 380)
  setTimeout(() => popup.remove(), 3000)
}

function reproducirSonidoAjedrez() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const gain = ctx.createGain()
    const bell = ctx.createOscillator()
    const low = ctx.createOscillator()
    bell.type = 'triangle'
    low.type = 'sine'
    bell.frequency.setValueAtTime(520, ctx.currentTime)
    bell.frequency.exponentialRampToValueAtTime(390, ctx.currentTime + 0.34)
    low.frequency.setValueAtTime(132, ctx.currentTime)
    low.frequency.exponentialRampToValueAtTime(88, ctx.currentTime + 0.52)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.68)
    bell.connect(gain)
    low.connect(gain)
    gain.connect(ctx.destination)
    bell.start()
    low.start()
    bell.stop(ctx.currentTime + 0.48)
    low.stop(ctx.currentTime + 0.72)
  } catch (error) {
    // El navegador puede bloquear audio sin interaccion previa.
  }
}

function mostrarPopupAjedrez(achievement) {
  const pieza = obtenerPiezaAjedrezLogro(achievement)
  const popup = document.createElement('div')
  popup.className = `chess-unlock-popup ${escaparHtml(pieza.className)}`
  popup.innerHTML = `
    <div class="chess-unlock-panel">
      <div class="chess-unlock-shield" aria-hidden="true">
        <span>${escaparHtml(pieza.label)}</span>
      </div>
      <span class="chess-unlock-kicker">Logro de Ajedrez desbloqueado</span>
      <strong>${escaparHtml(textoPlano(achievement.title))}</strong>
      <p>"${escaparHtml(textoPlano(achievement.description))}"</p>
    </div>
  `
  document.body.appendChild(popup)
  reproducirSonidoAjedrez()
  setTimeout(() => popup.remove(), 3600)
}

function notificarNuevosLogrosSudoku(logros) {
  if (!usuario) return
  const key = `sudoku_logros_vistos_${usuario}`
  const desbloqueados = logros.filter((achievement) => achievement.unlocked).map((achievement) => achievement.title)
  const previo = JSON.parse(localStorage.getItem(key) || 'null')
  localStorage.setItem(key, JSON.stringify(desbloqueados))
  if (!Array.isArray(previo)) return
  const nuevo = logros.find((achievement) => achievement.unlocked && !previo.includes(achievement.title))
  if (nuevo) mostrarPopupSudoku(nuevo)
}

function notificarNuevosLogrosAjedrez(logros) {
  if (!usuario) return
  const key = `ajedrez_logros_vistos_${usuario}`
  const desbloqueados = logros.filter((achievement) => achievement.unlocked).map((achievement) => achievement.title)
  const previo = JSON.parse(localStorage.getItem(key) || 'null')
  localStorage.setItem(key, JSON.stringify(desbloqueados))
  if (!Array.isArray(previo)) return
  const nuevo = logros.find((achievement) => achievement.unlocked && !previo.includes(achievement.title))
  if (nuevo) mostrarPopupAjedrez(nuevo)
}

function renderLogros() {
  logrosListEl.innerHTML = ''

  const game = GAMES.find((item) => item.key === juegoLogrosActivo) || GAMES[0]
  const resultado = resultadosPerfil.find((item) => item.juego === game.key)
  const logros = crearLogrosDeJuego(game, resultado)
  const desbloqueados = logros.filter((achievement) => achievement.unlocked).length

  logrosTituloJuegoEl.innerText = game.label
  logrosContadorEl.innerText = `${desbloqueados}/${logros.length}`
  logrosListEl.classList.toggle('sudoku-relics', game.key === 'sudoku')
  logrosListEl.classList.toggle('memory-relics', game.key === 'memoria')
  logrosListEl.classList.toggle('math-relics', game.key === 'matematicas')
  logrosListEl.classList.toggle('arcane-relics', game.key === 'flashmind' || game.key === 'numcatch' || game.key === 'cricketarcade')
  logrosListEl.classList.toggle('board-relics', game.key === 'ajedrez' || game.key === 'domino' || game.key === 'damas')
  logrosListEl.classList.toggle('arcade-theme-relics', game.key === 'esquivaobstaculos' || game.key === 'torreinfinita' || game.key === 'subelamontana')

  logros.forEach((achievement) => {
    if (game.key === 'sudoku') {
      logrosListEl.appendChild(renderLogroSudoku(achievement, estadisticasLogros.sudoku || {}))
      return
    }

    if (game.key === 'memoria') {
      logrosListEl.appendChild(renderLogroMemoria(achievement, estadisticasLogros.memoria || {}))
      return
    }

    if (game.key === 'matematicas') {
      logrosListEl.appendChild(renderLogroMatematicas(achievement, estadisticasLogros.matematicas || {}))
      return
    }

    if (game.key === 'flashmind' || game.key === 'numcatch') {
      logrosListEl.appendChild(renderLogroArcano(achievement, estadisticasLogros[game.key] || {}, game.key))
      return
    }

    if (game.key === 'cricketarcade') {
      logrosListEl.appendChild(renderLogroCricket(achievement, estadisticasLogros.cricketarcade || {}, resultado))
      return
    }

    if (game.key === 'ajedrez' || game.key === 'domino' || game.key === 'damas') {
      logrosListEl.appendChild(renderLogroTablero(achievement, estadisticasLogros[game.key] || {}, game.key))
      return
    }

    if (game.key === 'esquivaobstaculos' || game.key === 'torreinfinita' || game.key === 'subelamontana') {
      logrosListEl.appendChild(renderLogroArcadeTematico(achievement, game.key))
      return
    }

    const div = document.createElement('div')
    div.className = `achievement-card${achievement.unlocked ? '' : ' locked'}`
    div.innerHTML = `
      <span class="achievement-state ${achievement.unlocked ? 'unlocked' : 'locked'}">${achievement.unlocked ? 'Desbloqueado' : 'Bloqueado'}</span>
      <br>
      <strong>${achievement.title}</strong>
      <p>${achievement.description}</p>
      <small>${achievement.howTo || ''}</small>
    `
    logrosListEl.appendChild(div)
  })

  if (game.key === 'sudoku') notificarNuevosLogrosSudoku(logros)
  if (game.key === 'ajedrez') notificarNuevosLogrosAjedrez(logros)
}

async function sincronizarXpDeLogros() {
  if (!usuario) return

  for (const game of GAMES) {
    const resultado = resultadosPerfil.find((item) => item.juego === game.key)
    const logros = crearLogrosDeJuego(game, resultado).map((achievement) => ({
      ...achievement,
      rareza: obtenerRarezaLogro(game.key, achievement),
    }))
    await registrarXpPorLogros(usuario, logros, game.key)
  }
}

function obtenerRarezaLogro(gameKey, achievement) {
  const stats = estadisticasLogros[gameKey] || {}
  if (gameKey === 'sudoku') return obtenerRarezaSudoku(obtenerProgresoSudoku(achievement, stats), achievement)
  if (gameKey === 'memoria') return obtenerRarezaMemoria(obtenerProgresoMemoria(achievement, stats), achievement)
  if (gameKey === 'matematicas') return obtenerRarezaMatematicas(obtenerProgresoMatematicas(achievement, stats), achievement)
  if (gameKey === 'flashmind') return obtenerRarezaArcana(obtenerProgresoFlashmind(achievement, stats), achievement)
  if (gameKey === 'numcatch') return obtenerRarezaArcana(obtenerProgresoNumcatch(achievement, stats), achievement)
  if (gameKey === 'cricketarcade') return obtenerRarezaCricket(achievement)
  if (gameKey === 'esquivaobstaculos') return obtenerRarezaEsquivaObstaculos(achievement)
  if (gameKey === 'torreinfinita') return obtenerRarezaTorreInfinita(achievement)
  if (gameKey === 'subelamontana') return obtenerRarezaSubeLaMontana(achievement)
  if (gameKey === 'ajedrez' || gameKey === 'domino' || gameKey === 'damas') return obtenerRarezaTablero(obtenerProgresoTablero(achievement, stats, gameKey), achievement)
  return 'common'
}

async function renderProgresoNivel() {
  if (!usuario) {
    fondoEquipadoActual = null
    nivelActualEl.innerText = '1'
    xpActualEl.innerText = '0 XP del nivel'
    porcentajeNivelEl.innerText = '0%'
    barraNivelEl.style.width = '0%'
    xpNivelDetalleEl.innerText = '0 / 100 XP'
    xpRestanteEl.innerText = 'Faltan 100 XP'
    renderPill(pillNivelEl, 'Nivel', '1')
    actualizarBonusRangoPerfil()
    if (perfilTituloRangoEl) perfilTituloRangoEl.innerText = 'Sin rango'
    aplicarVisualRangoActual('Novato')
    recompensaSiguienteEl.innerText = 'Inicia sesion para ver recompensas.'
    renderRutaRangos({ nivel: 1 })
    rankingNivelListEl.innerHTML = '<div class="empty">No hay ranking de nivel disponible.</div>'
    return
  }

  const progreso = await obtenerProgresoNivel(usuario)
  progresoNivelActual = progreso
  recompensasCosmeticasRuta = await cargarRecompensasCosmeticasRuta(usuario, progreso.nivel)
  fondoEquipadoActual = await obtenerCosmeticoEquipado(usuario, 'fondo')
  const tituloNivel = obtenerTituloNivel(progreso.nivel)
  const rangoActual = obtenerRangoNivel(progreso.nivel)
  const rangosTodos = obtenerRangosDesdeNivel(1)
  await sincronizarRangoEquipadoBonus(usuario, rangosTodos)
  const rangosDesbloqueados = obtenerRangosHastaNivel(progreso.nivel)
  const rangoGuardado = leerRangoEquipado(usuario)
  const rangoGuardadoDesbloqueado = rangosDesbloqueados.some((rango) => normalizarTextoVisual(rango.titulo) === normalizarTextoVisual(rangoGuardado))
  const tituloEquipado = rangoGuardadoDesbloqueado ? rangoGuardado : 'Novato'
  const siguienteNivel = Math.min(NIVEL_MAXIMO, progreso.nivel + 1)
  const siguienteRango = obtenerRangosDesdeNivel(progreso.nivel + 1).find((rango) => rango.desde > progreso.nivel)
  const progresoSiguienteRango = siguienteRango ? calcularProgresoHaciaRango(progreso, siguienteRango) : null
  const recompensa = progreso.nivel >= NIVEL_MAXIMO
    ? null
    : await obtenerRecompensaNivel(siguienteNivel)

  nivelActualEl.innerText = String(progreso.nivel)
  xpActualEl.innerText = `${progreso.xp} XP del nivel`
  porcentajeNivelEl.innerText = `${progreso.porcentaje}%`
  barraNivelEl.style.width = `${progreso.porcentaje}%`
  renderPill(pillNivelEl, 'Nivel / rango', `${progreso.nivel} - ${tituloNivel}`)
  aplicarRangoEquipado(tituloEquipado)
  const rangoEquipado = rangosTodos.find((rango) => normalizarTextoVisual(rango.titulo) === normalizarTextoVisual(tituloEquipado)) || rangosTodos[0]
  guardarRangoEquipado(usuario, crearRangoGuardable(rangoEquipado, rangosTodos))
  actualizarBonusRangoPerfil(rangoEquipado, rangosTodos)
  renderRutaRangos(progreso)

  if (progreso.nivel >= NIVEL_MAXIMO) {
    xpNivelDetalleEl.innerText = 'Nivel maximo alcanzado'
    xpRestanteEl.innerText = 'Temporada completada'
    recompensaSiguienteEl.innerText = 'Ya desbloqueaste todas las recompensas.'
    if (proximoRangoNombreEl) proximoRangoNombreEl.innerText = 'Rango maximo'
    if (proximoRangoXpEl) proximoRangoXpEl.innerText = 'XP necesaria: completado'
    if (proximoRangoFaltanteEl) proximoRangoFaltanteEl.innerText = 'Te faltan: 0 XP'
  } else {
    xpNivelDetalleEl.innerText = `${progreso.xpEnNivel} / ${progreso.xpSiguiente} XP`
    xpRestanteEl.innerText = `Faltan ${progreso.xpParaSiguiente} XP`
    if (proximoRangoNombreEl) proximoRangoNombreEl.innerText = siguienteRango?.titulo || rangoActual.titulo
    if (proximoRangoXpEl) proximoRangoXpEl.innerText = `XP del tramo: ${formatearNumero(progresoSiguienteRango?.requerido || progreso.xpSiguiente)} XP`
    if (proximoRangoFaltanteEl) proximoRangoFaltanteEl.innerText = `Te faltan: ${formatearNumero(progresoSiguienteRango?.faltante || progreso.xpParaSiguiente)} XP`
    const detalleDesbloqueo = siguienteRango?.desde === siguienteNivel ? ` | Desbloquea rango: ${siguienteRango.titulo}` : ''
    recompensaSiguienteEl.innerText = recompensa
      ? `Nivel ${recompensa.nivel}: ${formatearTipoRecompensa(recompensa.tipo)} - ${recompensa.valor}${detalleDesbloqueo}`
      : `Nivel ${siguienteNivel}: recompensa de progreso${detalleDesbloqueo}`
  }

  await renderRankingNivel()
}

async function renderRankingNivel() {
  const ranking = await obtenerRankingNivel(10)

  if (!ranking.length) {
    rankingNivelListEl.innerHTML = '<div class="empty">Todavia no hay jugadores con XP de nivel.</div>'
    return
  }

  rankingNivelListEl.innerHTML = ''
  ranking.forEach((item, index) => {
    const tituloNivel = obtenerTituloNivel(item.nivel)
    const visual = obtenerVisualRango(item.usuario_id === usuario ? rangoEquipadoActual : tituloNivel)
    const div = document.createElement('div')
    div.className = `level-row${item.usuario_id === usuario ? ' current' : ''}`
    div.dataset.rankTier = visual.tier
    div.dataset.rankMotif = visual.motif || 'core'
    div.setAttribute('style', estiloVisualRango(visual))
    div.innerHTML = `
      <div class="level-rank-pos">#${index + 1}</div>
      <div class="level-rank-user">
        <strong>${escaparHtml(item.usuario_id)}</strong>
        <br>
        <small>${escaparHtml(item.usuario_id === usuario ? rangoEquipadoActual : tituloNivel)} - ${item.xp} XP del nivel</small>
      </div>
      <div class="level-rank-score">Nivel ${item.nivel}</div>
    `
    rankingNivelListEl.appendChild(div)
    aplicarPersonalizacionUsuario(div, item.usuario_id)
  })
}

function formatearTipoRecompensa(tipo) {
  const labels = {
    titulo: 'Titulo',
    medalla: 'Medalla',
    estilo: 'Estilo',
    logro: 'Logro',
    xp_bonus: 'Bonus',
  }

  return labels[tipo] || tipo
}

function normalizarMensajeChat(valor) {
  return String(valor || '').replace(/\s+/g, ' ').trim().slice(0, 280)
}

function horaChat(valor) {
  const fecha = valor ? new Date(valor) : new Date()
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function inicialesChat(nombre) {
  return String(nombre || 'J')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'J'
}

function obtenerLecturasChat() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_LECTURAS_KEY) || '{}') || {}
  } catch {
    return {}
  }
}

function guardarLecturasChat(lecturas) {
  localStorage.setItem(CHAT_LECTURAS_KEY, JSON.stringify(lecturas || {}))
}

function obtenerOcultosChat() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_OCULTOS_KEY) || '{}') || {}
  } catch {
    return {}
  }
}

function guardarOcultosChat(ocultos) {
  localStorage.setItem(CHAT_OCULTOS_KEY, JSON.stringify(ocultos || {}))
}

function ocultarConversacionLocal(destino) {
  if (!destino) return
  const ocultos = obtenerOcultosChat()
  ocultos[destino] = new Date().toISOString()
  guardarOcultosChat(ocultos)
}

function filtrarMensajesOcultos(mensajes, destino) {
  if (!destino) return mensajes
  const ocultoDesde = obtenerOcultosChat()[destino]
  if (!ocultoDesde) return mensajes
  return mensajes.filter((mensaje) => new Date(mensaje.created_at || 0) > new Date(ocultoDesde))
}

function marcarConversacionLeida(destino) {
  if (!destino) return
  const lecturas = obtenerLecturasChat()
  lecturas[destino] = new Date().toISOString()
  guardarLecturasChat(lecturas)
}

function otroParticipanteChat(mensaje) {
  if (!mensaje) return ''
  return mensaje.remitente === usuario ? mensaje.destinatario : mensaje.remitente
}

function usuarioMensajeChat(mensaje) {
  return mensaje.usuario || mensaje.usuario_id || mensaje.remitente || 'Jugador'
}

function confirmarAccionChat({ titulo = 'Confirmar accion', mensaje = 'Seguro que deseas continuar?', textoAceptar = 'Aceptar' } = {}) {
  if (!chatConfirmOverlayEl || !chatConfirmCancelEl || !chatConfirmAcceptEl) {
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    let resuelto = false
    const cerrar = (aceptado) => {
      if (resuelto) return
      resuelto = true
      chatConfirmOverlayEl.classList.remove('open')
      chatConfirmOverlayEl.setAttribute('aria-hidden', 'true')
      chatConfirmAcceptEl.textContent = 'Aceptar'
      chatConfirmCancelEl.removeEventListener('click', cancelar)
      chatConfirmAcceptEl.removeEventListener('click', aceptar)
      chatConfirmOverlayEl.removeEventListener('click', clickFondo)
      document.removeEventListener('keydown', tecla)
      resolve(aceptado)
    }
    const cancelar = () => cerrar(false)
    const aceptar = () => cerrar(true)
    const clickFondo = (event) => {
      if (event.target === chatConfirmOverlayEl) cerrar(false)
    }
    const tecla = (event) => {
      if (event.key === 'Escape') cerrar(false)
      if (event.key === 'Enter') cerrar(true)
    }

    if (chatConfirmTitleEl) chatConfirmTitleEl.textContent = titulo
    if (chatConfirmMessageEl) chatConfirmMessageEl.textContent = mensaje
    chatConfirmAcceptEl.textContent = textoAceptar
    chatConfirmOverlayEl.classList.add('open')
    chatConfirmOverlayEl.setAttribute('aria-hidden', 'false')
    chatConfirmCancelEl.addEventListener('click', cancelar)
    chatConfirmAcceptEl.addEventListener('click', aceptar)
    chatConfirmOverlayEl.addEventListener('click', clickFondo)
    document.addEventListener('keydown', tecla)
    setTimeout(() => chatConfirmCancelEl.focus(), 0)
  })
}

function crearPayloadChat(texto, extra = {}) {
  const nivel = progresoNivelActual?.nivel || 1
  return {
    usuario_id: usuario,
    usuario,
    mensaje: texto,
    nivel,
    rango: rangoEquipadoActual || obtenerTituloNivel(nivel),
    created_at: new Date().toISOString(),
    ...extra,
  }
}

function renderMensajesChat(contenedor, mensajes, privado = false) {
  if (!contenedor) return
  contenedor.innerHTML = ''

  if (!mensajes.length) {
    contenedor.innerHTML = `<div class="empty">${privado ? 'Abre una conversacion para empezar.' : 'Todavia no hay mensajes.'}</div>`
    return
  }

  mensajes.forEach((mensaje) => {
    const titulo = mensaje.rango || obtenerTituloNivel(mensaje.nivel || 1)
    const visual = obtenerVisualRango(titulo)
    const autor = usuarioMensajeChat(mensaje)
    const esPropio = mensaje.usuario === usuario || mensaje.usuario_id === usuario || mensaje.remitente === usuario
    const div = document.createElement('div')
    div.className = `chat-message${esPropio ? ' own' : ''}`
    div.dataset.rankTier = visual.tier
    div.setAttribute('style', estiloVisualRango(visual))
    div.innerHTML = `
      <div class="chat-avatar" aria-hidden="true">${escaparHtml(inicialesChat(autor))}</div>
      <div class="chat-message-body">
      <div class="chat-message-head">
        <strong>${escaparHtml(autor)}</strong>
        ${privado && esPropio && mensaje.id ? `<button class="chat-message-delete" type="button" data-chat-delete-message="${escaparHtml(String(mensaje.id))}">Borrar</button>` : ''}
        <span>Nivel ${escaparHtml(mensaje.nivel || 1)} · ${escaparHtml(titulo)} · ${horaChat(mensaje.created_at)}</span>
      </div>
      <p>${escaparHtml(mensaje.mensaje || '')}</p>
      </div>
    `
    contenedor.appendChild(div)
    aplicarPersonalizacionUsuario(div, autor)
  })

  contenedor.scrollTop = contenedor.scrollHeight
}

function renderConversacionesChat(mensajes) {
  if (!chatConversationListEl) return
  chatConversationListEl.innerHTML = ''

  const lecturas = obtenerLecturasChat()
  const ocultos = obtenerOcultosChat()
  const conversaciones = new Map()

  mensajes.forEach((mensaje) => {
    const destino = otroParticipanteChat(mensaje)
    if (!destino) return
    if (ocultos[destino] && new Date(mensaje.created_at || 0) <= new Date(ocultos[destino])) return
    const actual = conversaciones.get(destino) || { destino, ultimo: null, unread: 0 }
    if (!actual.ultimo || new Date(mensaje.created_at) > new Date(actual.ultimo.created_at)) {
      actual.ultimo = mensaje
    }
    const noLeido = mensaje.destinatario === usuario
      && mensaje.remitente === destino
      && (!lecturas[destino] || new Date(mensaje.created_at) > new Date(lecturas[destino]))
    if (noLeido) actual.unread += 1
    conversaciones.set(destino, actual)
  })

  const items = [...conversaciones.values()]
    .sort((a, b) => new Date(b.ultimo?.created_at || 0) - new Date(a.ultimo?.created_at || 0))

  if (!items.length) {
    chatConversationListEl.innerHTML = '<div class="empty">Todavia no hay conversaciones.</div>'
    return
  }

  items.forEach((item) => {
    const ultimo = item.ultimo || {}
    const titulo = ultimo.rango || obtenerTituloNivel(ultimo.nivel || 1)
    const visual = obtenerVisualRango(titulo)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `chat-conversation${item.destino === chatPrivadoDestino ? ' active' : ''}`
    button.dataset.chatUser = item.destino
    button.dataset.rankTier = visual.tier
    button.setAttribute('style', estiloVisualRango(visual))
    button.innerHTML = `
      <span class="chat-conversation-avatar">${escaparHtml(inicialesChat(item.destino))}</span>
      <span class="chat-conversation-main">
        <span class="chat-conversation-title">${escaparHtml(item.destino)}</span>
        <span class="chat-conversation-preview">Nivel ${escaparHtml(ultimo.nivel || 1)} - ${escaparHtml(titulo)} - ${escaparHtml(ultimo.mensaje || '')}</span>
      </span>
      <span class="chat-conversation-meta">
        <span>${horaChat(ultimo.created_at)}</span>
        ${item.unread ? `<span class="chat-unread">${item.unread > 9 ? '9+' : item.unread}</span>` : ''}
      </span>
    `
    chatConversationListEl.appendChild(button)
    aplicarPersonalizacionUsuario(button, item.destino)
  })
}

async function cargarChatGlobal() {
  if (!chatGlobalListEl || !usuario) return
  const { data, error } = await supabase
    .from(CHAT_GLOBAL_TABLA)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(CHAT_LIMITE)

  if (error) {
    chatGlobalStatusEl.innerText = 'Chat global pendiente de configurar en Supabase.'
    chatGlobalListEl.innerHTML = '<div class="empty">Ejecuta el SQL social para activar mensajes en tiempo real.</div>'
    return
  }

  chatGlobalStatusEl.innerText = 'Chat global activo.'
  renderMensajesChat(chatGlobalListEl, (data || []).reverse())
}

async function enviarChatGlobal(event) {
  event.preventDefault()
  const mensaje = normalizarMensajeChat(chatGlobalInputEl?.value)
  if (!mensaje || !usuario) return
  chatGlobalInputEl.value = ''

  const { error } = await supabase.from(CHAT_GLOBAL_TABLA).insert(crearPayloadChat(mensaje))
  if (error) {
    chatGlobalStatusEl.innerText = 'No se pudo enviar. Falta configurar la tabla de chat global.'
    return
  }
  await cargarChatGlobal()
}

async function cargarConversacionesPrivadas() {
  if (!chatConversationListEl || !usuario) return

  const [enviados, recibidos] = await Promise.all([
    supabase
      .from(CHAT_PRIVADO_TABLA)
      .select('*')
      .eq('remitente', usuario)
      .order('created_at', { ascending: false })
      .limit(90),
    supabase
      .from(CHAT_PRIVADO_TABLA)
      .select('*')
      .eq('destinatario', usuario)
      .order('created_at', { ascending: false })
      .limit(90),
  ])

  if (enviados.error || recibidos.error) {
    chatConversationListEl.innerHTML = '<div class="empty">Ejecuta el SQL social para activar conversaciones.</div>'
    return
  }

  renderConversacionesChat([...(enviados.data || []), ...(recibidos.data || [])])
}

async function cargarChatPrivado(destino = chatPrivadoDestino) {
  if (!chatPrivateListEl || !usuario || !destino) return
  chatPrivadoDestino = destino
  if (chatPrivateTargetEl) chatPrivateTargetEl.innerText = `Conversacion con ${destino}`
  marcarConversacionLeida(destino)

  const [enviados, recibidos] = await Promise.all([
    supabase
      .from(CHAT_PRIVADO_TABLA)
      .select('*')
      .eq('remitente', usuario)
      .eq('destinatario', destino)
      .order('created_at', { ascending: false })
      .limit(CHAT_LIMITE),
    supabase
      .from(CHAT_PRIVADO_TABLA)
      .select('*')
      .eq('remitente', destino)
      .eq('destinatario', usuario)
      .order('created_at', { ascending: false })
      .limit(CHAT_LIMITE),
  ])

  if (enviados.error || recibidos.error) {
    chatPrivateStatusEl.innerText = 'Mensajes privados pendientes de configurar en Supabase.'
    chatPrivateListEl.innerHTML = '<div class="empty">Ejecuta el SQL social para activar privados.</div>'
    return
  }

  const data = [...(enviados.data || []), ...(recibidos.data || [])]
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    .slice(-CHAT_LIMITE)
  const visibles = filtrarMensajesOcultos(data, destino)

  chatPrivateStatusEl.innerText = 'Conversacion activa.'
  renderMensajesChat(chatPrivateListEl, visibles, true)
  await cargarConversacionesPrivadas()
}

async function abrirChatPrivado() {
  const destino = String(chatPrivateSearchEl?.value || '').trim()
  if (!destino || destino === usuario) return
  await cargarChatPrivado(destino)
  if (chatPrivateSearchEl) chatPrivateSearchEl.value = ''
}

async function enviarChatPrivado(event) {
  event.preventDefault()
  const mensaje = normalizarMensajeChat(chatPrivateInputEl?.value)
  if (!mensaje || !usuario || !chatPrivadoDestino) return
  chatPrivateInputEl.value = ''

  const payload = crearPayloadChat(mensaje, {
    remitente: usuario,
    destinatario: chatPrivadoDestino,
  })
  const { error } = await supabase.from(CHAT_PRIVADO_TABLA).insert(payload)
  if (error) {
    chatPrivateStatusEl.innerText = 'No se pudo enviar. Falta configurar la tabla de privados.'
    return
  }
  await cargarChatPrivado()
  await cargarConversacionesPrivadas()
}

async function limpiarVistaChatPrivado() {
  if (!chatPrivadoDestino) {
    chatPrivateStatusEl.innerText = 'Abre una conversacion para limpiar la vista.'
    return
  }
  const confirmado = await confirmarAccionChat({
    titulo: 'Limpiar historial visual',
    mensaje: 'Seguro que deseas limpiar esta conversacion solo en este dispositivo?',
  })
  if (!confirmado) return
  ocultarConversacionLocal(chatPrivadoDestino)
  chatPrivateListEl.innerHTML = '<div class="empty">Historial visual limpio en este dispositivo.</div>'
  chatPrivateStatusEl.innerText = 'Vista local limpia. Los mensajes nuevos volveran a aparecer.'
  await cargarConversacionesPrivadas()
}

async function borrarMensajesPropiosChatPrivado() {
  if (!chatPrivadoDestino) {
    chatPrivateStatusEl.innerText = 'Abre una conversacion para borrar mensajes propios.'
    return
  }
  const confirmado = await confirmarAccionChat({
    titulo: 'Borrar mensajes propios',
    mensaje: 'Seguro que deseas borrar tus mensajes enviados en esta conversacion?',
  })
  if (!confirmado) return

  const { error } = await supabase
    .from(CHAT_PRIVADO_TABLA)
    .delete()
    .eq('remitente', usuario)
    .eq('destinatario', chatPrivadoDestino)

  if (error) {
    chatPrivateStatusEl.innerText = 'Supabase no permitio borrar mensajes propios. Puedes usar Limpiar vista.'
    return
  }

  chatPrivateStatusEl.innerText = 'Mensajes propios borrados.'
  await cargarChatPrivado()
}

async function borrarMensajePrivado(id) {
  if (!id || !chatPrivadoDestino) return
  const confirmado = await confirmarAccionChat({
    titulo: 'Borrar mensaje',
    mensaje: 'Seguro que deseas borrar este mensaje?',
  })
  if (!confirmado) return

  const { error } = await supabase
    .from(CHAT_PRIVADO_TABLA)
    .delete()
    .eq('id', id)
    .eq('remitente', usuario)

  if (error) {
    chatPrivateStatusEl.innerText = 'No se pudo borrar este mensaje.'
    return
  }

  chatPrivateStatusEl.innerText = 'Mensaje borrado.'
  await cargarChatPrivado()
}

async function borrarConversacionChatPrivado() {
  if (!chatPrivadoDestino) {
    chatPrivateStatusEl.innerText = 'Abre una conversacion para borrar.'
    return
  }
  const confirmado = await confirmarAccionChat({
    titulo: 'Borrar conversacion',
    mensaje: `Seguro que deseas borrar la conversacion con ${chatPrivadoDestino}?`,
  })
  if (!confirmado) return

  const [propios, recibidos] = await Promise.all([
    supabase
      .from(CHAT_PRIVADO_TABLA)
      .delete()
      .eq('remitente', usuario)
      .eq('destinatario', chatPrivadoDestino),
    supabase
      .from(CHAT_PRIVADO_TABLA)
      .delete()
      .eq('remitente', chatPrivadoDestino)
      .eq('destinatario', usuario),
  ])

  if (propios.error || recibidos.error) {
    ocultarConversacionLocal(chatPrivadoDestino)
    chatPrivateListEl.innerHTML = '<div class="empty">Conversacion oculta en este dispositivo.</div>'
    chatPrivateStatusEl.innerText = 'No hubo permiso para borrar todo en Supabase; se limpio la vista local.'
    await cargarConversacionesPrivadas()
    return
  }

  chatPrivateListEl.innerHTML = '<div class="empty">Conversacion borrada.</div>'
  chatPrivateStatusEl.innerText = 'Conversacion borrada.'
  chatPrivadoDestino = ''
  if (chatPrivateTargetEl) chatPrivateTargetEl.innerText = 'Sin conversacion abierta'
  await cargarConversacionesPrivadas()
}

function instalarChatSocial() {
  if (!usuario) return
  chatGlobalFormEl?.addEventListener('submit', enviarChatGlobal)
  chatPrivateOpenEl?.addEventListener('click', abrirChatPrivado)
  chatPrivateSearchEl?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    abrirChatPrivado()
  })
  chatConversationListEl?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-chat-user]')
    if (!button) return
    cargarChatPrivado(button.dataset.chatUser)
  })
  chatPrivateListEl?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-chat-delete-message]')
    if (!button) return
    borrarMensajePrivado(button.dataset.chatDeleteMessage)
  })
  chatPrivateFormEl?.addEventListener('submit', enviarChatPrivado)
  chatPrivateClearViewEl?.addEventListener('click', limpiarVistaChatPrivado)
  chatPrivateDeleteOwnEl?.addEventListener('click', borrarMensajesPropiosChatPrivado)
  chatPrivateDeleteConversationEl?.addEventListener('click', borrarConversacionChatPrivado)

  cargarChatGlobal()
  cargarConversacionesPrivadas()

  chatGlobalCanal = supabase
    .channel('perfil-chat-global')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: CHAT_GLOBAL_TABLA }, cargarChatGlobal)
    .subscribe()

  chatPrivadoCanal = supabase
    .channel(`perfil-chat-privado-${usuario}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: CHAT_PRIVADO_TABLA }, (payload) => {
      const row = payload.new || {}
      const pertenece = row.remitente === usuario || row.destinatario === usuario
      if (!pertenece) return
      if (chatPrivadoDestino && (row.remitente === chatPrivadoDestino || row.destinatario === chatPrivadoDestino)) {
        cargarChatPrivado()
      } else if (chatPrivateStatusEl) {
        chatPrivateStatusEl.innerText = `Mensaje nuevo de ${row.remitente || 'un jugador'}`
      }
      cargarConversacionesPrivadas()
    })
    .subscribe()
}

function renderHistorial(resultados) {
  historialListEl.innerHTML = ''

  if (resultados.length === 0) {
    historialListEl.innerHTML = '<div class="empty">Todavia no hay historial de juegos para este usuario.</div>'
    return
  }

  resultados.forEach((result) => {
    const estado = getEstado(result)
    const div = document.createElement('div')
    div.className = 'history-item'
    div.innerHTML = `
      <div>
        <strong>${escaparHtml(result.juegoLabel)}</strong>
        <br>
        <small>Posicion #${result.posicion} de ${result.total} | Tiempo: ${formatearTiempo(result.tiempo)}</small>
        <br>
        <small>${escaparHtml(result.motivo || 'Sin observaciones.')}</small>
      </div>
      <div class="history-state ${estado.className}">${estado.label}</div>
    `
    historialListEl.appendChild(div)
  })
}

window.recargarPerfil = cargarPerfil
window.seleccionarJuegoLogros = seleccionarJuegoLogros
window.volverMenu = function () {
  window.location.href = 'index.html'
}
window.cerrarSesion = async function () {
  const confirmar = await confirmarAccionChat({
    titulo: 'Cerrar sesion',
    mensaje: 'Quieres cerrar sesion en este navegador?',
  })
  if (!confirmar) return

  localStorage.removeItem('usuario')
  window.location.href = 'index.html'
}

cargarPerfil()
instalarChatSocial()

if (usuario) {
  iniciarSincronizacionRecompensasUsuario(usuario, async (evento) => {
    renderPanelMonedas()
    if (evento?.tipo === 'cosmetico') {
      fondoEquipadoActual = await obtenerCosmeticoEquipado(usuario, 'fondo')
      await aplicarPersonalizacionPerfil()
      if (progresoNivelActual) renderRutaRangos(progresoNivelActual)
    }
  })
}

supabase
  .channel('perfil-progreso-nivel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'progreso_nivel' }, () => {
    renderProgresoNivel()
  })
  .subscribe()
