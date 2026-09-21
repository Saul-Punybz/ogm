import Link from "next/link";
import { getVoteResults, getMyVote } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { votar } from "@/app/juegos/actions";

/**
 * El cuarto juego de la liga lo decide la comunidad. Ningun estudio encontro
 * datos duros de Puerto Rico, asi que esta votacion ES el dato.
 */
export async function VoteBlock() {
  const [results, session] = await Promise.all([getVoteResults(), getSession()]);
  if (results.length === 0) return null;
  const myVote = session ? await getMyVote(session.discordId) : null;
  const total = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="vote">
      <div className="vote-options">
        {results.map((r) => {
          const pct = total > 0 ? Math.round((r.votes / total) * 100) : 0;
          const mine = myVote === r.id;
          return (
            <div key={r.slug} className={`vote-option ${mine ? "vote-mine" : ""}`}>
              <div className="row-between">
                <h3>{r.name}</h3>
                <span className="num small">{total > 0 ? `${pct}%` : "—"}</span>
              </div>
              <p className="small muted">{r.tagline}</p>
              <div className="vote-bar" aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="row-between">
                <span className="small muted num">
                  {r.votes} voto{r.votes === 1 ? "" : "s"}
                </span>
                {session ? (
                  mine ? (
                    <span className="pill pill-flare">Tu voto</span>
                  ) : (
                    <form action={votar}>
                      <input type="hidden" name="game" value={r.slug} />
                      <button type="submit" className="ghost">
                        Votar
                      </button>
                    </form>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {!session && (
        <p className="small muted">
          <Link href="/cuenta">Entra con Discord</Link> para votar. Un voto por cuenta.
        </p>
      )}
    </div>
  );
}
