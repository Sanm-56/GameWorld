-- Extensiones de experiencia, temporada y tienda.
-- Ejecutar en Supabase SQL Editor si quieres persistencia global.

create table if not exists public.temporadas (
  id text primary key,
  numero integer,
  nombre text not null,
  estado text not null default 'activa',
  bonus_juego text,
  bonus_xp numeric(3,1) not null default 1.0,
  activa boolean not null default false,
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz,
  duracion_tipo text not null default 'dias',
  duracion_cantidad integer not null default 30,
  nombre_indice integer not null default 0,
  nombres_temporada jsonb not null default '[]'::jsonb,
  auto_rotacion boolean not null default true,
  visual_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.temporadas
add column if not exists numero integer;

alter table public.temporadas
add column if not exists estado text not null default 'activa';

alter table public.temporadas
add column if not exists bonus_juego text;

alter table public.temporadas
add column if not exists bonus_xp numeric(3,1) not null default 1.0;

alter table public.temporadas
add column if not exists visual_config jsonb not null default '{}'::jsonb;

alter table public.temporadas
add column if not exists duracion_tipo text not null default 'dias';

alter table public.temporadas
add column if not exists duracion_cantidad integer not null default 30;

alter table public.temporadas
add column if not exists nombre_indice integer not null default 0;

alter table public.temporadas
add column if not exists nombres_temporada jsonb not null default '[]'::jsonb;

alter table public.temporadas
add column if not exists auto_rotacion boolean not null default true;

alter table public.temporadas
drop constraint if exists temporadas_estado_check;

update public.temporadas
set estado = 'revision'
where estado = 'pausada';

update public.temporadas
set estado = case when activa then 'activa' else 'finalizada' end
where estado not in ('activa', 'preparacion', 'revision', 'finalizada');

alter table public.temporadas
add constraint temporadas_estado_check
check (estado in ('activa', 'preparacion', 'revision', 'finalizada'));

alter table public.temporadas
drop constraint if exists temporadas_duracion_tipo_check;

alter table public.temporadas
drop constraint if exists temporadas_duracion_cantidad_check;

alter table public.temporadas
drop constraint if exists temporadas_nombres_temporada_check;

alter table public.temporadas
drop constraint if exists temporadas_bonus_juego_check;

alter table public.temporadas
add constraint temporadas_bonus_juego_check
check (
  bonus_juego is null
  or bonus_juego in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  )
);

alter table public.temporadas
drop constraint if exists temporadas_bonus_xp_check;

alter table public.temporadas
add constraint temporadas_bonus_xp_check
check (bonus_xp between 1.0 and 3.5);

update public.temporadas
set
  numero = coalesce(numero, 1),
  estado = case when activa then 'activa' else coalesce(nullif(estado, ''), 'finalizada') end,
  bonus_juego = coalesce(bonus_juego, 'sudoku'),
  bonus_xp = coalesce(bonus_xp, 1.0),
  fecha_fin = case
    when activa and fecha_fin is null then now() + interval '30 days'
    else fecha_fin
  end,
  duracion_tipo = coalesce(nullif(duracion_tipo, ''), 'dias'),
  duracion_cantidad = greatest(1, least(3650, coalesce(duracion_cantidad, 30))),
  nombre_indice = greatest(0, coalesce(nombre_indice, 0)),
  nombres_temporada = coalesce(nombres_temporada, '[]'::jsonb),
  auto_rotacion = coalesce(auto_rotacion, true),
  visual_config = coalesce(visual_config, '{}'::jsonb)
where id = 'temporada-actual'
   or numero is null
   or bonus_juego is null;

update public.temporadas
set
  duracion_tipo = case when duracion_tipo in ('horas', 'dias') then duracion_tipo else 'dias' end,
  duracion_cantidad = greatest(1, least(3650, coalesce(duracion_cantidad, 30))),
  nombres_temporada = case when jsonb_typeof(nombres_temporada) = 'array' then nombres_temporada else '[]'::jsonb end;

