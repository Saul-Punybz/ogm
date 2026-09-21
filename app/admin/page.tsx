import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getAllTournaments, getCounts } from "@/lib/queries";
import { fecha } from "@/lib/format";
import { ActionForm } from "@/components/forms";
import { login, logout, recalcular } from "./actions";
import { resolverReclamo } from "../cuenta/actions";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel" };

export default async function Admin() {
  if (!(await isAdmin())) {
    return (
      <section className="hero wrap stack">
        <div className="eyebrow">Panel</div>
        <h1>Entrar</h1>
        <p className="muted small">
          Clave compartida del panel. Se cambia en la variable ADMIN_PASSWORD.
        </p>
        <ActionForm action={login} submit="Entrar">
          <div className="field">
            <label htmlFor="password">Clave</label>
            <input id="password" name="password" type="password" autoComplete="current-password" />
          </div>
        </ActionForm>
      </section>
    );
  }

  const [tournaments, counts, reclamos] = await Promise.all([
    getAllTournaments(),
    getCounts(),
    q<{ id: number; tag: string; discord_name: string; created_at: string }>(
      `SELECT c.id, p.tag, c.discord_name, c.created_at::text AS created_at
         FROM profile_claims c JOIN players p ON p.id = c.player_id
        WHERE c.status = 'pendiente' ORDER BY c.created_at`,
    ),
  ]);

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">Panel</div>
        <h1>Operación</h1>
        <p className="muted small">
          {counts?.players} jugadores · {counts?.teams} equipos · {counts?.tournaments} torneos ·{" "}
          {counts?.matches} partidas contadas.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/torneos/nuevo" className="btn">
            Crear torneo
          </Link>
          <form action={recalcular}>
            <button className="ghost" type="submit">
              Recalcular ranking
            </button>
          </form>
          <form action={logout}>
            <button className="ghost" type="submit">
              Salir
            </button>
          </form>
        </div>
      </section>

      {reclamos.length > 0 && (
        <section className="section wrap stack">
          <h2>Reclamos de perfil</h2>
          <p className="muted small">
            Alguien dice ser dueño de un perfil con historial. Confirma por Discord antes de aprobar.
          </p>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Cuenta de Discord</th>
                  <th>Fecha</th>
                  <th className="right">Decisión</th>
                </tr>
              </thead>
              <tbody>
                {reclamos.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/jugadores/${encodeURIComponent(r.tag)}`} className="tag">
                        {r.tag}
                      </Link>
                    </td>
                    <td className="small">{r.discord_name}</td>
                    <td className="small num muted">{fecha(r.created_at)}</td>
                    <td className="right">
                      <form action={resolverReclamo} style={{ display: "inline-flex", gap: 8 }}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" name="decision" value="aprobar">
                          Aprobar
                        </button>
                        <button type="submit" name="decision" value="rechazar" className="ghost">
                          Rechazar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section wrap stack">
        <h2>Torneos</h2>
        <div className="t-scroll">
          <table>
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Juego</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="right">Resultados</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t.slug}>
                  <td>
                    <Link href={`/torneos/${t.slug}`} className="tag">
                      {t.name}
                    </Link>
                  </td>
                  <td className="small muted">{t.game_short}</td>
                  <td className="small num muted">{fecha(t.starts_at)}</td>
                  <td className="small muted">{t.status}</td>
                  <td className="right small">
                    <Link href={`/admin/torneos/${t.slug}`}>Entrar resultados →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
