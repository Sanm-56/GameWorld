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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
    'ajedrez',
    'domino',
    'damas'
  )),
  multiplicador numeric(3,1) not null default 1.0 check (multiplicador between 1.0 and 3.5),
  updated_at timestamptz not null default now()
);

alter table public.bonus_temporada
drop constraint if exists bonus_temporada_juego_check;

alter table public.bonus_temporada
add constraint bonus_temporada_juego_check
check (juego in (
  'sudoku',
  'memoria',
  'matematicas',
  'flashmind',
  'numcatch',
  'cricketarcade',
  'esquivaobstaculos',
  'torreinfinita',
  'subelamontana',
  'basketballarcade',
  'ajedrez',
  'domino',
  'damas'
));

insert into public.bonus_temporada (juego, multiplicador)
values
  ('sudoku', 1.0),
  ('memoria', 1.0),
  ('matematicas', 1.0),
  ('flashmind', 1.0),
  ('numcatch', 1.0),
  ('cricketarcade', 1.0),
  ('esquivaobstaculos', 1.0),
  ('torreinfinita', 1.0),
  ('subelamontana', 1.0),
  ('basketballarcade', 1.0),
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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
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

alter table public.bonus_monedas_evento
drop constraint if exists bonus_monedas_evento_juego_check;

alter table public.bonus_monedas_evento
add constraint bonus_monedas_evento_juego_check
check (juego in (
  'sudoku',
  'memoria',
  'matematicas',
  'flashmind',
  'numcatch',
  'cricketarcade',
  'esquivaobstaculos',
  'torreinfinita',
  'subelamontana',
  'basketballarcade',
  'ajedrez',
  'domino',
  'damas'
));

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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
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
    'cricketarcade',
    'esquivaobstaculos',
    'torreinfinita',
    'subelamontana',
    'basketballarcade',
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
check (multiplicador between 1.2 and 8.0);

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
  and multiplicador between 1.2 and 8.0
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
  and multiplicador between 1.2 and 8.0
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

