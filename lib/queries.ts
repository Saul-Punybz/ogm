import { q, one } from "./db";

export interface Game {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  mode: "duel" | "squad" | "br";
  team_size: number;
  platform: string | null;
  is_mobile: boolean;
  is_active: boolean;
  stage: "temporada" | "votacion" | "eventos" | "archivo";
  tagline: string | null;
}

export interface RankRow {
  player_id: number;
  tag: string;
  town: string | null;
  is_example: boolean;
  display: number;
  matches: number;
  wins: number;
  losses: number;
  podiums: number;
  team_name: string | null;
  team_slug: string | null;
}

export interface TournamentRow {
  id: number;
  slug: string;
  name: string;
  starts_at: string;
  venue: string | null;
  format: string | null;
  summary: string | null;
  status: string;
  is_archive: boolean;
  is_example: boolean;
  game_slug: string;
  game_name: string;
  game_short: string;
  game_mode: "duel" | "squad" | "br";
  game_stage: string;
  is_mobile: boolean;
}

export interface ResultRow {
  position: number;
  points: number;
  player_tag: string | null;
  team_name: string | null;
  team_slug: string | null;
}

const TOURNAMENT_FIELDS = `
  t.id, t.slug, t.name, t.starts_at::text AS starts_at, t.venue, t.format, t.summary,
  t.status, t.is_archive, t.is_example,
  g.slug AS game_slug, g.name AS game_name, g.short_name AS game_short, g.is_mobile,
  g.mode AS game_mode, g.stage AS game_stage`;

export function getGames(activeOnly = true) {
  return q<Game>(
    `SELECT id, slug, name, short_name, mode, team_size, platform, is_mobile, is_active, stage, tagline
       FROM games ${activeOnly ? "WHERE is_active = TRUE" : ""}
      ORDER BY sort_order, name`,
  );
}

export function getGame(slug: string) {
  return one<Game>(
    `SELECT id, slug, name, short_name, mode, team_size, platform, is_mobile, is_active, stage, tagline
       FROM games WHERE slug = $1`,
    [slug],
  );
}

export function getRanking(gameId: number, limit = 50) {
  return q<RankRow>(
    // La escuadra sale por subconsulta, no por join: un jugador puede estar en
    // varios equipos y el join lo duplicaba en la tabla.
    `SELECT r.player_id, p.tag, p.town, p.is_example, r.display, r.matches, r.wins, r.losses, r.podiums,
            (SELECT tm.name FROM team_players tp JOIN teams tm ON tm.id = tp.team_id
              WHERE tp.player_id = r.player_id AND tm.game_id = r.game_id LIMIT 1) AS team_name,
            (SELECT tm.slug FROM team_players tp JOIN teams tm ON tm.id = tp.team_id
              WHERE tp.player_id = r.player_id AND tm.game_id = r.game_id LIMIT 1) AS team_slug
       FROM ratings r
       JOIN players p ON p.id = r.player_id
      WHERE r.game_id = $1
      ORDER BY r.display DESC, p.tag
      LIMIT $2`,
    [gameId, limit],
  );
}

/** Tabla de escuadras del juego: promedio del rating de sus jugadores. */
export function getTeamRanking(gameId: number) {
  return q<{
    slug: string;
    name: string;
    town: string | null;
    display: number;
    players: number;
    titles: number;
  }>(
    `SELECT tm.slug, tm.name, tm.town,
            ROUND(AVG(r.display))::int AS display,
            COUNT(DISTINCT tp.player_id)::int AS players,
            (SELECT COUNT(*) FROM results rs
               JOIN tournaments t ON t.id = rs.tournament_id
              WHERE rs.team_id = tm.id AND rs.position = 1)::int AS titles
       FROM teams tm
       JOIN team_players tp ON tp.team_id = tm.id
       LEFT JOIN ratings r ON r.player_id = tp.player_id AND r.game_id = tm.game_id
      WHERE tm.game_id = $1
      GROUP BY tm.id, tm.slug, tm.name, tm.town
      HAVING AVG(r.display) IS NOT NULL
      ORDER BY display DESC`,
    [gameId],
  );
}

