import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { AppError } from "./error.js";
import { appJwt } from "./modules/auth/auth.middleware.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { JWT_SECRET } from "./modules/auth/jwt.js";
import { bancaRoutes } from "./modules/banca/banca.route.js";
import { calendarRoutes } from "./modules/calendar/calendar.route.js";
import { cursoRoutes } from "./modules/curso/curso.route.js";
import { documentoRoutes } from "./modules/documento/documento.route.js";
import { feedbackRoutes } from "./modules/feedback/feedback.route.js";
import { featureRequestRoutes } from "./modules/feature-request/feature-request.route.js";
import { usuarioRoutes } from "./modules/usuario/usuario.route.js";
import studentInvitationRoutes from "./modules/student-invitation/student-invitation.route.js";
import teacherInvitationRoutes from "./modules/teacher-invitation/teacher-invitation.route.js";
import { type AppVariables } from "./types.js";
import { candidatoRoutes } from "./modules/candidato/candidato.route.js";

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
    .route("/banca", bancaRoutes)
    .route("/calendar", calendarRoutes)
    .route("/cursos", cursoRoutes)
    .route("/documentos", documentoRoutes)
    .route("/feedback", feedbackRoutes)
    .route("/feature-request", featureRequestRoutes)
    .route("/usuario", usuarioRoutes)
    .route("/teacher-invitation", teacherInvitationRoutes)
    .route("/student-invitation", studentInvitationRoutes)
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
