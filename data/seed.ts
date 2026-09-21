/**
 * Datos de arranque.
 *
 * Dos bloques bien separados:
 *
 * 1. ARCHIVO REAL — los torneos y campeones de 2010 documentados en la portada
 *    de ogmadness.net (captura del 9 de enero de 2011). No se inventa nada aqui.
 *
 * 2. EJEMPLOS — una temporada móvil de muestra para que el sitio no abra vacio.
 *    Todo lo de este bloque lleva is_example = true y sale rotulado en pantalla.
 */

export type Stage = "temporada" | "votacion" | "eventos" | "archivo";

export interface GameSeed {
  slug: string;
  name: string;
  short_name: string;
  mode: "duel" | "squad" | "br";
  team_size: number;
  platform: string;
  is_mobile: boolean;
  stage: Stage;
  tagline?: string;
  sort_order: number;
}

// Alineacion de la temporada 1, segun research/00_RECOMENDACION.md:
// un juego por formato, los tres gratis y en celular.
export const games: GameSeed[] = [
  { slug: "free-fire", name: "Free Fire", short_name: "Free Fire", mode: "br", team_size: 4, platform: "Móvil", is_mobile: true, stage: "temporada", sort_order: 10,
    tagline: "Battle royale por escuadras de cuatro. Corre en cualquier Android." },
  { slug: "clash-royale", name: "Clash Royale", short_name: "Clash Royale", mode: "duel", team_size: 1, platform: "Móvil", is_mobile: true, stage: "temporada", sort_order: 20,
    tagline: "Uno contra uno en tres minutos. El celular es la consola." },
  { slug: "brawlhalla", name: "Brawlhalla", short_name: "Brawlhalla", mode: "duel", team_size: 1, platform: "Móvil · PC · consola", is_mobile: true, stage: "temporada", sort_order: 30,
    tagline: "Peleas gratis con crossplay: el del celular contra el del PC." },

  // Candidatos al cuarto juego: los decide la votacion de la comunidad.
  { slug: "mobile-legends", name: "Mobile Legends: Bang Bang", short_name: "Mobile Legends", mode: "squad", team_size: 5, platform: "Móvil", is_mobile: true, stage: "votacion", sort_order: 40,
    tagline: "MOBA cinco contra cinco. La liga móvil más madura de LATAM." },
  { slug: "cod-mobile", name: "Call of Duty: Mobile", short_name: "CoD Mobile", mode: "br", team_size: 4, platform: "Móvil", is_mobile: true, stage: "votacion", sort_order: 50,
    tagline: "Battle royale de Call of Duty en el celular, por escuadras." },

  // Eventos: fuera del ranking de temporada.
  { slug: "stumble-guys", name: "Stumble Guys", short_name: "Stumble Guys", mode: "br", team_size: 1, platform: "Móvil · PC · consola", is_mobile: true, stage: "eventos", sort_order: 60,
    tagline: "Lobbies de 32 para eventos con creadores y campamentos." },
  { slug: "sf6", name: "Street Fighter 6", short_name: "SF6", mode: "duel", team_size: 1, platform: "PS5 · PC", is_mobile: false, stage: "eventos", sort_order: 70,
    tagline: "Para las noches de peleas presenciales." },

  // Archivo: la historia de 2010.
  { slug: "mw2", name: "Call of Duty: Modern Warfare 2", short_name: "MW2", mode: "squad", team_size: 4, platform: "PlayStation 3", is_mobile: false, stage: "archivo", sort_order: 90 },
  { slug: "halo-reach", name: "Halo: Reach", short_name: "Halo Reach", mode: "squad", team_size: 2, platform: "Xbox 360", is_mobile: false, stage: "archivo", sort_order: 91 },
  { slug: "ssf4", name: "Super Street Fighter IV", short_name: "SSF4", mode: "duel", team_size: 1, platform: "Xbox 360 · PS3", is_mobile: false, stage: "archivo", sort_order: 92 },
];

export interface PlayerSeed {
  tag: string;
  full_name?: string;
  town?: string;
  is_example: boolean;
}