export function getUpcoming(limit = 4) {
  return q<TournamentRow>(
    `SELECT ${TOURNAMENT_FIELDS}
       FROM tournaments t JOIN games g ON g.id = t.game_id
      WHERE t.status <> 'finalizado'
      ORDER BY t.starts_at
      LIMIT $1`,
    [limit],
  );
}

export function getRecentTournaments(limit = 6) {
  return q<TournamentRow>(
    `SELECT ${TOURNAMENT_FIELDS}
       FROM tournaments t JOIN games g ON g.id = t.game_id
      WHERE t.status = 'finalizado' AND t.is_archive = FALSE
      ORDER BY t.starts_at DESC
      LIMIT $1`,
    [limit],
  );
}

export function getAllTournaments() {
  return q<TournamentRow>(
    `SELECT ${TOURNAMENT_FIELDS}
       FROM tournaments t JOIN games g ON g.id = t.game_id
      ORDER BY t.starts_at DESC`,
  );
}

export function getTournamentsByGame(gameId: number) {
  return q<TournamentRow>(
    `SELECT ${TOURNAMENT_FIELDS}
       FROM tournaments t JOIN games g ON g.id = t.game_id
      WHERE t.game_id = $1
      ORDER BY t.starts_at DESC`,
    [gameId],
  );
}

export function getTournament(slug: string) {
  return one<TournamentRow>(
    `SELECT ${TOURNAMENT_FIELDS}
       FROM tournaments t JOIN games g ON g.id = t.game_id
      WHERE t.slug = $1`,
    [slug],
  );
}

export function getResults(tournamentId: number) {
  return q<ResultRow>(
    `SELECT rs.position, rs.points, p.tag AS player_tag, tm.name AS team_name, tm.slug AS team_slug
       FROM results rs
       LEFT JOIN players p ON p.id = rs.player_id
       LEFT JOIN teams tm ON tm.id = rs.team_id
      WHERE rs.tournament_id = $1
      ORDER BY rs.position, rs.points DESC`,
    [tournamentId],
  );
}

export interface MatchWithSides {
  id: number;
  kind: "duel" | "lobby";
  round: string | null;
  played_at: string;
  sides: {
    placement: number;
    score: number | null;
    kills: number | null;
    player_tag: string | null;
    team_name: string | null;
    team_slug: string | null;
  }[];
}

export async function getMatches(tournamentId: number): Promise<MatchWithSides[]> {
  const matches = await q<Omit<MatchWithSides, "sides">>(
    `SELECT id, kind, round, played_at::text AS played_at
       FROM matches WHERE tournament_id = $1 ORDER BY played_at, id`,
    [tournamentId],
  );
  if (matches.length === 0) return [];

  const sides = await q<{
    match_id: number;
    placement: number;
    score: number | null;
    kills: number | null;
    player_tag: string | null;
    team_name: string | null;
    team_slug: string | null;
  }>(
    `SELECT ms.match_id, ms.placement, ms.score, ms.kills,
            p.tag AS player_tag, tm.name AS team_name, tm.slug AS team_slug
       FROM match_sides ms
       JOIN matches m ON m.id = ms.match_id
       LEFT JOIN players p ON p.id = ms.player_id
       LEFT JOIN teams tm ON tm.id = ms.team_id
      WHERE m.tournament_id = $1
      ORDER BY ms.match_id, ms.placement`,
    [tournamentId],
  );

  return matches.map((m) => ({
    ...m,
    sides: sides.filter((s) => s.match_id === m.id),
  }));
}

export interface PlayerProfile {
  id: number;
  tag: string;
  full_name: string | null;
  town: string | null;
  twitch: string | null;
  tiktok: string | null;
  discord: string | null;
  is_example: boolean;
  verified: boolean;
  avatar_url: string | null;
}

