import type { Context } from "hono";
import type { AppVariables } from "../../types.js";
import { err, ok, type AppResult } from "../../result.js";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
  NotaDoutorado,
  NotaMestrado,
  Users,
} from "../../database/schema.js";
import { and, asc, count, desc, eq, ilike, or, sql, type Column } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { databaseError, logDatabaseError } from "../../database/errors.js";
import type { CandidatoResumo } from "@tcc/shared";
import type { CandidatoPaginationQuery, UpdateCandidatoDoutoradoInput } from "./candidato.schema.js";
import { createCandidatoResumoProjection, createCandidatoResumoProjectionDoutorado } from "./candidato.projection.js";
import {
  toCandidatoDoutoradoDetalhe,
  toCandidatoMestradoDetalhe,
  type CandidatoDoutoradoDetalhe,
  type CandidatoMestradoDetalhe,
} from "./candidato.dto.js";
import { applyOrderBy, buildPaginationMeta, getOffset, mapSortByToColumn } from "../../lib/pagination.js";

const Avaliador = alias(Users, "avaliador");
const Auditor = alias(Users, "auditor");

type GetAllCandidatosError = { type: "database_error"; error: unknown };

export type CandidatoMestradoComRelacoes = CandidatoMestradoDetalhe;
export type CandidatoDoutoradoComRelacoes = CandidatoDoutoradoDetalhe;

