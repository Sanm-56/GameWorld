alter table public.salas
add column if not exists juego text;

alter table public.salas
add column if not exists inicio_torneo timestamptz;

alter table public.salas
add column if not exists fecha_fin timestamptz;

alter table public.salas
drop constraint if exists salas_juego_check;

alter table public.salas
add constraint salas_juego_check
check (
  juego is null or juego in (
    'ajedrez',
    'damas',
    'domino',
    'flashmind',
    'matematicas',
    'memoria',
    'numcatch',
    'sudoku'
  )
);

create index if not exists salas_estado_juego_idx on public.salas (estado, juego);

grant select, insert, update on table public.salas to anon, authenticated;
