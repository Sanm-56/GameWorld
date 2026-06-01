import { supabase } from "./supabase.js"
import { aplicarBonusMonedas, obtenerBonusRangoActivo } from "./rango-bonus.js"
import { obtenerBonusMonedasEvento } from "./bonus-monedas-evento.js"

export const BOOSTERS_XP = [
  { id: "xp15_6h", nombre: "Booster XP x1.5", multiplicador: 1.5, duracionMs: 6 * 60 * 60 * 1000, precio: 2000, precioReal: "$0.49", rareza: "Inicial", etiqueta: "Oferta" },
  { id: "xp2_24h", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 24 * 60 * 60 * 1000, precio: 6000, precioReal: "$1.99", rareza: "Competitivo", etiqueta: "Popular" },
  { id: "xp2_3d", nombre: "Booster XP x2", multiplicador: 2, duracionMs: 3 * 24 * 60 * 60 * 1000, precio: 14000, precioReal: "$3.99", rareza: "Competitivo", etiqueta: "Recomendado" },
  { id: "xp25_7d", nombre: "Booster XP x2.5", multiplicador: 2.5, duracionMs: 7 * 24 * 60 * 60 * 1000, precio: 27500, precioReal: "$6.99", rareza: "Elite", etiqueta: "Mejor valor" },
  { id: "xp3_7d", nombre: "Booster XP x3", multiplicador: 3, duracionMs: 7 * 24 * 60 * 60 * 1000, precio: 40000, precioReal: "$9.99", rareza: "Elite", etiqueta: "Popular" },
  { id: "xp3_15d", nombre: "Booster XP x3", multiplicador: 3, duracionMs: 15 * 24 * 60 * 60 * 1000, precio: 70000, precioReal: "$14.99", rareza: "Epico", etiqueta: "Recomendado" },
  { id: "xp4_30d", nombre: "Booster XP x4", multiplicador: 4, duracionMs: 30 * 24 * 60 * 60 * 1000, precio: 110000, precioReal: "$19.99", rareza: "Legendario", etiqueta: "Mejor valor" },
  { id: "xp5_30d", nombre: "Booster XP x5", multiplicador: 5, duracionMs: 30 * 24 * 60 * 60 * 1000, precio: 175000, precioReal: "$29.99", rareza: "Mitico", etiqueta: "Oferta" },
  { id: "xp6_45d", nombre: "Booster Legendario x6", multiplicador: 6, duracionMs: 45 * 24 * 60 * 60 * 1000, precio: 275000, precioReal: "$39.99", rareza: "Legendario", etiqueta: "Premium" },
  { id: "xp8_60d", nombre: "Booster Supremo x8", multiplicador: 8, duracionMs: 60 * 24 * 60 * 60 * 1000, precio: 475000, precioReal: "$59.99", rareza: "Supremo", etiqueta: "Maximo poder" },
]

export const BOOSTERS_MONEDAS = [
  { id: "coins_boost12_24d", nombre: "Impulso Monedas x1.2", multiplicador: 1.2, duracionMs: 24 * 24 * 60 * 60 * 1000, precio: 26000, precioReal: "$4.99", rareza: "Inicial", etiqueta: "Recomendado", descripcion: "Ideal para jugadores casuales" },
  { id: "coins_boost13_18d", nombre: "Impulso Monedas x1.3", multiplicador: 1.3, duracionMs: 18 * 24 * 60 * 60 * 1000, precio: 24000, precioReal: "$4.49", rareza: "Competitivo", etiqueta: "Popular", descripcion: "Bonus estable y economico" },
  { id: "coins_boost15_12d", nombre: "Impulso Monedas x1.5", multiplicador: 1.5, duracionMs: 12 * 24 * 60 * 60 * 1000, precio: 31000, precioReal: "$5.99", rareza: "Elite", etiqueta: "Mejor Oferta", descripcion: "Balanceado entre duracion y ganancia" },
  { id: "coins_boost14_3d", nombre: "Impulso Monedas x1.4", multiplicador: 1.4, duracionMs: 3 * 24 * 60 * 60 * 1000, precio: 13000, precioReal: "$2.49", rareza: "Evento", etiqueta: "Evento", descripcion: "Larga duracion sin romper economia" },
  { id: "coins_boost18_2d", nombre: "Impulso Monedas x1.8", multiplicador: 1.8, duracionMs: 2 * 24 * 60 * 60 * 1000, precio: 17000, precioReal: "$3.49", rareza: "Premium", etiqueta: "Premium", descripcion: "Ideal para sesiones competitivas" },
  { id: "coins_boost27_8h", nombre: "Impulso Monedas x2.7", multiplicador: 2.7, duracionMs: 8 * 60 * 60 * 1000, precio: 21000, precioReal: "$4.49", rareza: "Legendario", etiqueta: "Destacado", descripcion: "Balanceado para jugadores activos" },
  { id: "coins_boost2_3h", nombre: "Impulso Monedas x2", multiplicador: 2, duracionMs: 3 * 60 * 60 * 1000, precio: 9000, precioReal: "$1.99", rareza: "Epico", etiqueta: "Epico", descripcion: "Boost intenso pero corto" },
  { id: "coins_boost22_2h", nombre: "Impulso Monedas x2.2", multiplicador: 2.2, duracionMs: 2 * 60 * 60 * 1000, precio: 10500, precioReal: "$2.49", rareza: "Limitado", etiqueta: "Limitado", descripcion: "Orientado a torneos rapidos" },
  { id: "coins_boost25_1h", nombre: "Impulso Monedas x2.5", multiplicador: 2.5, duracionMs: 60 * 60 * 1000, precio: 12000, precioReal: "$2.79", rareza: "Ultra", etiqueta: "Ultra", descripcion: "Muy fuerte pero controlado" },
  { id: "coins_boost3_1h", nombre: "Impulso Monedas x3", multiplicador: 3, duracionMs: 60 * 60 * 1000, precio: 16000, precioReal: "$3.49", rareza: "Extremo", etiqueta: "Extremo", descripcion: "Riesgo/recompensa alto" },
]

export const PAQUETES_MONEDAS = [
  { id: "coins_1000", cantidad: 1000, precioReal: "$0.99" },
  { id: "coins_2500", cantidad: 2500, precioReal: "$1.99" },
  { id: "coins_5000", cantidad: 5000, precioReal: "$3.99" },
  { id: "coins_8000", cantidad: 8000, precioReal: "$5.99", etiqueta: "Popular" },
  { id: "coins_12000", cantidad: 12000, precioReal: "$8.99", etiqueta: "Recomendado" },
  { id: "coins_18000", cantidad: 18000, precioReal: "$12.99" },
  { id: "coins_25000", cantidad: 25000, precioReal: "$16.99", etiqueta: "Competitivo" },
  { id: "coins_40000", cantidad: 40000, bonus: 5000, precioReal: "$24.99", etiqueta: "Mejor valor" },
  { id: "coins_65000", cantidad: 65000, bonus: 10000, precioReal: "$39.99", etiqueta: "Oferta" },
  { id: "coins_100000", cantidad: 100000, bonus: 20000, regalo: "Booster XP x2 gratis", precioReal: "$59.99", etiqueta: "Premium" },
]

export const PLANES_VIP = [
  { id: "7d", nombre: "VIP 7 dias", dias: 7, precio: 12000, precioReal: "$2.99", etiqueta: "Prueba", descripcion: "Acceso corto a Zona VIP, Bingo, Ruleta, Sala Social y eventos activos." },
  { id: "30d", nombre: "VIP 30 dias", dias: 30, precio: 40000, precioReal: "$8.99", etiqueta: "Popular", descripcion: "Un mes completo de juegos VIP, recompensas internas y eventos premium." },
  { id: "90d", nombre: "VIP 90 dias", dias: 90, precio: 95000, precioReal: "$19.99", etiqueta: "Mejor valor", descripcion: "Temporada extendida VIP con mejor precio por dia." },
  { id: "permanent", nombre: "VIP permanente", dias: null, precio: 250000, precioReal: "$49.99", etiqueta: "Maximo", descripcion: "Acceso VIP sin fecha de vencimiento para este usuario." },
]

const RAREZAS = [
  { nombre: "Normal", precio: 500, clase: "normal" },
  { nombre: "Poco comun", etiqueta: "Poco común", precio: 950, clase: "poco-comun" },
  { nombre: "Raro", precio: 1600, clase: "raro" },
  { nombre: "Epico", etiqueta: "Épico", precio: 3200, clase: "epico" },
  { nombre: "Legendario", precio: 6200, clase: "legendario" },
  { nombre: "Mitico", etiqueta: "Mítico", precio: 11000, clase: "mitico" },
]

const TEMAS_VISUALES = [
  "Neon", "Aurora", "Solar", "Lunar", "Quantum", "Cyber", "Titan", "Nova", "Obsidiana", "Cristal",
  "Vortex", "Arcade", "Prisma", "Zenit", "Eclipse", "Omega", "Vector", "Plasma", "Onix", "Radiant",
]

const RAREZAS_PREMIUM = [
  { nombre: "Normal", precio: 2000, clase: "normal" },
  { nombre: "Raro", precio: 5000, clase: "raro" },
  { nombre: "Epico", etiqueta: "Epico", precio: 12000, clase: "epico" },
  { nombre: "Legendario", precio: 240000, clase: "legendario" },
  { nombre: "Mitico", etiqueta: "Mitico", precio: 560000, clase: "mitico" },
  { nombre: "Prohibido", precio: 1440000, clase: "prohibido" },
]

export const ORDEN_RAREZAS_TIENDA = RAREZAS_PREMIUM.map((rareza) => rareza.nombre)

const PRECIOS_COSMETICOS = {
  fondo: {
    Normal: { monedas: 2500, real: "$0.99", etiqueta: "Popular" },
    Raro: { monedas: 6000, real: "$1.99", etiqueta: "Recomendado" },
    Epico: { monedas: 14000, real: "$4.99", etiqueta: "Premium" },
    Legendario: { monedas: 280000, real: "$79.92", etiqueta: "Exclusivo" },
    Mitico: { monedas: 640000, real: "$159.92", etiqueta: "Ultra raro" },
    Prohibido: { monedas: 1600000, real: "$319.92", etiqueta: "Limitado" },
  },
  id: {
    Normal: { monedas: 2000, real: "$0.79", etiqueta: "Popular" },
    Raro: { monedas: 5000, real: "$1.79", etiqueta: "Recomendado" },
    Epico: { monedas: 12000, real: "$4.49", etiqueta: "Premium" },
    Legendario: { monedas: 240000, real: "$71.92", etiqueta: "Exclusivo" },
    Mitico: { monedas: 560000, real: "$143.92", etiqueta: "Ultra raro" },
    Prohibido: { monedas: 1440000, real: "$279.92", etiqueta: "Limitado" },
  },
  marco: {
    Normal: { monedas: 2000, real: "$0.79", etiqueta: "Popular" },
    Raro: { monedas: 5000, real: "$1.79", etiqueta: "Recomendado" },
    Epico: { monedas: 12000, real: "$4.49", etiqueta: "Premium" },
    Legendario: { monedas: 240000, real: "$71.92", etiqueta: "Exclusivo" },
    Mitico: { monedas: 560000, real: "$143.92", etiqueta: "Ultra raro" },
    Prohibido: { monedas: 1440000, real: "$279.92", etiqueta: "Limitado" },
  },
}

export const TIPOS_SKIN_CRICKET = ["bate_cricket", "pelota_cricket"]

const SKINS_CRICKET = [
  crearSkinCricket("pelota_cricket", "clasica", "Pelota Cricket Clasica", "Pelota roja pulida con costura tradicional.", "Normal", "pelota-clasica.webp"),
  crearSkinCricket("pelota_cricket", "fuego", "Pelota Cricket Fuego", "Pelota encendida con un nucleo ardiente.", "Raro", "pelota-fuego.webp"),
  crearSkinCricket("pelota_cricket", "hielo", "Pelota Cricket Hielo", "Pelota cristalina cubierta por energia helada.", "Epico", "pelota-hielo.webp"),
  crearSkinCricket("pelota_cricket", "futurista", "Pelota Cricket Futurista", "Pelota neon azul y violeta de circuito competitivo.", "Epico", "pelota-futurista.webp"),
  crearSkinCricket("pelota_cricket", "dorada", "Pelota Cricket Dorada", "Pelota dorada reservada para golpes memorables.", "Legendario", "pelota-dorada.webp"),
  crearSkinCricket("bate_cricket", "clasico", "Bate Cricket Clasico", "Bate de madera pulida con acabado tradicional.", "Normal", "bate-clasico.webp"),
  crearSkinCricket("bate_cricket", "fuego", "Bate Cricket Fuego", "Bate forjado con una hoja ardiente.", "Raro", "bate-fuego.webp"),
  crearSkinCricket("bate_cricket", "hielo", "Bate Cricket Hielo", "Bate cristalino atravesado por energia helada.", "Epico", "bate-hielo.webp"),
  crearSkinCricket("bate_cricket", "futurista", "Bate Cricket Futurista", "Bate neon azul y violeta de tecnologia avanzada.", "Epico", "bate-futurista.webp"),
  crearSkinCricket("bate_cricket", "dorado", "Bate Cricket Dorado", "Bate legendario cubierto por energia solar.", "Legendario", "bate-dorado.webp"),
]

