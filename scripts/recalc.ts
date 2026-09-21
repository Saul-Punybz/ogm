/** Recalcula el ranking desde cero: `npm run recalc`. */
import { recalcRatings } from "../lib/rating";

recalcRatings()
  .then(({ players, matches }) => {
    console.log(`Ranking recalculado: ${players} jugadores, ${matches} partidos.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
