/**
 * Agrupa juegos por plataforma usando los nombres de plataforma de IGDB.
 * Funcion pura, sin red: se prueba sola con scripts/check-platforms.ts.
 */

export interface Plataforma {
  slug: string;
  name: string;
  /** Nombres de IGDB que cuentan para esta plataforma (prefijo). */
  match: string[];
}

export const PLATAFORMAS: Plataforma[] = [
  { slug: "movil", name: "Móvil", match: ["iOS", "Android"] },
  { slug: "pc", name: "PC y Mac", match: ["PC (Microsoft Windows)", "Mac"] },
  { slug: "ps5", name: "PlayStation 5", match: ["PlayStation 5"] },
  // "Nintendo Switch" como prefijo cubre tambien "Nintendo Switch 2".
  { slug: "nintendo", name: "Nintendo Switch", match: ["Nintendo Switch"] },
  { slug: "xbox", name: "Xbox", match: ["Xbox Series X|S", "Xbox One"] },
];

export function plataformasDe(nombresIgdb: string[]): string[] {
  return PLATAFORMAS.filter((p) =>
    nombresIgdb.some((n) => p.match.some((m) => n === m || n.startsWith(m))),
  ).map((p) => p.slug);
}
