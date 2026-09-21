import { notFound, redirect } from "next/navigation";
import { setSession } from "@/lib/session";

/**
 * SOLO DESARROLLO: entra con una cuenta falsa para probar el flujo sin tener
 * la app de Discord creada. En produccion esta ruta no existe (404).
 *   /api/auth/dev?name=Prueba
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") notFound();
  const name = new URL(request.url).searchParams.get("name") ?? "Prueba";
  await setSession({ discordId: `dev-${name.toLowerCase()}`, name, avatar: null });
  redirect("/cuenta");
}
