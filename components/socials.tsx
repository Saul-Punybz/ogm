/**
 * Redes de un jugador. En perfiles de EJEMPLO los usuarios son inventados:
 * se muestran sin enlace, porque un usuario inventado puede pertenecer a una
 * persona real en esa red. En perfiles reales, enlazan.
 */

const REDES = [
  { key: "twitch", label: "Twitch", url: (u: string) => `https://www.twitch.tv/${u}` },
  { key: "tiktok", label: "TikTok", url: (u: string) => `https://www.tiktok.com/@${u}` },
  { key: "instagram", label: "Instagram", url: (u: string) => `https://www.instagram.com/${u}` },
  { key: "youtube", label: "YouTube", url: (u: string) => `https://www.youtube.com/@${u}` },
] as const;

type Redes = Partial<Record<(typeof REDES)[number]["key"], string | null>>;

export function Socials({ redes, example }: { redes: Redes; example: boolean }) {
  const activas = REDES.filter((r) => redes[r.key]);
  if (activas.length === 0) return null;
  return (
    <div className="socials">
      {activas.map((r) => {
        const user = redes[r.key]!;
        const texto = (
          <>
            <b>{r.label}</b> @{user}
          </>
        );
        return example ? (
          <span key={r.key} className="social social-off" title="Usuario de ejemplo">
            {texto}
          </span>
        ) : (
          <a key={r.key} href={r.url(user)} target="_blank" rel="noreferrer" className="social">
            {texto}
          </a>
        );
      })}
      {example && <span className="small muted">usuarios de ejemplo</span>}
    </div>
  );
}