with temporadas_activas_ordenadas as (
  select
    id,
    row_number() over (order by fecha_inicio desc, created_at desc, id desc) as orden_activa
  from public.temporadas
  where activa = true
)
update public.temporadas t
set activa = false,
    estado = case when t.estado = 'activa' then 'finalizada' else t.estado end,
    fecha_fin = coalesce(t.fecha_fin, now())
from temporadas_activas_ordenadas ordenadas
where t.id = ordenadas.id
  and ordenadas.orden_activa > 1;

create unique index if not exists temporadas_unica_activa_idx
on public.temporadas (activa)
where activa = true;

alter table public.temporadas
add constraint temporadas_duracion_tipo_check
check (duracion_tipo in ('horas', 'dias'));

alter table public.temporadas
add constraint temporadas_duracion_cantidad_check
check (duracion_cantidad between 1 and 3650);

alter table public.temporadas
add constraint temporadas_nombres_temporada_check
check (jsonb_typeof(nombres_temporada) = 'array');

insert into public.temporadas (
  id,
  numero,
  nombre,
  estado,
  bonus_juego,
  bonus_xp,
  activa,
  fecha_inicio,
  fecha_fin,
  duracion_tipo,
  duracion_cantidad,
  nombre_indice,
  nombres_temporada,
  auto_rotacion,
  visual_config
)
values (
  'temporada-actual',
  1,
  'Eclipse del Vacio',
  'activa',
  'sudoku',
  1.0,
  true,
  now(),
  now() + interval '30 days',
  'dias',
  30,
  0,
  '[]'::jsonb,
  true,
  '{}'::jsonb
)
on conflict (id) do update set
  numero = coalesce(public.temporadas.numero, excluded.numero),
  estado = case when public.temporadas.activa then 'activa' else public.temporadas.estado end,
  bonus_juego = coalesce(public.temporadas.bonus_juego, excluded.bonus_juego),
  bonus_xp = coalesce(public.temporadas.bonus_xp, excluded.bonus_xp),
  fecha_fin = coalesce(public.temporadas.fecha_fin, excluded.fecha_fin),
  duracion_tipo = coalesce(public.temporadas.duracion_tipo, excluded.duracion_tipo),
  duracion_cantidad = coalesce(public.temporadas.duracion_cantidad, excluded.duracion_cantidad),
  nombre_indice = coalesce(public.temporadas.nombre_indice, excluded.nombre_indice),
  nombres_temporada = coalesce(public.temporadas.nombres_temporada, excluded.nombres_temporada),
  auto_rotacion = coalesce(public.temporadas.auto_rotacion, excluded.auto_rotacion),
  visual_config = coalesce(public.temporadas.visual_config, excluded.visual_config);

alter table public.partidas
add column if not exists bonus_xp_aplicado numeric(3,1) not null default 1.0;

alter table public.partidas
add column if not exists temporada_id text;

create index if not exists partidas_temporada_idx
on public.partidas (temporada_id, juego, fecha desc);

create table if not exists public.bonus_temporada (
  juego text primary key check (juego in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  )),
  multiplicador numeric(3,1) not null default 1.0 check (multiplicador between 1.0 and 3.5),
  updated_at timestamptz not null default now()
);

insert into public.bonus_temporada (juego, multiplicador)
values
  ('sudoku', 1.0),
  ('memoria', 1.0),
  ('matematicas', 1.0),
  ('flashmind', 1.0),
  ('numcatch', 1.0),
  ('ajedrez', 1.0),
  ('domino', 1.0),
  ('damas', 1.0)
on conflict (juego) do nothing;

create table if not exists public.bonus_monedas_evento (
  id text primary key default 'evento-monedas-actual',
  juego text not null check (juego in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  )),
  multiplicador numeric(3,1) not null default 1.0 check (multiplicador between 1.0 and 3.5),
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz,
  activo boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.bonus_monedas_evento (id, juego, multiplicador, activo)
values ('evento-monedas-actual', 'sudoku', 1.0, false)
on conflict (id) do nothing;

