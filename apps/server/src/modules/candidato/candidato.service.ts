import type { Context } from "hono"
import type { AppVariables } from "../../types"
import { err, ok, type AppResult } from "../../result"
import { CandidatoDoutorado, CandidatoMestrado, Endereco } from "../../database"
import { eq } from "drizzle-orm"

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
): Promise<AppResult<(typeof CandidatoMestrado.$inferSelect & { endereco: typeof Endereco.$inferSelect | null }) | null, GetAllCandidatosError>> => {

  const dbInstance = c.get("db")

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoMestrado)
      .leftJoin(Endereco, eq(CandidatoMestrado.idEndereco, Endereco.id))
      .where(eq(CandidatoMestrado.id, Number(id)))
      .limit(1)

    if (!result[0]) return ok(null)

    const candidato = {
      ...result[0].candidato_mestrado,
      endereco: result[0].endereco,
    }

    return ok(candidato)
  } catch (error) {
    console.error(`Error fetching mestrado candidato with ID ${id}:`, error)
    return err({ type: "database_error", error })
  }
}
export const getCandidatoDoutoradoById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string
): Promise<AppResult<(typeof CandidatoDoutorado.$inferSelect & { endereco: typeof Endereco.$inferSelect | null }) | null, GetAllCandidatosError>> => {  
  const dbInstance = c.get("db")

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoDoutorado)
      .leftJoin(Endereco, eq(CandidatoDoutorado.idEndereco, Endereco.id))
      .where(eq(CandidatoDoutorado.id, Number(id)))
      .limit(1)

    if (!result[0]) return ok(null)

    const candidato = {
      ...result[0].candidato_doutorado,
      endereco: result[0].endereco,
    }

    return ok(candidato)
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