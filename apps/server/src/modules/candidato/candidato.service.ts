import { asc, desc, eq, ilike, or } from "drizzle-orm"
import { type Context } from "hono"
import { type AppResult, err, ok } from "../../result"
import { CandidatoMestrado, CandidatoDoutorado } from "../../database"
import { type AppVariables } from "../../types"
import type { ListCandidatosQuery } from "./candidato.schema"

// ============ TIPOS DE ERRO ============

type GetCandidatoError =
  | { type: "candidato_not_found" }
  | { type: "database_error"; error: unknown }

type ListCandidatosError = { type: "database_error"; error: unknown }

// ============ GET CANDIDATO BY ID ============

/**
 * Obter detalhes de um candidato específico
 */
type SelectCandidatoMestrado = typeof CandidatoMestrado.$inferSelect
type SelectCandidatoDoutorado = typeof CandidatoDoutorado.$inferSelect
export type SelectCandidato = SelectCandidatoMestrado | SelectCandidatoDoutorado

export const getCandidatoById = async (
  c: Context<{ Variables: AppVariables }>,
  candidatoId: number,
): Promise<AppResult<SelectCandidato, GetCandidatoError>> => {
  const db = c.get("db")

  try {
    // Try mestrado first
    const [mestrado] = await db
      .select()
      .from(CandidatoMestrado)
      .where(eq(CandidatoMestrado.id, candidatoId))
      .limit(1)

    if (mestrado) return ok(mestrado)

    const [doutorado] = await db
      .select()
      .from(CandidatoDoutorado)
      .where(eq(CandidatoDoutorado.id, candidatoId))
      .limit(1)

    if (doutorado) return ok(doutorado)

    return err({ type: "candidato_not_found" })

  } catch (error) {
    console.error("Get candidato error:", error)
    return err({ type: "database_error", error })
  }
}

// ============ LIST CANDIDATOS ============

/**
 * Listar candidatos com filtros, busca, paginação e ordenação
 */
export const listCandidatos = async (
  c: Context<{ Variables: AppVariables }>,
  query: ListCandidatosQuery,
): Promise<
  AppResult<
    {
      candidatos: SelectCandidato[]
      total: number
      page: number
      limit: number
      totalPages: number
    },
    ListCandidatosError
  >
> => {
  const db = c.get("db")

  try {
    const page = query.page
    const limit = query.limit
    const offset = (page - 1) * limit

    // Build WHERE conditions
    const buildConditionsFor = (table: any) => {
      const conds: any[] = []
      if (query.status) conds.push(eq(table.status, query.status))
      if (query.tipoCurso) conds.push(eq(table.tipoCurso, query.tipoCurso as any))
      if (query.search) {
        conds.push(or(ilike(table.nome, `%${query.search}%`), ilike(table.email, `%${query.search}%`))!)
      }
      return conds
    }

    const condsM = buildConditionsFor(CandidatoMestrado)
    const condsD = buildConditionsFor(CandidatoDoutorado)

    const rowsM = await db.select().from(CandidatoMestrado).where(condsM.length > 0 ? or(...condsM) : undefined)
    const rowsD = await db.select().from(CandidatoDoutorado).where(condsD.length > 0 ? or(...condsD) : undefined)

    // Combine and sort in-memory
    const combined: SelectCandidato[] = [...rowsM, ...rowsD]

    const sortBy = query.sortBy || "dataInscricao"
    const sortOrder = query.sortOrder === "desc" ? -1 : 1

    combined.sort((a: any, b: any) => {
      const va = a[sortBy as string]
      const vb = b[sortBy as string]
      if (va == null && vb == null) return 0
      if (va == null) return -1 * sortOrder
      if (vb == null) return 1 * sortOrder
      if (va instanceof Date && vb instanceof Date) return (va.getTime() - vb.getTime()) * sortOrder
      if (va < vb) return -1 * sortOrder
      if (va > vb) return 1 * sortOrder
      return 0
    })

    const total = combined.length
    const paged = combined.slice(offset, offset + limit)

    return ok({
      candidatos: paged,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })

  } catch (error) {
    console.error("List candidatos error:", error)
    return err({ type: "database_error", error })
  }
}