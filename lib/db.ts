/**
 * Una sola puerta a la base de datos.
 *
 * En local, sin configurar nada, corre sobre PGlite (Postgres embebido, guardado
 * en .data/). En produccion, si existe DATABASE_URL, usa ese Postgres — Neon,
 * Vercel Postgres o el que sea. El SQL es el mismo en los dos casos.
 */

type Params = ReadonlyArray<unknown>;

export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: Params): Promise<T[]>;
  exec(text: string): Promise<void>;
  kind: "pglite" | "postgres";
}

declare global {
  // eslint-disable-next-line no-var
  var __ogmDb: Promise<Db> | undefined;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { max: 5, idle_timeout: 20 });
    return {
      kind: "postgres",
      async query<T>(text: string, params: Params = []) {
        return (await sql.unsafe(text, params as never[])) as unknown as T[];
      },
      async exec(text: string) {
        await sql.unsafe(text);
      },
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.OGM_DATA_DIR ?? "./.data/ogm";
  const { mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  mkdirSync(dirname(dir), { recursive: true });
  const pg = new PGlite(dir);
  await pg.waitReady;
  return {
    kind: "pglite",
    async query<T>(text: string, params: Params = []) {
      const res = await pg.query<T>(text, params as unknown[]);
      return res.rows;
    },
    async exec(text: string) {
      await pg.exec(text);
    },
  };
}

export function getDb(): Promise<Db> {
  if (!globalThis.__ogmDb) globalThis.__ogmDb = connect();
  return globalThis.__ogmDb;
}

export async function q<T = Record<string, unknown>>(
  text: string,
  params: Params = [],
): Promise<T[]> {
  const db = await getDb();
  return db.query<T>(text, params);
}

export async function one<T = Record<string, unknown>>(
  text: string,
  params: Params = [],
): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}
