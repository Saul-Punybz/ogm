import Link from "next/link";
import { getChampions } from "@/lib/queries";
import { campeonatos, type Jugador, type Podio } from "@/lib/champions";
import { fecha, anio } from "@/lib/format";
import { sponsorsDeTorneo } from "@/data/sponsors";
import { Avatar } from "@/components/avatar";
import { Socials } from "@/components/socials";
import { GameVisual } from "@/components/game-art";
import { SponsorLogo } from "@/components/sponsor-logo";
import { progresoDe } from "@/lib/badges";
import { BadgeRow, Level } from "@/components/badges";

export const dynamic = "force-dynamic";
export const metadata = { title: "Campeones" };

const PUESTO = ["", "Campeón", "Segundo lugar", "Tercer lugar"];

function Ficha({ j }: { j: Jugador }) {
  return (
    <dl className="ficha">
      {j.town && (
        <div>
          <dt>Pueblo</dt>
          <dd>{j.town}</dd>
        </div>
      )}
      {j.main && (
        <div>
          <dt>Juega con</dt>
          <dd>{j.main}</dd>
        </div>
      )}
      {j.device && (
        <div>
          <dt>Dispositivo</dt>
          <dd>{j.device}</dd>
        </div>
      )}
      {j.display != null && (
        <div>
          <dt>Rating</dt>
          <dd className="num">
            {j.display} · #{j.rank}
          </dd>
        </div>
      )}
    </dl>
  );
}

async function CampeonJugador({ j, titulo }: { j: Jugador; titulo: string }) {
  const progreso = await progresoDe(j.id);
  return (
    <div className="champ-main">
      <Avatar tag={j.tag} url={j.avatar_url} example={j.is_example} size={132} />
      <div className="stack-sm">
        <span className="pill pill-flare">{titulo}</span>
        <h3 className="champ-name">{j.tag}</h3>
        {j.full_name && j.full_name !== j.tag && <p className="muted">{j.full_name}</p>}
        <Level progreso={progreso} />
        <BadgeRow progreso={progreso} max={8} />
        {j.bio && <p className="champ-bio">{j.bio}</p>}
        <Ficha j={j} />
        <Socials redes={j} example={j.is_example} />
        <Link href={`/jugadores/${encodeURIComponent(j.tag)}`} className="small">
          Ver perfil completo →
        </Link>
      </div>
    </div>
  );
}

async function CampeonEquipo({ e, titulo }: { e: NonNullable<Podio["equipo"]>; titulo: string }) {
  const progresos = new Map(await Promise.all(e.roster.map(async (j) => [j.tag, await progresoDe(j.id)] as const)));
  return (
    <div className="stack">
      <div className="stack-sm">
        <span className="pill pill-flare">{titulo}</span>
        <h3 className="champ-name">{e.name}</h3>
        {e.town && <p className="muted">{e.town}</p>}
        {e.bio && <p className="champ-bio">{e.bio}</p>}
      </div>
      <div className="roster">
        {e.roster.map((j) => (
          <Link key={j.tag} href={`/jugadores/${encodeURIComponent(j.tag)}`} className="roster-card">
            <Avatar tag={j.tag} url={j.avatar_url} example={j.is_example} size={72} />
            <b>{j.tag}</b>
            {e.captain === j.tag && <span className="pill">Capitán</span>}
            <span className="small num">Nivel {progresos.get(j.tag)?.level}</span>
            {progresos.get(j.tag) && <BadgeRow progreso={progresos.get(j.tag)!} max={4} />}
            {j.main && <span className="small muted">{j.main.replace(/^Rol: /, "")}</span>}
            {j.device && <span className="small muted">{j.device}</span>}
            {j.display != null && <span className="small num">{j.display}</span>}
          </Link>
        ))}
      </div>
      <Link href={`/equipos/${e.slug}`} className="small">
        Ver la escuadra →
      </Link>
    </div>
  );
}

