# Wompi tienda - fases 1 y 2

## Archivos agregados

- `supabase-wompi-tienda.sql`: tablas, indices, RLS, catalogo inicial y RPC idempotente de entrega.
- `supabase/functions/crear-compra-wompi/index.ts`: crea la compra pendiente y devuelve URL de Checkout Wompi.
- `supabase/functions/wompi-webhook/index.ts`: recibe eventos de Wompi, valida firma y entrega compras aprobadas.
- `juegos/js/wompi-tienda.js`: cliente web para iniciar pago real.

## Secretos requeridos en Supabase

Configurar en Edge Functions:

```bash
supabase secrets set WOMPI_PUBLIC_KEY="pub_test_xxx"
supabase secrets set WOMPI_INTEGRITY_SECRET="test_integrity_xxx"
supabase secrets set WOMPI_EVENTS_SECRET="test_events_xxx"
supabase secrets set SITE_URL="https://tu-dominio.com"
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` normalmente ya existen en el runtime de Supabase Functions.

## Deploy sugerido

```bash
supabase functions deploy crear-compra-wompi
supabase functions deploy wompi-webhook
```

Despues configura en Wompi la URL de eventos:

```text
https://<project-ref>.functions.supabase.co/wompi-webhook
```

## Prueba inicial

1. Aplicar `supabase-wompi-tienda.sql` en el SQL editor de Supabase.
2. Configurar secretos de sandbox.
3. Desplegar `crear-compra-wompi`.
4. Abrir la tienda y pagar un paquete de monedas, VIP o booster con el boton de precio real.
5. Confirmar que se crea una fila en `compras` con estado `pendiente`.
6. En fase de webhook, confirmar que Wompi marca `pagado` y luego `entregado`.

Los cosmeticos quedan soportados por la arquitectura, pero requieren registrar productos en `productos_tienda` con slug `cosmetic_<id>` antes de venderlos con dinero real.