export const players: PlayerSeed[] = [
  // --- Archivo real: campeones de SSF4 en ¡No Brinques!, 3 de diciembre de 2010.
  { tag: "Esteban Pelliccia", full_name: "Esteban Pelliccia Álvarez", is_example: false },
  { tag: "Alexis Andújar", full_name: "Alexis Andújar", is_example: false },
  { tag: "Jorge López", full_name: "Jorge López", is_example: false },

  // --- Ejemplos: escuadras de Free Fire
  { tag: "KobraPR", town: "Carolina", is_example: true },
  { tag: "Yamil07", town: "Carolina", is_example: true },
  { tag: "Tavo", town: "Trujillo Alto", is_example: true },
  { tag: "NitroCaro", town: "Carolina", is_example: true },
  { tag: "GloKing", town: "Bayamón", is_example: true },
  { tag: "Mandi", town: "Bayamón", is_example: true },
  { tag: "ElNene", town: "Toa Baja", is_example: true },
  { tag: "Brayan23", town: "Bayamón", is_example: true },
  { tag: "SantuBoy", town: "Santurce", is_example: true },
  { tag: "Kiara", town: "San Juan", is_example: true },
  { tag: "Papo", town: "Santurce", is_example: true },
  { tag: "Jayko", town: "San Juan", is_example: true },
  { tag: "AreciboKid", town: "Arecibo", is_example: true },
  { tag: "Melly", town: "Arecibo", is_example: true },
  { tag: "Chuito", town: "Barceloneta", is_example: true },
  { tag: "Zayn", town: "Arecibo", is_example: true },
  { tag: "MadnessJP", town: "San Juan", is_example: true },
  { tag: "Nico", town: "Guaynabo", is_example: true },
  { tag: "Vale", town: "San Juan", is_example: true },
  { tag: "RuizPR", town: "Caguas", is_example: true },
  { tag: "PonceFlow", town: "Ponce", is_example: true },
  { tag: "Ito", town: "Ponce", is_example: true },
  { tag: "Dari", town: "Juana Díaz", is_example: true },
  { tag: "Kevo", town: "Ponce", is_example: true },

  // --- Ejemplos: refuerzos de CoD Mobile
  { tag: "HunterBay", town: "Bayamón", is_example: true },
  { tag: "Lizzy", town: "Bayamón", is_example: true },
  { tag: "OmarPR", town: "Cataño", is_example: true },
  { tag: "Tito", town: "Bayamón", is_example: true },
  { tag: "Gabo", town: "Isla Verde", is_example: true },
  { tag: "Luna", town: "Carolina", is_example: true },
  { tag: "Rek", town: "Loíza", is_example: true },
  { tag: "Pipo", town: "Carolina", is_example: true },

  // --- Ejemplos: jugadores de Clash Royale
  { tag: "Rican", town: "San Juan", is_example: true },
  { tag: "Yiyo", town: "Caguas", is_example: true },
  { tag: "ElPulpo", town: "Mayagüez", is_example: true },
  { tag: "Marie", town: "San Juan", is_example: true },
  { tag: "Dayan", town: "Humacao", is_example: true },
  { tag: "Kilo", town: "Bayamón", is_example: true },
  { tag: "Sombra", town: "Aguadilla", is_example: true },
  { tag: "Vero", town: "Cayey", is_example: true },
];

export interface TeamSeed {
  slug: string;
  name: string;
  game: string;
  town?: string;
  roster: string[];
  is_example: boolean;
}

