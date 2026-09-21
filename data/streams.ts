/**
 * Transmisiones de la escena: canales OFICIALES de cada juego, verificados el
 * 21 sep 2026 por su feed de YouTube (videos de esa misma semana).
 *
 * YouTube: se muestra el video mas reciente del canal que cumpla `filtro`
 * (para quedarse con transmisiones competitivas y no con anuncios).
 * Twitch: se incrusta el canal; brawlhalla365 transmite repeticiones 24/7.
 */

export interface Fuente {
  plataforma: "youtube" | "twitch";
  canal: string;
  nombre: string;
  /** YouTube: ID del canal (UC...). Twitch: nombre del canal. */
  id: string;
  filtro?: RegExp;
  nota: string;
}

export const ESCENA: Record<string, Fuente[]> = {
  "free-fire": [
    { plataforma: "youtube", canal: "@GarenaFreeFireLATAM", nombre: "Garena Free Fire LATAM",
      id: "UC1ZPgKGxaT5P7QKN_bk9xkw", filtro: /FFWS|Liga|Jornada|Repechaje/i,
      nota: "La FFWS LATAM 2026, en español." },
  ],
  "clash-royale": [
    { plataforma: "youtube", canal: "@EsportsRoyale", nombre: "Clash Royale Esports",
      id: "UCL9wK9vQjmgyx7jGt20ZOkg", filtro: /League|Qualifier|Finals|Championship/i,
      nota: "La Clash Royale League, el circuito oficial de Supercell." },
    { plataforma: "twitch", canal: "twitch.tv/clashroyale", nombre: "ClashRoyale", id: "clashroyale",
      nota: "El canal oficial en Twitch; transmite en días de torneo." },
  ],
  brawlhalla: [
    { plataforma: "twitch", canal: "twitch.tv/brawlhalla365", nombre: "Brawlhalla365", id: "brawlhalla365",
      nota: "Repeticiones de torneos oficiales las 24 horas." },
    { plataforma: "youtube", canal: "Brawlhalla", nombre: "Brawlhalla",
      // Prioriza Sudamerica, la region mas cercana al publico de la liga.
      id: "UCQ5k469r1kRZ10zvyxQsFCg", filtro: /South America|Sudam/i,
      nota: "Los campeonatos oficiales, incluida la región de Sudamérica." },
  ],
  "cod-mobile": [
    { plataforma: "youtube", canal: "@CallofDutyMobile", nombre: "Call of Duty: Mobile",
      id: "UCj9bJX9hh3pXjktcsOLJdgw", filtro: /World Championship|Esports|Tournament|Championship/i,
      nota: "El canal oficial de Activision." },
  ],
  "stumble-guys": [
    { plataforma: "youtube", canal: "@StumbleGuys", nombre: "Stumble Guys",
      id: "UCt4CWaRExg78AdVl8mhz0uw", filtro: /Tournament|Crown|Cup/i,
      nota: "El canal oficial de Scopely." },
  ],
};
