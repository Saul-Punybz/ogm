import Link from "next/link";
import { site } from "@/lib/site";
import { programas, parrilla, spots, DIAS, FORMATOS_TV, type Espacio } from "@/data/tv";
import { sponsors } from "@/data/sponsors";
import { TwitchLive } from "@/components/twitch-live";
import { SponsorLogo } from "@/components/sponsor-logo";
import { GameVisual } from "@/components/game-art";

export const dynamic = "force-dynamic";
export const metadata = { title: "OGM TV" };

const prog = (slug: string) => programas.find((p) => p.slug === slug)!;
const marca = (slug?: string) => sponsors.find((s) => s.slug === slug);

/** Dia (0-6) y minutos desde medianoche, en hora de Puerto Rico. */
function ahoraPR(): { day: number; min: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Puerto_Rico",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, min: Number(get("hour")) * 60 + Number(get("minute")) };
}

const aMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function hora(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

/** Lo que esta al aire y lo que sigue, recorriendo la semana en orden. */
function ahoraYSiguiente(): { ahora: Espacio | null; siguiente: Espacio } {
  const { day, min } = ahoraPR();
  const orden = [...parrilla].sort((a, b) => a.day - b.day || aMin(a.start) - aMin(b.start));
  const ahora = orden.find((e) => e.day === day && aMin(e.start) <= min && min < aMin(e.end)) ?? null;
  const clave = (e: Espacio) => ((e.day - day + 7) % 7) * 1440 + aMin(e.start) - min;
  const siguiente = orden
    .filter((e) => e !== ahora && clave(e) > 0)
    .sort((a, b) => clave(a) - clave(b))[0] ?? orden[0];
  return { ahora, siguiente };
}

export default function Tv() {
  const channel = site.twitch?.match(/twitch\.tv\/([A-Za-z0-9_]+)/)?.[1] ?? null;
  const { ahora, siguiente } = ahoraYSiguiente();
  const semana = [1, 2, 3, 4, 5, 6, 0];
  const pAhora = ahora ? prog(ahora.programa) : null;
  const pSig = prog(siguiente.programa);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">El canal de la liga</div>
        <h1>
          OGM <em>TV</em>
        </h1>
        <p className="muted">
          La liga en vivo, los resúmenes, las mejores jugadas y las historias de los campeones. Sale
          al aire por Twitch, todas las noches de la semana.
        </p>
        <p className="banner">
          Programación de ejemplo, con auspiciadores inventados, para mostrar cómo funcionaría el
          canal.
        </p>
      </section>

      <section className="wrap stack" style={{ paddingBottom: 36 }}>
        <div className="onair">
          <div className="onair-slot">
            <span className={pAhora ? "pill pill-live" : "pill"}>{pAhora ? "Al aire" : "Ahora"}</span>
            <h3>{pAhora?.name ?? "Fuera de programación"}</h3>
            <p className="small muted">
              {ahora ? `${hora(ahora.start)} – ${hora(ahora.end)}` : "Vuelve a la hora del próximo programa."}
            </p>
          </div>
          <div className="onair-slot">
            <span className="pill">Sigue</span>
            <h3>{pSig.name}</h3>
            <p className="small muted">
              {DIAS[siguiente.day]} · {hora(siguiente.start)}
              {marca(pSig.sponsor) ? ` · presentado por ${marca(pSig.sponsor)!.name}` : ""}
            </p>
          </div>
        </div>
        {channel && site.twitch ? (
          <TwitchLive channel={channel} url={site.twitch} example={site.twitchExample} />
        ) : (
          <p className="note">Canal por anunciar.</p>
        )}
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>Programación de la semana</h2>
          <p className="muted small">Hora de Puerto Rico.</p>
        </div>
        <div className="parrilla">
          {semana.map((d) => {
            const espacios = parrilla
              .filter((e) => e.day === d)
              .sort((a, b) => aMin(a.start) - aMin(b.start));
            return (
              <div key={d} className={`dia ${d === ahoraPR().day ? "dia-hoy" : ""}`}>
                <h3>
                  {DIAS[d]}
                  {d === ahoraPR().day && <span className="pill pill-flare">Hoy</span>}
                </h3>
                {espacios.map((e) => {
                  const p = prog(e.programa);
                  const s = marca(p.sponsor);
                  return (
                    <div key={e.start} className={`slot slot-${p.tipo === "En vivo" ? "vivo" : "otro"}`}>
                      <span className="num small">{hora(e.start)}</span>
                      <b>{p.name}</b>
                      <span className="small muted">{p.tipo}</span>
                      {s && (
                        <span className="small">
                          <span className="dot" style={{ background: s.color }} />
                          {s.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section wrap stack">
        <h2>Los programas</h2>
        <div className="cards">
          {programas.map((p) => {
            const s = marca(p.sponsor);
            return (
              <article key={p.slug} className="card card-art">
                {p.game ? (
                  <GameVisual slug={p.game} mode="br" name={p.name} />
                ) : (
                  <div className="tv-card-top">
                    <span>{p.tipo}</span>
                  </div>
                )}
                <div className="card-body">
                  <span className="format">{p.tipo}</span>
                  <h3>{p.name}</h3>
                  <p className="small muted">{p.desc}</p>
                  {s ? (
                    <div className="presentado">
                      <span className="lbl">Presentado por</span>
                      <SponsorLogo name={s.name} marca={s.marca} color={s.color} />
                    </div>
                  ) : (
                    <span className="small" style={{ color: "var(--flare)" }}>
                      Disponible para auspicio
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>La tanda comercial</h2>
          <p className="muted small">
            Los anuncios que salen en las pausas entre partidas y lobbies de cada transmisión.
          </p>
        </div>
        <div className="t-scroll">
          <table>
            <thead>
              <tr>
                <th>Anunciante</th>
                <th>Duración</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((sp) => {
                const s = marca(sp.sponsor)!;
                return (
                  <tr key={sp.sponsor}>
                    <td className="tag">
                      <span className="dot" style={{ background: s.color }} />
                      {s.name}
                    </td>
                    <td className="num small">{sp.segundos} s</td>
                    <td className="small muted">“{sp.texto}”</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section wrap stack">
        <div className="stack-sm">
          <h2>Anúnciate en OGM TV</h2>
          <p className="muted small">Cuatro formas de estar en el canal. Se combinan con el auspicio de un torneo.</p>
        </div>
        <div className="cards">
          {FORMATOS_TV.map((f) => (
            <div key={f.titulo} className="card">
              <h3>{f.titulo}</h3>
              <p className="small muted">{f.texto}</p>
            </div>
          ))}
        </div>
        <Link href="/marcas" className="btn">
          Hablemos de tu marca
        </Link>
      </section>
    </>
  );
}
