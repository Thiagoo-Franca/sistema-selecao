import { Hono, MiddlewareHandler } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { poweredBy } from "hono/powered-by"
import { prettyJSON } from "hono/pretty-json"
import { AppError } from "./error"
import { authRoutes } from "./modules/auth/auth.route"
import { bancaRoutes } from "./modules/banca/banca.route"
import { calendarRoutes } from "./modules/calendar/calendar.route"
import { cursoRoutes } from "./modules/curso/curso.route"
import { documentoRoutes } from "./modules/documento/documento.route"
import { usuarioRoutes } from "./modules/usuario/usuario.route"
import { AppVariables } from "./types"

export const app = (depsMiddleware: MiddlewareHandler<{ Variables: AppVariables }>) =>
  new Hono<{ Variables: AppVariables }>()
    .use(depsMiddleware)
    .use("*", poweredBy())
    .use("*", logger())
    .use("*", cors())
    .use("*", prettyJSON())
    .get("/", (c) => c.json({ message: "Server is running!" }))
    .route("/auth", authRoutes)
    .route("/banca", bancaRoutes)
    .route("/calendar", calendarRoutes)
    .route("/cursos", cursoRoutes)
    .route("/documentos", documentoRoutes)
    .route("/usuario", usuarioRoutes)
    .notFound((c) => {
      return c.json({ message: "Not Found", ok: false }, 404)
    })
    .onError((err, c) => {
      if (err instanceof AppError) {
        return c.json({ message: err.message }, err.status)
      }
      console.error(`Server Error: ${err}`)
      return c.json({ message: "Internal Server Error" }, 500)
    })

export type AppType = ReturnType<typeof app>
