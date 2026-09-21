/**
 * El motor de ranking.
 *
 * Usa OpenSkill (licencia MIT, uso comercial libre) porque maneja los tres
 * formatos con el mismo modelo: duelo 1v1, escuadra contra escuadra y lobby de
 * battle royale con varias escuadras ordenadas por colocacion. Un lobby de Free
 * Fire con 6 escuadras es un solo "match" con 6 lados.
 *
 * El rating se recalcula desde cero replayando todos los partidos en orden.
 * Es deterministico: mismos partidos, mismo resultado, siempre.
 */

import { rate, rating, ordinal, type Rating } from "openskill";
import { q } from "./db";

/** Todo el mundo empieza en 1000. Cada punto de ordinal vale 40. */
export function toDisplay(r: Rating): number {
  return Math.round(1000 + ordinal(r) * 40);
}

export interface SideInput {
  playerIds: number[];
  placement: number;
}

export interface MatchInput {
  id: number;
  gameId: number;
  kind: "duel" | "lobby";
  playedAt: string;
  sides: SideInput[];
}

export interface PlayerRating {
  gameId: number;
  playerId: number;
  mu: number;
  sigma: number;
  ordinal: number;
  display: number;
  matches: number;
  wins: number;
  losses: number;
  podiums: number;
}

export interface HistoryPoint {
  gameId: number;
  playerId: number;
  matchId: number;
  display: number;
  playedAt: string;
}

/**
 * Funcion pura: partidos entran, ratings salen. Sin base de datos de por medio,
 * para poder probarla sola.
 */
export function computeRatings(matches: MatchInput[]): {
  ratings: PlayerRating[];
  history: HistoryPoint[];
} {
  const current = new Map<string, Rating>();
  const stats = new Map<string, Omit<PlayerRating, "mu" | "sigma" | "ordinal" | "display">>();
  const history: HistoryPoint[] = [];

  const key = (gameId: number, playerId: number) => `${gameId}:${playerId}`;

  const ordered = [...matches].sort((a, b) => {
    const t = a.playedAt.localeCompare(b.playedAt);
    return t !== 0 ? t : a.id - b.id;
  });

  for (const match of ordered) {
    const sides = [...match.sides].sort((a, b) => a.placement - b.placement);
    const usable = sides.filter((s) => s.playerIds.length > 0);
    if (usable.length < 2) continue;

    const teams = usable.map((side) =>
      side.playerIds.map((pid) => current.get(key(match.gameId, pid)) ?? rating()),
    );
    const ranks = usable.map((side) => side.placement);

    const updated = rate(teams, { rank: ranks });

    usable.forEach((side, sideIndex) => {
      side.playerIds.forEach((pid, playerIndex) => {
        const k = key(match.gameId, pid);
        const next = updated[sideIndex][playerIndex];
        current.set(k, next);

        const s = stats.get(k) ?? {
          gameId: match.gameId,
          playerId: pid,
          matches: 0,
          wins: 0,
          losses: 0,
          podiums: 0,
        };
        s.matches += 1;
        if (side.placement === 1) s.wins += 1;
        if (side.placement <= 3) s.podiums += 1;
        // En un duelo, todo lo que no es ganar es perder. En un lobby de battle
        // royale no tiene sentido llamar derrota a un cuarto lugar entre doce.
        if (match.kind === "duel" && side.placement > 1) s.losses += 1;
        stats.set(k, s);

        history.push({
          gameId: match.gameId,
          playerId: pid,
          matchId: match.id,
          display: toDisplay(next),
          playedAt: match.playedAt,
        });
      });
    });
  }

  const ratings: PlayerRating[] = [];
  for (const [k, r] of current) {
    const s = stats.get(k)!;
    ratings.push({
      ...s,
      mu: r.mu,
      sigma: r.sigma,
      ordinal: ordinal(r),
      display: toDisplay(r),
    });
  }

  return { ratings, history };
}

/** Lee los partidos de la base, recalcula todo y lo guarda. */
export async function recalcRatings(): Promise<{ players: number; matches: number }> {
  const matchRows = await q<{
    id: number;
    game_id: number;
    kind: "duel" | "lobby";
    played_at: string;
  }>(
    `SELECT id, game_id, kind, played_at::text AS played_at
       FROM matches
      WHERE counts_rating = TRUE
      ORDER BY played_at, id`,
  );

  const sideRows = await q<{
    match_id: number;
    placement: number;
    player_id: number | null;
    team_id: number | null;
  }>(
    `SELECT ms.match_id, ms.placement, ms.player_id, ms.team_id
       FROM match_sides ms
       JOIN matches m ON m.id = ms.match_id
      WHERE m.counts_rating = TRUE
      ORDER BY ms.match_id, ms.placement`,
  );

  const rosterRows = await q<{ team_id: number; player_id: number }>(
    `SELECT team_id, player_id FROM team_players`,
  );
  const roster = new Map<number, number[]>();
  for (const r of rosterRows) {
    const list = roster.get(r.team_id) ?? [];
    list.push(r.player_id);
    roster.set(r.team_id, list);
  }

  const sidesByMatch = new Map<number, SideInput[]>();
  for (const s of sideRows) {
    const playerIds = s.player_id != null ? [s.player_id] : (roster.get(s.team_id!) ?? []);
    const list = sidesByMatch.get(s.match_id) ?? [];
    list.push({ playerIds, placement: s.placement });
    sidesByMatch.set(s.match_id, list);
  }

  const matches: MatchInput[] = matchRows.map((m) => ({
    id: m.id,
    gameId: m.game_id,
    kind: m.kind,
    playedAt: m.played_at,
    sides: sidesByMatch.get(m.id) ?? [],
  }));

  const { ratings, history } = computeRatings(matches);

  await q(`DELETE FROM rating_history`);
  await q(`DELETE FROM ratings`);

  for (const r of ratings) {
    await q(
      `INSERT INTO ratings (game_id, player_id, mu, sigma, ordinal, display, matches, wins, losses, podiums, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())`,
      [
        r.gameId,
        r.playerId,
        r.mu,
        r.sigma,
        r.ordinal,
        r.display,
        r.matches,
        r.wins,
        r.losses,
        r.podiums,
      ],
    );
  }

  for (const h of history) {
    await q(
      `INSERT INTO rating_history (game_id, player_id, match_id, display, played_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [h.gameId, h.playerId, h.matchId, h.display, h.playedAt],
    );
  }

  return { players: ratings.length, matches: matches.length };
}
