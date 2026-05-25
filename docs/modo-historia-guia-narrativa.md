# Guia narrativa - Modo Historia

## Estado

Modo Historia ya tiene la biblioteca base y el ciclo completo de relatos por rango:

- Entrada de Modo Historia en el index.
- Biblioteca visual de relatos por rango.
- Fase 9.2 reservada para la Biblioteca de Historias.
- 120 relatos registrados para 120 rangos.
- Relatos abiertos con capitulos, pruebas, progreso local y cierre narrativo.
- Fases de relatos normalizadas de 9.1 a 9.121, saltando 9.2 porque pertenece a la pantalla general de biblioteca.

Siguiente objetivo recomendado:

- Revisar calidad narrativa, ritmo visual y pruebas relato por relato.
- Probar recorridos completos desde la Biblioteca hacia los juegos y de regreso al relato.
- Definir si el progreso de relatos debe seguir solo en localStorage o sincronizarse luego con Supabase.

## Canon base

El torneo existe conectado a una dimension digital llamada **El Nexus**.

Dentro del Nexus existe la **Biblioteca de Historias**, un archivo vivo que registra el avance de cada jugador. Cada rango del torneo se manifiesta como un relato. Estos relatos no son las historias completas: contienen resumenes clave, pruebas, sellos y fragmentos narrativos que responden al progreso del jugador.

Cuando un jugador sube de rango, la biblioteca revela un nuevo relato.

## Estructura del universo

- **El Nexus:** dimension competitiva donde se procesan los retos del torneo.
- **Biblioteca de Historias:** zona narrativa donde viven los relatos por rango.
- **Relatos:** etapas resumidas del jugador, representadas por su rango.
- **Capitulos:** escenas cortas que desarrollan el resumen narrativo del relato.
- **Pruebas:** retos conectados con los juegos existentes.
- **Sellos:** desbloqueos narrativos que permiten avanzar.
- **Ecos:** rastros de jugadores anteriores o eventos del sistema.

## Tono

La experiencia debe sentirse:

- Futurista.
- Misteriosa.
- Cinematografica.
- Competitiva.
- Elegante.
- Ligeramente oscura.
- Tecnologica.
- Premium.

Debe evitar sentirse:

- Infantil.
- Comica.
- Medieval generica.
- Excesivamente explicativa.
- Como una card mas de juegos.

La sensacion guia:

> El jugador entro a un sistema antiguo, poderoso y vivo.

## Reglas narrativas

- Los relatos reaccionan al progreso del jugador.
- Cada rango tiene un relato propio.
- Las pruebas son simulaciones creadas por el Nexus.
- Algunos relatos estan sellados hasta alcanzar el rango requerido.
- El Nexus nunca explica todo.
- Los mejores jugadores pueden dejar ecos dentro de la biblioteca.
- El misterio es parte del valor de la experiencia.
- Cada relato debe tener identidad propia, aunque use la misma estructura tecnica.

## Relacion entre relatos, capitulos y juegos

La estructura base es:

```text
Relato = rango del jugador
Capitulo = escena narrativa corta
Juego = prueba para avanzar
Sello = recompensa/desbloqueo narrativo
```

Ejemplo:

```text
Relato Novato: El Despertar
Capitulo 1: La Activacion
Prueba: Sudoku
Resultado: Primer sello estabilizado
```

Los juegos no deben presentarse como botones sueltos. Deben sentirse como pruebas dentro del mundo.

Ejemplos de integracion:

- **Sudoku:** los paneles numericos del Nexus deben estabilizarse.
- **Matematicas:** el sistema exige calculos para abrir una compuerta.
- **Memoria:** fragmentos del archivo aparecen desordenados.
- **Ajedrez:** guardianes tacticos protegen el acceso.
- **Dominó:** piezas de energia deben alinearse.
- **Damas:** el jugador cruza una zona de control.
- **FlashMind:** el Nexus mide reflejos de sincronizacion.
- **NumCatch:** codigos numericos deben capturarse antes de caer.
- **Cricket Arcade:** impacto y precision para romper un sello.
- **Esquiva Obstaculos:** corredor de energia inestable.
- **Torre Infinita:** estabilizacion vertical del archivo.
- **Sube la Montana:** ascenso hacia un nucleo superior.

## Estructura de cada relato

Cada relato debe tener:

1. Portada.
2. Introduccion corta.
3. Indice de capitulos.
4. Paginas narrativas.
5. Pruebas asociadas.
6. Estado de progreso.
7. Recompensa o sello narrativo.

La estructura puede ser reutilizable, pero el contenido no debe ser generico.

## Estructura de cada capitulo

Cada capitulo debe tener:

- Titulo.
- Texto breve.
- Estado: bloqueado, disponible o completado.
- Prueba asociada.
- Frase de desbloqueo o recompensa.

Formato recomendado:

```text
[Titulo del capitulo]

2 a 6 lineas de historia.

Prueba:
Juego requerido + condicion.

Resultado:
Sello, fragmento o frase de avance.
```

## Reglas de texto para movil

- Maximo 2 a 6 lineas por escena.
- Una idea importante por pantalla.
- Evitar parrafos largos.
- Usar frases con ritmo visual.
- Priorizar atmosfera, no explicacion.
- La animacion y la interfaz deben cargar parte de la emocion.

