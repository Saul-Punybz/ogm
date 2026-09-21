import Link from "next/link";
import { sponsors, NIVELES, type Nivel, type Sponsor } from "@/data/sponsors";
import { getAllTournaments } from "@/lib/queries";
import { fecha } from "@/lib/format";
import { SponsorLogo } from "@/components/sponsor-logo";
import { programas, spots } from "@/data/tv";

export const dynamic = "force-dynamic";
export const metadata = { title: "Auspiciadores" };

function TorneoChips({ slugs, nombres }: { slugs: string[]; nombres: Map<string, string> }) {
  if (slugs.length === 0) return null;
  return (
    <div className="chips">
      {slugs.map((s) => (
        <Link key={s} href={`/torneos/${s}`} className="pill">
          {nombres.get(s) ?? s}
        </Link>
      ))}
    </div>
  );
}

function EnTv({ s }: { s: Sponsor }) {
  const presenta = programas.filter((p) => p.sponsor === s.slug).map((p) => p.name);
  const spot = spots.find((x) => x.sponsor === s.slug);
  if (presenta.length === 0 && !spot) return null;
  return (
    <p className="small">
      <b className="lbl">En OGM TV</b>
      {presenta.length > 0 && `Presenta ${presenta.join(" y ")}`}
      {presenta.length > 0 && spot ? " · " : ""}
      {spot && `anuncio de ${spot.segundos} s en la tanda`}
      {" · "}
      <Link href="/tv">ver programación</Link>
    </p>
  );
}

function SponsorCard({
  s,
  nombres,
  grande = false,
}: {
  s: Sponsor;
  nombres: Map<string, string>;
  grande?: boolean;
}) {
  return (
    <article className={`sponsor ${grande ? "sponsor-principal" : ""}`} style={{ borderTopColor: s.color }}>
      <div className="sponsor-head">
        <SponsorLogo name={s.name} marca={s.marca} color={s.color} size={grande ? "lg" : "md"} />
        <span className="pill">Marca de ejemplo</span>
      </div>
      <div className="stack-sm">
        <span className="format">{s.categoria}</span>
        <p>{s.descripcion}</p>
        <p className="small muted">
          <b className="lbl">Qué hace en la liga</b> {s.activacion}
        </p>
        {s.premio && (
          <p className="small">
            <b className="lbl lbl-flare">Premio</b> {s.premio}
          </p>
        )}
        <TorneoChips slugs={s.torneos} nombres={nombres} />
        <EnTv s={s} />
        <span className="small muted num">{s.dominio}</span>
      </div>
    </article>
  );
}

export default async function Auspiciadores() {
  const torneos = await getAllTournaments();
  const nombres = new Map(torneos.map((t) => [t.slug, t.name]));
  const porNivel = (n: Nivel) => sponsors.filter((s) => s.nivel === n);
  const principal = porNivel("principal");
  const premios = sponsors
    .filter((s) => s.premio)
    .flatMap((s) => (s.torneos.length ? s.torneos : [""]).map((t) => ({ s, t })))
    .map(({ s, t }) => ({ s, torneo: torneos.find((x) => x.slug === t) ?? null }))
    .sort((a, b) => (a.torneo?.starts_at ?? "").localeCompare(b.torneo?.starts_at ?? ""));

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Temporada 1 · 2026</div>
        <h1>
          Los que hacen posible la <em>liga</em>
        </h1>
        <p className="muted">
          La inscripción en OGM es gratis porque los premios los ponen estas marcas. Cada una
          presenta un torneo, pone un premio o aporta lo que hace falta para los eventos.
        </p>
        <p className="banner">
          Marcas de ejemplo: los nombres, logos y premios son inventados para mostrar cómo se ve la
          página. Ninguna es una empresa real.
        </p>
      </section>

      {principal.length > 0 && (
        <section className="section wrap stack">
          <div className="stack-sm">
            <h2>{NIVELES.principal.titulo}</h2>
            <p className="muted small">{NIVELES.principal.texto}</p>
          </div>
          {principal.map((s) => (
            <SponsorCard key={s.slug} s={s} nombres={nombres} grande />
          ))}
        </section>
      )}

      {(["torneo", "aliado", "medio"] as Nivel[]).map((n) => (
        <section key={n} className="section wrap stack">
          <div className="stack-sm">
            <h2>{NIVELES[n].titulo}</h2>
            <p className="muted small">{NIVELES[n].texto}</p>
          </div>
          <div className="sponsor-grid">
            {porNivel(n).map((s) => (
              <SponsorCard key={s.slug} s={s} nombres={nombres} />
            ))}
          </div>
        </section>
      ))}

      <section className="section wrap stack">
        <h2>Premios de la temporada</h2>
        <div className="t-scroll">
          <table>
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Fecha</th>
                <th>Premio</th>
                <th>Lo pone</th>
              </tr>
            </thead>
            <tbody>
              {premios.map(({ s, torneo }) => (
                <tr key={`${s.slug}-${torneo?.slug ?? "temporada"}`}>
                  <td>
                    {torneo ? (
                      <Link href={`/torneos/${torneo.slug}`} className="tag">
                        {torneo.name}
                      </Link>
                    ) : (
                      <span className="tag">Toda la temporada</span>
                    )}
                  </td>
                  <td className="small num muted">{torneo ? fecha(torneo.starts_at) : "—"}</td>
                  <td className="small">{s.premio}</td>
                  <td className="small">
                    <span className="dot" style={{ background: s.color }} />
                    {s.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section wrap stack">
        <h2>¿Tu marca aquí?</h2>
        <p className="muted" style={{ maxWidth: "60ch" }}>
          Presenta un torneo, pon el premio de una fecha o auspicia la temporada completa. Te
          contamos cómo funciona y qué recibes.
        </p>
        <Link href="/marcas" className="btn">
          Cómo auspiciar
        </Link>
      </section>
    </>
  );
}
