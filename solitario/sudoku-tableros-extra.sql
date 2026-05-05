-- Tableros extra para Sudoku.
-- No borra tableros existentes. Inserta solo puzzles que no existan todavia.
insert into public.tableros (puzzle, solucion, usado, asignado_a)
select puzzle, solucion, false, null
from (values
  ('000260701680070090190004500820100040004602900050003028009300074040050036703018000','435269781682571493197834562826195347374682915951743628519326874248957136763418259'),
  ('302609005000030094007000060000700000706000408000008000070000800640050000500906702','312649578865237194497185263258714639736592418194368527973421856641853972589976342'),
  ('003020600900305001001806400008102900700000008006708200002609500800203009005010300','483921657967345821251876493548132976729564138136798245372689514814253769695417382'),
  ('200080300060070084030500209000105408000000000402706000301007040720040060004010003','245981376169273584837564219976125438513498627482736951391657842728349165654812793'),
  ('000000907000420180000705026100904000050000040000507009920108000034059000507000000','462831957795426183381795426173984265659312748248567319926178534834259671517643892'),
  ('030050040008010500460000012070502080000603000040109030250000098001020600080060020','137256849928714563465398712673542981819673254542189637256431798391827645784965321'),
  ('020810740700003100090002805009040087400208003160030200302700060005600008076051090','523816749784593126691472835239145687457268913168937254312789564945624378876351492'),
  ('100920000524010000000000070050008102000000000402700090060000000000030945000071006','176923584524817639893654271957348162638192457412765398265489713781236945349571826'),
  ('043080250600000000000001094900004070000608000010200003820500000000000005034090710','143986257697452831285371694968134572352648179714259368829517436471863925534792716'),
  ('480006902002008001900370060840010200003704100001060049020085007700900600609200018','487156932362498571915372864846519273293784156571623849124865397738941625659237418'),
  ('000900002050123400030000160908000000070000090000000205091000050007439020400007000','714986532659123478832574169948215637275368914163794285391642857587439621426857391'),
  ('001900003900700160030005007050000009004302600200000070600100030042007006500006800','761928453925743168438615927356871249874392615219564378687159732142387596593246871'),
  ('000125400008400000420800000030000095060902010510000060000003049000007200001298000','976125438358479621421836957832761495764952813519384762287513649693647281145298376'),
  ('062340750100005600570000040000094800400000006005830000030000091006400007059083260','862341759143795628579268143321694875487512936695837412238756491916429587754183269'),
  ('300000000005009000200504000020000700160000058704310600000890100000067080000005437','397682514845179326216534897523948761169726358784351692672893145451267983938415437'),
  ('630000000000500008005674000000020000003401020000000345000007004080300902947100000','639218457471539268825674139564823791793451826218796345352987614186345972947162583'),
  ('000020040008035000000070602031046970200000000000501203049000730000000010800004000','697128345428635197315479682531246978286397451974581263149852736752963814863714529'),
  ('361025900080960010400000057008000471000603000259000800740000005020018060005470329','361725948587964213492831657638592471174683592259147836743269185926318764815476329'),
  ('050807020600010090702540006070020301504000908103080070900076205060090003080103040','459837126638612597712549836876925314524361978193784672941376285265498713387153469'),
  ('080005000000003457000070809060400903007010500408007020901020000842300000000100080','384795162219683457576274839165428973927316548438957621691842735842539716753161284')
) as nuevos(puzzle, solucion)
where not exists (
  select 1
  from public.tableros t
  where t.puzzle = nuevos.puzzle
);

