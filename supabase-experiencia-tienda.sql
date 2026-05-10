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
drop constraint if exists temporadas_estado_check;

alter table public.temporadas
add constraint temporadas_estado_check
check (estado in ('activa', 'preparacion', 'pausada', 'finalizada'));

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
  visual_config = coalesce(visual_config, '{}'::jsonb)
where id = 'temporada-actual'
   or numero is null
   or bonus_juego is null;

insert into public.temporadas (
  id,
  numero,
  nombre,
  estado,
  bonus_juego,
  bonus_xp,
  activa,
  fecha_inicio,
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
  '{}'::jsonb
)
on conflict (id) do update set
  numero = coalesce(public.temporadas.numero, excluded.numero),
  estado = case when public.temporadas.activa then 'activa' else public.temporadas.estado end,
  bonus_juego = coalesce(public.temporadas.bonus_juego, excluded.bonus_juego),
  bonus_xp = coalesce(public.temporadas.bonus_xp, excluded.bonus_xp),
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

create or replace function public.admin_guardar_temporada_activa(
  p_clave text,
  p_id text,
  p_numero integer,
  p_nombre text,
  p_juego text,
  p_multiplicador numeric,
  p_estado text default 'activa'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  estado_limpio text := coalesce(nullif(lower(btrim(p_estado)), ''), 'activa');
  multiplicador_limpio numeric(3,1);
  id_limpio text := coalesce(nullif(btrim(p_id), ''), 'temporada-' || greatest(coalesce(p_numero, 1), 1)::text);
begin
  if not public.validar_admin_torneo(p_clave) then
    return false;
  end if;

  if estado_limpio not in ('activa', 'preparacion', 'pausada', 'finalizada') then
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
    now(),
    case when estado_limpio = 'finalizada' then now() else null end,
    '{}'::jsonb
  )
  on conflict (id) do update set
    numero = excluded.numero,
    nombre = excluded.nombre,
    estado = excluded.estado,
    bonus_juego = excluded.bonus_juego,
    bonus_xp = excluded.bonus_xp,
    activa = excluded.activa,
    fecha_fin = excluded.fecha_fin;

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
grant execute on function public.admin_guardar_temporada_activa(text, text, integer, text, text, numeric, text) to anon, authenticated;

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
