import { q } from "./db";

/** Todo lo que se muestra de un jugador en su tarjeta de campeon. */
export interface Jugador {
  id: number;
  tag: string;
  full_name: string | null;
  town: string | null;
  bio: string | null;
  main: string | null;
  device: string | null;
  twitch: string | null;
  tiktok: string | null;
  instagram: string | null;
  youtube: string | null;
  avatar_url: string | null;
  is_example: boolean;
  display: number | null;
  rank: number | null;
}

export interface Podio {
  position: number;
  points: number;
  jugador: Jugador | null;
  equipo: {
    slug: string;
    name: string;
    town: string | null;
    bio: string | null;
    captain: string | null;
    roster: Jugador[];
  } | null;
}

export interface Campeonato {
  slug: string;
  name: string;
  starts_at: string;
  venue: string | null;
  format: string | null;
  is_example: boolean;
  game_slug: string;
  game_name: string;
  game_mode: string;
  podio: Podio[];
}

const JUGADOR = (alias: string, gameExpr: string) => `
  ${alias}.id, ${alias}.tag, ${alias}.full_name, ${alias}.town, ${alias}.bio, ${alias}.main, ${alias}.device,
  ${alias}.twitch, ${alias}.tiktok, ${alias}.instagram, ${alias}.youtube, ${alias}.avatar_url, ${alias}.is_example,
  (SELECT r.display FROM ratings r WHERE r.player_id = ${alias}.id AND r.game_id = ${gameExpr}) AS display,
  (SELECT COUNT(*) + 1 FROM ratings r2 WHERE r2.game_id = ${gameExpr}
     AND r2.display > (SELECT r.display FROM ratings r WHERE r.player_id = ${alias}.id AND r.game_id = ${gameExpr}))::int AS rank`;

/** Torneos de la temporada ya jugados, con su podio (top 3) completo. */
export async function campeonatos(): Promise<Campeonato[]> {
  const torneos = await q<Omit<Campeonato, "podio"> & { id: number; game_id: number }>(
    `SELECT t.id, t.slug, t.name, t.starts_at::text AS starts_at, t.venue, t.format, t.is_example,
            g.id AS game_id, g.slug AS game_slug, g.name AS game_name, g.mode AS game_mode
       FROM tournaments t JOIN games g ON g.id = t.game_id
      WHERE t.status = 'finalizado' AND t.is_archive = FALSE
        AND EXISTS (SELECT 1 FROM results rs WHERE rs.tournament_id = t.id)
      ORDER BY t.starts_at DESC`,
  );

  const out: Campeonato[] = [];
  for (const t of torneos) {
    const filas = await q<{ position: number; points: number; player_id: number | null; team_id: number | null }>(
      `SELECT position, points, player_id, team_id FROM results
        WHERE tournament_id = $1 AND position <= 3 ORDER BY position, points DESC`,
      [t.id],
    );

    const podio: Podio[] = [];
    for (const f of filas) {
      let jugador: Jugador | null = null;
      let equipo: Podio["equipo"] = null;

      if (f.player_id) {
        [jugador] = await q<Jugador>(`SELECT ${JUGADOR("p", "$2")} FROM players p WHERE p.id = $1`, [
          f.player_id,
          t.game_id,
        ]);
      }
      if (f.team_id) {
        const [tm] = await q<{ slug: string; name: string; town: string | null; bio: string | null; captain: string | null }>(
          `SELECT tm.slug, tm.name, tm.town, tm.bio, c.tag AS captain
             FROM teams tm LEFT JOIN players c ON c.id = tm.captain_id WHERE tm.id = $1`,
          [f.team_id],
        );
        const roster = await q<Jugador>(
          `SELECT ${JUGADOR("p", "$2")}
             FROM team_players tp JOIN players p ON p.id = tp.player_id
            WHERE tp.team_id = $1
            ORDER BY (p.id = (SELECT captain_id FROM teams WHERE id = $1)) DESC, p.tag`,
          [f.team_id, t.game_id],
        );
        equipo = tm ? { ...tm, roster } : null;
      }
      podio.push({ position: f.position, points: f.points, jugador, equipo });
    }
    out.push({ ...t, podio });
  }
  return out;
}
