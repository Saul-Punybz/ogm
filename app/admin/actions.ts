"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/lib/db";
import { recalcRatings } from "@/lib/rating";
import { isAdmin, signIn, signOut } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Hay que entrar al panel primero.");
}

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const ok = await signIn(String(form.get("password") ?? ""));
  if (!ok) return "Clave incorrecta.";
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await signOut();
  redirect("/admin");
}

export async function crearTorneo(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();

  const name = String(form.get("name") ?? "").trim();
  const gameSlug = String(form.get("game") ?? "");
  const startsAt = String(form.get("starts_at") ?? "");
  if (!name || !gameSlug || !startsAt) return "Faltan nombre, juego o fecha.";

  const game = await one<{ id: number }>(`SELECT id FROM games WHERE slug = $1`, [gameSlug]);
  if (!game) return "Ese juego no existe.";

  const slug = slugify(String(form.get("slug") || name));
  const existe = await one(`SELECT 1 FROM tournaments WHERE slug = $1`, [slug]);
  if (existe) return `Ya hay un torneo con la dirección "${slug}".`;

  await q(
    `INSERT INTO tournaments (slug, name, game_id, starts_at, venue, format, summary, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      slug,
      name,
      game.id,
      new Date(startsAt).toISOString(),
      String(form.get("venue") ?? "En línea"),
      String(form.get("format") ?? ""),
      String(form.get("summary") ?? "") || null,
      String(form.get("status") ?? "anunciado"),
    ],
  );

  revalidatePath("/torneos");
  revalidatePath("/");
  redirect(`/admin/torneos/${slug}`);
}

/** Resuelve "equipo-slug" o "TagDeJugador" a ids. */
async function resolver(token: string, gameId: number) {
  const clean = token.trim();
  if (!clean) return null;
  const team = await one<{ id: number }>(
    `SELECT id FROM teams WHERE slug = $1 OR LOWER(name) = LOWER($1)`,
    [clean],
  );
  if (team) return { team_id: team.id, player_id: null };
  const player = await one<{ id: number }>(`SELECT id FROM players WHERE LOWER(tag) = LOWER($1)`, [
    clean,
  ]);
  if (player) return { team_id: null, player_id: player.id };
  // Si no existe, lo creamos como jugador: entrar resultados no puede trabarse
  // porque a alguien se le olvido registrarse antes.
  const [nuevo] = await q<{ id: number }>(
    `INSERT INTO players (tag) VALUES ($1) RETURNING id`,
    [clean],
  );
  void gameId;
  return { team_id: null, player_id: nuevo.id };
}

/**
 * Un lobby por llamada. Una linea por escuadra, en orden de llegada:
 *   los-glok-ff, 12
 *   team-madness-ff, 9
 */
export async function agregarLobby(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();

  const slug = String(form.get("tournament") ?? "");
  const round = String(form.get("round") ?? "Lobby").trim() || "Lobby";
  const lineas = String(form.get("sides") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lineas.length < 2) return "Hacen falta por lo menos dos escuadras.";

  const t = await one<{ id: number; game_id: number; starts_at: string }>(
    `SELECT id, game_id, starts_at::text AS starts_at FROM tournaments WHERE slug = $1`,
    [slug],
  );
  if (!t) return "Torneo no encontrado.";

  const [match] = await q<{ id: number }>(
    `INSERT INTO matches (tournament_id, game_id, kind, round, played_at)
     VALUES ($1,$2,'lobby',$3,$4) RETURNING id`,
    [t.id, t.game_id, round, t.starts_at],
  );

  let placement = 0;
  for (const linea of lineas) {
    placement += 1;
    const [nombre, bajas] = linea.split(",").map((s) => s.trim());
    const ref = await resolver(nombre, t.game_id);
    if (!ref) continue;
    await q(
      `INSERT INTO match_sides (match_id, player_id, team_id, placement, kills)
       VALUES ($1,$2,$3,$4,$5)`,
      [match.id, ref.player_id, ref.team_id, placement, bajas ? Number(bajas) : null],
    );
  }

  await recalcRatings();
  revalidatePath(`/torneos/${slug}`);
  revalidatePath("/");
  return `Lobby "${round}" guardado con ${lineas.length} escuadras. Ranking recalculado.`;
}

/** Una partida de duelo: ganador, perdedor y marcador. */
export async function agregarDuelo(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();

  const slug = String(form.get("tournament") ?? "");
  const ganador = String(form.get("winner") ?? "").trim();
  const perdedor = String(form.get("loser") ?? "").trim();
  if (!ganador || !perdedor) return "Faltan los dos jugadores.";
  if (ganador.toLowerCase() === perdedor.toLowerCase()) return "No puede pelear contra sí mismo.";

  const t = await one<{ id: number; game_id: number; starts_at: string }>(
    `SELECT id, game_id, starts_at::text AS starts_at FROM tournaments WHERE slug = $1`,
    [slug],
  );
  if (!t) return "Torneo no encontrado.";

  const [match] = await q<{ id: number }>(
    `INSERT INTO matches (tournament_id, game_id, kind, round, played_at)
     VALUES ($1,$2,'duel',$3,$4) RETURNING id`,
    [t.id, t.game_id, String(form.get("round") ?? "").trim() || null, t.starts_at],
  );

  const w = await resolver(ganador, t.game_id);
  const l = await resolver(perdedor, t.game_id);
  await q(
    `INSERT INTO match_sides (match_id, player_id, team_id, placement, score) VALUES ($1,$2,$3,1,$4)`,
    [match.id, w?.player_id ?? null, w?.team_id ?? null, Number(form.get("winner_score") ?? 0)],
  );
  await q(
    `INSERT INTO match_sides (match_id, player_id, team_id, placement, score) VALUES ($1,$2,$3,2,$4)`,
    [match.id, l?.player_id ?? null, l?.team_id ?? null, Number(form.get("loser_score") ?? 0)],
  );

  await recalcRatings();
  revalidatePath(`/torneos/${slug}`);
  revalidatePath("/");
  return `Partida guardada: ${ganador} sobre ${perdedor}. Ranking recalculado.`;
}

/**
 * Tabla final. Una linea por puesto, en orden:
 *   los-glok-ff, 62
 */
export async function publicarTabla(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();

  const slug = String(form.get("tournament") ?? "");
  const lineas = String(form.get("standings") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lineas.length === 0) return "La tabla está vacía.";

  const t = await one<{ id: number; game_id: number }>(
    `SELECT id, game_id FROM tournaments WHERE slug = $1`,
    [slug],
  );
  if (!t) return "Torneo no encontrado.";

  await q(`DELETE FROM results WHERE tournament_id = $1`, [t.id]);

  let position = 0;
  for (const linea of lineas) {
    position += 1;
    const [nombre, puntos] = linea.split(",").map((s) => s.trim());
    const ref = await resolver(nombre, t.game_id);
    if (!ref) continue;
    await q(
      `INSERT INTO results (tournament_id, position, player_id, team_id, points)
       VALUES ($1,$2,$3,$4,$5)`,
      [t.id, position, ref.player_id, ref.team_id, puntos ? Number(puntos) : 0],
    );
  }

  await q(`UPDATE tournaments SET status = 'finalizado' WHERE id = $1`, [t.id]);
  revalidatePath(`/torneos/${slug}`);
  revalidatePath("/campeones");
  revalidatePath("/");
  return `Tabla publicada con ${lineas.length} puestos. El torneo quedo finalizado.`;
}

export async function recalcular(): Promise<void> {
  await requireAdmin();
  await recalcRatings();
  revalidatePath("/");
  revalidatePath("/juegos");
}