La narrativa debe sentirse como una cinemática interactiva ligera.

## Identidad inicial de relatos

Esta lista es una guia inicial. Los nombres pueden ajustarse relato por relato.

| Rango | Nombre del relato | Tema | Color guia | Simbolo |
| --- | --- | --- | --- | --- |
| Novato | El Despertar | Primera conexion | Azul neon | Fragmento luminoso |
| Amateur | Las Primeras Senales | Entrenamiento | Verde energetico | Triangulo |
| Aspirante | El Archivo Fragmentado | Corrupcion inicial | Morado | Grieta digital |
| Profesional | La Ruta Tactica | Estrategia | Dorado | Nodo tactico |
| Competidor | La Camara de Velocidad | Reflejos | Rojo neon | Pulso |
| Experto | Los Ecos del Nexus | Dominio mental | Cyan | Onda |
| Elite | La Torre de Cristal | Ascenso | Blanco azulado | Cristal |
| Maestro | Los Guardianes del Archivo | Prueba mayor | Negro y oro | Llave |
| Gran Maestro | La Dimension Central | Control | Dorado profundo | Nucleo |
| Leyenda | El Relato Perdido | Memoria antigua | Amarillo astral | Estrella |
| Mitico | La Corona del Vacio | Poder oculto | Violeta | Corona rota |
| Supremo | El Nucleo Eterno | Estabilidad final | Plata y cyan | Anillo |
| Titan | La Guerra de los Ecos | Ruptura | Carmesi | Marca de impacto |
| Inmortal | El Ultimo Registro | Permanencia | Turquesa | Registro vivo |
| Leyenda Maxima | El Archivo Absoluto | Cierre del ciclo | Oro blanco | Sello absoluto |

## Fase 9.1 - Relato Novato

Nombre:

```text
Relato Novato: El Despertar
```

Tema:

El jugador acaba de ser detectado por el Nexus. La biblioteca no lo reconoce todavia como competidor estable. Para avanzar, debe activar sus primeros sellos.

Sensacion visual:

- Azul neon.
- Dorado suave.
- Particulas ligeras.
- Simbolos flotantes.
- Energia digital.
- Relato limpio, misterioso y accesible.

Simbolo:

```text
Fragmento luminoso
```

Capitulos iniciales:

| Capitulo | Nombre | Prueba sugerida | Funcion narrativa |
| --- | --- | --- | --- |
| 1 | La Activacion | Sudoku | El jugador estabiliza el primer codigo |
| 2 | El Primer Codigo | Matematicas | El Nexus mide precision mental |
| 3 | Memorias Fragmentadas | Memoria | El jugador recompone datos rotos |
| 4 | La Camara Inicial | FlashMind o NumCatch | El sistema prueba reflejos |
| 5 | Conexion Establecida | Juego final del relato | El jugador completa el primer sello |

Texto base del Capitulo 1:

```text
Se detecto una nueva conexion.

El Archivo Central abrio sus puertas lentamente.

Miles de fragmentos luminosos recorrieron el vacio mientras el sistema analizaba al nuevo jugador.

El Nexus observaba.
```

Version ajustada recomendada:

```text
Una nueva conexion atraviesa el Nexus.

La biblioteca despierta entre lineas de luz azul.

Un fragmento sin nombre aparece frente al primer relato.

El sistema observa. La prueba inicial comienza.
```

## Mapa de fases actual

La fase 9.2 no representa un relato. Es la pantalla general de Biblioteca de Historias, donde se listan los relatos por rango, se muestra el relato activo y se abren los lectores.

Los relatos usan la secuencia:

```text
9.1 Relato Novato
9.2 Biblioteca de Historias
9.3 Relato Amateur
9.4 Relato Aspirante
...
9.119 Relato Emperador del Juicio Final
9.120 Relato Titan del Vacio Primordial
9.121 Relato El Ultimo Ascendido
```

Si se agregan nuevos rangos, cada nuevo relato debe recibir una fase posterior a 9.121 o abrir un nuevo bloque de version narrativa.

## Orden de desarrollo desde ahora

La estructura de relatos ya esta completa. A partir de ahora el desarrollo debe avanzar por ciclos de revision:

```text
Revision de biblioteca
Confirmar que 9.2 se entiende como pantalla general, no como relato faltante.

Revision por relato
Leer portada, capitulos, pruebas y cierre.
Verificar que el tono sea propio y que la prueba conecte con la escena.

Revision de recorrido
Abrir prueba desde el relato.
Completar juego.
Volver al relato.
Confirmar que el capitulo queda completado y el siguiente se desbloquea.
```

## Criterios de calidad

Un relato se considera listo cuando:

- Tiene identidad visual propia.
- Tiene capitulos claros y cortos.
- Se ve bien en celular, tablet y computador.
- No se siente como una card normal.
- Sus pruebas tienen sentido narrativo.
- El usuario entiende que esta avanzando dentro de una historia.
- El contenido no parece relleno automatico.

## Principio guia

Sistema reutilizable, contenido artesanal.

La tecnologia puede repetirse. La sensacion de cada relato no.