create or replace function public.admin_guardar_bonus_temporada(
  p_clave text,
  p_juego text,
  p_multiplicador numeric
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  multiplicador_limpio numeric(3,1);
begin
  if not public.validar_admin_torneo(p_clave) then
    return false;
  end if;

  if p_juego not in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  ) then
    return false;
  end if;

  multiplicador_limpio := round(greatest(1.0, least(3.5, coalesce(p_multiplicador, 1.0)))::numeric, 1);

  insert into public.bonus_temporada (juego, multiplicador, updated_at)
  values (p_juego, multiplicador_limpio, now())
  on conflict (juego) do update set
    multiplicador = excluded.multiplicador,
    updated_at = excluded.updated_at;

  update public.temporadas
  set bonus_juego = p_juego,
      bonus_xp = multiplicador_limpio
  where activa = true;

  return true;
end;
$$;

create or replace function public.admin_guardar_bonus_monedas_evento(
  p_clave text,
  p_juego text,
  p_multiplicador numeric,
  p_fecha_inicio timestamptz,
  p_fecha_fin timestamptz,
  p_activo boolean default true
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  multiplicador_limpio numeric(3,1);
  inicio_limpio timestamptz := coalesce(p_fecha_inicio, now());
  fin_limpio timestamptz := p_fecha_fin;
  activo_limpio boolean := coalesce(p_activo, true);
begin
  if not public.validar_admin_torneo(p_clave) then
    return false;
  end if;

  if p_juego not in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  ) then
    return false;
  end if;

  multiplicador_limpio := round(greatest(1.0, least(3.5, coalesce(p_multiplicador, 1.0)))::numeric, 1);

  if activo_limpio then
    if fin_limpio is null or fin_limpio <= inicio_limpio then
      return false;
    end if;
  else
    multiplicador_limpio := 1.0;
    fin_limpio := coalesce(fin_limpio, now());
  end if;

  insert into public.bonus_monedas_evento (
    id,
    juego,
    multiplicador,
    fecha_inicio,
    fecha_fin,
    activo,
    updated_at
  )
  values (
    'evento-monedas-actual',
    p_juego,
    multiplicador_limpio,
    inicio_limpio,
    fin_limpio,
    activo_limpio and fin_limpio > now() and multiplicador_limpio > 1.0,
    now()
  )
  on conflict (id) do update set
    juego = excluded.juego,
    multiplicador = excluded.multiplicador,
    fecha_inicio = excluded.fecha_inicio,
    fecha_fin = excluded.fecha_fin,
    activo = excluded.activo,
    updated_at = excluded.updated_at;

  return true;
end;
$$;

create or replace function public.obtener_bonus_monedas_evento(p_juego text)
returns numeric
language sql
stable
as $$
  select coalesce((
    select multiplicador
    from public.bonus_monedas_evento
    where id = 'evento-monedas-actual'
      and juego = p_juego
      and activo = true
      and fecha_fin > now()
      and multiplicador > 1.0
    limit 1
  ), 1.0)::numeric;
$$;

drop function if exists public.admin_guardar_temporada_activa(text, text, integer, text, text, numeric, text);

