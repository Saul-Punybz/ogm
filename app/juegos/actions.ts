"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/lib/db";
import { getSession } from "@/lib/session";

/** Un voto por cuenta de Discord. Votar otra vez cambia el voto, no lo suma. */
export async function votar(form: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/cuenta");

  const slug = String(form.get("game") ?? "");
  const game = await one<{ id: number }>(
    `SELECT id FROM games WHERE slug = $1 AND stage = 'votacion'`,
    [slug],
  );
  if (!game) return;

  await q(
    `INSERT INTO game_votes (discord_id, game_id) VALUES ($1, $2)
     ON CONFLICT (discord_id) DO UPDATE SET game_id = EXCLUDED.game_id, created_at = NOW()`,
    [session.discordId, game.id],
  );
  revalidatePath("/");
  revalidatePath("/juegos");
}
