/**
 * Ultimos videos de un canal de YouTube por su feed publico (no hace falta
 * clave de API). Se revalida cada hora.
 */

export interface Video {
  id: string;
  title: string;
  published: string;
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function ultimosVideos(channelId: string): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
      id: e.match(/<yt:videoId>([^<]+)</)?.[1] ?? "",
      title: decode(e.match(/<title>([^<]+)</)?.[1] ?? ""),
      published: e.match(/<published>([^<]+)</)?.[1] ?? "",
    })).filter((v) => v.id);
  } catch (err) {
    console.error("Feed de YouTube fallo:", channelId, err);
    return [];
  }
}

/** El mas reciente que cumpla el filtro; si ninguno lo cumple, el mas reciente. */
export async function videoDestacado(channelId: string, filtro?: RegExp): Promise<Video | null> {
  const videos = await ultimosVideos(channelId);
  return (filtro && videos.find((v) => filtro.test(v.title))) || videos[0] || null;
}
