import type { Context } from "hono";
import type { AppVariables } from "../../types";
import { err, ok, type AppResult } from "../../result";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
  Endereco,
  NotaDoutorado,
} from "../../database";
import { eq } from "drizzle-orm";

type GetAllCandidatosError = { type: "database_error"; error: unknown };

export const getAllCandidatos = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<
  AppResult<
    {
      mestrado: (typeof CandidatoMestrado.$inferSelect)[];
      doutorado: (typeof CandidatoDoutorado.$inferSelect)[];
    },
    GetAllCandidatosError
  >
> => {
  const dbInstance = c.get("db");

  try {
    const mestradoResult = await dbInstance
      .select()
      .from(CandidatoMestrado)
      .orderBy(CandidatoMestrado.nome);
    const doutoradoResult = await dbInstance
      .select()
      .from(CandidatoDoutorado)
      .orderBy(CandidatoDoutorado.nome);
    return ok({ mestrado: mestradoResult, doutorado: doutoradoResult });
  } catch (error) {
    console.error("Error fetching all candidatos:", error);
    return err({ type: "database_error", error });
  }
};

export const getAllCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<
  AppResult<(typeof CandidatoMestrado.$inferSelect)[], GetAllCandidatosError>
> => {
  const dbInstance = c.get("db");

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoMestrado)
      .orderBy(CandidatoMestrado.nome);
    return ok(result);
  } catch (error) {
    console.error("Error fetching all mestrado candidatos:", error);
    return err({ type: "database_error", error });
  }
};

export const getCandidatoMestradoById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
): Promise<
  AppResult<
    | (typeof CandidatoMestrado.$inferSelect & {
        endereco: typeof Endereco.$inferSelect | null;
      })
    | null,
    GetAllCandidatosError
  >
> => {
  const dbInstance = c.get("db");

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoMestrado)
      .leftJoin(Endereco, eq(CandidatoMestrado.idEndereco, Endereco.id))
      .where(eq(CandidatoMestrado.id, Number(id)))
      .limit(1);

    if (!result[0]) return ok(null);

    const candidato = {
      ...result[0].candidato_mestrado,
      endereco: result[0].endereco,
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
      .leftJoin(Endereco, eq(CandidatoDoutorado.idEndereco, Endereco.id))
      .leftJoin(
        NotaDoutorado,
        eq(NotaDoutorado.idCandidato, CandidatoDoutorado.id),
      )
      .where(eq(CandidatoDoutorado.id, Number(id)))
      .limit(1);

    if (!result[0]) return ok(null);

    const candidato = {
      ...result[0].candidato_doutorado,
      endereco: result[0].endereco,
      notas: result[0].nota_doutorado,
    };

    return ok(candidato);
  } catch (error) {
    console.error(`Error fetching doutorado candidato with ID ${id}:`, error);
    return err({ type: "database_error", error });
  }
};
export const getAllCandidatosDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<
  AppResult<(typeof CandidatoDoutorado.$inferSelect)[], GetAllCandidatosError>
> => {
  const dbInstance = c.get("db");

  try {
    const result = await dbInstance
      .select()
      .from(CandidatoDoutorado)
      .orderBy(CandidatoDoutorado.nome);
    return ok(result);
  } catch (error) {
    console.error("Error fetching all doutorado candidatos:", error);
    return err({ type: "database_error", error });
  }
};
export const updateCandidatoDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  body: Partial<typeof CandidatoDoutorado.$inferInsert>,
): Promise<
  AppResult<
    | (typeof CandidatoDoutorado.$inferSelect & {
        endereco: typeof Endereco.$inferSelect | null;
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
      .where(eq(CandidatoDoutorado.id, Number(id)))
      .returning();

    if (!candidatoAtualizado) return ok(null);

    const [enderecoAtual] = await dbInstance
      .select()
      .from(Endereco)
      .where(eq(Endereco.id, candidatoAtualizado.idEndereco));

    return ok({ ...candidatoAtualizado, endereco: enderecoAtual ?? null });
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
        idCandidato: Number(idCandidato),
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
