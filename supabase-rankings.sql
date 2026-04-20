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
