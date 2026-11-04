import type { Context } from "hono";
import { sql } from "drizzle-orm";
import {
  CandidatoMestrado,
  NotaMestrado,
  type InsertCandidatoMestrado,
  type InsertNotaMestrado,
  type SelectCandidatoMestrado,
} from "../../database/schema.js";
import type { AppVariables } from "../../types.js";
import { err, ok, type AppResult } from "../../result.js";
import { alocarLoteMestrado } from "../alocacao/index.js";
import type { db } from "../../database/index.js";
import type { UploadCandidatosMestradoInput } from "./importacao.schema.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type CandidatoComNotas = InsertCandidatoMestrado & {
  notas?: Omit<InsertNotaMestrado, "id" | "idCandidato"> | null;
};

export type UploadCandidatosError = {
  type: "database_error";
  error: unknown;
};

export const uploadCandidatosMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  candidatos: UploadCandidatosMestradoInput,
): Promise<AppResult<SelectCandidatoMestrado[], UploadCandidatosError>> => {
  const db = c.get("db");
  if (candidatos.length === 0) return ok([]);

  try {
    const inseridos = await db.transaction(async (tx: Tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext('alocacao_avaliadores'))`,
      );

      const rows = await tx
        .insert(CandidatoMestrado)
        .values(
          (candidatos as CandidatoComNotas[]).map(({ notas, ...candidato }) =>
            candidato,
          ),
        )
        .returning();

      const idPorInscricao = new Map(
        rows.map((row) => [row.numeroInscricao, row.id]),
      );
      const notas = (candidatos as CandidatoComNotas[]).flatMap((candidato) =>
        candidato.notas
          ? [
              {
                ...candidato.notas,
                idCandidato:
                  idPorInscricao.get(candidato.numeroInscricao ?? "") ?? "",
              },
            ]
          : [],
      );

      if (notas.length > 0) {
        await tx.insert(NotaMestrado).values(notas);
      }

      return alocarLoteMestrado(tx, rows);
    });

    return ok(inseridos);
  } catch (error) {
    console.error("Error importing mestrado candidatos:", error);
    return err({ type: "database_error", error });
  }
};
