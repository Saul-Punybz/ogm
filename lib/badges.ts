/**
 * Insignias y niveles. Todo sale de los datos de la liga: nadie las asigna a
 * mano, asi que no se pueden "regalar" ni inflar.
 */

import { q, one } from "./db";

export type Tier = "oro" | "plata" | "bronce" | "marca";

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  tier: Tier;
  icon: string;
  xp: number;
}

export const BADGES: BadgeDef[] = [
  { id: "campeon", name: "Campeón", desc: "Ganó un torneo de OGM.", tier: "oro", icon: "corona", xp: 400 },
  { id: "numero-uno", name: "Número 1", desc: "Es el primero del ranking en un juego.", tier: "oro", icon: "uno", xp: 300 },
  { id: "leyenda-2010", name: "Leyenda 2010", desc: "Campeón en los torneos originales de OGM, en 2010.", tier: "oro", icon: "laurel", xp: 500 },
  { id: "podio", name: "Podio", desc: "Terminó entre los tres primeros de un torneo.", tier: "plata", icon: "podio", xp: 150 },
  { id: "top-10", name: "Top 10", desc: "Está entre los diez mejores de un juego.", tier: "plata", icon: "estrella", xp: 120 },
  { id: "matagigantes", name: "Matagigantes", desc: "Le ganó a alguien con 100 o más puntos de rating por encima.", tier: "plata", icon: "espada", xp: 200 },
  { id: "en-llamas", name: "En llamas", desc: "Ganó 3 duelos seguidos.", tier: "marca", icon: "llama", xp: 150 },
  { id: "rey-del-lobby", name: "Rey del lobby", desc: "Su escuadra ganó un lobby de battle royale.", tier: "marca", icon: "zona", xp: 120 },
  { id: "lluvia-de-bajas", name: "Lluvia de bajas", desc: "Su escuadra hizo 10 o más bajas en un lobby.", tier: "marca", icon: "mira", xp: 100 },
  { id: "todoterreno", name: "Todoterreno", desc: "Tiene rating en dos juegos o más.", tier: "bronce", icon: "cuadros", xp: 100 },
  { id: "debut", name: "Debut", desc: "Jugó su primera partida en la liga.", tier: "bronce", icon: "play", xp: 50 },
  { id: "verificado", name: "Verificado", desc: "Enlazó su cuenta de Discord.", tier: "bronce", icon: "check", xp: 50 },
];

/** Puntos de experiencia necesarios para cada nivel (nivel 1 = 0 XP). */
const NIVELES = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400];

export interface Progreso {
  earned: (BadgeDef & { count: number })[];
  locked: BadgeDef[];
  xp: number;
  level: number;
  levelXp: number;
  nextXp: number | null;
}

export function nivelDe(xp: number) {
  let level = 1;
  for (let i = 0; i < NIVELES.length; i++) if (xp >= NIVELES[i]) level = i + 1;
  return { level, levelXp: NIVELES[level - 1], nextXp: NIVELES[level] ?? null };
}

