import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getGames } from "@/lib/queries";
import { ActionForm } from "@/components/forms";
import { crearTorneo } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Crear torneo" };

export default async function NuevoTorneo() {
  if (!(await isAdmin())) redirect("/admin");
  const games = await getGames();

  return (
    <section className="hero wrap stack">
      <div className="eyebrow">Panel</div>
      <h1>Crear torneo</h1>
      <ActionForm action={crearTorneo} submit="Crear">
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" placeholder="Liga Móvil OGM · Fecha 3" />
        </div>
        <div className="field">
          <label htmlFor="game">Juego</label>
          <select id="game" name="game" defaultValue={games[0]?.slug}>
            {games.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="starts_at">Fecha y hora</label>
          <input id="starts_at" name="starts_at" type="datetime-local" />
        </div>
        <div className="field">
          <label htmlFor="venue">Donde</label>
          <input id="venue" name="venue" defaultValue="En línea" />
        </div>
        <div className="field">
          <label htmlFor="format">Formato</label>
          <input id="format" name="format" placeholder="3 lobbies · 8 escuadras" />
        </div>
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select id="status" name="status" defaultValue="abierto">
            <option value="anunciado">Anunciado</option>
            <option value="abierto">Inscripción abierta</option>
            <option value="en vivo">En vivo</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="summary">Nota</label>
          <input id="summary" name="summary" placeholder="Opcional" />
        </div>
      </ActionForm>
    </section>
  );
}
