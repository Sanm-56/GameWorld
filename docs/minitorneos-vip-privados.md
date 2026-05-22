# Minitorneos VIP privados

## Fase 1: reglas del sistema

Los Minitorneos VIP privados son competencias cerradas por invitacion dentro de la Zona VIP. No son apuestas, casino ni juegos de azar: el acceso depende de una membresia VIP activa y de una inscripcion confirmada para una sala especifica, y los ganadores se definen por habilidad en el juego seleccionado.

### Principios

- La Zona VIP permite ver la seccion, pero no autoriza participar por si sola.
- Cada sala privada tiene su propia lista de participantes autorizados.
- Una inscripcion confirmada no se hereda entre salas ni entre dias.
- Solo el administrador puede crear, abrir, iniciar, finalizar o archivar salas.
- Los usuarios no pueden crear salas privadas VIP.
- El codigo privado de sala no debe mostrarse en listados publicos ni rankings.
- Los resultados de estas salas no se mezclan con el torneo principal, Solitario, minitorneos normales ni rankings normales.
- La interfaz debe hablar de inscripcion confirmada, participacion autorizada, reglas, competencia, resultados y reconocimiento.
- La interfaz no debe usar terminos como apuesta, saldo apostado, pozo, retiro, casino o jackpot.

### Condiciones de acceso

Para entrar a una sala privada VIP el sistema debe validar en Supabase:

- usuario registrado;
- codigo unico del login coincide con el usuario;
- membresia VIP activa mediante `obtener_estado_vip`;
- sala privada existente;
- sala en estado permitido;
- usuario registrado como participante de esa sala;
- inscripcion del participante en estado `confirmada` o `cortesia`.

Para iniciar el juego y para guardar resultado se debe repetir la validacion de sala, juego, VIP activo e inscripcion confirmada. El frontend puede mostrar botones, pero Supabase decide los permisos reales.

### Estados de sala

- `borrador`: creada por admin, aun no visible para participantes.
- `inscripcion`: acepta participantes pendientes o confirmados.
- `lista`: inscripciones cerradas, participantes listos.
- `en_juego`: competencia activa y resultados permitidos.
- `finalizada`: competencia terminada; no acepta nuevos resultados.
- `cancelada`: sala anulada.
- `archivada`: sala cerrada para historico/admin.

### Estados de inscripcion

- `pendiente`: usuario registrado, aun sin confirmacion.
- `confirmada`: usuario autorizado para participar.
- `cortesia`: usuario autorizado por invitacion/admin sin cobro operativo.
- `cancelada`: inscripcion retirada.
- `rechazada`: usuario no autorizado para esa sala.

### Flujo del usuario

1. Entra a Zona VIP.
2. El sistema valida VIP activo.
3. Abre la seccion Minitorneos VIP privados.
4. Ingresa codigo privado de sala.
5. Supabase valida usuario, VIP activo e inscripcion confirmada.
6. Si esta autorizado, ve reglas, juego, cupos, estado y participantes.
7. El boton para jugar solo aparece cuando la sala esta `lista` o `en_juego`, segun regla final.
8. Al terminar, el resultado se guarda solo en resultados privados VIP.

### Flujo del administrador

1. Crea una sala privada VIP.
2. Define nombre, juego, cupo, reglas, reconocimiento y codigo privado.
3. Agrega participantes o revisa solicitudes.
4. Marca cada inscripcion como `confirmada`, `cortesia`, `cancelada` o `rechazada`.
5. Cambia la sala a `lista` y luego a `en_juego`.
6. Finaliza la sala, revisa resultados y confirma ganador si aplica.
7. Archiva la sala cuando ya no se necesita en la vista activa.

## Fase 2: estructura Supabase

La base de datos debe quedar separada de los minitorneos normales. No se deben reutilizar `salas`, `sala_jugadores` ni `solitario_resultados` para esta feature.

Tablas propuestas:

- `vip_private_tournaments`: salas privadas VIP.
- `vip_private_tournament_players`: participantes e inscripcion confirmada por sala.
- `vip_private_tournament_results`: resultados internos por sala.

La tabla critica es `vip_private_tournament_players`, porque ahi se decide si un usuario VIP puede participar en una sala concreta. La regla de acceso sera:

`entry_status in ('confirmada', 'cortesia')`

Estas tablas deben tener RLS activo y acceso directo revocado para `anon` y `authenticated`, siguiendo el patron actual de `supabase-vip.sql`. Las siguientes fases deben exponer acceso solo mediante RPCs con validaciones completas.

## Fase 3: RPCs de seguridad

El cliente no debe consultar ni modificar directamente las tablas privadas. Toda accion debe pasar por RPC.

RPCs de usuario:

- `vip_private_join_with_code`: valida usuario, codigo unico, VIP activo, codigo privado de sala e inscripcion confirmada.
- `vip_private_check_access`: revalida acceso a una sala privada ya conocida.
- `vip_private_start_game`: permite preparar el lanzamiento solo si la sala esta `en_juego` y el juego coincide.
- `vip_private_submit_result`: guarda resultado solo si el usuario sigue VIP, inscrito y confirmado en esa sala.

RPCs de administrador:

