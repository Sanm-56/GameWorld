# Tienda rotativa - fase 1

## Estado actual

La tienda visible se renderiza desde `index.html` y `juegos/js/tienda-ui.js`.
Los catalogos actuales viven principalmente en `juegos/js/tienda.js`:

- `BOOSTERS_XP`: boosters de experiencia.
- `BOOSTERS_MONEDAS`: boosters de monedas.
- `COSMETICOS`: generado con `generarCosmeticos("fondo", 100)`, `generarCosmeticos("id", 100)` y `generarCosmeticos("marco", 100)`.

Supabase valida compras en `supabase-experiencia-tienda.sql`, especialmente en `comprar_item_tienda_con_monedas`.

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

## Compatibilidad aplicada

La rareza `Prohibido` ya no debe degradarse a `Mitico` al guardarse en `usuario_cosmeticos`.
La restriccion SQL de `usuario_cosmeticos.rareza` queda preparada para:

- Normal
- Raro
- Epico
- Legendario
- Mitico
- Prohibido

## Limitacion pendiente para fases siguientes

Para soportar 100 piezas por combinacion, conviene migrar a IDs nuevos como:

- `fondo_normal_001`
- `fondo_epico_001`
- `id_mitico_001`
- `marco_prohibido_001`

Durante la migracion, los IDs viejos deben seguir siendo aceptados para no romper compras e inventarios existentes.
