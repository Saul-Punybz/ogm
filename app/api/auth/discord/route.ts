import { generateState } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { discordClient, discordConfigured } from "@/lib/discord";

/** Paso 1: mandar al usuario a Discord a autorizar. */
export async function GET() {
  if (!discordConfigured()) redirect("/cuenta?error=config");

  const state = generateState();
  const url = discordClient().createAuthorizationURL(state, null, ["identify"]);

  const store = await cookies();
  store.set("ogm_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === "production",
  });

  redirect(url.toString());
}
