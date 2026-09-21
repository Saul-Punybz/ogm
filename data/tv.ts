/**
 * OGM TV: programacion de EJEMPLO del canal. Sale al aire por el canal de Twitch
 * de la liga. Los auspiciadores (marcas inventadas, ver sponsors.ts) presentan
 * programas y ponen anuncios en las tandas entre partidas.
 */

export type Tipo = "En vivo" | "Resumen" | "Magazine" | "Especial" | "Repetición";

export interface Programa {
  slug: string;
  name: string;
  tipo: Tipo;
  desc: string;
  game?: string;
  sponsor?: string;
}

export const programas: Programa[] = [
  { slug: "liga-movil-en-vivo", name: "Liga Móvil en vivo", tipo: "En vivo", game: "free-fire", sponsor: "isla-fibra",
    desc: "Las fechas de Free Fire lobby por lobby, con narración y tabla en pantalla." },
  { slug: "copa-corona-en-vivo", name: "Copa Corona en vivo", tipo: "En vivo", game: "clash-royale", sponsor: "voltio",
    desc: "El bracket de Clash Royale completo, desde cuartos hasta la final." },
  { slug: "noche-de-peleas", name: "Noche de peleas", tipo: "En vivo", game: "brawlhalla", sponsor: "bodega-pixel",
    desc: "Brawlhalla en crossplay: celular contra PC contra consola." },
  { slug: "resumen-de-la-fecha", name: "Resumen de la fecha", tipo: "Resumen", sponsor: "isla-fibra",
    desc: "Treinta minutos con lo mejor del fin de semana: resultados, ranking y las jugadas que importaron." },
  { slug: "la-jugada", name: "La Jugada", tipo: "Magazine", sponsor: "voltio",
    desc: "Las diez mejores jugadas de la semana, votadas por la comunidad en Discord." },
  { slug: "pixel-pr-en-ogm", name: "Pixel PR en OGM TV", tipo: "Magazine", sponsor: "pixel-pr-podcast",
    desc: "El podcast de videojuegos de Puerto Rico, en vivo desde el estudio, con invitados de la liga." },
  { slug: "campeones", name: "Campeones", tipo: "Especial", sponsor: "cafe-nivel-99",
    desc: "Un campeón de la liga por episodio: de dónde viene, cómo entrena y con qué juega." },
  { slug: "el-archivo", name: "El Archivo 2010", tipo: "Especial",
    desc: "Las historias de los torneos originales de OGM, con quienes los jugaron." },
  { slug: "repeticiones", name: "Repeticiones", tipo: "Repetición",
    desc: "Las mejores series de la temporada, completas." },
];

/** 0 = domingo ... 6 = sabado. Horas en hora de Puerto Rico. */
export interface Espacio {
  day: number;
  start: string;
  end: string;
  programa: string;
}

export const parrilla: Espacio[] = [
  { day: 1, start: "20:00", end: "20:30", programa: "resumen-de-la-fecha" },
  { day: 2, start: "20:00", end: "21:00", programa: "pixel-pr-en-ogm" },
  { day: 3, start: "20:00", end: "20:30", programa: "la-jugada" },
  { day: 3, start: "20:30", end: "21:00", programa: "campeones" },
  { day: 4, start: "20:00", end: "21:30", programa: "repeticiones" },
  { day: 5, start: "20:00", end: "20:30", programa: "el-archivo" },
  { day: 5, start: "20:30", end: "22:30", programa: "noche-de-peleas" },
  { day: 6, start: "18:00", end: "21:00", programa: "copa-corona-en-vivo" },
  { day: 0, start: "15:00", end: "16:00", programa: "repeticiones" },
  { day: 0, start: "19:00", end: "22:00", programa: "liga-movil-en-vivo" },
];

/** Anuncios en las tandas comerciales entre partidas y lobbies. */
export const spots = [
  { sponsor: "isla-fibra", segundos: 30, texto: "Fibra sin lag para la escuadra entera." },
  { sponsor: "voltio", segundos: 15, texto: "La energía de la Copa Corona." },
  { sponsor: "bodega-pixel", segundos: 30, texto: "El celular con que se juega la liga." },
  { sponsor: "cafe-nivel-99", segundos: 15, texto: "La sede de las noches presenciales." },
];

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const FORMATOS_TV = [
  { titulo: "Presentación de programa", texto: "“Presentado por” al abrir y cerrar el programa, y tu logo en la pantalla de inicio. Un programa, toda la temporada." },
  { titulo: "Anuncio en la tanda", texto: "Tu anuncio de 15 o 30 segundos en las pausas entre partidas y lobbies de cada transmisión." },
  { titulo: "Marcador de la transmisión", texto: "Tu marca en el marcador y en la tabla en pantalla durante toda la transmisión en vivo." },
  { titulo: "Segmento con tu nombre", texto: "Una sección fija dentro de un programa: “La jugada de la semana”, “El dato de la fecha”." },
];
