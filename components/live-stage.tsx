"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * El "escenario" de la portada: cuenta regresiva al proximo torneo y, en
 * pantallas anchas, el reproductor de Twitch. Cuando el canal sale en vivo, el
 * reproductor avisa (evento ONLINE) y la tarjeta cambia a "En vivo ahora".
 *
 * Twitch pide que el reproductor mida al menos 400x300 y este visible, asi que
 * en celular no se incrusta: se ofrece el boton para abrir Twitch.
 */

interface Next {
  name: string;
  slug: string;
  startsAt: string;
  venue: string | null;
  game: string;
}

// Tipos minimos del SDK de Twitch (embed.twitch.tv/embed/v1.js). Verificado en
// el navegador: los eventos ONLINE/OFFLINE cuelgan de Twitch.Embed y se escuchan
// en el embed; el objeto de getPlayer() no tiene addEventListener.
interface TwitchEmbed {
  addEventListener(event: string, cb: () => void): void;
}
interface TwitchGlobal {
  Embed: {
    new (id: string, opts: Record<string, unknown>): TwitchEmbed;
    ONLINE: string;
    OFFLINE: string;
  };
}

const MIN_ANCHO = "(min-width: 860px)";

function channelFromUrl(url: string): string | null {
  const m = url.match(/twitch\.tv\/([A-Za-z0-9_]+)/);
  return m ? m[1] : null;
}

function faltan(iso: string, now: number) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const min = Math.floor(ms / 60000);
  return { dias: Math.floor(min / 1440), horas: Math.floor((min % 1440) / 60), minutos: min % 60 };
}

export function LiveStage({
  twitchUrl,
  next,
  fechaTexto,
  example = false,
}: {
  twitchUrl: string | null;
  example?: boolean;
  next: Next | null;
  fechaTexto: string | null;
}) {
  const channel = twitchUrl ? channelFromUrl(twitchUrl) : null;
  const [now, setNow] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [wide, setWide] = useState(false);
  const [sdk, setSdk] = useState(false);
  const mounted = useRef(false);

  // La hora se toma en el navegador para no desfasar servidor y cliente.
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    const mq = window.matchMedia(MIN_ANCHO);
    setWide(mq.matches);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      clearInterval(t);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (!sdk || !wide || !channel || mounted.current) return;
    const Twitch = (window as unknown as { Twitch?: TwitchGlobal }).Twitch;
    if (!Twitch) return;
    mounted.current = true;
    const embed = new Twitch.Embed("ogm-twitch", {
      width: "100%",
      height: "100%",
      channel,
      layout: "video",
      autoplay: true,
      muted: true,
      parent: [window.location.hostname],
    });
    embed.addEventListener(Twitch.Embed.ONLINE, () => setLive(true));
    embed.addEventListener(Twitch.Embed.OFFLINE, () => setLive(false));
  }, [sdk, wide, channel]);

  const cuenta = next && now != null ? faltan(next.startsAt, now) : null;

  return (
    <div className={`stage ${wide && channel ? "stage-split" : ""}`}>
      {channel && wide && (
        <Script src="https://embed.twitch.tv/embed/v1.js" onLoad={() => setSdk(true)} />
      )}

      <div className="stage-card">
        {live ? (
          <>
            <span className="pill pill-live">{example ? "En vivo · canal de ejemplo" : "En vivo ahora"}</span>
            <h2 className="stage-title">{example ? `${channel} está en vivo` : "Estamos transmitiendo"}</h2>
            <p className="muted small">
              {example
                ? "Canal de ejemplo para mostrar cómo se ve la portada durante una transmisión. No está afiliado a OGM."
                : "Entra al chat y mira la liga en directo."}
            </p>
          </>
        ) : next ? (
          <>
            <div className="eyebrow">Próximo en la liga · {next.game}</div>
            <h2 className="stage-title">{next.name}</h2>
            {cuenta ? (
              <div className="countdown" aria-label="Tiempo para el torneo">
                <div>
                  <b className="num">{cuenta.dias}</b>
                  <span>días</span>
                </div>
                <div>
                  <b className="num">{String(cuenta.horas).padStart(2, "0")}</b>
                  <span>horas</span>
                </div>
                <div>
                  <b className="num">{String(cuenta.minutos).padStart(2, "0")}</b>
                  <span>min</span>
                </div>
              </div>
            ) : (
              <p className="muted">{fechaTexto}</p>
            )}
            <p className="small muted">
              {fechaTexto}
              {next.venue ? ` · ${next.venue}` : ""}
            </p>
          </>
        ) : (
          <>
            <div className="eyebrow">La liga</div>
            <h2 className="stage-title">Próximas fechas por anunciar</h2>
          </>
        )}

        <div className="hero-actions">
          {next && !live && (
            <Link href={`/torneos/${next.slug}`} className="btn">
              Ver el torneo
            </Link>
          )}
          {twitchUrl && (
            <a href={twitchUrl} target="_blank" rel="noreferrer" className="btn ghost">
              {live ? "Abrir en Twitch" : "Seguir en Twitch"}
            </a>
          )}
        </div>
      </div>

      {channel && wide && (
        <div className="stage-player">
          <div id="ogm-twitch" />
        </div>
      )}
    </div>
  );
}
