import { cookies } from "next/headers";

const COOKIE = "ogm_admin";

/**
 * Autenticacion minima para la v1: una clave compartida en ADMIN_PASSWORD.
 * Cuando entre el login con Discord, esto se reemplaza por roles de verdad.
 */
export async function isAdmin(): Promise<boolean> {
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
