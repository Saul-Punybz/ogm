import Link from "next/link";
import {
  getGames,
  getRanking,
  getUpcoming,
  getRecentTournaments,
  getChampions,
} from "@/lib/queries";
import { fecha } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await getGames();
  const featured = games.filter((g) => g.is_mobile).slice(0, 2);
  const [upcoming, recent, champions] = await Promise.all([
    getUpcoming(2),
    getRecentTournaments(4),
    getChampions(),
  ]);
  const rankings = await Promise.all(
    featured.map(async (g) => ({ game: g, rows: await getRanking(g.id, 5) })),
  );
  const archive = champions.filter((c) => c.is_archive).slice(0, 3);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Liga de esports · Puerto Rico</div>
        <h1>
          Aquí se sabe quién es <em>el mejor</em>.
        </h1>
        <p className="muted">
          Torneos, rankings y perfiles de jugadores de Puerto Rico. Cada partida cuenta para tu
          rating, cada campeonato queda en tu perfil. Desde 2010.
        </p>
      </section>

      {upcoming.length > 0 && (
        <section className="section wrap stack">
          <div className="row-between">
            <h2>Próximo torneo</h2>
            <Link href="/torneos" className="small muted">
              Ver todos →
            </Link>
          </div>
          <div className="cards">
            {upcoming.map((t) => (
              <Link key={t.slug} href={`/torneos/${t.slug}`} className="card">
                <span className={t.status === "en vivo" ? "pill pill-live" : "pill pill-flare"}>
                  {t.status === "abierto" ? "Inscripción abierta" : t.status}
                </span>
                <h3>{t.name}</h3>
                <p className="small muted">
                  {fecha(t.starts_at)} · {t.venue}
                </p>
                <p className="small muted">{t.format}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {rankings.map(({ game, rows }) => (
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
                  <th>Escuadra</th>
                  <th className="right">Lobbies</th>
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
                      <span className="sub">{r.town ?? "Puerto Rico"}</span>
                    </td>
                    <td className="small muted">
                      {r.team_slug ? (
                        <Link href={`/equipos/${r.team_slug}`}>{r.team_name}</Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="right num small">{r.matches}</td>
                    <td className="right rating">{r.display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {recent.length > 0 && (
        <section className="section wrap stack">
          <h2>Últimos resultados</h2>
          <div className="cards">
            {recent.map((t) => (
              <Link key={t.slug} href={`/torneos/${t.slug}`} className="card">
                <span className="pill">{t.game_short}</span>
                <h3>{t.name}</h3>
                <p className="small muted">{fecha(t.starts_at)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {archive.length > 0 && (
        <section className="section wrap stack">
          <div className="row-between">
            <h2>El archivo</h2>
            <Link href="/campeones" className="small muted">
              Salón de campeones →
            </Link>
          </div>
          <p className="muted small">
            Campeones de 2010, rescatados del archivo de ogmadness.net. Quince años de historia que
            ninguna otra liga de Puerto Rico puede reclamar.
          </p>
          <div className="cards">
            {archive.map((c) => (
              <div key={c.tournament_slug} className="card">
                <span className="pill">{c.game_short}</span>
                <h3>{c.team_name ?? c.player_tag}</h3>
                <p className="small muted">
                  {c.tournament_name} · {fecha(c.starts_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
