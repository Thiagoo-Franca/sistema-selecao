import { db, type SelectUser, type UserRole } from "./database/index.js";

type DatabaseInstance = typeof db;

// Define Variables type for Hono context
export interface AppVariables {
  jwtPayload?: {
    iss: string;
    aud: string;
    sub: SelectUser["id"];
    iat: number;
    exp: number;
  };
  usuario?: {
    id: SelectUser["id"];
    role: UserRole;
  };
  db: DatabaseInstance;
}
