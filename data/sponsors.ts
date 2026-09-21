/**
 * Auspiciadores de EJEMPLO. Marcas inventadas para mostrar como se ve la pagina:
 * ninguna es una empresa real ni auspicia a OGM. Los dominios usan .example, que
 * esta reservado y no lleva a ningun sitio. Cuando haya auspiciadores de verdad,
 * este archivo se reemplaza (o pasa a la base de datos).
 */

export type Nivel = "principal" | "torneo" | "aliado" | "medio";
export type Marca = "ola" | "rayo" | "pixel" | "taza" | "flecha" | "onda";

export interface Sponsor {
  slug: string;
  name: string;
  nivel: Nivel;
  categoria: string;
  descripcion: string;
  activacion: string;
  premio?: string;
  torneos: string[];
  dominio: string;
  color: string;
  marca: Marca;
}

export const NIVELES: Record<Nivel, { titulo: string; texto: string }> = {
  principal: {
    titulo: "Auspiciador principal",
    texto: "Presenta la temporada completa: nombre, transmisiones y premio mayor.",
  },
  torneo: {
    titulo: "Auspiciadores de torneo",
    texto: "Una copa con su nombre y los premios de esa fecha.",
  },
  aliado: {
    titulo: "Aliados",
    texto: "Aportan en especie: sede, comida y equipo para los eventos presenciales.",
  },
  medio: {
    titulo: "Medios",
    texto: "Narración, clips y cobertura de cada fecha.",
  },
};

export const sponsors: Sponsor[] = [
  {
    slug: "isla-fibra",
    name: "Isla Fibra",
    nivel: "principal",
    categoria: "Internet de fibra óptica",
    descripcion:
      "Proveedor de internet por fibra en el área metro. Presenta la Temporada 1 de la Liga Móvil OGM.",
    activacion:
      "Su nombre en la temporada, su marca en el marcador de cada transmisión y una zona de juego sin lag en los eventos presenciales.",
    premio: "Un año de internet de fibra para cada jugador de la escuadra campeona de la temporada.",
    torneos: ["liga-movil-fecha-1", "liga-movil-fecha-2"],
    dominio: "islafibra.example",
    color: "#1F9E89",
    marca: "ola",
  },
  {
    slug: "voltio",
    name: "Voltio",
    nivel: "torneo",
    categoria: "Bebida energética",
    descripcion: "Bebida energética hecha en la isla. Presenta la Copa Corona de Clash Royale.",
    activacion: "La Copa Corona lleva su nombre y reparte producto a todos los inscritos.",
    premio: "Trofeo y $300 en tarjetas de regalo para el top 3 de cada Copa Corona.",
    torneos: ["copa-corona-1"],
    dominio: "voltio.example",
    color: "#F2C230",
    marca: "rayo",
  },
  {
    slug: "bodega-pixel",
    name: "Bodega Pixel",
    nivel: "torneo",
    categoria: "Tienda de celulares y accesorios",
    descripcion: "Tienda de celulares, audífonos y controles. Presenta las noches de Brawlhalla.",
    activacion: "Estación de prueba de celulares en cada evento y descuentos para jugadores de la liga.",
    premio: "Un celular gama media para el campeón y audífonos para el finalista.",
    torneos: ["brawlhalla-fight-night-1"],
    dominio: "bodegapixel.example",
    color: "#7A5CFA",
    marca: "pixel",
  },
  {
    slug: "cafe-nivel-99",
    name: "Café Nivel 99",
    nivel: "aliado",
    categoria: "Café gamer",
    descripcion: "Café con estaciones de juego. Sede de las noches presenciales de OGM.",
    activacion: "Presta el local, las mesas y la comida para los jugadores de cada evento presencial.",
    torneos: [],
    dominio: "nivel99.example",
    color: "#B07A4F",
    marca: "taza",
  },
  {
    slug: "arcade-787",
    name: "Arcade 787",
    nivel: "aliado",
    categoria: "Sala de eventos",
    descripcion: "Sala de eventos con pantallas gigantes y sonido.",
    activacion: "Pone las pantallas y el equipo de audio para las finales presenciales.",
    torneos: [],
    dominio: "arcade787.example",
    color: "#FE492A",
    marca: "flecha",
  },
  {
    slug: "pixel-pr-podcast",
    name: "Pixel PR Podcast",
    nivel: "medio",
    categoria: "Podcast de videojuegos",
    descripcion: "Podcast semanal de videojuegos en Puerto Rico.",
    activacion: "Narra las finales y publica un resumen de cada fecha con los mejores clips.",
    torneos: ["liga-movil-fecha-1", "copa-corona-1"],
    dominio: "pixelpr.example",
    color: "#B1BFE2",
    marca: "onda",
  },
];

export function sponsorsDeTorneo(slug: string): Sponsor[] {
  return sponsors.filter((s) => s.torneos.includes(slug) && (s.nivel === "principal" || s.nivel === "torneo"));
}
