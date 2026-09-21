import { cookies } from "next/headers";
import { getSession } from "./session";

const COOKIE = "ogm_admin";

/**
 * Acceso al panel: por cuenta de Discord (ADMIN_DISCORD_IDS) o por la clave
 * compartida ADMIN_PASSWORD mientras Discord no este configurado.
 */
export async function isAdmin(): Promise<boolean> {
  // Via 1: cuenta de Discord en la lista ADMIN_DISCORD_IDS.
  const session = await getSession();
  const admins = (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (session && admins.includes(session.discordId)) return true;

  // Via 2: la clave compartida, para cuando todavia no hay Discord configurado.
  const store = await cookies();
  const expected = process.env.ADMIN_PASSWORD ?? "ogm2026";
  return store.get(COOKIE)?.value === expected;
}

export async function signIn(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD ?? "ogm2026";
  if (password !== expected) return false;
  const store = await cookies();
  store.set(COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
