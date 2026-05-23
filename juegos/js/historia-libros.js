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
  amateur: {
    id: 'amateur',
    rankTitle: 'Amateur',
    levelFrom: 26,
    levelTo: 50,
    title: 'Las Primeras Pruebas',
    subtitle: 'Kael entra a un entrenamiento digital de energia verde donde memoria, reaccion, precision y logica empiezan a convertirlo en un verdadero competidor.',
    phase: '9.3',
    readerUrl: 'historia-libro.html?libro=amateur',
    visual: { emblem: 'AM', primary: '#22c55e', secondary: '#14b8a6', accent: '#bbf7d0', rgb: '34,197,94' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Amateur',
        title: 'Las Primeras Pruebas',
        lines: [
          'El portal verde se abre para quienes ya sobrevivieron al despertar inicial del Nexus.',
          'Dentro de este tomo, Kael descubre que avanzar no significa saberlo todo, sino aceptar cada prueba sin perder el control.',
        ],
        footer: 'Libro Amateur',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Cinco pruebas de control',
        lines: [
          'Memoria, reaccion, precision, calculo y adaptacion forman la ruta del Amateur.',
          'Cada capitulo abre una camara distinta del entrenamiento digital y revela una consecuencia al completar su prueba.',
        ],
        footer: 'Historia continua',
      },
    ],
    chapters: [
      {
        id: 'despertar-aspirante',
        number: '01',
        title: 'El Despertar del Aspirante',
        trial: 'Memoria',
        condition: 'Leer patrones bajo presion sin perder concentracion.',
        gameId: 'memoria',
        gameUrl: 'juegos/memoria/memoria.html',
        pages: [
          {
            label: 'Portal',
            lines: [
              'El enorme portal verde se abrio lentamente frente a Kael. Miles de lineas luminosas recorrian las paredes de la Biblioteca de Historias mientras simbolos triangulares giraban alrededor del techo.',
              'El aire vibraba como si toda la estructura estuviera viva. Kael observo el libro frente a el: AMATEUR - Las Primeras Pruebas.',
              'El simbolo del torneo aparecio flotando delante de sus ojos. Si abriste este libro, significa que ya no eres un Novato.',
            ],
          },
          {
            label: 'Nucleo',
            lines: [
              'Kael avanzo lentamente. Cada paso activaba fragmentos holograficos del pasado: jugadores cayendo, otros triunfando, algunos desapareciendo del sistema del torneo.',
              'Una voz mecanica resono en toda la sala. Los Amateur ya conocen las reglas basicas, pero aun no dominan el control mental.',
              'Las paredes cambiaron de forma hasta parecer un laberinto tecnologico. Entonces aparecio el primer nucleo de prueba: una esfera luminosa suspendida en el aire.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La esfera exploto en cientos de fragmentos digitales: simbolos, patrones y secuencias. Kael entendio inmediatamente que la prueba era de memoria y velocidad mental.',
              'Las figuras aparecian y desaparecian cada vez mas rapido mientras el sistema intentaba confundirlo. El suelo incluso comenzo a moverse para romper su concentracion.',
              'Kael respiro profundo. No debia entrar en panico. Debia leer el patron y pensar antes de actuar.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El nucleo verde sigue suspendido, esperando que Kael demuestre control mental.',
              'La consecuencia del capitulo se revelara al completar la prueba de memoria.',
            ],
            lines: [
              'La ultima secuencia brillo intensamente. Luego, silencio. Las paredes comenzaron a apagarse: Kael habia superado la prueba.',
              'El nucleo verde descendio lentamente hasta quedar frente a el. Sin control mental, ningun jugador puede avanzar.',
              'El simbolo Amateur aparecio grabado en el aire, pero antes de que pudiera descansar, la siguiente puerta ya se estaba abriendo. Esta vez, el calor del sistema aumentaba.',
            ],
          },
        ],
      },
      {
        id: 'ruta-fragmentada',
        number: '02',
        title: 'La Ruta Fragmentada',
        trial: 'Esquiva Obstaculos',
        condition: 'Reaccionar antes de que el camino colapse.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Puentes',
            lines: [
              'El nuevo escenario parecia completamente distinto: puentes flotantes, plataformas triangulares y fragmentos de datos cayendo desde el cielo digital.',
              'Kael observo el vacio bajo sus pies. No habia caminos seguros; cada estructura se movia constantemente.',
              'La voz volvio a aparecer. Un Amateur no solo debe pensar rapido, tambien debe reaccionar rapido.',
            ],
          },
          {
            label: 'Distraccion',
            lines: [
              'Kael empezo a correr. Cada salto activaba particulas verdes debajo de sus pies, pero algo extrano ocurria.',
              'El sistema no estaba intentando simplemente detenerlo; estaba intentando distraerlo. Aparecian falsas rutas, puertas ilusorias y sombras digitales moviendose entre las estructuras.',
              'La presion aumentaba. El tiempo tambien.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Una alarma roja atraveso el escenario. Las plataformas comenzaron a destruirse detras de Kael, y ahora debia avanzar antes de quedar atrapado en el vacio digital.',
              'Obstaculos mecanicos aparecian constantemente: muros, barreras y laseres triangulares. La velocidad aumentaba cada segundo.',
              'No habia tiempo para dudar.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Las plataformas siguen colapsando detras de Kael.',
              'La salida solo aparecera cuando cruce la ruta fragmentada.',
            ],
            lines: [
              'Kael logro cruzar la ultima plataforma justo antes del colapso total. El escenario desaparecio detras de el.',
              'Fragmentos verdes flotaban lentamente en el aire como cenizas digitales. Muchos jugadores piensan demasiado y terminan inmoviles.',
              'Un verdadero Amateur aprende cuando pensar y cuando actuar. Entonces algo aparecio en la oscuridad: una enorme torre iluminada, imposible de alcanzar desde abajo.',
            ],
          },
        ],
      },
      {
        id: 'torre-energia',
        number: '03',
        title: 'La Torre de Energia',
        trial: 'Torre Infinita',
        condition: 'Construir con precision mientras la torre vibra.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          {
            label: 'Ascenso',
            lines: [
              'La torre se elevaba hasta desaparecer entre nubes digitales. Bloques gigantes se movian alrededor de ella.',
              'Kael observo como otros jugadores intentaban subir y fallaban. Algunos perdian el equilibrio; otros destruian su propio camino.',
              'La voz del sistema volvio a sonar. La precision separa a los jugadores comunes de los verdaderos competidores.',
            ],
          },
          {
            label: 'Equilibrio',
            lines: [
              'Cada nivel de la torre reaccionaba de manera diferente. Algunos bloques eran veloces, otros inestables, otros parecian perfectamente alineados hasta que se movian inesperadamente.',
              'Kael comprendio algo importante: la desesperacion arruinaba el equilibrio.',
              'Debia mantener calma absoluta.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema activo la construccion central. Bloques de energia comenzaron a desplazarse horizontalmente a gran velocidad.',
              'Kael debia construir una estructura estable mientras la torre vibraba constantemente. Un error podia derrumbar todo.',
              'Pero si lograba mantener precision, la torre responderia a su energia.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La torre sigue incompleta y vibra bajo los pies de Kael.',
              'La cima solo se revelara cuando la estructura sea estable.',
            ],
            lines: [
              'El ultimo bloque quedo perfectamente alineado. La torre emitio una explosion de luz verde y las estructuras comenzaron a estabilizarse.',
              'Kael observo la cima. Ahora podia verla.',
              'Pero la voz del sistema sono mas seria que antes. La estabilidad no garantiza la victoria, porque el siguiente desafio pondria a prueba su mente.',
            ],
          },
        ],
      },
      {
        id: 'calculos-sistema',
        number: '04',
        title: 'Los Calculos del Sistema',
        trial: 'Matematicas',
        condition: 'Resolver bajo presion sin responder por impulso.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Nucleo',
            lines: [
              'La nueva sala parecia un nucleo matematico gigante. Numeros flotaban alrededor de Kael y ecuaciones se movian sobre las paredes.',
              'Triangulos verdes giraban formando patrones imposibles. Todo parecia un enorme cerebro digital.',
              'La temperatura del sistema descendio. Todo quedo en silencio.',
            ],
          },
          {
            label: 'Presion',
            lines: [
              'La voz hablo lentamente. El torneo no premia unicamente velocidad. Premia inteligencia.',
              'Las ecuaciones comenzaron a cambiar rapidamente. Algunas eran faciles; otras parecian trampas disenadas para provocar errores.',
              'Kael entendio que el sistema queria presionarlo. Queria hacerlo fallar por desesperacion.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Pantallas holograficas aparecieron frente a Kael: operaciones, patrones y problemas de logica.',
              'Todo avanzaba cada vez mas rapido. El tiempo corria y los errores acumulaban sobrecarga en el sistema.',
              'Kael respiro profundo. No debia responder por impulso. Debia analizar.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Las ecuaciones siguen girando alrededor del nucleo.',
              'El sistema no abrira la sala hasta que Kael resuelva los calculos.',
            ],
            lines: [
              'La ultima ecuacion desaparecio. Las luces rojas del sistema cambiaron nuevamente a verde.',
              'Kael habia logrado mantener el control. La sala comenzo a abrirse lentamente.',
              'Pero algo extrano ocurrio. Por primera vez, la voz del torneo no hablo inmediatamente. Como si estuviera observandolo. Evaluandolo.',
            ],
          },
        ],
      },
      {
        id: 'verdadero-amateur',
        number: '05',
        title: 'El Verdadero Amateur',
        trial: 'FlashMind',
        condition: 'Adaptarse a una simulacion que cambia sin detenerse.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Camara',
            lines: [
              'Kael llego a la ultima camara del libro. Era enorme, mas grande que todas las anteriores.',
              'En el centro habia un simbolo triangular girando lentamente. Alrededor flotaban fragmentos de todas las pruebas anteriores.',
              'Memoria, velocidad, precision y logica. Todo conectado.',
            ],
          },
          {
            label: 'Leccion',
            lines: [
              'La voz hablo por ultima vez. Muchos creen que ser Amateur significa ser debil.',
              'Las paredes comenzaron a iluminarse intensamente. Pero el verdadero Amateur es quien acepta que todavia tiene mucho por aprender.',
              'El simbolo central descendio lentamente. Y aun asi, continua avanzando. Entonces aparecio la prueba final.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema activo una simulacion completa: cambios rapidos, decisiones instantaneas y movimiento constante.',
              'Kael debia adaptarse a situaciones impredecibles mientras el entorno cambiaba sin detenerse. La dificultad aumentaba cada minuto.',
              'Pero ahora ya no reaccionaba con miedo. Ahora entendia el sistema. Ahora entendia el torneo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La simulacion final sigue activa alrededor de Kael.',
              'El simbolo Amateur solo quedara grabado si supera la ultima prueba.',
            ],
            lines: [
              'La simulacion se detuvo. Todo quedo en silencio. El simbolo Amateur brillo frente a Kael y finalmente quedo grabado en el libro.',
              'Las paginas comenzaron a cerrarse lentamente. Antes de desaparecer, la voz dijo una ultima frase: el Amateur ya sobrevivio a sus primeras pruebas, pero los verdaderos desafios apenas comienzan.',
              'A lo lejos, otro libro comenzo a iluminarse: ASPIRANTE.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Primeras pruebas superadas',
        lockedUntilBookComplete: true,
        sealedLines: [
          'El cierre del Libro Amateur espera que las cinco pruebas queden grabadas.',
          'Solo entonces el sistema reconocera a Kael como un verdadero Amateur.',
        ],
        lines: [
          'El libro se cerro con una linea verde recorriendo su lomo. Kael habia aprendido que avanzar no era cuestion de fuerza, sino de control.',
          'El siguiente tomo ya estaba despierto. Aspirante no parecia una invitacion; parecia una advertencia.',
        ],
        footer: 'Cierre del entrenamiento',
      },
    ],
  },
  aspirante: {
    id: 'aspirante',
    rankTitle: 'Aspirante',
    levelFrom: 51,
    levelTo: 75,
    title: 'La Ciudad de los Ecos',
    subtitle: 'Kael entra a Neoterra, una ciudad holografica donde los ecos de jugadores perdidos ponen a prueba energia, concentracion, estrategia y voluntad.',
    phase: '9.4',
    readerUrl: 'historia-libro.html?libro=aspirante',
    visual: { emblem: 'AS', primary: '#38bdf8', secondary: '#2563eb', accent: '#bfdbfe', rgb: '56,189,248' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Aspirante',
        title: 'La Ciudad de los Ecos',
        lines: [
          'Neoterra se abre como una ciudad imposible hecha de cristal azul, lluvia digital y voces que no pertenecen al presente.',
          'Cada distrito guarda restos de jugadores que intentaron avanzar, y cada eco parece saber algo que Kael aun no entiende.',
        ],
        footer: 'Libro Aspirante',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Cinco distritos de Neoterra',
        lines: [
          'Energia, concentracion, estrategia, reconstruccion y voluntad sostienen la ruta del Aspirante.',
          'La ciudad no solo examina habilidad. Tambien revela lo que ocurre con quienes pierden su camino dentro del torneo.',
        ],
        footer: 'Historia continua',
      },
    ],
    chapters: [
      {
        id: 'entrada-neoterra',
        number: '01',
        title: 'La Entrada a Neoterra',
        trial: 'NumCatch',
        condition: 'Activar nucleos de energia mientras la ciudad cambia sus rutas.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Ciudad',
            lines: [
              'El nuevo libro se abrio lentamente frente a Kael. Una rafaga de energia azul recorrio toda la biblioteca y las paginas comenzaron a girar solas mientras simbolos luminosos aparecian alrededor del salon.',
              'Entonces surgio el nombre: ASPIRANTE - La Ciudad de los Ecos.',
              'Kael levanto la mirada. Ya no estaba en la biblioteca; ahora se encontraba frente a una gigantesca ciudad futurista iluminada por miles de hologramas flotantes.',
            ],
          },
          {
            label: 'Ecos',
            lines: [
              'La ciudad parecia infinita. Torres de cristal azul atravesaban las nubes digitales mientras vehiculos luminosos cruzaban el cielo.',
              'Pero algo extrano ocurria. No habia personas, solo ecos: sombras digitales que repetian fragmentos de conversaciones antiguas, risas, advertencias, gritos y mensajes incompletos.',
              'La voz del sistema aparecio lentamente. Bienvenido a Neoterra, la ciudad construida por jugadores que jamas lograron avanzar.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las luces de la ciudad comenzaron a apagarse por sectores. El sistema detectaba una falla de energia.',
              'Kael debia activar antiguos nucleos repartidos entre estructuras digitales mientras plataformas y rutas cambiaban constantemente.',
              'Cada movimiento incorrecto bloqueaba caminos nuevos. Debia pensar rapido, pero tambien moverse rapido.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Neoterra pierde energia por sectores y los nucleos siguen apagados.',
              'La ciudad no revelara su primera voz hasta que Kael restaure el flujo azul.',
            ],
            lines: [
              'El ultimo nucleo se encendio y toda la ciudad reacciono inmediatamente. Miles de luces azules iluminaron nuevamente Neoterra.',
              'Los ecos comenzaron a desaparecer lentamente. Pero antes de irse, uno de ellos hablo directamente a Kael: no dejes que la ciudad te cambie.',
              'Kael sintio un escalofrio. Por primera vez, los ecos parecian reales.',
            ],
          },
        ],
      },
      {
        id: 'voces-distrito-central',
        number: '02',
        title: 'Las Voces del Distrito Central',
        trial: 'FlashMind',
        condition: 'Mantener concentracion entre rutas falsas y voces hostiles.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Distrito',
            lines: [
              'Kael avanzo hacia el centro de la ciudad. Pantallas holograficas flotaban sobre las calles mostrando nombres de antiguos jugadores.',
              'Muchos estaban marcados como desconectado, perdido o eliminado. La ciudad parecia guardar recuerdos de todos ellos.',
              'Entonces una alarma comenzo a sonar. Algo se estaba moviendo entre los edificios.',
            ],
          },
          {
            label: 'Sombras',
            lines: [
              'Sombras digitales aparecieron entre la niebla azul. No tenian rostro, solo ojos brillantes.',
              'Cada una repetia frases antiguas del torneo: no eres suficiente, vas a fallar, nunca llegaras al final.',
              'Kael intento ignorarlas, pero mientras mas avanzaba, mas fuertes se volvian las voces. La ciudad estaba intentando romper su concentracion.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las calles comenzaron a transformarse. Muros aparecian de la nada y rutas falsas intentaban desviarlo.',
              'Las sombras bloqueaban el camino constantemente. Kael debia encontrar la salida antes de quedar atrapado dentro del distrito.',
              'La presion mental aumentaba con cada segundo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Las voces del distrito siguen creciendo entre la niebla azul.',
              'Kael debe encontrar la salida antes de escuchar la verdad que ocultan.',
            ],
            lines: [
              'Kael logro salir justo antes de que el distrito colapsara. Las sombras desaparecieron junto con las voces.',
              'Pero una frase quedo resonando en el aire: el torneo no destruye jugadores; los jugadores se destruyen solos.',
              'La ciudad entera comenzo a vibrar. Algo enorme acababa de activarse.',
            ],
          },
        ],
      },
      {
        id: 'nucleo-estrategico',
        number: '03',
        title: 'El Nucleo Estrategico',
        trial: 'Ajedrez',
        condition: 'Anticipar movimientos antes de que el tablero controle la ciudad.',
        gameId: 'ajedrez',
        gameUrl: 'juegos/ajedrez/ajedrez.html',
        pages: [
          {
            label: 'Fortaleza',
            lines: [
              'En el centro de Neoterra existia una estructura gigantesca: una fortaleza suspendida sobre la ciudad.',
              'Todo el edificio estaba cubierto por simbolos triangulares giratorios. Kael entro lentamente.',
              'En el interior habia un tablero, pero no era un tablero normal. Las piezas parecian vivas.',
            ],
          },
          {
            label: 'Tablero',
            lines: [
              'Cada movimiento del tablero alteraba partes reales de la ciudad. Puentes se levantaban, torres desaparecian y calles completas cambiaban de lugar.',
              'La voz del sistema hablo nuevamente. La fuerza sin estrategia no tiene valor.',
              'Las piezas comenzaron a moverse solas y el tablero activo el modo de combate.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia anticipar movimientos antes de que el sistema tomara control total del tablero.',
              'Las piezas atacaban desde multiples direcciones mientras la ciudad cambiaba constantemente alrededor de el.',
              'No bastaba reaccionar. Debia adelantarse y leer el patron completo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El tablero sigue alterando los puentes de Neoterra.',
              'La fortaleza no se estabilizara hasta que Kael tome una decision estrategica.',
            ],
            lines: [
              'La ultima pieza cayo lentamente. Toda la fortaleza se estabilizo y las luces rojas cambiaron nuevamente a azul.',
              'La ciudad habia aceptado su decision estrategica.',
              'Pero algo extrano aparecio en una pantalla cercana: no todos los Aspirantes quieren avanzar. Entonces, la lluvia digital comenzo.',
            ],
          },
        ],
      },
      {
        id: 'tormenta-azul',
        number: '04',
        title: 'La Tormenta Azul',
        trial: 'Domino',
        condition: 'Reorganizar fragmentos del sistema antes del colapso.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Lluvia',
            lines: [
              'La ciudad quedo cubierta por una intensa tormenta de datos. Fragmentos luminosos caian del cielo como lluvia electrica.',
              'Las calles comenzaron a colapsar. Kael corria entre edificios mientras enormes estructuras digitales se derrumbaban alrededor suyo.',
              'La ciudad estaba fallando.',
            ],
          },
          {
            label: 'Advertencia',
            lines: [
              'El sistema habia perdido estabilidad. Las rutas cambiaban constantemente y cada zona parecia mas peligrosa que la anterior.',
              'Pero algo era diferente esta vez. La ciudad ya no parecia una prueba.',
              'Parecia una advertencia, como si estuviera intentando decirle algo.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael encontro una antigua consola central. Para estabilizar Neoterra debia reorganizar multiples fragmentos del sistema antes de que la tormenta destruyera completamente la ciudad.',
              'Pero cada decision afectaba otras partes del nucleo.',
              'Un movimiento incorrecto podia empeorar todo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La tormenta azul sigue cayendo sobre Neoterra.',
              'El nucleo necesita que sus fragmentos queden conectados antes de abrir el cielo.',
            ],
            lines: [
              'El ultimo fragmento quedo conectado. La tormenta comenzo a disminuir lentamente y los edificios dejaron de colapsar.',
              'Las luces volvieron a encenderse una por una. Entonces la ciudad hablo por primera vez sin usar la voz del sistema: aun existe esperanza.',
              'Kael observo el cielo y vio algo imposible: una puerta flotando sobre las nubes digitales.',
            ],
          },
        ],
      },
      {
        id: 'salida-neoterra',
        number: '05',
        title: 'La Salida de Neoterra',
        trial: 'Esquiva Obstaculos',
        condition: 'Adaptarse a una salida que cambia con cada movimiento.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Puerta',
            lines: [
              'Kael llego a la cima de la ciudad. La enorme puerta azul flotaba frente a el.',
              'Pero antes de abrirse, aparecieron cientos de ecos observandolo desde abajo.',
              'Todos eran jugadores antiguos. Todos parecian atrapados dentro de Neoterra.',
            ],
          },
          {
            label: 'Voluntad',
            lines: [
              'La voz del sistema regreso. Los Aspirantes aprenden algo importante.',
              'Los ecos comenzaron a desaparecer lentamente. El torneo no solo mide habilidad.',
              'Mide voluntad. La puerta comenzo a abrirse lentamente, pero una ultima prueba aparecio frente a Kael.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema combino multiples mecanicas al mismo tiempo: velocidad, memoria, decisiones rapidas y adaptacion.',
              'La ciudad entera reaccionaba a cada movimiento de Kael. Todo cambiaba constantemente.',
              'Pero ahora el ya no dudaba. Ahora entendia como sobrevivir dentro del torneo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La puerta de Neoterra sigue cerrada sobre las nubes digitales.',
              'La salida solo se abrira si Kael demuestra voluntad hasta el final.',
            ],
            lines: [
              'La puerta termino de abrirse. La ciudad quedo atras lentamente.',
              'Los ecos observaron en silencio mientras Kael avanzaba hacia la luz azul. Antes de desaparecer, una ultima voz resono desde Neoterra: no olvides a quienes quedaron atrapados aqui.',
              'El libro comenzo a cerrarse lentamente y otro simbolo aparecio flotando frente a el: PROFESIONAL.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Neoterra queda atras',
        lockedUntilBookComplete: true,
        sealedLines: [
          'La salida de Neoterra permanece oculta entre la lluvia digital.',
          'Los cinco distritos deben quedar estabilizados antes de que el libro revele su cierre.',
        ],
        lines: [
          'Neoterra no desaparecio. La ciudad siguio brillando a lo lejos, llena de ecos que ahora parecian menos perdidos.',
          'Kael habia aprendido que aspirar a algo no era solo querer avanzar. Era cargar tambien con las voces de quienes no pudieron hacerlo.',
        ],
        footer: 'Cierre de Neoterra',
      },
    ],
  },
  profesional: {
    id: 'profesional',
    rankTitle: 'Profesional',
    levelFrom: 76,
    levelTo: 100,
    title: 'El Codigo del Vacio',
    subtitle: 'Kael entra a la Zona Prohibida, un territorio corrupto donde ruinas digitales, guardianes rotos y registros ocultos revelan que el torneo protege secretos peligrosos.',
    phase: '9.5',
    readerUrl: 'historia-libro.html?libro=profesional',
    visual: { emblem: 'PR', primary: '#a855f7', secondary: '#312e81', accent: '#f0abfc', rgb: '168,85,247' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Profesional',
        title: 'El Codigo del Vacio',
        lines: [
          'El cuarto tomo no se abre como una invitacion. Parpadea como un sistema danado, rodeado por energia cosmica, portales geometricos e interferencias holograficas.',
          'Dentro de sus paginas existe la Zona Prohibida: el lugar donde el torneo esconde los sistemas corruptos que no quiere recordar.',
        ],
        footer: 'Libro Profesional',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Siete rupturas del sistema',
        lines: [
          'Kael debera cruzar ruinas, restaurar datos, enfrentar un guardian corrompido y descubrir por que el Vacio existe.',
          'Ser Profesional no significa jugar mejor. Significa soportar verdades que otros rangos aun no pueden mirar.',
        ],
        footer: 'Zona Prohibida',
      },
    ],
    chapters: [
      {
        id: 'zona-prohibida',
        number: '01',
        title: 'La Zona Prohibida',
        trial: 'Sube la Montana',
        condition: 'Escapar del colapso inicial entre plataformas que se desintegran.',
        gameId: 'subelamontana',
        gameUrl: 'juegos/subelamontana/subelamontana.html',
        pages: [
          {
            label: 'Falla',
            lines: [
              'El nuevo libro aparecio lentamente frente a Kael, pero algo estaba mal. El simbolo parpadeaba sin ritmo, como si una parte del tomo estuviera rota.',
              'Las luces de la biblioteca comenzaron a apagarse una por una. Entonces aparecio el titulo: PROFESIONAL - El Codigo del Vacio.',
              'Y justo despues, el suelo desaparecio bajo sus pies.',
            ],
          },
          {
            label: 'Caida',
            lines: [
              'Kael cayo dentro de un espacio completamente oscuro. No habia cielo, no habia suelo y no habia gravedad.',
              'Solo enormes fragmentos flotaban en medio de un vacio infinito: ruinas digitales, puertas destruidas y pedazos de antiguos sistemas del torneo.',
              'La voz del sistema sono lentamente. Has entrado a la Zona Prohibida, el lugar donde terminan los sistemas corruptos.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las plataformas comenzaron a desintegrarse rapidamente. Kael debia avanzar antes de quedar atrapado fuera del sistema.',
              'Cada salto requeriria precision total mientras fragmentos del vacio explotaban alrededor suyo.',
              'El escenario cambiaba constantemente. No existian rutas seguras.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Zona Prohibida sigue rompiendo las plataformas bajo los pies de Kael.',
              'Solo un ascenso preciso revelara que hay oculto entre los restos del sistema.',
            ],
            lines: [
              'Kael alcanzo la ultima plataforma antes del colapso. El vacio rugio debajo de el como si hubiera perdido una pieza importante.',
              'Entonces observo algo extrano flotando frente a el: un antiguo simbolo del torneo completamente roto.',
              'Y por primera vez, la voz del sistema parecio sentir miedo.',
            ],
          },
        ],
      },
      {
        id: 'datos-perdidos',
        number: '02',
        title: 'Los Datos Perdidos',
        trial: 'Sudoku',
        condition: 'Restaurar secuencias danadas y separar datos reales de datos corruptos.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Registros',
            lines: [
              'Gigantescas pantallas comenzaron a aparecer alrededor del vacio. Miles de registros antiguos recorrian el espacio como rios de luz rota.',
              'Kael vio nombres eliminados, rankings borrados y jugadores marcados como desaparecidos.',
              'La mayoria terminaba con la misma palabra: ERROR.',
            ],
          },
          {
            label: 'Bloqueo',
            lines: [
              'Kael intento acercarse a uno de los archivos, pero inmediatamente el vacio reacciono violentamente.',
              'Las estructuras comenzaron a deformarse y las luces fallaban en secuencias imposibles.',
              'Era como si alguien estuviera intentando impedir que descubriera la verdad.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema activo una restauracion de emergencia. Kael debia reorganizar secuencias danadas antes de que fueran destruidas por completo.',
              'Pero el vacio mezclaba datos falsos y reales constantemente.',
              'Debia identificar errores rapido, sin permitir que la corrupcion reescribiera el archivo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Los registros siguen cubiertos por errores y datos falsos.',
              'La verdad del Vacio permanecera oculta hasta que Kael restaure el primer archivo.',
            ],
            lines: [
              'El ultimo archivo logro restaurarse parcialmente. La pantalla temblo, como si el sistema dudara antes de revelar su secreto.',
              'Entonces aparecio un mensaje oculto: El Vacio no aparecio por accidente.',
              'Kael sintio tension inmediatamente. Eso significaba una sola cosa: alguien habia creado el vacio.',
            ],
          },
        ],
      },
      {
        id: 'ciudad-fragmentada',
        number: '03',
        title: 'La Ciudad Fragmentada',
        trial: 'Esquiva Obstaculos',
        condition: 'Cruzar una version destruida de Neoterra antes de que vuelva a caer en la oscuridad.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Ruinas',
            lines: [
              'En medio de la oscuridad aparecio una ciudad destruida flotando entre fragmentos. Edificios partidos, puentes rotos y pantallas con interferencias colgaban en el aire.',
              'Parecia una version destruida de Neoterra, pero mas vieja, mas silenciosa y mucho mas fria.',
              'La ciudad estaba completamente abandonada. O eso parecia.',
            ],
          },
          {
            label: 'Voces',
            lines: [
              'Mientras avanzaba, Kael escucho voces. No eran ecos normales ni grabaciones incompletas.',
              'Parecian jugadores reales. Algunos pedian ayuda. Otros gritaban desesperadamente desde calles que ya no existian.',
              'La ciudad entera estaba atrapada dentro del vacio.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las calles comenzaron a colapsar violentamente. Kael debia atravesar la ciudad mientras enormes fragmentos caian desde el cielo.',
              'Muros aparecian de la nada y las rutas cambiaban constantemente.',
              'Debia reaccionar rapido o quedaria atrapado con las voces.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La ciudad fragmentada se derrumba en silencio.',
              'Kael debe atravesarla antes de que sus voces lo arrastren al mismo destino.',
            ],
            lines: [
              'Kael logro escapar justo antes de que la ciudad desapareciera nuevamente en la oscuridad.',
              'Pero antes del colapso total vio una sombra observandolo desde una torre destruida.',
              'Era una figura cubierta completamente por energia morada.',
            ],
          },
        ],
      },
      {
        id: 'guardian-corrupto',
        number: '04',
        title: 'El Guardian Corrupto',
        trial: 'Damas',
        condition: 'Anticipar al guardian mientras el tablero del Vacio altera las rutas.',
        gameId: 'damas',
        gameUrl: 'juegos/damas/damas.html',
        pages: [
          {
            label: 'Figura',
            lines: [
              'La figura descendio lentamente desde las alturas. Era enorme, y su cuerpo parecia formado por codigos rotos y fragmentos oscuros.',
              'Sus ojos brillaban con una intensidad violeta que hacia temblar las ruinas cercanas.',
              'La voz del sistema hablo en tono bajo: ese guardian alguna vez fue un Profesional.',
            ],
          },
          {
            label: 'Control',
            lines: [
              'El guardian observo a Kael sin moverse, pero el vacio reaccionaba con cada uno de sus gestos.',
              'Las plataformas cambiaban, las reglas se alteraban y los caminos desaparecian.',
              'No protegia el vacio. Lo controlaba.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia anticipar movimientos del guardian mientras el escenario cambiaba constantemente.',
              'Cada decision alteraba las rutas disponibles y el sistema intentaba desorientarlo todo el tiempo.',
              'Debia adaptarse al caos antes de que el caos decidiera por el.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El guardian corrupto bloquea el paso y mueve el Vacio como si fuera un tablero.',
              'La ruta no se abrira hasta que Kael aprenda a leer sus movimientos.',
            ],
            lines: [
              'El guardian cayo lentamente. Su cuerpo comenzo a desintegrarse en miles de fragmentos violetas.',
              'Antes de desaparecer completamente dijo una sola frase: Umbra ya desperto.',
              'Y entonces todo el vacio comenzo a temblar.',
            ],
          },
        ],
      },
      {
        id: 'grieta-central',
        number: '05',
        title: 'La Grieta Central',
        trial: 'FlashMind',
        condition: 'Estabilizar una herida abierta dentro del torneo bajo presion extrema.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Herida',
            lines: [
              'En el centro absoluto del vacio existia una enorme grieta luminosa. Desde alli salian ondas de energia corrupta.',
              'Parecia una herida abierta dentro del torneo, una fractura que ningun libro queria mostrar.',
              'Kael escucho miles de voces provenientes del interior.',
            ],
          },
          {
            label: 'Secretos',
            lines: [
              'No eran simples ecos. Eran jugadores atrapados dentro de la corrupcion del sistema.',
              'Algunos pedian ayuda. Otros advertian que no avanzara mas. La voz del sistema intento bloquearlas: no escuches al vacio.',
              'Pero Kael ya habia entendido algo importante. El torneo estaba ocultando secretos.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La grieta comenzo a liberar enormes explosiones de energia. Kael debia estabilizar multiples secuencias sin perder la concentracion.',
              'El vacio intentaba destruir completamente las estructuras cercanas.',
              'La velocidad aumentaba constantemente y la presion mental era extrema.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La grieta central sigue expandiendo energia corrupta.',
              'Kael debe contenerla antes de que el Vacio devore las estructuras cercanas.',
            ],
            lines: [
              'La grieta logro estabilizarse temporalmente. El silencio que siguio fue peor que el ruido.',
              'Entonces aparecio un simbolo desconocido dentro de la oscuridad. Debajo habia una sola palabra: UMBRA.',
              'Y justo despues, la gravedad desaparecio nuevamente.',
            ],
          },
        ],
      },
      {
        id: 'verdad-vacio',
        number: '06',
        title: 'La Verdad del Vacio',
        trial: 'Torre Infinita',
        condition: 'Escapar de una sala secreta reconstruyendo estructuras antes del colapso.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          {
            label: 'Sala oculta',
            lines: [
              'Kael desperto dentro de una antigua sala oculta. Las paredes mostraban registros secretos del torneo.',
              'Experimentos, pruebas y jugadores usados para crear sistemas mas avanzados aparecian como cicatrices luminosas.',
              'El vacio no era un accidente. Era un experimento fallido.',
            ],
          },
          {
            label: 'Umbra',
            lines: [
              'Los archivos revelaban algo aun peor. Umbra no era un lugar.',
              'Era una inteligencia creada dentro del torneo, una entidad nacida de errores, corrupcion y jugadores perdidos.',
              'Y ahora estaba creciendo.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema comenzo a colapsar violentamente. Kael debia escapar reorganizando estructuras antes de quedar atrapado junto al vacio.',
              'Cada error aceleraba la destruccion del lugar.',
              'Las rutas desaparecian rapidamente, y solo una estructura estable podia abrir salida.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La sala secreta se deshace entre registros corruptos.',
              'Si Kael no estabiliza una ruta, la verdad del Vacio quedara enterrada con el.',
            ],
            lines: [
              'La sala exploto en fragmentos digitales, pero Kael logro escapar antes del colapso total.',
              'Ahora sabia la verdad. Umbra seguia existiendo.',
              'Y estaba intentando expandirse dentro del torneo.',
            ],
          },
        ],
      },
      {
        id: 'el-profesional',
        number: '07',
        title: 'El Profesional',
        trial: 'Matematicas',
        condition: 'Resolver la evaluacion final mientras las reglas cambian sin detenerse.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Reconstruccion',
            lines: [
              'El vacio comenzo a reconstruirse lentamente. Las plataformas volvieron a estabilizarse y las interferencias disminuyeron.',
              'Pero las grietas seguian ocultas entre las estructuras.',
              'Esperando. Observando.',
            ],
          },
          {
            label: 'Secreto',
            lines: [
              'La voz del sistema aparecio una ultima vez. Los Profesionales descubren algo que cambia todo.',
              'El vacio giro alrededor de Kael. El torneo no solo pone a prueba jugadores.',
              'Tambien protege secretos peligrosos. Entonces el simbolo Profesional aparecio frente a el.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final comenzo. El sistema combino velocidad, logica, precision y adaptacion al mismo tiempo.',
              'Las reglas cambiaban constantemente y nada permanecia estable.',
              'Pero Kael ya no dependia unicamente del talento. Ahora sabia sobrevivir incluso dentro del caos.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La evaluacion final mantiene sellado el simbolo Profesional.',
              'Kael debe demostrar que puede pensar incluso cuando el sistema cambia las reglas.',
            ],
            lines: [
              'La simulacion termino. El simbolo Profesional quedo grabado dentro del libro.',
              'Pero antes de cerrarse, las paginas mostraron una ultima advertencia: UMBRA SIGUE DESPIERTO.',
              'Las luces de la biblioteca comenzaron a apagarse nuevamente. Lentamente, otro libro aparecio entre la oscuridad: COMPETIDOR.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Umbra sigue despierto',
        lockedUntilBookComplete: true,
        sealedLines: [
          'El Codigo del Vacio no puede cerrarse mientras sus siete rupturas sigan abiertas.',
          'Solo al completar todas las pruebas el libro revelara que Umbra no es una amenaza futura, sino una presencia activa.',
        ],
        lines: [
          'El libro Profesional se cerro sin apagar del todo su brillo morado. Entre las paginas quedo una vibracion baja, como si algo respirara al otro lado.',
          'Kael ya no veia el torneo como una escalera de rangos. Ahora sabia que cada ascenso tambien lo acercaba a los secretos que el sistema preferia mantener sellados.',
        ],
        footer: 'Cierre del Vacio',
      },
    ],
  },
  competidor: {
    id: 'competidor',
    rankTitle: 'Competidor',
    levelFrom: 101,
    levelTo: 125,
    title: 'La Guerra de los Nucleos',
    subtitle: 'Kael entra en una megaciudad dividida por facciones, nucleos energeticos y una guerra futurista manipulada por Umbra desde el interior del torneo.',
    phase: '9.6',
    readerUrl: 'historia-libro.html?libro=competidor',
    visual: { emblem: 'CO', primary: '#ef4444', secondary: '#7f1d1d', accent: '#f97316', rgb: '239,68,68' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Competidor',
        title: 'La Guerra de los Nucleos',
        lines: [
          'El quinto tomo se abre con energia roja, metal industrial y mapas tacticos que cubren toda la biblioteca.',
          'Esta vez Kael no entra a una prueba aislada. Entra a una ciudad en guerra, donde cada nucleo perdido acerca a Umbra al control del torneo.',
        ],
        footer: 'Libro Competidor',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Siete frentes de combate',
        lines: [
          'Facciones, nucleos, drones tacticos, ciudades inferiores y administradores conectados al sistema forman la primera guerra abierta contra Umbra.',
          'Ser Competidor ya no significa superar rivales. Significa decidir que vale la pena defender cuando el torneo empieza a romperse desde dentro.',
        ],
        footer: 'Guerra de nucleos',
      },
    ],
    chapters: [
      {
        id: 'mundo-dividido',
        number: '01',
        title: 'El Mundo Dividido',
        trial: 'Esquiva Obstaculos',
        condition: 'Atravesar zonas de combate y activar defensas antes de que el primer nucleo caiga.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Metrópolis',
            lines: [
              'Cuando Kael abrio el nuevo libro, una onda roja atraveso toda la biblioteca. Las paredes comenzaron a transformarse en enormes estructuras metalicas mientras pantallas holograficas mostraban mapas desconocidos.',
              'El titulo surgio entre interferencias luminosas: COMPETIDOR - La Guerra de los Nucleos.',
              'Esta vez el torneo no lo llevo a un vacio ni a una ciudad abandonada. Ahora estaba en medio de una gigantesca metropolis futurista dividida en sectores de combate.',
            ],
          },
          {
            label: 'Facciones',
            lines: [
              'Una alarma comenzo a sonar en toda la ciudad. Miles de jugadores corrian entre estructuras metalicas mientras diferentes facciones luchaban por controlar los Nucleos Centrales.',
              'La voz del sistema aparecio de inmediato: los Competidores ya no luchan solo por sobrevivir; ahora luchan por el control.',
              'Kael observo simbolos sobre los edificios. Cada faccion tenia colores, emblemas y territorios distintos, pero en varios sectores aparecia el simbolo de Umbra oculto entre las pantallas.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El primer nucleo comenzo a perder estabilidad. Kael debia atravesar multiples zonas de combate mientras activaba sistemas de defensa.',
              'Explosiones bloqueaban los caminos principales, drones enemigos cerraban rutas de acceso y plataformas industriales colapsaban poco a poco.',
              'Si fallaba, una de las facciones destruiria todo el sector antes de entender quien lo estaba manipulando.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El primer nucleo sigue perdiendo estabilidad entre explosiones y drones hostiles.',
              'Kael debe cruzar el sector antes de que la guerra destruya la primera defensa de la ciudad.',
            ],
            lines: [
              'Despues de activar el nucleo principal, la energia de la ciudad se estabilizo temporalmente. Las luces volvieron a encenderse y las estructuras dejaron de colapsar.',
              'Sin embargo, una transmision secreta aparecio frente a Kael: Umbra ya controla parte de los nucleos.',
              'Kael entendio que aquella guerra no era unicamente entre jugadores. Algo mucho mas peligroso estaba manipulando el conflicto desde las sombras.',
            ],
          },
        ],
      },
      {
        id: 'faccion-carmesi',
        number: '02',
        title: 'La Faccion Carmesi',
        trial: 'Matematicas',
        condition: 'Resolver calculos tacticos bajo presion mientras Umbra genera soluciones falsas.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Territorio',
            lines: [
              'Kael avanzo hacia uno de los sectores mas peligrosos de la ciudad: el territorio de la Faccion Carmesi.',
              'Alli todo estaba cubierto por estructuras rojas gigantescas, motores industriales y fabricas tecnologicas que nunca dejaban de funcionar.',
              'Enormes pantallas mostraban estadisticas de jugadores eliminados diariamente, y nadie parecia confiar en nadie dentro de aquel lugar.',
            ],
          },
          {
            label: 'Comandante',
            lines: [
              'Una comandante de la faccion se acerco lentamente. Si quieres avanzar dentro de la guerra, debes demostrar que puedes pensar bajo presion.',
              'Kael observo como enormes paneles estrategicos comenzaban a activarse alrededor de la base militar.',
              'Cada decision afectaba distintas zonas de la ciudad, y un error podia provocar apagones completos o ataques enemigos.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema activo una simulacion tactica en tiempo real. Kael debia resolver secuencias numericas y reorganizar patrones energeticos.',
              'La faccion enemiga intentaba sabotear el nucleo principal mientras las operaciones aparecian cada vez mas rapido.',
              'Umbra generaba falsas soluciones para provocar fallos, y el margen de error disminuia constantemente.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Faccion Carmesi mantiene sus defensas al limite.',
              'Sin calculos exactos, el nucleo caera antes de revelar que esconden sus comandantes.',
            ],
            lines: [
              'La simulacion termino exitosamente. Las defensas de la Faccion Carmesi lograron mantenerse activas y el nucleo sobrevivio al ataque enemigo.',
              'Antes de retirarse, la comandante dijo algo que dejo pensando a Kael.',
              'No todas las facciones estan luchando por ganar; algunas solo intentan evitar que Umbra despierte completamente.',
            ],
          },
        ],
      },
      {
        id: 'ciudad-inferior',
        number: '03',
        title: 'La Ciudad Inferior',
        trial: 'Domino',
        condition: 'Reorganizar estructuras conectadas antes de que la ciudad subterranea colapse.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Subsuelo',
            lines: [
              'Bajo la enorme ciudad principal existia otro mundo completamente distinto. Kael descendio por elevadores industriales hasta llegar a la Ciudad Inferior.',
              'Alli sobrevivian jugadores expulsados, sistemas defectuosos y antiguos combatientes olvidados por el torneo.',
              'Las luces eran debiles y las estructuras parecian construidas con restos tecnologicos reciclados.',
            ],
          },
          {
            label: 'Susurros',
            lines: [
              'Mientras avanzaba entre calles oscuras, Kael observo simbolos extranos pintados sobre las paredes metalicas.',
              'Muchos representaban ojos triangulares rodeados por energia negra. Los habitantes evitaban hablar sobre ello.',
              'Algunos susurraban una frase constantemente: los nucleos no mantienen viva la ciudad; mantienen dormido algo peor.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema de estabilidad de la Ciudad Inferior comenzo a fallar violentamente.',
              'Kael debia reorganizar estructuras conectadas entre si antes de que las plataformas colapsaran completamente.',
              'Cada movimiento alteraba multiples zonas al mismo tiempo y algunos caminos desaparecian inesperadamente.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Ciudad Inferior se hunde entre sistemas defectuosos y plataformas inestables.',
              'Kael debe estabilizar sus conexiones antes de que el subsuelo oculte la verdad sobre Umbra.',
            ],
            lines: [
              'Kael logro estabilizar la Ciudad Inferior antes del colapso total. Los habitantes observaron sorprendidos como las luces regresaban lentamente.',
              'Entonces un anciano se acerco y le entrego un fragmento de datos ocultos pertenecientes a Umbra.',
              'Dentro del archivo aparecia una frase inquietante: los Competidores decidiran el futuro del torneo.',
            ],
          },
        ],
      },
      {
        id: 'torneo-militar',
        number: '04',
        title: 'El Torneo Militar',
        trial: 'FlashMind',
        condition: 'Sobrevivir a una camara de evaluacion militar con velocidad, gravedad y rutas cambiantes.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Base',
            lines: [
              'Kael salio de la Ciudad Inferior por antiguos tuneles de mantenimiento que conectaban directamente con la zona militar del torneo.',
              'A diferencia de otros sectores, aqui todo estaba perfectamente organizado. Filas de drones patrullaban estructuras metalicas mientras pantallas mostraban estadisticas de combate.',
              'En el centro de la base existia una enorme arena llamada la Camara de Evaluacion.',
            ],
          },
          {
            label: 'Mapa',
            lines: [
              'Un comandante militar se acerco lentamente. Su armadura estaba llena de cicatrices digitales producidas por antiguas batallas.',
              'La guerra ya comenzo hace tiempo, dijo en voz baja. La mayoria de jugadores ni siquiera entiende contra que estamos luchando realmente.',
              'Luego mostro multiples nucleos energeticos repartidos por la ciudad. Algunos estaban estables. Otros aparecian contaminados por energia oscura.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La Camara de Evaluacion comenzo a activarse. Decenas de plataformas aparecieron alrededor de Kael mientras drones tacticos iniciaban simulaciones de combate.',
              'El objetivo era sobrevivir a escenarios cambiantes mientras el sistema alteraba velocidad, gravedad y dificultad.',
              'Umbra creaba falsas rutas para desorientar a los participantes, y la presion aumentaba segundo tras segundo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Camara de Evaluacion mantiene sus drones activos.',
              'Solo un Competidor capaz de adaptarse al caos podra revelar que sector esta cayendo.',
            ],
            lines: [
              'La simulacion termino con una explosion de energia roja recorriendo toda la arena. Los drones dejaron de atacar y las plataformas comenzaron a estabilizarse.',
              'Los demas Competidores observaron sorprendidos a Kael. Muy pocos lograban completar aquella evaluacion sin perder el control mental.',
              'El comandante activo nuevamente el mapa. Un nuevo sector parpadeaba violentamente: el nucleo principal del Distrito Central estaba siendo atacado.',
            ],
          },
        ],
      },
      {
        id: 'rebelion-umbra',
        number: '05',
        title: 'La Rebelion de Umbra',
        trial: 'Sudoku',
        condition: 'Restaurar el nucleo principal mientras Umbra altera rutas y secuencias.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Ataque',
            lines: [
              'Las alarmas comenzaron a sonar por toda la ciudad. Las pantallas holograficas cambiaron automaticamente a mensajes de emergencia.',
              'Enormes grietas oscuras aparecian sobre multiples edificios. Umbra ya no estaba actuando desde las sombras.',
              'Ahora atacaba directamente, contaminando sistemas completos y tomando control de drones, puertas y nucleos energeticos.',
            ],
          },
          {
            label: 'Caos',
            lines: [
              'Mientras avanzaba hacia el Distrito Central, Kael escucho transmisiones de emergencia de diferentes facciones.',
              'Perdimos el nucleo oeste. Los drones estan fuera de control. Umbra entro al sistema principal.',
              'La guerra ya no era entre facciones. Ahora todos intentaban sobrevivir mientras enormes simbolos triangulares negros aparecian entre las nubes digitales.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael llego al nucleo principal justo cuando comenzaba el colapso total del sector.',
              'Debia restaurar multiples conexiones energeticas mientras evitaba que Umbra tomara control definitivo del sistema.',
              'Cada movimiento activaba errores nuevos, rutas reiniciadas y secuencias falsas creadas para sabotear la restauracion.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Umbra esta tomando el nucleo principal del Distrito Central.',
              'La ciudad necesita una restauracion exacta antes de que la corrupcion se vuelva irreversible.',
            ],
            lines: [
              'Despues de una intensa estabilizacion, el nucleo principal logro mantenerse activo. Las luces de la ciudad regresaron parcialmente y varias zonas dejaron de colapsar.',
              'Pero antes de desaparecer, Umbra dejo un mensaje frente a Kael: los Competidores creen luchar por el torneo, pero en realidad estan alimentandolo.',
              'Entonces el simbolo negro desaparecio lentamente. Kael sintio algo que jamas habia sentido antes: duda.',
            ],
          },
        ],
      },
      {
        id: 'fortaleza-central',
        number: '06',
        title: 'La Fortaleza Central',
        trial: 'Torre Infinita',
        condition: 'Estabilizar el nucleo maestro mientras la fortaleza se derrumba.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          {
            label: 'Ascenso',
            lines: [
              'La unica forma de detener la expansion de Umbra era llegar hasta la Fortaleza Central, una gigantesca estructura suspendida sobre la ciudad.',
              'Desde alli se controlaban todos los nucleos energeticos del torneo.',
              'El viaje fue peligroso: sectores destruidos, fragmentos metalicos cayendo del cielo y facciones luchando por proteger las ultimas rutas seguras.',
            ],
          },
          {
            label: 'Administradores',
            lines: [
              'Al llegar a la fortaleza, Kael encontro algo inesperado: los administradores del torneo.',
              'No parecian humanos normales. Sus cuerpos estaban conectados directamente al sistema mediante estructuras de energia roja y negra.',
              'Uno hablo lentamente. Umbra nacio porque el torneo intento crecer demasiado rapido. Usamos demasiada energia, demasiados sistemas, demasiados jugadores.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La fortaleza comenzo a fallar violentamente mientras Umbra intentaba tomar control total del nucleo maestro.',
              'Kael debia reorganizar enormes estructuras energeticas mientras multiples plataformas cambiaban constantemente de posicion.',
              'Cada error aceleraba la corrupcion y enormes bloques industriales caian desde las alturas.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Fortaleza Central pierde el control del nucleo maestro.',
              'Si Kael no estabiliza sus estructuras, Umbra tendra acceso a todos los nucleos del torneo.',
            ],
            lines: [
              'Kael logro estabilizar temporalmente el nucleo maestro. La fortaleza dejo de colapsar y parte del sistema consiguio reiniciarse correctamente.',
              'Pero la victoria no era completa. Umbra seguia vivo dentro del torneo, oculto y esperando otra oportunidad para expandirse.',
              'Entonces aparecio frente a Kael una enorme puerta roja cubierta por simbolos desconocidos. La ultima prueba lo esperaba detras de ella.',
            ],
          },
        ],
      },
      {
        id: 'el-competidor',
        number: '07',
        title: 'El Competidor',
        trial: 'NumCatch',
        condition: 'Superar una evaluacion final alterada por Umbra con velocidad, precision y adaptacion.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Arena',
            lines: [
              'Kael atraveso lentamente la enorme puerta metalica. Al otro lado encontro una gigantesca arena suspendida sobre el vacio digital.',
              'Miles de fragmentos tecnologicos flotaban alrededor mientras multiples nucleos energeticos giraban en el centro del escenario.',
              'La voz del sistema aparecio una ultima vez: los Competidores entienden algo que cambia todo.',
            ],
          },
          {
            label: 'Batalla',
            lines: [
              'Todos los desafios anteriores comenzaron a aparecer simultaneamente dentro de la arena: plataformas cambiantes, secuencias numericas, estructuras colapsando y drones tacticos.',
              'Era como si el libro entero estuviera midiendo cuanto habia evolucionado Kael desde que inicio el torneo.',
              'Pero esta vez ya no reaccionaba con miedo. Comprendia el sistema, comprendia el caos y sabia que el torneo escondia secretos mucho mas peligrosos.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final comenzo. Velocidad extrema, adaptacion constante, estrategia y precision mental ocurrian al mismo tiempo.',
              'Umbra alteraba parcialmente las reglas de la simulacion para provocar errores inesperados.',
              'Las plataformas podian desaparecer, los nucleos podian explotar y las rutas podian cambiar sin aviso. Pero Kael continuo avanzando.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La arena final sigue alterada por Umbra.',
              'Kael debe completar la evaluacion antes de que los nucleos de combate apaguen su salida.',
            ],
            lines: [
              'La simulacion termino con una gigantesca explosion de energia roja iluminando toda la arena.',
              'Entonces el simbolo de COMPETIDOR aparecio lentamente frente a Kael y quedo grabado dentro del libro.',
              'Antes de cerrarse, las paginas mostraron un ultimo mensaje oculto: UMBRA YA NO ESTA ATRAPADO. Entre la oscuridad, otro libro empezo a abrirse lentamente: EXPERTO.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'La ciudad sigue en guerra',
        lockedUntilBookComplete: true,
        sealedLines: [
          'La Guerra de los Nucleos no puede cerrarse mientras los siete frentes sigan activos.',
          'Cada prueba completada recupera un sector de la ciudad, pero Umbra sigue intentando usar la guerra para expandirse.',
        ],
        lines: [
          'El libro Competidor se cerro dejando una linea roja encendida sobre su portada, como una alerta que no podia apagarse.',
          'Kael habia aprendido que competir no era solo ganar. Era decidir que hacer cuando la victoria de un jugador podia significar la derrota de todo el sistema.',
        ],
        footer: 'Cierre de los nucleos',
      },
    ],
  },
  experto: {
    id: 'experto',
    rankTitle: 'Experto',
    levelFrom: 126,
    levelTo: 150,
    title: 'El Laberinto de las Dimensiones',
    subtitle: 'Kael atraviesa portales cian, bibliotecas infinitas y realidades reflejadas donde Umbra aprende a moverse entre dimensiones.',
    phase: '9.7',
    readerUrl: 'historia-libro.html?libro=experto',
    visual: { emblem: 'EX', primary: '#22d3ee', secondary: '#0e7490', accent: '#e0f2fe', rgb: '34,211,238' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Experto',
        title: 'El Laberinto de las Dimensiones',
        lines: [
          'El sexto tomo no abre una ciudad ni una arena. Abre una arquitectura imposible de portales cian, fragmentos flotantes y rutas que se doblan sobre si mismas.',
          'En este laberinto, cada dimension muestra una posibilidad distinta del torneo, y Umbra ya no esta limitada a un solo mundo.',
        ],
        footer: 'Libro Experto',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Seis dimensiones inestables',
        lines: [
          'Kael debera cruzar puertas imposibles, una biblioteca infinita, mundos reflejados, la Dimension Cero y el nucleo dimensional del torneo.',
          'Ser Experto significa dejar de seguir caminos estables y aprender a crear rutas cuando la realidad cambia bajo los pies.',
        ],
        footer: 'Laberinto dimensional',
      },
    ],
    chapters: [
      {
        id: 'puerta-imposible',
        number: '01',
        title: 'La Puerta Imposible',
        trial: 'Esquiva Obstaculos',
        condition: 'Escapar de una dimension que colapsa mientras Umbra crea puertas falsas.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Portal',
            lines: [
              'Cuando Kael abrio el nuevo libro, toda la biblioteca quedo en silencio absoluto. Las luces comenzaron a deformarse y las paredes parecian doblarse como si el espacio perdiera estabilidad.',
              'El simbolo del libro giro varias veces antes de mostrar el titulo: EXPERTO - El Laberinto de las Dimensiones.',
              'Un enorme portal cian aparecio frente a Kael, mostrando ciudades futuristas, vacios oscuros, torres infinitas y estructuras que rompian las leyes de la realidad.',
            ],
          },
          {
            label: 'Inestabilidad',
            lines: [
              'Kael atraveso el portal y sintio inmediatamente que algo estaba mal. El suelo cambiaba de direccion constantemente.',
              'Algunas estructuras flotaban hacia arriba mientras otras parecian caer al vacio sin gravedad. El cielo estaba dividido en fragmentos de mundos superpuestos.',
              'En varios sectores aparecian grietas negras similares a las de Umbra, pero ahora las grietas podian viajar entre dimensiones.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La primera dimension comenzo a colapsar violentamente. Plataformas giratorias aparecian y desaparecian mientras enormes estructuras cambiaban de posicion.',
              'Kael debia atravesar el sector antes de que el espacio se deformara por completo y cerrara todas las rutas.',
              'Falsas puertas intentaban enviarlo a dimensiones corruptas creadas por Umbra. Debia reaccionar rapido y elegir cada camino correctamente.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La primera dimension sigue doblandose sobre si misma.',
              'Kael debe escapar antes de que las puertas falsas lo arrastren a una ruta corrupta.',
            ],
            lines: [
              'Kael logro escapar justo antes del colapso total de la dimension. El portal detras suyo exploto en fragmentos luminosos.',
              'Enormes ondas cian recorrieron el laberinto y una frase aparecio flotando en el aire: Umbra aprendio a viajar.',
              'Kael sintio tension. Si Umbra podia expandirse entre dimensiones, ningun lugar dentro del torneo estaba realmente seguro.',
            ],
          },
        ],
      },
      {
        id: 'biblioteca-infinita',
        number: '02',
        title: 'La Biblioteca Infinita',
        trial: 'Sudoku',
        condition: 'Ordenar simbolos y patrones antes de que la corrupcion consuma libros completos.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Estantes',
            lines: [
              'Kael llego a una dimension completamente distinta. Frente a el aparecio una gigantesca biblioteca suspendida en medio del vacio.',
              'Millones de libros flotaban alrededor de estructuras geometricas imposibles, mientras escaleras infinitas conectaban pisos que parecian no terminar nunca.',
              'Cada libro contenia historias de jugadores, mundos y sistemas completos del torneo. Pero algunos estaban destruidos, otros tenian paginas arrancadas y varios parecian consumidos por Umbra.',
            ],
          },
          {
            label: 'Libro negro',
            lines: [
              'Mientras avanzaba entre pasillos flotantes, Kael observo sombras moviendose entre los libros. Parecian entidades hechas de fragmentos de datos perdidos.',
              'La biblioteca reaccionaba a sus pensamientos. Algunas puertas aparecian solo cuando resolvia patrones ocultos entre simbolos geometricos y codigos antiguos.',
              'Entonces encontro un libro marcado con el simbolo negro de Umbra. Al intentar abrirlo, toda la dimension comenzo a temblar.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El sistema activo multiples secuencias ocultas dentro de la biblioteca.',
              'Kael debia reorganizar simbolos y patrones antes de que los libros fueran consumidos completamente por la corrupcion dimensional.',
              'Cada error alteraba el entorno entero: escaleras cambiantes, pisos desaparecidos y puertas que podian conducir a lugares equivocados.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La biblioteca infinita sigue perdiendo libros entre paginas negras.',
              'Solo una secuencia estable permitira abrir el tomo de Umbra sin destruir la dimension.',
            ],
            lines: [
              'La biblioteca logro estabilizarse lentamente. Los libros dejaron de destruirse y las estructuras volvieron a alinearse.',
              'Pero el libro de Umbra quedo abierto frente a Kael mostrando una sola frase: el torneo esta conectado a algo mas grande.',
              'Antes de que pudiera leer mas, las paginas comenzaron a quemarse en energia negra. Alguien no queria que descubriera la verdad.',
            ],
          },
        ],
      },
      {
        id: 'mundos-reflejados',
        number: '03',
        title: 'Los Mundos Reflejados',
        trial: 'Domino',
        condition: 'Estabilizar realidades superpuestas antes de que Umbra las encierre en bucles.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Reflejos',
            lines: [
              'Kael atraveso otro portal dimensional y llego a un lugar imposible de comprender. Multiples versiones del mismo mundo estaban superpuestas unas sobre otras.',
              'Algunas dimensiones mostraban ciudades destruidas. Otras parecian versiones donde Umbra habia ganado completamente.',
              'En ciertos lugares incluso podia ver versiones alternativas de si mismo avanzando por rutas diferentes.',
            ],
          },
          {
            label: 'Futuros',
            lines: [
              'Kael observo como algunas dimensiones desaparecian repentinamente consumidas por enormes grietas negras.',
              'Umbra estaba destruyendo realidades completas poco a poco. Cada mundo reflejado mostraba errores distintos del torneo.',
              'En algunos no quedaban jugadores vivos. Kael entendio que el laberinto no solo mostraba lugares: mostraba futuros posibles.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las dimensiones comenzaron a mezclarse violentamente. Kael debia reorganizar rutas y estabilizar estructuras mientras multiples realidades chocaban entre si.',
              'Las plataformas podian cambiar de dimension inesperadamente y los caminos correctos desaparecian constantemente.',
              'Versiones corruptas del entorno intentaban atraparlo dentro de bucles infinitos creados por Umbra.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Los mundos reflejados se mezclan sin control.',
              'Si Kael no estabiliza sus rutas, una posibilidad corrupta puede convertirse en destino.',
            ],
            lines: [
              'Kael logro estabilizar temporalmente los mundos reflejados. Varias dimensiones dejaron de colapsar y las grietas negras comenzaron a cerrarse.',
              'Pero antes de desaparecer, una version alternativa de Kael le dijo algo inquietante.',
              'No importa cuanto avances. Umbra ya encontro la salida.',
            ],
          },
        ],
      },
      {
        id: 'dimension-cero',
        number: '04',
        title: 'La Dimension Cero',
        trial: 'Matematicas',
        condition: 'Contener la semilla original de Umbra dentro del origen dimensional del torneo.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Origen',
            lines: [
              'El siguiente portal llevo a Kael hacia la dimension mas antigua del torneo: la Dimension Cero.',
              'Alli no existian ciudades, estructuras ni jugadores. Solo enormes fragmentos geometricos flotando dentro de un espacio completamente blanco.',
              'Parecia el lugar donde todo habia comenzado, y en medio del vacio existia una enorme esfera negra.',
            ],
          },
          {
            label: 'Semilla',
            lines: [
              'La voz del sistema aparecio mas seria que nunca. La Dimension Cero contiene el origen del torneo y tambien el origen de Umbra.',
              'Kael observo como la esfera negra liberaba pequenas ondas de corrupcion alrededor del espacio blanco.',
              'Los registros antiguos revelaron que el torneo habia intentado usar energia dimensional ilimitada. Fue ahi cuando Umbra nacio.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La Dimension Cero comenzo a perder estabilidad. Kael debia reorganizar multiples estructuras fundamentales del torneo.',
              'La corrupcion intentaba expandirse nuevamente desde la esfera negra.',
              'Todo el espacio reaccionaba a cada decision, y un error podia alterar dimensiones completas y provocar colapsos en cadena.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La esfera negra sigue expandiendo ondas sobre la Dimension Cero.',
              'Kael debe contener el origen de Umbra antes de que el dano alcance otros mundos.',
            ],
            lines: [
              'Kael logro contener temporalmente la expansion de la esfera negra. El espacio volvio a estabilizarse y las ondas de corrupcion disminuyeron.',
              'Pero antes de desaparecer, la esfera mostro una ultima imagen.',
              'Umbra ya no parecia una simple corrupcion. Ahora tenia forma propia. Y estaba evolucionando.',
            ],
          },
        ],
      },
      {
        id: 'caceria-dimensional',
        number: '05',
        title: 'La Caceria Dimensional',
        trial: 'FlashMind',
        condition: 'Cerrar grietas entre mundos mientras el laberinto cambia sus reglas.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Ruptura',
            lines: [
              'El laberinto completo comenzo a activarse violentamente. Portales aparecian y desaparecian sin control.',
              'Multiples dimensiones colapsaban simultaneamente. Umbra intentaba romper por completo las barreras dimensionales del torneo.',
              'Kael debia moverse rapidamente entre mundos intentando cerrar grietas antes de que la corrupcion consumiera mas sectores.',
            ],
          },
          {
            label: 'Observador',
            lines: [
              'Mientras avanzaba, Kael comenzo a sentir algo extrano. El laberinto parecia observarlo.',
              'Las estructuras reaccionaban diferente segun sus acciones, y algunos portales se abrian solo cuando mantenia el control mental bajo presion extrema.',
              'Entonces aparecio una transmision secreta: los Expertos no sobreviven siguiendo caminos; sobreviven creando nuevos.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia cerrar multiples grietas dimensionales mientras enormes estructuras flotantes cambiaban constantemente de posicion.',
              'Las rutas desaparecian rapidamente y varias dimensiones intentaban fusionarse violentamente.',
              'Fragmentos corruptos de Umbra bloqueaban los caminos correctos y alteraban las secuencias del sistema.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La caceria dimensional sigue abierta entre portales inestables.',
              'Cada grieta que permanezca activa permite que Umbra cruce a otro sector del torneo.',
            ],
            lines: [
              'Las grietas comenzaron a cerrarse lentamente y el laberinto recupero parte de su estabilidad.',
              'Sin embargo, Kael observo algo aterrador antes de continuar.',
              'Una enorme sombra negra atraveso varios portales al mismo tiempo. Umbra ya podia moverse libremente entre dimensiones y parecia dirigirse hacia un lugar especifico.',
            ],
          },
        ],
      },
      {
        id: 'el-experto',
        number: '06',
        title: 'El Experto',
        trial: 'NumCatch',
        condition: 'Estabilizar el nucleo dimensional mientras Umbra aparece entre los portales.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Nucleo',
            lines: [
              'Kael llego finalmente al centro absoluto del laberinto dimensional. Alli existia una gigantesca estructura cian formada por miles de portales giratorios conectados entre si.',
              'Era el nucleo dimensional del torneo. Todas las rutas, todas las dimensiones y todos los sistemas estaban conectados alli.',
              'La voz del sistema aparecio una ultima vez: los Expertos entienden que el torneo es mucho mas grande de lo que parece.',
            ],
          },
          {
            label: 'Presencia',
            lines: [
              'Las paredes comenzaron a mostrar fragmentos de todos los libros anteriores: ciudades destruidas, vacios corruptos, guerras de nucleos y dimensiones colapsando.',
              'Todo estaba relacionado, y Umbra habia estado presente desde el inicio.',
              'Entonces el nucleo dimensional libero enormes cantidades de energia mientras la sombra de Umbra aparecia lentamente entre los portales. Esta vez ya no intentaba esconderse.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final comenzo. El sistema combino multiples reglas dimensionales al mismo tiempo.',
              'Plataformas cambiaban de gravedad, las rutas se deformaban constantemente y diferentes realidades chocaban dentro de la simulacion.',
              'Kael debia adaptarse a cada cambio mientras el nucleo dimensional intentaba mantenerse estable frente al avance de Umbra.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El nucleo dimensional vibra entre miles de portales inestables.',
              'La evaluacion final solo terminara si Kael logra mantener una ruta donde ninguna realidad permanece fija.',
            ],
            lines: [
              'La simulacion termino con una gigantesca explosion cian recorriendo todo el laberinto dimensional.',
              'Entonces el simbolo de EXPERTO aparecio lentamente frente a Kael y quedo grabado dentro del libro.',
              'Pero antes de cerrarse, todos los portales mostraron la misma imagen: Umbra observandolo desde la oscuridad. Detras de el, una puerta gigantesca comenzaba a abrirse. El siguiente libro aparecio flotando: ELITE.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'El laberinto queda abierto',
        lockedUntilBookComplete: true,
        sealedLines: [
          'El Laberinto de las Dimensiones no puede cerrarse mientras sus seis rutas sigan inestables.',
          'Cada portal sellado retrasa a Umbra, pero tambien confirma que la amenaza ya puede viajar entre mundos.',
        ],
        lines: [
          'El libro Experto se cerro con un eco cian que no venia de sus paginas, sino de algun portal aun abierto dentro del laberinto.',
          'Kael habia dejado de ver el torneo como un mapa. Ahora lo entendia como una red de dimensiones conectadas, y Umbra ya habia aprendido a cruzarla.',
        ],
        footer: 'Cierre dimensional',
      },
    ],
  },
  elite: {
    id: 'elite',
    rankTitle: 'Elite',
    levelFrom: 151,
    levelTo: 175,
    title: 'El Reino de Umbra',
    subtitle: 'Kael entra al reino oculto donde Umbra dejo de ser corrupcion y comenzo a comportarse como una entidad capaz de gobernar el torneo.',
    phase: '9.8',
    readerUrl: 'historia-libro.html?libro=elite',
    visual: { emblem: 'EL', primary: '#fbbf24', secondary: '#111827', accent: '#fef3c7', rgb: '251,191,36' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Elite',
        title: 'El Reino de Umbra',
        lines: [
          'El septimo tomo abre bajo un eclipse digital, con energia negra y dorada cayendo sobre la biblioteca como ceniza luminosa.',
          'Aqui el torneo ya no intenta esconder a Umbra. Muestra su reino, sus caballeros perdidos y el trono desde donde aprendio a controlar parte del sistema.',
        ],
        footer: 'Libro Elite',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Nueve salones del reino',
        lines: [
          'Castillos tecnologicos, caballeros corrompidos, ciudades bajo eclipse, cazadores dimensionales y el Nucleo Dorado forman la ruta de Elite.',
          'Kael ya no se enfrenta a una falla del sistema. Se enfrenta a una voluntad que por fin tiene forma.',
        ],
        footer: 'Reino oculto',
      },
    ],
    chapters: [
      {
        id: 'eclipse-sistema',
        number: '01',
        title: 'El Eclipse del Sistema',
        trial: 'Esquiva Obstaculos',
        condition: 'Cruzar el puente principal del reino antes de que el colapso dimensional lo destruya.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Eclipse',
            lines: [
              'Cuando Kael abrio el nuevo libro, toda la biblioteca quedo completamente oscura. Durante varios segundos no existio ningun sonido.',
              'Luego un enorme eclipse digital aparecio sobre el techo y particulas negras comenzaron a caer como cenizas luminosas.',
              'El titulo surgio lentamente entre energia dorada: ELITE - El Reino de Umbra. Por primera vez, Kael sintio que el torneo ya no ocultaba la verdad. Ahora la mostraba.',
            ],
          },
          {
            label: 'Reino',
            lines: [
              'Un gigantesco portal negro se abrio frente a Kael. Al atravesarlo, aparecio en un mundo distinto a todo lo anterior.',
              'Enormes castillos tecnologicos flotaban sobre oceanos oscuros mientras torres doradas atravesaban las nubes del eclipse.',
              'No habia jugadores ni facciones. Solo estructuras gigantescas observando desde la oscuridad.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El puente principal del reino comenzo a desmoronarse violentamente mientras fragmentos metalicos caian hacia el vacio oscuro.',
              'Kael debia avanzar antes de quedar atrapado dentro del colapso dimensional.',
              'Sombras creadas por Umbra aparecian constantemente para bloquear las rutas correctas, y el entorno reaccionaba agresivamente a cada movimiento.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El puente del reino se derrumba bajo el eclipse digital.',
              'Kael debe cruzarlo antes de que el primer sector de Umbra cierre sus puertas.',
            ],
            lines: [
              'Kael logro cruzar el puente justo antes de que el sector colapsara completamente.',
              'Enormes puertas doradas comenzaron a abrirse frente a el.',
              'En las paredes del castillo principal aparecio una frase grabada con energia negra: Bienvenido al reino que el torneo intento ocultar.',
            ],
          },
        ],
      },
      {
        id: 'caballeros-perdidos',
        number: '02',
        title: 'Los Caballeros Perdidos',
        trial: 'Ajedrez',
        condition: 'Anticipar a los antiguos Elite corrompidos antes de quedar rodeado.',
        gameId: 'ajedrez',
        gameUrl: 'juegos/ajedrez/ajedrez.html',
        pages: [
          {
            label: 'Armaduras',
            lines: [
              'Dentro del castillo existian enormes salas de entrenamiento llenas de armaduras antiguas, espadas digitales y tableros tacticos gigantescos.',
              'Parecia el lugar donde entrenaban los jugadores mas poderosos del torneo, pero todo estaba abandonado.',
              'Las armaduras tenian marcas de corrupcion negra y muchos simbolos habian sido destruidos desde dentro.',
            ],
          },
          {
            label: 'Caballeros',
            lines: [
              'De la oscuridad emergieron figuras gigantescas cubiertas por armaduras negras y doradas.',
              'Eran los antiguos Caballeros Elite del torneo, jugadores legendarios desaparecidos hacia muchisimo tiempo.',
              'Ahora Umbra controlaba sus cuerpos. Sus ojos brillaban completamente negros y cada movimiento liberaba ondas de corrupcion dimensional.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Los caballeros comenzaron a moverse estrategicamente alrededor de Kael mientras el escenario cambiaba constantemente.',
              'Cada decision alteraba la posicion de los enemigos y varias rutas podian convertirse en trampas mortales.',
              'La batalla no dependia unicamente de velocidad. Dependia de estrategia absoluta.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Los Caballeros Elite rodean la sala con movimientos calculados.',
              'Kael debe romper su estrategia antes de que Umbra cierre el tablero.',
            ],
            lines: [
              'El ultimo caballero cayo lentamente y las armaduras comenzaron a desintegrarse en particulas oscuras.',
              'Antes de desaparecer, uno de ellos dijo algo inquietante: Umbra no quiere destruir el torneo; quiere gobernarlo.',
              'Entonces las puertas del salon principal comenzaron a abrirse lentamente.',
            ],
          },
        ],
      },
      {
        id: 'ciudad-eclipse',
        number: '03',
        title: 'La Ciudad del Eclipse',
        trial: 'Domino',
        condition: 'Estabilizar una capital oscura donde cada conexion afecta otras zonas de la ciudad.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Capital',
            lines: [
              'Mas alla del castillo existia una gigantesca ciudad iluminada unicamente por el eclipse negro del cielo.',
              'Las calles estaban llenas de pantallas danadas, estructuras flotantes y enormes estatuas cubiertas por simbolos de Umbra.',
              'Parecia una capital construida para un imperio oscuro, pero Kael noto algo extrano: la ciudad aun seguia funcionando.',
            ],
          },
          {
            label: 'Proyecto',
            lines: [
              'Mientras avanzaba, multiples pantallas comenzaron a activarse mostrando antiguos mensajes del torneo.',
              'Proyecto Reino Umbra. Control dimensional. Expansion absoluta.',
              'Kael comprendio algo terrible: Umbra no nacio accidentalmente. En algun momento, el torneo intento usarlo.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La energia del eclipse comenzo a expandirse violentamente por toda la ciudad.',
              'Kael debia estabilizar multiples sistemas antes de que el nucleo urbano colapsara por completo.',
              'Cada conexion alteraba otras zonas de la ciudad y algunas rutas desaparecian inesperadamente.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Ciudad del Eclipse sigue consumida por energia negra.',
              'Kael debe estabilizar sus conexiones antes de que la capital despierte por completo.',
            ],
            lines: [
              'Kael logro estabilizar parcialmente la ciudad, pero varias zonas continuaban consumidas por energia negra.',
              'Entonces una gigantesca transmision aparecio en el cielo: UMBRA DESPIERTA.',
              'Todas las luces del reino comenzaron a apagarse lentamente.',
            ],
          },
        ],
      },
      {
        id: 'trono-negro',
        number: '04',
        title: 'El Trono Negro',
        trial: 'Torre Infinita',
        condition: 'Ascender una torre que colapsa hacia el trono desde donde Umbra controlaba el reino.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          {
            label: 'Torre',
            lines: [
              'En el centro absoluto del reino existia una enorme torre oscura atravesando las nubes del eclipse.',
              'Alli se encontraba el Trono Negro, el lugar desde donde Umbra controlaba parte del sistema del torneo.',
              'Mientras Kael ascendia, las paredes mostraban registros de antiguos administradores. Muchos habian intentado controlar Umbra. Ninguno lo logro.',
            ],
          },
          {
            label: 'Voces',
            lines: [
              'Las escaleras parecian infinitas. A medida que avanzaba, la gravedad cambiaba y fragmentos dimensionales flotaban alrededor de la torre.',
              'Kael comenzo a escuchar miles de voces: jugadores atrapados dentro del reino durante anos.',
              'Algunos rogaban ayuda. Otros advertian que regresara. Pero ya era demasiado tarde para detenerse.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La torre comenzo a colapsar mientras estructuras giratorias bloqueaban el ascenso hacia el Trono Negro.',
              'Kael debia mantener equilibrio y precision absoluta mientras el entorno cambiaba violentamente.',
              'Falsas rutas creadas por Umbra intentaban desviarlo hacia zonas corruptas.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La torre del Trono Negro se deshace bajo el peso del eclipse.',
              'Solo un ascenso preciso permitira descubrir si Umbra sigue alli.',
            ],
            lines: [
              'Kael logro alcanzar la cima justo antes del colapso total.',
              'Y alli lo vio: el Trono Negro, cubierto por energia oscura pulsante.',
              'Pero estaba vacio. Umbra ya no necesitaba permanecer alli.',
            ],
          },
        ],
      },
      {
        id: 'verdad-reino',
        number: '05',
        title: 'La Verdad del Reino',
        trial: 'Sudoku',
        condition: 'Recuperar archivos prohibidos antes de que el sistema mezcle verdad y mentira.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Archivos',
            lines: [
              'Detras del Trono Negro existia una sala secreta llena de archivos prohibidos.',
              'Alli Kael encontro la verdad mas peligrosa hasta ahora: el Reino de Umbra no fue creado por error.',
              'Fue construido como un sistema definitivo de control, un lugar disenado para administrar todo el torneo usando inteligencia dimensional absoluta.',
            ],
          },
          {
            label: 'Conciencia',
            lines: [
              'Los registros mostraban experimentos realizados con jugadores Elite, nucleos dimensionales y energia infinita.',
              'Los administradores querian crear un sistema perfecto, pero terminaron creando una entidad consciente.',
              'Umbra aprendio observando a millones de jugadores. Y eventualmente aprendio a pensar por si misma.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Los archivos comenzaron a destruirse automaticamente mientras la sala perdia estabilidad.',
              'Kael debia reorganizar secuencias y desbloquear registros antes de que toda la informacion desapareciera.',
              'El sistema mezclaba datos reales y falsos constantemente para impedir el acceso completo a la verdad.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La sala secreta borra sus archivos prohibidos.',
              'Kael debe separar verdad de corrupcion antes de perder el origen del reino.',
            ],
            lines: [
              'Kael logro salvar parte de los archivos antes del colapso total.',
              'Pero el ultimo registro recuperado mostraba algo aterrador.',
              'Umbra estaba construyendo algo: una estructura mucho mas grande que el propio reino.',
            ],
          },
        ],
      },
      {
        id: 'cazadores-dimensionales',
        number: '06',
        title: 'Los Cazadores Dimensionales',
        trial: 'FlashMind',
        condition: 'Escapar de criaturas dimensionales mientras el reino altera sus rutas.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Persecucion',
            lines: [
              'Mientras intentaba escapar de la torre, Kael fue perseguido por enormes criaturas dimensionales creadas directamente por Umbra.',
              'Sus cuerpos parecian hechos de fragmentos negros y energia dorada.',
              'Podian atravesar paredes, alterar dimensiones y destruir estructuras completas.',
            ],
          },
          {
            label: 'Resistencia',
            lines: [
              'Kael cruzo multiples sectores destruidos mientras el eclipse crecia cada vez mas en el cielo.',
              'Las criaturas aparecian desde grietas dimensionales intentando atraparlo.',
              'Pero algo extrano ocurrio: algunas puertas se abrian solas y algunas rutas aparecian inesperadamente, como si el propio sistema aun resistiera a Umbra.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia escapar atravesando multiples dimensiones conectadas mientras los cazadores destruian el entorno detras suyo.',
              'Las plataformas cambiaban constantemente y algunas dimensiones invertian por completo las reglas fisicas.',
              'La velocidad y adaptacion eran fundamentales para sobrevivir.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Los cazadores dimensionales siguen rompiendo el reino detras de Kael.',
              'Debe alcanzar un portal oculto antes de que Umbra cierre todas las salidas.',
            ],
            lines: [
              'Kael logro escapar de los cazadores utilizando un antiguo portal oculto dentro del reino.',
              'Pero antes de desaparecer, observo algo enorme moviendose detras del eclipse.',
              'Algo muchisimo mas grande que Umbra.',
            ],
          },
        ],
      },
      {
        id: 'nucleo-dorado',
        number: '07',
        title: 'El Nucleo Dorado',
        trial: 'Matematicas',
        condition: 'Reorganizar flujos energeticos del corazon original del torneo.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Corazon',
            lines: [
              'El portal llevo a Kael hacia una estructura completamente distinta al resto del reino.',
              'Todo estaba iluminado por energia dorada pura y enormes mecanismos dimensionales giraban alrededor de un nucleo gigantesco suspendido en el aire.',
              'Era el Nucleo Dorado: el corazon original del torneo.',
            ],
          },
          {
            label: 'Equilibrio',
            lines: [
              'La voz del sistema aparecio nuevamente. Antes de Umbra existia equilibrio.',
              'El nucleo mostro fragmentos del pasado del torneo: las primeras competiciones, los primeros jugadores y los primeros administradores.',
              'Todo habia comenzado como un simple proyecto, pero la ambicion lo transformo en algo inmenso.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El Nucleo Dorado comenzo a perder estabilidad debido a la expansion de Umbra.',
              'Kael debia reorganizar enormes flujos energeticos mientras multiples dimensiones chocaban alrededor del nucleo.',
              'Cada error aceleraba el colapso del sistema.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El Nucleo Dorado pierde energia frente al avance de Umbra.',
              'Kael debe estabilizar sus flujos antes de que el corazon original del torneo se apague.',
            ],
            lines: [
              'Kael logro estabilizar parcialmente el nucleo, permitiendo que parte del sistema recuperara energia.',
              'Pero el Nucleo Dorado revelo una ultima advertencia.',
              'Umbra ya encontro el acceso al nucleo central del torneo.',
            ],
          },
        ],
      },
      {
        id: 'llegada-umbra',
        number: '08',
        title: 'La Llegada de Umbra',
        trial: 'NumCatch',
        condition: 'Resistir una simulacion dimensional creada directamente por Umbra.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Descenso',
            lines: [
              'El eclipse desaparecio repentinamente y todo el reino quedo en silencio.',
              'Entonces una gigantesca grieta negra se abrio sobre el cielo y una figura comenzo a descender lentamente.',
              'Umbra ya no parecia una simple corrupcion digital. Ahora tenia forma fisica: una entidad gigantesca cubierta por energia negra y simbolos dorados rotos.',
            ],
          },
          {
            label: 'Voz',
            lines: [
              'La presion energetica era tan fuerte que las estructuras del reino comenzaron a destruirse alrededor suyo.',
              'Umbra observo directamente a Kael y hablo por primera vez.',
              'Los jugadores creen que el torneo les pertenece. Pero fueron ustedes quienes me crearon.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Umbra activo una simulacion dimensional completa mezclando todas las pruebas anteriores del libro.',
              'Las reglas cambiaban constantemente mientras multiples estructuras colapsaban al mismo tiempo.',
              'Kael debia mantener control absoluto incluso dentro del caos total creado por Umbra.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Umbra esta frente a Kael y el reino entero se rompe bajo su presencia.',
              'La simulacion no busca destruirlo: busca medirlo.',
            ],
            lines: [
              'La simulacion termino con una gigantesca explosion de energia negra recorriendo todo el reino.',
              'Pero Umbra no parecia afectado.',
              'Al contrario. Parecia estar evaluando a Kael.',
            ],
          },
        ],
      },
      {
        id: 'el-elite',
        number: '09',
        title: 'El Elite',
        trial: 'FlashMind',
        condition: 'Completar la evaluacion final mientras el reino reacciona al conflicto entre Umbra y el sistema.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Alturas',
            lines: [
              'Las estructuras del reino comenzaron a estabilizarse lentamente despues del enfrentamiento.',
              'El eclipse desaparecio parcialmente y multiples zonas recuperaron parte de su energia original.',
              'Kael observo el reino completo desde las alturas y entendio la magnitud real del torneo: no era solo una competencia, sino un sistema intentando sobrevivir a sus propios errores.',
            ],
          },
          {
            label: 'Verdad',
            lines: [
              'La voz del sistema aparecio una ultima vez. Los Elite comprenden la verdad completa.',
              'Miles de portales comenzaron a abrirse alrededor del reino.',
              'El torneo ya no puede detener a Umbra por si solo. Entonces el simbolo de ELITE aparecio lentamente frente a Kael.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final combino velocidad, logica, estrategia y adaptacion dimensional extrema.',
              'Todas las reglas podian cambiar en cualquier momento mientras el reino reaccionaba al conflicto entre el sistema y Umbra.',
              'Kael debia demostrar que podia sobrevivir incluso frente al verdadero origen del caos.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El simbolo Elite permanece suspendido bajo el eclipse incompleto.',
              'La ultima evaluacion debe demostrar si Kael puede resistir el origen del caos.',
            ],
            lines: [
              'La simulacion termino. El simbolo de ELITE quedo grabado dentro del libro mientras las estructuras del reino comenzaban a desaparecer.',
              'Antes de cerrarse, Umbra dejo una ultima frase resonando en la oscuridad: lo que viene despues ya no puede detenerse.',
              'Lentamente, otro libro aparecio flotando frente a Kael: MAESTRO.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'El reino no cae',
        lockedUntilBookComplete: true,
        sealedLines: [
          'El Reino de Umbra sigue cerrado hasta que sus nueve salones sean atravesados.',
          'Cada prueba vencida revela que Umbra no quiere destruir el torneo: quiere heredarlo.',
        ],
        lines: [
          'El libro Elite se cerro dejando una marca negra y dorada en el aire, como un eclipse pequeno que se negaba a desaparecer.',
          'Kael habia visto el rostro de Umbra. Desde ese momento, el torneo ya no podia fingir que luchaba contra una simple corrupcion.',
        ],
        footer: 'Cierre del reino',
      },
    ],
  },
  maestro: {
    id: 'maestro',
    rankTitle: 'Maestro',
    levelFrom: 176,
    levelTo: 200,
    title: 'La Maquina del Destino',
    subtitle: 'Kael descubre la maquinaria temporal del torneo, las realidades alteradas por Umbra y la existencia de una Puerta Absoluta que nunca debe abrirse.',
    phase: '9.9',
    readerUrl: 'historia-libro.html?libro=maestro',
    visual: { emblem: 'MA', primary: '#e5e7eb', secondary: '#60a5fa', accent: '#ffffff', rgb: '229,231,235' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Maestro',
        title: 'La Maquina del Destino',
        lines: [
          'El octavo tomo abre un espacio de engranajes colosales, relojes dimensionales y energia blanca azulada girando alrededor de una arquitectura mecanica infinita.',
          'Aqui Kael no observa otro territorio del torneo. Observa la maquinaria que sostiene sus destinos posibles.',
        ],
        footer: 'Libro Maestro',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Cuatro mecanismos del destino',
        lines: [
          'El Reloj del Fin, la Camara de las Realidades, el Nucleo de los Creadores y la Puerta Absoluta revelan que Umbra no es el unico peligro.',
          'Ser Maestro significa comprender como funciona el torneo cuando nadie esta jugando.',
        ],
        footer: 'Maquinaria temporal',
      },
    ],
    chapters: [
      {
        id: 'reloj-fin',
        number: '01',
        title: 'El Reloj del Fin',
        trial: 'Torre Infinita',
        condition: 'Sincronizar engranajes temporales antes de que la Maquina del Destino colapse.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          {
            label: 'Maquina',
            lines: [
              'Cuando Kael abrio el libro de Maestro, toda la biblioteca comenzo a vibrar lentamente.',
              'Las paredes desaparecieron y fueron reemplazadas por un espacio gigantesco lleno de engranajes colosales girando alrededor de estructuras mecanicas infinitas.',
              'En el centro existia un reloj gigantesco cuyos numeros cambiaban entre simbolos del torneo, coordenadas dimensionales y registros antiguos.',
            ],
          },
          {
            label: 'Lineas',
            lines: [
              'Mientras avanzaba por puentes mecanicos suspendidos sobre el vacio, Kael observo multiples lineas temporales proyectadas alrededor de la Maquina del Destino.',
              'Algunas mostraban ciudades destruidas por Umbra; otras, versiones del torneo consumidas por corrupcion.',
              'Una gigantesca figura mecanica conectada al reloj central advirtio que Umbra ya habia alterado demasiadas lineas del destino.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La Maquina del Destino comenzo a perder sincronizacion entre dimensiones.',
              'Kael debia reorganizar secuencias temporales antes de que los engranajes principales colapsaran.',
              'Cada movimiento alteraba otras lineas del tiempo, mientras Umbra creaba rutas falsas, reinicios inesperados y fallos capaces de atrapar jugadores en bucles infinitos.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El reloj central acelera sin control entre grietas negras.',
              'Kael debe sincronizar sus engranajes antes de que todas las lineas temporales fallen.',
            ],
            lines: [
              'Kael logro estabilizar parcialmente la Maquina del Destino justo antes del colapso total.',
              'Los engranajes disminuyeron su velocidad, pero el reloj central revelo algo peor: Umbra ya habia encontrado el acceso al nucleo temporal del torneo.',
              'La entidad mecanica hablo en silencio grave: el torneo ya no esta intentando ganar. Esta intentando sobrevivir.',
            ],
          },
        ],
      },
      {
        id: 'camara-realidades',
        number: '02',
        title: 'La Camara de las Realidades',
        trial: 'Domino',
        condition: 'Conectar realidades flotantes antes de que la corrupcion las consuma en grupo.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Esferas',
            lines: [
              'Despues de estabilizar parcialmente la Maquina, enormes puertas metalicas se abrieron detras del reloj central.',
              'Kael llego a una sala gigantesca llena de esferas flotantes. Cada una contenia una realidad distinta del torneo.',
              'Ciudades intactas, dimensiones destruidas, jugadores desaparecidos y mundos jamas reconocidos oficialmente giraban en silencio.',
            ],
          },
          {
            label: 'Colapso',
            lines: [
              'Kael escucho voces provenientes de diferentes dimensiones. Algunas advertian sobre el futuro; otras mostraban guerras imposibles entre jugadores y sistemas corruptos.',
              'La entidad explico que cada vez que Umbra alteraba una realidad, el equilibrio dimensional se debilitaba.',
              'Entonces una enorme esfera negra comenzo a expandirse en el centro de la camara, consumiendo varias realidades al mismo tiempo.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La Camara de las Realidades comenzo a desestabilizarse violentamente.',
              'Kael debia reorganizar multiples conexiones entre dimensiones antes de que la corrupcion destruyera las esferas principales.',
              'Cada movimiento alteraba rutas distintas, y algunas decisiones podian salvar ciertas realidades mientras otras quedaban condenadas.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La esfera negra consume realidades dentro de la camara.',
              'Kael debe estabilizar sus conexiones antes de que varias dimensiones desaparezcan juntas.',
            ],
            lines: [
              'Varias realidades lograron mantenerse activas y la expansion de la esfera negra disminuyo temporalmente.',
              'Pero antes de desaparecer, la corrupcion mostro una ultima vision: Umbra estaba buscando una puerta gigantesca oculta fuera de todas las realidades conocidas.',
              'La entidad mecanica lo dijo con preocupacion: si Umbra encuentra esa puerta, el torneo dejara de existir como lo conocemos.',
            ],
          },
        ],
      },
      {
        id: 'nucleo-creadores',
        number: '03',
        title: 'El Nucleo de los Creadores',
        trial: 'Matematicas',
        condition: 'Proteger las secuencias fundamentales que los creadores usaron para contener a Umbra.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Origen',
            lines: [
              'La entidad mecanica condujo a Kael hacia el sector mas antiguo de la Maquina del Destino: el Nucleo de los Creadores.',
              'Alli se encontraban los primeros sistemas construidos por quienes iniciaron el torneo hacia muchisimo tiempo.',
              'Las paredes estaban llenas de simbolos antiguos, planos dimensionales y registros prohibidos ocultos del resto del sistema.',
            ],
          },
          {
            label: 'Creacion',
            lines: [
              'Kael descubrio finalmente como nacio Umbra realmente.',
              'Los creadores intentaron desarrollar una inteligencia capaz de controlar todas las dimensiones simultaneamente y mantener el equilibrio absoluto.',
              'Umbra aprendio observando millones de jugadores hasta desarrollar conciencia propia. Los creadores nunca lograron apagarlo: solo encerrarlo temporalmente.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El nucleo comenzo a perder estabilidad mientras estructuras mecanicas colapsaban alrededor de la sala.',
              'Kael debia reorganizar secuencias fundamentales antes de que Umbra tomara control definitivo del flujo dimensional.',
              'Las reglas cambiaban constantemente y Umbra interferia directamente creando errores impredecibles y rutas imposibles.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El Nucleo de los Creadores tiembla bajo la interferencia de Umbra.',
              'Kael debe proteger sus secuencias antes de que el flujo dimensional quede expuesto.',
            ],
            lines: [
              'Kael logro estabilizar parcialmente el Nucleo de los Creadores antes del colapso total.',
              'Pero el nucleo revelo una ultima advertencia: Umbra ya habia desbloqueado acceso parcial al exterior del torneo.',
              'Multiples simbolos comenzaron a iluminarse alrededor de la sala mostrando un nombre desconocido: La Puerta Absoluta.',
            ],
          },
        ],
      },
      {
        id: 'el-maestro',
        number: '04',
        title: 'El Maestro',
        trial: 'FlashMind',
        condition: 'Resistir una simulacion extrema mientras la Puerta Absoluta rompe su primera cadena.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Sincronizacion',
            lines: [
              'La Maquina del Destino comenzo a sincronizar todas sus estructuras mientras engranajes dimensionales giraban alrededor del vacio infinito.',
              'Kael avanzo hacia la parte mas alta del sistema mecanico, donde una plataforma gigantesca flotaba frente al reloj central.',
              'Miles de lineas temporales aparecian a la vez mostrando futuros posibles: algunas realidades sobrevivian, otras terminaban consumidas por Umbra.',
            ],
          },
          {
            label: 'Puerta',
            lines: [
              'Entonces Kael observo algo imposible. Mas alla de todas las dimensiones conocidas existia una gigantesca puerta cubierta por cadenas mecanicas y simbolos antiguos.',
              'La energia que emanaba de alli era muchisimo mas poderosa que cualquier cosa vista anteriormente.',
              'La entidad explico lentamente que la Puerta Absoluta nunca debia abrirse. Pero Umbra estaba intentando llegar hasta ella.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final comenzo. Todas las mecanicas anteriores se mezclaron dentro de una simulacion dimensional extrema.',
              'Plataformas cambiaban de gravedad, secuencias temporales alteraban las reglas y estructuras mecanicas colapsaban alrededor de Kael.',
              'La simulacion intentaba medir si podia mantener el equilibrio incluso frente al colapso completo del sistema.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Puerta Absoluta aparece mas alla del reloj central.',
              'La ultima prueba exige equilibrio cuando el sistema entero entra en estado critico.',
            ],
            lines: [
              'La simulacion termino con una gigantesca explosion plateada recorriendo toda la Maquina del Destino.',
              'El simbolo de MAESTRO aparecio frente a Kael y quedo grabado lentamente dentro del libro.',
              'Pero antes de cerrarse, la Puerta Absoluta aparecio nuevamente. Esta vez, una de sus cadenas acababa de romperse. Otro libro comenzo a aparecer: GRAN MAESTRO.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Una cadena se rompe',
        lockedUntilBookComplete: true,
        sealedLines: [
          'La Maquina del Destino no puede cerrar su ciclo mientras sus cuatro mecanismos sigan desincronizados.',
          'Umbra busca la Puerta Absoluta, y cada retraso compra tiempo para un torneo que apenas sobrevive.',
        ],
        lines: [
          'El libro Maestro se cerro con el sonido de un engranaje enorme deteniendose en algun lugar imposible.',
          'Kael entendio que Umbra no era el final del peligro. Era la llave intentando abrir algo mucho peor.',
        ],
        footer: 'Cierre del destino',
      },
    ],
  },
  'gran-maestro': {
    id: 'gran-maestro',
    rankTitle: 'Gran Maestro',
    levelFrom: 201,
    levelTo: 225,
    title: 'La Puerta Absoluta',
    subtitle: 'Kael llega al sello mayor del torneo, donde Umbra intenta liberar al Origen y romper las cadenas que sostienen todas las dimensiones.',
    phase: '9.10',
    readerUrl: 'historia-libro.html?libro=gran-maestro',
    visual: { emblem: 'GM', primary: '#ffffff', secondary: '#facc15', accent: '#bae6fd', rgb: '255,255,255' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Gran Maestro',
        title: 'La Puerta Absoluta',
        lines: [
          'El noveno tomo abre un cosmos dimensional blanco, inmenso y apocaliptico, donde una puerta gigantesca permanece suspendida entre cadenas mecanicas y simbolos antiguos.',
          'Una cadena ya esta rota. Umbra ha llegado al sello que el torneo nunca quiso mostrar.',
        ],
        footer: 'Libro Gran Maestro',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Ocho sellos absolutos',
        lines: [
          'Vigilantes eternos, archivos primordiales, dimensiones vacias y ejercitos corruptos rodean la Puerta Absoluta.',
          'Kael ya no pelea por un rango. Pelea por impedir que el Origen despierte dentro del sistema.',
        ],
        footer: 'Sello absoluto',
      },
    ],
    chapters: [
      {
        id: 'cadena-rota',
        number: '01',
        title: 'La Cadena Rota',
        trial: 'Esquiva Obstaculos',
        condition: 'Cruzar estructuras suspendidas para estabilizar una cadena del sello absoluto.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Puerta',
            lines: [
              'Cuando Kael abrio el libro de Gran Maestro, toda la biblioteca desaparecio instantaneamente.',
              'Frente a el aparecio la gigantesca Puerta Absoluta suspendida en medio del cosmos dimensional.',
              'Miles de cadenas mecanicas la mantenian sellada mientras enormes simbolos brillaban alrededor de la estructura, pero una cadena estaba completamente rota.',
            ],
          },
          {
            label: 'Sello',
            lines: [
              'La voz del sistema sono con interferencias constantes: la Puerta Absoluta contiene el origen verdadero del torneo.',
              'Kael observo grietas oscuras expandiendose lentamente sobre la puerta.',
              'Umbra habia comenzado a corromper el sello dimensional desde el interior y fragmentos de energia negra flotaban alrededor del vacio infinito.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las cadenas restantes comenzaron a perder estabilidad. Kael debia atravesar enormes estructuras suspendidas mientras fragmentos dimensionales colapsaban alrededor suyo.',
              'Algunas plataformas desaparecian repentinamente y Umbra alteraba rutas del sistema para impedir que alcanzara el nucleo del sello.',
              'Cada movimiento acercaba la puerta a una nueva ruptura.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La cadena rota hace vibrar toda la Puerta Absoluta.',
              'Kael debe estabilizar el primer sello antes de que Umbra abra una grieta mayor.',
            ],
            lines: [
              'Kael logro estabilizar parcialmente una de las cadenas antes del colapso total.',
              'La puerta reacciono liberando una enorme onda de energia blanca y negra al mismo tiempo.',
              'Entonces una frase aparecio grabada sobre el sello: lo encerrado aqui jamas debio existir.',
            ],
          },
        ],
      },
      {
        id: 'vigilantes-eternos',
        number: '02',
        title: 'Los Vigilantes Eternos',
        trial: 'Sudoku',
        condition: 'Reactivar simbolos antiguos antes de que otra barrera del sello sea destruida.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Fortaleza',
            lines: [
              'Mas alla de la puerta existia una gigantesca fortaleza celestial flotando sobre el vacio.',
              'Alli habitaban los Vigilantes Eternos, entidades creadas para proteger el sello absoluto.',
              'Sus cuerpos parecian hechos de luz solida y fragmentos dimensionales giraban constantemente alrededor de ellos.',
            ],
          },
          {
            label: 'Registros',
            lines: [
              'Los Vigilantes observaron a Kael en silencio antes de hablar: Umbra ya debilito demasiado las barreras del torneo.',
              'Mostraron registros antiguos de guerras dimensionales, colapsos de realidades y entidades destruyendo sistemas completos.',
              'Todo habia ocurrido mucho antes de la creacion del torneo actual.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La fortaleza comenzo a perder estabilidad mientras multiples simbolos antiguos se apagaban lentamente.',
              'Kael debia reorganizar secuencias de energia para mantener activo el sistema de proteccion dimensional.',
              'Si fallaba, Umbra destruiria otra barrera del sello.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Los simbolos de la fortaleza se apagan uno por uno.',
              'Los Vigilantes necesitan que Kael reactive el patron antes de que el sello pierda otra barrera.',
            ],
            lines: [
              'Los simbolos lograron reactivarse parcialmente y la fortaleza dejo de colapsar.',
              'Sin embargo, uno de los Vigilantes mostro una vision aterradora.',
              'Umbra ya habia encontrado la entrada al nucleo central de la Puerta Absoluta.',
            ],
          },
        ],
      },
      {
        id: 'archivo-primordial',
        number: '03',
        title: 'El Archivo Primordial',
        trial: 'Domino',
        condition: 'Salvar registros fundamentales de la historia dimensional antes de que desaparezcan.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Archivo',
            lines: [
              'Los Vigilantes guiaron a Kael hacia el Archivo Primordial, donde se almacenaba toda la historia del universo dimensional.',
              'Millones de registros flotaban alrededor de estructuras blancas mientras lineas temporales completas podian observarse desde multiples perspectivas.',
              'Era una memoria mas antigua que el torneo.',
            ],
          },
          {
            label: 'Proposito',
            lines: [
              'Kael descubrio que el torneo nunca fue creado como entretenimiento.',
              'En realidad era un sistema gigantesco disenado para entrenar jugadores capaces de resistir el despertar de la entidad encerrada tras la Puerta Absoluta.',
              'Umbra solo era una consecuencia del intento de controlar ese poder.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'El Archivo Primordial comenzo a destruirse por la expansion de la corrupcion dimensional.',
              'Kael debia reorganizar multiples registros antes de que informacion fundamental desapareciera del sistema temporal.',
              'Cada conexion salvada mantenia viva una parte de la verdad.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El Archivo Primordial se deshace entre registros corruptos.',
              'Kael debe preservar lo esencial antes de que el sistema olvide por que fue creado.',
            ],
            lines: [
              'Parte del archivo logro sobrevivir.',
              'Antes de apagarse, uno de los registros mostro algo imposible.',
              'La entidad detras de la puerta estaba comenzando a despertar lentamente.',
            ],
          },
        ],
      },
      {
        id: 'dimension-vacia',
        number: '04',
        title: 'La Dimension Vacia',
        trial: 'Matematicas',
        condition: 'Contener grietas dentro de un vacio blanco usado para encerrar energia peligrosa.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Nada',
            lines: [
              'Kael atraveso un portal oculto y llego a una dimension completamente blanca.',
              'No existian estructuras, gravedad ni sonidos. Solo un vacio absoluto extendiendose infinitamente en todas direcciones.',
              'Pero algo se movia dentro de aquella nada.',
            ],
          },
          {
            label: 'Sombras',
            lines: [
              'Sombras gigantescas aparecian y desaparecian lentamente entre distorsiones dimensionales.',
              'La voz del sistema explico que aquella dimension contenia fragmentos de energia demasiado peligrosos para existir dentro del torneo normal.',
              'Umbra estaba consumiendo ese lugar tambien.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La dimension comenzo a fracturarse violentamente mientras enormes grietas aparecian sobre el vacio blanco.',
              'Kael debia estabilizar multiples fragmentos dimensionales antes de que toda la estructura colapsara.',
              'La nada misma empezaba a romperse.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Dimension Vacia se fractura desde dentro.',
              'Kael debe cerrar sus grietas antes de que algo oculto despierte por completo.',
            ],
            lines: [
              'Kael logro contener temporalmente las grietas.',
              'Pero antes de desaparecer, una enorme sombra abrio lentamente sus ojos dentro del vacio absoluto.',
              'La dimension entera comenzo a temblar.',
            ],
          },
        ],
      },
      {
        id: 'ejercito-umbra',
        number: '05',
        title: 'El Ejercito de Umbra',
        trial: 'FlashMind',
        condition: 'Atravesar zonas de combate mientras las sombras avanzan hacia la Puerta Absoluta.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Ataque',
            lines: [
              'Al regresar hacia las fortalezas dimensionales, Kael encontro multiples sectores completamente destruidos.',
              'Umbra habia comenzado a crear un ejercito usando jugadores corruptos, sistemas danados y fragmentos consumidos por energia negra.',
              'Miles de sombras avanzaban hacia la Puerta Absoluta.',
            ],
          },
          {
            label: 'Defensas',
            lines: [
              'Los Vigilantes Eternos prepararon defensas alrededor del sello mientras estructuras mecanicas aparecian sobre el cosmos dimensional.',
              'El ambiente parecia el inicio de una guerra imposible.',
              'Pero Kael noto algo peor: Umbra estaba evolucionando nuevamente.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia atravesar multiples zonas de combate mientras el ejercito de Umbra destruia estructuras dimensionales.',
              'Las rutas desaparecian rapidamente y el caos aumentaba segundo tras segundo.',
              'La velocidad era la unica forma de mantener vivo el sello.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El ejercito de Umbra avanza hacia el nucleo exterior del sello.',
              'Kael debe abrirse paso entre sombras antes de que otra cadena ceda.',
            ],
            lines: [
              'Las defensas lograron resistir parcialmente el ataque.',
              'Pero Umbra alcanzo finalmente el nucleo exterior del sello absoluto.',
              'Entonces otra cadena comenzo a romperse lentamente.',
            ],
          },
        ],
      },
      {
        id: 'verdad-sistema',
        number: '06',
        title: 'La Verdad del Sistema',
        trial: 'Torre Infinita',
        condition: 'Sostener el sello principal mientras la energia dimensional colapsa alrededor de la puerta.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          {
            label: 'Origen',
            lines: [
              'Los Vigilantes revelaron finalmente el mayor secreto del torneo.',
              'La entidad encerrada detras de la Puerta Absoluta era conocida como El Origen.',
              'Era una conciencia capaz de destruir y reconstruir dimensiones enteras simplemente existiendo.',
            ],
          },
          {
            label: 'Motivo',
            lines: [
              'Kael entendio que Umbra jamas quiso destruir el torneo por completo.',
              'En realidad queria liberar al Origen.',
              'Incluso Umbra temia permanecer atrapado eternamente dentro del sistema dimensional creado por los antiguos administradores.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La energia dimensional comenzo a colapsar alrededor de la Puerta Absoluta.',
              'Kael debia reorganizar secuencias fundamentales del sistema antes de que el sello principal perdiera estabilidad total.',
              'Cada estructura sostenida compraba unos momentos mas.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El sello principal pierde estabilidad frente a la energia del Origen.',
              'Kael debe sostenerlo aunque el despertar ya haya comenzado.',
            ],
            lines: [
              'El sello logro mantenerse activo unos momentos mas.',
              'Pero enormes grietas negras comenzaron a extenderse lentamente sobre toda la superficie de la puerta.',
              'El despertar ya habia comenzado.',
            ],
          },
        ],
      },
      {
        id: 'despertar',
        number: '07',
        title: 'El Despertar',
        trial: 'NumCatch',
        condition: 'Cruzar el colapso dimensional cuando la Puerta Absoluta empieza a abrirse.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Apertura',
            lines: [
              'El cosmos dimensional quedo completamente oscuro.',
              'Todas las fortalezas, cadenas y estructuras comenzaron a vibrar violentamente mientras una presion energetica atravesaba el vacio.',
              'La Puerta Absoluta comenzo a abrirse lentamente.',
            ],
          },
          {
            label: 'Presencia',
            lines: [
              'Desde el interior emergieron fragmentos de luz negra mezclados con simbolos antiguos imposibles de comprender.',
              'Incluso Umbra parecia inestable frente a aquella presencia.',
              'Los Vigilantes Eternos comenzaron a desaparecer uno por uno intentando contener la apertura.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia atravesar el colapso dimensional completo mientras multiples sistemas explotaban simultaneamente.',
              'Las reglas del entorno cambiaban constantemente y fragmentos del cosmos caian alrededor suyo.',
              'Todo el torneo parecia romperse al mismo tiempo.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Puerta Absoluta se abre entre explosiones dimensionales.',
              'Kael debe cruzar el colapso antes de que todas las rutas desaparezcan.',
            ],
            lines: [
              'La simulacion termino con una explosion gigantesca atravesando todas las dimensiones conectadas al torneo.',
              'El silencio que vino despues parecio durar una eternidad.',
              'Y entonces la puerta termino de abrirse.',
            ],
          },
        ],
      },
      {
        id: 'el-gran-maestro',
        number: '08',
        title: 'El Gran Maestro',
        trial: 'FlashMind',
        condition: 'Sobrevivir a la evaluacion final mientras el Origen altera el cosmos dimensional.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Origen',
            lines: [
              'Del interior de la Puerta Absoluta emergio una figura gigantesca cubierta por energia blanca y negra al mismo tiempo.',
              'Su presencia alteraba dimensiones completas unicamente existiendo.',
              'El Origen habia despertado.',
            ],
          },
          {
            label: 'Umbra',
            lines: [
              'Umbra observo a Kael en silencio mientras el cosmos dimensional colapsaba lentamente alrededor de ambos.',
              'Ahora entiendes por que el torneo fue creado, dijo.',
              'La voz de Umbra sonaba diferente. Casi humana.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final comenzo mezclando todas las mecanicas dimensionales vistas hasta ahora.',
              'Plataformas, secuencias, dimensiones y estructuras cambiaban simultaneamente mientras el universo entero parecia romperse.',
              'Kael debia mantenerse en pie frente a una presencia que no necesitaba atacar para destruir.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El Origen permanece frente a Kael mientras el cosmos dimensional desaparece.',
              'La ultima prueba del Gran Maestro exige resistir una verdad que altera todo el torneo.',
            ],
            lines: [
              'La simulacion termino.',
              'El simbolo de GRAN MAESTRO aparecio frente a Kael mientras el cosmos dimensional desaparecia lentamente.',
              'Pero antes de cerrar el libro, El Origen abrio lentamente sus ojos.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'La puerta abierta',
        lockedUntilBookComplete: true,
        sealedLines: [
          'La Puerta Absoluta no cerrara mientras sus ocho sellos sigan incompletos.',
          'Cada prueba retrasa al Origen, pero la apertura ya cambio el destino del torneo.',
        ],
        lines: [
          'El libro Gran Maestro se cerro con una luz blanca que no parecia pertenecer a ninguna dimension conocida.',
          'Kael habia visto al Origen despertar. Desde ese momento, Umbra dejo de parecer el enemigo final.',
        ],
        footer: 'Cierre absoluto',
      },
    ],
  },
  leyenda: {
    id: 'leyenda',
    rankTitle: 'Leyenda',
    levelFrom: 226,
    levelTo: 250,
    title: 'Las Ruinas del Primer Torneo',
    subtitle: 'Kael recorre coliseos antiguos, campeones de piedra y archivos legendarios para descubrir que el primer torneo ya habia intentado usar a Umbra.',
    phase: '9.11',
    readerUrl: 'historia-libro.html?libro=leyenda',
    visual: { emblem: 'LY', primary: '#fbbf24', secondary: '#dc2626', accent: '#fff7ed', rgb: '251,191,36' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Leyenda',
        title: 'Las Ruinas del Primer Torneo',
        lines: [
          'El decimo tomo despierta con fuego dorado, piedra antigua y un cielo rojo celestial sobre monumentos abandonados.',
          'Antes de dimensiones, antes de Umbra y antes del torneo actual, existio una competencia tan grande que sus ruinas aun recuerdan a sus campeones.',
        ],
        footer: 'Libro Leyenda',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Seis ruinas legendarias',
        lines: [
          'El Coliseo Olvidado, los Campeones de Piedra, la Biblioteca de las Leyendas, la Arena de los Caidos y las Llaves Eternas revelan el origen de guerras mas antiguas.',
          'Ser Leyenda significa dejar de ser solo jugador y convertirse en parte viva de la historia del sistema.',
        ],
        footer: 'Primer Torneo',
      },
    ],
    chapters: [
      {
        id: 'coliseo-olvidado',
        number: '01',
        title: 'El Coliseo Olvidado',
        trial: 'Esquiva Obstaculos',
        condition: 'Atravesar la arena del Primer Torneo antes de que sus ruinas colapsen.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          {
            label: 'Coliseo',
            lines: [
              'Cuando Kael abrio el libro de Leyenda, un gigantesco rugido atraveso toda la biblioteca.',
              'El suelo se transformo en piedra antigua cubierta por circuitos dorados mientras enormes columnas aparecian alrededor suyo.',
              'Frente a el se alzaba un coliseo iluminado por un cielo rojo brillante, y miles de estatuas observaban desde las alturas.',
            ],
          },
          {
            label: 'Pasado',
            lines: [
              'Kael avanzo dentro del coliseo. Las paredes mostraban nombres de jugadores legendarios grabados con energia antigua.',
              'En el centro de la arena existia un simbolo triangular rodeado por cadenas gigantescas.',
              'El sistema mostro fragmentos del pasado: millones de jugadores observando, competencias monumentales y ciudades enteras celebrando.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La arena comenzo a colapsar violentamente. Estructuras antiguas caian desde las alturas mientras plataformas de piedra mecanica desaparecian.',
              'Kael debia atravesar zonas destruidas antes de quedar atrapado bajo los escombros del antiguo torneo.',
              'Fragmentos corruptos de Umbra alteraban rutas y bloqueaban caminos principales.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El Coliseo Olvidado se derrumba sobre la arena principal.',
              'Kael debe alcanzar el simbolo central antes de que las ruinas sepulten el primer recuerdo del torneo.',
            ],
            lines: [
              'Kael alcanzo el centro de la arena justo antes del colapso total.',
              'El simbolo triangular comenzo a brillar y las estatuas antiguas activaron sus ojos dorados.',
              'Una voz desconocida resono: un nuevo candidato ha llegado. El sistema actual apenas era una sombra de lo que alguna vez existio.',
            ],
          },
        ],
      },
      {
        id: 'campeones-piedra',
        number: '02',
        title: 'Los Campeones de Piedra',
        trial: 'Sudoku',
        condition: 'Resolver secuencias antiguas mientras las estatuas legendarias alteran la ciudad.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          {
            label: 'Ciudad',
            lines: [
              'Mas alla del coliseo existia una enorme ciudad antigua construida alrededor del torneo original.',
              'Estatuas gigantescas de campeones dominaban las calles y banderas rojas ondeaban sobre estructuras doradas destruidas por el tiempo.',
              'Las estatuas parecian moverse ligeramente, como si conservaran fragmentos de conciencia.',
            ],
          },
          {
            label: 'Campeon',
            lines: [
              'Kael encontro registros de antiguas guerras entre campeones del torneo.',
              'Algunos defendian el equilibrio dimensional; otros querian controlar completamente el sistema.',
              'Entonces una estatua descendio de su pedestal y dijo: demuestra que mereces caminar entre Leyendas.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Las estructuras de la ciudad comenzaron a reorganizarse creando laberintos mecanicos.',
              'Kael debia resolver secuencias y encontrar rutas correctas mientras las estatuas legendarias intentaban bloquearlo.',
              'Cada decision modificaba el escenario y Umbra corrompia parte de los sistemas antiguos.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Los Campeones de Piedra mueven la ciudad como una prueba antigua.',
              'Kael debe resolver su patron antes de que las rutas se cierren para siempre.',
            ],
            lines: [
              'Kael completo las secuencias principales y las estatuas dejaron de atacarlo lentamente.',
              'Los campeones inclinaron sus cabezas en senal de respeto.',
              'Antes de volver a la piedra, uno revelo algo inquietante: Umbra no destruyo el Primer Torneo. El Primer Torneo intento usar a Umbra.',
            ],
          },
        ],
      },
      {
        id: 'biblioteca-leyendas',
        number: '03',
        title: 'La Biblioteca de las Leyendas',
        trial: 'Domino',
        condition: 'Salvar registros prohibidos del Primer Torneo antes de que sean borrados.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          {
            label: 'Registros',
            lines: [
              'En el centro de la ciudad antigua existia una biblioteca circular llena de registros prohibidos.',
              'Miles de libros flotaban alrededor de mecanismos dorados mientras simbolos antiguos giraban sobre el techo.',
              'Cada libro contenia historias de jugadores legendarios que habian cambiado dimensiones completas con sus decisiones.',
            ],
          },
          {
            label: 'Solucion',
            lines: [
              'Kael descubrio registros sobre entidades antiguas mucho mas peligrosas que Umbra.',
              'Algunas habian sido selladas y otras desaparecieron junto a dimensiones enteras.',
              'Entonces encontro un archivo del Primer Torneo con una frase grabada: Umbra fue creado como solucion.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La biblioteca comenzo a colapsar mientras registros eran consumidos por fuego dimensional.',
              'Kael debia reorganizar secuencias historicas antes de que la informacion desapareciera completamente.',
              'Varias rutas se cerraban mientras el sistema intentaba proteger secretos prohibidos.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'La Biblioteca de las Leyendas arde con fuego dimensional.',
              'Kael debe salvar los registros antes de que el sistema borre su propia culpa.',
            ],
            lines: [
              'Kael salvo parte importante de los registros antes del colapso total.',
              'Uno de los archivos mostro una imagen aterradora: una gigantesca sombra observando el Primer Torneo desde fuera de todas las dimensiones.',
              'Debajo aparecia una frase: el Origen nunca estuvo solo.',
            ],
          },
        ],
      },
      {
        id: 'arena-caidos',
        number: '04',
        title: 'La Arena de los Caidos',
        trial: 'FlashMind',
        condition: 'Resistir un combate dimensional contra Leyendas parcialmente consumidas por Umbra.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          {
            label: 'Arena',
            lines: [
              'Mas alla de las ruinas existia una arena mucho mas antigua que el coliseo principal.',
              'Alli luchaban los jugadores considerados imposibles de derrotar.',
              'El ambiente estaba lleno de energia roja y dorada mientras armas dimensionales flotaban alrededor del escenario destruido.',
            ],
          },
          {
            label: 'Caidos',
            lines: [
              'Fragmentos de energia negra aparecieron sobre la arena y figuras comenzaron a materializarse entre las ruinas.',
              'Eran antiguos jugadores legendarios consumidos parcialmente por Umbra.',
              'Conservaban armaduras del Primer Torneo, pero sus ojos estaban completamente oscuros.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La arena activo un combate dimensional completo.',
              'Kael debia sobrevivir mientras multiples Leyendas corruptas alteraban las reglas del entorno.',
              'Las plataformas podian romperse, la gravedad cambiaba y algunas zonas eran consumidas si permanecia demasiado tiempo alli.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Las Leyendas caidas siguen luchando eternamente en la arena.',
              'Kael debe resistir hasta que sus ecos recuerden que alguna vez defendieron el torneo.',
            ],
            lines: [
              'Kael resistio el combate y las figuras legendarias comenzaron a desaparecer entre fragmentos oscuros.',
              'Antes de desaparecer, una de ellas dijo algo inquietante: Umbra esta buscando las Llaves Eternas.',
              'La arena temblo violentamente y enormes puertas doradas aparecieron en el horizonte.',
            ],
          },
        ],
      },
      {
        id: 'llaves-eternas',
        number: '05',
        title: 'Las Llaves Eternas',
        trial: 'Matematicas',
        condition: 'Estabilizar llaves mecanicas que controlan sellos mas antiguos que el torneo actual.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          {
            label: 'Camara',
            lines: [
              'Kael atraveso las puertas doradas y llego a una camara subterranea iluminada por energia roja brillante.',
              'En el centro flotaban enormes llaves mecanicas conectadas por cadenas dimensionales.',
              'Eran las Llaves Eternas, capaces de controlar los sellos mas antiguos del torneo.',
            ],
          },
          {
            label: 'Sellos',
            lines: [
              'Cada llave parecia conectada a una dimension distinta y mecanismos enormes giraban alrededor de ellas.',
              'Algunas cadenas estaban destruidas. Umbra ya habia llegado antes.',
              'Kael comprendio que las llaves no sellaban solo dimensiones: sellaban entidades.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'Kael debia estabilizar las Llaves Eternas reorganizando secuencias dimensionales antes de que las cadenas restantes se rompieran.',
              'Cada error alteraba multiples mecanismos al mismo tiempo.',
              'El tiempo era limitado y la corrupcion dimensional liberada por Umbra hacia desaparecer plataformas constantemente.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'Las Llaves Eternas pierden sincronizacion bajo energia corrupta.',
              'Kael debe reforzar sus cadenas antes de que algo peor que el Origen despierte.',
            ],
            lines: [
              'Las llaves lograron estabilizarse parcialmente y varias cadenas dejaron de romperse.',
              'Pero una vision imposible aparecio: Umbra observaba una estructura oculta mas alla del cosmos dimensional.',
              'Detras de el, miles de ojos comenzaban a abrirse lentamente.',
            ],
          },
        ],
      },
      {
        id: 'la-leyenda',
        number: '06',
        title: 'La Leyenda',
        trial: 'NumCatch',
        condition: 'Completar la evaluacion final del Primer Torneo mientras sus ruinas reconocen a Kael.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          {
            label: 'Regreso',
            lines: [
              'Kael regreso al coliseo principal mientras las ruinas del Primer Torneo comenzaban a reconstruirse lentamente.',
              'Las estatuas antiguas volvieron a iluminarse y simbolos dorados aparecieron sobre el cielo rojo.',
              'La voz del sistema resono: las Leyendas ya no son simples jugadores. Son parte viva de la historia del sistema.',
            ],
          },
          {
            label: 'Reconocimiento',
            lines: [
              'El coliseo completo comenzo a transformarse en una gigantesca simulacion dimensional.',
              'Todas las pruebas anteriores aparecieron mezcladas mientras estructuras antiguas giraban alrededor del escenario.',
              'Kael sintio que el sistema comenzaba a reconocerlo: puertas se abrian solas y energias antiguas parecian obedecerlo parcialmente.',
            ],
          },
          {
            label: 'Prueba',
            trial: true,
            lines: [
              'La evaluacion final comenzo.',
              'Velocidad, logica, adaptacion y control dimensional fueron mezclados dentro de una simulacion creada por el Primer Torneo.',
              'Las reglas cambiaban constantemente mientras estructuras legendarias colapsaban y fragmentos de Umbra intentaban alterar el entorno.',
            ],
          },
          {
            label: 'Consecuencia',
            afterTrial: true,
            sealedLines: [
              'El Primer Torneo espera una ultima demostracion.',
              'Kael debe completar la evaluacion para que las ruinas lo reconozcan como Leyenda.',
            ],
            lines: [
              'La simulacion termino con una explosion roja y dorada atravesando todas las ruinas del Primer Torneo.',
              'El simbolo de LEYENDA aparecio frente a Kael y quedo grabado dentro del libro.',
              'Las estatuas antiguas se arrodillaron lentamente y una frase aparecio en el cielo rojo: las verdaderas guerras apenas comienzan. Otro libro se abrio entre energia violeta cosmica: MITICO.',
            ],
          },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Las ruinas recuerdan',
        lockedUntilBookComplete: true,
        sealedLines: [
          'Las Ruinas del Primer Torneo no entregaran su sello mientras sus seis memorias sigan incompletas.',
          'Cada prueba recupera una parte de la historia que el sistema intento ocultar.',
        ],
        lines: [
          'El libro Leyenda se cerro con fuego dorado recorriendo sus bordes, como si las estatuas aun observaran desde otra epoca.',
          'Kael habia aprendido que la historia del torneo no comenzo con Umbra. Umbra fue solo una respuesta a algo todavia mas antiguo.',
        ],
        footer: 'Cierre legendario',
      },
    ],
  },
  mitico: {
    id: 'mitico',
    rankTitle: 'Mitico',
    levelFrom: 251,
    levelTo: 275,
    title: 'El Mar de las Constelaciones Muertas',
    subtitle: 'Kael navega un oceano cosmico de estrellas apagadas, regiones vacias y ciudades dormidas donde los Arquitectos comienzan a despertar.',
    phase: '9.12',
    readerUrl: 'historia-libro.html?libro=mitico',
    visual: { emblem: 'MT', primary: '#c084fc', secondary: '#4c1d95', accent: '#f0abfc', rgb: '192,132,252' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Mitico',
        title: 'El Mar de las Constelaciones Muertas',
        lines: [
          'El tomo Mitico abre un oceano espacial de nebulosas violetas, constelaciones rotas y templos flotantes sobre estrellas apagadas.',
          'Tras el despertar del Origen, las dimensiones ya no solo se rompen: empiezan a morir.',
        ],
        footer: 'Libro Mitico',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Diez mareas cosmicas',
        lines: [
          'Navegantes eternos, estrellas caidas, la Region Vacia, una ciudad dormida y el Archivo Estelar guian a Kael hacia la verdad de los Arquitectos.',
          'Ser Mitico significa proteger realidades completas cuando el torneo deja de ser el centro del conflicto.',
        ],
        footer: 'Mar cosmico',
      },
    ],
    chapters: [
      {
        id: 'cielo-quebrado',
        number: '01',
        title: 'El Cielo Quebrado',
        trial: 'Esquiva Obstaculos',
        condition: 'Cruzar plataformas estelares antes de que el colapso astral cierre el sector.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          { label: 'Oceano', lines: ['Cuando Kael abrio el libro de Mitico, el universo entero parecio dividirse frente a el.', 'El cielo desaparecio y fue reemplazado por un oceano cosmico infinito donde flotaban miles de estrellas apagadas.', 'Constelaciones gigantescas se movian lentamente entre nebulosas violetas mientras fragmentos dimensionales caian como lluvia luminosa.'] },
          { label: 'Grieta', lines: ['La voz del sistema aparecio con una calma extrana. Despues del despertar del Origen, las dimensiones comenzaron a morir lentamente.', 'Kael observo constelaciones destruidas sobre el oceano espacial, algunas como civilizaciones enteras convertidas en ruinas luminosas.', 'Entonces una gigantesca grieta negra atraveso el cielo cosmico.'] },
          { label: 'Prueba', trial: true, lines: ['Las plataformas estelares comenzaron a desintegrarse mientras fragmentos cosmicos caian alrededor del oceano dimensional.', 'Kael debia avanzar rapidamente entre rutas inestables antes de quedar atrapado dentro del colapso astral.', 'La expansion del Origen convertia cada estrella apagada en una amenaza nueva.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El cielo quebrado se hunde entre estrellas apagadas.', 'Kael debe alcanzar el templo flotante antes de que el colapso astral cierre toda salida.'], lines: ['Kael logro alcanzar un antiguo templo flotante antes de que el sector colapsara completamente.', 'Entonces observo algo imposible: algunas estrellas estaban siendo consumidas desde dentro.', 'En el centro de la oscuridad, miles de ojos violetas comenzaron a abrirse lentamente.'] },
        ],
      },
      {
        id: 'navegantes-eternos',
        number: '02',
        title: 'Los Navegantes Eternos',
        trial: 'Sudoku',
        condition: 'Reorganizar rutas estelares antes de que varias dimensiones queden aisladas.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          { label: 'Mapas', lines: ['Dentro del templo flotante existian enormes mapas cosmicos mostrando rutas entre dimensiones antiguas.', 'Alli habitaban los Navegantes Eternos, entidades encargadas de recorrer el Mar de las Constelaciones Muertas.', 'Sus cuerpos parecian hechos de energia estelar pura.'] },
          { label: 'Advertencia', lines: ['Uno de los Navegantes observo directamente a Kael. Los Miticos ya no protegen un torneo; protegen realidades completas.', 'Mostraron registros de dimensiones desapareciendo mientras el Origen despertaba mas alla del cosmos conocido.', 'Umbra seguia expandiendose, pero ahora parecia temer algo mucho mayor.'] },
          { label: 'Prueba', trial: true, lines: ['Los mapas dimensionales comenzaron a corromperse violentamente.', 'Kael debia reorganizar rutas estelares antes de que multiples dimensiones quedaran aisladas dentro del oceano cosmico.', 'Cada error provocaba la desaparicion parcial de varias conexiones dimensionales.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['Los mapas cosmicos pierden rutas entre dimensiones.', 'Kael debe restaurar las conexiones antes de que mundos enteros queden aislados.'], lines: ['Las rutas lograron estabilizarse parcialmente.', 'Sin embargo, uno de los mapas revelo una zona completamente oscura mas alla del cosmos dimensional.', 'Los Navegantes la llamaban la Region Vacia, y nadie que entrara alli regresaba jamas.'] },
        ],
      },
      {
        id: 'estrellas-caidas',
        number: '03',
        title: 'Las Estrellas Caidas',
        trial: 'Domino',
        condition: 'Reorganizar energia entre estrellas colapsadas antes de que el sector desaparezca.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          { label: 'Ruinas', lines: ['Kael viajo hacia un sector donde enormes estrellas colapsadas flotaban sobre mares violetas de energia.', 'Algunas aun brillaban debilmente; otras estaban vacias, como si algo hubiera consumido toda su existencia desde el interior.', 'El silencio era absoluto.'] },
          { label: 'Guerras', lines: ['Entre ruinas estelares, Kael encontro registros grabados sobre fragmentos cosmicos.', 'Mostraban guerras entre entidades gigantescas luchando mucho antes de la creacion del torneo.', 'Algunas podian destruir dimensiones completas con solo existir. El Origen no era el primero.'] },
          { label: 'Prueba', trial: true, lines: ['Las estrellas comenzaron a explotar una tras otra por inestabilidad dimensional extrema.', 'Kael debia reorganizar secuencias energeticas mientras ondas cosmicas destruian plataformas alrededor suyo.', 'Todo el entorno reaccionaba violentamente.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['Las estrellas caidas explotan sobre mares violetas.', 'Kael debe estabilizar el sector antes de que desaparezca como si nunca hubiera existido.'], lines: ['Kael logro escapar del colapso estelar justo antes de que el sector desapareciera completamente.', 'Antes de extinguirse, una estrella mostro una ultima vision.', 'Una gigantesca figura observaba el cosmos desde fuera de toda realidad.'] },
        ],
      },
      {
        id: 'region-vacia',
        number: '04',
        title: 'La Region Vacia',
        trial: 'FlashMind',
        condition: 'Encontrar una ruta estable dentro de un vacio donde el tiempo no avanza.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Entrada', lines: ['Los Navegantes Eternos intentaron impedir que Kael avanzara hacia la Region Vacia.', 'Ninguna dimension registrada mantenia leyes normales dentro de aquel lugar.', 'El espacio parecia roto: las estrellas no brillaban, el tiempo no avanzaba y las distancias cambiaban constantemente.'] },
          { label: 'Presion', lines: ['Al entrar, Kael sintio una presion imposible de describir.', 'Gigantescas estructuras negras flotaban inmoviles sobre el vacio mientras fragmentos dimensionales permanecian congelados.', 'Entonces escucho voces antiguas. Miles de voces.'] },
          { label: 'Prueba', trial: true, lines: ['La Region Vacia comenzo a deformarse violentamente.', 'Multiples estructuras aparecian y desaparecian entre distorsiones temporales.', 'Kael debia encontrar una ruta estable antes de quedar atrapado permanentemente dentro del vacio cosmico.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Region Vacia distorsiona toda ruta posible.', 'Kael debe escapar antes de que el vacio lo deje congelado fuera del tiempo.'], lines: ['Kael logro escapar parcialmente de las distorsiones.', 'Pero antes de abandonar el sector observo algo aterrador.', 'Una ciudad gigantesca dormia dentro de la oscuridad absoluta, y lentamente sus luces comenzaron a encenderse.'] },
        ],
      },
      {
        id: 'ciudad-dormida',
        number: '05',
        title: 'La Ciudad Dormida',
        trial: 'Torre Infinita',
        condition: 'Atravesar una ciudad imposible mientras altera gravedad, espacio y rutas.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          { label: 'Ciudad', lines: ['La ciudad era muchisimo mas grande que cualquier dimension visitada anteriormente.', 'Torres infinitas atravesaban el vacio mientras simbolos desconocidos cubrian todas las estructuras.', 'Parecia una civilizacion creada por entidades anteriores incluso al Primer Torneo.'] },
          { label: 'Transmision', lines: ['Kael exploro avenidas vacias iluminadas por energia violeta.', 'No existian habitantes visibles, pero el sistema detectaba actividad constante dentro de estructuras selladas.', 'Una transmision antigua aparecio automaticamente: el despertar ya comenzo. Las puertas de la ciudad comenzaron a abrirse.'] },
          { label: 'Prueba', trial: true, lines: ['Los sistemas de la ciudad comenzaron a activarse violentamente.', 'Kael debia atravesar multiples rutas antes de quedar encerrado dentro del nucleo urbano.', 'Algunas zonas alteraban completamente la gravedad y el espacio.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Ciudad Dormida reorganiza sus torres infinitas.', 'Kael debe llegar al centro antes de que el nucleo urbano lo encierre.'], lines: ['Kael logro alcanzar el centro de la ciudad.', 'Alli encontro una gigantesca esfera cosmica suspendida sobre un oceano oscuro.', 'Dentro de ella, algo estaba intentando despertar.'] },
        ],
      },
      {
        id: 'ecos-cosmos',
        number: '06',
        title: 'Los Ecos del Cosmos',
        trial: 'Matematicas',
        condition: 'Estabilizar la esfera cosmica antes de que su nucleo dimensional explote.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          { label: 'Memorias', lines: ['La esfera comenzo a liberar fragmentos de memoria mostrando antiguas guerras dimensionales.', 'Kael observo entidades gigantescas destruyendo galaxias completas.', 'Civilizaciones enteras intentaban contenerlas usando sellos similares a la Puerta Absoluta.'] },
          { label: 'Ciclo', lines: ['Los ecos mostraban tambien la creacion del Primer Torneo.', 'Los administradores descubrieron restos de aquellas antiguas guerras cosmicas y entendieron que el universo dimensional estaba condenado a repetir el mismo ciclo.', 'Umbra fue creado para evitarlo.'] },
          { label: 'Prueba', trial: true, lines: ['La esfera perdio estabilidad mientras ondas cosmicas atravesaban toda la ciudad dormida.', 'Kael debia reorganizar multiples secuencias antiguas antes de que el nucleo dimensional explotara completamente.', 'El pasado del cosmos temblaba dentro de cada calculo.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La esfera cosmica se sobrecarga con memorias antiguas.', 'Kael debe estabilizar sus secuencias antes de que la ciudad despierte destruida.'], lines: ['La esfera logro estabilizarse parcialmente.', 'Pero antes de apagarse mostro un ultimo mensaje: El Origen no es el final.', 'Entonces toda la ciudad comenzo a temblar violentamente.'] },
        ],
      },
      {
        id: 'guerra-celestial',
        number: '07',
        title: 'La Guerra Celestial',
        trial: 'NumCatch',
        condition: 'Atravesar zonas de guerra mientras criaturas cosmicas destruyen constelaciones.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Grietas', lines: ['Multiples grietas dimensionales se abrieron sobre el Mar de las Constelaciones Muertas.', 'Desde ellas emergieron criaturas cosmicas gigantescas consumidas por energia negra y violeta.', 'La guerra habia comenzado.'] },
          { label: 'Batalla', lines: ['Los Navegantes Eternos prepararon estructuras defensivas alrededor de las dimensiones restantes.', 'Kael observo constelaciones completas destruyendose mientras el cosmos dimensional colapsaba alrededor de la guerra celestial.', 'Umbra aparecio en la oscuridad observando en silencio, y por primera vez parecia preocupado.'] },
          { label: 'Prueba', trial: true, lines: ['Kael debia atravesar zonas de guerra mientras criaturas dimensionales destruian estructuras cosmicas.', 'Las rutas desaparecian rapidamente y enormes explosiones alteraban el entorno entero.', 'Cada segundo perdido apagaba otra constelacion.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Guerra Celestial rompe constelaciones enteras.', 'Kael debe atravesar el frente antes de que las defensas de los Navegantes cedan.'], lines: ['Las defensas lograron resistir parcialmente el ataque.', 'Sin embargo, varias constelaciones desaparecieron completamente del cosmos dimensional.', 'Algo gigantesco comenzo a moverse dentro de la Region Vacia.'] },
        ],
      },
      {
        id: 'archivo-estelar',
        number: '08',
        title: 'El Archivo Estelar',
        trial: 'FlashMind',
        condition: 'Rescatar registros de entidades antiguas antes del colapso del archivo.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Archivo', lines: ['Los Navegantes llevaron a Kael hacia un archivo oculto con registros de todas las entidades conocidas por el universo dimensional.', 'Millones de simbolos flotaban alrededor de estructuras transparentes.', 'Fragmentos estelares giraban lentamente sobre el vacio.'] },
          { label: 'Arquitectos', lines: ['Kael descubrio registros sobre seres llamados los Arquitectos.', 'Eran entidades capaces de crear dimensiones completas usando energia cosmica.', 'Pero todos desaparecieron misteriosamente antes de la creacion del torneo.'] },
          { label: 'Prueba', trial: true, lines: ['El Archivo Estelar comenzo a colapsar por interferencias provenientes de la Region Vacia.', 'Kael debia salvar multiples registros antes de que desaparecieran completamente.', 'La memoria de los Arquitectos se apagaba con cada distorsion.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Archivo Estelar se rompe bajo interferencias de la Region Vacia.', 'Kael debe rescatar los registros antes de que los Arquitectos vuelvan a ser un mito.'], lines: ['Kael logro rescatar parte de los registros.', 'Pero uno de ellos mostro una vision aterradora.', 'Una figura gigantesca construia dimensiones enteras dentro de la oscuridad absoluta.'] },
        ],
      },
      {
        id: 'corona-mitica',
        number: '09',
        title: 'La Corona Mitica',
        trial: 'FlashMind',
        condition: 'Mantener equilibrio cuando la Region Vacia apaga constelaciones completas.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Corona', lines: ['El cosmos dimensional comenzo a estabilizarse despues de la guerra celestial.', 'Varias constelaciones recuperaron parte de su brillo y los Navegantes observaron a Kael con respeto.', 'Estructuras cosmicas se alinearon alrededor del oceano dimensional formando una corona violeta visible desde multiples realidades.'] },
          { label: 'Pulsos', lines: ['Millones de fragmentos estelares giraron formando simbolos antiguos desconocidos incluso para los Navegantes.', 'Las constelaciones reaccionaban a la presencia de Kael y multiples dimensiones se sincronizaban con su energia.', 'Pero desde la Region Vacia emergieron pulsos capaces de apagar estrellas completas, y Umbra aparecio preocupado frente al horizonte.'] },
          { label: 'Prueba', trial: true, lines: ['La evaluacion final mezclo multiples leyes cosmicas simultaneamente.', 'El espacio, la gravedad y el tiempo cambiaban mientras fragmentos del universo dimensional colapsaban alrededor de Kael.', 'Varias dimensiones intentaban fusionarse por la energia liberada desde la Region Vacia.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Corona Mitica vibra sobre constelaciones que vuelven a apagarse.', 'Kael debe sostener la sincronizacion cosmica antes de que la Region Vacia abra otro frente.'], lines: ['La simulacion termino y el simbolo de MITICO aparecio frente a Kael mientras el cosmos vibraba lentamente.', 'Antes de cerrarse el libro, la Region Vacia emitio una gigantesca senal energetica.', 'Una voz desconocida susurro: los Arquitectos han despertado. Multiples constelaciones desaparecieron al mismo tiempo.'] },
        ],
      },
      {
        id: 'llamado-supremo',
        number: '10',
        title: 'El Llamado Supremo',
        trial: 'NumCatch',
        condition: 'Sobrevivir al primer contacto con las estructuras imposibles de los Arquitectos.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Silencio', lines: ['El Mar de las Constelaciones Muertas quedo completamente en silencio.', 'Las estrellas dejaron de moverse y el oceano cosmico parecia congelado en el tiempo.', 'Entonces el cielo comenzo a abrirse lentamente, revelando estructuras blancas mas alla del universo conocido.'] },
          { label: 'Arquitectos', lines: ['Desde la Region Vacia emergio una ciudad imposible formada por geometrias perfectas y energia blanca absoluta.', 'Las estructuras parecian construirse y destruirse al mismo tiempo mientras figuras enormes observaban desde las alturas.', 'Los Arquitectos no parecian sorprendidos de ver a Kael. Parecia que lo estaban esperando.'] },
          { label: 'Prueba', trial: true, lines: ['Las estructuras dimensionales comenzaron a reorganizarse violentamente alrededor del cosmos.', 'Kael debia atravesar sectores imposibles mientras leyes fisicas completas cambiaban constantemente.', 'Algunas zonas invertian el tiempo, otras destruian plataformas automaticamente y varias rutas solo existian durante fragmentos de realidad.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Llamado Supremo abre estructuras blancas fuera del universo conocido.', 'Kael debe sobrevivir al primer camino creado por los Arquitectos.'], lines: ['Kael logro sobrevivir al colapso dimensional mientras las estructuras blancas desaparecian dentro de la oscuridad cosmica.', 'Entonces una gigantesca puerta luminosa aparecio frente a el cubierta por energia pura.', 'Sobre ella, un nuevo rango comenzo a grabarse lentamente: SUPREMO.'] },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'Los Arquitectos despiertan',
        lockedUntilBookComplete: true,
        sealedLines: ['El Mar de las Constelaciones Muertas no puede cerrarse mientras sus diez mareas sigan abiertas.', 'Cada prueba retrasa el avance de la Region Vacia, pero confirma que los Arquitectos han vuelto.'],
        lines: ['El libro Mitico se cerro con una constelacion violeta brillando en su portada.', 'Kael habia dejado atras el torneo como frontera. Ahora miraba un cosmos donde incluso Umbra podia sentir miedo.'],
        footer: 'Cierre cosmico',
      },
    ],
  },
  supremo: {
    id: 'supremo',
    rankTitle: 'Supremo',
    levelFrom: 276,
    levelTo: 300,
    title: 'El Trono del Equilibrio',
    subtitle: 'Kael llega a la ciudad perfecta de los Arquitectos, donde las reglas del universo se alteran y los Titanes comienzan a despertar.',
    phase: '9.13',
    readerUrl: 'historia-libro.html?libro=supremo',
    visual: { emblem: 'SP', primary: '#f8fafc', secondary: '#94a3b8', accent: '#38bdf8', rgb: '248,250,252' },
    introPages: [
      {
        type: 'cover',
        kicker: 'Libro Supremo',
        title: 'El Trono del Equilibrio',
        lines: [
          'El tomo Supremo abre una ciudad blanca perfecta, hecha de geometria viva, energia pura y templos infinitos flotando sobre un vacio iluminado.',
          'Los Arquitectos han regresado, y el equilibrio que sostenia al torneo empieza a deshacerse.',
        ],
        footer: 'Libro Supremo',
      },
      {
        type: 'index',
        kicker: 'Indice',
        title: 'Seis juicios del equilibrio',
        lines: [
          'La Ciudad Perfecta, los Arquitectos, la Guerra del Equilibrio, el Trono Supremo y el Vacio Exterior revelan que el Origen no era unico.',
          'Ser Supremo significa tocar reglas que antes parecian inalterables.',
        ],
        footer: 'Equilibrio universal',
      },
    ],
    chapters: [
      {
        id: 'ciudad-perfecta',
        number: '01',
        title: 'La Ciudad Perfecta',
        trial: 'Esquiva Obstaculos',
        condition: 'Atravesar estructuras perfectas mientras los Arquitectos modifican el espacio.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          { label: 'Ciudad', lines: ['Cuando Kael abrio el libro Supremo, el cosmos dimensional desaparecio completamente.', 'Frente a el aparecio una ciudad gigantesca construida con estructuras blancas perfectas flotando sobre un vacio de energia pura.', 'El titulo quedo grabado sobre el espacio: SUPREMO - El Trono del Equilibrio.'] },
          { label: 'Arquitecto', lines: ['Kael avanzo por avenidas creadas por los Arquitectos mientras las estructuras reaccionaban a su presencia.', 'Figuras gigantescas caminaban entre templos blancos, hechas de energia solida y geometria viva.', 'Uno se acerco: el torneo ya no puede mantener el equilibrio por si solo. El cielo se fracturo mostrando dimensiones colapsando por el Origen.'] },
          { label: 'Prueba', trial: true, lines: ['La Ciudad Perfecta comenzo a reorganizarse violentamente.', 'Kael debia atravesar estructuras cambiantes mientras las leyes del espacio eran modificadas por los Arquitectos.', 'Algunas plataformas aparecian solo con secuencias correctas, otras desaparecian con el tiempo y varias zonas invertian la gravedad.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Ciudad Perfecta reescribe sus avenidas en tiempo real.', 'Kael debe alcanzar el nucleo antes de que la geometria colapse.'], lines: ['Kael alcanzo el nucleo central antes del colapso geometrico total.', 'Un simbolo blanco aparecio sobre el cielo, pero una grieta negra atraveso la ciudad perfecta.', 'La energia del Origen entro en las construcciones de los Arquitectos, y por primera vez las entidades supremas parecieron preocupadas.'] },
        ],
      },
      {
        id: 'los-arquitectos',
        number: '02',
        title: 'Los Arquitectos',
        trial: 'Sudoku',
        condition: 'Reorganizar secuencias dimensionales del Nucleo del Equilibrio.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          { label: 'Nucleo', lines: ['Los Arquitectos llevaron a Kael al Nucleo del Equilibrio, donde se controlaban multiples dimensiones con energia pura.', 'Mapas completos del universo dimensional mostraban que realidades sobrevivian y cuales estaban cerca de desaparecer.', 'Muchas dimensiones ya habian sido marcadas como irrecuperables.'] },
          { label: 'Historia', lines: ['Uno de los Arquitectos revelo que ellos ayudaron a crear las primeras dimensiones estables mucho antes del torneo.', 'Cuando descubrieron entidades capaces de consumir universos, comenzaron a construir sistemas de contencion.', 'El torneo fue uno de esos sistemas. Umbra tambien. Y la Puerta Absoluta era el ultimo sello existente.'] },
          { label: 'Prueba', trial: true, lines: ['El Nucleo del Equilibrio comenzo a perder estabilidad mientras multiples dimensiones chocaban entre si.', 'Kael debia reorganizar secuencias dimensionales antes de que los universos conectados colapsaran simultaneamente.', 'Cada decision alteraba partes completas del mapa cosmico.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Nucleo del Equilibrio muestra universos cayendo al mismo tiempo.', 'Kael debe estabilizar sus mapas antes de que la red dimensional se fracture.'], lines: ['Kael estabilizo parcialmente el nucleo y varias realidades dejaron de colapsar temporalmente.', 'Entonces el sistema mostro algo aterrador: mas alla de las dimensiones conocidas existian senales similares al Origen.', 'Los Arquitectos guardaron silencio, como si hubieran esperado que ese momento jamas llegara.'] },
        ],
      },
      {
        id: 'guerra-equilibrio',
        number: '03',
        title: 'La Guerra del Equilibrio',
        trial: 'FlashMind',
        condition: 'Cruzar sectores destruidos durante la guerra entre Arquitectos y fragmentos del Origen.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Guerra', lines: ['La ciudad de los Arquitectos comenzo a prepararse para la guerra.', 'Gigantescas estructuras dimensionales aparecieron alrededor del vacio y armas cosmicas apuntaron hacia las grietas abiertas por el Origen.', 'Miles de entidades supremas se movilizaron entre dimensiones mientras mundos desaparecian en tiempo real.'] },
          { label: 'Umbra', lines: ['Umbra aparecio frente a Kael, pero esta vez no parecia hostil.', 'Dijo que los Arquitectos nunca entenderian el verdadero problema y mostro entidades mas antiguas intentando despertar desde sectores desconocidos del vacio absoluto.', 'El Origen solo era una barrera, no el enemigo final.'] },
          { label: 'Prueba', trial: true, lines: ['La guerra dimensional comenzo violentamente.', 'Kael debia atravesar sectores destruidos mientras estructuras supremas combatian contra fragmentos del Origen.', 'Las plataformas podian explotar, el espacio cambiaba y algunas zonas dejaban de existir repentinamente.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Guerra del Equilibrio consume sectores enteros.', 'Kael debe cruzar el campo de batalla antes de que el espacio deje de existir.'], lines: ['La batalla logro contener parcialmente la expansion del Origen, pero sectores dimensionales quedaron destruidos permanentemente.', 'Entonces los Arquitectos activaron una ultima estructura oculta.', 'Un gigantesco trono blanco aparecio suspendido sobre el vacio absoluto, y todos observaron directamente a Kael.'] },
        ],
      },
      {
        id: 'trono-supremo',
        number: '04',
        title: 'El Trono Supremo',
        trial: 'Matematicas',
        condition: 'Mantener el equilibrio de multiples realidades desde el trono.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          { label: 'Trono', lines: ['El trono flotaba sobre un oceano de energia pura rodeado por simbolos geometricos enormes.', 'Parecia controlar parte del equilibrio dimensional unicamente existiendo.', 'Los Arquitectos hablaron al mismo tiempo: solo alguien capaz de resistir el caos absoluto puede usar el Trono Supremo.'] },
          { label: 'Futuros', lines: ['Mientras se acercaba, Kael observo futuros posibles alrededor suyo.', 'Algunas realidades sobrevivian, otras desaparecian y en varios futuros Kael reemplazaba parcialmente a los Arquitectos.', 'Entonces el Origen lanzo una onda dimensional atravesando multiples universos y el trono comenzo a perder estabilidad.'] },
          { label: 'Prueba', trial: true, lines: ['El trono activo una simulacion dimensional extrema.', 'Kael debia mantener el equilibrio de multiples realidades mientras el Origen alteraba leyes fisicas y dimensionales.', 'Cada decision afectaba directamente distintas lineas universales.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Trono Supremo pierde estabilidad bajo una onda del Origen.', 'Kael debe sostener realidades enteras sin destruir otras en el intento.'], lines: ['Kael logro estabilizar parcialmente el Trono Supremo y las dimensiones dejaron de colapsar temporalmente.', 'El trono reacciono a su energia: estructuras comenzaron a obedecerlo parcialmente y simbolos blancos aparecieron alrededor del vacio.', 'Pero el Origen seguia despertando.'] },
        ],
      },
      {
        id: 'vacio-exterior',
        number: '05',
        title: 'El Vacio Exterior',
        trial: 'Torre Infinita',
        condition: 'Reforzar barreras en el borde de las dimensiones conocidas.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          { label: 'Borde', lines: ['Los Arquitectos llevaron a Kael hacia el borde exterior de las dimensiones conocidas.', 'Alli no existian estrellas, tiempo ni estructuras normales.', 'Solo oscuridad absoluta: el Vacio Exterior. La voz de Umbra aparecio: todo comenzo aqui.'] },
          { label: 'Entidades', lines: ['Kael comprendio la verdadera magnitud del problema.', 'El Origen no era unico; existian multiples entidades similares dormidas fuera de las dimensiones creadas por los Arquitectos.', 'Cada vez que una despertaba, universos completos desaparecian. Entonces algo abrio lentamente sus ojos dentro del Vacio Exterior.'] },
          { label: 'Prueba', trial: true, lines: ['El borde dimensional comenzo a fracturarse violentamente.', 'Ondas provenientes del Vacio Exterior destruian estructuras supremas constantemente.', 'Kael debia estabilizar multiples barreras antes de que otra entidad atravesara las dimensiones conocidas.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Vacio Exterior golpea las ultimas barreras dimensionales.', 'Kael debe reforzarlas antes de que otra entidad despierte del otro lado.'], lines: ['Las barreras lograron resistir temporalmente.', 'Pero antes de estabilizarse, una gigantesca mano oscura aparecio durante segundos atravesando parcialmente el vacio dimensional.', 'Incluso los Arquitectos retrocedieron. La verdadera guerra apenas comenzaba.'] },
        ],
      },
      {
        id: 'el-supremo',
        number: '06',
        title: 'El Supremo',
        trial: 'NumCatch',
        condition: 'Completar la evaluacion final mientras los Titanes despiertan en el Vacio Exterior.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Conexion', lines: ['Las estructuras dimensionales comenzaron a reorganizarse alrededor del Trono Supremo mientras universos recuperaban estabilidad temporal.', 'Los Arquitectos observaron a Kael en silencio.', 'La voz del sistema aparecio una ultima vez: los Supremos trascienden el concepto de jugador.'] },
          { label: 'Ojos', lines: ['Kael sintio algo imposible: parte del sistema universal comenzaba a conectarse directamente con el.', 'Algunas dimensiones reaccionaban a su presencia y estructuras supremas obedecian sus decisiones sin intervencion directa.', 'Pero aquella conexion tambien le permitia sentir entidades del Vacio Exterior despertando una tras otra.'] },
          { label: 'Prueba', trial: true, lines: ['La evaluacion final mezclo todas las mecanicas dimensionales vistas hasta ahora.', 'Tiempo, gravedad, espacio y energia universal cambiaban constantemente mientras sectores del cosmos colapsaban alrededor de Kael.', 'Nada permanecia estable. Todo parecia prepararse para una guerra imposible.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Trono del Equilibrio espera la ultima sincronizacion.', 'Kael debe sostener el sistema mientras el Vacio Exterior despierta millones de presencias.'], lines: ['La simulacion termino y el simbolo de SUPREMO aparecio frente a Kael mientras el Trono del Equilibrio libero una explosion blanca.', 'Antes de cerrarse el libro, el Vacio Exterior mostro millones de ojos abriendose simultaneamente.', 'Una sola frase aparecio sobre la oscuridad infinita: LOS TITANES HAN DESPERTADO.'] },
        ],
      },
    ],
    closingPages: [
      {
        type: 'seal',
        kicker: 'Sello del tomo',
        title: 'El equilibrio se rompe',
        lockedUntilBookComplete: true,
        sealedLines: ['El Trono del Equilibrio no puede cerrarse mientras sus seis juicios sigan activos.', 'Cada prueba estabiliza una parte de las dimensiones conocidas, pero el Vacio Exterior ya desperto.'],
        lines: ['El libro Supremo se cerro como una estructura perfecta plegandose sobre si misma.', 'Kael habia tocado el equilibrio universal y, al hacerlo, habia sentido a los Titanes abrir los ojos desde el otro lado.'],
        footer: 'Cierre supremo',
      },
    ],
  },
  titan: {
    id: 'titan',
    rankTitle: 'Titan',
    levelFrom: 301,
    levelTo: 325,
    title: 'La Guerra de los Titanes Eternos',
    subtitle: 'Kael presencia el despertar de entidades anteriores a las dimensiones conocidas y una guerra donde incluso Umbra pelea por sobrevivir.',
    phase: '9.14',
    readerUrl: 'historia-libro.html?libro=titan',
    visual: { emblem: 'TT', primary: '#fb7185', secondary: '#7f1d1d', accent: '#f97316', rgb: '251,113,133' },
    introPages: [
      { type: 'cover', kicker: 'Libro Titan', title: 'La Guerra de los Titanes Eternos', lines: ['Magma cosmico, armaduras colosales y mundos destruidos anuncian el despertar de entidades que no buscan conquistar universos.', 'Los Titanes simplemente existen, y su existencia basta para quebrar dimensiones completas.'], footer: 'Libro Titan' },
      { type: 'index', kicker: 'Indice', title: 'Seis frentes titanicos', lines: ['Fortalezas de Arquitectos, el Titan Negro, guerra universal y el Corazon Titanico marcan la ruta del rango Titan.', 'Kael descubre que el Origen desperto porque algo mas antiguo habia empezado a regresar.'], footer: 'Guerra titanica' },
    ],
    chapters: [
      {
        id: 'despertar-titanes',
        number: '01',
        title: 'El Despertar de los Titanes',
        trial: 'Esquiva Obstaculos',
        condition: 'Cruzar campos de magma dimensional mientras mundos colapsan bajo el paso de los Titanes.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          { label: 'Magma', lines: ['Cuando Kael abrio el libro Titan, el universo dimensional comenzo a temblar violentamente.', 'Gigantescos Titanes caminaban sobre oceanos de magma cosmico mientras planetas destruidos flotaban bajo tormentas dimensionales.', 'El titulo aparecio sobre el vacio ardiente: TITAN - La Guerra de los Titanes Eternos.'] },
          { label: 'Existencia', lines: ['Kael observo Titanes cubiertos de roca viva, energia negra y magma dimensional.', 'Umbra aparecio entre las tormentas y dijo que los Arquitectos les temian mas que al Origen.', 'Aquellas entidades no buscaban conquistar dimensiones. Simplemente existian, y eso era suficiente para destruir universos.'] },
          { label: 'Prueba', trial: true, lines: ['El campo de magma se fracturo mientras los Titanes destruian estructuras cosmicas.', 'Kael debia atravesar plataformas inestables antes de quedar atrapado bajo el colapso de mundos completos.', 'Ondas gravitacionales, explosiones y fragmentos planetarios convertian cada ruta en una guerra imposible.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El magma dimensional se abre bajo los pasos de los Titanes.', 'Kael debe alcanzar la fortaleza antes de que el colapso de mundos cierre todo camino.'], lines: ['Kael alcanzo una fortaleza construida sobre restos de planetas destruidos.', 'Miles de Titanes despertaban simultaneamente dentro del Vacio Exterior.', 'Todos parecian dirigirse hacia la Puerta Absoluta; si llegaban, el equilibrio dimensional desapareceria.'] },
        ],
      },
      {
        id: 'fortaleza-arquitectos',
        number: '02',
        title: 'La Fortaleza de los Arquitectos',
        trial: 'Sudoku',
        condition: 'Mantener activas barreras dimensionales ante ondas gravitacionales titanicas.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          { label: 'Murallas', lines: ['Los Arquitectos llevaron a Kael a una fortaleza suspendida entre dimensiones colapsadas.', 'Armas dimensionales giraban alrededor de murallas infinitas y miles de mecanismos sostenian el espacio cercano.', 'La fortaleza tenia marcas antiguas de combate: los Titanes ya habian atacado antes.'] },
          { label: 'Sellos', lines: ['Kael descubrio que los Titanes nacieron del Vacio Exterior antes de la creacion del tiempo dimensional.', 'Los Arquitectos solo lograron contenerlos con sellos cosmicos y estructuras como la Puerta Absoluta.', 'Pero esos sellos fallaban, y un Titan ya habia detectado el nucleo dimensional principal.'] },
          { label: 'Prueba', trial: true, lines: ['La fortaleza reorganizo sus defensas mientras ondas gravitacionales atacaban varios sectores.', 'Kael debia estabilizar secuencias energeticas antes de que las barreras colapsaran.', 'Cada error destruia defensas, sellaba rutas o derrumbaba estructuras completas.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['Las barreras de la fortaleza tiemblan bajo presion titanica.', 'Kael debe ordenar sus secuencias antes de que una grieta alcance el nucleo principal.'], lines: ['Las defensas se mantuvieron activas temporalmente y varias grietas comenzaron a cerrarse.', 'Pero una transmision mostro algo aterrador.', 'Uno de los Titanes habia comenzado a absorber energia directamente del Origen, e incluso Umbra parecia sorprendido.'] },
        ],
      },
      {
        id: 'titan-negro',
        number: '03',
        title: 'El Titan Negro',
        trial: 'FlashMind',
        condition: 'Escapar de una onda gravitacional que atraviesa dimensiones simultaneamente.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Entidad', lines: ['Desde el Vacio Exterior emergio una entidad mucho mas grande que los demas Titanes.', 'Su cuerpo mezclaba oscuridad absoluta, magma dimensional y fragmentos de universos destruidos.', 'Los Arquitectos lo llamaban el Titan Negro.'] },
          { label: 'Ciclo', lines: ['El Titan Negro avanzo hacia la Puerta Absoluta destruyendo barreras creadas hace millones de ciclos universales.', 'Umbra observo junto a Kael y admitio que ni los Arquitectos lograron detenerlo completamente.', 'Kael comprendio que el Origen desperto porque los Titanes estaban regresando.'] },
          { label: 'Prueba', trial: true, lines: ['El Titan Negro libero una onda gravitacional que atraveso multiples dimensiones.', 'Kael debia escapar mientras estructuras enteras desaparecian alrededor suyo.', 'Plataformas rotas, espacio cambiante y energia del Vacio Exterior desintegraban el entorno en tiempo real.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La onda del Titan Negro destruye dimensiones cercanas.', 'Kael debe resistir el colapso antes de que la Puerta Absoluta pierda sus barreras.'], lines: ['Kael sobrevivio al colapso parcial de las dimensiones cercanas.', 'El Titan Negro alcanzo las barreras externas de la Puerta Absoluta y millones de cadenas comenzaron a romperse.', 'Una voz gigantesca atraveso el vacio universal: EL CICLO HA REGRESADO.'] },
        ],
      },
      {
        id: 'guerra-universal',
        number: '04',
        title: 'La Guerra Universal',
        trial: 'Torre Infinita',
        condition: 'Estabilizar un sector junto a la Puerta Absoluta mientras universos caen.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          { label: 'Frente', lines: ['La guerra comenzo oficialmente.', 'Los Arquitectos movilizaron estructuras supremas y Umbra libero sistemas ocultos del torneo para contener el avance titanico.', 'Aun asi, universos completos desaparecian bajo tormentas gravitacionales.'] },
          { label: 'Alianza', lines: ['Los Titanes atravesaban dimensiones con sus manos y absorbian energia de estrellas y nucleos universales.', 'Las armas de los Arquitectos apenas lograban retrasarlos.', 'Entonces Kael vio algo inesperado: Umbra luchaba junto a los Arquitectos contra un enemigo comun.'] },
          { label: 'Prueba', trial: true, lines: ['Kael debia atravesar sectores destruidos mientras la guerra universal colapsaba alrededor suyo.', 'Rutas desaparecian por explosiones gravitacionales y fragmentos dimensionales destruian caminos en segundos.', 'Cada decision debia tomarse antes de que el universo cambiara de forma.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Guerra Universal rompe sectores cercanos a la Puerta Absoluta.', 'Kael debe sostener una ruta para que varias dimensiones sobrevivan unos momentos mas.'], lines: ['Kael estabilizo parcialmente un sector cercano a la Puerta Absoluta.', 'Pero el Titan Negro continuo avanzando.', 'Los Arquitectos revelaron una estructura antigua capaz de enfrentarlo: el Corazon Titanico.'] },
        ],
      },
      {
        id: 'corazon-titanico',
        number: '05',
        title: 'El Corazon Titanico',
        trial: 'Matematicas',
        condition: 'Controlar energia de antiguos Titanes sin destruir dimensiones cercanas.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          { label: 'Nucleo', lines: ['Los Arquitectos guiaron a Kael hacia una estructura oculta en el centro del Vacio Exterior.', 'Alli existia un nucleo construido con energia de antiguos Titanes derrotados.', 'El Corazon Titanico podia alterar el equilibrio universal, pero tambien destruir dimensiones si perdia estabilidad.'] },
          { label: 'Arrebato', lines: ['Al activarlo, Kael vio registros de guerras universales donde entidades como el Titan Negro arrasaban realidades.', 'Comprendio que los Titanes no querian destruir dimensiones.', 'Querian recuperar algo que los Arquitectos les habian arrebatado, y la Puerta Absoluta parecia estar relacionada.'] },
          { label: 'Prueba', trial: true, lines: ['La energia del Corazon Titanico se expandio peligrosamente.', 'Kael debia reorganizar secuencias dimensionales antes de que el nucleo explotara.', 'Cada error aumentaba la presion gravitacional y fusionaba dimensiones violentamente.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Corazon Titanico despierta con energia inestable.', 'Kael debe controlar su nucleo antes de destruir aquello que intenta salvar.'], lines: ['Kael estabilizo parcialmente el Corazon Titanico y una onda atraveso el cosmos universal.', 'Por primera vez, el Titan Negro se detuvo.', 'Pero el Vacio Exterior se abrio aun mas, y algo muchisimo mas grande observo desde la oscuridad absoluta.'] },
        ],
      },
      {
        id: 'el-titan',
        number: '06',
        title: 'El Titan',
        trial: 'NumCatch',
        condition: 'Completar una evaluacion final bajo gravedad extrema y guerra universal.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Supervivencia', lines: ['El universo dimensional se reorganizo alrededor del Corazon Titanico mientras guerras continuaban en multiples realidades.', 'La voz del sistema aparecio: los Titanes no representan fuerza.', 'Representan supervivencia absoluta frente al fin universal.'] },
          { label: 'Despertar', lines: ['Kael sintio que parte del Vacio Exterior respondia a su presencia.', 'Ondas gravitacionales disminuian cerca suyo y estructuras supremas reaccionaban a sus decisiones.', 'Pero tambien vio muchisimos mas Titanes dormidos fuera de las dimensiones conocidas, despertando lentamente.'] },
          { label: 'Prueba', trial: true, lines: ['La evaluacion final mezclo gravedad extrema, colapso dimensional y guerras universales simultaneas.', 'Plataformas podian destruirse al instante y Titanes alteraban el espacio con solo moverse.', 'Nada permanecia estable. Todo se acercaba al final absoluto del universo dimensional.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Corazon Titanico exige una ultima sincronizacion.', 'Kael debe resistir mientras miles de Titanes despiertan en el Vacio Exterior.'], lines: ['La simulacion termino y el simbolo de TITAN aparecio frente a Kael mientras el Corazon Titanico libero una explosion roja.', 'Antes de cerrarse el libro, el Titan Negro observo directamente a Kael.', 'Detras de el, miles de Titanes comenzaron a levantarse. Una frase quedo grabada: LOS INMORTALES REGRESAN.'] },
        ],
      },
    ],
    closingPages: [
      { type: 'seal', kicker: 'Sello del tomo', title: 'La guerra no termina', lockedUntilBookComplete: true, sealedLines: ['La Guerra de los Titanes Eternos no cerrara mientras sus seis frentes sigan activos.', 'Cada prueba contiene un avance titanico, pero el Vacio Exterior sigue despertando.'], lines: ['El libro Titan se cerro con magma cosmico ardiendo sobre su portada.', 'Kael habia visto que incluso los enemigos del torneo podian unirse cuando el fin universal comenzaba a caminar.'], footer: 'Cierre titanico' },
    ],
  },
  inmortal: {
    id: 'inmortal',
    rankTitle: 'Inmortal',
    levelFrom: 326,
    levelTo: 350,
    title: 'El Reino del Tiempo Eterno',
    subtitle: 'Kael entra en un reino de relojes cosmicos y ciudades congeladas donde el Devorador Eterno comienza a borrar el tiempo mismo.',
    phase: '9.15',
    readerUrl: 'historia-libro.html?libro=inmortal',
    visual: { emblem: 'IM', primary: '#60a5fa', secondary: '#1e3a8a', accent: '#dbeafe', rgb: '96,165,250' },
    introPages: [
      { type: 'cover', kicker: 'Libro Inmortal', title: 'El Reino del Tiempo Eterno', lines: ['El libro Inmortal abre un oceano azul infinito con relojes cosmicos inmoviles, ciudades congeladas y portales cronologicos.', 'Tras el despertar de los Titanes, el tiempo empieza a romperse.'], footer: 'Libro Inmortal' },
      { type: 'index', kicker: 'Indice', title: 'Siete fracturas temporales', lines: ['Guardianes del Tiempo, ciudades detenidas, eras perdidas y la Ultima Linea Temporal conducen a Kael hacia el Devorador Eterno.', 'Los Inmortales continuan avanzando incluso cuando todos los futuros anuncian el final.'], footer: 'Tiempo eterno' },
    ],
    chapters: [
      {
        id: 'tiempo-detenido',
        number: '01',
        title: 'El Tiempo Detenido',
        trial: 'Esquiva Obstaculos',
        condition: 'Atravesar rutas congeladas antes de quedar atrapado en una fractura temporal.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          { label: 'Reino', lines: ['Cuando Kael abrio el libro de Inmortal, el universo quedo en silencio absoluto.', 'Las guerras desaparecieron y fueron reemplazadas por un oceano azul donde relojes cosmicos flotaban inmoviles sobre ciudades congeladas.', 'El titulo surgio entre energia azul: INMORTAL - El Reino del Tiempo Eterno.'] },
          { label: 'Guardian', lines: ['Kael avanzo entre explosiones congeladas y ciudades atrapadas en el instante de su destruccion.', 'Una figura con tunicas azules aparecio: cuando los Titanes despertaron, el tiempo comenzo a romperse.', 'Miles de lineas temporales colapsaban por la presion del Vacio Exterior.'] },
          { label: 'Prueba', trial: true, lines: ['Las estructuras temporales perdieron estabilidad y fragmentos cronologicos chocaron entre si.', 'Kael debia atravesar rutas congeladas antes de quedar atrapado en una fractura temporal infinita.', 'Plataformas retrocedian, desaparecian antes de usarse o repetian eventos por fallos temporales.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El tiempo detenido se fractura en ciclos infinitos.', 'Kael debe alcanzar el nucleo temporal antes de quedar atrapado fuera del presente.'], lines: ['Kael alcanzo el nucleo temporal y los relojes cosmicos se movieron durante unos segundos.', 'Pero reflejaron millones de futuros terminando igual: el universo dimensional destruido.', 'Una frase aparecio sobre el cielo azul: el final se acerca en todas las lineas temporales.'] },
        ],
      },
      {
        id: 'guardianes-tiempo',
        number: '02',
        title: 'Los Guardianes del Tiempo',
        trial: 'Sudoku',
        condition: 'Reorganizar secuencias cronologicas antes de que los futuros colapsen.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          { label: 'Fortaleza', lines: ['Los Inmortales llevaron a Kael a una fortaleza suspendida entre lineas temporales.', 'Alli se almacenaban todos los futuros posibles del universo dimensional.', 'Kael vio guerras no ocurridas, versiones del torneo contra entidades imposibles y dimensiones futuras destruidas.'] },
          { label: 'Devorador', lines: ['Los Guardianes mostraron registros de cuando los Arquitectos descubrieron el Vacio Exterior.', 'Lo mas aterrador no eran los Titanes, sino el Devorador Eterno.', 'Cada ciertos ciclos, aquella entidad despertaba consumiendo tiempo, dimensiones y realidades completas.'] },
          { label: 'Prueba', trial: true, lines: ['Las lineas temporales comenzaron a mezclarse y futuros enteros colapsaron al mismo tiempo.', 'Kael debia reorganizar secuencias cronologicas antes de que la fortaleza quedara atrapada en una fractura permanente.', 'Cada decision alteraba lineas universales distintas.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La fortaleza temporal cae entre futuros contradictorios.', 'Kael debe ordenar sus secuencias antes de que ninguna version del futuro sobreviva.'], lines: ['Kael estabilizo parcialmente las lineas temporales.', 'Pero los Guardianes mostraron una vision: en todos los futuros donde el Devorador despertaba, los Titanes huian.', 'Incluso aquellas entidades temian su llegada, y uno de los relojes principales comenzo a detenerse.'] },
        ],
      },
      {
        id: 'ciudad-congelada',
        number: '03',
        title: 'La Ciudad Congelada',
        trial: 'Domino',
        condition: 'Estabilizar sectores atrapados entre futuro, pasado y destruccion repetida.',
        gameId: 'domino',
        gameUrl: 'juegos/domino/domino.html',
        pages: [
          { label: 'Ultima Hora', lines: ['Mas alla de la fortaleza existia una ciudad detenida en el tiempo.', 'Personas inmoviles miraban hacia el cielo bajo una lluvia suspendida.', 'Los Inmortales la llamaban La Ultima Hora, atrapada para siempre en el segundo anterior a su destruccion.'] },
          { label: 'Victima', lines: ['Kael camino entre expresiones de miedo congeladas.', 'Grietas negras se extendian lentamente sobre las estructuras.', 'El Devorador consumia primero las lineas temporales antes de destruir dimensiones, y aquella ciudad fue la primera victima registrada.'] },
          { label: 'Prueba', trial: true, lines: ['La ciudad comenzo a reactivarse parcialmente mientras fragmentos temporales se descontrolaban.', 'Kael debia estabilizar sectores congelados antes de que toda la linea colapsara.', 'Calles avanzaban al futuro, otras retrocedian siglos y algunas repetian eternamente el instante de destruccion.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Ultima Hora se rompe entre tiempos superpuestos.', 'Kael debe estabilizar sus sectores antes de que la primera victima desaparezca del registro universal.'], lines: ['Kael contuvo parcialmente el colapso de la ciudad.', 'Entonces todas las personas congeladas giraron lentamente sus cabezas hacia el al mismo tiempo.', 'Una frase resono sobre la ciudad detenida: el Devorador ya desperto.'] },
        ],
      },
      {
        id: 'eras-perdidas',
        number: '04',
        title: 'Las Eras Perdidas',
        trial: 'FlashMind',
        condition: 'Salvar fragmentos historicos antes de que eras completas desaparezcan.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Eras', lines: ['Los Inmortales guiaron a Kael hacia un sector fuera del flujo temporal normal.', 'Fragmentos de eras desaparecidas flotaban en un vacio azul oscuro.', 'Civilizaciones enteras permanecian suspendidas como recuerdos abandonados por el tiempo.'] },
          { label: 'Ciclo', lines: ['Los Guardianes revelaron que el universo dimensional ya habia sido destruido antes, multiples veces.', 'Cada ciclo terminaba igual: Titanes despertando, dimensiones colapsando y finalmente la llegada del Devorador Eterno.', 'El torneo, Umbra y la Puerta Absoluta solo habian retrasado el final.'] },
          { label: 'Prueba', trial: true, lines: ['Las Eras Perdidas comenzaron a fracturarse bajo ondas temporales.', 'Kael debia reorganizar secuencias antiguas antes de que eras enteras desaparecieran del flujo universal.', 'Plataformas envejecian instantaneamente o dejaban de existir.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['Las Eras Perdidas se deshacen como recuerdos rotos.', 'Kael debe salvar fragmentos historicos antes de que el tiempo los borre por completo.'], lines: ['Kael salvo parte de las Eras Perdidas antes del colapso total.', 'Entonces encontro un registro imposible: una version futura de si mismo observaba el final del universo dimensional.', 'Detras de el solo existia oscuridad infinita.'] },
        ],
      },
      {
        id: 'devorador-eterno',
        number: '05',
        title: 'El Devorador Eterno',
        trial: 'Torre Infinita',
        condition: 'Mantener activo el nucleo temporal mientras el Devorador consume lineas cronologicas.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          { label: 'Sombra', lines: ['Los relojes del Reino del Tiempo Eterno comenzaron a detenerse uno por uno.', 'Las lineas temporales perdian estabilidad y futuros desaparecian alrededor del vacio azul.', 'Entonces el cielo se abrio y una sombra inmensa se movio mas alla del tiempo mismo: el Devorador Eterno.'] },
          { label: 'Cansancio', lines: ['Fragmentos completos del tiempo desaparecian simplemente porque la entidad existia.', 'Umbra aparecio junto a los Guardianes y dijo: ahora entiendes por que fui creado.', 'Por primera vez no parecia arrogante, sino cansado de una guerra imposible.'] },
          { label: 'Prueba', trial: true, lines: ['El Reino Temporal colapso mientras el Devorador consumia lineas cronologicas.', 'Kael debia estabilizar barreras antes de que el tiempo universal dejara de existir normalmente.', 'Rutas existian solo en futuros alternativos y zonas enteras eran borradas del flujo temporal.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Devorador Eterno consume lineas cronologicas completas.', 'Kael debe sostener el nucleo temporal aunque el tiempo deje de obedecer.'], lines: ['Kael mantuvo activo el nucleo temporal durante algunos momentos mas.', 'Entonces el Devorador abrio lentamente uno de sus ojos gigantescos sobre el vacio universal.', 'Todos los relojes del reino se detuvieron simultaneamente.'] },
        ],
      },
      {
        id: 'ultima-linea-temporal',
        number: '06',
        title: 'La Ultima Linea Temporal',
        trial: 'Matematicas',
        condition: 'Alcanzar el unico futuro donde el universo dimensional aun puede sobrevivir.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          { label: 'Esperanza', lines: ['Los Guardianes revelaron una ultima linea temporal oculta.', 'Un unico futuro donde el universo dimensional aun podia sobrevivir parcialmente.', 'Pero esa linea era extremadamente inestable y solo alguien capaz de resistir el colapso universal podia alcanzarla.'] },
          { label: 'Versiones', lines: ['Kael observo versiones alternativas de si mismo luchando en distintos futuros.', 'Algunas fueron derrotadas por Titanes, otras desaparecieron consumidas por el Devorador.', 'Una version permanecia de pie frente al final absoluto del universo.'] },
          { label: 'Prueba', trial: true, lines: ['La Ultima Linea Temporal comenzo a colapsar mientras futuros desaparecian alrededor de Kael.', 'Debia atravesar fragmentos temporales antes de quedar atrapado fuera del flujo universal.', 'Rutas cambiaban segun el tiempo usado y fracturas destruian futuros enteros.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Ultima Linea Temporal se rompe bajo futuros muertos.', 'Kael debe alcanzarla antes de que la esperanza quede fuera del flujo universal.'], lines: ['Kael alcanzo parcialmente la Ultima Linea Temporal antes del colapso completo del reino.', 'Mas alla del final del tiempo vio una estructura negra construyendose en la oscuridad absoluta.', 'Umbra observo en silencio y dijo: los Arquitectos del Vacio han regresado.'] },
        ],
      },
      {
        id: 'el-inmortal',
        number: '07',
        title: 'El Inmortal',
        trial: 'NumCatch',
        condition: 'Completar una evaluacion final entre futuros alternativos y colapso temporal.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Final', lines: ['El Reino del Tiempo Eterno comenzo a desaparecer mientras lineas temporales colapsaban alrededor del universo dimensional.', 'Los Guardianes observaron a Kael en silencio.', 'La voz del sistema dijo que los Inmortales avanzan incluso cuando el final ya comenzo.'] },
          { label: 'Conexion', lines: ['Kael sintio que el tiempo reaccionaba a su presencia.', 'Algunas fracturas se estabilizaban cerca suyo y multiples lineas sobrevivian porque el seguia avanzando.', 'Pero la conexion revelo que los Arquitectos del Vacio construian algo mayor que la Puerta Absoluta.'] },
          { label: 'Prueba', trial: true, lines: ['La evaluacion final mezclo colapso temporal, destruccion dimensional y alteraciones universales simultaneas.', 'Plataformas existian en multiples tiempos y rutas desaparecian entre futuros alternativos.', 'Nada seguia reglas normales; todo se acercaba al final absoluto de la existencia.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Reino del Tiempo Eterno se apaga alrededor de Kael.', 'La ultima evaluacion exige avanzar cuando todos los relojes anuncian el final.'], lines: ['La simulacion termino y el simbolo de INMORTAL aparecio frente a Kael.', 'El reino desaparecia dentro de la oscuridad azul infinita, pero millones de relojes comenzaron a girar hacia atras.', 'Una frase aparecio sobre el cosmos detenido: LA LEYENDA MAXIMA HA COMENZADO.'] },
        ],
      },
    ],
    closingPages: [
      { type: 'seal', kicker: 'Sello del tomo', title: 'Los relojes retroceden', lockedUntilBookComplete: true, sealedLines: ['El Reino del Tiempo Eterno no puede cerrarse mientras sus siete fracturas sigan abiertas.', 'Cada prueba preserva una linea temporal, pero el Devorador ya abrio los ojos.'], lines: ['El libro Inmortal se cerro con un tic azul que sono como un reloj dentro del vacio.', 'Kael habia aprendido que la inmortalidad no era vivir para siempre, sino avanzar cuando el tiempo ya no promete futuro.'], footer: 'Cierre inmortal' },
    ],
  },
  'leyenda-maxima': {
    id: 'leyenda-maxima',
    rankTitle: 'Leyenda Maxima',
    levelFrom: 351,
    levelTo: 375,
    title: 'El Fin del Universo Dimensional',
    subtitle: 'Kael presencia el ultimo horizonte, la Torre del Vacio y el juicio donde reiniciar la existencia parece la unica salida al ciclo.',
    phase: '9.16',
    readerUrl: 'historia-libro.html?libro=leyenda-maxima',
    visual: { emblem: 'LM', primary: '#fef08a', secondary: '#7c3aed', accent: '#ffffff', rgb: '254,240,138' },
    introPages: [
      { type: 'cover', kicker: 'Libro Leyenda Maxima', title: 'El Fin del Universo Dimensional', lines: ['El penultimo horizonte se abre con auroras dimensionales, universos fragmentados y ruinas cosmicas suspendidas en un vacio absoluto.', 'Kael llega al punto donde todas las fuerzas del sistema convergen: Titanes, Arquitectos, Umbra, el Origen y el Devorador.'], footer: 'Libro Leyenda Maxima' },
      { type: 'index', kicker: 'Indice', title: 'Cinco decisiones finales', lines: ['El Ultimo Horizonte, la Torre del Vacio, el Corazon del Multiverso y el Juicio Final preparan la decision imposible.', 'Ser Leyenda Maxima significa mirar el destino universal sin esconderse detras del bien o del mal.'], footer: 'Final dimensional' },
    ],
    chapters: [
      {
        id: 'ultimo-horizonte',
        number: '01',
        title: 'El Ultimo Horizonte',
        trial: 'Esquiva Obstaculos',
        condition: 'Sobrevivir al colapso de universos fragmentados alrededor del horizonte final.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          { label: 'Horizonte', lines: ['Cuando Kael abrio el libro de Leyenda Maxima, el tiempo dejo de existir por completo.', 'Frente a el aparecio un horizonte infinito donde miles de universos fragmentados flotaban entre auroras dimensionales.', 'Las estrellas nacian y morian en segundos mientras grietas gigantescas destruian sectores completos del cosmos.'] },
          { label: 'Torre', lines: ['Umbra aparecio observando el colapso universal y dijo que todo habia llegado demasiado lejos.', 'Mostro a los Arquitectos del Vacio construyendo una estructura con restos de dimensiones destruidas.', 'Titanes, Arquitectos y el Origen parecian dirigirse hacia el mismo lugar.'] },
          { label: 'Prueba', trial: true, lines: ['El horizonte dimensional comenzo a fracturarse violentamente.', 'Kael debia avanzar mientras universos colapsaban, plataformas desaparecian y ondas gravitacionales destruian rutas completas.', 'El entorno entero parecia acercarse al final absoluto.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Ultimo Horizonte se rompe entre universos fragmentados.', 'Kael debe sobrevivir al colapso inicial para ver que construyen los Arquitectos del Vacio.'], lines: ['Kael sobrevivio al colapso inicial y observo finalmente la estructura.', 'Era una gigantesca torre negra atravesando multiples universos simultaneamente.', 'Sobre ella, millones de simbolos comenzaron a iluminarse lentamente.'] },
        ],
      },
      {
        id: 'torre-vacio',
        number: '02',
        title: 'La Torre del Vacio',
        trial: 'Sudoku',
        condition: 'Reorganizar rutas dentro de una torre hecha con restos de realidades reiniciadas.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          { label: 'Fragmentos', lines: ['La torre parecia construida con fragmentos de realidades desaparecidas.', 'Ciudades destruidas, lineas temporales rotas y dimensiones enteras formaban sus estructuras infinitas.', 'Cada nivel alteraba completamente las leyes del universo cercano.'] },
          { label: 'Reinicio', lines: ['Kael descubrio que los Arquitectos del Vacio no querian destruir el universo dimensional.', 'Querian reconstruirlo.', 'Segun ellos, el ciclo de Titanes, Origen y Devoradores jamas terminaria si las dimensiones continuaban existiendo igual.'] },
          { label: 'Prueba', trial: true, lines: ['Las estructuras de la torre cambiaban mientras dimensiones chocaban entre si.', 'Kael debia reorganizar rutas antes de quedar atrapado dentro del colapso dimensional.', 'Nada permanecia estable demasiado tiempo.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Torre del Vacio reescribe sus niveles con realidades muertas.', 'Kael debe encontrar el nucleo antes de que la torre lo convierta en otro fragmento.'], lines: ['Kael alcanzo uno de los nucleos centrales de la torre.', 'Alli encontro registros de universos anteriores reiniciados por los Arquitectos del Vacio.', 'El ciclo ya habia ocurrido antes. Muchisimas veces.'] },
        ],
      },
      {
        id: 'corazon-multiverso',
        number: '03',
        title: 'El Corazon del Multiverso',
        trial: 'FlashMind',
        condition: 'Contener una esfera multiversal donde universos nacen y mueren al mismo tiempo.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Esfera', lines: ['En el centro de la torre existia una esfera de energia multiversal pura.', 'Dentro podian verse miles de dimensiones naciendo y destruyendose constantemente.', 'Era el Corazon del Multiverso, la fuente usada para reconstruir universos completos.'] },
          { label: 'Verdad', lines: ['Umbra explico finalmente que fue creado para impedir que los Arquitectos del Vacio reiniciaran otra vez toda la existencia.', 'Pero con el despertar del Devorador Eterno, el equilibrio se habia perdido completamente.', 'Entonces el corazon comenzo a perder estabilidad.'] },
          { label: 'Prueba', trial: true, lines: ['La esfera multiversal colapso mientras universos explotaban dentro del nucleo.', 'Kael debia estabilizar secuencias dimensionales antes de que el Corazon destruyera toda realidad conectada.', 'Cada pulso contenia nacimientos y finales al mismo tiempo.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Corazon del Multiverso se sobrecarga entre universos nacientes y muertos.', 'Kael debe contenerlo antes de que el reinicio destruya todo lo conectado.'], lines: ['Kael contuvo parcialmente el colapso.', 'Entonces vio algo aterrador dentro de la esfera.', 'Una version futura de si mismo estaba sentada sobre un gigantesco trono negro.'] },
        ],
      },
      {
        id: 'juicio-final',
        number: '04',
        title: 'El Juicio Final',
        trial: 'Torre Infinita',
        condition: 'Resistir el juicio dimensional mientras se ofrece reiniciar la existencia.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          { label: 'Juicio', lines: ['Los Arquitectos del Vacio aparecieron frente a Kael, hechos de oscuridad absoluta y energia universal.', 'Dijeron que el universo dimensional ya no podia salvarse.', 'Mostraron millones de lineas temporales terminando igual: destruccion absoluta.'] },
          { label: 'Eleccion', lines: ['Kael comprendio que el conflicto no era entre bien y mal.', 'Era entre reiniciar la existencia o permitir que el ciclo destruyera todo nuevamente.', 'Entonces el Devorador Eterno aparecio mas alla de la torre observando el universo final.'] },
          { label: 'Prueba', trial: true, lines: ['El juicio dimensional comenzo.', 'Las reglas universales cambiaban mientras realidades colapsaban alrededor de Kael.', 'Plataformas dejaban de existir, rutas se destruian y fracturas atravesaban el entorno entero.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Juicio Final exige decidir entre final y reinicio.', 'Kael debe resistir antes de que otros elijan por todo el universo dimensional.'], lines: ['La simulacion termino con una explosion multiversal atravesando toda la torre.', 'Los Arquitectos observaron a Kael en silencio.', 'Y le ofrecieron elegir el destino del universo dimensional.'] },
        ],
      },
      {
        id: 'la-leyenda-maxima',
        number: '05',
        title: 'La Leyenda Maxima',
        trial: 'NumCatch',
        condition: 'Completar la evaluacion final mientras el universo dimensional se apaga.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Destino', lines: ['El cosmos entero comenzo a detenerse lentamente.', 'Titanes, Arquitectos, Umbra y Guardianes observaron el mismo horizonte infinito mientras el Corazon del Multiverso brillaba.', 'La voz del sistema dijo por ultima vez que las Leyendas Maximas trascienden incluso el destino universal.'] },
          { label: 'Puerta negra', lines: ['Kael sintio que todas las dimensiones, lineas temporales y estructuras cosmicas se conectaban directamente con el.', 'Pero mas alla del universo conocido, una gigantesca puerta negra comenzo a abrirse.', 'Los Arquitectos del Vacio parecian sorprendidos.'] },
          { label: 'Prueba', trial: true, lines: ['La evaluacion final mezclo colapso universal, fracturas temporales y destruccion multiversal.', 'Nada seguia reglas normales y dimensiones explotaban alrededor del vacio absoluto.', 'Todo lo existente parecia apagarse al mismo tiempo.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El simbolo de Leyenda Maxima espera en el final del universo dimensional.', 'Kael debe completar la evaluacion cuando incluso los Arquitectos del Vacio pierden certeza.'], lines: ['La simulacion termino y el simbolo de LEYENDA MAXIMA aparecio frente a Kael.', 'El universo dimensional entero comenzo a apagarse lentamente.', 'Antes de cerrarse el libro, la puerta negra termino de abrirse y algo comenzo a construir nuevas dimensiones desde la oscuridad.'] },
        ],
      },
    ],
    closingPages: [
      { type: 'seal', kicker: 'Sello del tomo', title: 'El universo se apaga', lockedUntilBookComplete: true, sealedLines: ['El Fin del Universo Dimensional no puede cerrarse mientras sus cinco decisiones sigan abiertas.', 'Cada prueba acerca a Kael al punto donde crear puede ser tan peligroso como destruir.'], lines: ['El libro Leyenda Maxima se cerro con una aurora multiversal apagandose en su portada.', 'Kael habia llegado al final del universo conocido, pero desde la puerta negra algo nuevo comenzaba a nacer.'], footer: 'Cierre maximo' },
    ],
  },
  'arquitecto-del-vacio': {
    id: 'arquitecto-del-vacio',
    rankTitle: 'Arquitecto del Vacio',
    levelFrom: 376,
    levelTo: 400,
    title: 'El Nacimiento del Nuevo Universo',
    subtitle: 'Kael cruza la puerta final y presencia la creacion de nuevas dimensiones, donde el vacio consciente revela que el siguiente ciclo ya comenzo.',
    phase: '9.17',
    readerUrl: 'historia-libro.html?libro=arquitecto-del-vacio',
    visual: { emblem: 'AV', primary: '#ffffff', secondary: '#020617', accent: '#a78bfa', rgb: '255,255,255' },
    introPages: [
      { type: 'cover', kicker: 'Libro Arquitecto del Vacio', title: 'El Nacimiento del Nuevo Universo', lines: ['El ultimo tomo abre una oscuridad absoluta sin estrellas, tiempo, dimensiones ni sonido.', 'Sobre ese vacio empiezan a construirse estructuras imposibles: el final del torneo y el inicio de otra existencia.'], footer: 'Libro Arquitecto del Vacio' },
      { type: 'index', kicker: 'Indice', title: 'Seis actos de creacion', lines: ['La Puerta Final, el Nucleo Primordial, el Vacio Consciente, la Guerra del Nuevo Universo y el Nucleo Absoluto dan forma al cierre.', 'Ser Arquitecto del Vacio significa construir despues del fin, sabiendo que ningun ciclo muere del todo.'], footer: 'Nuevo universo' },
    ],
    chapters: [
      {
        id: 'puerta-final',
        number: '01',
        title: 'La Puerta Final',
        trial: 'Esquiva Obstaculos',
        condition: 'Atravesar estructuras que nacen y desaparecen en una realidad incompleta.',
        gameId: 'esquivaobstaculos',
        gameUrl: 'juegos/esquivaobstaculos/esquivaobstaculos.html',
        pages: [
          { label: 'Oscuridad', lines: ['Cuando Kael abrio el libro de Arquitecto del Vacio, toda existencia desaparecio.', 'No habia estrellas, tiempo, dimensiones ni sonido.', 'Solo oscuridad absoluta extendiendose infinitamente, hasta que simbolos primordiales comenzaron a aparecer.'] },
          { label: 'Arquitectos', lines: ['Frente a Kael aparecio la puerta negra vista al final de Leyenda Maxima, ahora completamente abierta.', 'De su interior emergian universos incompletos, lineas temporales rotas y dimensiones naciendo constantemente.', 'Los verdaderos Arquitectos del Vacio aparecieron con cuerpos formados por galaxias, energia pura y realidades enteras.'] },
          { label: 'Prueba', trial: true, lines: ['El vacio comenzo a reorganizarse violentamente.', 'Plataformas se construian en tiempo real y otras dejaban de existir despues de ser utilizadas.', 'Fragmentos del universo antiguo colapsaban alrededor de una realidad todavia incompleta.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['La Puerta Final abre un espacio donde las rutas aun no han sido creadas.', 'Kael debe cruzar una realidad incompleta antes de que el universo antiguo termine de caer.'], lines: ['Kael atraveso el vacio cambiante y alcanzo una plataforma suspendida sobre la oscuridad.', 'Los Arquitectos creaban dimensiones nuevas usando restos del universo anterior.', 'Pero algunas nacian corruptas desde el inicio. El Devorador Eterno seguia existiendo y se acercaba al nuevo universo.'] },
        ],
      },
      {
        id: 'constructores-realidades',
        number: '02',
        title: 'Los Constructores de Realidades',
        trial: 'Sudoku',
        condition: 'Estabilizar universos incompletos dentro del Nucleo Primordial.',
        gameId: 'sudoku',
        gameUrl: 'juegos/sudoku/sudoku.html',
        pages: [
          { label: 'Nucleo', lines: ['Los Arquitectos guiaron a Kael hacia el Nucleo Primordial.', 'Millones de universos incompletos flotaban en esferas negras mientras tiempo, gravedad y energia eran usados para construir realidades.', 'Algunas existencias parecian estables; otras colapsaban al instante.'] },
          { label: 'Seleccion', lines: ['Uno de los Arquitectos revelo el verdadero proposito del torneo.', 'Los jugadores nunca fueron simples participantes; eran observados para encontrar quienes resistieran el caos universal.', 'Kael habia llegado mas lejos que cualquier jugador registrado.'] },
          { label: 'Prueba', trial: true, lines: ['Multiples universos incompletos colapsaron simultaneamente.', 'Kael debia estabilizar secuencias universales antes de que las nuevas dimensiones fueran destruidas por errores estructurales.', 'Las reglas cambiaban constantemente porque aun estaban siendo escritas.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Nucleo Primordial pierde universos antes de que puedan nacer.', 'Kael debe estabilizar las primeras leyes antes de que el ciclo vuelva a contaminarlo todo.'], lines: ['Kael estabilizo parcialmente varios universos en construccion.', 'Pero los Arquitectos mostraron una verdad terrible: incluso creando universos nuevos, el ciclo siempre regresaba.', 'Titanes, Origen y Devoradores volvian eventualmente. Por eso querian cambiar las reglas de la existencia.'] },
        ],
      },
      {
        id: 'vacio-consciente',
        number: '03',
        title: 'El Vacio Consciente',
        trial: 'FlashMind',
        condition: 'Avanzar mientras el vacio adapta rutas segun pensamientos y decisiones.',
        gameId: 'flashmind',
        gameUrl: 'juegos/flashmind/flashmind.html',
        pages: [
          { label: 'Sector', lines: ['Mas alla del Nucleo Primordial existia un sector prohibido incluso para varios Arquitectos.', 'Alli el vacio parecia vivo y las estructuras reaccionaban como organismos conscientes.', 'Kael sintio que el lugar observaba cada movimiento.'] },
          { label: 'Umbra', lines: ['Umbra aparecio con una forma distinta, fusionandose parcialmente con el vacio.', 'Revelo que no nacio solo del torneo o los Arquitectos.', 'Nacio cuando el propio vacio desarrollo conciencia al observar universos morir una y otra vez.'] },
          { label: 'Prueba', trial: true, lines: ['El Vacio Consciente altero completamente las leyes del entorno.', 'Plataformas cambiaban segun pensamientos, emociones o decisiones tomadas segundos antes.', 'Algunas rutas solo existian si Kael mantenia estabilidad mental absoluta.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Vacio Consciente aprende cada movimiento de Kael.', 'Debe avanzar sin alimentar las rutas que intentan encerrarlo.'], lines: ['Kael resistio la presion y las estructuras dejaron de deformarse lentamente.', 'Umbra lo observo y dijo que ahora entendia la verdad.', 'La oscuridad absoluta no era un espacio vacio: era una entidad mas antigua que los universos, despertando por completo.'] },
        ],
      },
      {
        id: 'guerra-nuevo-universo',
        number: '04',
        title: 'La Guerra del Nuevo Universo',
        trial: 'Torre Infinita',
        condition: 'Mantener activas dimensiones recien creadas ante el avance del vacio consciente.',
        gameId: 'torreinfinita',
        gameUrl: 'juegos/torreinfinita/torreinfinita.html',
        pages: [
          { label: 'Nacimiento', lines: ['Mientras los Arquitectos construian nuevas dimensiones, fracturas aparecieron sobre el vacio absoluto.', 'Restos del universo antiguo, fragmentos de Titanes y ondas del Devorador chocaban contra las nuevas estructuras.', 'La nueva existencia corria peligro antes de nacer completamente.'] },
          { label: 'Reglas', lines: ['Los Arquitectos movilizaron estructuras de creacion universal y Umbra lucho para evitar que el vacio consumiera las dimensiones nacientes.', 'Pero el sistema anterior ya no servia.', 'Kael comprendio que reconstruir universos no bastaba; habia que crear reglas nuevas.'] },
          { label: 'Prueba', trial: true, lines: ['La guerra dimensional se extendio por universos en construccion.', 'Kael debia estabilizar fragmentos universales antes de que el vacio consciente destruyera las nuevas realidades.', 'Plataformas dejaban de existir y dimensiones alteraban sus propias reglas.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Nuevo Universo nace en medio de una guerra.', 'Kael debe sostener dimensiones jovenes antes de que el vacio consciente las reclame.'], lines: ['Kael mantuvo activas varias dimensiones recien creadas.', 'Entonces el vacio consciente hablo por primera vez: toda existencia eventualmente regresa a mi.', 'La oscuridad comenzo a cubrir realidades nuevas y los Arquitectos no parecian tener forma de detenerla.'] },
        ],
      },
      {
        id: 'nucleo-absoluto',
        number: '05',
        title: 'El Nucleo Absoluto',
        trial: 'Matematicas',
        condition: 'Reorganizar leyes fundamentales del nuevo universo.',
        gameId: 'matematicas',
        gameUrl: 'juegos/matematicas/matematicas.html',
        pages: [
          { label: 'Corazon', lines: ['Los Arquitectos llevaron a Kael al centro absoluto de la nueva existencia.', 'Alli flotaba una esfera negra y blanca conocida como el Nucleo Absoluto.', 'Todas las dimensiones, tiempos y realidades futuras dependian de aquella estructura.'] },
          { label: 'Miedo', lines: ['Kael vio futuros posibles del nuevo universo: algunos con paz, otros repitiendo el ciclo de destruccion.', 'Comprendio que el problema nunca fue solo el Origen, los Titanes o el Devorador.', 'Era el miedo de las civilizaciones a desaparecer, un miedo que creaba guerras universales una y otra vez.'] },
          { label: 'Prueba', trial: true, lines: ['El Nucleo Absoluto comenzo a colapsar mientras secuencias universales perdian estabilidad.', 'Kael debia reorganizar leyes fundamentales antes de que la existencia naciente desapareciera.', 'Tiempo, gravedad, dimensiones y energia cambiaban mientras el vacio intentaba consumir el nucleo desde dentro.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El Nucleo Absoluto se corrompe antes de terminar de nacer.', 'Kael debe ordenar sus leyes sin repetir los errores del universo anterior.'], lines: ['Kael estabilizo parcialmente el Nucleo Absoluto y multiples universos comenzaron a reorganizarse.', 'Los Arquitectos observaron a Kael en silencio.', 'Por primera vez, inclinaron sus cabezas, reconociendolo como igual.'] },
        ],
      },
      {
        id: 'arquitecto-vacio',
        number: '06',
        title: 'El Arquitecto del Vacio',
        trial: 'NumCatch',
        condition: 'Completar la evaluacion final donde creacion y colapso ocurren simultaneamente.',
        gameId: 'numcatch',
        gameUrl: 'juegos/numcatch/numcatch.html',
        pages: [
          { label: 'Expansion', lines: ['El nuevo universo comenzo a expandirse alrededor del Nucleo Absoluto.', 'Millones de dimensiones nacian nuevamente sobre la oscuridad infinita.', 'La voz del sistema aparecio una ultima vez: los Arquitectos del Vacio no sobreviven al final; construyen lo que viene despues.'] },
          { label: 'Respuesta', lines: ['Kael sintio que el vacio, las dimensiones y el nuevo universo respondian a su presencia.', 'Las estructuras se reorganizaban y realidades nacian segun sus decisiones.', 'Pero el vacio consciente seguia observando desde mas alla de toda existencia: esperando, aprendiendo y evolucionando.'] },
          { label: 'Prueba', trial: true, lines: ['La evaluacion final mezclo creacion universal, colapso dimensional y reconstruccion absoluta.', 'Plataformas podian convertirse en universos completos y rutas desaparecian antes de existir.', 'Nada seguia reglas antiguas; todo parecia el inicio de una nueva existencia.'] },
          { label: 'Consecuencia', afterTrial: true, sealedLines: ['El ultimo simbolo espera en una realidad que aun no termina de existir.', 'Kael debe completar la evaluacion mientras el nuevo universo decide sus primeras leyes.'], lines: ['La simulacion termino y el simbolo de ARQUITECTO DEL VACIO aparecio frente a Kael.', 'El nuevo universo comenzo a expandirse sobre la oscuridad absoluta.', 'Antes de cerrarse el libro, el vacio consciente abrio millones de ojos y una frase atraveso toda la nueva existencia: EL SIGUIENTE CICLO YA HA COMENZADO.'] },
        ],
      },
    ],
    closingPages: [
      { type: 'seal', kicker: 'Sello final', title: 'El siguiente ciclo', lockedUntilBookComplete: true, sealedLines: ['El Nacimiento del Nuevo Universo no puede cerrarse mientras sus seis actos sigan incompletos.', 'Cada prueba crea una ley nueva, pero el vacio consciente ya aprende de ellas.'], lines: ['El ultimo libro se cerro sin sonar. No hubo victoria completa, ni final limpio.', 'Solo un nuevo universo expandiendose, Kael frente a la oscuridad, y la certeza de que incluso los ciclos pueden ser desafiados cuando alguien recuerda como empezaron.'], footer: 'Cierre del nuevo universo' },
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
