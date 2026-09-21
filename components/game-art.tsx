/**
 * Visual de cada juego: arte propio de OGM (composiciones abstractas en la
 * paleta de la marca que representan la MECANICA del juego) con la imagen
 * oficial encima para identificarlo (GameVisual, al final del archivo).
 *
 *   battle royale -> la zona que se cierra, escuadras dispersas
 *   uno contra uno -> la arena partida en dos, el reloj
 *   pelea          -> el corte diagonal, lineas de velocidad
 */

const INK = "#1C1C1A";
const NAVY = "#16336F";
const CREAM = "#F0EEDF";
const PERI = "#B1BFE2";
const FLARE = "#FE492A";

type Art = (seed: number) => React.ReactNode;

/** Pseudoaleatorio estable: el mismo juego se dibuja igual en cada render. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hash(text: string) {
  let h = 7;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return h;
}

const zona: Art = (seed) => {
  const r = rng(seed);
  const squads = Array.from({ length: 7 }, () => ({ x: 30 + r() * 340, y: 25 + r() * 175 }));
  return (
    <>
      <rect width="400" height="225" fill={NAVY} />
      {[190, 150, 110].map((rad, i) => (
        <circle key={rad} cx="250" cy="112" r={rad} fill="none" stroke={PERI} strokeOpacity={0.14 + i * 0.06} strokeWidth="1" />
      ))}
      <circle cx="250" cy="112" r="70" fill={FLARE} fillOpacity="0.08" stroke={FLARE} strokeWidth="2.5" strokeDasharray="7 6" />
      {squads.map((s, i) => (
        <g key={i} fill={i === 0 ? FLARE : CREAM} fillOpacity={i === 0 ? 1 : 0.75}>
          <circle cx={s.x} cy={s.y} r="3.2" />
          <circle cx={s.x + 8} cy={s.y + 1} r="3.2" />
          <circle cx={s.x + 2} cy={s.y + 8} r="3.2" />
          <circle cx={s.x + 10} cy={s.y + 9} r="3.2" />
        </g>
      ))}
    </>
  );
};

const arena: Art = () => (
  <>
    <rect width="400" height="225" fill={INK} />
    <rect width="200" height="225" fill={NAVY} />
    <rect x="193" width="14" height="225" fill={PERI} fillOpacity="0.35" />
    {[
      [60, 50], [60, 155], [120, 102],
      [320, 50], [320, 155], [262, 102],
    ].map(([x, y], i) => (
      <rect key={i} x={x - 14} y={y - 14} width="28" height="28" fill="none" stroke={i < 3 ? CREAM : FLARE} strokeWidth="2.5" />
    ))}
    <circle cx="200" cy="112" r="34" fill={INK} stroke={FLARE} strokeWidth="3" />
    <text x="200" y="120" textAnchor="middle" fill={CREAM} fontFamily="IBM Plex Mono, monospace" fontSize="20" fontWeight="600">
      3:00
    </text>
  </>
);

const corte: Art = (seed) => {
  const r = rng(seed);
  const lines = Array.from({ length: 14 }, () => ({ y: r() * 225, w: 40 + r() * 140, x: r() * 260 }));
  return (
    <>
      <rect width="400" height="225" fill={INK} />
      <polygon points="0,0 250,0 150,225 0,225" fill={NAVY} />
      {lines.map((l, i) => (
        <rect key={i} x={l.x} y={l.y} width={l.w} height="2" fill={i % 3 === 0 ? FLARE : PERI} fillOpacity={i % 3 === 0 ? 0.9 : 0.35} />
      ))}
      <polygon points="238,0 262,0 162,225 138,225" fill={FLARE} />
      <text x="330" y="132" textAnchor="middle" fill={CREAM} fontFamily="Archivo Black, Impact, sans-serif" fontSize="44">
        VS
      </text>
    </>
  );
};

const embudo: Art = (seed) => {
  const r = rng(seed);
  const dots = Array.from({ length: 32 }, (_, i) => {
    const t = i / 31;
    const spread = 180 * (1 - t) + 10;
    return { x: 200 + (r() - 0.5) * spread * 2, y: 20 + t * 180, last: i > 28 };
  });
  return (
    <>
      <rect width="400" height="225" fill={NAVY} />
      <polygon points="20,10 380,10 215,215 185,215" fill={PERI} fillOpacity="0.08" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="4.5" fill={d.last ? FLARE : CREAM} fillOpacity={d.last ? 1 : 0.7} />
      ))}
    </>
  );
};

const carriles: Art = () => (
  <>
    <rect width="400" height="225" fill={INK} />
    {[45, 112, 180].map((y) => (
      <rect key={y} x="0" y={y - 10} width="400" height="20" fill={NAVY} />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <circle cx={40 + i * 16} cy={112} r="6" fill={CREAM} />
        <circle cx={360 - i * 16} cy={112} r="6" fill={FLARE} />
      </g>
    ))}
    <text x="200" y="120" textAnchor="middle" fill={PERI} fontFamily="IBM Plex Mono, monospace" fontSize="18" fontWeight="600">
      5 v 5
    </text>
  </>
);

const mira: Art = (seed) => {
  const r = rng(seed);
  return (
    <>
      <rect width="400" height="225" fill={INK} />
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={r() * 400} cy={r() * 225} r="2" fill={PERI} fillOpacity="0.4" />
      ))}
      <circle cx="200" cy="112" r="62" fill="none" stroke={CREAM} strokeWidth="2" />
      <circle cx="200" cy="112" r="6" fill={FLARE} />
      <rect x="120" y="111" width="50" height="2.5" fill={CREAM} />
      <rect x="230" y="111" width="50" height="2.5" fill={CREAM} />
      <rect x="199" y="32" width="2.5" height="50" fill={CREAM} />
      <rect x="199" y="142" width="2.5" height="50" fill={CREAM} />
    </>
  );
};

const archivo: Art = () => (
  <>
    <rect width="400" height="225" fill={INK} />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x="0" y={i * 25} width="400" height="1" fill={PERI} fillOpacity="0.12" />
    ))}
    <text x="200" y="135" textAnchor="middle" fill={PERI} fillOpacity="0.4" fontFamily="Archivo Black, Impact, sans-serif" fontSize="64">
      2010
    </text>
  </>
);

const POR_JUEGO: Record<string, Art> = {
  "free-fire": zona,
  "clash-royale": arena,
  brawlhalla: corte,
  "stumble-guys": embudo,
  "mobile-legends": carriles,
  "cod-mobile": mira,
  sf6: corte,
};

const POR_FORMATO: Record<string, Art> = { br: zona, duel: arena, squad: carriles };

export function GameArt({
  slug,
  mode,
  archive = false,
  className,
}: {
  slug: string;
  mode: string;
  archive?: boolean;
  className?: string;
}) {
  const art = archive ? archivo : (POR_JUEGO[slug] ?? POR_FORMATO[mode] ?? zona);
  return (
    <svg
      viewBox="0 0 400 225"
      preserveAspectRatio="xMidYMid slice"
      className={className ?? "game-art"}
      role="img"
      aria-label={`Ilustración de ${slug}`}
    >
      {art(hash(slug))}
    </svg>
  );
}

/**
 * Imagenes oficiales de cada juego (public/juegos/, fuentes en FUENTES.md).
 * Tres tipos, porque Wikipedia trae lo que trae:
 *   cover -> portada vertical, se coloca como caja sobre el arte
 *   logo  -> logo con transparencia, centrado sobre el arte
 *   wide  -> imagen horizontal, ocupa todo el cuadro
 */