-- Libera los tableros asignados a una lista de usuarios.
-- Se usa para mini torneos finalizados y tambien se puede ejecutar manualmente.
create or replace function public.liberar_tableros_sudoku_usuarios(p_usuarios text[])
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  liberados integer := 0;
begin
  if p_usuarios is null or array_length(p_usuarios, 1) is null then
    return 0;
  end if;

  with objetivos as (
    select usuario, tablero_id
    from public.usuarios
    where usuario = any(p_usuarios)
  ),
  limpiar_tableros as (
    update public.tableros t
    set usado = false,
        asignado_a = null
    from objetivos o
    where (o.tablero_id is not null and t.id = o.tablero_id)
       or t.asignado_a = o.usuario
    returning t.id
  ),
  limpiar_usuarios as (
    update public.usuarios u
    set tablero_id = null
    where u.usuario = any(p_usuarios)
    returning u.usuario
  )
  select count(*) into liberados from limpiar_tableros;

  return coalesce(liberados, 0);
end;
$$;

grant execute on function public.liberar_tableros_sudoku_usuarios(text[]) to anon, authenticated;

-- Recicla solo tableros huerfanos: marcados como usados, pero que ya no estan
-- enlazados a ningun usuario por usuarios.tablero_id.
create or replace function public.reciclar_tableros_sudoku_huerfanos()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  reciclados integer := 0;
begin
  update public.tableros t
  set usado = false,
      asignado_a = null
  where coalesce(t.usado, false) = true
    and not exists (
      select 1
      from public.usuarios u
      where u.tablero_id = t.id
    );

  get diagnostics reciclados = row_count;
  return reciclados;
end;
$$;

grant execute on function public.reciclar_tableros_sudoku_huerfanos() to anon, authenticated;

-- Version compatible de asignar_tablero:
-- 1. Entrega un tablero libre.
-- 2. Si no hay libres, recicla huerfanos.
-- 3. Si aun no hay, devuelve vacio para que el frontend muestre su alerta.
create or replace function public.asignar_tablero(p_usuario text)
returns table(id bigint, puzzle text, solucion text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_usuario is null or btrim(p_usuario) = '' then
    return;
  end if;

  return query
  with elegido as (
    select t.id
    from public.tableros t
    where coalesce(t.usado, false) = false
    order by random()
    limit 1
  ),
  asignado as (
    update public.tableros t
    set usado = true,
        asignado_a = p_usuario
    from elegido e
    where t.id = e.id
    returning t.id, t.puzzle, t.solucion
  )
  select asignado.id::bigint, asignado.puzzle, asignado.solucion
  from asignado;

  if found then
    return;
  end if;

  perform public.reciclar_tableros_sudoku_huerfanos();

  return query
  with elegido as (
    select t.id
    from public.tableros t
    where coalesce(t.usado, false) = false
    order by random()
    limit 1
  ),
  asignado as (
    update public.tableros t
    set usado = true,
        asignado_a = p_usuario
    from elegido e
    where t.id = e.id
    returning t.id, t.puzzle, t.solucion
  )
  select asignado.id::bigint, asignado.puzzle, asignado.solucion
  from asignado;
end;
$$;

grant execute on function public.asignar_tablero(text) to anon, authenticated;

-- Libera automaticamente tableros cuando una sala de mini torneo de Sudoku finaliza.
create or replace function public.liberar_tableros_sudoku_sala_finalizada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jugadores text[];
begin
  if new.estado = 'finalizado'
    and coalesce(old.estado, '') <> 'finalizado'
    and new.juego = 'sudoku'
  then
    select array_agg(coalesce(usuario, usuario_id))
    into jugadores
    from public.sala_jugadores
    where sala_id = new.id;

    perform public.liberar_tableros_sudoku_usuarios(jugadores);
  end if;

  return new;
end;
$$;

drop trigger if exists liberar_tableros_sudoku_sala_finalizada_trigger on public.salas;
create trigger liberar_tableros_sudoku_sala_finalizada_trigger
after update of estado on public.salas
for each row
execute function public.liberar_tableros_sudoku_sala_finalizada();

-- Opcion manual de emergencia:
-- select public.liberar_tableros_sudoku_usuarios(array['apodo1', 'apodo2']);
