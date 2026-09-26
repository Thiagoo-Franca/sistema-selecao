import { createMiddleware } from "hono/factory";
import { db } from "../src/database/index.js";
import { app } from "../src/index.js";
import type { AppVariables } from "../src/types.js";

const TrueDeps = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    c.set("db", db);
    await next();
  },
);

export default app(TrueDeps);
