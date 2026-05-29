import { asc, desc, eq, ilike, or } from "drizzle-orm"
import { type Context } from "hono"
import { type AppResult, err, ok } from "../../result"
import { Candidatos, type SelectCandidato } from "../../database"
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
export const getCandidatoById = async (
  c: Context<{ Variables: AppVariables }>,
  candidatoId: number,
): Promise<AppResult<SelectCandidato, GetCandidatoError>> => {
  const db = c.get("db")

  try {
    const [candidato] = await db
      .select()
      .from(Candidatos)
      .where(eq(Candidatos.id, candidatoId))
      .limit(1)

    if (!candidato) {
      return err({ type: "candidato_not_found" })
    }

    return ok(candidato)

  } catch (error) {
    console.error("❌ Get candidato error:", error)
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
    const conditions = []

    // Filter por status
    if (query.status) {
      conditions.push(eq(Candidatos.status, query.status))
    }

    // Filter por tipo de curso
    if (query.tipoCurso) {
      conditions.push(eq(Candidatos.tipoCurso, query.tipoCurso as any))
    }

    // Filter por busca (nome, email)
    if (query.search) {
      conditions.push(
        or(
          ilike(Candidatos.nome, `%${query.search}%`),
          ilike(Candidatos.email, `%${query.search}%`),
        )!
      )
    }

    // Count total
    const countResult = await db
      .select({ count: Candidatos.id })
      .from(Candidatos)
      .where(conditions.length > 0 ? or(...conditions) : undefined)

    const total = countResult.length

    // Ordenação
    const sortColumn = 
      query.sortBy === "nome" ? Candidatos.nome :
      query.sortBy === "email" ? Candidatos.email :
      Candidatos.dataInscricao

    const sortDirection = query.order === "desc" ? desc : asc

    // Query com paginação
    const rows = await db
      .select()
      .from(Candidatos)
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(sortDirection(sortColumn))
      .limit(limit)
      .offset(offset)

    return ok({
      candidatos: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })

  } catch (error) {
    console.error("❌ List candidatos error:", error)
    return err({ type: "database_error", error })
  }
}