import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

// postgres() connects lazily, so a missing URL only fails when a query runs
// (not at build time, when pages are compiled but no database is around).
function connect() {
  return postgres(process.env.DATABASE_URL ?? "postgres://missing-DATABASE_URL", { max: 5 });
}

// Reuse one connection pool across hot reloads in dev.
const pg = globalForDb.pg ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.pg = pg;

export const db = drizzle(pg, { schema });
