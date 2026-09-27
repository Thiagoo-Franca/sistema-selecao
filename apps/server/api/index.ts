import { handle } from "hono/vercel";
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

const handler = handle(app(TrueDeps));

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
