import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournament, getResults, getMatches } from "@/lib/queries";
import { fecha } from "@/lib/format";
import { GameVisual } from "@/components/game-art";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTournament((await params).slug);
  return { title: t ? t.name : "Torneo" };
}

export default async function TorneoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTournament(slug);
  if (!t) notFound();

  const [results, matches] = await Promise.all([getResults(t.id), getMatches(t.id)]);
  const duelos = matches.filter((m) => m.kind === "duel");
  const lobbies = matches.filter((m) => m.kind === "lobby");

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">
          <Link href={`/juegos/${t.game_slug}`}>{t.game_name}</Link> · {fecha(t.starts_at)}
        </div>
        <h1>{t.name}</h1>
        <GameVisual slug={t.game_slug} mode={t.game_mode} name={t.game_name} archive={t.is_archive} variant="torneo" className="gv-hero" />
        <p className="muted">
          {t.venue} · {t.format}
        </p>
        {t.summary && <p className="muted small">{t.summary}</p>}
        {t.is_archive && (
          <p className="banner">
            Resultado del archivo de ogmadness.net. No hay detalle de partidas, solo la tabla final.
          </p>
        )}
        {t.is_example && (
          <p className="banner">Torneo de ejemplo, cargado para mostrar cómo se ve la plataforma.</p>
        )}
        {t.status !== "finalizado" && (
          <p className="banner">
            {t.status === "abierto"
              ? "Inscripción abierta. El registro se abre desde el panel de admin."
              : `Estado: ${t.status}`}
          </p>
        )}
      </section>

      {results.length > 0 && (
        <section className="section wrap stack">
          <h2>Tabla final</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>{results.some((r) => r.team_name) ? "Escuadra" : "Jugador"}</th>
                  <th className="right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.position}-${r.player_tag ?? r.team_slug ?? i}`}>
                    <td className={`pos ${r.position === 1 ? "pos-1" : ""}`}>{r.position}</td>
                    <td>
                      {r.team_slug ? (
                        <Link href={`/equipos/${r.team_slug}`} className="tag">
                          {r.team_name}
                        </Link>
                      ) : r.player_tag ? (
                        <Link href={`/jugadores/${encodeURIComponent(r.player_tag)}`} className="tag">
                          {r.player_tag}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="right num small">{r.points > 0 ? r.points : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {lobbies.length > 0 && (
        <section className="section wrap stack">
          <h2>Lobbies</h2>
          <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {lobbies.map((m) => (
              <div key={m.id} className="lobby">
                <div className="lobby-head">
                  <span>{m.round ?? "Lobby"}</span>
                  <span>{m.sides.length} escuadras</span>
                </div>
                {m.sides.map((s) => (
                  <div key={`${m.id}-${s.placement}`} className="lobby-row">
                    <span className={`pos ${s.placement === 1 ? "pos-1" : ""}`}>{s.placement}</span>
                    <span>
                      {s.team_slug ? (
                        <Link href={`/equipos/${s.team_slug}`}>{s.team_name}</Link>
                      ) : (
                        s.player_tag
                      )}
                    </span>
                    <span className="num small muted">{s.kills ?? 0} bajas</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {duelos.length > 0 && (
        <section className="section wrap stack">
          <h2>Partidas</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ronda</th>
                  <th>Ganador</th>
                  <th className="right">Marcador</th>
                  <th>Perdedor</th>
                </tr>
              </thead>
              <tbody>
                {duelos.map((m) => {
                  const win = m.sides.find((s) => s.placement === 1);
                  const lose = m.sides.find((s) => s.placement !== 1);
                  return (
                    <tr key={m.id}>
                      <td className="small muted">{m.round}</td>
                      <td>
                        <Link
                          href={`/jugadores/${encodeURIComponent(win?.player_tag ?? "")}`}
                          className="tag"
                        >
                          {win?.player_tag ?? win?.team_name}
                        </Link>
                      </td>
                      <td className="right num">
                        {win?.score ?? "—"}–{lose?.score ?? "—"}
                      </td>
                      <td className="small muted">
                        <Link href={`/jugadores/${encodeURIComponent(lose?.player_tag ?? "")}`}>
                          {lose?.player_tag ?? lose?.team_name}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
