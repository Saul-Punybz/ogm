import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPlayer,
  getPlayerRatings,
  getPlayerTitles,
  getPlayerMatches,
  getPlayerRivals,
} from "@/lib/queries";
import { fecha, plural, resultadoTexto } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const p = await getPlayer(decodeURIComponent((await params).tag));
  return { title: p ? p.tag : "Jugador" };
}

export default async function JugadorPage({ params }: { params: Promise<{ tag: string }> }) {
  const tag = decodeURIComponent((await params).tag);
  const player = await getPlayer(tag);
  if (!player) notFound();

  const [ratings, titles, matches, rivals] = await Promise.all([
    getPlayerRatings(player.id),
    getPlayerTitles(player.id),
    getPlayerMatches(player.id),
    getPlayerRivals(player.id),
  ]);

  const campeonatos = titles.filter((t) => t.position === 1);
  const podios = titles.filter((t) => t.position > 1 && t.position <= 3);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">{player.town ?? "Puerto Rico"}</div>
        <h1>{player.tag}</h1>
        {player.full_name && player.full_name !== player.tag && (
          <p className="muted">{player.full_name}</p>
        )}
        {player.is_example && (
          <p className="banner">Perfil de ejemplo, cargado para mostrar cómo se ve la plataforma.</p>
        )}
      </section>

      {campeonatos.length > 0 && (
        <section className="section wrap stack">
          <h2>Vitrina</h2>
          <div className="cards">
            {campeonatos.map((t) => (
              <Link key={t.tournament_slug} href={`/torneos/${t.tournament_slug}`} className="card">
                <span className="pill pill-flare">Campeón</span>
                <h3>{t.tournament_name}</h3>
                <p className="small muted">
                  {t.game_short} · {fecha(t.starts_at)}
                  {t.team_name ? ` · con ${t.team_name}` : ""}
                </p>
              </Link>
            ))}
          </div>
          {podios.length > 0 && (
            <p className="small muted">
              Además {podios.length} podio{podios.length > 1 ? "s" : ""}:{" "}
              {podios.map((p) => `${p.position}º en ${p.tournament_name}`).join(" · ")}
            </p>
          )}
        </section>
      )}

      <section className="section wrap stack">
        <h2>Rating por juego</h2>
        {ratings.length === 0 ? (
          <p className="note">Sin partidas contadas todavía.</p>
        ) : (
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Juego</th>
                  <th className="right">Posición</th>
                  <th className="right">Partidas</th>
                  <th className="right">Récord</th>
                  <th className="right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r.game_slug}>
                    <td>
                      <Link href={`/juegos/${r.game_slug}`} className="tag">
                        {r.game_name}
                      </Link>
                    </td>
                    <td className="right num small">#{r.position}</td>
                    <td className="right num small">{r.matches}</td>
                    <td className="right num small">
                      {r.mode === "duel" ? `${r.wins}–${r.losses}` : `${plural(r.wins, "victoria", "victorias")} · ${r.podiums} top 3`}
                    </td>
                    <td className="right rating">{r.display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {rivals.length > 0 && (
        <section className="section wrap stack">
          <h2>Cara a cara</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rival</th>
                  <th>Juego</th>
                  <th className="right">Récord</th>
                </tr>
              </thead>
              <tbody>
                {rivals.map((r) => (
                  <tr key={`${r.rival}-${r.game_short}`}>
                    <td>
                      <Link href={`/jugadores/${encodeURIComponent(r.rival)}`} className="tag">
                        {r.rival}
                      </Link>
                    </td>
                    <td className="small muted">{r.game_short}</td>
                    <td className="right num">
                      {r.wins}–{r.losses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {matches.length > 0 && (
        <section className="section wrap stack">
          <h2>Historial</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Torneo</th>
                  <th>Ronda</th>
                  <th className="right">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.match_id}>
                    <td className="small num muted">{fecha(m.played_at)}</td>
                    <td>
                      <Link href={`/torneos/${m.tournament_slug}`} className="tag">
                        {m.tournament_name}
                      </Link>
                      <span className="sub">{m.game_short}</span>
                    </td>
                    <td className="small muted">{m.round}</td>
                    <td className="right small num">
                      {resultadoTexto(m.kind, m.placement, m.sides_total)}
                      {m.kills != null ? ` · ${m.kills} bajas` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
