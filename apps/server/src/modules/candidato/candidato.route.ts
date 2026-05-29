import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { match } from "ts-pattern"
import { AppError } from "../../error"
import type { AppVariables } from "../../types"
import { checkRole } from "../auth/auth.middleware"
import * as schema from "./candidato.schema"
import * as service from "./candidato.service"

export const candidatoRoutes = new Hono<{ Variables: AppVariables }>()

  // ✨ LIST: GET /candidatos
  .get(
    "/",
    checkRole(["ADMIN", "TEACHER"]),  // Apenas admin e professor podem listar
    zValidator("query", schema.listCandidatosQuerySchema),
    async (c) => {
      const query = c.req.valid("query")
      const result = await service.listCandidatos(c, query)

      if (!result.ok) {
        throw new AppError(500, "Erro ao listar candidatos")
      }

      return c.json(result.data)
    }
  )

  // ✨ READ: GET /candidatos/:id
  .get(
    "/:id",
    checkRole(["ADMIN", "TEACHER"]),  // Apenas admin e professor podem visualizar
    zValidator("param", schema.candidatoIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param")
      const result = await service.getCandidatoById(c, id)

      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "candidato_not_found" },
            () => new AppError(404, "Candidato não encontrado")
          )
          .with(
            { type: "database_error" },
            () => new AppError(500, "Erro ao buscar candidato")
          )
          .exhaustive()
      }

      return c.json(result.data)
    }
  )