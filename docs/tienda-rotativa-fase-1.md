# Tienda rotativa - fases 0 a 5

## Estado actual

La tienda visible se renderiza desde `index.html` y `juegos/js/tienda-ui.js`.
Los catalogos actuales viven principalmente en `juegos/js/tienda.js`:

- `BOOSTERS_XP`: boosters de experiencia.
- `BOOSTERS_MONEDAS`: boosters de monedas.
- `COSMETICOS`: generado con `generarCosmeticos("fondo", 100)`, `generarCosmeticos("id", 100)` y `generarCosmeticos("marco", 100)`.

Supabase valida compras en `supabase-experiencia-tienda.sql`, especialmente en `comprar_item_tienda_con_monedas`.

## Fase 0 - compatibilidad aplicada

La rareza `Prohibido` ya no debe degradarse a `Mitico` al guardarse en `usuario_cosmeticos`.
La restriccion SQL de `usuario_cosmeticos.rareza` queda preparada para:

- Normal
- Raro
- Epico
- Legendario
- Mitico
- Prohibido

Tambien se corrigio `supabase-wompi-tienda.sql` para que las entregas de cosmeticos por Wompi acepten `Prohibido`.

## IDs actuales

Los cosmeticos actuales usan este formato:

- `fondo_001` a `fondo_100`
- `id_001` a `id_100`
- `marco_001` a `marco_100`

La rareza actual se deriva del numero:

- `001` a `017`: Normal
- `018` a `034`: Raro
- `035` a `051`: Epico
- `052` a `068`: Legendario
- `069` a `085`: Mitico
- `086` a `100`: Prohibido

Esto significa que hoy hay 100 piezas por conjunto, no 100 piezas por conjunto y rareza.

## Fase 1 - catalogo maestro

Se agrego `public.tienda_productos` en `supabase-experiencia-tienda.sql` como catalogo maestro para la tienda con monedas.

Campos principales:

- `slug`
- `tipo`
- `familia`
- `rareza`
- `nombre`
- `descripcion`
- `precio_monedas`
- `precio_real`
- `activo`
- `vendible`
- `permanente`
- `metadata`

La tabla tiene RLS habilitado. `anon` y `authenticated` pueden leer productos activos, pero no insertar, actualizar ni eliminar.

Esta tabla es distinta de `productos_tienda`, que sigue dedicada a pagos reales/Wompi.

## Fase 2 - migracion inicial

Se pobla `tienda_productos` de forma idempotente con:

- 10 boosters XP actuales desde `BOOSTERS_XP`.
- 10 boosters de monedas actuales desde `BOOSTERS_MONEDAS`.
- 300 cosmeticos legacy desde `COSMETICOS`:
  - 100 fondos
  - 100 IDs
  - 100 marcos

Los cosmeticos se migran con sus slugs actuales (`fondo_001`, `id_001`, `marco_001`) y metadata minima:

- `legacy: true`
- `numero`
- `catalogo_origen: COSMETICOS`
- `slug_legacy`

Los nombres/descripciones visuales completos siguen viviendo en JS por ahora. El catalogo SQL queda listo como fuente de validacion y base para rotaciones.

## Limitacion pendiente para fases siguientes

Para soportar 100 piezas por combinacion, conviene migrar a IDs nuevos como:

- `fondo_normal_001`
- `fondo_epico_001`
- `id_mitico_001`
- `marco_prohibido_001`

Durante la migracion, los IDs viejos deben seguir siendo aceptados para no romper compras e inventarios existentes.

## Fase 3 - compra desde catalogo

`comprar_item_tienda_con_monedas` ahora busca primero el producto en `tienda_productos`.

Si lo encuentra:

- valida que este activo y vendible;
- valida que este en una rotacion activa, salvo que sea permanente;
- toma `precio_monedas` desde DB;
- toma multiplicador/duracion de boosters desde `metadata`;
- toma familia/rareza de cosmeticos desde el catalogo.

Si no lo encuentra, conserva el fallback legacy hardcodeado para no romper compras existentes durante la transicion.

## Fase 4 - rotaciones backend

Se agregaron:

- `tienda_rotaciones`
- `tienda_rotacion_items`
- `refrescar_tienda_rotaciones()`
- `obtener_tienda_rotacion_activa()`

El SQL crea una rotacion activa inicial por `familia + rareza` a partir de los productos migrados. Cada rotacion toma hasta 17 productos con orden estable por `seed`.

