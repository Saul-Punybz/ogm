import Link from "next/link";
import { getGames, type Game } from "@/lib/queries";
import { VoteBlock } from "@/components/vote";
import { GameVisual } from "@/components/game-art";

export const dynamic = "force-dynamic";
export const metadata = { title: "Juegos y rankings" };

const MODO: Record<string, string> = {
  duel: "Uno contra uno",
  squad: "Equipo contra equipo",
  br: "Battle royale",
};

function GameCard({ g }: { g: Game }) {
  return (
    <Link href={`/juegos/${g.slug}`} className="card card-art">
      <GameVisual slug={g.slug} mode={g.mode} name={g.name} archive={g.stage === "archivo"} />
      <div className="card-body">
        <span className="format">
          {MODO[g.mode]}
          {g.team_size > 1 ? ` · ${g.team_size} por equipo` : ""}
        </span>
        <h3>{g.name}</h3>
        {g.tagline && <p className="small muted">{g.tagline}</p>}
        <p className="small muted">{g.platform}</p>
      </div>
    </Link>
  );
}

export default async function Juegos() {
  const all = await getGames(false);
  const by = (stage: Game["stage"]) => all.filter((g) => g.stage === stage);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Juegos</div>
        <h1>Un ranking por juego</h1>
        <p className="muted">
          Cada juego tiene su propia tabla. Puedes ser el número uno en Free Fire y estar a mitad
          de tabla en Clash Royale: son ratings independientes.
        </p>
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>Temporada 1</h2>
          <p className="muted small">
            Un juego por formato. Los tres son gratis y corren en el celular.
          </p>
        </div>
        <div className="cards">
          {by("temporada").map((g) => (
            <GameCard key={g.slug} g={g} />
          ))}
        </div>
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>En votación</h2>
          <p className="muted small">
            El cuarto juego lo elige la comunidad, después de un torneo de prueba de cada uno.
          </p>
        </div>
        <VoteBlock />
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>Eventos</h2>
          <p className="muted small">
            Torneos especiales con creadores y noches presenciales. No cuentan para el ranking de
            temporada.
          </p>
        </div>
        <div className="cards">
          {by("eventos").map((g) => (
            <GameCard key={g.slug} g={g} />
          ))}
        </div>
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>Del archivo</h2>
          <p className="muted small">Los juegos de 2010. Sus campeones siguen en el salón.</p>
        </div>
        <div className="cards">
          {by("archivo").map((g) => (
            <GameCard key={g.slug} g={g} />
          ))}
        </div>
      </section>
    </>
  );
}