create or replace function public.admin_guardar_temporada_activa(
  p_clave text,
  p_id text,
  p_numero integer,
  p_nombre text,
  p_juego text,
  p_multiplicador numeric,
  p_estado text default 'activa',
  p_fecha_inicio timestamptz default null,
  p_fecha_fin timestamptz default null,
  p_duracion_tipo text default 'dias',
  p_duracion_cantidad integer default 30,
  p_nombre_indice integer default 0,
  p_nombres_temporada jsonb default '[]'::jsonb,
  p_auto_rotacion boolean default true
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  estado_limpio text := coalesce(nullif(lower(btrim(p_estado)), ''), 'activa');
  tipo_limpio text := coalesce(nullif(lower(btrim(p_duracion_tipo)), ''), 'dias');
  cantidad_limpia integer := greatest(1, least(3650, coalesce(p_duracion_cantidad, 30)));
  inicio_limpio timestamptz := coalesce(p_fecha_inicio, now());
  fin_limpio timestamptz := p_fecha_fin;
  multiplicador_limpio numeric(3,1);
  id_limpio text := coalesce(nullif(btrim(p_id), ''), 'temporada-' || greatest(coalesce(p_numero, 1), 1)::text);
begin
  if not public.validar_admin_torneo(p_clave) then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext('temporadas-admin-write'));

  if estado_limpio = 'pausada' then
    estado_limpio := 'revision';
  end if;

  if estado_limpio not in ('activa', 'preparacion', 'revision', 'finalizada') then
    return false;
  end if;

  if tipo_limpio not in ('horas', 'dias') then
    return false;
  end if;

  if p_juego not in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  ) then
    return false;
  end if;

  multiplicador_limpio := round(greatest(1.0, least(3.5, coalesce(p_multiplicador, 1.0)))::numeric, 1);

  if estado_limpio = 'activa' and (fin_limpio is null or fin_limpio <= inicio_limpio) then
    fin_limpio := case
      when tipo_limpio = 'horas' then inicio_limpio + (cantidad_limpia::text || ' hours')::interval
      else inicio_limpio + (cantidad_limpia::text || ' days')::interval
    end;
  end if;

  if estado_limpio = 'activa' then
    update public.temporadas
    set activa = false,
        estado = case when estado = 'activa' then 'finalizada' else estado end,
        fecha_fin = coalesce(fecha_fin, now())
    where id <> id_limpio
      and activa = true;
  end if;

  insert into public.temporadas (
    id,
    numero,
    nombre,
    estado,
    bonus_juego,
    bonus_xp,
    activa,
    fecha_inicio,
    fecha_fin,
    duracion_tipo,
    duracion_cantidad,
    nombre_indice,
    nombres_temporada,
    auto_rotacion,
    visual_config
  )
  values (
    id_limpio,
    greatest(coalesce(p_numero, 1), 1),
    coalesce(nullif(btrim(p_nombre), ''), 'Temporada ' || greatest(coalesce(p_numero, 1), 1)::text),
    estado_limpio,
    p_juego,
    multiplicador_limpio,
    estado_limpio = 'activa',
    inicio_limpio,
    case when estado_limpio = 'finalizada' then coalesce(fin_limpio, now()) else fin_limpio end,
    tipo_limpio,
    cantidad_limpia,
    greatest(0, coalesce(p_nombre_indice, 0)),
    coalesce(p_nombres_temporada, '[]'::jsonb),
    coalesce(p_auto_rotacion, true),
    '{}'::jsonb
  )
  on conflict (id) do update set
    numero = excluded.numero,
    nombre = excluded.nombre,
    estado = excluded.estado,
    bonus_juego = excluded.bonus_juego,
    bonus_xp = excluded.bonus_xp,
    activa = excluded.activa,
    fecha_inicio = excluded.fecha_inicio,
    fecha_fin = excluded.fecha_fin,
    duracion_tipo = excluded.duracion_tipo,
    duracion_cantidad = excluded.duracion_cantidad,
    nombre_indice = excluded.nombre_indice,
    nombres_temporada = excluded.nombres_temporada,
    auto_rotacion = excluded.auto_rotacion;

  insert into public.bonus_temporada (juego, multiplicador, updated_at)
  values (p_juego, multiplicador_limpio, now())
  on conflict (juego) do update set
    multiplicador = excluded.multiplicador,
    updated_at = excluded.updated_at;

  return true;
end;
$$;

create or replace function public.avanzar_temporada_si_vencida()
returns public.temporadas
language plpgsql
security definer
set search_path = public
as $$
declare
  actual public.temporadas%rowtype;
  siguiente_numero integer;
  cantidad_nombres integer;
  siguiente_indice integer;
  siguiente_nombre text;
  siguiente_fin timestamptz;
  siguiente_id text;
