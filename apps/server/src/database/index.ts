import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env.js";
import runDatabaseMigrations from "./migrate.js";
import { createPool } from "./pool.js";
import * as schema from "./schema.js";

const pool = createPool(env.DATABASE_URL);

export const db = drizzle(pool, { schema });
export type Database = typeof db;

export * from "./schema.js";
export * from "./type-utils.js";

export { schema as drizzleSchema, runDatabaseMigrations };
