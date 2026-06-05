import { Hono } from "hono"
import type { AppVariables } from "../../types"
import * as service from "./candidato.service"

export const candidatoRoutes = new Hono<{ Variables: AppVariables }>()
  .get("/", async (c) => {
    const result = await service.getAllCandidatos(c)
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos")
    }
    return c.json(result.data)
  }
  )
  .get("/mestrado", async (c) => {
    const result = await service.getAllCandidatosMestrado(c)
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos de mestrado")
    }
    return c.json(result.data)
  })
  .get("/doutorado", async (c) => {
    const result = await service.getAllCandidatosDoutorado(c)
    if (!result.ok) {
      throw new Error("Erro ao buscar candidatos de doutorado")
    }
    return c.json(result.data)
  })