export interface PaginatedCandidatos {
  mestrado: {
    data: CandidatoResumo[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  doutorado: {
    data: CandidatoResumo[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

const candidatoMestradoSortColumnMap: Record<string, Column> = {
  nome: CandidatoMestrado.nome,
  dataInscricao: CandidatoMestrado.createdAt,
  numeroInscricao: CandidatoMestrado.numeroInscricao,
  status: CandidatoMestrado.tipoCurso,
  tipoCurso: CandidatoMestrado.tipoCurso,
  email: CandidatoMestrado.email,
  avaliado: NotaMestrado.avaliado,
  area1: CandidatoMestrado.primeiraAreaPreferencia,
  area2: CandidatoMestrado.segundaAreaPreferencia,
  avaliador: Avaliador.nome,
  auditor: Auditor.nome,
};

const candidatoDoutoradoSortColumnMap: Record<string, Column> = {
  nome: CandidatoDoutorado.nome,
  dataInscricao: CandidatoDoutorado.createdAt,
  numeroInscricao: CandidatoDoutorado.numeroInscricao,
  status: CandidatoDoutorado.tipoCurso,
  tipoCurso: CandidatoDoutorado.tipoCurso,
  email: CandidatoDoutorado.email,
  avaliado: NotaDoutorado.avaliado,
  area1: CandidatoDoutorado.areaPgcomp,
  avaliador: Avaliador.nome,
  auditor: Auditor.nome,
};

function buildWhereConditions(
  search: string | undefined,
  table: typeof CandidatoMestrado | typeof CandidatoDoutorado,
) {
  if (!search) return undefined;
  const searchTerm = `%${search}%`;
  return or(
    ilike(table.nome, searchTerm),
    ilike(table.cpf, searchTerm),
    ilike(table.email, searchTerm),
    ilike(table.numeroInscricao, searchTerm),
  );
}

async function fetchPaginatedCandidatos(
  db: any,
  table: typeof CandidatoMestrado | typeof CandidatoDoutorado,
  notaTable: typeof NotaMestrado | typeof NotaDoutorado,
  area1: any,
  area2: any,
  query: CandidatoPaginationQuery,
  sortColumnMap: Record<string, Column>,
  customProjection?: (table: any, notaTable: any, avaliador: any, auditor: any) => any,
) {
  const { page, limit, search, sortBy, order } = query;
  const whereClause = buildWhereConditions(search, table);
  const sortColumn = mapSortByToColumn(sortBy, sortColumnMap, table.nome);
  const orderByClause = applyOrderBy(sortColumn, order, table.id);

  const projection = customProjection
    ? customProjection(table, notaTable, Avaliador.nome, Auditor.nome)
    : createCandidatoResumoProjection(
        table,
        notaTable,
        area1,
        area2,
        Avaliador.nome,
        Auditor.nome,
      );

  const [data, totalResult] = await Promise.all([
    db
      .select(projection)
      .from(table)
      .leftJoin(notaTable, eq(notaTable.idCandidato, table.id))
      .leftJoin(Avaliador, eq(table.avaliadorId, Avaliador.id))
      .leftJoin(Auditor, eq(table.auditorId, Auditor.id))
      .where(whereClause)
      .limit(limit)
      .offset(getOffset(page, limit))
      .orderBy(...orderByClause),
    db
      .select({ count: count() })
      .from(table)
      .leftJoin(notaTable, eq(notaTable.idCandidato, table.id))
      .leftJoin(Avaliador, eq(table.avaliadorId, Avaliador.id))
      .leftJoin(Auditor, eq(table.auditorId, Auditor.id))
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data,
    meta: buildPaginationMeta(page, limit, total),
  };
}

const meusCandidatosSortColumnMap: Record<string, (c: CandidatoResumo) => any> = {
  nome: (c) => c.nome,
  numeroInscricao: (c) => c.numeroInscricao,
  status: (c) => c.tipo,
  tipoCurso: (c) => c.tipo,
  email: (c) => c.email,
  avaliado: (c) => c.avaliado,
  area1: (c) => c.area1,
  area2: (c) => c.area2,
  avaliador: (c) => c.avaliador,
  auditor: (c) => c.auditor,
};

function applySortToCandidates(
  candidates: CandidatoResumo[],
  sortBy: string,
  order: string,
) {
  const normalizedOrder = order === "desc" ? "desc" : "asc";
  const sortFn = meusCandidatosSortColumnMap[sortBy] || meusCandidatosSortColumnMap.nome;
  return [...candidates].sort((a, b) => {
    const aVal = sortFn(a);
    const bVal = sortFn(b);
    const comparison =
      aVal == null && bVal == null
        ? 0
        : aVal == null
        ? 1
        : bVal == null
        ? -1
        : String(aVal).localeCompare(String(bVal), "pt-BR", { numeric: true });
    return normalizedOrder === "asc" ? comparison : -comparison;
  });
}

export const getAllMyCandidates = async (
  c: Context<{ Variables: AppVariables }>,
  avaliadorId: string,
  query: CandidatoPaginationQuery,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const { search } = query;
    const whereMestrado = search
      ? and(
          or(
            eq(CandidatoMestrado.avaliadorId, avaliadorId),
            eq(CandidatoMestrado.auditorId, avaliadorId),
          ),
          buildWhereConditions(search, CandidatoMestrado),
        )
      : or(
          eq(CandidatoMestrado.avaliadorId, avaliadorId),
          eq(CandidatoMestrado.auditorId, avaliadorId),
        );

    const whereDoutorado = search
      ? and(
          or(
            eq(CandidatoDoutorado.avaliadorId, avaliadorId),
            eq(CandidatoDoutorado.auditorId, avaliadorId),
          ),
          buildWhereConditions(search, CandidatoDoutorado),
        )
      : or(
          eq(CandidatoDoutorado.avaliadorId, avaliadorId),
          eq(CandidatoDoutorado.auditorId, avaliadorId),
        );

    const [mestrado, doutorado] = await Promise.all([
      db
        .select(
          createCandidatoResumoProjection(
            CandidatoMestrado,
            NotaMestrado,
            CandidatoMestrado.primeiraAreaPreferencia,
            CandidatoMestrado.segundaAreaPreferencia,
            Avaliador.nome,
            Auditor.nome,
          ),
        )
        .from(CandidatoMestrado)
        .leftJoin(
          NotaMestrado,
          eq(NotaMestrado.idCandidato, CandidatoMestrado.id),
        )
        .leftJoin(Avaliador, eq(CandidatoMestrado.avaliadorId, Avaliador.id))
        .leftJoin(Auditor, eq(CandidatoMestrado.auditorId, Auditor.id))
        .where(whereMestrado),
      db
        .select(
          createCandidatoResumoProjectionDoutorado(
            CandidatoDoutorado,
            NotaDoutorado,
            CandidatoDoutorado.areaPgcomp,
            Avaliador.nome,
            Auditor.nome,
          ),
        )
        .from(CandidatoDoutorado)
        .leftJoin(
          NotaDoutorado,
          eq(NotaDoutorado.idCandidato, CandidatoDoutorado.id),
        )
        .leftJoin(Avaliador, eq(CandidatoDoutorado.avaliadorId, Avaliador.id))
        .leftJoin(Auditor, eq(CandidatoDoutorado.auditorId, Auditor.id))
        .where(whereDoutorado),
    ]);

    const todos = [...mestrado, ...doutorado];
    const sorted = applySortToCandidates(todos, query.sortBy ?? "nome", query.order ?? "asc");

    return ok(sorted);
  } catch (error) {
    logDatabaseError("Error fetching all my candidates:", error);
    return databaseError(error);
  }
};

export const getAllCandidatos = async (
  c: Context<{ Variables: AppVariables }>,
  query: CandidatoPaginationQuery,
): Promise<AppResult<PaginatedCandidatos, GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const [mestrado, doutorado] = await Promise.all([
      fetchPaginatedCandidatos(
        db,
        CandidatoMestrado,
        NotaMestrado,
        CandidatoMestrado.primeiraAreaPreferencia,
        CandidatoMestrado.segundaAreaPreferencia,
        query,
        candidatoMestradoSortColumnMap,
      ),
      fetchPaginatedCandidatos(
        db,
        CandidatoDoutorado,
        NotaDoutorado,
        CandidatoDoutorado.areaPgcomp,
        CandidatoDoutorado.areaPgcomp,
        query,
        candidatoDoutoradoSortColumnMap,
        (table, notaTable, avaliador, auditor) =>
          createCandidatoResumoProjectionDoutorado(table, notaTable, table.areaPgcomp, avaliador, auditor),
      ),
    ]);

    return ok({
      mestrado,
      doutorado,
    });
  } catch (error) {
    logDatabaseError("Error fetching all candidatos:", error);
    return databaseError(error);
  }
};

export const getAllCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  query: CandidatoPaginationQuery,
): Promise<AppResult<{ data: CandidatoResumo[]; meta: PaginatedCandidatos["mestrado"]["meta"] }, GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const result = await fetchPaginatedCandidatos(
      db,
      CandidatoMestrado,
      NotaMestrado,
      CandidatoMestrado.primeiraAreaPreferencia,
      CandidatoMestrado.segundaAreaPreferencia,
      query,
      candidatoMestradoSortColumnMap,
    );

    return ok(result);
  } catch (error) {
    logDatabaseError("Error fetching all mestrado candidatos:", error);
    return databaseError(error);
  }
};