function Mencion({ p }: { p: Podio }) {
  const nombre = p.equipo?.name ?? p.jugador?.tag ?? "—";
  const href = p.equipo ? `/equipos/${p.equipo.slug}` : `/jugadores/${encodeURIComponent(p.jugador?.tag ?? "")}`;
  const cara = p.equipo?.roster[0] ?? p.jugador;
  return (
    <Link href={href} className="mencion">
      <span className="pos">{p.position}</span>
      {cara && <Avatar tag={p.equipo ? p.equipo.name : cara.tag} url={cara.avatar_url} example={cara.is_example} size={36} />}
      <span>
        <b>{nombre}</b>
        <span className="sub">
          {PUESTO[p.position]}
          {p.points > 0 ? ` · ${p.points} pts` : ""}
        </span>
      </span>
    </Link>
  );
}

export default async function Campeones() {
  const [temporada, todos] = await Promise.all([campeonatos(), getChampions()]);
  const archivo = todos.filter((c) => c.is_archive);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Salón de campeones</div>
        <h1>
          Los que <em>ganaron</em>
        </h1>
        <p className="muted">
          Cada torneo de OGM, su campeón y su podio. Los de 2026 salen de la plataforma; los de 2010,
          del archivo de ogmadness.net.
        </p>
        {temporada.some((c) => c.is_example) && (
          <p className="banner">
            Los campeones de 2026 son de ejemplo: nombres, fotos ilustradas, historias y redes
            inventadas para mostrar cómo se ve la sección.
          </p>
        )}
      </section>

      {temporada.map((c) => {
        const [primero, ...resto] = c.podio;
        const auspicio = sponsorsDeTorneo(c.slug)[0];
        const titulo = c.podio.length && primero?.position === 1 ? `Campeón · ${c.game_name}` : c.game_name;
        return (
          <section key={c.slug} className="section wrap stack">
            <div className="champ-banner">
              <GameVisual slug={c.game_slug} mode={c.game_mode} name={c.game_name} variant="torneo" />
              <div className="stack-sm">
                <span className="eyebrow">
                  {c.game_name} · {fecha(c.starts_at)}
                </span>
                <h2>
                  <Link href={`/torneos/${c.slug}`}>{c.name}</Link>
                </h2>
                <p className="small muted">
                  {c.venue} · {c.format}
                </p>
                {auspicio && (
                  <div className="presentado">
                    <span className="lbl">Presentado por</span>
                    <SponsorLogo name={auspicio.name} marca={auspicio.marca} color={auspicio.color} />
                  </div>
                )}
              </div>
            </div>

            <div className="champ-card">
              {primero?.jugador && <CampeonJugador j={primero.jugador} titulo={titulo} />}
              {primero?.equipo && <CampeonEquipo e={primero.equipo} titulo={titulo} />}
            </div>

            {resto.length > 0 && (
              <div className="menciones">
                {resto.map((p, i) => (
                  <Mencion key={`${p.position}-${i}`} p={p} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {archivo.length > 0 && (
        <section className="section wrap stack">
          <div className="stack-sm">
            <h2>El archivo · {anio(archivo[archivo.length - 1].starts_at)}</h2>
            <p className="muted small">
              Campeones reales de los torneos de OGM en 2010. Solo se publica lo que registró el sitio
              original: sin fotos ni redes inventadas.
            </p>
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
                {archivo.map((c) => (
                  <tr key={c.tournament_slug + (c.team_slug ?? c.player_tag ?? "")}>
                    <td>
                      {c.team_slug ? (
                        <Link href={`/equipos/${c.team_slug}`} className="tag">
                          {c.team_name}
                        </Link>
                      ) : (
                        <Link href={`/jugadores/${encodeURIComponent(c.player_tag ?? "")}`} className="who tag">
                          <Avatar tag={c.player_tag ?? "?"} size={28} />
                          <span>{c.player_tag}</span>
                        </Link>
                      )}
                    </td>
                    <td>
                      <Link href={`/torneos/${c.tournament_slug}`}>{c.tournament_name}</Link>
                      <span className="sub">{c.venue}</span>
                    </td>
                    <td className="small muted">{c.game_short}</td>
                    <td className="small num muted">{fecha(c.starts_at)}</td>
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