export const teams: TeamSeed[] = [
  // --- Archivo real: equipos ganadores de 2010. No hay rosters publicados.
  { slug: "los-glok-2010", name: "Los GloK", game: "mw2", roster: [], is_example: false },
  { slug: "sigma-phi-chi-2", name: "Sigma Phi Chi 2", game: "mw2", roster: [], is_example: false },
  { slug: "kait-crew", name: "Kait Crew", game: "mw2", roster: [], is_example: false },
  { slug: "tne", name: "TNE", game: "halo-reach", roster: [], is_example: false },
  { slug: "beyond-limits", name: "Beyond Limits", game: "halo-reach", roster: [], is_example: false },
  { slug: "random-noobs", name: "Random Noobs", game: "halo-reach", roster: [], is_example: false },

  // --- Ejemplos: escuadras de Free Fire
  { slug: "caribe-squad", name: "Caribe Squad", game: "free-fire", town: "Carolina", roster: ["KobraPR", "Yamil07", "Tavo", "NitroCaro"], is_example: true },
  { slug: "los-glok-ff", name: "Los GloK", game: "free-fire", town: "Bayamón", roster: ["GloKing", "Mandi", "ElNene", "Brayan23"], is_example: true },
  { slug: "cangrejeros-ff", name: "Cangrejeros", game: "free-fire", town: "Santurce", roster: ["SantuBoy", "Kiara", "Papo", "Jayko"], is_example: true },
  { slug: "nova-arecibo", name: "Nova Arecibo", game: "free-fire", town: "Arecibo", roster: ["AreciboKid", "Melly", "Chuito", "Zayn"], is_example: true },
  { slug: "team-madness-ff", name: "Team Madness", game: "free-fire", town: "San Juan", roster: ["MadnessJP", "Nico", "Vale", "RuizPR"], is_example: true },
  { slug: "ponce-riders", name: "Ponce Riders", game: "free-fire", town: "Ponce", roster: ["PonceFlow", "Ito", "Dari", "Kevo"], is_example: true },

  // --- Ejemplos: escuadras de CoD Mobile (varios jugadores repiten juego)
  { slug: "team-madness-codm", name: "Team Madness", game: "cod-mobile", town: "San Juan", roster: ["MadnessJP", "Nico", "KobraPR", "SantuBoy"], is_example: true },
  { slug: "los-glok-codm", name: "Los GloK", game: "cod-mobile", town: "Bayamón", roster: ["GloKing", "Mandi", "Jayko", "Chuito"], is_example: true },
  { slug: "bayamon-hunters", name: "Bayamón Hunters", game: "cod-mobile", town: "Bayamón", roster: ["HunterBay", "Lizzy", "OmarPR", "Tito"], is_example: true },
  { slug: "isla-verde-4", name: "Isla Verde 4", game: "cod-mobile", town: "Carolina", roster: ["Gabo", "Luna", "Rek", "Pipo"], is_example: true },
];

export interface SeasonSeed {
  slug: string;
  name: string;
  game: string;
  starts_on: string;
  ends_on: string;
  is_current: boolean;
}

export const seasons: SeasonSeed[] = [
  { slug: "ff-t1-2026", name: "Temporada 1 · 2026", game: "free-fire", starts_on: "2026-09-01", ends_on: "2026-12-20", is_current: true },
  { slug: "cr-t1-2026", name: "Temporada 1 · 2026", game: "clash-royale", starts_on: "2026-09-01", ends_on: "2026-12-20", is_current: true },
  { slug: "bh-t1-2026", name: "Temporada 1 · 2026", game: "brawlhalla", starts_on: "2026-09-01", ends_on: "2026-12-20", is_current: true },
];

export interface MatchSeed {
  kind: "duel" | "lobby";
  round: string;
  played_at: string;
  /** Lados en orden de colocación: 1ro primero. */
  sides: { team?: string; player?: string; placement: number; kills?: number; score?: number }[];
}

export interface TournamentSeed {
  slug: string;
  name: string;
  game: string;
  season?: string;
  starts_at: string;
  venue: string;
  format: string;
  summary?: string;
  status: "anunciado" | "abierto" | "en vivo" | "finalizado";
  is_archive: boolean;
  is_example: boolean;
  matches: MatchSeed[];
  results: { position: number; team?: string; player?: string; points: number }[];
}

const FF_LOBBY_POINTS = [12, 9, 7, 5, 3, 1];
const CODM_LOBBY_POINTS = [10, 7, 5, 3];

