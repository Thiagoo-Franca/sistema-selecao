import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const User = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
