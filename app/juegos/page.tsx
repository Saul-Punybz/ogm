import Link from "next/link";
import { getGames } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rankings" };

const MODO: Record<string, string> = {
  duel: "Uno contra uno",
  squad: "Equipo contra equipo",
  br: "Battle royale por escuadras",
};

export default async function Juegos() {
  const all = await getGames(false);
  const activos = all.filter((g) => g.is_active);
  const archivo = all.filter((g) => !g.is_active);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Rankings</div>
        <h1>Un ranking por juego</h1>
        <p className="muted">
          Cada juego tiene su propia tabla. Un jugador puede ser el número uno en Free Fire y estar
          a mitad de tabla en Street Fighter: son ratings independientes.
        </p>
      </section>

      <section className="section wrap stack">
        <h2>En temporada</h2>
        <div className="cards">
          {activos.map((g) => (
            <Link key={g.slug} href={`/juegos/${g.slug}`} className="card">
              <span className={g.is_mobile ? "pill pill-flare" : "pill"}>
                {g.is_mobile ? "Móvil" : g.platform}
              </span>
              <h3>{g.name}</h3>
              <p className="small muted">{MODO[g.mode]}</p>
              <p className="small muted">
                {g.team_size > 1 ? `Escuadras de ${g.team_size}` : "Individual"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {archivo.length > 0 && (
        <section className="section wrap stack">
          <h2>Del archivo</h2>
          <p className="muted small">
            Juegos de las temporadas de 2010. Ya no están activos, pero sus campeones siguen en el
            salón.
          </p>
          <div className="cards">
            {archivo.map((g) => (
              <Link key={g.slug} href={`/juegos/${g.slug}`} className="card">
                <span className="pill">{g.platform}</span>
                <h3>{g.name}</h3>
                <p className="small muted">{MODO[g.mode]}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
