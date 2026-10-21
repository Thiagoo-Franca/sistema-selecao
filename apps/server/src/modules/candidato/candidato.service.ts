import type { Context } from "hono";
import type { AppVariables } from "../../types.js";
import { err, ok, type AppResult } from "../../result.js";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
  NotaDoutorado,
  NotaMestrado,
  type InsertCandidatoMestrado,
  type InsertNotaMestrado,
  type SelectCandidatoMestrado,
} from "../../database/schema.js";
import { eq } from "drizzle-orm";

type GetAllCandidatosError = { type: "database_error"; error: unknown };

export type CandidatoMestradoComRelacoes =
  typeof CandidatoMestrado.$inferSelect & {
    notas: typeof NotaMestrado.$inferSelect | null;
  };

export type CandidatoDoutoradoComRelacoes =
  typeof CandidatoDoutorado.$inferSelect & {
    notas: typeof NotaDoutorado.$inferSelect | null;
  };
export type CandidatoResumo = {
  id: string;
  tipo: "Mestrado" | "Doutorado";
  numeroInscricao: string | null;
  nome: string | null;
  email: string | null;
  avaliador1: string | null;
  avaliador2: string | null;
  avaliado: boolean;
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
          avaliador1: CandidatoMestrado.avaliador1,
          avaliador2: CandidatoMestrado.avaliador2,
          avaliado: CandidatoMestrado.avaliado,
        })
        .from(CandidatoMestrado),
      db
        .select({
          id: CandidatoDoutorado.id,
          tipo: CandidatoDoutorado.tipoCurso,
          numeroInscricao: CandidatoDoutorado.numeroInscricao,
          nome: CandidatoDoutorado.nome,
          email: CandidatoDoutorado.email,
          avaliador1: CandidatoDoutorado.avaliador1,
          avaliador2: CandidatoDoutorado.avaliador2,
          avaliado: CandidatoDoutorado.avaliado,
        })
        .from(CandidatoDoutorado),
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
        avaliador1: CandidatoMestrado.avaliador1,
        avaliador2: CandidatoMestrado.avaliador2,
        avaliado: CandidatoMestrado.avaliado,
      })
      .from(CandidatoMestrado)
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
        avaliador1: CandidatoDoutorado.avaliador1,
        avaliador2: CandidatoDoutorado.avaliador2,
        avaliado: CandidatoDoutorado.avaliado,
      })
      .from(CandidatoDoutorado)
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
      .select()
      .from(CandidatoMestrado)
      .leftJoin(
        NotaMestrado,
        eq(NotaMestrado.idCandidato, CandidatoMestrado.id),
      )
      .where(eq(CandidatoMestrado.id, id))
      .limit(1);

    if (!result[0]) return ok(null);

    const candidato = {
      ...result[0].candidato_mestrado,
      notas: result[0].nota_mestrado,
    };

    return ok(candidato);
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
      .select()
      .from(CandidatoDoutorado)
      .leftJoin(
        NotaDoutorado,
        eq(NotaDoutorado.idCandidato, CandidatoDoutorado.id),
      )
      .where(eq(CandidatoDoutorado.id, id))
      .limit(1);

    if (!result[0]) return ok(null);

    const candidato = {
      ...result[0].candidato_doutorado,
      notas: result[0].nota_doutorado,
    };

    return ok(candidato);
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

export const updateNotaMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  idCandidato: string,
  body: Partial<typeof NotaMestrado.$inferInsert>,
): Promise<
  AppResult<typeof NotaMestrado.$inferSelect | null, GetAllCandidatosError>
> => {
  const dbInstance = c.get("db");

  try {
    const [notaAtualizada] = await dbInstance
      .insert(NotaMestrado)
      .values({
        idCandidato: idCandidato,
        ...body,
      })
      .onConflictDoUpdate({
        target: NotaMestrado.idCandidato, // Assumindo que idCandidato é UNIQUE
        set: body,
      })
      .returning();
    return ok(notaAtualizada ?? null);
  } catch (error) {
    console.error(
      `Error updating/inserting nota mestrado for candidato ID ${idCandidato}:`,
      error,
    );
    return err({ type: "database_error", error });
  }
};

/*
export const updateCandidatoDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  body: Partial<typeof CandidatoDoutorado.$inferInsert>,
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
    const [candidatoAtualizado] = await dbInstance
      .update(CandidatoDoutorado)
      .set(body)
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
export const updateNotaDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  idCandidato: string,
  body: Partial<typeof NotaDoutorado.$inferInsert>,
): Promise<
  AppResult<typeof NotaDoutorado.$inferSelect | null, GetAllCandidatosError>
> => {
  const dbInstance = c.get("db");

  try {
    const [notaAtualizada] = await dbInstance
      .insert(NotaDoutorado)
      .values({
        idCandidato: idCandidato,
        ...body,
      })
      .onConflictDoUpdate({
        target: NotaDoutorado.idCandidato, // Assumindo que idCandidato é UNIQUE
        set: body,
      })
      .returning();

    return ok(notaAtualizada ?? null);
  } catch (error) {
    console.error(
      `Error updating/inserting nota doutorado for candidato ID ${idCandidato}:`,
      error,
    );
    return err({ type: "database_error", error });
  }
};
*/
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
/*
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

      const [outroCandidatoDoutorado] = await tx
        .select({ id: CandidatoDoutorado.id })
        .from(CandidatoDoutorado)
        // .where(eq(CandidatoDoutorado.idEndereco, candidato.idEndereco))
        .limit(1);
      const [outroCandidatoMestrado] = await tx
        .select({ id: CandidatoMestrado.id })
        .from(CandidatoMestrado)
        .where(eq(CandidatoMestrado.idEndereco, candidato.idEndereco))
        .limit(1);

      if (!outroCandidatoMestrado && !outroCandidatoDoutorado) {
        await tx.delete(Endereco).where(eq(Endereco.id, candidato.idEndereco));
      }

      return { id: candidato.id };
    });

    return ok(candidatoExcluido);
  } catch (error) {
    console.error(`Error deleting doutorado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
  }
};

*/
type CandidatoComNotas = InsertCandidatoMestrado & {
  notas?: Omit<InsertNotaMestrado, "id" | "idCandidato"> | null;
};

export type UploadCandidatosError = { type: "database_error"; error: unknown };

export const uploadCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  candidatos: CandidatoComNotas[],
): Promise<AppResult<SelectCandidatoMestrado[], UploadCandidatosError>> => {
  const db = c.get("db");
  if (candidatos.length === 0) return ok([]);

  try {
    const inseridos = await db.transaction(async (tx) => {
      const rows = await tx
        .insert(CandidatoMestrado)
        .values(candidatos.map(({ notas, ...candidato }) => candidato))
        .returning();

      const idPorInscricao = new Map(
        rows.map((r) => [r.numeroInscricao, r.id]),
      );

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
      return rows;
    });

    return ok(inseridos);
  } catch (error) {
    console.error("Error uploading mestrado candidatos:", error);
    return err({ type: "database_error", error });
  }
};
