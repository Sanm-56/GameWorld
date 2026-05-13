-- Migracion segura: restaura progresion acumulativa y conserva excedente de EXP.
-- historial_xp audita cada ganancia; progreso_nivel.xp conserva el sobrante del nivel actual.

create or replace function public.xp_requerido_nivel(nivel_actual integer)
returns integer
language sql
immutable
as $$
  select case
    when nivel_actual >= 3000 then 0
    else round(
      220
      + (greatest(nivel_actual - 1, 0) * 18)
      + (power(greatest(nivel_actual - 1, 0), 1.18) * 14)
    )::integer
  end;
$$;

create or replace function public.actualizar_nivel_desde_xp()
returns trigger
language plpgsql
as $$
begin
  new.xp := greatest(coalesce(new.xp, 0), 0);
  new.nivel := least(greatest(coalesce(new.nivel, 1), 1), 3000);

  if tg_op = 'INSERT' then
    select id
    into new.temporada_id
    from public.temporadas_nivel
    where activa = true
    order by fecha_inicio desc
    limit 1;

    new.temporada_id := coalesce(new.temporada_id, 'temporada-actual');
  end if;

  while new.nivel < 3000 loop
    exit when new.xp < public.xp_requerido_nivel(new.nivel);
    new.xp := new.xp - public.xp_requerido_nivel(new.nivel);
    new.nivel := new.nivel + 1;
  end loop;

  if new.nivel >= 3000 then
    new.xp := 0;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

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

  while nivel_nuevo < 3000 loop
    requisito := public.admin_recompensa_xp_requerido(nivel_nuevo);
    exit when xp_nuevo < requisito;
    xp_nuevo := xp_nuevo - requisito;
    nivel_nuevo := nivel_nuevo + 1;
  end loop;

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
