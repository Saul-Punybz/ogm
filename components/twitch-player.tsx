"use client";

import { useEffect, useState } from "react";

/**
 * Reproductor simple de un canal de Twitch. Twitch exige declarar el dominio
 * (parent) y un tamano minimo de 400x300: en pantallas angostas se ofrece el
 * enlace en vez del reproductor.
 */
export function TwitchPlayer({ channel }: { channel: string }) {
  const [host, setHost] = useState<string | null>(null);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    setHost(window.location.hostname);
    setWide(window.matchMedia("(min-width: 700px)").matches);
  }, []);

  if (!host || !wide) {
    return (
      <a className="yt yt-link" href={`https://www.twitch.tv/${channel}`} target="_blank" rel="noreferrer">
        <span>Ver twitch.tv/{channel} →</span>
      </a>
    );
  }
  return (
    <div className="yt yt-twitch">
      <iframe
        src={`https://player.twitch.tv/?channel=${channel}&parent=${host}&muted=true&autoplay=false`}
        title={`Twitch: ${channel}`}
        allowFullScreen
      />
    </div>
  );
}