begin
  perform pg_advisory_xact_lock(hashtext('temporadas-auto-rotation'));

  select *
  into actual
  from public.temporadas
  where activa = true
  order by fecha_inicio desc
  limit 1
  for update;

  if not found then
    return null;
  end if;

  update public.temporadas
  set activa = false,
      estado = case when estado = 'activa' then 'finalizada' else estado end,
      fecha_fin = coalesce(fecha_fin, now())
  where id <> actual.id
    and activa = true;

  if actual.estado <> 'activa'
     or actual.auto_rotacion is not true
     or actual.fecha_fin is null
     or actual.fecha_fin > now() then
    return actual;
  end if;

  update public.temporadas
  set activa = false,
      estado = 'finalizada',
      fecha_fin = coalesce(fecha_fin, now())
  where id = actual.id;

  siguiente_numero := greatest(coalesce(actual.numero, 1), 1) + 1;
  cantidad_nombres := jsonb_array_length(coalesce(actual.nombres_temporada, '[]'::jsonb));
  siguiente_indice := case when cantidad_nombres > 0 then (coalesce(actual.nombre_indice, 0) + 1) % cantidad_nombres else 0 end;
  siguiente_nombre := case
    when cantidad_nombres > 0 then actual.nombres_temporada ->> siguiente_indice
    else 'Temporada ' || siguiente_numero::text
  end;
  siguiente_fin := case
    when actual.duracion_tipo = 'horas' then now() + (actual.duracion_cantidad::text || ' hours')::interval
    else now() + (actual.duracion_cantidad::text || ' days')::interval
  end;
  siguiente_id := 'temporada-' || siguiente_numero::text || '-' || floor(extract(epoch from clock_timestamp()))::text;

  insert into public.temporadas (
    id,
    numero,
    nombre,
    estado,
    bonus_juego,
    bonus_xp,
    activa,
    fecha_inicio,
    fecha_fin,
    duracion_tipo,
    duracion_cantidad,
    nombre_indice,
    nombres_temporada,
    auto_rotacion,
    visual_config
  )
  values (
    siguiente_id,
    siguiente_numero,
    coalesce(nullif(btrim(siguiente_nombre), ''), 'Temporada ' || siguiente_numero::text),
    'activa',
    actual.bonus_juego,
    actual.bonus_xp,
    true,
    now(),
    siguiente_fin,
    actual.duracion_tipo,
    actual.duracion_cantidad,
    siguiente_indice,
    coalesce(actual.nombres_temporada, '[]'::jsonb),
    true,
    coalesce(actual.visual_config, '{}'::jsonb)
  )
  returning * into actual;

  update public.temporadas
  set activa = false,
      estado = case when estado = 'activa' then 'finalizada' else estado end,
      fecha_fin = coalesce(fecha_fin, now())
  where id <> actual.id
    and activa = true;

  return actual;
end;
$$;

create or replace function public.admin_reiniciar_temporadas(
  p_clave text,
  p_nombre text,
  p_juego text,
  p_multiplicador numeric,
  p_duracion_tipo text default 'dias',
  p_duracion_cantidad integer default 30,
  p_nombres_temporada jsonb default '[]'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  tipo_limpio text := coalesce(nullif(lower(btrim(p_duracion_tipo)), ''), 'dias');
  cantidad_limpia integer := greatest(1, least(3650, coalesce(p_duracion_cantidad, 30)));
  multiplicador_limpio numeric(3,1);
  fin_limpio timestamptz;
  id_limpio text := 'temporada-1-' || floor(extract(epoch from clock_timestamp()))::text;
begin
  if not public.validar_admin_torneo(p_clave) then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext('temporadas-admin-write'));

  if tipo_limpio not in ('horas', 'dias') then
    return false;
  end if;

  if p_juego not in (
    'sudoku',
    'memoria',
    'matematicas',
    'flashmind',
    'numcatch',
    'ajedrez',
    'domino',
    'damas'
  ) then
    return false;
  end if;

  multiplicador_limpio := round(greatest(1.0, least(3.5, coalesce(p_multiplicador, 1.0)))::numeric, 1);
  fin_limpio := case
    when tipo_limpio = 'horas' then now() + (cantidad_limpia::text || ' hours')::interval
    else now() + (cantidad_limpia::text || ' days')::interval
  end;

  update public.temporadas
  set activa = false,
      estado = case when estado = 'activa' then 'finalizada' else estado end,
      fecha_fin = coalesce(fecha_fin, now());

  insert into public.temporadas (
    id,
    numero,
    nombre,
    estado,
    bonus_juego,
    bonus_xp,
    activa,
    fecha_inicio,
    fecha_fin,
    duracion_tipo,
    duracion_cantidad,
    nombre_indice,
    nombres_temporada,
    auto_rotacion,
    visual_config
  )
  values (
    id_limpio,
    1,
    coalesce(nullif(btrim(p_nombre), ''), 'Temporada 1'),
    'activa',
    p_juego,
    multiplicador_limpio,
    true,
    now(),
    fin_limpio,
    tipo_limpio,
    cantidad_limpia,
    0,
    coalesce(p_nombres_temporada, '[]'::jsonb),
    true,
    '{}'::jsonb
  );

  insert into public.bonus_temporada (juego, multiplicador, updated_at)
  values (p_juego, multiplicador_limpio, now())
  on conflict (juego) do update set
    multiplicador = excluded.multiplicador,
    updated_at = excluded.updated_at;

  return true;