export const tournaments: TournamentSeed[] = [
  // ============================ ARCHIVO REAL ============================
  {
    slug: "battle-my-crew-2010",
    name: "Battle My Crew",
    game: "mw2",
    starts_at: "2010-10-18T18:00:00-04:00",
    venue: "En línea · PlayStation 3",
    format: "Torneo de crews",
    summary:
      "Torneo de Call of Duty: Modern Warfare 2 celebrado del 18 al 21 de octubre de 2010 en PlayStation 3.",
    status: "finalizado",
    is_archive: true,
    is_example: false,
    matches: [],
    results: [
      { position: 1, team: "los-glok-2010", points: 0 },
      { position: 2, team: "sigma-phi-chi-2", points: 0 },
      { position: 3, team: "kait-crew", points: 0 },
    ],
  },
  {
    slug: "no-brinques-2010-halo",
    name: "¡No Brinques! · Halo: Reach 2v2",
    game: "halo-reach",
    starts_at: "2010-12-03T17:00:00-04:00",
    venue: "Universidad Interamericana, Arecibo",
    format: "2 vs 2",
    summary: "Torneo presencial del 3 de diciembre de 2010 en la Interamericana de Arecibo.",
    status: "finalizado",
    is_archive: true,
    is_example: false,
    matches: [],
    results: [
      { position: 1, team: "tne", points: 0 },
      { position: 2, team: "beyond-limits", points: 0 },
      { position: 3, team: "random-noobs", points: 0 },
    ],
  },
  {
    slug: "no-brinques-2010-ssf4",
    name: "¡No Brinques! · Super Street Fighter IV",
    game: "ssf4",
    starts_at: "2010-12-03T17:00:00-04:00",
    venue: "Universidad Interamericana, Arecibo",
    format: "Individual",
    summary: "Bracket individual del mismo evento del 3 de diciembre de 2010.",
    status: "finalizado",
    is_archive: true,
    is_example: false,
    matches: [],
    results: [
      { position: 1, player: "Esteban Pelliccia", points: 0 },
      { position: 2, player: "Alexis Andújar", points: 0 },
      { position: 3, player: "Jorge López", points: 0 },
    ],
  },

  // ============================== EJEMPLOS ==============================
  {
    slug: "liga-movil-fecha-1",
    name: "Liga Móvil OGM · Fecha 1",
    game: "free-fire",
    season: "ff-t1-2026",
    starts_at: "2026-09-06T19:00:00-04:00",
    venue: "En línea",
    format: "3 lobbies · 6 escuadras · puntos por colocación y bajas",
    summary: "Primera fecha de la temporada móvil. Tres lobbies, misma parrilla de escuadras.",
    status: "finalizado",
    is_archive: false,
    is_example: true,
    matches: [
      {
        kind: "lobby",
        round: "Lobby 1",
        played_at: "2026-09-06T19:10:00-04:00",
        sides: [
          { team: "los-glok-ff", placement: 1, kills: 12 },
          { team: "team-madness-ff", placement: 2, kills: 9 },
          { team: "caribe-squad", placement: 3, kills: 7 },
          { team: "nova-arecibo", placement: 4, kills: 5 },
          { team: "cangrejeros-ff", placement: 5, kills: 4 },
          { team: "ponce-riders", placement: 6, kills: 2 },
        ],
      },
      {
        kind: "lobby",
        round: "Lobby 2",
        played_at: "2026-09-06T19:45:00-04:00",
        sides: [
          { team: "team-madness-ff", placement: 1, kills: 11 },
          { team: "caribe-squad", placement: 2, kills: 10 },
          { team: "los-glok-ff", placement: 3, kills: 6 },
          { team: "ponce-riders", placement: 4, kills: 5 },
          { team: "nova-arecibo", placement: 5, kills: 3 },
          { team: "cangrejeros-ff", placement: 6, kills: 2 },
        ],
      },
      {
        kind: "lobby",
        round: "Lobby 3",
        played_at: "2026-09-06T20:20:00-04:00",
        sides: [
          { team: "los-glok-ff", placement: 1, kills: 13 },
          { team: "caribe-squad", placement: 2, kills: 8 },
          { team: "ponce-riders", placement: 3, kills: 7 },
          { team: "team-madness-ff", placement: 4, kills: 6 },
          { team: "cangrejeros-ff", placement: 5, kills: 4 },
          { team: "nova-arecibo", placement: 6, kills: 1 },
        ],
      },
    ],
    results: [
      { position: 1, team: "los-glok-ff", points: 62 },
      { position: 2, team: "team-madness-ff", points: 52 },
      { position: 3, team: "caribe-squad", points: 50 },
      { position: 4, team: "ponce-riders", points: 27 },
      { position: 5, team: "nova-arecibo", points: 18 },
      { position: 6, team: "cangrejeros-ff", points: 17 },
    ],
  },
  {
    slug: "copa-isla-codm-1",
    name: "Torneo de prueba · CoD Mobile",
    game: "cod-mobile",
    starts_at: "2026-09-13T19:00:00-04:00",
    venue: "En línea",
    format: "2 lobbies · 4 escuadras",
    summary: "Uno de los dos torneos de prueba para decidir el cuarto juego de la liga.",
    status: "finalizado",
    is_archive: false,
    is_example: true,
    matches: [
      {
        kind: "lobby",
        round: "Lobby 1",
        played_at: "2026-09-13T19:10:00-04:00",
        sides: [
          { team: "team-madness-codm", placement: 1, kills: 14 },
          { team: "bayamon-hunters", placement: 2, kills: 11 },
          { team: "los-glok-codm", placement: 3, kills: 8 },
          { team: "isla-verde-4", placement: 4, kills: 6 },
        ],
      },
      {
        kind: "lobby",
        round: "Lobby 2",
        played_at: "2026-09-13T19:50:00-04:00",
        sides: [
          { team: "bayamon-hunters", placement: 1, kills: 13 },
          { team: "los-glok-codm", placement: 2, kills: 10 },
          { team: "team-madness-codm", placement: 3, kills: 9 },
          { team: "isla-verde-4", placement: 4, kills: 5 },
        ],
      },
    ],
    results: [
      { position: 1, team: "bayamon-hunters", points: 41 },
      { position: 2, team: "team-madness-codm", points: 38 },
      { position: 3, team: "los-glok-codm", points: 30 },
      { position: 4, team: "isla-verde-4", points: 17 },
    ],
  },
  {
    slug: "copa-corona-1",
    name: "Copa Corona #1",
    game: "clash-royale",
    season: "cr-t1-2026",
    starts_at: "2026-09-20T18:00:00-04:00",
    venue: "En línea",
    format: "Eliminación sencilla · 8 jugadores · mejor de 3",
    summary: "Primera copa uno contra uno de la temporada.",
    status: "finalizado",
    is_archive: false,
    is_example: true,
    matches: [
      { kind: "duel", round: "Cuartos", played_at: "2026-09-20T18:10:00-04:00", sides: [{ player: "Rican", placement: 1, score: 2 }, { player: "Kilo", placement: 2, score: 1 }] },
      { kind: "duel", round: "Cuartos", played_at: "2026-09-20T18:20:00-04:00", sides: [{ player: "Yiyo", placement: 1, score: 2 }, { player: "Sombra", placement: 2, score: 1 }] },
      { kind: "duel", round: "Cuartos", played_at: "2026-09-20T18:30:00-04:00", sides: [{ player: "ElPulpo", placement: 1, score: 2 }, { player: "Vero", placement: 2, score: 0 }] },
      { kind: "duel", round: "Cuartos", played_at: "2026-09-20T18:40:00-04:00", sides: [{ player: "Marie", placement: 1, score: 2 }, { player: "Dayan", placement: 2, score: 1 }] },
      { kind: "duel", round: "Semifinal", played_at: "2026-09-20T19:00:00-04:00", sides: [{ player: "Rican", placement: 1, score: 2 }, { player: "Yiyo", placement: 2, score: 1 }] },
      { kind: "duel", round: "Semifinal", played_at: "2026-09-20T19:15:00-04:00", sides: [{ player: "Marie", placement: 1, score: 2 }, { player: "ElPulpo", placement: 2, score: 1 }] },
      { kind: "duel", round: "Final", played_at: "2026-09-20T19:40:00-04:00", sides: [{ player: "Marie", placement: 1, score: 2 }, { player: "Rican", placement: 2, score: 1 }] },
    ],
    results: [
      { position: 1, player: "Marie", points: 100 },
      { position: 2, player: "Rican", points: 80 },
      { position: 3, player: "ElPulpo", points: 65 },
      { position: 3, player: "Yiyo", points: 65 },
    ],
  },
  {
    slug: "liga-movil-fecha-2",
    name: "Liga Móvil OGM · Fecha 2",
    game: "free-fire",
    season: "ff-t1-2026",
    starts_at: "2026-10-04T19:00:00-04:00",
    venue: "En línea",
    format: "3 lobbies · 8 escuadras",
    summary: "Segunda fecha. Inscripción abierta hasta el 2 de octubre.",
    status: "abierto",
    is_archive: false,
    is_example: true,
    matches: [],
    results: [],
  },
  {
    slug: "brawlhalla-fight-night-1",
    name: "Brawlhalla Fight Night #1",
    game: "brawlhalla",
    season: "bh-t1-2026",
    starts_at: "2026-10-11T19:00:00-04:00",
    venue: "En línea · crossplay",
    format: "Doble eliminación · 1v1",
    summary: "Primera noche de peleas de la temporada. Celular, PC y consola en el mismo bracket.",
    status: "anunciado",
    is_archive: false,
    is_example: true,
    matches: [],
    results: [],
  },
  {
    slug: "prueba-mobile-legends",
    name: "Torneo de prueba · Mobile Legends",
    game: "mobile-legends",
    starts_at: "2026-10-18T18:00:00-04:00",
    venue: "En línea",
    format: "5 contra 5 · eliminación sencilla",
    summary: "El segundo torneo de prueba para decidir el cuarto juego de la liga.",
    status: "abierto",
    is_archive: false,
    is_example: true,
    matches: [],
    results: [],
  },
  {
    slug: "stumble-creadores-1",
    name: "Stumble Guys con creadores",
    game: "stumble-guys",
    starts_at: "2026-10-25T20:00:00-04:00",
    venue: "En línea · en vivo por Kick y Twitch",
    format: "Lobbies de 32 · evento especial",
    summary: "Streamers de Puerto Rico contra su comunidad. No cuenta para el ranking de temporada.",
    status: "anunciado",
    is_archive: false,
    is_example: true,
    matches: [],
    results: [],
  },
];

