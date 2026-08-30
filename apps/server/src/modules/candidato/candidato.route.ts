import { Hono } from "hono"
import type { AppVariables } from "../../types"
import * as service from "./candidato.service"
import type { CandidatoMestradoNotaEtapa1 } from "./candidato.utils"

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
  .get("/mestrado/:id", async (c) => {
    const id = c.req.param("id")
    const result = await service.getCandidatoMestradoById(c, id)
    if (!result.ok) {
      throw new Error("Erro ao buscar candidato de mestrado por ID")
    }
    return c.json(result.data)
  })
  .get("/doutorado/:id", async (c) => {
    const id = c.req.param("id")
    const result = await service.getCandidatoDoutoradoById(c, id)
    if (!result.ok) {
      throw new Error("Erro ao buscar candidato de doutorado por ID")
    }
    return c.json(result.data)
  })
  .post("/mestrado/calcular-etapa1", async (c) => {
  const body = await c.req.json<CandidatoMestradoNotaEtapa1>()
  const result = await service.processarResCandidatoMestradoEtapaI(c, body)
  if (!result.ok) {
    throw new Error("Erro ao calcular nota da etapa I")
  }
  return c.json(result.data)
})
  