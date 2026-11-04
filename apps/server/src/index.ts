import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { AppError } from "./error.js";
import { appJwt, authRoutes, JWT_SECRET } from "./modules/auth/index.js";
import { feedbackRoutes } from "./modules/feedback/index.js";
import { usuarioRoutes } from "./modules/usuario/index.js";
import { type AppVariables } from "./types.js";
import { candidatoRoutes } from "./modules/candidato/index.js";

export const app = (
  depsMiddleware: MiddlewareHandler<{ Variables: AppVariables }>,
) =>
  new Hono<{ Variables: AppVariables }>()
    .use(depsMiddleware)
    .use("*", poweredBy())
    .use("*", logger())
    .use("*", cors())
    .use("*", prettyJSON())
    .use("*", appJwt({ secret: JWT_SECRET }))
    .route("/auth", authRoutes)
    .route("/candidato", candidatoRoutes)
    .route("/feedback", feedbackRoutes)
    .route("/usuario", usuarioRoutes)
    .notFound((c) => {
      return c.json({ message: "Not Found", ok: false }, 404);
    })
    .onError((err, c) => {
      if (err instanceof AppError) {
        return c.json({ message: err.message }, err.status);
      }
      console.error(`Server Error: ${err}`);
      return c.json({ message: "Internal Server Error" }, 500);
    });

export type AppType = ReturnType<typeof app>;