end;
$$;

create table if not exists public.usuario_boosters (
  id bigserial primary key,
  usuario_id text not null,
  booster_id text not null,
  multiplicador numeric(3,1) not null check (multiplicador in (1.2, 1.3, 1.4, 1.5, 1.8, 2.0, 2.2, 2.5, 2.7, 3.0, 4.0, 5.0, 6.0, 8.0)),
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.usuario_boosters
drop constraint if exists usuario_boosters_multiplicador_check;

alter table public.usuario_boosters
add constraint usuario_boosters_multiplicador_check
check (multiplicador in (1.2, 1.3, 1.4, 1.5, 1.8, 2.0, 2.2, 2.5, 2.7, 3.0, 4.0, 5.0, 6.0, 8.0));

create index if not exists usuario_boosters_activos_idx
on public.usuario_boosters (usuario_id, fecha_fin desc, multiplicador desc)
where activo = true;

create table if not exists public.usuario_cosmeticos (
  id bigserial primary key,
  usuario_id text not null,
  cosmetico_id text not null,
  tipo text not null check (tipo in ('fondo', 'tarjeta', 'id', 'marco', 'efecto')),
  rareza text not null check (rareza in ('Normal', 'Raro', 'Epico', 'Legendario', 'Mitico')),
  equipado boolean not null default true,
  created_at timestamptz not null default now(),
  unique (usuario_id, cosmetico_id)
);

create index if not exists usuario_cosmeticos_equipados_idx
on public.usuario_cosmeticos (usuario_id, equipado, created_at desc);

-- RLS compatible con el login actual por apodo/localStorage.
-- bonus_temporada: lectura publica, escritura solo por RPC admin_guardar_bonus_temporada.
-- usuario_boosters: lectura/escritura publica para que el cliente actual pueda activar boosters sin auth.uid().
-- usuario_cosmeticos: lectura publica para rankings/perfiles y upsert publico para compras/equipado.

alter table public.temporadas enable row level security;
alter table public.bonus_temporada enable row level security;
alter table public.bonus_monedas_evento enable row level security;
alter table public.usuario_boosters enable row level security;
alter table public.usuario_cosmeticos enable row level security;

drop policy if exists temporadas_anon_select on public.temporadas;

create policy temporadas_anon_select
on public.temporadas
for select
to anon, authenticated
using (true);

revoke insert, update, delete on table public.temporadas from anon, authenticated;
grant select on table public.temporadas to anon, authenticated;
grant execute on function public.admin_guardar_temporada_activa(text, text, integer, text, text, numeric, text, timestamptz, timestamptz, text, integer, integer, jsonb, boolean) to anon, authenticated;
grant execute on function public.avanzar_temporada_si_vencida() to anon, authenticated;
grant execute on function public.admin_reiniciar_temporadas(text, text, text, numeric, text, integer, jsonb) to anon, authenticated;

drop policy if exists bonus_temporada_anon_select on public.bonus_temporada;
drop policy if exists bonus_temporada_anon_insert on public.bonus_temporada;
drop policy if exists bonus_temporada_anon_update on public.bonus_temporada;
drop policy if exists bonus_temporada_anon_delete on public.bonus_temporada;

create policy bonus_temporada_anon_select
on public.bonus_temporada
for select
to anon, authenticated
using (true);

revoke insert, update, delete on table public.bonus_temporada from anon, authenticated;
grant select on table public.bonus_temporada to anon, authenticated;
grant execute on function public.admin_guardar_bonus_temporada(text, text, numeric) to anon, authenticated;

drop policy if exists bonus_monedas_evento_anon_select on public.bonus_monedas_evento;
drop policy if exists bonus_monedas_evento_anon_insert on public.bonus_monedas_evento;
drop policy if exists bonus_monedas_evento_anon_update on public.bonus_monedas_evento;
drop policy if exists bonus_monedas_evento_anon_delete on public.bonus_monedas_evento;

create policy bonus_monedas_evento_anon_select
on public.bonus_monedas_evento
for select
to anon, authenticated
using (true);

revoke insert, update, delete on table public.bonus_monedas_evento from anon, authenticated;
grant select on table public.bonus_monedas_evento to anon, authenticated;
grant execute on function public.admin_guardar_bonus_monedas_evento(text, text, numeric, timestamptz, timestamptz, boolean) to anon, authenticated;
grant execute on function public.obtener_bonus_monedas_evento(text) to anon, authenticated;

drop policy if exists usuario_boosters_anon_select on public.usuario_boosters;
drop policy if exists usuario_boosters_anon_insert on public.usuario_boosters;
drop policy if exists usuario_boosters_anon_update on public.usuario_boosters;
drop policy if exists usuario_boosters_anon_delete on public.usuario_boosters;

create policy usuario_boosters_anon_select
on public.usuario_boosters
for select
to anon, authenticated
using (true);

create policy usuario_boosters_anon_insert
on public.usuario_boosters
for insert
to anon, authenticated
with check (
  usuario_id is not null
  and btrim(usuario_id) <> ''
  and multiplicador in (1.2, 1.3, 1.4, 1.5, 1.8, 2.0, 2.2, 2.5, 2.7, 3.0, 4.0, 5.0, 6.0, 8.0)
  and fecha_fin > fecha_inicio
);

create policy usuario_boosters_anon_update
on public.usuario_boosters
for update
to anon, authenticated
using (true)
with check (
  usuario_id is not null
  and btrim(usuario_id) <> ''
  and multiplicador in (1.2, 1.3, 1.4, 1.5, 1.8, 2.0, 2.2, 2.5, 2.7, 3.0, 4.0, 5.0, 6.0, 8.0)
  and fecha_fin > fecha_inicio
);

grant select, insert, update on table public.usuario_boosters to anon, authenticated;
grant usage, select on sequence public.usuario_boosters_id_seq to anon, authenticated;

drop policy if exists usuario_cosmeticos_anon_select on public.usuario_cosmeticos;
drop policy if exists usuario_cosmeticos_anon_insert on public.usuario_cosmeticos;
drop policy if exists usuario_cosmeticos_anon_update on public.usuario_cosmeticos;
drop policy if exists usuario_cosmeticos_anon_delete on public.usuario_cosmeticos;

create policy usuario_cosmeticos_anon_select
on public.usuario_cosmeticos
for select
to anon, authenticated
using (true);

create policy usuario_cosmeticos_anon_insert
on public.usuario_cosmeticos
for insert
to anon, authenticated
with check (
  usuario_id is not null
  and btrim(usuario_id) <> ''
  and tipo in ('fondo', 'tarjeta', 'id', 'marco', 'efecto')
  and rareza in ('Normal', 'Raro', 'Epico', 'Legendario', 'Mitico')
);

create policy usuario_cosmeticos_anon_update
on public.usuario_cosmeticos
for update
to anon, authenticated
using (true)
with check (
  usuario_id is not null
  and btrim(usuario_id) <> ''
  and tipo in ('fondo', 'tarjeta', 'id', 'marco', 'efecto')
  and rareza in ('Normal', 'Raro', 'Epico', 'Legendario', 'Mitico')
);

grant select, insert, update on table public.usuario_cosmeticos to anon, authenticated;
grant usage, select on sequence public.usuario_cosmeticos_id_seq to anon, authenticated;