const NUCLEOS_NOMBRE = [
  "Fragmento de Nyx", "Corona del Vacio", "Ecos de Helion", "Ojo Carmesi", "Trono Astral",
  "Abismo de Ether", "Sello de Valkor", "Horizonte Umbrio", "Ultima Constelacion", "Cenizas del Eclipse",
  "Oraculo de Nadir", "Lanza de Kael", "Nexo de Umbra", "Vigilia de Aster", "Llave de Noctis",
  "Catedral de Origen", "Pacto de Lyria", "Pulso de Kron", "Altar de Veyra", "Bastion de Obsidiana",
  "Eco del Primer Rey", "Manto de Seraph", "Umbral de Tharion", "Cicatriz de Orion", "Juramento de Erebos",
  "Nodo de Astra", "Llama de Icaron", "Torre de Kair", "Sombra de Velkan", "Jardin de Ruina",
  "Marca de Solenne", "Latido del Nexus", "Velo de Arkan", "Rastro de Polaris", "Corte de Tenebris",
  "Anillo de Sable", "Camino de Eon", "Cisma de Hel", "Noche de Calyx", "Voz de Ender",
]

const FORMAS_NOMBRE = [
  "El {base}", "{base} Perdido", "{base} Inmortal", "{base} del Exilio", "{base} Prime",
  "La Vigilia del {base}", "Custodio del {base}", "Ascenso del {base}", "Ruina del {base}", "Legado del {base}",
  "El {base} Silente", "{base} de la Arena Final", "Codigo {base}", "Dominio del {base}", "El Ultimo {base}",
]

const DESCRIPCIONES_COSMETICAS = {
  fondo: {
    inicio: ["Arena", "Horizonte", "Portal", "Tormenta", "Dominio", "Nexo", "Eclipse", "Bastion", "Ruta", "Cielo"],
    cierre: ["para perfiles de final", "con energia de ascenso", "listo para duelos largos", "hecho para destacar victorias", "con presencia de ranking", "para partidas decisivas"],
  },
  id: {
    inicio: ["Placa", "Firma", "Codigo", "Insignia", "Marca", "Sello", "Clave", "Emblema", "Registro", "Distintivo"],
    cierre: ["para nombres que pesan", "con lectura de elite", "preparado para lobby competitivo", "hecho para entrar con autoridad", "con pulso de retador", "para cerrar series intensas"],
  },
  marco: {
    inicio: ["Borde", "Corona", "Armazon", "Guardia", "Contorno", "Anillo", "Relicario", "Frente", "Cerco", "Umbral"],
    cierre: ["con presencia de campeon", "para mostrar rango sin ruido", "hecho para vitrinas de perfil", "con brillo de finalista", "listo para victorias limpias", "para perfiles de alto impacto"],
  },
}

const PATRONES_DESCRIPCION = {
  lineas: "trazos",
  pulso: "pulso",
  anillo: "anillos",
  fragmentos: "fragmentos",
  halo: "halo",
}

const DESCRIPCIONES_MARCOS_INICIALES = {
  Normal: [
    "Borde sobrio con aire de escudo viajero; limpio, firme y listo para competir.",
    "Marco de lineas discretas, como una insignia ganada en las primeras arenas.",
    "Contorno pulido para perfiles que prefieren precision antes que ruido.",
    "Armazon ligero con vibra de explorador; sencillo, pero con caracter.",
    "Borde tactico de acabado frio, pensado para entrar al lobby con orden.",
    "Marco compacto con energia de entrenamiento y presencia de retador constante.",
    "Contorno claro y elegante, ideal para victorias pequenas que empiezan una ruta grande.",
    "Borde de expedicion urbana: practico, veloz y sin adornos innecesarios.",
    "Marco de guardia inicial, con cortes suaves y pulso competitivo discreto.",
    "Armazon sereno para jugadores que dejan hablar al marcador.",
    "Contorno de acero liviano, hecho para perfiles directos y bien enfocados.",
    "Borde de campamento nocturno; simple, resistente y con chispa aventurera.",
    "Marco de ruta abierta, con detalles finos para nombres que empiezan a sonar.",
    "Contorno estable con brillo medido, perfecto para una presencia limpia.",
    "Borde de aprendiz veterano: humilde en forma, firme en actitud.",
    "Marco de duelo temprano, rapido de leer y facil de recordar.",
    "Armazon equilibrado con estilo de primera liga, sin perder sencillez.",
  ],
  Raro: [
    "Marco de cortes veloces, como una medalla encontrada tras una final ajustada.",
    "Borde de explorador experto; elegante, inquieto y listo para partidas largas.",
    "Contorno con reflejos de arena nocturna, pensado para perfiles con historia.",
    "Armazon de ruta peligrosa, con detalles que parecen moverse al mirar.",
    "Marco de escuadra competitiva: compacto, brillante y con tension de torneo.",
    "Borde de reliquia menor, discreto pero dificil de ignorar en el lobby.",
    "Contorno aventurero con filo suave, hecho para jugadores que arriesgan bien.",
    "Marco de mapa secreto, con trazos que sugieren caminos sin explorar.",
    "Borde de rango ascendente; no presume, pero deja claro que hay progreso.",
    "Armazon con pulso de duelo, ideal para perfiles que viven al limite.",
    "Contorno de cristal oscuro, sobrio y afilado como una buena estrategia.",
    "Marco de expedicion rara, con brillo justo para marcar presencia.",
    "Borde de cazador de objetivos, rapido, limpio y con personalidad competitiva.",
    "Armazon de frontera arcade, mezclando aventura con energia de ranking.",
    "Contorno de victoria apretada, hecho para quienes cierran partidas dificiles.",
    "Marco con eco de torneo local: cercano, intenso y memorable.",
    "Borde de patrulla estelar, elegante sin volverse inalcanzable.",
  ],
  Epico: [
    "Armazon marcado por runas de arena; parece recordar cada duelo ganado con esfuerzo.",
    "Borde de obsidiana inquieta, tallado para perfiles que avanzan sin pedir permiso.",
    "Contorno de reliquia sellada, con un brillo que despierta cuando la partida se tensa.",
    "Marco de fortaleza antigua; pesado en historia, preciso en presencia competitiva.",
    "Borde atravesado por energia velada, como una promesa hecha antes de la final.",
    "Armazon de cazador nocturno, elegante y peligroso sin necesidad de levantar la voz.",
    "Contorno con grietas luminosas, forjado para nombres que ya cargan rumores.",
    "Marco de estandarte perdido; cada corte parece venir de una campana olvidada.",
    "Borde de duelo ceremonial, reservado para quienes convierten presion en calma.",
    "Armazon con pulso de reliquia, sobrio hasta que el marcador se vuelve imposible.",
    "Contorno de archivo prohibido, con trazos que sugieren victorias no registradas.",
    "Marco de corona incompleta, hecho para aspirantes que ya caminan como finalistas.",
    "Borde de hierro encantado, firme como una defensa que nadie logra romper.",
    "Armazon de mapa maldito, con rutas que parecen moverse hacia la siguiente ronda.",
    "Contorno de fuego contenido, brillante solo cuando la competencia exige respuesta.",
    "Marco de juramento antiguo, ideal para perfiles que no olvidan una derrota.",
    "Borde de torre sellada, discreto al principio y temible cuando se mira de cerca.",
  ],
  Legendario: [
    "Marco heredado de una arena desaparecida; su brillo cuenta finales que pocos vieron.",
    "Borde de corona quebrada, prestigioso sin perder la amenaza de una revancha.",
    "Contorno bañado en oro oscuro, como un trofeo que aun guarda secretos.",
    "Armazon de consejo antiguo, creado para nombres que pesan antes de jugar.",
    "Marco con fuego de archivo real, una marca de victoria escrita con paciencia.",
    "Borde de reliquia imperial, elegante, raro y cargado de historia competitiva.",
    "Contorno de llave ancestral, hecho para abrir lobbies donde solo quedan fuertes.",
    "Armazon de la ultima guardia, con cortes que parecen defender un titulo perdido.",
    "Marco de estirpe dorada, sobrio en forma pero imposible de confundir.",
    "Borde de pacto sellado, brillante como una promesa cumplida en eliminatorias.",
    "Contorno de sala prohibida, con energia oculta bajo un acabado de prestigio.",
    "Armazon de campeon exiliado, noble, tenso y marcado por batallas largas.",
    "Marco de emblema antiguo, reservado para perfiles que ya tienen leyenda propia.",
    "Borde de llama silenciosa, poderoso sin gritar y dificil de apartar la vista.",
    "Contorno de trono vacante, hecho para quien compite como si fuera a reclamarlo.",
    "Armazon de honor perdido, con detalles que parecen sobrevivir al paso del ranking.",
    "Marco de victoria mayor, raro como una final perfecta y serio como su premio.",
  ],
  Mitico: [
    "Armazon tejido con sombras antiguas; vibra como si una arena olvidada respirara dentro.",
    "Borde de cristal abisal, capaz de convertir un perfil en presagio de derrota.",
    "Contorno nacido de un juramento roto, brillante solo ante rivales dignos.",
    "Marco con latido de templo hundido; cada trazo parece custodiar una verdad peligrosa.",
    "Borde de llama espectral, silencioso hasta que la partida roza lo imposible.",
    "Armazon de eclipse cautivo, reservado para nombres que ya parecen leyenda.",
    "Contorno de reliquia viva, con energia que no se mira: se siente acercarse.",
    "Marco de noche coronada, oscuro, preciso y cargado de autoridad ancestral.",
    "Borde de santuario sellado, tan raro que parece haber elegido a su portador.",
    "Armazon con eco de reyes caidos, majestuoso sin dejar de ser amenaza.",
    "Contorno de niebla dorada, una mezcla de prestigio y peligro dificil de explicar.",
    "Marco de oraculo despierto, como si leyera el resultado antes del primer movimiento.",
    "Borde de ceniza eterna, hermoso en calma y terrible cuando empieza la remontada.",
    "Armazon de llave imposible, hecho para abrir una ruta que nadie mas ve.",
    "Contorno de sangre estelar, elegante y extraño como una victoria fuera del destino.",
    "Marco de corona sin dueño, esperando al jugador capaz de sostener su peso.",
    "Borde de umbral sagrado, casi vivo bajo la luz del perfil competitivo.",
  ],
  Prohibido: [
    "Marco sellado bajo siete derrotas antiguas; su borde parece advertir antes de brillar.",
    "Contorno corrupto de una corona borrada, temido incluso entre campeones olvidados.",
    "Armazon de vacio encadenado, tan raro que parece no pertenecer a la tienda.",
    "Borde escrito con energia prohibida, como una sentencia previa a la final.",
    "Marco de altar negro, despierto solo para perfiles que cargan peligro real.",
    "Contorno de reliquia maldita, bello de lejos y perturbador al acercarse.",
    "Armazon del pacto innombrable, con grietas que parecen mirar de vuelta.",
    "Borde de eclipse muerto, una pieza inalcanzable con memoria de imperios caidos.",
    "Marco de archivo clausurado, sellado para que nadie recuerde quien lo forjo.",
    "Contorno de veneno astral, elegante, oscuro y demasiado antiguo para ser seguro.",
    "Armazon de trono prohibido, hecho para quien compite como amenaza final.",
    "Borde de profecia rota, cada linea parece negar una victoria enemiga.",
    "Marco de ruina consciente, silencioso hasta que el rival entiende el riesgo.",
    "Contorno de llave del abismo, imposible de ignorar y peor de desafiar.",
    "Armazon de sombra imperial, corrupto en sus detalles y majestuoso en su forma.",
    "Borde de juicio sellado, tan oscuro que convierte el perfil en advertencia.",
  ],
}

