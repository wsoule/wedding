import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type PgClient = ReturnType<typeof postgres>;
type DbClient = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  pgClient?: PgClient;
  dbClient?: DbClient;
};

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!globalForDb.pgClient) {
    globalForDb.pgClient = postgres(databaseUrl, {
      max: 5,
      prepare: false,
    });
  }

  if (!globalForDb.dbClient) {
    globalForDb.dbClient = drizzle(globalForDb.pgClient, { schema });
  }

  return globalForDb.dbClient;
}
