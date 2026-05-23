import { crearIdLibroDesdeTitulo } from './historia-core.js'

export const HISTORIA_READER_URL = 'historia-libro.html'

export const LIBROS_HISTORIA = {
  novato: {
    id: 'novato',
    rankTitle: 'Novato',
    levelFrom: 1,
    levelTo: 25,
    title: 'El Despertar',
    subtitle: 'Una historia continua dentro del Nexus. El jugador despierta como una senal desconocida y debe estabilizar cinco sellos para ser reconocido por el Archivo.',
    phase: '9.1',
    readerUrl: 'historia-novato.html',
    visual: { emblem: 'NV', primary: '#38bdf8', secondary: '#22c55e', accent: '#a78bfa', rgb: '56,189,248' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Novato',
        title: 'El Despertar',
        lines: [
          'El primer tomo de la Biblioteca de Historias abre cuando el Nexus detecta una senal nueva dentro del Archivo.',
          'Esta no es una lista de pruebas sueltas. Es el inicio de una misma historia: despertar, ser medido, sobrevivir al primer sello y descubrir que algo observa desde los libros cerrados.',
        ],
        footer: 'Libro Novato',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Cinco sellos iniciales',
        lines: [
          'Cada capitulo continua la misma ruta dentro del Nexus. Lee la escena, completa la prueba y vuelve al libro para revelar la consecuencia.',
          'Los sellos se desbloquean en orden. El Archivo no permite saltar al siguiente recuerdo hasta que el anterior quede estable.',
        ],
        footer: 'Historia continua',
      },
    ],
    chapters: [
      {
        id: 'activacion',
        number: '01',
        title: 'La Activacion',
        trial: 'Sudoku',
        condition: 'Estabilizar el primer codigo numerico.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Entrada',
            lines: [
              'El jugador desperto sobre una superficie oscura y pulida, tan quieta que parecia hecha de vidrio negro. Encima de el no habia cielo, solo miles de lineas azules moviendose como circuitos vivos.',
              'No recordaba haber entrado alli. Tampoco recordaba haber aceptado una prueba. Frente a sus manos flotaba un libro cerrado, enorme, con una marca luminosa en la portada.',
              'La marca parpadeo una vez. Luego aparecio una frase sobre el metal de la cubierta: nueva senal detectada.',
            ],
          },
          {
            label: 'Lectura',
            lines: [
              'El libro se abrio sin que nadie lo tocara. Sus paginas no estaban hechas de papel, sino de luz comprimida, capas transparentes donde los simbolos cambiaban cada vez que el jugador intentaba leerlos.',
              'Una voz sin sonido recorrio la sala. No venia de ningun lugar y, aun asi, parecia hablarle desde dentro del pecho.',
              'Firma incompleta. Acceso Novato en revision. Estabilice el primer codigo o sera expulsado del Archivo.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La pagina se partio en nueve regiones y cada una encendio casillas vacias. Numeros azules cayeron desde lo alto, pero ninguno se quedaba en su lugar por mas de un instante.',
              'El jugador comprendio la regla antes de que el libro la explicara: el Nexus no queria fuerza, queria orden. Cada numero correcto fijaria una pieza de su identidad.',
              'Si el codigo quedaba completo, el libro aceptaria abrir el primer sello.',
            ],
          },
          {
            label: 'Sello',
            afterTrial: true,
            sealedLines: [
              'La ultima pagina del capitulo esta cubierta por una pelicula azul. El libro permite verla, pero no leerla todavia.',
              'Primero debe completarse la prueba del codigo inicial.',
            ],
            lines: [
              'Cuando el ultimo numero encontro su lugar, la sala dejo de temblar. El libro absorbio el codigo y la marca de la portada dejo de parpadear como una alarma.',
              'Por primera vez, el Nexus no trato al jugador como un intruso. Lo registro como una presencia posible, pequena todavia, pero real.',
              'Al fondo del Archivo se encendio una compuerta. Detras de ella aguardaba una secuencia que no pertenecia a la primera prueba.',
            ],
          },
        ],
      },
      {
        id: 'primer-codigo',
        number: '02',
        title: 'El Primer Codigo',
        trial: 'Matematicas',
        condition: 'Resolver la secuencia que abre la compuerta inicial.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Pulso',
            lines: [
              'La compuerta no tenia manija ni cerradura. Estaba formada por columnas de cifras que subian y bajaban como si respiraran, esperando que alguien encontrara su ritmo.',
              'El jugador dio un paso y las paginas del libro avanzaron solas. Ahora la marca de la portada latia junto a su pulso, copiando cada duda, cada pausa, cada intento de entender el lugar.',
              'El Nexus no parecia curioso. Parecia paciente. Eso era peor.',
            ],
          },
          {
            label: 'Secuencia',
            lines: [
              'Sobre la compuerta aparecio una secuencia rota. Los simbolos se encendian y se apagaban antes de completarse, como si alguien hubiera arrancado partes del calculo original.',
              'El libro escribio una advertencia en el margen: las puertas del Archivo no se abren por permiso. Se abren por precision.',
              'Entonces el jugador escucho algo al otro lado. No fue una palabra. Fue el eco de una respiracion que no era suya.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La secuencia empezo a exigir respuestas. Cada operacion correcta empujaba la compuerta unos centimetros hacia arriba; cada error hacia que el pulso azul perdiera fuerza.',
              'El jugador ya no estaba resolviendo por puntos. Estaba manteniendo abierta la unica salida visible dentro de una biblioteca que podia borrarlo sin ruido.',
              'El segundo sello dependia de que la secuencia aceptara su ritmo.',
            ],
          },
          {
            label: 'Eco',
            afterTrial: true,
            sealedLines: [
              'La compuerta aun no abre lo suficiente para revelar lo que hay detras.',
              'La secuencia debe resolverse antes de continuar la lectura.',
            ],
            lines: [
              'La compuerta subio con un sonido grave y dejo escapar una corriente fria. Al otro lado no habia pasillo, sino una sala llena de fragmentos suspendidos.',
              'Uno de esos fragmentos mostro una silueta humana inclinada sobre otro libro. La imagen duro menos de un segundo, pero basto para entender algo importante.',
              'El jugador no era el primero en despertar alli. Y tal vez tampoco era el primero en intentar salir.',
            ],
          },
        ],
      },
      {
        id: 'memorias-fragmentadas',
        number: '03',
        title: 'Memorias Fragmentadas',
        trial: 'Memoria',
        condition: 'Recomponer los primeros recuerdos del archivo.',
        gameId: 'memoria',
        gameUrl: 'juegos/memoria/memoria.html',
        pages: [
          {
            label: 'Ruido',
            lines: [
              'La nueva sala estaba llena de recuerdos rotos. No flotaban como imagenes tranquilas, sino como pedazos de pantallas quebradas, girando alrededor del jugador con una energia nerviosa.',
              'Algunos mostraban rutas dentro del Nexus. Otros, manos temblorosas frente a pruebas fallidas. Otros se apagaban justo cuando parecian estar a punto de revelar un rostro.',
              'El libro avanzo hasta una pagina vacia y escribio una sola linea: el Archivo recuerda incluso lo que sus jugadores olvidan.',
            ],
          },
          {
            label: 'Ecos',
            lines: [
              'Los fragmentos empezaron a chocar entre si. Cuando dos pertenecian al mismo recuerdo, brillaban con fuerza; cuando no, dejaban escapar una chispa oscura que ensuciaba el aire.',
              'El jugador vio una puerta azul, una escalera imposible y una sombra parada junto a un libro cerrado. Todo aparecia incompleto, como si el Nexus estuviera mostrando pistas a proposito.',
              'La voz sin sonido regreso: memoria inestable. Recomponer antes de avanzar.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La pagina se lleno de piezas ocultas. Cada una guardaba una parte de una escena, pero ninguna podia sostenerse sola.',
              'El jugador tendria que encontrar los pares correctos para reconstruir el recuerdo. No bastaba con mirar rapido; habia que reconocer lo que el Archivo intentaba esconder.',
              'Si fallaba, los ecos volverian a romperse. Si acertaba, tal vez uno de ellos hablaria.',
            ],
          },
          {
            label: 'Rastro',
            afterTrial: true,
            sealedLines: [
              'Los fragmentos siguen boca abajo, inmoviles sobre la pagina.',
              'Hasta recomponerlos, el recuerdo completo permanece bloqueado.',
            ],
            lines: [
              'Cuando el ultimo par encajo, los fragmentos dejaron de girar y formaron una escena breve. Un jugador desconocido corria por la misma sala, perseguido por una luz roja que no parecia parte del sistema.',
              'Antes de desaparecer, la silueta miro hacia el libro y dejo una marca sobre la pagina: no confies en todos los sellos.',
              'El mensaje se borro casi de inmediato, pero el Nexus no pudo ocultarlo por completo. La sombra de la advertencia quedo grabada bajo la tinta azul.',
            ],
          },
        ],
      },
      {
        id: 'camara-inicial',
        number: '04',
        title: 'La Camara Inicial',
        trial: 'FlashMind',
        condition: 'Sincronizar reflejos antes de que el pulso colapse.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Cambio',
            lines: [
              'La advertencia desperto algo en la sala. Las paredes invisibles se cerraron y el suelo se dividio en carriles de luz, todos moviendose a velocidades distintas.',
              'El libro intento estabilizar sus paginas, pero las lineas se deformaron antes de acomodarse. El Nexus ya no estaba observando con paciencia.',
              'Ahora reaccionaba como un sistema que habia encontrado una amenaza dentro de si mismo.',
            ],
          },
          {
            label: 'Ritmo',
            lines: [
              'Las luces cruzaban el suelo como ordenes urgentes. Cada color llegaba con un pulso distinto, cada simbolo exigia una respuesta antes de desaparecer.',
              'El jugador sintio que el libro aceleraba junto a el. No lo guiaba con calma; lo empujaba a reaccionar, como si algo estuviera intentando cerrar la camara desde afuera.',
              'En el margen aparecio una frase incompleta: si el pulso cae, la conexion se corta.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La camara inicio una cuenta silenciosa. Las senales aparecian una tras otra, demasiado rapido para pensarlas como numeros o palabras.',
              'El jugador tenia que responder por instinto. Cada acierto recuperaba una parte del pulso; cada retraso hacia que el borde de la sala se llenara de grietas luminosas.',
              'Esta vez el libro no pedia precision tranquila. Pedia reflejos para sobrevivir.',
            ],
          },
          {
            label: 'Calma',
            afterTrial: true,
            sealedLines: [
              'La camara vibra demasiado rapido para revelar su salida.',
              'El pulso debe estabilizarse antes de continuar.',
            ],
            lines: [
              'La ultima senal correcta atraveso la camara como un relampago azul. Las grietas se cerraron y el suelo recupero su forma oscura.',
              'El libro quedo abierto frente al jugador, pero por primera vez sus paginas no se movieron solas. Parecian esperar una decision.',
              'Entonces, desde algun punto profundo del Archivo, una presencia respondio al pulso estabilizado. No era el Nexus. Era algo que el Nexus habia mantenido sellado.',
            ],
          },
        ],
      },
      {
        id: 'conexion-establecida',
        number: '05',
        title: 'Conexion Establecida',
        trial: 'NumCatch',
        condition: 'Capturar los codigos finales del primer sello.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Marca',
            lines: [
              'El ultimo sello aparecio en el centro del libro como una corona incompleta de luz azul. A su alrededor giraban codigos pequenos, veloces, imposibles de leer todos a la vez.',
              'El jugador entendio que no estaba cerrando una simple prueba. Estaba terminando su primera firma dentro del Nexus.',
              'Si el sello quedaba completo, el Archivo tendria que reconocerlo como competidor. Si fallaba, todo lo anterior podia ser descartado como una senal corrupta.',
            ],
          },
          {
            label: 'Respuesta',
            lines: [
              'Los codigos empezaron a escapar de la pagina. Algunos eran limpios y brillantes; otros estaban manchados por la misma sombra que habia aparecido en el recuerdo.',
              'El libro no explico la diferencia. Solo abrio un espacio al centro del sello y dejo que el jugador viera lo que estaba en juego.',
              'Cada codigo correcto cerraria una fisura. Cada codigo perdido dejaria entrar mas ruido desde el fondo del Archivo.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sello final se activo. Los codigos cayeron como fragmentos de una lluvia electrica, y el jugador tuvo que distinguir cuales pertenecian a su firma antes de que tocaran el vacio.',
              'No era una prueba de fuerza ni una pregunta del sistema. Era una confirmacion: el Nexus queria saber si esa nueva presencia podia mantenerse completa bajo presion.',
              'Cuando suficientes codigos fueran capturados, el Libro Novato dejaria de examinarlo.',
            ],
          },
          {
            label: 'Umbral',
            afterTrial: true,
            sealedLines: [
              'El sello final permanece incompleto y gira sobre la pagina.',
              'La conexion debe cerrarse antes de revelar el umbral.',
            ],
            lines: [
              'El sello se cerro con un golpe de luz. La portada del Libro Novato cambio de peso en el aire, como si por fin hubiera terminado de escribir el nombre invisible del jugador.',
              'El Nexus acepto la conexion. No hubo aplausos, ni recompensa brillante, solo una nueva puerta abriendose muy lejos entre los estantes del Archivo.',
              'Antes de que la pagina se apagara, una sombra cruzo el borde del siguiente libro. El jugador ya no era una senal desconocida, pero alguien mas acababa de notar que habia despertado.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Primer fragmento',
        lockedUntilBookComplete: true,
        sealedLines: [
          'El cierre del Libro Novato permanece oculto detras de cinco marcas incompletas.',
          'Cuando todos los sellos acepten la misma firma, el Archivo revelara el primer fragmento completo.',
        ],
        lines: [
          'El Libro Novato queda completo cuando los cinco sellos aceptan la misma firma. El jugador deja de ser una anomalia y se convierte en un competidor registrado por el Archivo.',
          'Pero el cierre no trae calma. En el borde del siguiente tomo hay una marca que no pertenece al Nexus, y parece haber esperado este despertar desde antes de la primera pagina.',
        ],
        footer: 'Cierre del despertar',
      },
    ],
  },
}

export function obtenerLibroHistoria(bookId) {
  return LIBROS_HISTORIA[crearIdLibroDesdeTitulo(bookId)] || null
}

export function crearRutaLibroHistoria(bookId) {
  return `${HISTORIA_READER_URL}?libro=${encodeURIComponent(crearIdLibroDesdeTitulo(bookId))}`
}

export function crearRegistroLibroDesdeRango(rank, overrides = {}) {
  const id = overrides.id || crearIdLibroDesdeTitulo(rank?.titulo)
  return {
    id,
    rankTitle: rank?.titulo || overrides.rankTitle || id,
    levelFrom: rank?.desde || overrides.levelFrom || 1,
    levelTo: rank?.hasta || overrides.levelTo || rank?.desde || 1,
    title: overrides.title || rank?.titulo || id,
    subtitle: overrides.subtitle || '',
    phase: overrides.phase || '',
    visual: overrides.visual || {},
    introPages: overrides.introPages || [],
    chapters: overrides.chapters || [],
    closingPages: overrides.closingPages || [],
    readerUrl: overrides.readerUrl || crearRutaLibroHistoria(id),
  }
}