El punto que habia quedado a medias era que esa rotacion inicial solo se generaba al ejecutar el SQL. Si la ventana expiraba, `obtener_tienda_rotacion_activa()` podia devolver una tienda vacia y `comprar_item_tienda_con_monedas()` podia rechazar productos validos por no estar en una rotacion vigente.

Ahora `refrescar_tienda_rotaciones()`:

- cierra rotaciones activas vencidas;
- crea una nueva rotacion por cada `familia + rareza` con productos activos, vendibles y precio valido;
- carga hasta 17 productos;
- si hay suficiente catalogo, evita repetir los productos de la rotacion anterior;
- se ejecuta antes de devolver la tienda y antes de validar una compra.

No queda expuesta como RPC publica directa; la invocan las funciones de lectura/compra con `security definer`.

Reglas aplicadas:

- si hay mas de 17 productos, se muestran 17;
- si hay 17 o menos, se muestran todos;
- si una rotacion activa ya vencio, se marca como `cerrada` automaticamente al consultar o comprar.

`obtener_tienda_rotacion_activa()` devuelve `servidorAhora`, `rotacionInicio`, `rotacionFin`, `productoId`, `slug`, datos visuales y precio para que el frontend use Supabase como reloj confiable.

## Fase 5 - frontend con fallback

`tienda-ui.js` carga `obtener_tienda_rotacion_activa()` mediante `obtenerCatalogoTiendaRotativa()`.

Si Supabase responde bien, la tienda renderiza boosters y cosmeticos desde la rotacion activa. Si falla, vuelve a usar `BOOSTERS_XP`, `BOOSTERS_MONEDAS` y `COSMETICOS`.

El contador usa `servidorAhora` para mostrar `Cambia en HH:MM:SS`. Si una categoria o rareza no tiene piezas visibles, muestra un estado vacio controlado en lugar de dejar el panel en blanco.

Pendiente siguiente: ampliar soporte de inventario/equipamiento para IDs nuevos que no existan todavia en `COSMETICOS`.

## Fase 6 - IDs nuevos

El frontend acepta cosmeticos legacy y nuevos:

- legacy: `fondo_001`, `id_001`, `marco_001`
- nuevo: `fondo_normal_001`, `id_mitico_001`, `marco_prohibido_001`

Los IDs nuevos se resuelven con diseno generado de forma determinista en `resolverCosmeticoCatalogo()`. Si un producto custom viene desde Supabase con `familia/tipo` y `rareza`, tambien se genera un fallback visual para que inventario y equipamiento no dependan solo de `COSMETICOS`.

## Fase 7 - Catalogo ampliado

`admin_generar_catalogo_cosmeticos()` genera hasta 100 piezas por rareza y familia con el formato nuevo. Despues de generar, cierra las rotaciones cosmeticas activas y llama `refrescar_tienda_rotaciones()` para que el catalogo nuevo pueda entrar inmediatamente a tienda sin esperar vencimiento.

`admin_guardar_tienda_producto()` tambien cierra y refresca la rotacion de la familia/rareza editada, asi activar/desactivar/cambiar precio de un producto se refleja en la tienda activa.

## Fase 8 - Administracion

El panel admin incluye una seccion de catalogo y rotaciones para:

- listar productos recientes;
- crear o editar productos;
- activar/desactivar;
- marcar vendible/no vendible;
- marcar permanente/rotativo;
- editar precio y metadata;
- forzar rotacion;
- generar catalogo masivo.

Los boosters creados desde admin requieren metadata valida (`multiplicador` y `duracion_ms`) tanto en frontend como en RPC, para evitar productos que aparezcan en tienda pero fallen al comprarse.

### Metadata visual

Los cosmeticos pueden guardar overrides visuales en `metadata.visual`. El frontend mantiene el diseno automatico como base y aplica estos valores encima:

```json
{
  "visual": {
    "patron": "pulso",
    "hue": 280,
    "accent": 340,
    "brillo": 8,
    "profundidad": 72
  }
}
```

Campos soportados:

- `patron`: `lineas`, `pulso`, `anillo`, `fragmentos`, `halo`
- `hue`: color principal de 0 a 360
- `accent`: color de acento de 0 a 360
- `brillo`: intensidad de 1 a 10
- `profundidad`: profundidad visual de 1 a 100
- `layout` y `textura` para fondos
- `silueta` y `forma` para IDs
- `estructura` y `borde` para marcos

El panel admin expone los controles principales y sigue permitiendo editar el JSON manualmente para casos avanzados.
