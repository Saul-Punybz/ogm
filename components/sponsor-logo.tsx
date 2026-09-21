import type { Marca } from "@/data/sponsors";

/**
 * Logo generado para las marcas de EJEMPLO: un simbolo sencillo y el nombre.
 * Cuando haya auspiciadores reales, se usa su logo oficial en su lugar.
 */

function Simbolo({ marca, color }: { marca: Marca; color: string }) {
  switch (marca) {
    case "ola":
      return (
        <g fill="none" stroke={color} strokeWidth="5" strokeLinecap="round">
          <path d="M6 30 Q16 18 26 30 T46 30" />
          <path d="M6 42 Q16 30 26 42 T46 42" opacity="0.55" />
        </g>
      );
    case "rayo":
      return <polygon points="28,4 10,32 24,32 18,52 42,20 28,20 34,4" fill={color} />;
    case "pixel":
      return (
        <g fill={color}>
          {[[8, 8], [22, 8], [36, 8], [8, 22], [36, 22], [8, 36], [22, 36], [36, 36]].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="11" height="11" />
          ))}
          <rect x="22" y="22" width="11" height="11" opacity="0.4" />
        </g>
      );
    case "taza":
      return (
        <g fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round">
          <path d="M8 18 H38 V38 Q38 48 28 48 H18 Q8 48 8 38 Z" />
          <path d="M38 24 Q48 24 48 31 Q48 38 38 38" />
        </g>
      );
    case "flecha":
      return <polygon points="6,8 48,28 6,48 16,28" fill={color} />;
    case "onda":
      return (
        <g fill={color}>
          {[10, 18, 26, 34, 42].map((x, i) => {
            const h = [14, 30, 42, 26, 12][i];
            return <rect key={x} x={x - 3} y={28 - h / 2} width="6" height={h} rx="3" />;
          })}
        </g>
      );
  }
}

export function SponsorLogo({
  name,
  marca,
  color,
  size = "md",
}: {
  name: string;
  marca: Marca;
  color: string;
  size?: "md" | "lg";
}) {
  const h = size === "lg" ? 72 : 48;
  return (
    <svg
      viewBox={`0 0 ${56 + name.length * 19} 56`}
      height={h}
      role="img"
      aria-label={name}
      className="sponsor-logo"
    >
      <Simbolo marca={marca} color={color} />
      <text
        x="62"
        y="37"
        fill="var(--cream)"
        fontFamily="Archivo Black, Impact, sans-serif"
        fontSize="26"
        letterSpacing="-0.5"
      >
        {name}
      </text>
    </svg>
  );
}