const DESCRIPCIONES_FONDOS_INICIALES = {
  Normal: [
    "Paisaje de inicio con luces bajas, ideal para perfiles que comienzan su ruta competitiva.",
    "Arena clara y directa, con ambiente de entrenamiento antes del primer gran reto.",
    "Horizonte de explorador, sencillo pero con ganas de abrir nuevas partidas.",
    "Fondo de campamento gamer, perfecto para una presencia limpia y aventurera.",
    "Escena de ruta temprana, con energia tranquila y sensacion de preparacion.",
    "Mapa visual de primera mision, sobrio, rapido de leer y con buen ritmo.",
    "Ambiente de lobby nocturno, discreto pero listo para entrar en combate.",
    "Fondo de sendero abierto, pensado para jugadores que avanzan paso a paso.",
    "Vista de arena inicial, con trazos claros y estilo competitivo sin exceso.",
    "Paisaje de frontera arcade, ligero, ordenado y con chispa de aventura.",
    "Escena de base segura, ideal para perfiles que prefieren enfoque y precision.",
    "Fondo de viaje corto, con brillo medido y vibra de partida casual seria.",
    "Ambiente de entrenamiento urbano, simple, firme y listo para subir ritmo.",
    "Vista de tablero abierto, creada para nombres que empiezan a ganar terreno.",
    "Fondo de exploracion tranquila, con detalles suaves y aire de nueva temporada.",
    "Escena de preparacion tactica, limpia y facil de reconocer en el perfil.",
    "Paisaje de primer desafio, humilde en tono pero con alma competitiva.",
  ],
  Raro: [
    "Arena de neblina azul, con tension de partida larga y secretos en el fondo.",
    "Horizonte de expedicion rara, iluminado como una ruta que pocos encuentran.",
    "Fondo de ciudad oculta, elegante y competitivo sin perder su lado aventurero.",
    "Escena de mapa antiguo, con marcas que parecen guiar hacia otra ronda.",
    "Paisaje de tormenta lejana, sobrio pero cargado de movimiento y expectativa.",
    "Ambiente de ruinas arcade, mezcla de exploracion, luces frias y presion de torneo.",
    "Fondo de portal menor, misterioso sin volverse imposible ni exagerado.",
    "Vista de frontera nocturna, hecha para perfiles con partidas que contar.",
    "Escena de sendero raro, con brillo fino y sensacion de avance constante.",
    "Arena de cristales bajos, limpia, afilada y lista para duelos tacticos.",
    "Fondo de estacion perdida, con energia de aventura y calma antes del marcador.",
    "Paisaje de ruta secreta, ideal para jugadores que arriesgan con cabeza.",
    "Ambiente de base avanzada, mas intenso sin abandonar la elegancia competitiva.",
    "Vista de campamento estelar, con luces raras y aire de torneo cercano.",
    "Fondo de pasaje oculto, memorable sin gritar y facil de asociar al perfil.",
    "Escena de neones templados, pensada para lobbies con ritmo y estilo.",
    "Paisaje de explorador veterano, con color, profundidad y tension medida.",
  ],
  Epico: [
    "Ciudad suspendida entre ruinas y neones, como una final disputada en otra era.",
    "Arena antigua bajo lluvia violeta, cargada de secretos que despiertan con el marcador.",
    "Horizonte de torres selladas, imponente sin perder el filo competitivo.",
    "Fondo de templo fracturado, donde la luz parece guardar rutas hacia otra dimension.",
    "Valle de energia oculta, amplio, misterioso y hecho para perfiles de alto nivel.",
    "Escena de fortaleza nocturna, con historia en sus muros y tension de eliminatoria.",
    "Paisaje de portal inestable, brillante como una oportunidad que no espera.",
    "Arena de cristales profundos, elegante y peligrosa sin volverse inalcanzable.",
    "Fondo de biblioteca perdida, con pasillos que parecen recordar antiguas victorias.",
    "Horizonte de guerra silenciosa, perfecto para perfiles que juegan con paciencia.",
    "Escena de santuario roto, donde cada sombra sugiere una ronda decisiva.",
    "Paisaje de frontera arcana, mezclando exploracion, prestigio y presion de torneo.",
    "Fondo de corona distante, con atmosfera de ascenso y misterio contenido.",
    "Arena de eclipse parcial, sobria, cinematografica y lista para duelos serios.",
    "Vista de ciudad hundida, con luces que parecen flotar sobre una historia olvidada.",
    "Fondo de sendero prohibido, aun accesible para quienes se atreven a avanzar.",
    "Escena de bastion antiguo, firme como una defensa que resiste hasta el final.",
  ],
  Legendario: [
    "Reino dorado bajo tormenta oscura, donde cada partida parece entrar en la historia.",
    "Arena de tronos vacantes, prestigiosa y tensa como una final sin favoritos.",
    "Horizonte de imperio perdido, iluminado por victorias que nadie pudo borrar.",
    "Fondo de puerta ancestral, abierto solo a perfiles con nombre de contendiente real.",
    "Ciudad de cristal antiguo, majestuosa, fria y construida para duelos memorables.",
    "Escena de archivo real, con energia oculta bajo una calma demasiado perfecta.",
    "Paisaje de corona enterrada, lleno de prestigio y promesas de revancha.",
    "Arena de fuego noble, poderosa sin gritar y seria como un titulo en juego.",
    "Fondo de sala ceremonial, donde la luz cae como si anunciara campeones.",
    "Horizonte de guardianes caidos, con grandeza antigua y ritmo competitivo.",
    "Escena de puente eterno, hecha para perfiles que cruzan rondas imposibles.",
    "Paisaje de estandartes olvidados, cargado de memoria, tension y rango.",
    "Fondo de ciudad imperial, brillante en detalles y pesado en historia.",
    "Arena de oro quebrado, elegante como premio y peligrosa como desempate.",
    "Vista de fortaleza celeste, imponente sin tocar aun lo divino.",
    "Fondo de consejo sellado, exclusivo, misterioso y digno de una gran racha.",
    "Escena de victoria antigua, con atmosfera de leyenda competitiva contenida.",
  ],
  Mitico: [
    "Dimension de niebla viva, donde el horizonte parece respirar antes de cada duelo.",
    "Arena suspendida sobre un abismo azul, hermosa y peligrosa como una profecia incompleta.",
    "Fondo de eclipse ancestral, con energia que se siente antes de verse.",
    "Santuario de sombras doradas, reservado para perfiles que cargan destino de leyenda.",
    "Paisaje de mar estelar oscuro, profundo como una ruta que nadie deberia cruzar.",
    "Ciudad imposible entre cristales y ruinas, viva bajo un silencio demasiado antiguo.",
    "Escena de umbral mitico, abierta solo cuando la competencia roza lo imposible.",
    "Horizonte de sangre luminosa, elegante, extraño y cargado de presagios.",
    "Fondo de templo sin cielo, donde la luz cae como memoria de eras perdidas.",
    "Arena de ceniza eterna, tranquila hasta que el perfil parece encenderla.",
    "Paisaje de corona flotante, majestuoso y peligroso como un poder sin dueño.",
    "Dimension de runas dormidas, capaz de convertir el lobby en ceremonia.",
    "Fondo de tormenta ancestral, con relampagos que parecen conocer antiguos campeones.",
    "Vista de abismo cristalino, bella de lejos y desafiante al primer vistazo.",
    "Escena de oraculo oscuro, donde cada color parece anticipar una remontada.",
    "Paisaje de frontera irreal, tan raro que parece dibujado fuera del mapa.",
    "Fondo de altar elevado, casi sagrado, pero todavia marcado por la competencia.",
  ],
  Prohibido: [
    "Reino clausurado por una energia corrupta, visible solo para quienes desafian la advertencia.",
    "Arena de vacio sellado, donde las sombras parecen moverse contra el jugador.",
    "Fondo de eclipse muerto, antiguo, temido y demasiado oscuro para una victoria normal.",
    "Ciudad prohibida bajo grietas rojas, como si una final hubiera roto la dimension.",
    "Paisaje de altar maldito, con una calma que anuncia peligro antes del combate.",
    "Dimension encadenada entre ruinas negras, inalcanzable para perfiles comunes.",
    "Escena de archivo corrupto, sellada por nombres que desaparecieron del ranking.",
    "Horizonte de trono hundido, oscuro y cargado de una autoridad imposible.",
    "Fondo de abismo consciente, bello en silencio y terrible cuando se observa demasiado.",
    "Arena de profecia rota, donde la luz parece negar cualquier regreso seguro.",
    "Paisaje de santuario prohibido, cubierto por marcas que nadie deberia leer.",
    "Dimension de fuego negro, exclusiva como una reliquia que aun no perdona.",
    "Fondo de frontera maldita, temido por su aura y raro incluso entre rarezas.",
    "Vista de portal condenado, con profundidad de leyenda y amenaza constante.",
    "Escena de corona corrupta, majestuosa, oscura y sellada por antiguas derrotas.",
    "Paisaje de juicio olvidado, tan inalcanzable que parece mirar desde otro mundo.",
  ],
}

const DESCRIPCIONES_IDS_INICIALES = {
  Normal: [
    "Placa limpia de entrada, con lineas claras para un nombre facil de reconocer.",
    "Icono de perfil directo, pensado para jugadores que prefieren orden y velocidad.",
    "ID de trazo ligero, con vibra de lobby activo y primera victoria cerca.",
    "Insignia sencilla con acabado gamer, lista para acompanar partidas casuales serias.",
    "Placa de inicio competitivo, sobria, legible y con actitud de retador.",
    "Icono compacto con energia de equipo, ideal para perfiles frescos y enfocados.",
    "ID de borde claro, hecho para que el nombre respire sin perder presencia.",
    "Insignia de ruta temprana, practica y con chispa de aventura digital.",
    "Placa de neones suaves, discreta pero lista para entrar en cola.",
    "Icono de base tactica, ordenado, rapido de leer y sin ruido visual.",
    "ID de estilo urbano, simple en forma y con personalidad de jugador constante.",
    "Insignia de partida nueva, ligera, precisa y facil de asociar al perfil.",
    "Placa de entrenamiento, con cortes suaves y ritmo de competencia diaria.",
    "Icono de tablero limpio, ideal para nombres que empiezan a ganar memoria.",
    "ID de explorador novato, con detalle justo para no pasar desapercibido.",
    "Insignia de lobby claro, pensada para jugar bien antes que presumir.",
    "Placa equilibrada, sencilla en lectura y firme en actitud competitiva.",
  ],
  Raro: [
    "ID de filo azul, con presencia de jugador que ya conoce la presion.",
    "Insignia de ruta secreta, elegante y lista para nombres con partidas encima.",
    "Placa de neones tensos, hecha para entrar al lobby con mas caracter.",
    "Icono de escuadra avanzada, compacto, limpio y con pulso competitivo.",
    "ID de explorador veterano, con detalles que sugieren mapa y objetivo.",
    "Insignia de cristal bajo, sobria pero dificil de confundir entre perfiles.",
    "Placa de duelo rapido, afilada en bordes y clara al primer vistazo.",
    "Icono de frontera arcade, con color medido y energia de torneo cercano.",
    "ID de marca nocturna, discreto, veloz y con personalidad de ranking.",
    "Insignia de circuito raro, como una senal privada para jugadores atentos.",
    "Placa de objetivo marcado, precisa y con tension de partida ajustada.",
    "Icono de pase oculto, aventurero sin perder elegancia competitiva.",
    "ID de linea ascendente, ideal para perfiles que ya empiezan a sonar.",
    "Insignia de arena fria, con brillo exacto para una presencia seria.",
    "Placa de estrategia limpia, pensada para nombres que juegan con cabeza.",
    "Icono de codigo raro, pequeno en espacio pero fuerte en identidad.",
    "ID de exploracion nocturna, memorable sin ser exagerado.",
  ],
  Epico: [
    "Placa marcada por runas modernas, como una firma ganada en rondas dificiles.",
    "Icono de archivo sellado, elegante y con una energia que parece estar despierta.",
    "ID de filo violeta, hecho para nombres que convierten presion en ventaja.",
    "Insignia de reliquia tactica, con historia suficiente para pesar en el lobby.",
    "Placa de neblina arcana, misteriosa sin perder lectura competitiva.",
    "Icono de estandarte roto, perfecto para jugadores que regresan mas fuertes.",
    "ID de corona incompleta, con prestigio de aspirante a finalista.",
    "Insignia de circuito antiguo, donde tecnologia y misterio se cruzan.",
    "Placa de duelo ceremonial, seria, afilada y dificil de olvidar.",
    "Icono de sombra luminosa, con un brillo que aparece justo en el limite.",
    "ID de mapa prohibido, como una clave visual para rutas que pocos ven.",
    "Insignia de fuego contenido, intensa sin dejar de ser elegante.",
    "Placa de torre oculta, reservada para nombres con paciencia y amenaza.",
    "Icono de pacto competitivo, hecho para perfiles que no sueltan una serie.",
    "ID de cristal profundo, sobrio al inicio y poderoso al observarlo.",
    "Insignia de frontera epica, con aire de aventura y prestigio real.",
    "Placa de juramento de arena, nacida para quienes recuerdan cada derrota.",
  ],
  Legendario: [
    "ID de emblema real, creado para nombres que se reconocen antes del duelo.",
    "Placa de oro oscuro, elegante como trofeo y tensa como desempate.",
    "Icono de corona quebrada, prestigioso sin perder su filo competitivo.",
    "Insignia de consejo antiguo, con peso de historia y calma de campeon.",
    "ID de llama silenciosa, brillante solo cuando el perfil exige respeto.",
    "Placa de llave ancestral, hecha para abrir lobbies donde quedan los fuertes.",
    "Icono de archivo real, con energia oculta bajo un acabado impecable.",
    "Insignia de trono vacante, seria, noble y lista para ser reclamada.",
    "ID de guardia final, con cortes que parecen defender una racha perfecta.",
    "Placa de estirpe dorada, rara, sobria y facil de recordar.",
    "Icono de pacto sellado, como una promesa cumplida en eliminatorias.",
    "Insignia de sala prohibida, misteriosa sin cruzar todavia lo imposible.",
    "ID de campeon exiliado, noble en forma y marcado por batallas largas.",
    "Placa de victoria mayor, premium, precisa y cargada de memoria.",
    "Icono de reliquia imperial, hecho para perfiles con leyenda propia.",
    "Insignia de honor perdido, con detalles que sobreviven al paso del ranking.",
    "ID de final antigua, solemne, brillante y digno de una gran racha.",
  ],
  Mitico: [
    "Placa de sombra ancestral, como una firma que despierta cuando el rival duda.",
    "Icono de eclipse cautivo, oscuro, elegante y cargado de energia antigua.",
    "ID de reliquia viva, con un pulso que parece responder al nombre del jugador.",
    "Insignia de oraculo nocturno, rara como una prediccion cumplida en silencio.",
    "Placa de cristal abisal, bella al primer vistazo y peligrosa al segundo.",
    "Icono de corona sin dueno, esperando a quien pueda sostener su historia.",
    "ID de llama espectral, tenue hasta que una partida se vuelve imposible.",
    "Insignia de templo hundido, con marcas que parecen sobrevivir a otra era.",
    "Placa de niebla dorada, premium, extrana y cargada de presagios competitivos.",
    "Icono de llave imposible, hecho para nombres que abren rutas fuera del mapa.",
    "ID de ceniza eterna, sobrio en forma y antiguo en su aura.",
    "Insignia de frontera irreal, como una senal enviada desde una arena perdida.",
    "Placa de runa dormida, silenciosa hasta que el perfil exige leyenda.",
    "Icono de sangre estelar, elegante, inquietante y dificil de olvidar.",
    "ID de santuario oscuro, reservado para jugadores que ya parecen mito.",
    "Insignia de trono lejano, majestuosa sin abandonar la amenaza del duelo.",
    "Placa de umbral sagrado, casi viva bajo la luz del lobby competitivo.",
  ],
  Prohibido: [
    "ID sellado por una energia corrupta, como una advertencia antes del primer click.",
    "Placa de vacio encadenado, demasiado antigua para sentirse segura.",
    "Icono de corona borrada, temido por nombres que ya conocen la derrota.",
    "Insignia de pacto innombrable, con grietas que parecen mirar de vuelta.",
    "ID de altar negro, oscuro, exclusivo y cargado de peligro silencioso.",
    "Placa de archivo clausurado, marcada por historias que nadie debio abrir.",
    "Icono de eclipse muerto, una firma visual llegada desde una final prohibida.",
    "Insignia de veneno astral, elegante en forma y corrupta en su energia.",
    "ID de trono prohibido, hecho para perfiles que entran como amenaza final.",
    "Placa de profecia rota, cada linea parece negar la victoria enemiga.",
    "Icono de ruina consciente, silencioso hasta que el rival entiende el riesgo.",
    "Insignia de llave del abismo, imposible de ignorar y peor de desafiar.",
    "ID de sombra imperial, majestuoso en silueta y oscuro en intencion.",
    "Placa de juicio sellado, tan rara que convierte el nombre en advertencia.",
    "Icono de marca corrupta, bello de lejos y perturbador al acercarse.",
    "Insignia de mundo clausurado, inalcanzable como una leyenda que no perdona.",
  ],
}

