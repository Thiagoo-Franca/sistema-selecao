import { createMiddleware } from "hono/factory";
import { db } from "../src/database";
import { app } from "../src/index";
import type { AppVariables } from "../src/types";

const TrueDeps = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    c.set("db", db);
    await next();
  },
);

export default app(TrueDeps);