export const lobbyPoints = { "free-fire": FF_LOBBY_POINTS, "cod-mobile": CODM_LOBBY_POINTS };

/**
 * Perfiles detallados de los jugadores de EJEMPLO (todo inventado, rotulado en
 * pantalla). Los campeones reales de 2010 no llevan nada de esto a proposito.
 */
export interface PerfilSeed {
  full_name?: string;
  bio: string;
  main?: string;
  device?: string;
  twitch?: string;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
}

export const perfiles: Record<string, PerfilSeed> = {
  Marie: {
    full_name: "Marielys Ortiz",
    bio: "Juega Clash Royale desde la escuela superior. Ganó la primera Copa Corona sin perder una serie y transmite sus partidas de ranked los martes.",
    main: "Mazo de Montapuercos 2.6",
    device: "iPhone 13",
    twitch: "marie_cr",
    tiktok: "marie.cr",
    instagram: "marie.cr",
  },
  Rican: {
    full_name: "Luis \"Rican\" Meléndez",
    bio: "Finalista de la Copa Corona. Conocido por remontar series 0-1 con mazos de control.",
    main: "Mazo de Gólem con Bruja nocturna",
    device: "Samsung Galaxy S23",
    twitch: "ricancr",
    tiktok: "rican787",
  },
  ElPulpo: {
    full_name: "Pablo Irizarry",
    bio: "Semifinalista desde Mayagüez. Estudia ingeniería y entrena en los recesos.",
    main: "Mazo de ciclo rápido 2.9",
    device: "Motorola Edge",
    tiktok: "elpulpo.mayaguez",
  },
  Yiyo: {
    bio: "Semifinalista de Caguas. Jugador agresivo, siempre abre por el puente.",
    main: "Mazo de Montapuercos y Terremoto",
    device: "iPhone 12",
    instagram: "yiyo.caguas",
  },
  GloKing: {
    full_name: "Gabriel Colón",
    bio: "Capitán de Los GloK. Hace las rotaciones y decide cuándo se entra a la zona.",
    main: "Rol: capitán y rotación",
    device: "iPhone 14 Pro",
    twitch: "gloking_ff",
    tiktok: "gloking.ff",
    youtube: "GloKingFF",
  },
  Mandi: {
    full_name: "Amanda Figueroa",
    bio: "La que más bajas hizo en la Fecha 1. Especialista en francotirador.",
    main: "Rol: francotiradora",
    device: "Samsung Galaxy A54",
    tiktok: "mandi.ff",
    instagram: "mandi.glok",
  },
  ElNene: {
    bio: "El más joven del equipo. Entra primero a cada pelea.",
    main: "Rol: asalto",
    device: "Xiaomi Redmi Note 12",
    tiktok: "elnene.ff",
  },
  Brayan23: {
    bio: "Soporte de Los GloK. Revive, cura y cubre la retirada.",
    main: "Rol: soporte",
    device: "iPhone 11",
    instagram: "brayan23.pr",
  },
  HunterBay: {
    full_name: "Héctor Báez",
    bio: "Capitán de Bayamón Hunters, campeones del torneo de prueba de CoD Mobile.",
    main: "Rol: capitán · subfusil",
    device: "iPad Air",
    twitch: "hunterbay",
    tiktok: "hunterbay.codm",
  },
  Lizzy: {
    bio: "Francotiradora de Bayamón Hunters. Terminó el Lobby 2 con 13 bajas de escuadra.",
    main: "Rol: francotiradora",
    device: "iPhone 15",
    instagram: "lizzy.codm",
  },
  OmarPR: {
    bio: "Asalto de Bayamón Hunters, de Cataño.",
    main: "Rol: asalto · escopeta",
    device: "Samsung Galaxy S22",
  },
  Tito: {
    bio: "El veterano de Bayamón Hunters. Jugó MW2 en los torneos de 2010.",
    main: "Rol: ancla",
    device: "iPhone 13 mini",
    youtube: "TitoJuega",
  },
  KobraPR: {
    bio: "Juega en dos escuadras: Caribe Squad en Free Fire y Team Madness en CoD Mobile.",
    main: "Rol: asalto",
    device: "iPhone 14",
    twitch: "kobrapr",
  },
  MadnessJP: {
    full_name: "Juan Pablo Rosado",
    bio: "Capitán de Team Madness, el equipo oficial de OGM desde 2010.",
    main: "Rol: capitán",
    device: "iPhone 15 Pro",
    twitch: "madnessjp",
    tiktok: "madness.jp",
  },
};

export const equipos: Record<string, { bio: string; captain?: string }> = {
  "los-glok-ff": {
    bio: "Los GloK ganaron Battle My Crew en 2010 jugando MW2. En 2026 regresan con otra generación, ahora en Free Fire, y ganaron la primera fecha de la Liga Móvil.",
    captain: "GloKing",
  },
  "bayamon-hunters": {
    bio: "Escuadra de Bayamón que se armó para el torneo de prueba de CoD Mobile y lo ganó en el segundo lobby.",
    captain: "HunterBay",
  },
  "team-madness-ff": {
    bio: "El equipo oficial de OGM. En 2010 retaba a cualquiera en Halo: Reach; hoy compite en Free Fire.",
    captain: "MadnessJP",
  },
};
