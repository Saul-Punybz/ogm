/**
 * Contenido que se escribe solo: momentos de la liga sacados de los datos.
 * Nadie los redacta; salen del historial de rating y de las partidas.
 */

import { q, one } from "./db";

const VENTANA = "30 days";

/** Historial con el rating que tenia cada jugador ANTES de cada partida. */
const CON_ANTES = `
  WITH h AS (
    SELECT rh.player_id, rh.game_id, rh.match_id, rh.display, rh.played_at,
           COALESCE(LAG(rh.display) OVER (
             PARTITION BY rh.player_id, rh.game_id ORDER BY rh.played_at, rh.match_id
           ), 1000) AS antes
      FROM rating_history rh
  )`;

export interface Subida {
  tag: string;
  avatar_url: string | null;
  is_example: boolean;
  game_name: string;
  game_slug: string;
  delta: number;
  display: number;
}

/** La subida de rating mas grande de la ventana. */
export function jugadorDeLaSemana() {
  return one<Subida>(
    `${CON_ANTES}
     SELECT p.tag, p.avatar_url, p.is_example, g.name AS game_name, g.slug AS game_slug,
            SUM(h.display - h.antes)::int AS delta,
            (SELECT r.display FROM ratings r WHERE r.player_id = h.player_id AND r.game_id = h.game_id) AS display
       FROM h
       JOIN players p ON p.id = h.player_id
       JOIN games g ON g.id = h.game_id
      WHERE h.played_at >= NOW() - INTERVAL '${VENTANA}'
      GROUP BY h.player_id, h.game_id, p.tag, p.avatar_url, p.is_example, g.name, g.slug
      ORDER BY delta DESC, p.tag
      LIMIT 1`,
  );
}

export interface Sorpresa {
  winner: string;
  loser: string;
  winner_before: number;
  loser_before: number;
  game_name: string;
  tournament_name: string;
  tournament_slug: string;
  round: string | null;
}

/** El duelo donde el que gano venia mas abajo en el ranking. */
export function laSorpresa() {
  return one<Sorpresa>(
    `${CON_ANTES}
     SELECT pw.tag AS winner, pl.tag AS loser, hw.antes AS winner_before, hl.antes AS loser_before,
            g.name AS game_name, t.name AS tournament_name, t.slug AS tournament_slug, m.round
       FROM matches m
       JOIN match_sides w ON w.match_id = m.id AND w.placement = 1 AND w.player_id IS NOT NULL
       JOIN match_sides l ON l.match_id = m.id AND l.placement = 2 AND l.player_id IS NOT NULL
       JOIN h hw ON hw.match_id = m.id AND hw.player_id = w.player_id
       JOIN h hl ON hl.match_id = m.id AND hl.player_id = l.player_id
       JOIN players pw ON pw.id = w.player_id
       JOIN players pl ON pl.id = l.player_id
       JOIN games g ON g.id = m.game_id
       JOIN tournaments t ON t.id = m.tournament_id
      WHERE m.kind = 'duel'
        AND m.played_at >= NOW() - INTERVAL '${VENTANA}'
        AND hl.antes > hw.antes
      ORDER BY (hl.antes - hw.antes) DESC
      LIMIT 1`,
  );
}

export interface MasBajas {
  team_name: string | null;
  team_slug: string | null;
  player_tag: string | null;
  kills: number;
  round: string | null;
  tournament_name: string;
  tournament_slug: string;
  game_name: string;
}

/** Mas bajas en un solo lobby de battle royale. */
export function masBajas() {
  return one<MasBajas>(
    `SELECT tm.name AS team_name, tm.slug AS team_slug, p.tag AS player_tag, ms.kills,
            m.round, t.name AS tournament_name, t.slug AS tournament_slug, g.name AS game_name
       FROM match_sides ms
       JOIN matches m ON m.id = ms.match_id AND m.kind = 'lobby'
       JOIN tournaments t ON t.id = m.tournament_id
       JOIN games g ON g.id = m.game_id
       LEFT JOIN teams tm ON tm.id = ms.team_id
       LEFT JOIN players p ON p.id = ms.player_id
      WHERE ms.kills IS NOT NULL
        AND m.played_at >= NOW() - INTERVAL '${VENTANA}'
      ORDER BY ms.kills DESC, m.played_at DESC
      LIMIT 1`,
  );
}

export interface Racha {
  tag: string;
  avatar_url: string | null;
  is_example: boolean;
  game_name: string;
  wins: number;
}

/** La racha de victorias seguidas mas larga que sigue viva, en duelos. */
export async function mejorRacha(): Promise<Racha | null> {
  const rows = await q<{
    player_id: number;
    tag: string;
    avatar_url: string | null;
    is_example: boolean;
    game_name: string;
    game_id: number;
    placement: number;
  }>(
    `SELECT ms.player_id, p.tag, p.avatar_url, p.is_example, g.name AS game_name, g.id AS game_id, ms.placement
       FROM match_sides ms
       JOIN matches m ON m.id = ms.match_id AND m.kind = 'duel'
       JOIN players p ON p.id = ms.player_id
       JOIN games g ON g.id = m.game_id
      ORDER BY ms.player_id, g.id, m.played_at DESC, m.id DESC`,
  );

  let best: Racha | null = null;
  let key = "";
  let streak = 0;
  let alive = true;
  for (const r of rows) {
    const k = `${r.player_id}:${r.game_id}`;
    if (k !== key) {
      key = k;
      streak = 0;
      alive = true;
    }
    if (!alive) continue;
    if (r.placement === 1) {
      streak += 1;
      if (streak >= 2 && (!best || streak > best.wins)) {
        best = { tag: r.tag, avatar_url: r.avatar_url, is_example: r.is_example, game_name: r.game_name, wins: streak };
      }
    } else {
      alive = false;
    }
  }
  return best;
}

export async function getHighlights() {
  const [subida, sorpresa, bajas, racha] = await Promise.all([
    jugadorDeLaSemana(),
    laSorpresa(),
    masBajas(),
    mejorRacha(),
  ]);
  return { subida, sorpresa, bajas, racha };
}

/** Puntos del rating de un jugador en un juego, para la grafica del perfil. */
export function ratingHistory(playerId: number, gameId: number) {
  return q<{ display: number; played_at: string }>(
    `SELECT display, played_at::text AS played_at
       FROM rating_history
      WHERE player_id = $1 AND game_id = $2
      ORDER BY played_at, match_id`,
    [playerId, gameId],
  );
}
