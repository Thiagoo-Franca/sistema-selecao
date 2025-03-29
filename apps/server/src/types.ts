import { db } from "./database"

type DatabaseInstance = typeof db

// Define Variables type for Hono context
export interface AppVariables {
  db: DatabaseInstance
}
