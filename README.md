# OGM · Online Gaming Madness

Plataforma de la liga de esports de Puerto Rico: torneos, rankings por juego,
perfiles de jugadores y salón de campeones desde 2010.

Next.js 16 · Postgres · OpenSkill (MIT) · sin dependencia de start.gg ni Braacket.

## Correrlo

```bash
npm install
npm run setup      # crea las tablas, carga los datos y calcula el ranking
npm run dev        # http://localhost:3000
```

Panel de admin en `/admin`. La clave sale de `ADMIN_PASSWORD` en `.env.local`
(por defecto `ogm2026` — **cámbiala antes de publicar**).

> **Importante en local:** la base embebida (PGlite) es de un solo proceso.
> Para correr `npm run setup` o `npm run recalc`, para primero el `npm run dev`.

## Base de datos

- **Sin `DATABASE_URL`**: corre sobre PGlite, un Postgres embebido que guarda
  todo en `.data/`. No hay que instalar nada.
- **Con `DATABASE_URL`**: usa ese Postgres (Neon, Vercel Postgres, el que sea).
  El SQL es el mismo; solo cambia el driver.

Para producción: crear la base en Vercel, poner `DATABASE_URL` y `ADMIN_PASSWORD`
en las variables del proyecto, y correr `npm run setup` una vez apuntando a ella.

## Cómo está armado

| Archivo | Qué hace |
| --- | --- |
| `scripts/schema.sql` | Las tablas. Multi-liga desde el día uno |
| `data/seed.ts` | Archivo real de 2010 + temporada de ejemplo |
| `lib/rating.ts` | El motor de ranking con OpenSkill |
| `lib/queries.ts` | Todas las consultas de lectura |
| `app/` | Páginas públicas y panel de admin |

### Los tres formatos de juego

El modelo aguanta los tres con las mismas tablas:

- **duel** — uno contra uno (Street Fighter 6). Un match con 2 lados.
- **squad** — equipo contra equipo (VALORANT). Un match con 2 lados, cada uno un equipo.
- **br** — battle royale por escuadras (Free Fire, CoD Mobile). Un match con
  N lados ordenados por colocación. Esto es lo que Elo y Glicko no pueden hacer
  y OpenSkill sí.

### El ranking

Todos empiezan en **1000**. Cada partida recalcula el rating de los jugadores
involucrados; ganarle a alguien fuerte sube más que ganarle a alguien débil, y
en un lobby de battle royale cuenta la colocación completa, no solo quién ganó.

El recálculo es **determinista**: borra todo y replaya los partidos en orden.
Mismos partidos, mismo resultado, siempre. Corre solo cada vez que se entra un
resultado desde el admin, o a mano con `npm run recalc`.

Un jugador tiene **un rating por juego**. KobraPR puede ser #5 en Free Fire y
#5 en CoD Mobile con números distintos; son tablas independientes.

## Datos

Los campeones de 2010 (Los GloK, TNE, Beyond Limits, Esteban Pelliccia y los
demás) salen del archivo público de ogmadness.net, capturado el 9 de enero de
2011. Son datos reales.

Todo lo de 2026 es de ejemplo, marcado con `is_example` y rotulado en pantalla
para que nadie lo confunda con resultados de verdad. Se borra cargando datos
reales por el panel de admin.
