-- Crear tablas de ranking separadas para ajedrez, damas y domino
-- Si prefieres usar una sola tabla "ranking" con un campo "juego", no necesitas estas tablas.

CREATE TABLE IF NOT EXISTS public.ranking_ajedrez (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'ajedrez',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_ajedrez_usuario_juego_idx
  ON public.ranking_ajedrez(usuario, juego);

CREATE TABLE IF NOT EXISTS public.ranking_damas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'damas',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_damas_usuario_juego_idx
  ON public.ranking_damas(usuario, juego);

CREATE TABLE IF NOT EXISTS public.ranking_domino (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'domino',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_domino_usuario_juego_idx
  ON public.ranking_domino(usuario, juego);

-- Si deseas seguir usando la tabla genérica "ranking", asegúrate de que contenga el campo "juego":
-- ALTER TABLE public.ranking ADD COLUMN IF NOT EXISTS juego text;
-- ALTER TABLE public.ranking ADD COLUMN IF NOT EXISTS sospechoso boolean DEFAULT false;
-- ALTER TABLE public.ranking ADD COLUMN IF NOT EXISTS invalido boolean DEFAULT false;
-- ALTER TABLE public.ranking ADD COLUMN IF NOT EXISTS motivo text;
-- CREATE UNIQUE INDEX IF NOT EXISTS ranking_usuario_juego_idx
--   ON public.ranking(usuario, juego);


-- ===========================================
-- RANKINGS PARA NUEVOS JUEGOS
-- ===========================================

CREATE TABLE IF NOT EXISTS public.ranking_perfecttap (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'perfecttap',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_perfecttap_usuario_juego_idx
  ON public.ranking_perfecttap(usuario, juego);

CREATE TABLE IF NOT EXISTS public.ranking_linkpath (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'linkpath',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_linkpath_usuario_juego_idx
  ON public.ranking_linkpath(usuario, juego);

CREATE TABLE IF NOT EXISTS public.ranking_mazerush (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'mazerush',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_mazerush_usuario_juego_idx
  ON public.ranking_mazerush(usuario, juego);

CREATE TABLE IF NOT EXISTS public.ranking_towershift (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario text NOT NULL,
  tiempo int4 NOT NULL,
  juego text NOT NULL DEFAULT 'towershift',
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  invalido boolean DEFAULT false,
  sospechoso boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS ranking_towershift_usuario_juego_idx
  ON public.ranking_towershift(usuario, juego);