export async function progresoDe(playerId: number): Promise<Progreso> {
  const [stats, ratings, rachas, sorpresa] = await Promise.all([
    one<{
      titulos: number;
      titulos_2010: number;
      podios: number;
      lobbies_ganados: number;
      max_bajas: number;
      verificado: boolean;
    }>(
      `WITH mios AS (
         SELECT rs.position, t.is_archive
           FROM results rs JOIN tournaments t ON t.id = rs.tournament_id
          WHERE rs.player_id = $1
             OR rs.team_id IN (SELECT team_id FROM team_players WHERE player_id = $1)
       ),
       lados AS (
         SELECT ms.* FROM match_sides ms JOIN matches m ON m.id = ms.match_id AND m.kind = 'lobby'
          WHERE ms.player_id = $1 OR ms.team_id IN (SELECT team_id FROM team_players WHERE player_id = $1)
       )
       SELECT
         (SELECT COUNT(*) FROM mios WHERE position = 1 AND NOT is_archive)::int AS titulos,
         (SELECT COUNT(*) FROM mios WHERE position = 1 AND is_archive)::int AS titulos_2010,
         (SELECT COUNT(*) FROM mios WHERE position <= 3 AND NOT is_archive)::int AS podios,
         (SELECT COUNT(*) FROM lados WHERE placement = 1)::int AS lobbies_ganados,
         COALESCE((SELECT MAX(kills) FROM lados), 0)::int AS max_bajas,
         (SELECT discord_id IS NOT NULL FROM players WHERE id = $1) AS verificado`,
      [playerId],
    ),
    q<{ display: number; matches: number; wins: number; position: number }>(
      `SELECT r.display, r.matches, r.wins,
              (SELECT COUNT(*) + 1 FROM ratings r2 WHERE r2.game_id = r.game_id AND r2.display > r.display)::int AS position
         FROM ratings r WHERE r.player_id = $1`,
      [playerId],
    ),
    q<{ placement: number; game_id: number }>(
      `SELECT ms.placement, m.game_id FROM match_sides ms
         JOIN matches m ON m.id = ms.match_id AND m.kind = 'duel'
        WHERE ms.player_id = $1 ORDER BY m.game_id, m.played_at, m.id`,
      [playerId],
    ),
    one<{ n: number }>(
      `WITH h AS (
         SELECT rh.player_id, rh.match_id,
                COALESCE(LAG(rh.display) OVER (PARTITION BY rh.player_id, rh.game_id ORDER BY rh.played_at, rh.match_id), 1000) AS antes
           FROM rating_history rh
       )
       SELECT COUNT(*)::int AS n
         FROM match_sides w
         JOIN matches m ON m.id = w.match_id AND m.kind = 'duel'
         JOIN match_sides l ON l.match_id = w.match_id AND l.placement = 2
         JOIN h hw ON hw.match_id = m.id AND hw.player_id = w.player_id
         JOIN h hl ON hl.match_id = m.id AND hl.player_id = l.player_id
        WHERE w.player_id = $1 AND w.placement = 1 AND hl.antes - hw.antes >= 100`,
      [playerId],
    ),
  ]);

  // Racha mas larga de duelos ganados seguidos, en cualquier juego.
  let mejor = 0;
  let actual = 0;
  let juego = -1;
  for (const r of rachas) {
    if (r.game_id !== juego) {
      juego = r.game_id;
      actual = 0;
    }
    actual = r.placement === 1 ? actual + 1 : 0;
    mejor = Math.max(mejor, actual);
  }

  const partidas = ratings.reduce((s, r) => s + r.matches, 0);
  const victorias = ratings.reduce((s, r) => s + r.wins, 0);
  const s = stats!;

  const cuenta: Record<string, number> = {
    campeon: s.titulos,
    "numero-uno": ratings.filter((r) => r.position === 1).length,
    "leyenda-2010": s.titulos_2010,
    podio: s.podios,
    "top-10": ratings.filter((r) => r.position <= 10).length,
    matagigantes: sorpresa?.n ?? 0,
    "en-llamas": mejor >= 3 ? 1 : 0,
    "rey-del-lobby": s.lobbies_ganados,
    "lluvia-de-bajas": s.max_bajas >= 10 ? 1 : 0,
    todoterreno: ratings.length >= 2 ? 1 : 0,
    debut: partidas > 0 || s.titulos_2010 > 0 ? 1 : 0,
    verificado: s.verificado ? 1 : 0,
  };

  const earned = BADGES.filter((b) => cuenta[b.id] > 0).map((b) => ({ ...b, count: cuenta[b.id] }));
  const locked = BADGES.filter((b) => !cuenta[b.id]);
  const xp = partidas * 10 + victorias * 20 + earned.reduce((t, b) => t + b.xp, 0);

  return { earned, locked, xp, ...nivelDe(xp) };
}
