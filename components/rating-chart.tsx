import { fecha } from "@/lib/format";

/**
 * Grafica del rating de un jugador en un juego. SVG de servidor, sin
 * librerias. Arranca en 1000 (donde empiezan todos) y marca el ultimo valor.
 */
export function RatingChart({ points }: { points: { display: number; played_at: string }[] }) {
  if (points.length === 0) return null;

  const W = 560;
  const H = 180;
  const pad = { top: 18, right: 56, bottom: 28, left: 44 };
  const serie = [{ display: 1000, played_at: points[0].played_at }, ...points];

  const vals = serie.map((p) => p.display);
  const lo = Math.floor((Math.min(...vals) - 20) / 50) * 50;
  const hi = Math.ceil((Math.max(...vals) + 20) / 50) * 50;
  const x = (i: number) => pad.left + (i / (serie.length - 1)) * (W - pad.left - pad.right);
  const y = (v: number) => pad.top + (1 - (v - lo) / (hi - lo)) * (H - pad.top - pad.bottom);

  const path = serie.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.display).toFixed(1)}`).join(" ");
  const area = `${path} L${x(serie.length - 1).toFixed(1)},${H - pad.bottom} L${x(0).toFixed(1)},${H - pad.bottom} Z`;
  const ticks = [lo, Math.round((lo + hi) / 2 / 10) * 10, hi];
  const last = serie[serie.length - 1];
  const sube = last.display >= 1000;

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Rating de ${serie[0].display} a ${last.display}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="chart-label">
              {t}
            </text>
          </g>
        ))}
        {lo < 1000 && hi > 1000 && (
          <line x1={pad.left} x2={W - pad.right} y1={y(1000)} y2={y(1000)} className="chart-base" />
        )}
        <path d={area} className={sube ? "chart-area" : "chart-area chart-area-down"} />
        <path d={path} className={sube ? "chart-line" : "chart-line chart-line-down"} />
        {serie.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.display)} r={i === serie.length - 1 ? 5 : 2.5} className="chart-dot" />
        ))}
        <text x={x(serie.length - 1) + 10} y={y(last.display) + 4} className="chart-value">
          {last.display}
        </text>
        <text x={pad.left} y={H - 8} className="chart-label">
          Inicio · 1000
        </text>
        <text x={W - pad.right} y={H - 8} textAnchor="end" className="chart-label">
          {fecha(last.played_at)}
        </text>
      </svg>
    </div>
  );
}
