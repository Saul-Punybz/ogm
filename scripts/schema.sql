-- Esquema de OGM. Corre con `npm run setup`, es seguro repetirlo.
-- Disenado multi-liga desde el dia uno: todo cuelga de un juego, y un juego
-- puede ser duelo (1v1), escuadra (equipo vs equipo) o lobby de battle royale.

CREATE TABLE IF NOT EXISTS games (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  -- duel: uno contra uno | squad: equipo contra equipo | br: lobby de varias escuadras
  mode        TEXT NOT NULL CHECK (mode IN ('duel', 'squad', 'br')),
  team_size   INTEGER NOT NULL DEFAULT 1,
  platform    TEXT,
  is_mobile   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS players (
  id          SERIAL PRIMARY KEY,
  tag         TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  town        TEXT,
  discord     TEXT,
  twitch      TEXT,
  tiktok      TEXT,
  is_example  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  game_id     INTEGER REFERENCES games(id),
  town        TEXT,
  is_example  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS team_players (
  team_id     INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role        TEXT,
  PRIMARY KEY (team_id, player_id)
);

CREATE TABLE IF NOT EXISTS seasons (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  game_id     INTEGER REFERENCES games(id),
  starts_on   DATE,
  ends_on     DATE,
  is_current  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tournaments (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  game_id     INTEGER NOT NULL REFERENCES games(id),
  season_id   INTEGER REFERENCES seasons(id),
  starts_at   TIMESTAMPTZ NOT NULL,
  venue       TEXT,
  format      TEXT,
  summary     TEXT,
  stream_url  TEXT,
  status      TEXT NOT NULL DEFAULT 'finalizado' CHECK (status IN ('anunciado', 'abierto', 'en vivo', 'finalizado')),
  is_archive  BOOLEAN NOT NULL DEFAULT FALSE,
  is_example  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Un match es un duelo (2 lados) o un lobby de battle royale (N lados).
CREATE TABLE IF NOT EXISTS matches (
  id            SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  game_id       INTEGER NOT NULL REFERENCES games(id),
  kind          TEXT NOT NULL CHECK (kind IN ('duel', 'lobby')),
  round         TEXT,
  played_at     TIMESTAMPTZ NOT NULL,
  counts_rating BOOLEAN NOT NULL DEFAULT TRUE
);

-- Cada lado de un match: un jugador (duelo individual) o un equipo (escuadra).
CREATE TABLE IF NOT EXISTS match_sides (
  id          SERIAL PRIMARY KEY,
  match_id    INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id   INTEGER REFERENCES players(id),
  team_id     INTEGER REFERENCES teams(id),
  placement   INTEGER NOT NULL,
  score       INTEGER,
  kills       INTEGER,
  CHECK (player_id IS NOT NULL OR team_id IS NOT NULL)
);

-- Tabla final del torneo: de aqui salen los campeones y los puntos de temporada.
CREATE TABLE IF NOT EXISTS results (
  id            SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  player_id     INTEGER REFERENCES players(id),
  team_id       INTEGER REFERENCES teams(id),
  label         TEXT,
  points        INTEGER NOT NULL DEFAULT 0
);

-- Rating de habilidad, uno por jugador y por juego. Lo calcula lib/rating.ts.
CREATE TABLE IF NOT EXISTS ratings (
  game_id     INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  mu          DOUBLE PRECISION NOT NULL,
  sigma       DOUBLE PRECISION NOT NULL,
  ordinal     DOUBLE PRECISION NOT NULL,
  display     INTEGER NOT NULL,
  matches     INTEGER NOT NULL DEFAULT 0,
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  podiums     INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (game_id, player_id)
);

CREATE TABLE IF NOT EXISTS rating_history (
  id            SERIAL PRIMARY KEY,
  game_id       INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id     INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id      INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  display       INTEGER NOT NULL,
  played_at     TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_match_sides_match ON match_sides(match_id);
CREATE INDEX IF NOT EXISTS idx_match_sides_player ON match_sides(player_id);
CREATE INDEX IF NOT EXISTS idx_match_sides_team ON match_sides(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_results_tournament ON results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_history_player ON rating_history(player_id, game_id);

-- ---------- Cuentas (login con Discord) ----------
ALTER TABLE players ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Reclamar un perfil que ya tiene historial pasa por aprobacion: si no, cualquiera
-- se queda con el perfil del campeon.
CREATE TABLE IF NOT EXISTS profile_claims (
  id            SERIAL PRIMARY KEY,
  player_id     INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  discord_id    TEXT NOT NULL,
  discord_name  TEXT NOT NULL,
  avatar_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claims_status ON profile_claims(status);

-- ---------- Etapas de juego y votacion (tanda 3) ----------
-- temporada: cuenta para el ranking de la liga | votacion: candidato a entrar
-- eventos: torneos especiales (creadores, presenciales) | archivo: historia de 2010
ALTER TABLE games ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'temporada';
ALTER TABLE games ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Un voto por cuenta de Discord; se puede cambiar.
CREATE TABLE IF NOT EXISTS game_votes (
  discord_id  TEXT PRIMARY KEY,
  game_id     INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Perfil detallado (tanda 5) ----------
ALTER TABLE players ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS main TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS device TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS youtube TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id INTEGER REFERENCES players(id);
