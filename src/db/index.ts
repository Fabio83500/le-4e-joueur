import "server-only";
import { SCHEMA_SQL } from "./schema";
import { CLUBS_SEED } from "@/lib/var";

type Row = Record<string, any>;
type Driver = {
  query: (text: string, params?: unknown[]) => Promise<Row[]>;
  exec: (text: string) => Promise<void>;
};

declare global {
  // eslint-disable-next-line no-var
  var __db: Promise<Driver> | undefined;
}

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const postgres = (await import("postgres")).default;
    const local = /localhost|127\.0\.0\.1/.test(url);
    const sql = postgres(url, { max: 5, prepare: false, ssl: local ? false : "require" });
    return {
      query: async (text, params = []) => (await sql.unsafe(text, params as any[])) as unknown as Row[],
      exec: async (text) => { await sql.unsafe(text); },
    };
  }
  // En local : base Postgres intégrée, stockée dans .data/
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? ".data/pglite";
  (await import("node:fs")).mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  return {
    query: async (text, params = []) => (await pg.query<Row>(text, params as any[])).rows,
    exec: async (text) => { await pg.exec(text); },
  };
}

async function init(): Promise<Driver> {
  const d = await createDriver();
  await d.exec(SCHEMA_SQL);
  const [{ n }] = await d.query("SELECT count(*)::int AS n FROM clubs");
  if (n === 0) {
    for (const c of CLUBS_SEED) {
      await d.query("INSERT INTO clubs (name, city, sector, courts) VALUES ($1,$2,$3,$4)", [c.name, c.city, c.sector, c.courts]);
    }
  }
  return d;
}

function db() {
  globalThis.__db ??= init();
  return globalThis.__db;
}

export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await (await db()).query(text, params)) as T[];
}

export async function one<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}