export const COSMETICOS = [
  ...generarCosmeticos("fondo", 100),
  ...generarCosmeticos("id", 100),
  ...generarCosmeticos("marco", 100),
  ...SKINS_CRICKET,
]

export async function obtenerCatalogoTiendaRotativa() {
  const fallback = {
    ok: true,
    remoto: false,
    boostersXp: BOOSTERS_XP,
    boostersMonedas: BOOSTERS_MONEDAS,
    cosmeticos: COSMETICOS,
    cambiaEn: null,
    servidorAhora: null,
    cargadoEn: Date.now(),
  }

  try {
    const { data, error } = await supabase.rpc("obtener_tienda_rotacion_activa")
    if (error || data?.ok === false) {
      console.warn("No se pudo cargar rotacion de tienda", error || data)
      return fallback
    }

    const productos = Array.isArray(data?.productos) ? data.productos : []
    const normalizados = productos.map(normalizarProductoRotacion).filter(Boolean)
    const fechasFin = normalizados
      .map((item) => item.rotacionFin)
      .filter(Boolean)
      .sort((a, b) => Date.parse(a) - Date.parse(b))

    return {
      ok: true,
      remoto: true,
      boostersXp: normalizados.filter((item) => item.tipoProducto === "booster_xp"),
      boostersMonedas: normalizados.filter((item) => item.tipoProducto === "booster_monedas"),
      cosmeticos: normalizados.filter((item) => item.tipoProducto === "cosmetico"),
      cambiaEn: fechasFin[0] || null,
      servidorAhora: data?.servidorAhora || null,
      cargadoEn: Date.now(),
    }
  } catch (error) {
    console.warn("Error cargando rotacion de tienda", error)
    return fallback
  }
}

function normalizarProductoRotacion(row) {
  const id = String(row?.slug || row?.id || "").trim()
  const tipoProducto = String(row?.tipoProducto || "")
  const metadata = row?.metadata && typeof row.metadata === "object" ? row.metadata : {}
  if (!id || !tipoProducto) return null

  if (tipoProducto === "booster_xp" || tipoProducto === "booster_monedas") {
    const catalogo = tipoProducto === "booster_xp" ? BOOSTERS_XP : BOOSTERS_MONEDAS
    const base = catalogo.find((item) => item.id === id) || {}
    return {
      ...base,
      id,
      tipoProducto,
      nombre: row.nombre || base.nombre || id,
      descripcion: row.descripcion || base.descripcion || "",
      rareza: row.rareza || base.rareza || "Potenciador",
      multiplicador: Number(metadata.multiplicador || base.multiplicador || 1),
      duracionMs: Number(metadata.duracion_ms || base.duracionMs || 0),
      precio: Number(row.precio ?? base.precio ?? 0),
      precioReal: row.precioReal || base.precioReal || "$0.99",
      rotacionFin: row.rotacionFin || null,
      orden: Number(row.orden || 0),
    }
  }

  if (tipoProducto !== "cosmetico") return null

  const base = resolverCosmeticoCatalogo(id, row) || {}
  const tipo = row.familia || row.tipo || base.tipo || "fondo"
  return {
    ...base,
    id,
    tipoProducto,
    tipo,
    categoria: base.categoria || categoriaCosmetico(tipo),
    nombre: base.nombre || row.nombre || id,
    descripcion: base.descripcion || row.descripcion || "Cosmetico de tienda.",
    rareza: row.rareza || base.rareza || "Normal",
    precio: Number(row.precio ?? base.precio ?? 0),
    precioReal: row.precioReal || base.precioReal || "$0.79",
    etiqueta: base.etiqueta || "",
    metadata,
    diseno: base.diseno || { patron: "catalogo", brillo: 1 },
    rotacionFin: row.rotacionFin || null,
    orden: Number(row.orden || 0),
  }
}

const BOOSTER_LOCAL_KEY = "tienda_boosters_usuario"
const COIN_BOOSTER_LOCAL_KEY = "tienda_coin_boosters_usuario"
const COSMETICOS_LOCAL_KEY = "tienda_cosmeticos_usuario"
const MONEDAS_LOCAL_KEY = "monedas_usuario_saldos"
const MONEDAS_HISTORIAL_KEY = "monedas_usuario_historial"
const SAVED_UNIQUE_CODE_KEY = "savedUniqueCode"
const CATALOGO_COSMETICOS_CACHE_MS = 30000
const catalogoCosmeticosRemotoCache = new Map()
const canalesRecompensasUsuario = new Map()
export const RECOMPENSAS_MONEDAS = {
  torneo: 300,
  minitorneo: 150,
  nivel: 150,
  posicion: {
    1: 200,
    2: 100,
    3: 50,
  },
}

export async function obtenerBonusUsuario(usuario) {
  const activo = await obtenerBoosterActivo(usuario)
  return activo?.multiplicador || 1
}

export async function obtenerBoosterActivo(usuario) {
  return obtenerBoosterTemporalActivo(usuario, BOOSTERS_XP, BOOSTER_LOCAL_KEY)
}

export async function obtenerBoosterMonedasActivo(usuario) {
  return obtenerBoosterTemporalActivo(usuario, BOOSTERS_MONEDAS, COIN_BOOSTER_LOCAL_KEY)
}

async function obtenerBoosterTemporalActivo(usuario, catalogo, localKey) {
  const ahoraIso = new Date().toISOString()
  const local = leerBoosterLocal(usuario, localKey, catalogo)
  const idsValidos = new Set(catalogo.map((item) => item.id))

  if (!usuario) return local

  const { data, error } = await supabase
    .from("usuario_boosters")
    .select("booster_id,multiplicador,fecha_fin")
    .eq("usuario_id", usuario)
    .eq("activo", true)
    .gt("fecha_fin", ahoraIso)
    .order("multiplicador", { ascending: false })
    .order("fecha_fin", { ascending: false })
    .limit(20)

  if (error) {
    console.warn("No se pudo cargar booster activo", error)
    return local
  }

  return (data || []).find((row) => idsValidos.has(row.booster_id) || esBoosterAdminValido(row, catalogo)) || local
}

export async function comprarBooster(usuario, boosterId, itemCatalogo = null) {
  const booster = itemCatalogo || BOOSTERS_XP.find((item) => item.id === boosterId)
  return comprarItemTiendaConMonedas(usuario, "booster_xp", booster, BOOSTER_LOCAL_KEY)
}

export async function comprarBoosterMonedas(usuario, boosterId, itemCatalogo = null) {
  const booster = itemCatalogo || BOOSTERS_MONEDAS.find((item) => item.id === boosterId)
  return comprarItemTiendaConMonedas(usuario, "booster_monedas", booster, COIN_BOOSTER_LOCAL_KEY)
}

export async function comprarCosmetico(usuario, cosmeticoId, itemCatalogo = null) {
  const cosmetico = itemCatalogo || COSMETICOS.find((item) => item.id === cosmeticoId)
  return comprarItemTiendaConMonedas(usuario, "cosmetico", cosmetico)
}

async function comprarItemTiendaConMonedas(usuario, tipoCompra, item, localKey = null) {
  const codigo = (localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || "").trim()
  if (!usuario || !codigo || !item) {
    return { ok: false, message: "Vuelve a iniciar sesion para comprar." }
  }

  try {
    const { data, error } = await supabase.rpc("comprar_item_tienda_con_monedas", {
      p_usuario: usuario,
      p_codigo: codigo,
      p_tipo_compra: tipoCompra,
      p_producto_id: item.id,
    })

    if (error || data?.ok !== true) {
      console.warn("No se pudo comprar item de tienda", error || data)
      return {
        ok: false,
        message: data?.mensaje || error?.message || "No se pudo completar la compra.",
        saldoNuevo: data?.saldoNuevo,
      }
    }

    if (Number.isFinite(Number(data?.saldoNuevo))) {
      guardarMonedas(usuario, data.saldoNuevo)
      guardarMovimientoMonedas(usuario, "compra", -Math.max(0, Number(data?.precio || item.precio) || 0), {
        tipo: tipoCompra,
        id: item.id,
        key: `tienda:${tipoCompra}:${item.id}:${Date.now()}`,
      })
      emitirCambioMonedas(usuario)
    }

    if (tipoCompra === "booster_xp" || tipoCompra === "booster_monedas") {
      const booster = data?.booster || {
        usuario_id: usuario,
        booster_id: item.id,
        multiplicador: item.multiplicador,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + item.duracionMs).toISOString(),
        activo: true,
      }
      if (localKey && booster.activo === true) guardarBoosterLocal(usuario, booster, localKey)
      return { ok: true, booster, saldoNuevo: data?.saldoNuevo, message: data?.mensaje }
    }

    const payload = normalizarCosmeticoLocal({
      usuario_id: usuario,
      cosmetico_id: item.id,
      tipo: item.tipo,
      rareza: item.rareza,
      equipado: true,
      created_at: data?.cosmetico?.created_at || new Date().toISOString(),
      nombre: item.nombre,
      categoria: item.categoria,
      diseno: item.diseno,
      rareza_visual: item.rareza,
    })
    guardarCosmeticoLocal(usuario, payload)
    return { ok: true, cosmetico: payload, saldoNuevo: data?.saldoNuevo, message: data?.mensaje }
  } catch (error) {
    console.warn("Error comprando item de tienda", error)
    return { ok: false, message: "No se pudo completar la compra." }
  }
}

export async function obtenerInventarioTienda(usuario) {
  if (!usuario) return { boosters: [], cosmeticos: [] }

  const [boostersResult, cosmeticosResult] = await Promise.all([
    supabase
      .from("usuario_boosters")
      .select("id,usuario_id,booster_id,multiplicador,fecha_inicio,fecha_fin,activo,estado,duracion_ms,comprado_at,activado_at,created_at")
      .eq("usuario_id", usuario)
      .order("created_at", { ascending: false }),
    supabase
      .from("usuario_cosmeticos")
      .select("id,usuario_id,cosmetico_id,tipo,rareza,equipado,created_at")
      .eq("usuario_id", usuario)
      .order("created_at", { ascending: false }),
  ])

  if (boostersResult.error) console.warn("No se pudo cargar inventario de boosters", boostersResult.error)
  if (cosmeticosResult.error) console.warn("No se pudo cargar inventario de cosmeticos", cosmeticosResult.error)

  return {
    boosters: (boostersResult.data || []).map(enriquecerBoosterInventario),
    cosmeticos: await enriquecerCosmeticosRemotos(cosmeticosResult.data || []),
  }
}

