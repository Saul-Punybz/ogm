import { ESCENA, type Fuente } from "@/data/streams";
import { videoDestacado } from "@/lib/youtube";
import { fecha } from "@/lib/format";
import { YouTubeLite } from "./youtube-lite";
import { TwitchPlayer } from "./twitch-player";

/** Tarjeta de una fuente: el video destacado de YouTube o el canal de Twitch. */
async function FuenteCard({ f, juego }: { f: Fuente; juego?: string }) {
  const video = f.plataforma === "youtube" ? await videoDestacado(f.id, f.filtro) : null;
  if (f.plataforma === "youtube" && !video) return null;

  const url =
    f.plataforma === "youtube" ? `https://www.youtube.com/watch?v=${video!.id}` : `https://www.twitch.tv/${f.id}`;

  return (
    <article className="stream">
      {f.plataforma === "youtube" ? (
        <YouTubeLite id={video!.id} title={video!.title} />
      ) : (
        <TwitchPlayer channel={f.id} />
      )}
      <div className="stream-body">
        <div className="row-between">
          <span className={f.plataforma === "twitch" ? "pill pill-twitch" : "pill pill-yt"}>
            {f.plataforma === "twitch" ? "Twitch" : "YouTube"}
          </span>
          {juego && <span className="small muted">{juego}</span>}
        </div>
        <b>{video ? video.title : f.nombre}</b>
        <span className="small muted">
          {f.nombre}
          {video ? ` · ${fecha(video.published)}` : ""}
        </span>
        <span className="small muted">{f.nota}</span>
        <a href={url} target="_blank" rel="noreferrer" className="small">
          Abrir en {f.plataforma === "twitch" ? "Twitch" : "YouTube"} →
        </a>
      </div>
    </article>
  );
}

/** La escena de uno o varios juegos. */
export async function SceneStreams({
  juegos,
  nombres = {},
  max,
}: {
  juegos: string[];
  nombres?: Record<string, string>;
  max?: number;
}) {
  const fuentes = juegos.flatMap((j) => (ESCENA[j] ?? []).map((f) => ({ f, j })));
  const lista = max ? fuentes.slice(0, max) : fuentes;
  if (lista.length === 0) return null;
  return (
    <div className="streams">
      {lista.map(({ f, j }) => (
        <FuenteCard key={`${j}-${f.id}`} f={f} juego={nombres[j]} />
      ))}
    </div>
  );
}
