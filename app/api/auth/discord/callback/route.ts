import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { discordClient, avatarUrl, type DiscordUser } from "@/lib/discord";
import { setSession } from "@/lib/session";
import { q } from "@/lib/db";

/** Paso 2: Discord regresa aqui con un codigo; se cambia por el usuario. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expected = store.get("ogm_oauth_state")?.value;
  store.delete("ogm_oauth_state");

  // El state protege contra que alguien te loguee con SU cuenta desde otro sitio.
  if (!code || !state || !expected || state !== expected) {
    redirect("/cuenta?error=estado");
  }

  let user: DiscordUser;
  try {
    const tokens = await discordClient().validateAuthorizationCode(code, null);
    const res = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    });
    if (!res.ok) throw new Error(`Discord respondio ${res.status}`);
    user = (await res.json()) as DiscordUser;
  } catch (err) {
    console.error("Login con Discord fallo:", err);
    redirect("/cuenta?error=discord");
  }

  const avatar = avatarUrl(user);
  // Si ya tiene perfil enlazado, se refresca la foto.
  await q(`UPDATE players SET avatar_url = $2 WHERE discord_id = $1`, [user.id, avatar]);

  await setSession({ discordId: user.id, name: user.global_name ?? user.username, avatar });
  redirect("/cuenta");
}
