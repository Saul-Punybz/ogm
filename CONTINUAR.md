# OGM — dónde vamos

Última tanda: **21 de septiembre de 2026** (tanda 3: sitio con lo aprendido del estudio). Trigger: "CONTINUE OGM".

## Qué está hecho y probado

Plataforma v1 corriendo en local. Typecheck limpio, todas las rutas responden 200,
revisada en el navegador.

- **Base de datos** multi-liga (`scripts/schema.sql`): juegos, jugadores, equipos,
  temporadas, torneos, partidas, lados, tabla final, ratings e historial.
- **Motor de ranking** (`lib/rating.ts`) con OpenSkill. Maneja duelo 1v1, equipo
  contra equipo y lobby de battle royale con N escuadras. Recálculo determinista.
- **Páginas públicas**: portada, rankings por juego, perfil de jugador (rating por
  juego, vitrina, cara a cara, historial), equipo, torneo (tabla, lobbies,
  partidas), salón de campeones y calendario.
- **Panel de admin** en `/admin`: crear torneo, entrar lobbies o duelos, publicar
  tabla final, recalcular ranking. Clave compartida por ahora.
- **Datos**: archivo real de 2010 + temporada móvil de ejemplo (Free Fire,
  CoD Mobile, SF6), rotulada como ejemplo en pantalla.

- **Login con Discord** (arctic + jose, sin Auth.js que sigue en beta): sesión
  firmada en cookie, crear perfil, reclamar perfil con aprobación de admin cuando
  tiene historial, admins por `ADMIN_DISCORD_IDS`, insignia de verificado.
  Probado en navegador real y con curl: state falso rechazado, cookie alterada
  rechazada, no-admin no puede aprobar. **Falta:** probar con una app real de
  Discord (hay que crearla — ver README).

- **Sitio con lo aprendido** (tanda 3): juegos por etapa (temporada / votación /
  eventos / archivo), votación del cuarto juego con Discord (un voto por cuenta,
  cambiable), portada móvil con "inscripción gratis, premios de auspiciadores",
  bloque En vivo (Kick + Twitch), página `/marcas`. Canales y contacto salen de
  variables `OGM_*`: si no están, el sitio dice "por anunciar". Probado: 16 rutas
  200, votación (votar, cambiar, anónimo, juego no candidato), vista a 500 px.

- **Contenido y vida** (tanda 4): escenario en la portada con cuenta regresiva
  al próximo torneo y reproductor de Twitch (solo en pantallas ≥ 860 px, por la
  regla de 400×300 de Twitch); cambia solo a "En vivo ahora" con el evento
  `Twitch.Embed.ONLINE` — **verificado en navegador real** con un canal en vivo.
  Imágenes oficiales de los 10 juegos (de Wikipedia, fuentes en
  `public/juegos/FUENTES.md`) sobre arte propio de OGM. "Momentos de la liga"
  calculados de los datos (jugador del mes, sorpresa, más bajas, racha).
  Gráfica de rating en cada perfil. Fotos de Discord o iniciales en rankings.

- **Tanda 5 — comunidad y marcas:**
  - `/en-vivo`: Twitch con chat, widget de Discord (`OGM_DISCORD_SERVER_ID`) y
    "lo más transmitido" por plataforma (Twitch Helix + IGDB). **Falta la app de
    Twitch** (`TWITCH_CLIENT_ID/SECRET`) y **no está verificado en vivo**: la red
    de esta sesión bloquea api.twitch.tv. La agrupación sí está probada
    (`scripts/check-platforms.ts`).
  - `/tv` (OGM TV): ahora/siguiente en hora de PR, programación semanal,
    programas con auspiciador, tanda comercial y formatos para anunciarse.
    Datos de ejemplo en `data/tv.ts`.
  - `/auspiciadores`: marcas **inventadas** rotuladas como ejemplo
    (`data/sponsors.ts`, dominios `.example`), logos generados, premios y su
    presencia en OGM TV.
  - `/campeones`: podio de cada torneo con foto, bio, ficha, redes, nivel e
    insignias. Fotos: DiceBear "Notionists" (CC0) solo para ejemplos; los
    reales de 2010 van con iniciales y sin redes inventadas. Redes de ejemplo
    se muestran sin enlace.
  - Insignias y niveles (`lib/badges.ts`): 12 insignias calculadas de los datos,
    XP y 10 niveles. En campeones y en cada perfil (vitrina completa).

