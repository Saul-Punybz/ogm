/**
 * Sesion de usuario: un JWT firmado en una cookie httpOnly. Sin tabla de
 * sesiones — el token lleva quien eres y se verifica en cada request.
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "ogm_session";
const DURACION = 60 * 60 * 24 * 30; // 30 dias

export interface Session {
  discordId: string;
  name: string;
  avatar: string | null;
}

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Falta AUTH_SECRET. Genera uno con `openssl rand -base64 32`.");
    }
    // Solo en desarrollo: las sesiones locales no importan si se invalidan.
    return new TextEncoder().encode("ogm-dev-secret-no-usar-en-produccion");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(s: Session): Promise<string> {
  return new SignJWT({ name: s.name, avatar: s.avatar })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.discordId)
    .setIssuedAt()
    .setExpirationTime(`${DURACION}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      discordId: payload.sub,
      name: String(payload.name ?? ""),
      avatar: (payload.avatar as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function setSession(s: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, await signSession(s), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: DURACION,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
