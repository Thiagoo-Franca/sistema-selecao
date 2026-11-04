import type { Context } from "hono";
import type { AppVariables } from "../../types.js";
import { err, ok, type AppResult } from "../../result.js";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
  NotaDoutorado,
  NotaMestrado,
  Users,
  type InsertCandidatoMestrado,
  type InsertNotaMestrado,
  type SelectCandidatoMestrado,
} from "../../database/schema.js";
import { and, arrayContains, asc, eq, notInArray, or, sql } from "drizzle-orm";
import type { db } from "../../database/index.js";
import { alias } from "drizzle-orm/pg-core";
import {
  type CandidatoResumo,
} from "@tcc/shared";
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

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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

type CandidatoComNotas = InsertCandidatoMestrado & {
  notas?: Omit<InsertNotaMestrado, "id" | "idCandidato"> | null;
};

export type UploadCandidatosError = { type: "database_error"; error: unknown };

type UserArea = NonNullable<SelectCandidatoMestrado["primeiraAreaPreferencia"]>;

async function escolherProfessor(
  tx: Tx,
  area: UserArea | null,
  excluirIds: string[] = [],
) {
  const carga = sql<number>`(
    select count(*) from candidato_mestrado cm
      where cm.avaliador_id = ${Users.id} or cm.auditor_id = ${Users.id}
  ) + (
    select count(*) from candidato_doutorado cd
      where cd.avaliador_id = ${Users.id} or cd.auditor_id = ${Users.id}
  )`;

  const [prof] = await tx
    .select({ id: Users.id })
    .from(Users)
    .where(
      and(
        eq(Users.role, "TEACHER"),
        area ? arrayContains(Users.areas, [area]) : undefined,
        excluirIds.length ? notInArray(Users.id, excluirIds) : undefined,
      ),
    )
    .orderBy(asc(carga), asc(Users.id))
    .limit(1);

  return prof?.id ?? null;
}

export const uploadCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  candidatos: CandidatoComNotas[],
): Promise<AppResult<SelectCandidatoMestrado[], UploadCandidatosError>> => {
  const db = c.get("db");
  if (candidatos.length === 0) return ok([]);

  try {
    const inseridos = await db.transaction(async (tx) => {
      // 1. Lock: serializa alocações concorrentes (uploads/criações simultâneas)
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('alocacao_avaliadores'))`,
      );

      // 2. Insert dos candidatos
      const rows = await tx
        .insert(CandidatoMestrado)
        .values(candidatos.map(({ notas, ...candidato }) => candidato))
        .returning();

      const idPorInscricao = new Map(
        rows.map((r) => [r.numeroInscricao, r.id]),
      );

      // 3. Insert das notas
      const notas = candidatos.flatMap((c) =>
        c.notas
          ? [
              {
                ...c.notas,
                idCandidato:
                  idPorInscricao.get(
                    c.numeroInscricao ? c.numeroInscricao : "",
                  ) ?? "",
              },
            ]
          : [],
      );

      if (notas.length > 0) {
        await tx.insert(NotaMestrado).values(notas);
      }

      // 4. Alocação automática, um candidato por vez.
      // Cada iteração enxerga as alocações anteriores (mesma transação),
      // então o balanceamento funciona dentro do próprio lote.
      const resultado: typeof rows = [];

      for (const row of rows) {
        // Ordem de tentativa: 1ª área, depois 2ª (ignora as vazias)
        const areas = [
          row.primeiraAreaPreferencia,
          row.segundaAreaPreferencia,
        ].filter((a): a is UserArea => !!a);

        // Avaliador: 1ª área; se não houver professor, 2ª; se não, fica vazio
        let avaliadorId: string | null = null;
        for (const area of areas) {
          avaliadorId = await escolherProfessor(tx, area);
          if (avaliadorId) break;
        }

        // Auditor: mesma ordem de áreas, diferente do avaliador;
        // se não houver ninguém nas áreas, qualquer professor (menor carga)
        const excluir = avaliadorId ? [avaliadorId] : [];
        let auditorId: string | null = null;
        for (const area of areas) {
          auditorId = await escolherProfessor(tx, area, excluir);
          if (auditorId) break;
        }
        auditorId ??= await escolherProfessor(tx, null, excluir);

        if (!avaliadorId && !auditorId) {
          resultado.push(row);
          continue;
        }

        const [atualizado] = await tx
          .update(CandidatoMestrado)
          .set({ avaliadorId, auditorId })
          .where(eq(CandidatoMestrado.id, row.id))
          .returning();

        resultado.push(atualizado ?? row);
      }
      return resultado;
    });

    return ok(inseridos);
  } catch (error) {
    console.error("Error uploading mestrado candidatos:", error);
    return err({ type: "database_error", error });
  }
};
