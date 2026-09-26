import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";
import runDatabaseMigrations from "./migrate.js";
import * as schema from "./schema.js";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;

export * from "./schema.js";
export * from "./type-utils.js";

export { schema as drizzleSchema, runDatabaseMigrations };