export async function activarBoosterInventario(usuario, boosterCompraId) {
  const codigo = (localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || "").trim()
  if (!usuario || !codigo || !boosterCompraId) {
    return { ok: false, message: "Vuelve a iniciar sesion para activar el booster." }
  }

  try {
    const { data, error } = await supabase.rpc("activar_booster_inventario", {
      p_usuario: usuario,
      p_codigo: codigo,
      p_booster_compra_id: Number(boosterCompraId),
    })

    if (error || data?.ok !== true) {
      console.warn("No se pudo activar booster", error || data)
      return { ok: false, message: data?.mensaje || error?.message || "No se pudo activar el booster." }
    }

    const booster = data?.booster
    if (booster?.activo === true) {
      const catalogoKey = BOOSTERS_XP.some((item) => item.id === booster.booster_id) || String(booster.booster_id || "").startsWith("admin_xp_")
        ? BOOSTER_LOCAL_KEY
        : COIN_BOOSTER_LOCAL_KEY
      guardarBoosterLocal(usuario, booster, catalogoKey)
    }

    return { ok: true, booster, message: data?.mensaje || "Booster activado." }
  } catch (error) {
    console.warn("Error activando booster", error)
    return { ok: false, message: "No se pudo activar el booster." }
  }
}

export async function equiparCosmetico(usuario, cosmeticoId) {
  const productoCatalogo = await obtenerCosmeticoCatalogoRemoto(cosmeticoId)
  const cosmetico = resolverCosmeticoCatalogo(cosmeticoId, productoCatalogo)
    || resolverCosmeticoCatalogo(cosmeticoId)
    || await obtenerCosmeticoCompradoParaEquipar(usuario, cosmeticoId)
  if (!usuario || !cosmetico) return { ok: false, error: "Cosmetico invalido" }

  const sincronizado = await sincronizarEquipamientoCosmeticoRemoto(usuario, {
    cosmetico_id: cosmetico.id,
    tipo: cosmetico.tipo,
  })
  if (!sincronizado) return { ok: false, error: "No se pudo equipar el cosmetico." }

  const payload = normalizarCosmeticoLocal({
    usuario_id: usuario,
    cosmetico_id: cosmetico.id,
    tipo: cosmetico.tipo,
    rareza: cosmetico.rareza,
    equipado: true,
    created_at: new Date().toISOString(),
    nombre: cosmetico.nombre,
    categoria: cosmetico.categoria,
    diseno: cosmetico.diseno,
    rareza_visual: cosmetico.rareza,
  })

  guardarCosmeticoLocal(usuario, payload)
  return { ok: true, cosmetico: payload, sincronizado }
}

async function obtenerCosmeticoCompradoParaEquipar(usuario, cosmeticoId) {
  if (!usuario || !cosmeticoId) return null

  const local = leerCosmeticoLocal(usuario, null)
  if (local?.cosmetico_id === cosmeticoId) return local

  const { data, error } = await supabase
    .from("usuario_cosmeticos")
    .select("usuario_id,cosmetico_id,tipo,rareza,equipado,created_at")
    .eq("usuario_id", usuario)
    .eq("cosmetico_id", cosmeticoId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo resolver cosmetico comprado", error)
    return null
  }

  return data ? (await enriquecerCosmeticosRemotos([data]))[0] : null
}

export async function desequiparCosmetico(usuario, tipo = "fondo") {
  const tipoLimpio = String(tipo || "fondo").trim()
  if (!usuario || !tipoLimpio) return { ok: false, error: "Cosmetico invalido" }

  const sincronizado = await sincronizarDesequipamientoCosmeticoRemoto(usuario, tipoLimpio)
  if (!sincronizado) return { ok: false, error: "No se pudo desequipar el cosmetico." }

  quitarCosmeticoLocal(usuario, tipoLimpio)
  return { ok: true, sincronizado }
}

async function sincronizarDesequipamientoCosmeticoRemoto(usuario, tipo) {
  const resultado = await actualizarCosmeticoInventarioRemoto(usuario, {
    accion: "desequipar",
    tipo,
  })

  if (!resultado.ok) {
    console.warn("No se pudo desequipar cosmetico en Supabase", resultado.error || resultado.message)
    return false
  }

  return true
}

async function sincronizarEquipamientoCosmeticoRemoto(usuario, payload) {
  const resultado = await actualizarCosmeticoInventarioRemoto(usuario, {
    accion: "equipar",
    cosmeticoId: payload.cosmetico_id,
    tipo: payload.tipo,
  })

  if (!resultado.ok) {
    console.warn("No se pudo equipar cosmetico en Supabase", resultado.error || resultado.message)
    return false
  }

  return true
}

async function actualizarCosmeticoInventarioRemoto(usuario, { accion, cosmeticoId = null, tipo = null } = {}) {
  const codigo = (localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || "").trim()
  if (!usuario || !codigo) return { ok: false, message: "Vuelve a iniciar sesion." }

  try {
    const { data, error } = await supabase.rpc("actualizar_cosmetico_inventario", {
      p_usuario: usuario,
      p_codigo: codigo,
      p_accion: accion,
      p_cosmetico_id: cosmeticoId,
      p_tipo: tipo,
    })

    if (error || data?.ok !== true) {
      return { ok: false, message: data?.mensaje || error?.message || "No se pudo actualizar el cosmetico.", error }
    }

    return { ok: true, data }
  } catch (error) {
    return { ok: false, message: "No se pudo actualizar el cosmetico.", error }
  }
}

export async function obtenerCosmeticoEquipado(usuario, tipoPreferido = "fondo") {
  const local = leerCosmeticoLocal(usuario, tipoPreferido)
  if (!usuario) return local
  if (!tipoPreferido) return await obtenerCualquierCosmeticoEquipado(usuario)
  if (cosmeticoLocalReciente(local)) return local

  const { data, error } = await supabase
    .from("usuario_cosmeticos")
    .select("cosmetico_id,tipo,rareza,equipado,created_at")
    .eq("usuario_id", usuario)
    .eq("equipado", true)
    .eq("tipo", tipoPreferido)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo cargar cosmetico equipado", error)
    return local
  }

  if (data) {
    const remoto = (await enriquecerCosmeticosRemotos([data]))[0]
    if (cosmeticoLocalMasReciente(local, remoto)) return local
    guardarCosmeticoLocal(usuario, remoto)
    return remoto
  }

  return local
}

export function obtenerMonedas(usuario) {
  if (!usuario) return 0
  const monedas = Number(leerObjeto(MONEDAS_LOCAL_KEY)[usuario])
  if (Number.isFinite(monedas) && monedas >= 0) return monedas
  guardarMonedas(usuario, 0)
  return 0
}

export function sumarMonedas(usuario, cantidad, detalle = {}) {
  if (!usuario) return 0
  const monto = Math.max(0, Math.trunc(Number(cantidad) || 0))
  if (!monto) return obtenerMonedas(usuario)
  const nuevoSaldo = obtenerMonedas(usuario) + monto
  guardarMonedas(usuario, nuevoSaldo)
  guardarMovimientoMonedas(usuario, "ganancia", monto, detalle)
  guardarMonedasRemotas(usuario, nuevoSaldo)
  return nuevoSaldo
}

export function descontarMonedas(usuario, costo, detalle = {}) {
  const monedas = obtenerMonedas(usuario)
  if (monedas < costo) return false
  const nuevoSaldo = monedas - costo
  guardarMonedas(usuario, nuevoSaldo)
  guardarMovimientoMonedas(usuario, "compra", -Math.max(0, Number(costo) || 0), detalle)
  guardarMonedasRemotas(usuario, nuevoSaldo)
  return true
}

export async function comprarMembresiaVip(usuario, planId) {
  const plan = PLANES_VIP.find((item) => item.id === planId)
  const codigo = (localStorage.getItem(SAVED_UNIQUE_CODE_KEY) || "").trim()

  if (!usuario || !codigo) {
    return { ok: false, message: "Vuelve a iniciar sesion para comprar VIP." }
  }

  if (!plan) {
    return { ok: false, message: "Plan VIP invalido." }
  }

  try {
    const { data, error } = await supabase.rpc("comprar_membresia_vip", {
      p_usuario: usuario,
      p_codigo: codigo,
      p_plan: plan.id,
    })

    if (error || data?.ok === false) {
      console.warn("No se pudo comprar membresia VIP", error || data)
      return {
        ok: false,
        message: data?.mensaje || error?.message || "No se pudo activar VIP.",
        saldoNuevo: data?.saldoNuevo,
      }
    }

    if (Number.isFinite(Number(data?.saldoNuevo))) {
      guardarMonedas(usuario, data.saldoNuevo)
      guardarMovimientoMonedas(usuario, data.alreadyPermanent ? "vip" : "compra", data.alreadyPermanent ? 0 : -plan.precio, {
        tipo: "vip",
        id: plan.id,
        key: `vip:${plan.id}:${data?.membership?.updated_at || Date.now()}`,
      })
      emitirCambioMonedas(usuario)
    }

    return {
      ok: true,
      plan,
      message: data?.mensaje || "Membresia VIP activada.",
      membership: data?.membership || null,
      saldoNuevo: data?.saldoNuevo,
      alreadyPermanent: data?.alreadyPermanent === true,
    }
  } catch (error) {
    console.warn("Error comprando membresia VIP", error)
    return { ok: false, message: "No se pudo activar VIP." }
  }
}

export async function sincronizarMonedasUsuario(usuario) {
  if (!usuario) return obtenerMonedas(usuario)
  const { data, error } = await supabase
    .from("usuario_monedas")
    .select("saldo")
    .eq("usuario_id", usuario)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo sincronizar monedas remotas", error)
    return obtenerMonedas(usuario)
  }

  if (data) {
    guardarMonedas(usuario, data.saldo)
    emitirCambioMonedas(usuario)
  } else {
    guardarMonedasRemotas(usuario, obtenerMonedas(usuario))
  }
  return obtenerMonedas(usuario)
}

