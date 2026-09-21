import Link from "next/link";
import { getChampions } from "@/lib/queries";
import { fecha, anio } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Salón de campeones" };

export default async function Campeones() {
  const champions = await getChampions();

  const porAnio = new Map<number, typeof champions>();
  for (const c of champions) {
    const y = anio(c.starts_at);
    porAnio.set(y, [...(porAnio.get(y) ?? []), c]);
  }
  const anios = [...porAnio.keys()].sort((a, b) => b - a);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Desde 2010</div>
        <h1>Salón de campeones</h1>
        <p className="muted">
          Cada torneo de OGM y quién lo ganó. Los de 2010 vienen del archivo público de
          ogmadness.net; los de 2026 salen de la plataforma.
        </p>
      </section>

      {anios.map((y) => (
        <section key={y} className="section wrap stack">
          <div className="row-between">
            <h2>{y}</h2>
            <span className="small muted">
              {porAnio.get(y)!.length} campeon{porAnio.get(y)!.length > 1 ? "es" : ""}
            </span>
          </div>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Campeón</th>
                  <th>Torneo</th>
                  <th>Juego</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {porAnio.get(y)!.map((c) => (
                  <tr key={c.tournament_slug + (c.team_slug ?? c.player_tag ?? "")}>
                    <td>
                      {c.team_slug ? (
                        <Link href={`/equipos/${c.team_slug}`} className="tag">
                          {c.team_name}
                        </Link>
                      ) : c.player_tag ? (
                        <Link href={`/jugadores/${encodeURIComponent(c.player_tag)}`} className="tag">
                          {c.player_tag}
                        </Link>
                      ) : (
                        "—"
                      )}
                      {c.is_archive && <span className="sub">Archivo</span>}
                      {c.is_example && <span className="sub">Ejemplo</span>}
                    </td>
                    <td>
                      <Link href={`/torneos/${c.tournament_slug}`}>{c.tournament_name}</Link>
                      <span className="sub">{c.venue}</span>
                    </td>
                    <td className="small muted">
                      <Link href={`/juegos/${c.game_slug}`}>{c.game_short}</Link>
                    </td>
                    <td className="small num muted">{fecha(c.starts_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