export const getAllCandidatosDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  query: CandidatoPaginationQuery,
): Promise<AppResult<{ data: CandidatoResumo[]; meta: PaginatedCandidatos["doutorado"]["meta"] }, GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const result = await fetchPaginatedCandidatos(
      db,
      CandidatoDoutorado,
      NotaDoutorado,
      CandidatoDoutorado.areaPgcomp,
      CandidatoDoutorado.areaPgcomp,
      query,
      candidatoDoutoradoSortColumnMap,
      (table, notaTable, avaliador, auditor) =>
        createCandidatoResumoProjectionDoutorado(table, notaTable, table.areaPgcomp, avaliador, auditor),
    );

    return ok(result);
  } catch (error) {
    logDatabaseError("Error fetching all doutorado candidatos:", error);
    return databaseError(error);
  }
};

export const getCandidatoMestradoById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
): Promise<
  AppResult<CandidatoMestradoComRelacoes | null, GetAllCandidatosError>
> => {
  const dbInstance = c.get("db");

  try {
    const result = await dbInstance
      .select({
        candidato: CandidatoMestrado,
        notas: NotaMestrado,
        avaliadorId: Avaliador.id,
        avaliadorNome: Avaliador.nome,
        auditorId: Auditor.id,
        auditorNome: Auditor.nome,
      })
      .from(CandidatoMestrado)
      .leftJoin(
        NotaMestrado,
        eq(NotaMestrado.idCandidato, CandidatoMestrado.id),
      )
      .leftJoin(Avaliador, eq(CandidatoMestrado.avaliadorId, Avaliador.id))
      .leftJoin(Auditor, eq(CandidatoMestrado.auditorId, Auditor.id))
      .where(eq(CandidatoMestrado.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return ok(null);

    return ok(toCandidatoMestradoDetalhe(row));
  } catch (error) {
    logDatabaseError(`Error fetching mestrado candidato with ID ${id}:`, error);
    return databaseError(error);
  }
};
export const getCandidatoDoutoradoById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
): Promise<
  AppResult<CandidatoDoutoradoComRelacoes | null, GetAllCandidatosError>
> => {
  const dbInstance = c.get("db");

  try {
    const result = await dbInstance
      .select({
        candidato: CandidatoDoutorado,
        notas: NotaDoutorado,
        avaliadorId: Avaliador.id,
        avaliadorNome: Avaliador.nome,
        auditorId: Auditor.id,
        auditorNome: Auditor.nome,
      })
      .from(CandidatoDoutorado)
      .leftJoin(
        NotaDoutorado,
        eq(NotaDoutorado.idCandidato, CandidatoDoutorado.id),
      )
      .leftJoin(Avaliador, eq(CandidatoDoutorado.avaliadorId, Avaliador.id))
      .leftJoin(Auditor, eq(CandidatoDoutorado.auditorId, Auditor.id))
      .where(eq(CandidatoDoutorado.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return ok(null);

    return ok(toCandidatoDoutoradoDetalhe(row));
  } catch (error) {
    logDatabaseError(
      `Error fetching doutorado candidato with ID ${id}:`,
      error,
    );
    return databaseError(error);
  }
};
export const updateCandidatoMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  body: Partial<typeof CandidatoMestrado.$inferInsert>,
) => {
  const dbInstance = c.get("db");

  try {
    const [candidatoAtualizado] = await dbInstance
      .update(CandidatoMestrado)
      .set(body)
      .where(eq(CandidatoMestrado.id, id))
      .returning();
    if (!candidatoAtualizado) return ok(null);

    return ok({ ...candidatoAtualizado });
  } catch (error) {
    logDatabaseError(`Error updating mestrado candidato with ID ${id}:`, error);
    return databaseError(error);
  }
};

export const updateCandidatoDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  body: UpdateCandidatoDoutoradoInput,
) => {
  const dbInstance = c.get("db");

  try {
    const [candidatoAtualizado] = await dbInstance
      .update(CandidatoDoutorado)
      .set(body)
      .where(eq(CandidatoDoutorado.id, id))
      .returning();
    if (!candidatoAtualizado) return ok(null);

    return ok({ ...candidatoAtualizado });
  } catch (error) {
    logDatabaseError(
      `Error updating doutorado candidato with ID ${id}:`,
      error,
    );
    return databaseError(error);
  }
};

export const deleteCandidatoMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
): Promise<AppResult<{ id: string } | null, GetAllCandidatosError>> => {
  const dbInstance = c.get("db");

  try {
    const candidatoExcluido = await dbInstance.transaction(async (tx) => {
      await tx.delete(NotaMestrado).where(eq(NotaMestrado.idCandidato, id));

      const [candidato] = await tx
        .delete(CandidatoMestrado)
        .where(eq(CandidatoMestrado.id, id))
        .returning({
          id: CandidatoMestrado.id,
        });

      if (!candidato) return null;

      return { id: candidato.id };
    });

    return ok(candidatoExcluido);
  } catch (error) {
    logDatabaseError(`Error deleting mestrado candidato with ID ${id}:`, error);
    return databaseError(error);
  }
};

export const deleteCandidatoDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
): Promise<AppResult<{ id: string } | null, GetAllCandidatosError>> => {
  const dbInstance = c.get("db");

  try {
    const candidatoExcluido = await dbInstance.transaction(async (tx) => {
      await tx.delete(NotaDoutorado).where(eq(NotaDoutorado.idCandidato, id));

      const [candidato] = await tx
        .delete(CandidatoDoutorado)
        .where(eq(CandidatoDoutorado.id, id))
        .returning({
          id: CandidatoDoutorado.id,
          // idEndereco: CandidatoDoutorado.idEndereco,
        });

      if (!candidato) return null;

      return { id: candidato.id };
    });

    return ok(candidatoExcluido);
  } catch (error) {
    logDatabaseError(
      `Error deleting doutorado candidato with ID ${id}:`,
      error,
    );
    return databaseError(error);
  }
};
