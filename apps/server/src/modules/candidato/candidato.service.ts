import type { Context } from "hono"
import type { AppVariables } from "../../types"
import { err, ok, type AppResult } from "../../result"
import { CandidatoDoutorado, CandidatoMestrado } from "../../database"

type GetAllCandidatosError = { type: "database_error"; error: unknown }

export const getAllCandidatos = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<{ mestrado: (typeof CandidatoMestrado.$inferSelect)[]; doutorado: (typeof CandidatoDoutorado.$inferSelect)[] }, GetAllCandidatosError>> => {
  
  const dbInstance = c.get("db")

  try {
    const mestradoResult = await dbInstance.select().from(CandidatoMestrado).orderBy(CandidatoMestrado.nome)
    const doutoradoResult = await dbInstance.select().from(CandidatoDoutorado).orderBy(CandidatoDoutorado.nome)
    return ok({ mestrado: mestradoResult, doutorado: doutoradoResult })
  }
  catch (error) {
    console.error("Error fetching all candidatos:", error)
    return err({ type: "database_error", error })
  }
}

export const getAllCandidatosMestrado = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<(typeof CandidatoMestrado.$inferSelect)[], GetAllCandidatosError>> => {
  
  const dbInstance = c.get("db")

  try {
    const result = await dbInstance.select().from(CandidatoMestrado).orderBy(CandidatoMestrado.nome)
    return ok(result)
  }
  catch (error) {
    console.error("Error fetching all mestrado candidatos:", error)
    return err({ type: "database_error", error })
  }
}

export const getAllCandidatosDoutorado = async (c: Context<{ Variables: AppVariables }>): Promise<AppResult<(typeof CandidatoDoutorado.$inferSelect)[], GetAllCandidatosError>> => {
  
  const dbInstance = c.get("db")

  try {
    const result = await dbInstance.select().from(CandidatoDoutorado).orderBy(CandidatoDoutorado.nome)
    return ok(result)
  } catch (error) {
    console.error("Error fetching all doutorado candidatos:", error)
    return err({ type: "database_error", error })
  }
}