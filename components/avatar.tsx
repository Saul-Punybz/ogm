/**
 * Foto del jugador. Si entro con Discord usamos su foto; si no, sus iniciales
 * sobre un color de la marca que sale siempre igual para el mismo gamertag.
 */

const FONDOS = ["#16336F", "#2A2A27", "#3B2A5A", "#6B2A1E", "#1F4A4A"];

function colorFor(tag: string) {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % 997;
  return FONDOS[h % FONDOS.length];
}

function iniciales(tag: string) {
  const letras = tag.replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/g, "");
  return (letras.slice(0, 2) || "?").toUpperCase();
}

export function Avatar({
  tag,
  url,
  size = 32,
}: {
  tag: string;
  url?: string | null;
  size?: number;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="avatar" style={style} loading="lazy" />;
  }
  return (
    <span className="avatar avatar-initials" style={{ ...style, background: colorFor(tag) }} aria-hidden="true">
      {iniciales(tag)}
    </span>
  );
}
