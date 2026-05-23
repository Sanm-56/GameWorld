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
