import type { CandidatoResumo } from "@tcc/shared"

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: "asc" | "desc"
}

export interface CandidatosPaginationResponse {
  mestrado: Paginated<CandidatoResumo>
  doutorado: Paginated<CandidatoResumo>
}

export type CandidatoSortBy = "nome" | "dataInscricao" | "numeroInscricao" | "status"
export type UsuarioSortBy = "nome" | "email" | "matricula" | "createdAt"

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10
export const DEFAULT_SORT_BY_CANDIDATO: CandidatoSortBy = "nome"
export const DEFAULT_SORT_BY_USUARIO: UsuarioSortBy = "nome"
export const DEFAULT_ORDER = "asc" as const

// Candidato whitelist
export const CANDIDATO_SORT_BY_OPTIONS: CandidatoSortBy[] = [
  "nome",
  "dataInscricao",
  "numeroInscricao",
  "status",
]

// Usuario whitelist
export const USUARIO_SORT_BY_OPTIONS: UsuarioSortBy[] = [
  "nome",
  "email",
  "matricula",
  "createdAt",
]