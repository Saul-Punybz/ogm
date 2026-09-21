/**
 * Crea las tablas, carga los datos de arranque y calcula el ranking.
 * Es seguro correrlo las veces que haga falta: borra y vuelve a cargar.
 *
 *   npm run setup             borra y recarga todo (desarrollo)
 *   npm run setup -- --if-empty   solo aplica el esquema; carga datos si la base
 *                                 esta vacia. Es lo que corre en cada build de
 *                                 Vercel: un deploy nunca borra datos reales.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getDb, q } from "../lib/db";
import { recalcRatings } from "../lib/rating";
import { games, players, teams, seasons, tournaments, perfiles, equipos } from "../data/seed";

async function main() {
  const db = await getDb();
  console.log(`Base de datos: ${db.kind === "pglite" ? "PGlite local (.data/)" : "Postgres remoto"}`);

  const schema = await readFile(resolve(process.cwd(), "scripts/schema.sql"), "utf8");
  await db.exec(schema);
  console.log("Tablas listas.");

  if (process.argv.includes("--if-empty")) {
    const [{ n }] = await q<{ n: number }>(`SELECT COUNT(*)::int AS n FROM games`);
    if (n > 0) {
      console.log(`La base ya tiene datos (${n} juegos): no se toca.`);
      process.exit(0);
    }
    console.log("Base vacía: cargando los datos de arranque.");
  }

  // Orden inverso a las dependencias.
  for (const table of [
    "game_votes",
    "profile_claims",
    "rating_history",
    "ratings",
    "results",
    "match_sides",
    "matches",
    "tournaments",
    "seasons",
    "team_players",
    "teams",
    "players",
    "games",
  ]) {
    await q(`DELETE FROM ${table}`);
  }

  const gameId = new Map<string, number>();
  for (const g of games) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO games (slug, name, short_name, mode, team_size, platform, is_mobile, is_active, sort_order, stage, tagline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [g.slug, g.name, g.short_name, g.mode, g.team_size, g.platform, g.is_mobile, g.stage !== "archivo", g.sort_order, g.stage, g.tagline ?? null],
    );
    gameId.set(g.slug, row.id);
  }

  const playerId = new Map<string, number>();
  for (const p of players) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO players (tag, full_name, town, is_example) VALUES ($1,$2,$3,$4) RETURNING id`,
      [p.tag, p.full_name ?? null, p.town ?? null, p.is_example],
    );
    playerId.set(p.tag, row.id);
  }

  const teamId = new Map<string, number>();
  for (const t of teams) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO teams (slug, name, game_id, town, is_example) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [t.slug, t.name, gameId.get(t.game) ?? null, t.town ?? null, t.is_example],
    );
    teamId.set(t.slug, row.id);
    for (const tag of t.roster) {
      await q(`INSERT INTO team_players (team_id, player_id) VALUES ($1,$2)`, [
        row.id,
        playerId.get(tag),
      ]);
    }
  }

  // Perfiles detallados de ejemplo (bio, redes, mazo o rol, dispositivo).
  for (const [tag, p] of Object.entries(perfiles)) {
    await q(
      `UPDATE players SET full_name = COALESCE($2, full_name), bio = $3, main = $4, device = $5,
              twitch = $6, tiktok = $7, instagram = $8, youtube = $9
        WHERE tag = $1`,
      [tag, p.full_name ?? null, p.bio, p.main ?? null, p.device ?? null, p.twitch ?? null,
       p.tiktok ?? null, p.instagram ?? null, p.youtube ?? null],
    );
  }
  for (const [slug, e] of Object.entries(equipos)) {
    await q(`UPDATE teams SET bio = $2, captain_id = $3 WHERE slug = $1`, [
      slug,
      e.bio,
      e.captain ? (playerId.get(e.captain) ?? null) : null,
    ]);
  }

  const seasonId = new Map<string, number>();
  for (const s of seasons) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO seasons (slug, name, game_id, starts_on, ends_on, is_current)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [s.slug, s.name, gameId.get(s.game) ?? null, s.starts_on, s.ends_on, s.is_current],
    );
    seasonId.set(s.slug, row.id);
  }

  for (const t of tournaments) {
    const gid = gameId.get(t.game)!;
    const [tour] = await q<{ id: number }>(
      `INSERT INTO tournaments (slug, name, game_id, season_id, starts_at, venue, format, summary, status, is_archive, is_example)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [
        t.slug,
        t.name,
        gid,
        t.season ? (seasonId.get(t.season) ?? null) : null,
        t.starts_at,
        t.venue,
        t.format,
        t.summary ?? null,
        t.status,
        t.is_archive,
        t.is_example,
      ],
    );

    for (const m of t.matches) {
      const [match] = await q<{ id: number }>(
        `INSERT INTO matches (tournament_id, game_id, kind, round, played_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [tour.id, gid, m.kind, m.round, m.played_at],
      );
      for (const side of m.sides) {
        await q(
          `INSERT INTO match_sides (match_id, player_id, team_id, placement, score, kills)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            match.id,
            side.player ? playerId.get(side.player) : null,
            side.team ? teamId.get(side.team) : null,
            side.placement,
            side.score ?? null,
            side.kills ?? null,
          ],
        );
      }
    }

    for (const r of t.results) {
      await q(
        `INSERT INTO results (tournament_id, position, player_id, team_id, points) VALUES ($1,$2,$3,$4,$5)`,
        [
          tour.id,
          r.position,
          r.player ? playerId.get(r.player) : null,
          r.team ? teamId.get(r.team) : null,
          r.points,
        ],
      );
    }
  }

  console.log(
    `Cargado: ${games.length} juegos, ${players.length} jugadores, ${teams.length} equipos, ${tournaments.length} torneos.`,
  );

  const { players: rated, matches } = await recalcRatings();
  console.log(`Ranking calculado: ${rated} jugadores con rating, ${matches} partidos contados.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