export function getPlayer(tag: string) {
  return one<PlayerProfile>(
    `SELECT id, tag, full_name, town, twitch, tiktok, discord, is_example,
            (discord_id IS NOT NULL) AS verified, avatar_url
       FROM players WHERE LOWER(tag) = LOWER($1)`,
    [tag],
  );
}

export function getPlayerRatings(playerId: number) {
  return q<{
    game_slug: string;
    game_name: string;
    game_short: string;
    mode: string;
    display: number;
    matches: number;
    wins: number;
    losses: number;
    podiums: number;
    position: number;
  }>(
    `SELECT g.slug AS game_slug, g.name AS game_name, g.short_name AS game_short, g.mode,
            r.display, r.matches, r.wins, r.losses, r.podiums,
            (SELECT COUNT(*) + 1 FROM ratings r2
              WHERE r2.game_id = r.game_id AND r2.display > r.display)::int AS position
       FROM ratings r JOIN games g ON g.id = r.game_id
      WHERE r.player_id = $1
      ORDER BY r.display DESC`,
    [playerId],
  );
}

export function getPlayerTitles(playerId: number) {
  return q<{
    position: number;
    tournament_name: string;
    tournament_slug: string;
    starts_at: string;
    game_short: string;
    game_slug: string;
    team_name: string | null;
    is_archive: boolean;
  }>(
    `SELECT rs.position, t.name AS tournament_name, t.slug AS tournament_slug,
            t.starts_at::text AS starts_at, g.short_name AS game_short, g.slug AS game_slug,
            tm.name AS team_name, t.is_archive
       FROM results rs
       JOIN tournaments t ON t.id = rs.tournament_id
       JOIN games g ON g.id = t.game_id
       LEFT JOIN teams tm ON tm.id = rs.team_id
      WHERE rs.player_id = $1
         OR rs.team_id IN (SELECT team_id FROM team_players WHERE player_id = $1)
      ORDER BY t.starts_at DESC`,
    [playerId],
  );
}

export function getPlayerMatches(playerId: number, limit = 12) {
  return q<{
    match_id: number;
    kind: string;
    round: string | null;
    played_at: string;
    placement: number;
    kills: number | null;
    score: number | null;
    game_short: string;
    tournament_name: string;
    tournament_slug: string;
    sides_total: number;
  }>(
    `SELECT m.id AS match_id, m.kind, m.round, m.played_at::text AS played_at,
            ms.placement, ms.kills, ms.score,
            g.short_name AS game_short, t.name AS tournament_name, t.slug AS tournament_slug,
            (SELECT COUNT(*) FROM match_sides x WHERE x.match_id = m.id)::int AS sides_total
       FROM match_sides ms
       JOIN matches m ON m.id = ms.match_id
       JOIN tournaments t ON t.id = m.tournament_id
       JOIN games g ON g.id = m.game_id
      WHERE ms.player_id = $1
         OR ms.team_id IN (SELECT team_id FROM team_players WHERE player_id = $1)
      ORDER BY m.played_at DESC
      LIMIT $2`,
    [playerId, limit],
  );
}

/** Cara a cara: solo tiene sentido en duelos. */
export function getPlayerRivals(playerId: number) {
  return q<{ rival: string; wins: number; losses: number; game_short: string }>(
    `SELECT rival.tag AS rival, g.short_name AS game_short,
            SUM(CASE WHEN mine.placement < rival_side.placement THEN 1 ELSE 0 END)::int AS wins,
            SUM(CASE WHEN mine.placement > rival_side.placement THEN 1 ELSE 0 END)::int AS losses
       FROM match_sides mine
       JOIN matches m ON m.id = mine.match_id AND m.kind = 'duel'
       JOIN games g ON g.id = m.game_id
       JOIN match_sides rival_side ON rival_side.match_id = mine.match_id AND rival_side.id <> mine.id
       JOIN players rival ON rival.id = rival_side.player_id
      WHERE mine.player_id = $1
      GROUP BY rival.tag, g.short_name
      ORDER BY (SUM(CASE WHEN mine.placement < rival_side.placement THEN 1 ELSE 0 END)
              + SUM(CASE WHEN mine.placement > rival_side.placement THEN 1 ELSE 0 END)) DESC`,
    [playerId],
  );
}

