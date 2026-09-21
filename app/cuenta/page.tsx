import Link from "next/link";
import { getSession } from "@/lib/session";
import { discordConfigured } from "@/lib/discord";
import { one, q } from "@/lib/db";
import { ActionForm } from "@/components/forms";
import { crearPerfil, reclamarPerfil, actualizarPerfil, salir } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta" };

const ERRORES: Record<string, string> = {
  config:
    "El login con Discord todavía no está configurado en este servidor (faltan DISCORD_CLIENT_ID y DISCORD_CLIENT_SECRET).",
  estado: "La sesión de Discord expiró o no coincide. Intenta entrar otra vez.",
  discord: "Discord no respondió como se esperaba. Intenta de nuevo en un minuto.",
};

export default async function Cuenta({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();

  if (!session) {
    return (
      <section className="hero wrap stack">
        <div className="eyebrow">Tu cuenta</div>
        <h1>Entra con Discord</h1>
        <p className="muted">
          Tu cuenta de Discord es tu identidad en OGM: con ella reclamas tu perfil, apareces en
          el ranking con tu nombre y te inscribes en torneos.
        </p>
        {error && ERRORES[error] && <p className="banner">{ERRORES[error]}</p>}
        {discordConfigured() ? (
          <a href="/api/auth/discord" className="btn">
            Entrar con Discord
          </a>
        ) : (
          !error && <p className="banner">{ERRORES.config}</p>
        )}
      </section>
    );
  }

  const player = await one<{ tag: string; town: string | null; twitch: string | null; tiktok: string | null }>(
    `SELECT tag, town, twitch, tiktok FROM players WHERE discord_id = $1`,
    [session.discordId],
  );
  const reclamos = await q<{ tag: string; status: string }>(
    `SELECT p.tag, c.status FROM profile_claims c JOIN players p ON p.id = c.player_id
      WHERE c.discord_id = $1 ORDER BY c.created_at DESC`,
    [session.discordId],
  );

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Conectado como {session.name}</div>
        <h1>{player ? player.tag : "Tu perfil"}</h1>
        {player && (
          <Link href={`/jugadores/${encodeURIComponent(player.tag)}`} className="small">
            Ver mi perfil público →
          </Link>
        )}
        <form action={salir}>
          <button className="ghost" type="submit">
            Salir
          </button>
        </form>
      </section>

      {player ? (
        <section className="section wrap stack">
          <h2>Editar perfil</h2>
          <ActionForm action={actualizarPerfil} submit="Guardar">
            <div className="field">
              <label htmlFor="town">Pueblo</label>
              <input id="town" name="town" defaultValue={player.town ?? ""} placeholder="Bayamón" />
            </div>
            <div className="field">
              <label htmlFor="twitch">Twitch</label>
              <input id="twitch" name="twitch" defaultValue={player.twitch ?? ""} placeholder="tu_canal" />
            </div>
            <div className="field">
              <label htmlFor="tiktok">TikTok</label>
              <input id="tiktok" name="tiktok" defaultValue={player.tiktok ?? ""} placeholder="@tu_usuario" />
            </div>
          </ActionForm>
        </section>
      ) : (
        <>
          {reclamos.length > 0 && (
            <section className="section wrap stack">
              <h2>Tus reclamos</h2>
              {reclamos.map((r) => (
                <p key={r.tag} className="note">
                  {r.tag}: {r.status === "pendiente" ? "esperando que un admin confirme" : r.status}
                </p>
              ))}
            </section>
          )}

          <section className="section wrap stack">
            <h2>¿Ya jugaste en OGM?</h2>
            <p className="muted small">
              Si tu gamertag ya sale en el ranking, reclámalo. Si tiene partidas, un admin confirma
              que eres tú antes de enlazarlo.
            </p>
            <ActionForm action={reclamarPerfil} submit="Reclamar perfil">
              <div className="field">
                <label htmlFor="claim-tag">Gamertag</label>
                <input id="claim-tag" name="tag" placeholder="GloKing" />
              </div>
            </ActionForm>
          </section>

          <section className="section wrap stack">
            <h2>¿Primera vez?</h2>
            <p className="muted small">Crea tu perfil. Empiezas en 1000 en cada juego que juegues.</p>
            <ActionForm action={crearPerfil} submit="Crear perfil">
              <div className="field">
                <label htmlFor="new-tag">Gamertag</label>
                <input id="new-tag" name="tag" placeholder="Tu gamertag" />
              </div>
              <div className="field">
                <label htmlFor="new-town">Pueblo</label>
                <input id="new-town" name="town" placeholder="Opcional" />
              </div>
            </ActionForm>
          </section>
        </>
      )}
    </>
  );
}