export function iniciarSincronizacionRecompensasUsuario(usuario, onChange = null) {
  if (!usuario || canalesRecompensasUsuario.has(usuario)) return null

  const canal = supabase
    .channel(`recompensas-usuario-${usuario}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "usuario_monedas", filter: `usuario_id=eq.${usuario}` }, async (payload) => {
      if (payload.new?.saldo !== undefined) guardarMonedas(usuario, payload.new.saldo)
      emitirCambioMonedas(usuario)
      if (typeof onChange === "function") onChange({ tipo: "monedas", payload })
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "usuario_boosters", filter: `usuario_id=eq.${usuario}` }, (payload) => {
      if (typeof onChange === "function") onChange({ tipo: "booster", payload })
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "usuario_cosmeticos", filter: `usuario_id=eq.${usuario}` }, (payload) => {
      if (typeof onChange === "function") onChange({ tipo: "cosmetico", payload })
    })
    .subscribe()

  canalesRecompensasUsuario.set(usuario, canal)
  sincronizarMonedasUsuario(usuario)
  return canal
}

export function obtenerHistorialMonedas(usuario) {
  if (!usuario) return []
  const movimientos = leerObjeto(MONEDAS_HISTORIAL_KEY)[usuario]
  return Array.isArray(movimientos) ? movimientos : []
}

export function calcularRecompensaMonedas({ origen = "torneo", posicion = null, resultadoNivel = null } = {}) {
  const origenNormalizado = origen === "solitario" ? "nivel" : origen
  const esNivel = origenNormalizado === "nivel"
  const base = esNivel
    ? resultadoNivel?.newlyCompleted ? RECOMPENSAS_MONEDAS.nivel : 0
    : origenNormalizado === "minitorneo" ? RECOMPENSAS_MONEDAS.minitorneo : RECOMPENSAS_MONEDAS.torneo
  const bonus = esNivel ? 0 : RECOMPENSAS_MONEDAS.posicion[Number(posicion)] || 0
  return {
    base,
    bonus,
    total: base + bonus,
    origen: origenNormalizado,
  }
}

export async function registrarMonedasPorActividad(usuario, { juego, origen = "torneo", posicion = null, resultadoNivel = null, accionKey = null } = {}) {
  if (!usuario) return 0
  const recompensa = calcularRecompensaMonedas({ origen, posicion, resultadoNivel })
  if (!recompensa.total) return obtenerMonedas(usuario)
  const bonusRango = obtenerBonusRangoActivo(usuario)
  const recompensaConRango = aplicarBonusMonedas(recompensa.total, bonusRango)
  const boosterMonedas = await obtenerBoosterMonedasActivo(usuario)
  const recompensaConBooster = aplicarBoosterMonedas(recompensaConRango.total, boosterMonedas)
  const bonusEventoMonedas = await obtenerBonusMonedasEvento(juego)
  const recompensaConEvento = aplicarBoosterMonedas(recompensaConBooster.total, { multiplicador: bonusEventoMonedas })
  const key = accionKey || `${recompensa.origen}:${juego || "actividad"}:${Date.now()}`
  const historial = leerObjeto(MONEDAS_HISTORIAL_KEY)
  const movimientos = Array.isArray(historial[usuario]) ? historial[usuario] : []
  if (movimientos.some((movimiento) => movimiento.key === key)) return obtenerMonedas(usuario)
  return sumarMonedas(usuario, recompensaConEvento.total, {
    key,
    juego,
    origen: recompensa.origen,
    posicion,
    recompensaBase: recompensa.base,
    bonusPosicion: recompensa.bonus,
    bonusRango: recompensaConRango.bonusRango,
    bonusRangoPorcentaje: bonusRango.monedas,
    boosterMonedas: boosterMonedas?.multiplicador || 1,
    bonusBoosterMonedas: recompensaConBooster.bonusBooster,
    eventoMonedas: bonusEventoMonedas,
    bonusEventoMonedas: recompensaConEvento.bonusBooster,
    boosterMonedasId: boosterMonedas?.booster_id || null,
    rangoActivo: bonusRango.titulo,
    motivo: recompensa.origen === "nivel" ? "nivel_completado" : `${recompensa.origen}_completado`,
    nivel: resultadoNivel?.level?.id || null,
  })
}

export const obtenerMonedasDemo = obtenerMonedas
export const descontarMonedasDemo = descontarMonedas

export function tiempoRestante(fechaFin, ahora = Date.now()) {
  const restante = Date.parse(fechaFin) - Number(ahora)
  if (!Number.isFinite(restante) || restante <= 0) return "Expirado"
  const dias = Math.floor(restante / 86400000)
  const horas = Math.floor((restante % 86400000) / 3600000)
  const minutos = Math.floor((restante % 3600000) / 60000)
  if (dias > 0) return `${dias}d ${horas}h`
  if (horas > 0) return `${horas}h ${minutos}m`
  return `${Math.max(1, minutos)}m`
}

function aplicarBoosterMonedas(cantidad, booster) {
  const base = Math.max(0, Math.trunc(Number(cantidad) || 0))
  const multiplicador = Math.max(1, Number(booster?.multiplicador) || 1)
  const total = Math.floor(base * multiplicador)
  return {
    base,
    multiplicador,
    bonusBooster: Math.max(0, total - base),
    total,
  }
}

export function rarezaEtiqueta(rareza) {
  return RAREZAS_PREMIUM.find((item) => item.nombre === rareza)?.etiqueta || rareza || "Normal"
}

export function rarezaClase(rareza) {
  return RAREZAS_PREMIUM.find((item) => item.nombre === rareza)?.clase || "normal"
}

export function resolverCosmeticoCatalogo(id, datos = null) {
  const slug = String(id || datos?.slug || datos?.cosmetico_id || "").trim().toLowerCase()
  const legacy = COSMETICOS.find((item) => item.id === slug)
  if (legacy) return datos ? aplicarDatosCatalogoCosmetico(legacy, datos) : legacy

  const matchNuevo = slug.match(/^(fondo|id|marco)_(normal|raro|epico|legendario|mitico|prohibido)_(\d{3})$/)
  if (!matchNuevo) {
    return datos?.tipoProducto === "cosmetico" || datos?.tipo === "cosmetico" || ["fondo", "id", "marco", ...TIPOS_SKIN_CRICKET].includes(datos?.tipo) || ["fondo", "id", "marco", ...TIPOS_SKIN_CRICKET].includes(datos?.familia)
      ? crearCosmeticoCatalogoGenerico(slug, datos)
      : null
  }

  const [, tipo, rarezaSlug, numeroTexto] = matchNuevo
  const numero = Math.max(1, Math.min(999, Number(numeroTexto) || 1))
  const rareza = rarezaDesdeSlug(rarezaSlug)
  const rarezaIndex = Math.max(0, ORDEN_RAREZAS_TIENDA.indexOf(rareza))
  const tipoOffset = { fondo: 0, id: 137, marco: 281 }[tipo] || 0
  const index = rarezaIndex * 100 + numero - 1
  const intensidad = ((numero + rarezaIndex * 3) % 10) + 1
  const baseNombre = NUCLEOS_NOMBRE[(index + tipoOffset) % NUCLEOS_NOMBRE.length]
  const forma = FORMAS_NOMBRE[(index * 7 + tipoOffset) % FORMAS_NOMBRE.length]
  const precio = precioCosmetico(tipo, rareza)
  const diseno = crearDisenoCosmetico(tipo, rareza, index, intensidad)

  return aplicarDatosCatalogoCosmetico({
    id: slug,
    tipo,
    categoria: categoriaCosmetico(tipo),
    nombre: forma.replace("{base}", baseNombre),
    descripcion: descripcionCosmetico(tipo, rareza, index, diseno),
    rareza,
    precio: precio.monedas,
    precioReal: precio.real,
    etiqueta: precio.etiqueta,
    diseno,
  }, datos)
}

export function esSkinCricket(cosmetico) {
  return TIPOS_SKIN_CRICKET.includes(String(cosmetico?.tipo || cosmetico?.familia || "").trim().toLowerCase())
}

export function obtenerAssetSkinCricket(cosmetico) {
  if (!esSkinCricket(cosmetico)) return ""
  return String(cosmetico?.metadata?.asset_url || cosmetico?.assetUrl || "").trim()
}

function crearSkinCricket(tipo, variante, nombre, descripcion, rareza, archivo) {
  const precio = precioCosmetico(tipo, rareza)
  return {
    id: `${tipo}_${variante}`,
    tipo,
    categoria: tipo === "bate_cricket" ? "Bates Cricket" : "Pelotas Cricket",
    nombre,
    descripcion,
    rareza,
    precio: precio.monedas,
    precioReal: precio.real,
    etiqueta: precio.etiqueta,
    diseno: { patron: variante, brillo: rareza === "Legendario" ? 8 : rareza === "Epico" ? 6 : rareza === "Raro" ? 4 : 2 },
    metadata: {
      cosmetico_clave: `${tipo}:${variante}`,
      asset_url: `juegos/cricketarcade/imag/optimizadas/${archivo}`,
      catalogo_origen: "CRICKET_SKINS",
    },
  }
}

function crearCosmeticoCatalogoGenerico(slug, datos = {}) {
  const tipo = datos?.familia || datos?.tipo || "fondo"
  const rareza = datos?.rareza || "Normal"
  const precio = precioCosmetico(tipo, rareza)
  const diseno = crearDisenoCosmetico(tipo, rareza, Math.abs(hashTextoLigero(slug)) % 600, 5)
  return aplicarDatosCatalogoCosmetico({
    id: slug,
    tipo,
    categoria: categoriaCosmetico(tipo),
    nombre: slug || "Cosmetico de catalogo",
    descripcion: "Cosmetico registrado en catalogo remoto.",
    rareza,
    precio: precio.monedas,
    precioReal: precio.real,
    etiqueta: precio.etiqueta,
    diseno,
  }, datos)
}

function categoriaCosmetico(tipo) {
  if (tipo === "id") return "IDs especiales"
  if (tipo === "marco") return "Marcos epicos"
  if (tipo === "bate_cricket") return "Bates Cricket"
  if (tipo === "pelota_cricket") return "Pelotas Cricket"
  return "Fondos competitivos"
}

function aplicarDatosCatalogoCosmetico(base, datos = null) {
  if (!datos) return base
  const metadata = datos.metadata || base.metadata
  return {
    ...base,
    nombre: datos.nombre || base.nombre,
    descripcion: datos.descripcion || base.descripcion,
    rareza: datos.rareza || base.rareza,
    precio: Number(datos.precio ?? datos.precio_monedas ?? base.precio ?? 0),
    precioReal: datos.precioReal || datos.precio_real || base.precioReal,
    etiqueta: datos.etiqueta || base.etiqueta,
    metadata,
    diseno: aplicarVisualCatalogo(base.diseno, base.tipo || datos.familia || datos.tipo, metadata),
  }
}

function aplicarVisualCatalogo(disenoBase, tipo, metadata = {}) {
  const visual = metadata?.visual && typeof metadata.visual === "object" ? metadata.visual : null
  if (!visual) return disenoBase

  const diseno = clonarJson(disenoBase || { patron: "catalogo", brillo: 1 })
  const numero = (valor, min, max) => {
    const limpio = Number(valor)
    if (!Number.isFinite(limpio)) return null
    return Math.max(min, Math.min(max, limpio))
  }

  if (visual.patron) diseno.patron = String(visual.patron)
  if (numero(visual.brillo, 1, 10) !== null) diseno.brillo = numero(visual.brillo, 1, 10)

  const rama = tipo === "fondo" ? diseno.fondo : tipo === "id" ? diseno.id : tipo === "marco" ? diseno.marco : null
  if (rama) {
    const hue = numero(visual.hue, 0, 360)
    const accent = numero(visual.accent, 0, 360)
    const luz = numero(visual.luz, 1, 100)
    const profundidad = numero(visual.profundidad, 1, 100)
    if (hue !== null) rama.hue = hue
    if (accent !== null) rama.accent = accent
    if (luz !== null) rama.luz = luz
    if (profundidad !== null) rama.profundidad = profundidad
  }

  if (tipo === "fondo" && diseno.fondo) {
    aplicarEnterosVisual(diseno.fondo, visual, [
      "layout",
      "textura",
      "simbolo",
      "panel",
      "energia",
      "fractura",
      "reliquia",
    ], 40)
    aplicarNumerosVisual(diseno.fondo, visual, ["focoX", "focoY"], 0, 100)
    aplicarNumerosVisual(diseno.fondo, visual, ["angulo"], 0, 360)
  }

  if (tipo === "id" && diseno.id) {
    aplicarEnterosVisual(diseno.id, visual, [
      "silueta",
      "forma",
      "tamano",
      "corte",
      "placa",
      "esquina",
      "borde",
      "linea",
      "panel",
      "simbolo",
      "geometria",
      "textura",
      "reflejo",
      "energia",
      "pulso",
    ], 40)
  }

  if (tipo === "marco" && diseno.marco) {
    aplicarEnterosVisual(diseno.marco, visual, [
      "estructura",
      "esquina",
      "borde",
      "linea",
      "panel",
      "textura",
      "corte",
      "pulso",
      "glifo",
      "aura",
      "reliquia",
      "anomalia",
    ], 40)
  }

  function aplicarEnterosVisual(rama, origen, campos, maximo) {
    campos.forEach((campo) => {
      const valor = numero(origen[campo], 0, maximo)
      if (valor !== null) rama[campo] = Math.trunc(valor)
    })
  }

  function aplicarNumerosVisual(rama, origen, campos, minimo, maximo) {
    campos.forEach((campo) => {
      const valor = numero(origen[campo], minimo, maximo)
      if (valor !== null) rama[campo] = valor
    })
  }

  return diseno
}

function clonarJson(valor) {
  try {
    return JSON.parse(JSON.stringify(valor || {}))
  } catch {
    return {}
  }
}

function rarezaDesdeSlug(valor) {
  return {
    normal: "Normal",
    raro: "Raro",
    epico: "Epico",
    legendario: "Legendario",
    mitico: "Mitico",
    prohibido: "Prohibido",
  }[String(valor || "").toLowerCase()] || "Normal"
}

function hashTextoLigero(texto) {
  return String(texto || "").split("").reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
}

function generarCosmeticos(tipo, cantidad) {
  const offsetTipo = { fondo: 0, id: 137, marco: 281 }[tipo] || 0
  return Array.from({ length: cantidad }, (_, index) => {
    const numero = index + 1
    const rareza = RAREZAS_PREMIUM[Math.min(RAREZAS_PREMIUM.length - 1, Math.floor(index / Math.ceil(cantidad / RAREZAS_PREMIUM.length)))]
    const intensidad = (index % 10) + 1
    const base = NUCLEOS_NOMBRE[(index + offsetTipo) % NUCLEOS_NOMBRE.length]
    const forma = FORMAS_NOMBRE[(index * 7 + offsetTipo) % FORMAS_NOMBRE.length]
    const nombre = forma.replace("{base}", base)
    const precio = precioCosmetico(tipo, rareza.nombre)
    const diseno = crearDisenoCosmetico(tipo, rareza.nombre, index, intensidad)
    return {
      id: `${tipo}_${String(numero).padStart(3, "0")}`,
      tipo,
      categoria: tipo === "id" ? "IDs especiales" : tipo === "marco" ? "Marcos epicos" : "Fondos competitivos",
      nombre,
      descripcion: descripcionCosmetico(tipo, rareza.nombre, index, diseno),
      rareza: rareza.nombre,
      precio: precio.monedas,
      precioReal: precio.real,
      etiqueta: precio.etiqueta,
      diseno,
    }
  })
}

function descripcionCosmetico(tipo, rareza, index, diseno) {
  if (tipo === "marco" && DESCRIPCIONES_MARCOS_INICIALES[rareza]) {
    const indiceRareza = index % Math.ceil(100 / RAREZAS_PREMIUM.length)
    const descripcion = DESCRIPCIONES_MARCOS_INICIALES[rareza][indiceRareza]
    if (descripcion) return descripcion
  }

  if (tipo === "fondo" && DESCRIPCIONES_FONDOS_INICIALES[rareza]) {
    const indiceRareza = index % Math.ceil(100 / RAREZAS_PREMIUM.length)
    const descripcion = DESCRIPCIONES_FONDOS_INICIALES[rareza][indiceRareza]
    if (descripcion) return descripcion
  }

  if (tipo === "id" && DESCRIPCIONES_IDS_INICIALES[rareza]) {
    const indiceRareza = index % Math.ceil(100 / RAREZAS_PREMIUM.length)
    const descripcion = DESCRIPCIONES_IDS_INICIALES[rareza][indiceRareza]
    if (descripcion) return descripcion
  }

  const banco = DESCRIPCIONES_COSMETICAS[tipo] || DESCRIPCIONES_COSMETICAS.fondo
  const tema = String(diseno?.tema || TEMAS_VISUALES[index % TEMAS_VISUALES.length]).toLowerCase()
  const patron = PATRONES_DESCRIPCION[diseno?.patron] || diseno?.patron || "energia"
  const inicio = banco.inicio[(index * 3 + rareza.length) % banco.inicio.length]
  const cierre = banco.cierre[(index * 5 + tipo.length) % banco.cierre.length]
  const intensidad = Number(diseno?.brillo || 1)
  const tono = intensidad >= 8 ? "intenso" : intensidad >= 5 ? "afilado" : "sobrio"

  return `${inicio} ${tema} de ${patron} ${tono}; ${cierre}.`
}

function crearDisenoCosmetico(tipo, rareza, index, intensidad) {
  const base = {
    tema: TEMAS_VISUALES[index % TEMAS_VISUALES.length],
    brillo: intensidad,
    patron: ["lineas", "pulso", "anillo", "fragmentos", "halo"][index % 5],
  }

  if (tipo === "marco") {
    const perfilesMarco = {
      Normal: { hues: [204, 212, 198, 188, 220], accents: [190, 202, 184, 196, 210], luz: 18, luzVar: 16, profundidad: 30, profVar: 18, pulso: false },
      Raro: { hues: [192, 184, 174, 166, 202], accents: [188, 178, 160, 196, 172], luz: 38, luzVar: 24, profundidad: 48, profVar: 24, pulso: true },
      Epico: { hues: [268, 276, 286, 252, 296], accents: [292, 264, 318, 238, 284], luz: 42, luzVar: 26, profundidad: 58, profVar: 24, pulso: true },
      Legendario: { hues: [42, 36, 28, 4, 218], accents: [48, 38, 12, 0, 210], luz: 52, luzVar: 28, profundidad: 66, profVar: 22, pulso: true },
      Mitico: { hues: [194, 178, 268, 154, 210], accents: [184, 166, 286, 142, 224], luz: 48, luzVar: 28, profundidad: 70, profVar: 24, pulso: true },
      Prohibido: { hues: [270, 292, 352, 196, 0], accents: [188, 336, 0, 214, 286], luz: 34, luzVar: 26, profundidad: 78, profVar: 18, pulso: true },
    }
    const perfil = perfilesMarco[rareza] || perfilesMarco.Normal
    return {
      ...base,
      marco: {
        estructura: index % 16,
        esquina: (index * 5 + 2) % 14,
        borde: (index * 7 + 3) % 12,
        linea: (index * 11 + 1) % 12,
        panel: (index * 13 + 4) % 10,
        textura: (index * 17 + 6) % 10,
        luz: perfil.luz + ((index * 7) % perfil.luzVar),
        profundidad: perfil.profundidad + ((index * 11) % perfil.profVar),
        hue: perfil.hues[index % perfil.hues.length] + ((index * 3) % 10),
        accent: perfil.accents[index % perfil.accents.length] + ((index * 5) % 16),
        corte: (index * 19 + 5) % 12,
        pulso: perfil.pulso ? (index * 23 + intensidad) % 8 : -1,
        glifo: (index * 29 + 7) % 12,
        aura: (index * 31 + 3) % 10,
        reliquia: (index * 37 + 9) % 12,
        anomalia: (index * 41 + intensidad) % 10,
      },
    }
  }

  if (tipo === "id") {
    const perfilesId = {
      Normal: {
        hues: [214, 206, 198, 220, 188],
        accents: [190, 198, 184, 204, 212],
        luz: 16,
        luzVar: 12,
        profundidad: 24,
        profVar: 14,
        pulso: false,
        pools: {
          silueta: [0, 1, 2, 4, 5, 12],
          forma: [0, 1, 2, 5, 6, 11],
          tamano: [0, 1, 2, 3, 9],
          corte: [0, 1, 2, 5, 8, 10],
          placa: [2, 5, 7, 10],
          esquina: [0, 1, 4, 5, 10],
          borde: [0, 1, 2, 6, 10],
          linea: [0, 1, 2, 5, 7, 10],
          panel: [0, 1, 2, 5, 6],
          simbolo: [0, 2, 5, 7, 10, 12],
          geometria: [0, 1, 5, 8, 9],
          textura: [0, 1, 2, 5, 9],
          reflejo: [0, 5, 8],
          energia: [0, 4],
        },
      },
      Raro: {
        hues: [202, 192, 184, 174, 166],
        accents: [188, 180, 170, 196, 162],
        luz: 30,
        luzVar: 18,
        profundidad: 42,
        profVar: 18,
        pulso: true,
        pools: {
          silueta: [3, 6, 7, 8, 10, 11],
          forma: [1, 2, 3, 4, 8, 9],
          tamano: [1, 2, 4, 5, 6],
          corte: [1, 3, 4, 6, 7, 11],
          placa: [1, 3, 4, 6, 8],
          esquina: [1, 2, 3, 6, 7, 11],
          borde: [1, 2, 5, 7, 8, 9, 12],
          linea: [2, 3, 4, 6, 8, 9, 12],
          panel: [2, 3, 4, 7, 8],
          simbolo: [1, 3, 4, 6, 8, 9, 13],
          geometria: [1, 3, 4, 6, 7, 10],
          textura: [2, 3, 4, 6, 7, 10],
          reflejo: [1, 2, 3, 5, 6, 8],
          energia: [1, 2, 3, 5, 8],
        },
      },
      Epico: {
        hues: [262, 274, 286, 252, 296],
        accents: [292, 316, 278, 238, 304],
        luz: 36,
        luzVar: 22,
        profundidad: 54,
        profVar: 22,
        pulso: true,
        pools: {
          silueta: [9, 13, 14, 15, 16, 17, 18, 19],
          forma: [3, 4, 7, 8, 9, 10, 12],
          tamano: [2, 4, 5, 6, 7, 8],
          corte: [3, 4, 6, 7, 9, 11],
          placa: [1, 3, 4, 6, 9, 11, 12],
          esquina: [2, 3, 5, 7, 8, 10, 12],
          borde: [4, 5, 7, 8, 9, 12, 14, 15],
          linea: [3, 4, 5, 8, 9, 11, 13, 14],
          panel: [3, 4, 7, 8, 9, 10, 12],
          simbolo: [1, 3, 4, 6, 8, 9, 11, 13, 14],
          geometria: [3, 4, 6, 7, 8, 10, 11],
          textura: [3, 4, 6, 7, 8, 10, 11, 12],
          reflejo: [1, 2, 4, 6, 7, 8, 10],
          energia: [2, 3, 5, 6, 7, 8, 10],
        },
      },
      Legendario: {
        hues: [42, 36, 28, 8, 216],
        accents: [48, 38, 14, 2, 210],
        luz: 48,
        luzVar: 22,
        profundidad: 64,
        profVar: 22,
        pulso: true,
        pools: {
          silueta: [18, 19, 20, 21, 22, 23],
          forma: [4, 8, 9, 10, 12, 14, 15],
          tamano: [3, 5, 6, 7, 8],
          corte: [4, 7, 9, 10, 11, 12, 13],
          placa: [9, 11, 12, 13, 14, 15],
          esquina: [5, 8, 9, 10, 12, 13],
          borde: [12, 13, 14, 15, 16, 17],
          linea: [8, 9, 11, 13, 14, 15],
          panel: [8, 9, 10, 11, 12, 13],
          simbolo: [8, 9, 11, 13, 14, 15, 16],
          geometria: [6, 8, 10, 11, 12, 13],
          textura: [7, 8, 10, 11, 12, 13],
          reflejo: [4, 6, 7, 8, 9, 10, 11],
          energia: [3, 5, 6, 7, 8, 10, 11],
        },
      },
      Mitico: {
        hues: [184, 198, 166, 270, 154],
        accents: [174, 204, 150, 286, 222],
        luz: 44,
        luzVar: 24,
        profundidad: 68,
        profVar: 22,
        pulso: true,
        pools: {
          silueta: [20, 21, 23, 24, 25, 26],
          forma: [7, 9, 10, 12, 14, 15, 16],
          tamano: [4, 6, 7, 8, 9],
          corte: [7, 9, 11, 12, 13, 14],
          placa: [12, 13, 14, 15, 16, 17],
          esquina: [8, 9, 11, 12, 13, 14],
          borde: [15, 16, 17, 18, 19],
          linea: [9, 11, 13, 14, 15, 16],
          panel: [10, 11, 12, 13, 14],
          simbolo: [13, 14, 15, 16, 17, 18],
          geometria: [10, 11, 12, 13, 14],
          textura: [10, 11, 12, 13, 14],
          reflejo: [7, 8, 9, 10, 11, 12],
          energia: [6, 7, 8, 10, 11, 12],
        },
      },
      Prohibido: {
        hues: [268, 292, 352, 196, 0],
        accents: [188, 336, 0, 214, 286],
        luz: 30,
        luzVar: 22,
        profundidad: 76,
        profVar: 18,
        pulso: true,
        pools: {
          silueta: [24, 25, 26, 27, 28, 29],
          forma: [10, 12, 14, 15, 16, 17],
          tamano: [4, 6, 7, 8, 9],
          corte: [9, 11, 12, 13, 14, 15],
          placa: [14, 15, 16, 17, 18, 19],
          esquina: [9, 11, 12, 13, 14, 15],
          borde: [17, 18, 19, 20, 21],
          linea: [11, 13, 14, 15, 16, 17],
          panel: [11, 12, 13, 14, 15],
          simbolo: [15, 16, 17, 18, 19, 20],
          geometria: [11, 12, 13, 14, 15],
          textura: [11, 12, 13, 14, 15],
          reflejo: [8, 9, 10, 11, 12, 13],
          energia: [8, 10, 11, 12, 13],
        },
      },
    }
    const perfil = perfilesId[rareza] || perfilesId.Normal
    const pick = (nombre, paso, salto = 0) => {
      const pool = perfil.pools[nombre]
      const spread = index * paso + intensidad * (salto + 1) + salto
      return pool[((spread % pool.length) + pool.length) % pool.length]
    }
    return {
      ...base,
      id: {
        silueta: pick("silueta", 7, 1),
        forma: pick("forma", 5, 3),
        tamano: pick("tamano", 3, 5),
        corte: pick("corte", 11, 7),
        placa: pick("placa", 13, 2),
        esquina: pick("esquina", 17, 4),
        profundidad: perfil.profundidad + ((index * 13) % perfil.profVar),
        borde: pick("borde", 19, 6),
        linea: pick("linea", 23, 8),
        panel: pick("panel", 29, 10),
        simbolo: pick("simbolo", 31, 12),
        geometria: pick("geometria", 37, 14),
        textura: pick("textura", 41, 16),
        reflejo: pick("reflejo", 43, 18),
        energia: pick("energia", 47, 20),
        pulso: perfil.pulso ? (index * 53 + intensidad) % 8 : -1,
        hue: perfil.hues[index % perfil.hues.length] + ((index * 3) % 9),
        accent: perfil.accents[index % perfil.accents.length] + ((index * 5) % 14),
        luz: perfil.luz + ((index * 7) % perfil.luzVar),
      },
    }
  }

  if (tipo !== "fondo") return base

  const perfilesFondo = {
    Normal: { paleta: "normal", hue: 198 + ((index * 11) % 28), accent: 188 + ((index * 7) % 26), luz: 12 + ((index * 5) % 24), profundidad: 28 + ((index * 9) % 28) },
    Raro: { paleta: "rare", hue: 184 + ((index * 19) % 42), accent: 166 + ((index * 13) % 54), luz: 26 + ((index * 7) % 48), profundidad: 38 + ((index * 11) % 34) },
    Epico: { paleta: "epic", hue: 252 + ((index * 17) % 54), accent: 286 + ((index * 23) % 42), luz: 24 + ((index * 11) % 42), profundidad: 48 + ((index * 13) % 34) },
    Legendario: { paleta: "legendary", hue: 36 + ((index * 13) % 24), accent: [42, 32, 8, 48, 214][index % 5], luz: 34 + ((index * 7) % 38), profundidad: 56 + ((index * 17) % 30) },
    Mitico: { paleta: "mythic", hue: [184, 196, 172, 268, 154][index % 5] + ((index * 7) % 16), accent: [174, 204, 278, 150, 226][index % 5], luz: 30 + ((index * 13) % 42), profundidad: 62 + ((index * 11) % 26) },
    Prohibido: { paleta: "forbidden", hue: [268, 286, 352, 196, 0][index % 5] + ((index * 5) % 12), accent: [186, 354, 280, 210, 0][index % 5], luz: 18 + ((index * 17) % 34), profundidad: 70 + ((index * 19) % 24) },
  }

  const fondoBase = perfilesFondo[rareza]
  if (!fondoBase) return base

  return {
    ...base,
    fondo: {
      ...fondoBase,
      layout: index % 12,
      textura: Math.floor(index / 2) % 10,
      simbolo: (index * 5 + 3) % 12,
      panel: (index * 7 + 1) % 8,
      focoX: 18 + ((index * 17) % 64),
      focoY: 16 + ((index * 23) % 62),
      angulo: (index * 37) % 360,
      energia: (index * 11 + intensidad) % 12,
      fractura: (index * 13 + 2) % 10,
      reliquia: (index * 17 + 5) % 9,
    },
  }
}

function precioCosmetico(tipo, rareza) {
  const tipoPrecio = TIPOS_SKIN_CRICKET.includes(tipo) ? "id" : tipo
  return PRECIOS_COSMETICOS[tipoPrecio]?.[rareza] || {
    monedas: RAREZAS_PREMIUM.find((item) => item.nombre === rareza)?.precio || 2000,
    real: "$0.79",
    etiqueta: "Popular",
  }
}

function guardarMonedas(usuario, cantidad) {
  const actuales = leerObjeto(MONEDAS_LOCAL_KEY)
  actuales[usuario] = Math.max(0, Math.trunc(Number(cantidad) || 0))
  localStorage.setItem(MONEDAS_LOCAL_KEY, JSON.stringify(actuales))
}

function guardarMonedasRemotas(usuario, saldo) {
  if (!usuario) return
  supabase
    .from("usuario_monedas")
    .upsert({
      usuario_id: usuario,
      saldo: Math.max(0, Math.trunc(Number(saldo) || 0)),
      updated_at: new Date().toISOString(),
    }, { onConflict: "usuario_id" })
    .then(({ error }) => {
      if (error && error.code !== "42501") console.warn("No se pudo guardar saldo remoto", error)
    })
}

function guardarMovimientoMonedas(usuario, tipo, cantidad, detalle) {
  const historial = leerObjeto(MONEDAS_HISTORIAL_KEY)
  const movimientos = Array.isArray(historial[usuario]) ? historial[usuario] : []
  movimientos.unshift({
    key: detalle?.key || `${tipo}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    tipo,
    cantidad,
    saldo: obtenerMonedas(usuario),
    detalle,
    fecha: new Date().toISOString(),
  })
  historial[usuario] = movimientos.slice(0, 80)
  localStorage.setItem(MONEDAS_HISTORIAL_KEY, JSON.stringify(historial))
}