type Img = { src: string; kind: "cover" | "logo" | "wide"; position?: string };

const IMAGENES: Record<string, Img & { juego?: Img; torneo?: Img }> = {
  "free-fire": { src: "/juegos/free-fire.jpg", kind: "cover" },
  // Clash Royale: imagenes que dio Saul (21 sep 2026), mejores que el logo de Wikipedia.
  "clash-royale": {
    src: "/juegos/clash-royale/poster.jpg",
    kind: "cover",
    // En cabeceras van como cuadro sobre el arte: estiradas a lo ancho se ven borrosas.
    juego: { src: "/juegos/clash-royale/versus.jpg", kind: "cover" },
    torneo: { src: "/juegos/clash-royale/rey.jpg", kind: "cover" },
  },
  brawlhalla: { src: "/juegos/brawlhalla.jpg", kind: "cover" },
  "mobile-legends": { src: "/juegos/mobile-legends.png", kind: "logo" },
  "cod-mobile": { src: "/juegos/cod-mobile.png", kind: "logo" },
  "stumble-guys": { src: "/juegos/stumble-guys.jpg", kind: "wide" },
  sf6: { src: "/juegos/sf6.jpg", kind: "cover" },
  mw2: { src: "/juegos/mw2.png", kind: "cover" },
  "halo-reach": { src: "/juegos/halo-reach.png", kind: "cover" },
  ssf4: { src: "/juegos/ssf4.jpg", kind: "cover" },
};

/**
 * variant: "card" para tarjetas; "juego" y "torneo" para cabeceras, que usan
 * una imagen grande propia si el juego la tiene.
 */
export function GameVisual({
  slug,
  mode,
  name,
  archive = false,
  variant = "card",
  className,
}: {
  slug: string;
  mode: string;
  name: string;
  archive?: boolean;
  variant?: "card" | "juego" | "torneo";
  className?: string;
}) {
  const base = IMAGENES[slug];
  const img: Img | undefined = (variant !== "card" && base?.[variant]) || base;
  return (
    <div className={`gv ${className ?? ""}`}>
      {img?.kind !== "wide" && <GameArt slug={slug} mode={mode} archive={archive} className="gv-art" />}
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.src}
          alt={name}
          className={`gv-${img.kind}`}
          style={img.position ? { objectPosition: img.position } : undefined}
          loading="lazy"
        />
      )}
    </div>
  );
}
