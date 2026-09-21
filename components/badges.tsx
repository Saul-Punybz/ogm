import type { BadgeDef, Progreso, Tier } from "@/lib/badges";

/** Insignias: escudo hexagonal con un simbolo, color segun el nivel de la insignia. */

const TIER: Record<Tier, { fill: string; ring: string }> = {
  oro: { fill: "#F2C230", ring: "#FFE08A" },
  plata: { fill: "#B1BFE2", ring: "#E3E9F7" },
  bronce: { fill: "#B07A4F", ring: "#D9A77E" },
  marca: { fill: "#FE492A", ring: "#FF9C8A" },
};

const INK = "#1C1C1A";

function Icono({ icon }: { icon: string }) {
  switch (icon) {
    case "corona":
      return <polygon points="14,34 14,20 20,26 26,16 32,26 38,20 38,34" fill={INK} />;
    case "uno":
      return (
        <text x="26" y="36" textAnchor="middle" fontFamily="Archivo Black, Impact, sans-serif" fontSize="22" fill={INK}>
          1
        </text>
      );
    case "laurel":
      return (
        <>
          <path d="M16 34 Q12 24 18 16" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M36 34 Q40 24 34 16" fill="none" stroke={INK} strokeWidth="3" />
          <text x="26" y="30" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="600" fontSize="8" fill={INK}>
            2010
          </text>
        </>
      );
    case "podio":
      return (
        <g fill={INK}>
          <rect x="21" y="18" width="10" height="18" />
          <rect x="11" y="24" width="10" height="12" />
          <rect x="31" y="28" width="10" height="8" />
        </g>
      );
    case "estrella":
      return <polygon points="26,14 29.5,23 39,23 31.5,28.5 34.5,38 26,32 17.5,38 20.5,28.5 13,23 22.5,23" fill={INK} />;
    case "espada":
      return (
        <g fill={INK}>
          <polygon points="33,13 37,17 22,32 18,28" />
          <rect x="14" y="31" width="10" height="4" transform="rotate(-45 19 33)" />
        </g>
      );
    case "llama":
      return <path d="M26 13 C32 21 36 25 34 31 C32 37 20 37 18 31 C16 26 21 24 22 19 C24 23 26 23 26 13 Z" fill={INK} />;
    case "zona":
      return (
        <g fill="none" stroke={INK} strokeWidth="3">
          <circle cx="26" cy="26" r="10" strokeDasharray="4 3" />
          <circle cx="26" cy="26" r="3" fill={INK} />
        </g>
      );
    case "mira":
      return (
        <g stroke={INK} strokeWidth="3" fill="none">
          <circle cx="26" cy="26" r="9" />
          <line x1="26" y1="12" x2="26" y2="19" />
          <line x1="26" y1="33" x2="26" y2="40" />
          <line x1="12" y1="26" x2="19" y2="26" />
          <line x1="33" y1="26" x2="40" y2="26" />
        </g>
      );
    case "cuadros":
      return (
        <g fill={INK}>
          <rect x="15" y="15" width="9" height="9" />
          <rect x="28" y="15" width="9" height="9" />
          <rect x="15" y="28" width="9" height="9" />
          <rect x="28" y="28" width="9" height="9" opacity="0.45" />
        </g>
      );
    case "play":
      return <polygon points="21,16 37,26 21,36" fill={INK} />;
    case "check":
      return <polyline points="16,27 23,34 37,18" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />;
    default:
      return null;
  }
}

export function BadgeIcon({ badge, locked = false, size = 44 }: { badge: BadgeDef; locked?: boolean; size?: number }) {
  const t = TIER[badge.tier];
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} role="img" aria-label={badge.name} className={locked ? "badge-locked" : undefined}>
      <polygon points="26,2 47,14 47,38 26,50 5,38 5,14" fill={locked ? "#2A2A27" : t.fill} stroke={locked ? "#3A3A36" : t.ring} strokeWidth="2.5" />
      <g opacity={locked ? 0.35 : 1}>
        <Icono icon={badge.icon} />
      </g>
    </svg>
  );
}

/** Fila compacta de insignias ganadas, para tarjetas. */
export function BadgeRow({ progreso, max = 6 }: { progreso: Progreso; max?: number }) {
  if (progreso.earned.length === 0) return null;
  const extra = progreso.earned.length - max;
  return (
    <div className="badge-row">
      {progreso.earned.slice(0, max).map((b) => (
        <span key={b.id} className="badge-mini" title={`${b.name}: ${b.desc}`}>
          <BadgeIcon badge={b} size={30} />
          {b.count > 1 && <span className="badge-count">×{b.count}</span>}
        </span>
      ))}
      {extra > 0 && <span className="small muted">+{extra}</span>}
    </div>
  );
}

/** Nivel con barra de progreso al siguiente. */
export function Level({ progreso }: { progreso: Progreso }) {
  const { level, xp, levelXp, nextXp } = progreso;
  const pct = nextXp ? Math.round(((xp - levelXp) / (nextXp - levelXp)) * 100) : 100;
  return (
    <div className="level">
      <span className="level-num">
        <small>Nivel</small>
        {level}
      </span>
      <div className="level-bar-wrap">
        <div className="level-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="small muted num">
          {xp} XP{nextXp ? ` · faltan ${nextXp - xp} para el nivel ${level + 1}` : " · nivel máximo"}
        </span>
      </div>
    </div>
  );
}

/** Vitrina completa: ganadas con descripcion, y las que faltan en gris. */
export function BadgeCase({ progreso }: { progreso: Progreso }) {
  return (
    <div className="badge-case">
      {progreso.earned.map((b) => (
        <div key={b.id} className="badge-item">
          <BadgeIcon badge={b} size={52} />
          <div>
            <b>
              {b.name}
              {b.count > 1 ? ` ×${b.count}` : ""}
            </b>
            <span className="small muted">{b.desc}</span>
            <span className="small num badge-xp">+{b.xp} XP</span>
          </div>
        </div>
      ))}
      {progreso.locked.map((b) => (
        <div key={b.id} className="badge-item badge-item-locked">
          <BadgeIcon badge={b} locked size={52} />
          <div>
            <b>{b.name}</b>
            <span className="small muted">{b.desc}</span>
            <span className="small num muted">Por ganar · {b.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}
