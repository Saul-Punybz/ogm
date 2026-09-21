import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

/**
 * Foto del jugador, en este orden:
 *   1. Su foto de Discord, si entro con Discord.
 *   2. Jugadores de EJEMPLO: ilustracion de DiceBear "Notionists" (diseño CC0,
 *      codigo MIT), la misma siempre para el mismo gamertag.
 *   3. Jugadores reales sin foto (p. ej. los campeones de 2010): sus iniciales.
 *      A una persona real no se le inventa cara.
 */

const FONDOS = ["#16336F", "#2A2A27", "#3B2A5A", "#6B2A1E", "#1F4A4A"];
const FONDOS_ILUSTRACION = ["b1bfe2", "f0eedf", "fe492a", "c9d3ee", "e8dcc4"];

function indice(tag: string, n: number) {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % n;
}

function iniciales(tag: string) {
  const letras = tag.replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/g, "");
  return (letras.slice(0, 2) || "?").toUpperCase();
}

const cache = new Map<string, string>();

function ilustracion(tag: string): string {
  const hit = cache.get(tag);
  if (hit) return hit;
  const uri = createAvatar(notionists, {
    seed: tag,
    backgroundColor: [FONDOS_ILUSTRACION[indice(tag, FONDOS_ILUSTRACION.length)]],
  }).toDataUri();
  cache.set(tag, uri);
  return uri;
}

export function Avatar({
  tag,
  url,
  example = false,
  size = 32,
}: {
  tag: string;
  url?: string | null;
  example?: boolean;
  size?: number;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  const src = url ?? (example ? ilustracion(tag) : null);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="avatar" style={style} loading="lazy" />;
  }
  return (
    <span
      className="avatar avatar-initials"
      style={{ ...style, background: FONDOS[indice(tag, FONDOS.length)] }}
      aria-hidden="true"
    >
      {iniciales(tag)}
    </span>
  );
}
