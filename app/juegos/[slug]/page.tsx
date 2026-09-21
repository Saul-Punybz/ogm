import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGame,
  getRanking,
  getTeamRanking,
  getTournamentsByGame,
} from "@/lib/queries";
import { fecha } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const game = await getGame((await params).slug);
  return { title: game ? `Ranking · ${game.name}` : "Juego" };
}

export default async function JuegoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();

  const esEquipo = game.mode !== "duel";
  const [players, teams, tournaments] = await Promise.all([
    getRanking(game.id, 60),
    esEquipo ? getTeamRanking(game.id) : Promise.resolve([]),
    getTournamentsByGame(game.id),
  ]);

  const campeones = tournaments.filter((t) => t.status === "finalizado");

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">
          {game.platform} · {game.mode === "br" ? "Battle royale" : game.mode === "squad" ? "Por equipos" : "Individual"}
        </div>
        <h1>{game.name}</h1>
        {game.tagline && <p className="muted">{game.tagline}</p>}
        {game.stage === "archivo" && (
          <p className="banner">
            Juego del archivo. No hay temporada activa; lo que queda es el historial de 2010.
          </p>
        )}
        {game.stage === "votacion" && (
          <p className="banner">
            Candidato a entrar a la liga. <Link href="/juegos">Vota por el cuarto juego</Link>.
          </p>
        )}
        {game.stage === "eventos" && (
          <p className="banner">Juego de eventos especiales. No cuenta para el ranking de temporada.</p>
        )}
      </section>

      {teams.length > 0 && (
        <section className="section wrap stack">
          <div className="row-between">
            <h2>Escuadras</h2>
            <span className="small muted">Promedio del rating de sus jugadores</span>
          </div>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Escuadra</th>
                  <th>Pueblo</th>
                  <th className="right">Títulos</th>
                  <th className="right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t.slug}>
                    <td className={`pos ${i === 0 ? "pos-1" : ""}`}>{i + 1}</td>
                    <td>
                      <Link href={`/equipos/${t.slug}`} className="tag">
                        {t.name}
                      </Link>
                      <span className="sub">{t.players} jugadores</span>
                    </td>
                    <td className="small muted">{t.town ?? "—"}</td>
                    <td className="right num small">{t.titles}</td>
                    <td className="right rating">{t.display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section wrap stack">
        <div className="row-between">
          <h2>Jugadores</h2>
          <span className="small muted">Rating OpenSkill · todos empiezan en 1000</span>
        </div>
        {players.length === 0 ? (
          <p className="note">Todavía no hay partidas contadas en este juego.</p>
        ) : (
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Jugador</th>
                  <th>{esEquipo ? "Escuadra" : "Pueblo"}</th>
                  <th className="right">{game.mode === "br" ? "Lobbies" : "Partidas"}</th>
                  <th className="right">{game.mode === "br" ? "Top 3" : "G–P"}</th>
                  <th className="right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {players.map((r, i) => (
                  <tr key={r.player_id}>
                    <td className={`pos ${i === 0 ? "pos-1" : ""}`}>{i + 1}</td>
                    <td>
                      <Link href={`/jugadores/${encodeURIComponent(r.tag)}`} className="tag">
                        {r.tag}
                      </Link>
                      {esEquipo && <span className="sub">{r.town ?? "Puerto Rico"}</span>}
                    </td>
                    <td className="small muted">
                      {esEquipo
                        ? r.team_slug
                          ? <Link href={`/equipos/${r.team_slug}`}>{r.team_name}</Link>
                          : "—"
                        : (r.town ?? "—")}
                    </td>
                    <td className="right num small">{r.matches}</td>
                    <td className="right num small">
                      {game.mode === "br" ? r.podiums : `${r.wins}–${r.losses}`}
                    </td>
                    <td className="right rating">{r.display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section wrap stack">
        <h2>Torneos</h2>
        {campeones.length === 0 ? (
          <p className="note">Sin torneos registrados todavía.</p>
        ) : (
          <div className="cards">
            {tournaments.map((t) => (
              <Link key={t.slug} href={`/torneos/${t.slug}`} className="card">
                <span className={t.status === "finalizado" ? "pill" : "pill pill-flare"}>
                  {t.status}
                </span>
                <h3>{t.name}</h3>
                <p className="small muted">
                  {fecha(t.starts_at)} · {t.venue}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