create table if not exists public.usuario_monedas (
  usuario_id text primary key,
  saldo bigint not null default 0 check (saldo >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_recompensas_historial (
  id bigint generated by default as identity primary key,
  usuario_id text not null,
  admin_id text not null default 'admin',
  tipo text not null check (tipo in ('monedas', 'experiencia', 'booster_xp', 'booster_monedas', 'fondo', 'id', 'marco', 'especial')),
  cantidad bigint,
  multiplicador numeric(3,1),
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  item_id text,
  item_tipo text,
  item_rareza text,
  item_nombre text,
  detalle jsonb not null default '{}'::jsonb,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  unique (dedupe_key)
);

create index if not exists admin_recompensas_historial_fecha_idx
on public.admin_recompensas_historial (created_at desc);

create index if not exists admin_recompensas_historial_usuario_idx
on public.admin_recompensas_historial (usuario_id, created_at desc);

alter table public.usuario_monedas enable row level security;
alter table public.admin_recompensas_historial enable row level security;

drop policy if exists usuario_monedas_anon_select on public.usuario_monedas;
drop policy if exists usuario_monedas_anon_insert on public.usuario_monedas;
drop policy if exists usuario_monedas_anon_update on public.usuario_monedas;
drop policy if exists admin_recompensas_historial_anon_select on public.admin_recompensas_historial;

create policy usuario_monedas_anon_select
on public.usuario_monedas
for select
to anon, authenticated
using (true);

create policy usuario_monedas_anon_insert
on public.usuario_monedas
for insert
to anon, authenticated
with check (usuario_id is not null and btrim(usuario_id) <> '' and saldo >= 0);

create policy usuario_monedas_anon_update
on public.usuario_monedas
for update
to anon, authenticated
using (true)
with check (usuario_id is not null and btrim(usuario_id) <> '' and saldo >= 0);

create policy admin_recompensas_historial_anon_select
on public.admin_recompensas_historial
for select
to anon, authenticated
using (true);

revoke insert, update, delete on table public.usuario_monedas from anon, authenticated;
grant select on table public.usuario_monedas to anon, authenticated;
grant select on table public.admin_recompensas_historial to anon, authenticated;
grant usage, select on sequence public.admin_recompensas_historial_id_seq to anon, authenticated;

create or replace function public.admin_recompensa_xp_requerido(p_nivel integer)
returns bigint
language sql
immutable
as $$
  select case
    when p_nivel >= 3000 then 0::bigint
    else round(
      220
      + (greatest(p_nivel - 1, 0) * 18)
      + (power(greatest(p_nivel - 1, 0), 1.18) * 14)
    )::bigint
  end;
$$;

alter table public.historial_xp
drop constraint if exists historial_xp_xp_ganado_check;

alter table public.historial_xp
add constraint historial_xp_xp_ganado_check check (xp_ganado >= 0);

create or replace function public.admin_recompensa_aplicar_xp(p_usuario text, p_xp bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actual record;
  nivel_anterior integer;
  nivel_nuevo integer;
  xp_nuevo bigint;
  requisito bigint;
  nivel_iter integer;
  recompensa record;
begin
  insert into public.progreso_nivel (usuario_id, xp, nivel)
  values (p_usuario, 0, 1)
  on conflict (usuario_id) do nothing;

  select *
  into actual
  from public.progreso_nivel
  where usuario_id = p_usuario
  for update;

  nivel_anterior := least(greatest(coalesce(actual.nivel, 1), 1), 3000);
  nivel_nuevo := nivel_anterior;
  xp_nuevo := greatest(coalesce(actual.xp, 0), 0) + greatest(coalesce(p_xp, 0), 0);

  if nivel_nuevo < 3000 then
    requisito := public.admin_recompensa_xp_requerido(nivel_nuevo);
    if xp_nuevo >= requisito then
      xp_nuevo := 0;
      nivel_nuevo := nivel_nuevo + 1;
    end if;
  end if;

  if nivel_nuevo >= 3000 then
    xp_nuevo := 0;
  end if;

  update public.progreso_nivel
  set xp = xp_nuevo,
      nivel = nivel_nuevo,
      updated_at = now()
  where usuario_id = p_usuario;

  if nivel_nuevo > nivel_anterior then
    for nivel_iter in (nivel_anterior + 1)..nivel_nuevo loop
      insert into public.historial_xp (usuario_id, accion, accion_key, xp_ganado, detalle)
      values (
        p_usuario,
        'recompensa_nivel',
        'recompensa:nivel:' || nivel_iter,
        0,
        jsonb_build_object('nivel', nivel_iter, 'motivo', 'subida_nivel', 'origen', 'admin')
      )
      on conflict (usuario_id, accion_key) do nothing;

      for recompensa in
        select *
        from public.recompensas_nivel
        where nivel = nivel_iter
      loop
        insert into public.recompensas_desbloqueadas (usuario_id, nivel, recompensa_id, tipo, valor)
        values (p_usuario, recompensa.nivel, recompensa.id, recompensa.tipo, recompensa.valor)
        on conflict (usuario_id, nivel, tipo, valor) do nothing;
      end loop;
    end loop;
  end if;

  return jsonb_build_object(
    'nivelAnterior', nivel_anterior,
    'nivelActual', nivel_nuevo,
    'xpNivel', xp_nuevo
  );
end;
$$;

create or replace function public.admin_otorgar_recompensa(
  p_clave text,
  p_usuario text,
  p_tipo text,
  p_cantidad bigint default null,
  p_multiplicador numeric default null,
  p_duracion_tipo text default 'horas',
  p_duracion_cantidad integer default null,
  p_item_id text default null,
  p_item_tipo text default null,
  p_item_rareza text default null,
  p_item_nombre text default null,
  p_detalle jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_limpio text := btrim(coalesce(p_usuario, ''));
  tipo_limpio text := btrim(coalesce(p_tipo, ''));
  cantidad_limpia bigint := greatest(0, coalesce(p_cantidad, 0));
  multiplicador_limpio numeric(3,1) := round(greatest(1.2, least(3.5, coalesce(p_multiplicador, 1.2)))::numeric, 1);
  duracion_tipo_limpio text := case when p_duracion_tipo = 'dias' then 'dias' else 'horas' end;
  duracion_limpia integer := greatest(1, least(365, coalesce(p_duracion_cantidad, 1)));
  inicio timestamptz := now();
  fin timestamptz;
  booster_prefix text;
  booster_id text;
  saldo_nuevo bigint;
  xp_resultado jsonb := '{}'::jsonb;
  dedupe text;
  rareza_remota text;
begin
  if not public.validar_admin_torneo(p_clave) then
    return jsonb_build_object('ok', false, 'mensaje', 'Permiso admin invalido');
  end if;

  if usuario_limpio = '' or to_regclass('public.usuarios') is null then
    return jsonb_build_object('ok', false, 'mensaje', 'Usuario invalido');
  end if;

  if not exists (select 1 from public.usuarios where usuario = usuario_limpio) then
    return jsonb_build_object('ok', false, 'mensaje', 'El usuario no existe');
  end if;

  if tipo_limpio not in ('monedas', 'experiencia', 'booster_xp', 'booster_monedas', 'fondo', 'id', 'marco', 'especial') then
    return jsonb_build_object('ok', false, 'mensaje', 'Tipo de recompensa invalido');
  end if;

  if tipo_limpio in ('monedas', 'experiencia') and (cantidad_limpia <= 0 or cantidad_limpia > 10000000) then
    return jsonb_build_object('ok', false, 'mensaje', 'Cantidad fuera de rango');
  end if;

  if tipo_limpio = 'monedas' then
    insert into public.usuario_monedas (usuario_id, saldo)
    values (usuario_limpio, cantidad_limpia)
    on conflict (usuario_id) do update
      set saldo = public.usuario_monedas.saldo + excluded.saldo,
          updated_at = now()
    returning saldo into saldo_nuevo;
  elsif tipo_limpio = 'experiencia' then
    xp_resultado := public.admin_recompensa_aplicar_xp(usuario_limpio, cantidad_limpia);

    insert into public.historial_xp (usuario_id, accion, accion_key, xp_ganado, detalle)
    values (
      usuario_limpio,
      'admin_recompensa_xp',
      'admin:xp:' || extract(epoch from clock_timestamp())::text || ':' || md5(random()::text),
      cantidad_limpia,
      coalesce(p_detalle, '{}'::jsonb) || jsonb_build_object('origen', 'admin', 'tipo', tipo_limpio)
    );
  elsif tipo_limpio in ('booster_xp', 'booster_monedas') then
    fin := inicio + (duracion_limpia * case when duracion_tipo_limpio = 'dias' then interval '1 day' else interval '1 hour' end);
    booster_prefix := case when tipo_limpio = 'booster_xp' then 'admin_xp_' else 'admin_coins_' end;
    booster_id := booster_prefix || replace(multiplicador_limpio::text, '.', '') || '_' || duracion_limpia || duracion_tipo_limpio;

    update public.usuario_boosters
    set activo = false
    where usuario_id = usuario_limpio
      and booster_id like booster_prefix || '%'
      and fecha_fin > now();

    insert into public.usuario_boosters (usuario_id, booster_id, multiplicador, fecha_inicio, fecha_fin, activo)
    values (usuario_limpio, booster_id, multiplicador_limpio, inicio, fin, true);
  elsif tipo_limpio in ('fondo', 'id', 'marco') then
    if coalesce(p_item_id, '') = '' or coalesce(p_item_tipo, '') <> tipo_limpio then
      return jsonb_build_object('ok', false, 'mensaje', 'Cosmetico invalido');
    end if;

    rareza_remota := case when p_item_rareza = 'Prohibido' then 'Mitico' else coalesce(nullif(p_item_rareza, ''), 'Normal') end;
    if rareza_remota not in ('Normal', 'Raro', 'Epico', 'Legendario', 'Mitico') then
      rareza_remota := 'Normal';
    end if;

    insert into public.usuario_cosmeticos (usuario_id, cosmetico_id, tipo, rareza, equipado, created_at)
    values (usuario_limpio, p_item_id, tipo_limpio, rareza_remota, false, now())
    on conflict (usuario_id, cosmetico_id) do update
      set tipo = excluded.tipo,
          rareza = excluded.rareza;
  end if;

  dedupe := md5(usuario_limpio || tipo_limpio || coalesce(p_item_id, '') || coalesce(p_item_nombre, '') || coalesce(cantidad_limpia::text, '') || coalesce(multiplicador_limpio::text, '') || clock_timestamp()::text);

  insert into public.admin_recompensas_historial (
    usuario_id, admin_id, tipo, cantidad, multiplicador, fecha_inicio, fecha_fin,
    item_id, item_tipo, item_rareza, item_nombre, detalle, dedupe_key
  )
  values (
    usuario_limpio, 'admin', tipo_limpio,
    case when tipo_limpio in ('monedas', 'experiencia') then cantidad_limpia else null end,
    case when tipo_limpio in ('booster_xp', 'booster_monedas') then multiplicador_limpio else null end,
    case when tipo_limpio in ('booster_xp', 'booster_monedas') then inicio else null end,
    case when tipo_limpio in ('booster_xp', 'booster_monedas') then fin else null end,
    p_item_id, p_item_tipo, p_item_rareza, p_item_nombre,
    coalesce(p_detalle, '{}'::jsonb) || jsonb_build_object('xpResultado', xp_resultado, 'saldoNuevo', saldo_nuevo),
    dedupe
  );

  return jsonb_build_object('ok', true, 'mensaje', 'Recompensa enviada', 'saldoNuevo', saldo_nuevo, 'xp', xp_resultado);
exception
  when others then
    return jsonb_build_object('ok', false, 'mensaje', 'No se pudo otorgar la recompensa');
end;
$$;

grant execute on function public.admin_otorgar_recompensa(text, text, text, bigint, numeric, text, integer, text, text, text, text, jsonb) to anon, authenticated;
