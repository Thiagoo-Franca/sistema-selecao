import { drizzle, PgliteDatabase } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import path from "path"
import * as schema from "../database/schema"

const runDatabaseMigrations = async (database: PgliteDatabase, migrationsFolder: string) => {}

export default runDatabaseMigrations

export const getFakeDb = async () => {
  const db = drizzle({
    schema: schema,
  })
  const migrationsFolder = path.join(__dirname, "..", "database", "drizzle")
  await migrate(db, {
    migrationsFolder,
    migrationsTable: "migrations",
  })
  return db
}

const db = await getFakeDb()

const a = await db.query.usuarios.findMany()

console.log(a)
