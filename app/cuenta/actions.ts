"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/lib/db";
import { getSession, clearSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

const TAG_VALIDO = /^[A-Za-z0-9_.\-]{2,24}$/;

async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("Hay que entrar con Discord primero.");
  return s;
}

async function yaTienePerfil(discordId: string) {
  return one(`SELECT 1 FROM players WHERE discord_id = $1`, [discordId]);
}

/** Crear un perfil nuevo: inmediato, no le quita nada a nadie. */
export async function crearPerfil(_prev: string | null, form: FormData): Promise<string | null> {
  const s = await requireSession();
  if (await yaTienePerfil(s.discordId)) return "Tu cuenta ya tiene un perfil.";

  const tag = String(form.get("tag") ?? "").trim();
  if (!TAG_VALIDO.test(tag)) {
    return "El gamertag debe tener de 2 a 24 caracteres: letras, números, punto, guion o guion bajo.";
  }
  const existe = await one(`SELECT 1 FROM players WHERE LOWER(tag) = LOWER($1)`, [tag]);
  if (existe) return `"${tag}" ya existe. Si es tuyo, reclámalo en vez de crearlo.`;

  await q(
    `INSERT INTO players (tag, town, discord_id, avatar_url, discord) VALUES ($1,$2,$3,$4,$5)`,
    [tag, String(form.get("town") ?? "").trim() || null, s.discordId, s.avatar, s.name],
  );
  revalidatePath("/cuenta");
  redirect("/cuenta");
}

/**
 * Reclamar un perfil que ya existe. Si no tiene partidas ni resultados, se
 * enlaza de una vez. Si tiene historial, queda pendiente de aprobacion.
 */
export async function reclamarPerfil(_prev: string | null, form: FormData): Promise<string | null> {
  const s = await requireSession();
  if (await yaTienePerfil(s.discordId)) return "Tu cuenta ya tiene un perfil.";

  const tag = String(form.get("tag") ?? "").trim();
  const player = await one<{ id: number; tag: string; discord_id: string | null }>(
    `SELECT id, tag, discord_id FROM players WHERE LOWER(tag) = LOWER($1)`,
    [tag],
  );
  if (!player) return `No hay ningún perfil "${tag}". Puedes crearlo.`;
  if (player.discord_id) return `"${player.tag}" ya está enlazado a otra cuenta.`;

  const pendiente = await one(
    `SELECT 1 FROM profile_claims WHERE player_id = $1 AND discord_id = $2 AND status = 'pendiente'`,
    [player.id, s.discordId],
  );
  if (pendiente) return "Ya tienes un reclamo pendiente para ese perfil.";

  const historial = await one<{ n: number }>(
    `SELECT (
       (SELECT COUNT(*) FROM match_sides WHERE player_id = $1) +
       (SELECT COUNT(*) FROM results WHERE player_id = $1) +
       (SELECT COUNT(*) FROM team_players WHERE player_id = $1)
     )::int AS n`,
    [player.id],
  );

  if (!historial || historial.n === 0) {
    await q(`UPDATE players SET discord_id = $2, avatar_url = $3, discord = $4 WHERE id = $1`, [
      player.id,
      s.discordId,
      s.avatar,
      s.name,
    ]);
    revalidatePath("/cuenta");
    redirect("/cuenta");
  }

  await q(
    `INSERT INTO profile_claims (player_id, discord_id, discord_name, avatar_url) VALUES ($1,$2,$3,$4)`,
    [player.id, s.discordId, s.name, s.avatar],
  );
  revalidatePath("/cuenta");
  return `"${player.tag}" tiene historial en la liga, así que un admin tiene que confirmar que eres tú. Te avisamos por Discord.`;
}

export async function actualizarPerfil(_prev: string | null, form: FormData): Promise<string | null> {
  const s = await requireSession();
  const limpio = (k: string) => String(form.get(k) ?? "").trim().replace(/^@/, "") || null;
  const res = await q<{ tag: string }>(
    `UPDATE players SET town = $2, twitch = $3, tiktok = $4 WHERE discord_id = $1 RETURNING tag`,
    [s.discordId, limpio("town"), limpio("twitch"), limpio("tiktok")],
  );
  if (res.length === 0) return "Tu cuenta no tiene perfil todavía.";
  revalidatePath("/cuenta");
  revalidatePath(`/jugadores/${encodeURIComponent(res[0].tag)}`);
  return "Perfil actualizado.";
}

export async function salir(): Promise<void> {
  await clearSession();
  redirect("/");
}

/** Admin: aprobar o rechazar un reclamo de perfil. */
export async function resolverReclamo(form: FormData): Promise<void> {
  if (!(await isAdmin())) throw new Error("Solo admins.");
  const id = Number(form.get("id"));
  const decision = form.get("decision") === "aprobar" ? "aprobado" : "rechazado";

  const claim = await one<{ player_id: number; discord_id: string; discord_name: string; avatar_url: string | null }>(
    `SELECT player_id, discord_id, discord_name, avatar_url FROM profile_claims WHERE id = $1 AND status = 'pendiente'`,
    [id],
  );
  if (!claim) return;

  if (decision === "aprobado") {
    const ocupado = await one(`SELECT 1 FROM players WHERE discord_id = $1`, [claim.discord_id]);
    if (ocupado) {
      await q(`UPDATE profile_claims SET status = 'rechazado' WHERE id = $1`, [id]);
      revalidatePath("/admin");
      return;
    }
    await q(`UPDATE players SET discord_id = $2, avatar_url = $3, discord = $4 WHERE id = $1`, [
      claim.player_id,
      claim.discord_id,
      claim.avatar_url,
      claim.discord_name,
    ]);
    // Los demas reclamos al mismo perfil quedan rechazados.
    await q(
      `UPDATE profile_claims SET status = 'rechazado' WHERE player_id = $1 AND id <> $2 AND status = 'pendiente'`,
      [claim.player_id, id],
    );
  }
  await q(`UPDATE profile_claims SET status = $2 WHERE id = $1`, [id, decision]);
  revalidatePath("/admin");
}
