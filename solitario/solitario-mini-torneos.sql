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
grant select, insert, update on table public.sala_jugadores to anon, authenticated;
grant select, insert on table public.solitario_resultados to anon, authenticated;

create or replace function public.admin_finalizar_mini_torneo(p_clave text, p_sala_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  sala_existe boolean;
begin
  if not public.validar_admin_torneo(p_clave) then
    return jsonb_build_object('ok', false, 'mensaje', 'Clave admin invalida');
  end if;

  update public.salas
  set estado = 'finalizado',
      fecha_fin = coalesce(fecha_fin, now()),
      updated_at = now()
  where id = p_sala_id
    and estado <> 'finalizado';

  select exists(select 1 from public.salas where id = p_sala_id) into sala_existe;
  if not sala_existe then
    return jsonb_build_object('ok', true, 'accion', 'ya_no_existe');
  end if;

  return jsonb_build_object('ok', true, 'accion', 'finalizado');
end;
$$;

create or replace function public.admin_borrar_mini_torneo(p_clave text, p_sala_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.validar_admin_torneo(p_clave) then
    return jsonb_build_object('ok', false, 'mensaje', 'Clave admin invalida');
  end if;

  delete from public.solitario_resultados
  where sala_id = p_sala_id;

  delete from public.sala_jugadores
  where sala_id = p_sala_id;

  delete from public.salas
  where id = p_sala_id;

  return jsonb_build_object('ok', true, 'accion', 'borrado');
end;
$$;

grant execute on function public.admin_finalizar_mini_torneo(text, bigint) to anon, authenticated;
grant execute on function public.admin_borrar_mini_torneo(text, bigint) to anon, authenticated;