function leerBoosterLocal(usuario, key = BOOSTER_LOCAL_KEY, catalogo = BOOSTERS_XP) {
  const row = leerObjeto(key)[usuario]
  if (!row || Date.parse(row.fecha_fin) <= Date.now()) return null
  if (!catalogo.some((item) => item.id === row.booster_id)) return null
  return row
}

function guardarBoosterLocal(usuario, booster, key = BOOSTER_LOCAL_KEY) {
  const actuales = leerObjeto(key)
  actuales[usuario] = booster
  localStorage.setItem(key, JSON.stringify(actuales))
}

function esBoosterAdminValido(row, catalogo) {
  const id = String(row?.booster_id || "")
  const multiplicador = Number(row?.multiplicador || 1)
  const esXp = catalogo === BOOSTERS_XP && id.startsWith("admin_xp_")
  const esMonedas = catalogo === BOOSTERS_MONEDAS && id.startsWith("admin_coins_")
  return (esXp || esMonedas) && multiplicador >= 1.2 && multiplicador <= 3.5
}

function enriquecerBoosterInventario(row) {
  const catalogo = [...BOOSTERS_XP, ...BOOSTERS_MONEDAS].find((item) => item.id === row?.booster_id)
  const esXp = Boolean(catalogo ? BOOSTERS_XP.some((item) => item.id === catalogo.id) : String(row?.booster_id || "").startsWith("admin_xp_"))
  const fechaFin = Date.parse(row?.fecha_fin)
  const fechaInicio = Date.parse(row?.fecha_inicio)
  const duracionRemota = Number.isFinite(fechaFin) && Number.isFinite(fechaInicio) ? Math.max(0, fechaFin - fechaInicio) : 0
  const estado = row?.estado === "disponible"
    ? "disponible"
    : row?.activo && Number.isFinite(fechaFin) && fechaFin > Date.now()
      ? "activo"
      : "expirado"

  return {
    ...catalogo,
    ...row,
    nombre: catalogo?.nombre || (esXp ? `Booster XP x${row?.multiplicador || 1}` : `Impulso Monedas x${row?.multiplicador || 1}`),
    tipo_booster: esXp ? "xp" : "monedas",
    duracionMs: Number(row?.duracion_ms || catalogo?.duracionMs || duracionRemota || 0),
    precio: catalogo?.precio || 0,
    estado,
  }
}

