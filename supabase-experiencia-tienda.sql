-- Extensiones de experiencia, temporada y tienda.
-- Ejecutar en Supabase SQL Editor si quieres persistencia global.

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

  return true;
end;
$$;

create table if not exists public.usuario_boosters (
  id bigserial primary key,
  usuario_id text not null,
  booster_id text not null,
  multiplicador numeric(3,1) not null check (multiplicador in (2.0, 4.0)),
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

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

alter table public.bonus_temporada enable row level security;
alter table public.usuario_boosters enable row level security;
alter table public.usuario_cosmeticos enable row level security;

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
  and multiplicador in (2.0, 4.0)
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
  and multiplicador in (2.0, 4.0)
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
