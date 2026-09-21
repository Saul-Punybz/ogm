import Link from "next/link";
import { site } from "@/lib/site";
import { PLATAFORMAS } from "@/lib/platforms";
import { topStreamedGames, twitchConfigured, type TopGame } from "@/lib/twitch";
import { TwitchLive } from "@/components/twitch-live";
import { SceneStreams } from "@/components/scene-streams";
import { getGames } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "En vivo" };

function channelFromUrl(url: string | null) {
  return url?.match(/twitch\.tv\/([A-Za-z0-9_]+)/)?.[1] ?? null;
}

async function cargarTop(): Promise<{ games: TopGame[]; error: string | null }> {
  if (!twitchConfigured()) return { games: [], error: "sin-config" };
  try {
    return { games: await topStreamedGames(), error: null };
  } catch (err) {
    console.error("Top de Twitch fallo:", err);
    return { games: [], error: "fallo" };
  }
}

export default async function EnVivo({
  searchParams,
}: {
  searchParams: Promise<{ plataforma?: string }>;
}) {
  const { plataforma } = await searchParams;
  const activa = PLATAFORMAS.find((p) => p.slug === plataforma) ?? null;
  const channel = channelFromUrl(site.twitch);
  const discordId = process.env.OGM_DISCORD_SERVER_ID || null;
  const { games, error } = await cargarTop();
  const juegosLiga = await getGames();
  const nombres = Object.fromEntries(juegosLiga.map((g) => [g.slug, g.name]));
  const lista = (activa ? games.filter((g) => g.plataformas.includes(activa.slug)) : games).slice(0, 18);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Transmisiones</div>
        <h1>En vivo</h1>
        <p className="muted">
          Cada fecha de la liga se transmite con narración en español. Entra al chat, y únete al
          Discord para jugar la próxima.
        </p>
      </section>

      <section className="wrap stack" style={{ paddingBottom: 36 }}>
        {channel && site.twitch ? (
          <TwitchLive channel={channel} url={site.twitch} example={site.twitchExample} />
        ) : (
          <p className="note">Canal de Twitch por anunciar.</p>
        )}
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>La escena en vivo</h2>
          <p className="muted small">
            Las transmisiones oficiales de los juegos de la liga: la más reciente de cada canal, se
            actualiza sola cada hora.
          </p>
        </div>
        <SceneStreams
          juegos={["free-fire", "clash-royale", "brawlhalla", "cod-mobile", "stumble-guys"]}
          nombres={nombres}
          creadores
        />
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>La comunidad en Discord</h2>
          <p className="muted small">
            Ahí se arman las escuadras, se hacen los check-in y se anuncian los resultados.
          </p>
        </div>
        {discordId ? (
          <iframe
            title="Servidor de Discord de OGM"
            src={`https://discord.com/widget?id=${discordId}&theme=dark`}
            className="discord-widget"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        ) : site.discordInvite ? (
          <a href={site.discordInvite} className="btn" target="_blank" rel="noreferrer">
            Unirte al Discord
          </a>
        ) : (
          <p className="note">Servidor de Discord por anunciar.</p>
        )}
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>Lo más transmitido ahora</h2>
          <p className="muted small">
            Los juegos con más espectadores en Twitch en este momento, según su plataforma.
            Datos de Twitch e IGDB, se actualizan cada 10 minutos.
          </p>
        </div>

        <nav className="tabs" aria-label="Plataforma">
          <Link href="/en-vivo" className={!activa ? "tab tab-on" : "tab"}>
            Todas
          </Link>
          {PLATAFORMAS.map((p) => (
            <Link
              key={p.slug}
              href={`/en-vivo?plataforma=${p.slug}`}
              className={activa?.slug === p.slug ? "tab tab-on" : "tab"}
            >
              {p.name}
            </Link>
          ))}
        </nav>

        {error === "sin-config" ? (
          <p className="note">
            Se activa al conectar la app de Twitch (TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET).
          </p>
        ) : error ? (
          <p className="note">Twitch no respondió. Se vuelve a intentar en la próxima visita.</p>
        ) : lista.length === 0 ? (
          <p className="note">Ningún juego de esta plataforma entre los 100 más vistos ahora.</p>
        ) : (
          <div className="top-grid">
            {lista.map((g) => (
              <a key={g.id} href={g.url} target="_blank" rel="noreferrer" className="top-game">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.boxArt} alt="" loading="lazy" />
                <span className="top-rank num">#{g.rank}</span>
                <span className="top-name">{g.name}</span>
                <span className="top-plats">
                  {g.plataformas
                    .map((s) => PLATAFORMAS.find((p) => p.slug === s)?.name)
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
