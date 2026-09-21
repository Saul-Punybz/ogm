"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/**
 * Twitch grande para la pagina En vivo: video con chat. En pantallas angostas
 * no se incrusta (Twitch exige minimo 400x300 visible); se ofrece abrir la app.
 */

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

export function TwitchLive({ channel, url }: { channel: string; url: string }) {
  const [wide, setWide] = useState(false);
  const [sdk, setSdk] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 860px)");
    setWide(mq.matches);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!sdk || !wide || mounted.current) return;
    const Twitch = (window as unknown as { Twitch?: TwitchGlobal }).Twitch;
    if (!Twitch) return;
    mounted.current = true;
    const embed = new Twitch.Embed("ogm-twitch-live", {
      width: "100%",
      height: "100%",
      channel,
      layout: "video-with-chat",
      autoplay: true,
      muted: true,
      theme: "dark",
      parent: [window.location.hostname],
    });
    embed.addEventListener(Twitch.Embed.ONLINE, () => setLive(true));
    embed.addEventListener(Twitch.Embed.OFFLINE, () => setLive(false));
  }, [sdk, wide, channel]);

  return (
    <div className="stack-sm">
      <div className="row-between">
        <span className={live ? "pill pill-live" : "pill"}>
          {live === null ? `twitch.tv/${channel}` : live ? "En vivo ahora" : "Fuera del aire"}
        </span>
        <a href={url} target="_blank" rel="noreferrer" className="small">
          Abrir en Twitch →
        </a>
      </div>
      {wide ? (
        <>
          <Script src="https://embed.twitch.tv/embed/v1.js" onLoad={() => setSdk(true)} />
          <div className="live-player">
            <div id="ogm-twitch-live" />
          </div>
        </>
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="btn">
          Ver la transmisión en la app de Twitch
        </a>
      )}
    </div>
  );
}
