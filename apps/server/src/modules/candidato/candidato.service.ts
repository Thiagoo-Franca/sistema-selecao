import type { Context } from "hono"
import type { AppVariables } from "../../types"
import { err, ok, type AppResult } from "../../result"
import { CandidatoDoutorado, CandidatoMestrado } from "../../database"
import { eq } from "drizzle-orm"
import type { CandidatoMestradoNotaEtapa1 } from "./candidato.utils"
import calcularMestradoNotaEtapa1 from "./candidato.utils"

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
    console.error("Error fetching all mestrado candidatos:", error )
    return err({ type: "database_error", error })
  }
}
export const getCandidatoMestradoById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string
): Promise<AppResult<typeof CandidatoMestrado.$inferSelect | null, GetAllCandidatosError>> => {
  
  const dbInstance = c.get("db")

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoMestrado)
      .where(eq(CandidatoMestrado.id, Number(id))) // 1
      .limit(1)                                     // 2

    return ok(result[0] ?? null)                    // 3
  } catch (error) {
    console.error(`Error fetching mestrado candidato with ID ${id}:`, error)
    return err({ type: "database_error", error })
  }
}

export const getCandidatoDoutoradoById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string
): Promise<AppResult<typeof CandidatoDoutorado.$inferSelect | null, GetAllCandidatosError>> => {
  
  const dbInstance = c.get("db")

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoDoutorado)
      .where(eq(CandidatoDoutorado.id, Number(id))) // 1
      .limit(1)                                     // 2
      
    return ok(result[0] ?? null)                    // 3
  } catch (error) {
    console.error(`Error fetching doutorado candidato with ID ${id}:`, error)
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

export const processarResCandidatoMestradoEtapaI = async (
  c: Context<{ Variables: AppVariables }>,
  dados: CandidatoMestradoNotaEtapa1
): Promise<AppResult<{ pontuacao: number; aprovado: boolean }, never>> => {
  try {
    const resultado = calcularMestradoNotaEtapa1(dados)
    return ok(resultado)
  } catch (error) {
    console.error("Error processing mestrado etapa I:", error)
    throw error // ou retorne um err() se quiser manter o padrão de AppResult
  }
}