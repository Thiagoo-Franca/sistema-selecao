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
import { and, asc, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { databaseError, logDatabaseError } from "../../database/errors.js";
import type { CandidatoResumo } from "@tcc/shared";
import type { UpdateCandidatoDoutoradoInput } from "./candidato.schema.js";
import { createCandidatoResumoProjection } from "./candidato.projection.js";
import {
  toCandidatoDoutoradoDetalhe,
  toCandidatoMestradoDetalhe,
  type CandidatoDoutoradoDetalhe,
  type CandidatoMestradoDetalhe,
} from "./candidato.dto.js";

const Avaliador = alias(Users, "avaliador");
const Auditor = alias(Users, "auditor");

type GetAllCandidatosError = { type: "database_error"; error: unknown };

export type CandidatoMestradoComRelacoes = CandidatoMestradoDetalhe;
export type CandidatoDoutoradoComRelacoes = CandidatoDoutoradoDetalhe;


export const getAllMyCandidates = async (
  c: Context<{ Variables: AppVariables }>,
  avaliadorId: string,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
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
        .where(
          or(
            eq(CandidatoMestrado.avaliadorId, avaliadorId),
            eq(CandidatoMestrado.auditorId, avaliadorId),
          ),
        ),
      db
        .select(
          createCandidatoResumoProjection(
            CandidatoDoutorado,
            NotaDoutorado,
            CandidatoDoutorado.primeiraOpcaoOrientador,
            CandidatoDoutorado.segundaOpcaoOrientador,
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
        .where(
          or(
            eq(CandidatoDoutorado.avaliadorId, avaliadorId),
            eq(CandidatoDoutorado.auditorId, avaliadorId),
          ),
        ),
    ]);

    const todos = [...mestrado, ...doutorado].sort((a, b) =>
      String(a.nome ?? "").localeCompare(String(b.nome ?? ""), "pt-BR"),
    );

    return ok(todos);
  } catch (error) {
    logDatabaseError("Error fetching all my candidates:", error);
    return databaseError(error);
  }
};

export const getAllCandidatos = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
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
        .leftJoin(Auditor, eq(CandidatoMestrado.auditorId, Auditor.id)),
      db
        .select(
          createCandidatoResumoProjection(
            CandidatoDoutorado,
            NotaDoutorado,
            CandidatoDoutorado.primeiraOpcaoOrientador,
            CandidatoDoutorado.segundaOpcaoOrientador,
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
        .leftJoin(Auditor, eq(CandidatoDoutorado.auditorId, Auditor.id)),
    ]);

    const todos = [...mestrado, ...doutorado].sort((a, b) =>
      String(a.nome ?? "").localeCompare(String(b.nome ?? ""), "pt-BR"),
    );

    return ok(todos);
  } catch (error) {
    logDatabaseError("Error fetching all candidatos:", error);
    return databaseError(error);
  }
};
export const getAllCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const result = await db
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
      .orderBy(CandidatoMestrado.nome);
    return ok(result);
  } catch (error) {
    logDatabaseError("Error fetching all mestrado candidatos:", error);
    return databaseError(error);
  }
};

export const getAllCandidatosDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const result = await db
      .select(
        createCandidatoResumoProjection(
          CandidatoDoutorado,
          NotaDoutorado,
          CandidatoDoutorado.primeiraOpcaoOrientador,
          CandidatoDoutorado.segundaOpcaoOrientador,
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
      .orderBy(CandidatoDoutorado.nome);
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
): Promise<
  AppResult<
    | (typeof CandidatoDoutorado.$inferSelect & {
        //  endereco: typeof Endereco.$inferSelect | null;
      })
    | null,
    GetAllCandidatosError
  >
> => {
  const dbInstance = c.get("db");

  try {
    const asText = (value: boolean | undefined) =>
      value === undefined ? undefined : value ? "sim" : "nao";
    const updateData: Partial<typeof CandidatoDoutorado.$inferInsert> = {
      cpf: body.cpf,
      nome: body.nome,
      email: body.email,
      solicitouIsencaoTaxaInscricao: asText(
        body.solicitouIsencaoTaxaInscricao,
      ),
      isencaoAprovada: body.isencaoAprovada,
      gru: body.gru,
      homologa: body.homologa,
      areaPgcomp: body.areaPgcomp,
      orientadorMestrado: body.orientadorMestrado,
      primeiraOpcaoOrientador: body.primeiraOpcaoOrientador,
      segundaOpcaoOrientador: body.segundaOpcaoOrientador ?? undefined,
      terceiraOpcaoOrientador: body.terceiraOpcaoOrientador,
      nomeUniversidadeMestrado: body.nomeUniversidadeMestrado,
      nomeCursoMestrado: body.nomeCursoMestrado,
      especiais: asText(body.possuiNecessidadesEspeciais),
      cotas: asText(body.vagasNegrosPardos),
      supra: asText(body.vagasSupranumerarias),
    };

    const [candidatoAtualizado] = await dbInstance
      .update(CandidatoDoutorado)
      .set(updateData)
      .where(eq(CandidatoDoutorado.id, id))
      .returning();

    if (!candidatoAtualizado) return ok(null);

    //    const [enderecoAtual] = await dbInstance
    //      .select()
    //      .from(Endereco)
    //      .where(eq(Endereco.id, candidatoAtualizado.idEndereco));

    return ok({
      ...candidatoAtualizado,
      //  endereco: enderecoAtual ?? null
    });
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
