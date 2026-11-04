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
import { and, asc, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { CandidatoResumo } from "@tcc/shared";
import type { UpdateCandidatoDoutoradoInput } from "./candidato.schema.js";
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
        .select({
          id: CandidatoMestrado.id,
          tipo: CandidatoMestrado.tipoCurso,
          numeroInscricao: CandidatoMestrado.numeroInscricao,
          nome: CandidatoMestrado.nome,
          email: CandidatoMestrado.email,
          avaliadorId: CandidatoMestrado.avaliadorId,
          avaliador: Avaliador.nome,
          auditorId: CandidatoMestrado.auditorId,
          auditor: Auditor.nome,
          avaliado: sql<boolean>`coalesce(${NotaMestrado.avaliado}, false)`,
          area1: CandidatoMestrado.primeiraAreaPreferencia,
          area2: CandidatoMestrado.segundaAreaPreferencia,
        })
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
        .select({
          id: CandidatoDoutorado.id,
          tipo: CandidatoDoutorado.tipoCurso,
          numeroInscricao: CandidatoDoutorado.numeroInscricao,
          nome: CandidatoDoutorado.nome,
          email: CandidatoDoutorado.email,
          avaliadorId: CandidatoDoutorado.avaliadorId,
          avaliador: Avaliador.nome,
          auditorId: CandidatoDoutorado.auditorId,
          auditor: Auditor.nome,
          avaliado: sql<boolean>`coalesce(${NotaDoutorado.avaliado}, false)`,
          area1: CandidatoDoutorado.primeiraOpcaoOrientador,
          area2: CandidatoDoutorado.segundaOpcaoOrientador,
        })
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
      (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"),
    );

    return ok(todos);
  } catch (error) {
    console.error(
      "Error fetching all my candidates:",
      (error as { code?: string })?.code ?? "unknown",
    );
    return err({ type: "database_error", error });
  }
};

export const getAllCandidatos = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const [mestrado, doutorado] = await Promise.all([
      db
        .select({
          id: CandidatoMestrado.id,
          tipo: CandidatoMestrado.tipoCurso,
          numeroInscricao: CandidatoMestrado.numeroInscricao,
          nome: CandidatoMestrado.nome,
          email: CandidatoMestrado.email,
          avaliadorId: CandidatoMestrado.avaliadorId,
          avaliador: Avaliador.nome,
          auditorId: CandidatoMestrado.auditorId,
          auditor: Auditor.nome,
          avaliado: sql<boolean>`coalesce(${NotaMestrado.avaliado}, false)`,
          area1: CandidatoMestrado.primeiraAreaPreferencia,
          area2: CandidatoMestrado.segundaAreaPreferencia,
        })
        .from(CandidatoMestrado)
        .leftJoin(
          NotaMestrado,
          eq(NotaMestrado.idCandidato, CandidatoMestrado.id),
        )
        .leftJoin(Avaliador, eq(CandidatoMestrado.avaliadorId, Avaliador.id))
        .leftJoin(Auditor, eq(CandidatoMestrado.auditorId, Auditor.id)),
      db
        .select({
          id: CandidatoDoutorado.id,
          tipo: CandidatoDoutorado.tipoCurso,
          numeroInscricao: CandidatoDoutorado.numeroInscricao,
          nome: CandidatoDoutorado.nome,
          email: CandidatoDoutorado.email,
          avaliadorId: CandidatoDoutorado.avaliadorId,
          avaliador: Avaliador.nome,
          auditorId: CandidatoDoutorado.auditorId,
          auditor: Auditor.nome,
          avaliado: sql<boolean>`coalesce(${NotaDoutorado.avaliado}, false)`,
          area1: CandidatoDoutorado.primeiraOpcaoOrientador,
          area2: CandidatoDoutorado.segundaOpcaoOrientador,
        })
        .from(CandidatoDoutorado)
        .leftJoin(
          NotaDoutorado,
          eq(NotaDoutorado.idCandidato, CandidatoDoutorado.id),
        )
        .leftJoin(Avaliador, eq(CandidatoDoutorado.avaliadorId, Avaliador.id))
        .leftJoin(Auditor, eq(CandidatoDoutorado.auditorId, Auditor.id)),
    ]);

    const todos = [...mestrado, ...doutorado].sort((a, b) =>
      (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"),
    );

    return ok(todos);
  } catch (error) {
    console.error(
      "Error fetching all candidatos:",
      (error as { code?: string })?.code ?? "unknown",
    );
    return err({ type: "database_error", error });
  }
};
export const getAllCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const result = await db
      .select({
        id: CandidatoMestrado.id,
        tipo: CandidatoMestrado.tipoCurso,
        numeroInscricao: CandidatoMestrado.numeroInscricao,
        nome: CandidatoMestrado.nome,
        email: CandidatoMestrado.email,
        avaliadorId: CandidatoMestrado.avaliadorId,
        avaliador: Avaliador.nome,
        auditorId: CandidatoMestrado.auditorId,
        auditor: Auditor.nome,
        avaliado: sql<boolean>`coalesce(${NotaMestrado.avaliado}, false)`,
        area1: CandidatoMestrado.primeiraAreaPreferencia,
        area2: CandidatoMestrado.segundaAreaPreferencia,
      })
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
    console.error("Error fetching all mestrado candidatos:", error);
    return err({ type: "database_error", error });
  }
};

export const getAllCandidatosDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<CandidatoResumo[], GetAllCandidatosError>> => {
  const db = c.get("db");

  try {
    const result = await db
      .select({
        id: CandidatoDoutorado.id,
        tipo: CandidatoDoutorado.tipoCurso,
        numeroInscricao: CandidatoDoutorado.numeroInscricao,
        nome: CandidatoDoutorado.nome,
        email: CandidatoDoutorado.email,
        avaliadorId: CandidatoDoutorado.avaliadorId,
        avaliador: Avaliador.nome,
        auditorId: CandidatoDoutorado.auditorId,
        auditor: Auditor.nome,
        avaliado: sql<boolean>`coalesce(${NotaDoutorado.avaliado}, false)`,
        area1: CandidatoDoutorado.primeiraOpcaoOrientador,
        area2: CandidatoDoutorado.segundaOpcaoOrientador,
      })
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
    console.error("Error fetching all doutorado candidatos:", error);
    return err({ type: "database_error", error });
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
    console.error(`Error fetching mestrado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
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
    console.error(`Error fetching doutorado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
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
    console.error(`Error updating mestrado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
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
    console.error(`Error updating doutorado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
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
    console.error(`Error deleting mestrado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
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
    console.error(`Error deleting doutorado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
  }
};
