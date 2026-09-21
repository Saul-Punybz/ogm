import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getTournament, getMatches, getResults } from "@/lib/queries";
import { fecha } from "@/lib/format";
import { ActionForm } from "@/components/forms";
import { agregarLobby, agregarDuelo, publicarTabla } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar resultados" };

export default async function AdminTorneo({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/admin");

  const { slug } = await params;
  const t = await getTournament(slug);
  if (!t) notFound();

  const [matches, results] = await Promise.all([getMatches(t.id), getResults(t.id)]);
  const esLobby = t.game_mode === "br";

  return (
    <>
      <section className="hero wrap stack">
        <div className="eyebrow">
          <Link href="/admin">Panel</Link> · {t.game_name}
        </div>
        <h1>{t.name}</h1>
        <p className="muted small">
          {fecha(t.starts_at)} · {t.venue} · {matches.length} partidas cargadas ·{" "}
          {results.length} puestos publicados
        </p>
        <Link href={`/torneos/${t.slug}`} className="small">
          Ver la página pública →
        </Link>
      </section>

      {esLobby ? (
        <section className="section wrap stack">
          <h2>Agregar lobby</h2>
          <p className="muted small">
            Una linea por escuadra, en el orden en que quedaron. Separa las bajas con coma. Si el
            nombre no existe todavía, se crea solo.
          </p>
          <ActionForm action={agregarLobby} submit="Guardar lobby">
            <input type="hidden" name="tournament" value={t.slug} />
            <div className="field">
              <label htmlFor="round">Nombre del lobby</label>
              <input id="round" name="round" placeholder="Lobby 1" defaultValue="Lobby 1" />
            </div>
            <div className="field">
              <label htmlFor="sides">Escuadras, en orden de llegada</label>
              <textarea
                id="sides"
                name="sides"
                placeholder={"los-glok-ff, 12\nteam-madness-ff, 9\ncaribe-squad, 7"}
              />
            </div>
          </ActionForm>
        </section>
      ) : (
        <section className="section wrap stack">
          <h2>Agregar partida</h2>
          <p className="muted small">
            Escribe el tag del jugador. Si no esta registrado, se crea con ese tag.
          </p>
          <ActionForm action={agregarDuelo} submit="Guardar partida">
            <input type="hidden" name="tournament" value={t.slug} />
            <div className="field">
              <label htmlFor="round">Ronda</label>
              <input id="round" name="round" placeholder="Cuartos" />
            </div>
            <div className="field">
              <label htmlFor="winner">Ganador</label>
              <input id="winner" name="winner" placeholder="Rican" />
            </div>
            <div className="field">
              <label htmlFor="winner_score">Sets del ganador</label>
              <input id="winner_score" name="winner_score" type="number" defaultValue={3} min={0} />
            </div>
            <div className="field">
              <label htmlFor="loser">Perdedor</label>
              <input id="loser" name="loser" placeholder="Kilo" />
            </div>
            <div className="field">
              <label htmlFor="loser_score">Sets del perdedor</label>
              <input id="loser_score" name="loser_score" type="number" defaultValue={1} min={0} />
            </div>
          </ActionForm>
        </section>
      )}

      <section className="section wrap stack">
        <h2>Publicar tabla final</h2>
        <p className="muted small">
          Una linea por puesto, del primero al último, con los puntos despues de la coma. Al
          publicarla, el torneo queda finalizado y los campeones entran al salón.
        </p>
        <ActionForm action={publicarTabla} submit="Publicar tabla">
          <input type="hidden" name="tournament" value={t.slug} />
          <div className="field">
            <label htmlFor="standings">Tabla</label>
            <textarea
              id="standings"
              name="standings"
              placeholder={"los-glok-ff, 62\nteam-madness-ff, 52\ncaribe-squad, 50"}
              defaultValue={results
                .map((r) => `${r.team_name ?? r.player_tag}, ${r.points}`)
                .join("\n")}
            />
          </div>
        </ActionForm>
      </section>

      {matches.length > 0 && (
        <section className="section wrap stack">
          <h2>Partidas cargadas</h2>
          <div className="t-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ronda</th>
                  <th>Tipo</th>
                  <th>Participantes</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td className="small">{m.round ?? "—"}</td>
                    <td className="small muted">{m.kind === "lobby" ? "Lobby" : "Duelo"}</td>
                    <td className="small muted">
                      {m.sides
                        .map((s) => `${s.placement}. ${s.team_name ?? s.player_tag}`)
                        .join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
