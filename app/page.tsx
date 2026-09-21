import Link from "next/link";
import { getGames, getRanking, getUpcoming, getChampions } from "@/lib/queries";
import { getHighlights } from "@/lib/highlights";
import { fecha, fechaHora } from "@/lib/format";
import { site } from "@/lib/site";
import { VoteBlock } from "@/components/vote";
import { LiveStage } from "@/components/live-stage";
import { GameVisual } from "@/components/game-art";
import { Avatar } from "@/components/avatar";
import { SceneStreams } from "@/components/scene-streams";

export const dynamic = "force-dynamic";

const FORMATO: Record<string, string> = {
  br: "Battle royale",
  duel: "Uno contra uno",
  squad: "Equipo contra equipo",
};

export default async function Home() {
  const games = await getGames();
  const temporada = games.filter((g) => g.stage === "temporada");
  const [upcoming, champions, rankings, momentos] = await Promise.all([
    getUpcoming(3),
    getChampions(),
    Promise.all(temporada.map(async (g) => ({ game: g, rows: await getRanking(g.id, 5) }))),
    getHighlights(),
  ]);
  const conRanking = rankings.filter((r) => r.rows.length > 0);
  const archive = champions.filter((c) => c.is_archive).slice(0, 3);
  const next = upcoming[0] ?? null;
  const hayMomentos = momentos.subida || momentos.sorpresa || momentos.bajas || momentos.racha;

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
      </section>

      <section className="wrap" style={{ paddingBottom: 36 }}>
        <LiveStage
          twitchUrl={site.twitch}
          next={
            next
              ? {
                  name: next.name,
                  slug: next.slug,
                  startsAt: next.starts_at,
                  venue: next.venue,
                  game: next.game_short,
                }
              : null
          }
          fechaTexto={next ? fechaHora(next.starts_at) : null}
        />
      </section>

      <section className="section wrap stack">
        <h2>Temporada 1</h2>
        <div className="cards">
          {temporada.map((g) => (
            <Link key={g.slug} href={`/juegos/${g.slug}`} className="card card-art">
              <GameVisual slug={g.slug} mode={g.mode} name={g.name} />
              <div className="card-body">
                <span className="format">
                  {FORMATO[g.mode]}
                  {g.team_size > 1 ? ` · escuadras de ${g.team_size}` : ""}
                </span>
                <h3>{g.name}</h3>
                <p className="small muted">{g.tagline}</p>
              </div>
            </Link>
          ))}
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

      {hayMomentos && (
        <section className="section wrap stack">
          <div className="row-between">
            <h2>Momentos de la liga</h2>
            <span className="small muted">Últimos 30 días · salen solos de los resultados</span>
          </div>
          <div className="moments">
            {momentos.subida && (
              <Link href={`/jugadores/${encodeURIComponent(momentos.subida.tag)}`} className="moment">
                <span className="eyebrow">Jugador del mes</span>
                <div className="who">
                  <Avatar tag={momentos.subida.tag} url={momentos.subida.avatar_url} example={momentos.subida.is_example} size={40} />
                  <h3>{momentos.subida.tag}</h3>
                </div>
                <span className="big">+{momentos.subida.delta}</span>
                <p className="small muted">
                  de rating en {momentos.subida.game_name}. Va en {momentos.subida.display}.
                </p>
              </Link>
            )}
            {momentos.sorpresa && (
              <Link href={`/torneos/${momentos.sorpresa.tournament_slug}`} className="moment">
                <span className="eyebrow">La sorpresa</span>
                <h3>
                  {momentos.sorpresa.winner} le ganó a {momentos.sorpresa.loser}
                </h3>
                <span className="big">
                  {momentos.sorpresa.loser_before - momentos.sorpresa.winner_before}
                </span>
                <p className="small muted">
                  puntos de rating de diferencia antes de la partida.{" "}
                  {momentos.sorpresa.round ? `${momentos.sorpresa.round}, ` : ""}
                  {momentos.sorpresa.tournament_name}.
                </p>
              </Link>
            )}
            {momentos.bajas && (
              <Link href={`/torneos/${momentos.bajas.tournament_slug}`} className="moment">
                <span className="eyebrow">Más bajas en un lobby</span>
                <h3>{momentos.bajas.team_name ?? momentos.bajas.player_tag}</h3>
                <span className="big">{momentos.bajas.kills}</span>
                <p className="small muted">
                  bajas en {momentos.bajas.round?.toLowerCase() ?? "un lobby"} de{" "}
                  {momentos.bajas.tournament_name}.
                </p>
              </Link>
            )}
            {momentos.racha && (
              <Link href={`/jugadores/${encodeURIComponent(momentos.racha.tag)}`} className="moment">
                <span className="eyebrow">En racha</span>
                <div className="who">
                  <Avatar tag={momentos.racha.tag} url={momentos.racha.avatar_url} example={momentos.racha.is_example} size={40} />
                  <h3>{momentos.racha.tag}</h3>
                </div>
                <span className="big">{momentos.racha.wins}</span>
                <p className="small muted">victorias seguidas en {momentos.racha.game_name}.</p>
              </Link>
            )}
          </div>
        </section>
      )}

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
              <Link key={t.slug} href={`/torneos/${t.slug}`} className="card card-art">
                <GameVisual slug={t.game_slug} mode={t.game_mode} name={t.game_name} />
                <div className="card-body">
                  <span className={t.status === "abierto" ? "pill pill-flare" : "pill"}>
                    {t.status === "abierto" ? "Inscripción abierta" : t.game_short}
                  </span>
                  <h3>{t.name}</h3>
                  <p className="small muted">{fechaHora(t.starts_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section wrap stack">
        <div className="row-between">
          <h2>La escena en vivo</h2>
          <Link href="/en-vivo" className="small muted">
            Todas las transmisiones →
          </Link>
        </div>
        <SceneStreams
          juegos={["free-fire", "brawlhalla", "clash-royale"]}
          nombres={Object.fromEntries(games.map((g) => [g.slug, g.name]))}
          max={3}
          creadores
        />
      </section>

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
                      <Link href={`/jugadores/${encodeURIComponent(r.tag)}`} className="who tag">
                        <Avatar tag={r.tag} url={r.avatar_url} example={r.is_example} size={28} />
                        <span>{r.tag}</span>
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
              <Link key={c.tournament_slug} href={`/torneos/${c.tournament_slug}`} className="card card-art">
                <GameVisual slug={c.game_slug} mode="duel" name={c.game_short} archive />
                <div className="card-body">
                  <span className="pill">{c.game_short}</span>
                  <h3>{c.team_name ?? c.player_tag}</h3>
                  <p className="small muted">
                    {c.tournament_name} · {fecha(c.starts_at)}
                  </p>
                </div>
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
