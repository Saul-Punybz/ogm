import Link from "next/link";
import { getGames, getRanking, getUpcoming, getChampions } from "@/lib/queries";
import { fecha } from "@/lib/format";
import { site } from "@/lib/site";
import { VoteBlock } from "@/components/vote";

export const dynamic = "force-dynamic";

const FORMATO: Record<string, string> = {
  br: "Battle royale",
  duel: "Uno contra uno",
  squad: "Equipo contra equipo",
};

export default async function Home() {
  const games = await getGames();
  const temporada = games.filter((g) => g.stage === "temporada");
  const [upcoming, champions, rankings] = await Promise.all([
    getUpcoming(3),
    getChampions(),
    Promise.all(temporada.map(async (g) => ({ game: g, rows: await getRanking(g.id, 5) }))),
  ]);
  const conRanking = rankings.filter((r) => r.rows.length > 0);
  const archive = champions.filter((c) => c.is_archive).slice(0, 3);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Liga de esports · Puerto Rico · Temporada 1</div>
        <h1>
          La liga se juega en el <em>celular</em>.
        </h1>
        <p className="muted">
          Free Fire, Clash Royale y Brawlhalla. Cada partida cuenta para tu ranking y cada
          campeonato se queda en tu perfil.
        </p>
        <div className="hero-actions">
          <Link href="/cuenta" className="btn">
            Crea tu perfil
          </Link>
          <Link href="/juegos" className="btn ghost">
            Ver el ranking
          </Link>
        </div>
        <div className="promise">
          <div>
            <b>Inscripción gratis</b>
            <span>Los premios los ponen los auspiciadores, no tu bolsillo.</span>
          </div>
          <div>
            <b>Tu teléfono alcanza</b>
            <span>Los tres juegos son gratis y corren en celulares de gama baja.</span>
          </div>
          <div>
            <b>Un ranking de verdad</b>
            <span>Rating por juego que se mueve con cada partida que juegas.</span>
          </div>
        </div>
      </section>

      <section className="section wrap stack">
        <h2>Temporada 1</h2>
        <div className="cards">
          {temporada.map((g) => (
            <Link key={g.slug} href={`/juegos/${g.slug}`} className="card game-card">
              <span className="format">
                {FORMATO[g.mode]}
                {g.team_size > 1 ? ` · escuadras de ${g.team_size}` : ""}
              </span>
              <h3>{g.name}</h3>
              <p className="small muted">{g.tagline}</p>
              <span className="small">Ver ranking →</span>
            </Link>
          ))}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="section wrap stack">
          <div className="row-between">
            <h2>Próximos torneos</h2>
            <Link href="/torneos" className="small muted">
              Calendario →
            </Link>
          </div>
          <div className="cards">
            {upcoming.map((t) => (
              <Link key={t.slug} href={`/torneos/${t.slug}`} className="card">
                <span className={t.status === "abierto" ? "pill pill-flare" : "pill"}>
                  {t.status === "abierto" ? "Inscripción abierta" : t.game_short}
                </span>
                <h3>{t.name}</h3>
                <p className="small muted">
                  {fecha(t.starts_at)} · {t.venue}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>¿Cuál es el cuarto juego?</h2>
          <p className="muted small">
            Lo decide la comunidad. Jugamos un torneo de prueba de cada candidato y el más votado
            entra a la temporada 2.
          </p>
        </div>
        <VoteBlock />
      </section>

      {conRanking.map(({ game, rows }) => (
        <section key={game.slug} className="section wrap stack">
          <div className="row-between">
            <h2>Ranking · {game.name}</h2>
            <Link href={`/juegos/${game.slug}`} className="small muted">
              Tabla completa →
            </Link>
          </div>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Jugador</th>
                  <th>{game.mode === "duel" ? "Pueblo" : "Escuadra"}</th>
                  <th className="right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.player_id}>
                    <td className={`pos ${i === 0 ? "pos-1" : ""}`}>{i + 1}</td>
                    <td>
                      <Link href={`/jugadores/${encodeURIComponent(r.tag)}`} className="tag">
                        {r.tag}
                      </Link>
                    </td>
                    <td className="small muted">
                      {game.mode === "duel" ? (
                        (r.town ?? "—")
                      ) : r.team_slug ? (
                        <Link href={`/equipos/${r.team_slug}`}>{r.team_name}</Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="right rating">{r.display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="section wrap stack">
        <h2>En vivo</h2>
        <p className="muted small">
          Cada fecha de la liga se transmite en Kick y en Twitch, con narración en español.
        </p>
        <div className="cards">
          <StreamCard name="Kick" url={site.kick} />
          <StreamCard name="Twitch" url={site.twitch} />
        </div>
      </section>

      {archive.length > 0 && (
        <section className="section wrap stack">
          <div className="row-between">
            <h2>Desde 2010</h2>
            <Link href="/campeones" className="small muted">
              Salón de campeones →
            </Link>
          </div>
          <p className="muted small">
            OGM organizó torneos en Puerto Rico entre 2010 y 2011. Estos campeones vienen del
            archivo de ogmadness.net.
          </p>
          <div className="cards">
            {archive.map((c) => (
              <Link key={c.tournament_slug} href={`/torneos/${c.tournament_slug}`} className="card">
                <span className="pill">{c.game_short}</span>
                <h3>{c.team_name ?? c.player_tag}</h3>
                <p className="small muted">
                  {c.tournament_name} · {fecha(c.starts_at)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section wrap stack">
        <div className="row-between">
          <h2>Para marcas</h2>
          <Link href="/marcas" className="small muted">
            Cómo auspiciar →
          </Link>
        </div>
        <p className="muted small">
          Activaciones en tu tienda o en línea, torneos con tu marca y contenido con creadores de
          Puerto Rico.
        </p>
      </section>
    </>
  );
}

function StreamCard({ name, url }: { name: string; url: string | null }) {
  if (!url) {
    return (
      <div className="card">
        <h3>{name}</h3>
        <p className="small muted">Canal por anunciar.</p>
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="card">
      <h3>{name}</h3>
      <p className="small muted">Ver el canal →</p>
    </a>
  );
}
