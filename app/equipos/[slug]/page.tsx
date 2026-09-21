import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getTeamRoster, getTeamResults } from "@/lib/queries";
import { fecha } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { GameVisual } from "@/components/game-art";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTeam((await params).slug);
  return { title: t ? t.name : "Equipo" };
}

export default async function EquipoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = await getTeam(slug);
  if (!team) notFound();

  const [roster, results] = await Promise.all([getTeamRoster(team.id), getTeamResults(team.id)]);
  const titulos = results.filter((r) => r.position === 1).length;

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">
          <Link href={`/juegos/${team.game_slug}`}>{team.game_name}</Link>
          {team.town ? ` · ${team.town}` : ""}
        </div>
        <h1>{team.name}</h1>
        {team.game_slug && (
          <GameVisual slug={team.game_slug} mode={team.mode} name={team.game_name} archive={!team.town && !team.is_example} className="gv-hero" />
        )}
        <p className="muted">
          {titulos > 0
            ? `${titulos} campeonato${titulos > 1 ? "s" : ""} de OGM`
            : "Sin campeonatos todavía"}
        </p>
        {team.is_example && (
          <p className="banner">Escuadra de ejemplo, cargada para mostrar cómo se ve la plataforma.</p>
        )}
      </section>

      <section className="section wrap stack">
        <h2>Roster</h2>
        {roster.length === 0 ? (
          <p className="note">
            El archivo de 2010 no publica los rosters de los equipos, solo los nombres.
          </p>
        ) : (
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Pueblo</th>
                  <th className="right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p) => (
                  <tr key={p.tag}>
                    <td>
                      <Link href={`/jugadores/${encodeURIComponent(p.tag)}`} className="who tag">
                        <Avatar tag={p.tag} url={p.avatar_url} size={28} />
                        <span>{p.tag}</span>
                      </Link>
                    </td>
                    <td className="small muted">{p.town ?? "—"}</td>
                    <td className="right rating">{p.display ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {results.length > 0 && (
        <section className="section wrap stack">
          <h2>Historial</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "3rem" }}>#</th>
                  <th>Torneo</th>
                  <th>Fecha</th>
                  <th className="right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.tournament_slug}>
                    <td className={`pos ${r.position === 1 ? "pos-1" : ""}`}>{r.position}</td>
                    <td>
                      <Link href={`/torneos/${r.tournament_slug}`} className="tag">
                        {r.tournament_name}
                      </Link>
                      <span className="sub">{r.game_short}</span>
                    </td>
                    <td className="small num muted">{fecha(r.starts_at)}</td>
                    <td className="right num small">{r.points > 0 ? r.points : "—"}</td>
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