function emitirCambioMonedas(usuario) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("monedas:actualizadas", {
    detail: { usuario, saldo: obtenerMonedas(usuario) },
  }))
}

async function obtenerCualquierCosmeticoEquipado(usuario) {
  const { data, error } = await supabase
    .from("usuario_cosmeticos")
    .select("cosmetico_id,tipo,rareza,equipado,created_at")
    .eq("usuario_id", usuario)
    .eq("equipado", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.warn("No se pudo cargar cosmetico equipado alternativo", error)
    return leerCosmeticoLocal(usuario, null)
  }

  if (!data) return leerCosmeticoLocal(usuario, null)
  const remoto = (await enriquecerCosmeticosRemotos([data]))[0]
  const local = leerCosmeticoLocal(usuario, remoto.tipo)
  if (cosmeticoLocalMasReciente(local, remoto)) return local
  guardarCosmeticoLocal(usuario, remoto)
  return remoto
}

export async function hidratarCosmeticosCatalogo(cosmeticos = []) {
  const lista = Array.isArray(cosmeticos) ? cosmeticos : []
  const catalogoPorSlug = await obtenerCosmeticosCatalogoRemoto(lista.map((item) => item?.cosmetico_id || item?.id))
  return lista.map((cosmetico) => {
    const slug = normalizarSlugCosmetico(cosmetico?.cosmetico_id || cosmetico?.id)
    const producto = catalogoPorSlug.get(slug)
    if (!producto) return cosmetico
    return resolverCosmeticoCatalogo(slug, {
      ...producto,
      ...cosmetico,
      metadata: producto.metadata,
      familia: producto.familia || cosmetico?.tipo,
    }) || cosmetico
  })
}

async function enriquecerCosmeticosRemotos(rows = []) {
  const lista = Array.isArray(rows) ? rows : []
  const catalogoPorSlug = await obtenerCosmeticosCatalogoRemoto(lista.map((row) => row?.cosmetico_id))
  return lista.map((row) => enriquecerCosmeticoRemoto(row, catalogoPorSlug.get(normalizarSlugCosmetico(row?.cosmetico_id))))
}

function enriquecerCosmeticoRemoto(row, producto = null) {
  const datos = producto ? { ...producto, ...row, metadata: producto.metadata, familia: producto.familia || row?.tipo } : row
  const catalogo = resolverCosmeticoCatalogo(row?.cosmetico_id, datos)
  return normalizarCosmeticoLocal({
    ...catalogo,
    usuario_id: row?.usuario_id,
    cosmetico_id: row?.cosmetico_id || catalogo?.id,
    tipo: row?.tipo || catalogo?.tipo,
    rareza: catalogo?.rareza || row?.rareza,
    equipado: row?.equipado ?? true,
    rareza_visual: catalogo?.rareza || row?.rareza,
    metadata: producto?.metadata || catalogo?.metadata,
  })
}

async function obtenerCosmeticoCatalogoRemoto(slug) {
  return (await obtenerCosmeticosCatalogoRemoto([slug])).get(normalizarSlugCosmetico(slug)) || null
}

async function obtenerCosmeticosCatalogoRemoto(slugs = []) {
  const ahora = Date.now()
  const unicos = [...new Set(slugs.map(normalizarSlugCosmetico).filter(Boolean))]
  const pendientes = unicos.filter((slug) => {
    const cache = catalogoCosmeticosRemotoCache.get(slug)
    return !cache || ahora - cache.cargadoEn >= CATALOGO_COSMETICOS_CACHE_MS
  })

  for (let index = 0; index < pendientes.length; index += 100) {
    const lote = pendientes.slice(index, index + 100)
    const { data, error } = await supabase
      .from("tienda_productos")
      .select("slug,tipo,familia,rareza,nombre,descripcion,precio_monedas,precio_real,metadata,updated_at")
      .in("slug", lote)

    if (error) {
      console.warn("No se pudo hidratar metadata visual desde tienda_productos", error)
      break
    }

    const encontrados = new Map((data || []).map((producto) => [normalizarSlugCosmetico(producto.slug), producto]))
    lote.forEach((slug) => {
      catalogoCosmeticosRemotoCache.set(slug, { producto: encontrados.get(slug) || null, cargadoEn: ahora })
    })
  }

  return new Map(unicos.map((slug) => [slug, catalogoCosmeticosRemotoCache.get(slug)?.producto || null]))
}

function normalizarSlugCosmetico(valor) {
  return String(valor || "").trim().toLowerCase()
}

function leerCosmeticoLocal(usuario, tipo = "fondo") {
  const valor = leerObjeto(COSMETICOS_LOCAL_KEY)[usuario]
  if (!valor) return null
  if (valor.cosmetico_id) {
    const normalizado = normalizarCosmeticoLocal(valor)
    return !tipo || normalizado.tipo === tipo ? normalizado : null
  }
  if (tipo && valor[tipo]) return normalizarCosmeticoLocal(valor[tipo])
  const primero = Object.values(valor).find((item) => item?.cosmetico_id)
  return primero ? normalizarCosmeticoLocal(primero) : null
}

function guardarCosmeticoLocal(usuario, cosmetico) {
  const actuales = leerObjeto(COSMETICOS_LOCAL_KEY)
  const normalizado = normalizarCosmeticoLocal(cosmetico)
  const previo = actuales[usuario]
  const porTipo = previo && !previo.cosmetico_id && typeof previo === "object" ? previo : {}
  porTipo[normalizado.tipo || "fondo"] = normalizado
  actuales[usuario] = porTipo
  localStorage.setItem(COSMETICOS_LOCAL_KEY, JSON.stringify(actuales))
}

function quitarCosmeticoLocal(usuario, tipo = "fondo") {
  const actuales = leerObjeto(COSMETICOS_LOCAL_KEY)
  const previo = actuales[usuario]
  if (!previo) return

  if (previo.cosmetico_id) {
    const normalizado = normalizarCosmeticoLocal(previo)
    if (normalizado.tipo === tipo) delete actuales[usuario]
  } else if (typeof previo === "object") {
    delete previo[tipo]
    if (!Object.values(previo).some((item) => item?.cosmetico_id)) delete actuales[usuario]
  }

  localStorage.setItem(COSMETICOS_LOCAL_KEY, JSON.stringify(actuales))
}

function normalizarCosmeticoLocal(cosmetico) {
  const catalogo = resolverCosmeticoCatalogo(cosmetico?.cosmetico_id || cosmetico?.id, cosmetico)
  return {
    ...catalogo,
    ...cosmetico,
    cosmetico_id: cosmetico?.cosmetico_id || catalogo?.id || "",
    tipo: cosmetico?.tipo || catalogo?.tipo || "fondo",
    rareza: cosmetico?.rareza_visual || catalogo?.rareza || cosmetico?.rareza || "Normal",
    rareza_visual: cosmetico?.rareza_visual || catalogo?.rareza || cosmetico?.rareza || "Normal",
    equipado: cosmetico?.equipado ?? true,
  }
}

function cosmeticoLocalMasReciente(local, remoto) {
  if (!local?.cosmetico_id || !remoto?.cosmetico_id) return false
  if (local.cosmetico_id === remoto.cosmetico_id) return false
  const fechaLocal = Date.parse(local.created_at || "")
  const fechaRemota = Date.parse(remoto.created_at || "")
  return Number.isFinite(fechaLocal) && (!Number.isFinite(fechaRemota) || fechaLocal > fechaRemota)
}

function cosmeticoLocalReciente(local) {
  if (!local?.cosmetico_id) return false
  const fechaLocal = Date.parse(local.created_at || "")
  return Number.isFinite(fechaLocal) && Date.now() - fechaLocal < 60000
}

function leerObjeto(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") || {}
  } catch {
    return {}
  }
}