- **En producción** (21 sep 2026): https://ogm-six.vercel.app — equipo Vercel
  `example-pages-projects`, proyecto `ogm`, base **Neon** `ogm-db` (plan free,
  iad1) vía Marketplace de Vercel. El build aplica el esquema y siembra solo si
  la base está vacía (`vercel-build`). Clave del admin de producción en
  `.admin-password` (local, fuera de git). Deploy: `vercel deploy --prod`.
  Falta: `APP_URL` de producción y la app de Discord para el login real.

## Decisiones tomadas

- **Temporada 1: Free Fire, Clash Royale y Brawlhalla** (uno por formato, gratis,
  en celular). **Votación:** Mobile Legends vs CoD Mobile. **Eventos:** Stumble
  Guys y SF6. VALORANT fuera. Base: `research/00_RECOMENDACION.md`.
- **Inscripción gratis, premios de auspiciadores** hasta la consulta legal por la
  Ley 81-2019 (modalidad peer-to-peer wagering).
- **Sin start.gg ni Braacket.** Todo el flujo es propio.
- Dominio: temporal de Vercel por ahora. **ogmadness.net es de Saul** y se conecta
  cuando se decida.
- Base multi-liga desde el día uno, aunque la venta a otros organizadores sea
  fase 3.

## Lo que sigue

1. Crear la app de Discord y probar el login real. Luego roles en el servidor
   de Discord según el rango (bot).
2. **Inscripción de jugadores y escuadras** desde el sitio, con cobro por ATH
   Móvil y Stripe. Hoy los participantes se crean solos al entrar resultados.
3. **Bracket visual** de eliminación para los torneos de pelea.
4. **Gráfica del rating en el tiempo** en el perfil (la data ya se guarda en
   `rating_history`, falta dibujarla).
5. **Puntos de temporada** como tabla propia, hoy se leen de `results.points`.
6. Desplegar a Vercel con Neon y conectar el dominio.

## Estudio de juegos y tendencias

Tres agentes investigaron en paralelo: `research/01_moviles_establecidos.md`,
`research/02_indie_emergentes.md`, `research/03_tendencias.md`. Hallazgo a
verificar antes de cobrar nada: la Ley 81-2019 de PR mencionaría los esports
como actividad regulada por la Comisión de Juegos.

## Cuentas de OGM (pendiente)

OGM todavía no tiene canales propios (21 sep 2026). Cuando existan, llenar en
`.env.local` (ya tiene los espacios y un `AUTH_SECRET` generado):

- `OGM_TWITCH_URL`, `OGM_KICK_URL`, `OGM_DISCORD_INVITE`, `OGM_CONTACT_EMAIL`
- La app de Discord para el login se crea **bajo la cuenta de OGM**, no la
  personal de Saul: `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`, redirect
  `<APP_URL>/api/auth/discord/callback`. El Client Secret lo pega Saul.
- `ADMIN_DISCORD_IDS`: el ID numérico de Discord de cada admin.

Mientras tanto el sitio dice "por anunciar" y el login funciona con la ruta de
desarrollo `/api/auth/dev?name=...`.

## Imágenes de los juegos

Uso de identificación, sin monetizar (decisión de Saul, 21 sep 2026). Antes de
vender auspicios con el sitio, revisar la política de contenido de fans de cada
editora. Son de baja resolución (Wikipedia limita las de uso justo).

## Notas de operación

- PGlite es de un solo proceso: parar `npm run dev` antes de `npm run setup`.
- `npm run recalc` recalcula el ranking completo sin tocar nada más.
- La consulta legal sobre inscripciones con premio en efectivo sigue pendiente,
  antes de encender cualquier cobro.

## Referencias

- Propuesta de la liga: `~/Downloads/OGM-2026-Propuesta.pdf` y el artifact
  `claude.ai/artifact/KF7fhECDeykxKdm4MiRsD9`.
- Plan escrito: doc `claude.ai/code/artifact/0f3886e5-c4b7-4835-9e58-fcf9d6254d2c`.
- Archivo original: web.archive.org/web/20110109084905/http://ogmadness.net/
