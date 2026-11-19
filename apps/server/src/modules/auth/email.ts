import { sql } from "drizzle-orm";
import { Users } from "../../database/schema.js";

// Compara com lower(email) para encontrar também linhas antigas gravadas com
// maiúsculas. O valor recebido já deve vir normalizado por `emailSchema`.
export const emailIgual = (emailNormalizado: string) =>
  sql`lower(${Users.email}) = ${emailNormalizado}`;
