import Link from "next/link";
import { getAllTournaments } from "@/lib/queries";
import { fecha } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Torneos" };

export default async function Torneos() {
  const all = await getAllTournaments();
  const próximos = all.filter((t) => t.status !== "finalizado");
  const jugados = all.filter((t) => t.status === "finalizado" && !t.is_archive);
  const archivo = all.filter((t) => t.is_archive);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Calendario</div>
        <h1>Torneos</h1>
      </section>

      {próximos.length > 0 && (
        <section className="section wrap stack">
          <h2>Por jugarse</h2>
          <div className="cards">
            {próximos.map((t) => (
              <Link key={t.slug} href={`/torneos/${t.slug}`} className="card">
                <span className="pill pill-flare">
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

      <section className="section wrap stack">
        <h2>Jugados</h2>
        <div className="t-scroll">
          <table>
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Juego</th>
                <th>Fecha</th>
                <th>Donde</th>
              </tr>
            </thead>
            <tbody>
              {jugados.map((t) => (
                <tr key={t.slug}>
                  <td>
                    <Link href={`/torneos/${t.slug}`} className="tag">
                      {t.name}
                    </Link>
                    <span className="sub">{t.format}</span>
                  </td>
                  <td className="small muted">{t.game_short}</td>
                  <td className="small num">{fecha(t.starts_at)}</td>
                  <td className="small muted">{t.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {archivo.length > 0 && (
        <section className="section wrap stack">
          <h2>Archivo 2010</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Torneo</th>
                  <th>Juego</th>
                  <th>Fecha</th>
                  <th>Donde</th>
                </tr>
              </thead>
              <tbody>
                {archivo.map((t) => (
                  <tr key={t.slug}>
                    <td>
                      <Link href={`/torneos/${t.slug}`} className="tag">
                        {t.name}
                      </Link>
                    </td>
                    <td className="small muted">{t.game_short}</td>
                    <td className="small num">{fecha(t.starts_at)}</td>
                    <td className="small muted">{t.venue}</td>
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
