/**
 * Lo mas transmitido en Twitch, agrupado por plataforma.
 *
 *   1. Token de aplicacion (client credentials) con TWITCH_CLIENT_ID/SECRET.
 *   2. Helix /games/top: los juegos con mas espectadores ahora, con portada.
 *   3. IGDB /v4/games: en que plataformas sale cada juego. IGDB es de Twitch y
 *      acepta el mismo token; Helix trae el igdb_id de cada juego.
 *
 * Todo se guarda 10 minutos en memoria: el ranking no cambia tan rapido y asi
 * no se le pega a Twitch en cada visita.
 */

import { plataformasDe } from "./platforms";

const TTL = 10 * 60 * 1000;

export function twitchConfigured(): boolean {
  return Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

let token: { value: string; expires: number } | null = null;

async function appToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const body = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    client_secret: process.env.TWITCH_CLIENT_SECRET!,
    grant_type: "client_credentials",
  });
  const res = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", body, cache: "no-store" });
  if (!res.ok) throw new Error(`Twitch token: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return token.value;
}

async function headers() {
  return {
    "Client-Id": process.env.TWITCH_CLIENT_ID!,
    Authorization: `Bearer ${await appToken()}`,
  };
}

export interface TopGame {
  rank: number;
  id: string;
  name: string;
  boxArt: string;
  url: string;
  plataformas: string[];
}

interface HelixGame {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
}

let cache: { at: number; games: TopGame[] } | null = null;

export async function topStreamedGames(): Promise<TopGame[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.games;

  const h = await headers();
  const res = await fetch("https://api.twitch.tv/helix/games/top?first=100", { headers: h, cache: "no-store" });
  if (!res.ok) throw new Error(`Twitch games/top: ${res.status}`);
  const helix = ((await res.json()) as { data: HelixGame[] }).data;

  // Categorias como "Just Chatting" no son juegos: no tienen igdb_id.
  const juegos = helix.filter((g) => g.igdb_id);
  const ids = juegos.map((g) => Number(g.igdb_id)).filter(Boolean);

  const porIgdb = new Map<number, string[]>();
  if (ids.length > 0) {
    const igdb = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: { ...h, "Content-Type": "text/plain" },
      body: `fields id,platforms.name; where id = (${ids.join(",")}); limit 500;`,
      cache: "no-store",
    });
    if (!igdb.ok) throw new Error(`IGDB games: ${igdb.status}`);
    const rows = (await igdb.json()) as { id: number; platforms?: { name: string }[] }[];
    for (const r of rows) porIgdb.set(r.id, (r.platforms ?? []).map((p) => p.name));
  }

  const games: TopGame[] = juegos.map((g, i) => ({
    rank: i + 1,
    id: g.id,
    name: g.name,
    boxArt: g.box_art_url.replace("{width}", "285").replace("{height}", "380"),
    url: `https://www.twitch.tv/directory/category/${encodeURIComponent(
      g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    )}`,
    plataformas: plataformasDe(porIgdb.get(Number(g.igdb_id)) ?? []),
  }));

  cache = { at: Date.now(), games };
  return games;
}