export function getTeam(slug: string) {
  return one<{
    id: number;
    slug: string;
    name: string;
    town: string | null;
    is_example: boolean;
    game_slug: string;
    game_name: string;
    game_short: string;
    mode: string;
  }>(
    `SELECT tm.id, tm.slug, tm.name, tm.town, tm.is_example,
            g.slug AS game_slug, g.name AS game_name, g.short_name AS game_short, g.mode
       FROM teams tm LEFT JOIN games g ON g.id = tm.game_id
      WHERE tm.slug = $1`,
    [slug],
  );
}

export function getTeamRoster(teamId: number) {
  return q<{ tag: string; town: string | null; display: number | null }>(
    `SELECT p.tag, p.town, r.display
       FROM team_players tp
       JOIN players p ON p.id = tp.player_id
       LEFT JOIN ratings r ON r.player_id = p.id
        AND r.game_id = (SELECT game_id FROM teams WHERE id = $1)
      WHERE tp.team_id = $1
      ORDER BY r.display DESC NULLS LAST, p.tag`,
    [teamId],
  );
}

export function getTeamResults(teamId: number) {
  return q<{
    position: number;
    points: number;
    tournament_name: string;
    tournament_slug: string;
    starts_at: string;
    game_short: string;
  }>(
    `SELECT rs.position, rs.points, t.name AS tournament_name, t.slug AS tournament_slug,
            t.starts_at::text AS starts_at, g.short_name AS game_short
       FROM results rs
       JOIN tournaments t ON t.id = rs.tournament_id
       JOIN games g ON g.id = t.game_id
      WHERE rs.team_id = $1
      ORDER BY t.starts_at DESC`,
    [teamId],
  );
}

export interface Champion {
  tournament_name: string;
  tournament_slug: string;
  starts_at: string;
  venue: string | null;
  game_short: string;
  game_slug: string;
  player_tag: string | null;
  team_name: string | null;
  team_slug: string | null;
  is_archive: boolean;
  is_example: boolean;
}

export function getChampions() {
  return q<Champion>(
    `SELECT t.name AS tournament_name, t.slug AS tournament_slug, t.starts_at::text AS starts_at,
            t.venue, g.short_name AS game_short, g.slug AS game_slug,
            p.tag AS player_tag, tm.name AS team_name, tm.slug AS team_slug,
            t.is_archive, t.is_example
       FROM results rs
       JOIN tournaments t ON t.id = rs.tournament_id
       JOIN games g ON g.id = t.game_id
       LEFT JOIN players p ON p.id = rs.player_id
       LEFT JOIN teams tm ON tm.id = rs.team_id
      WHERE rs.position = 1
      ORDER BY t.starts_at DESC`,
  );
}

export function getCounts() {
  return one<{ players: number; teams: number; tournaments: number; matches: number }>(
    `SELECT (SELECT COUNT(*) FROM players)::int AS players,
            (SELECT COUNT(*) FROM teams)::int AS teams,
            (SELECT COUNT(*) FROM tournaments)::int AS tournaments,
            (SELECT COUNT(*) FROM matches)::int AS matches`,
  );
}

/** Votacion del cuarto juego: candidatos con su conteo. */
export function getVoteResults() {
  return q<{ id: number; slug: string; name: string; tagline: string | null; votes: number }>(
    `SELECT g.id, g.slug, g.name, g.tagline,
            (SELECT COUNT(*) FROM game_votes v WHERE v.game_id = g.id)::int AS votes
       FROM games g
      WHERE g.stage = 'votacion'
      ORDER BY g.sort_order`,
  );
}

export async function getMyVote(discordId: string): Promise<number | null> {
  const row = await one<{ game_id: number }>(
    `SELECT game_id FROM game_votes WHERE discord_id = $1`,
    [discordId],
  );
  return row?.game_id ?? null;
}
