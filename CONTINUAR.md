# OGM — dónde vamos

Última tanda: **21 de septiembre de 2026**. Trigger: "CONTINUE OGM".

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

## Decisiones tomadas

- Juegos de arranque: **móvil al frente** (Free Fire y CoD Mobile), más SF6 y
  VALORANT. Decisión de Saul: el nicho nuevo es móvil.
- **Sin start.gg ni Braacket.** Todo el flujo es propio.
- Dominio: temporal de Vercel por ahora. **ogmadness.net es de Saul** y se conecta
  cuando se decida.
- Base multi-liga desde el día uno, aunque la venta a otros organizadores sea
  fase 3.

## Lo que sigue

1. **Login con Discord** (Auth.js) en vez de la clave compartida, con roles por
   rango. Es lo que más falta para que la comunidad se apropie del sitio.
2. **Inscripción de jugadores y escuadras** desde el sitio, con cobro por ATH
   Móvil y Stripe. Hoy los participantes se crean solos al entrar resultados.
3. **Bracket visual** de eliminación para los torneos de pelea.
4. **Gráfica del rating en el tiempo** en el perfil (la data ya se guarda en
   `rating_history`, falta dibujarla).
5. **Puntos de temporada** como tabla propia, hoy se leen de `results.points`.
6. Desplegar a Vercel con Neon y conectar el dominio.

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