- `admin_vip_private_guardar_torneo`: crea o edita una sala privada.
- `admin_vip_private_listar_torneos`: lista salas para administracion.
- `admin_vip_private_guardar_participante`: agrega usuario y cambia estado de inscripcion.
- `admin_vip_private_cambiar_estado`: mueve la sala entre estados.
- `admin_vip_private_finalizar_torneo`: finaliza sala y permite marcar ganador confirmado.

Reglas aplicadas:

- El usuario no puede participar solo por ser VIP.
- El resultado solo se guarda si la inscripcion esta `confirmada` o `cortesia`.
- La sala debe estar `en_juego` para iniciar juego y recibir resultados.
- Se permite un resultado valido por usuario y sala.
- El helper interno de payload no debe ser invocable directamente desde cliente.

## Fase 4: modulo JS usuario

La logica de usuario vive en `juegos/js/vip-private-tournaments.js` para no seguir cargando `vip.html` con mas comportamiento.

Responsabilidades del modulo:

- leer identidad VIP con `getVipIdentity`;
- limpiar el codigo privado ingresado;
- llamar `vip_private_join_with_code`;
- renderizar sala, reglas, reconocimiento, participantes confirmados y resultados privados;
- revalidar con `vip_private_start_game` antes de preparar una partida;
- guardar un contexto local temporal para la integracion futura con juegos.

La fase 4 no debe guardar resultados ni modificar rankings. Eso queda reservado para la integracion de juegos.

## Fase 5: seccion visual en Zona VIP

La seccion `Minitorneos VIP privados` se agrega dentro de `vip.html`, visible solo despues de validar acceso VIP.

Controles incluidos:

- campo `Codigo privado de sala`;
- boton `Entrar`;
- estado de validacion;
- tarjeta de sala con reglas, reconocimiento, participantes y resultados.

El boton `Preparar juego` solo se habilita si Supabase confirma acceso y la sala esta `en_juego`. Por ahora no redirige al juego para evitar que una partida privada termine guardandose como resultado VIP normal antes de la Fase 7.

## Fase 6: panel administrador

El panel admin agrega una seccion `Minitorneos VIP privados`, separada de `Membresias VIP`, `Eventos VIP` y `Salas Bingo VIP`.

Funciones incluidas:

- crear o editar sala privada;
- definir codigo privado, juego, estado, cupo, reglas y reconocimiento;
- listar salas con participantes y resultados;
- agregar o actualizar participantes;
- marcar inscripciones como `pendiente`, `confirmada`, `cortesia`, `cancelada` o `rechazada`;
- mover sala a `inscripcion`, `en_juego`, `finalizada` o `archivada`.

La lista admin muestra el codigo privado porque es una herramienta administrativa. La Zona VIP del usuario no lista codigos.

## Fase 7: integracion inicial con juego

La primera integracion de juego queda limitada a `reflejos-vip`, porque es un juego de habilidad y no se parece a apuestas ni azar.

Flujo integrado:

1. Usuario VIP ingresa codigo privado en Zona VIP.
2. Supabase confirma inscripcion.
3. Admin cambia sala a `en_juego`.
4. Usuario pulsa `Preparar juego`.
5. Supabase revalida con `vip_private_start_game`.
6. Se abre `Reflejos VIP` con contexto privado temporal.
7. Al terminar, el juego guarda con `vip_private_submit_result`.

En modo privado, Reflejos VIP no llama `registrar_resultado_juego_vip`, no entrega recompensas VIP normales y no escribe en historial/ranking VIP general. El resultado queda en `vip_private_tournament_results`.

## Fase 8: pruebas y verificacion

Verificaciones realizadas:

- `node --check` sobre `juegos/js/admin.js`.
- `node --check` sobre `juegos/js/vip-private-tournaments.js`.
- Balance de llaves y parentesis en `vip.html`, `admin.html` y `juegos/vip/reflejos/index.html`.
- Balance de parentesis y bloques `$$` en `supabase-vip.sql`.
- `git diff --check` sin errores de espacios.
- Busqueda de referencias a `solitario_resultados`, `sala_jugadores`, `estado_torneo` y `ranking` dentro del modulo privado.
- Confirmacion de que el flujo privado inicial solo habilita `reflejos-vip`.

Casos cubiertos por codigo:

- VIP sin inscripcion confirmada no puede entrar a sala privada.
- Usuario confirmado solo puede preparar juego si la sala esta `en_juego`.
- Resultado privado requiere revalidacion de VIP, sala, juego e inscripcion.
- Resultado privado no usa `registrar_resultado_juego_vip`.
- Resultado privado no escribe en ranking normal ni en historial VIP general.
- El codigo privado solo se muestra en Admin; el usuario debe ingresarlo manualmente.

Pruebas manuales pendientes al aplicar SQL en Supabase:

- Crear sala privada desde Admin.
- Confirmar participante.
- Validar que un VIP no confirmado vea rechazo.
- Cambiar sala a `en_juego`.
- Entrar desde Zona VIP con codigo privado.
- Jugar Reflejos VIP y confirmar que el resultado aparece en el panel privado.
- Confirmar que ranking normal, minitorneos normales, niveles e historial VIP general no cambian.
- Revisar responsive real en celular, tablet, portatil y escritorio.
