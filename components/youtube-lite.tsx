"use client";

import { useState } from "react";

/**
 * Video de YouTube que solo carga el reproductor al darle play: hasta entonces
 * es una imagen. Asi una pagina con varios videos no carga varios reproductores.
 */
export function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  if (on) {
    return (
      <div className="yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button type="button" className="yt yt-poster" onClick={() => setOn(true)} aria-label={`Reproducir: ${title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="yt-play" aria-hidden="true" />
    </button>
  );
}
