import { eq } from "drizzle-orm";
import type { Context } from "hono";
import {
  NotaDoutorado,
  NotaMestrado,
  type SelectNotaDoutorado,
  type SelectNotaMestrado,
} from "../../database/schema.js";
import { logDatabaseError } from "../../database/errors.js";
import { err, ok, type AppResult } from "../../result.js";
import { getUsuarioAutenticado } from "../auth/index.js";
import {
  calcularDoutoradoNota,
  calcularMestradoNota,
  paraNumeroSeguro,
} from "@tcc/shared";
import type { AppVariables } from "../../types.js";
import type {
  UpdateNotaDoutoradoInput,
  UpdateNotaMestradoInput,
} from "./nota.schema.js";

type UpdateNotaError = { type: "database_error"; error: unknown };

const numero = (value: number | null | undefined) =>
  paraNumeroSeguro(value ?? undefined);

export const updateNotaMestrado = async (
  c: Context<{ Variables: AppVariables }>,
  idCandidato: string,
  body: UpdateNotaMestradoInput,
): Promise<AppResult<SelectNotaMestrado | null, UpdateNotaError>> => {
  const db = c.get("db");
  const usuario = getUsuarioAutenticado(c);

  try {
    const nota = await db.transaction(async (tx) => {
      const [atual] = await tx
        .select()
        .from(NotaMestrado)
        .where(eq(NotaMestrado.idCandidato, idCandidato))
        .limit(1)
        .for("update");

      const partes = { ...atual, ...body };
      const { pontuacao } = calcularMestradoNota({
        grad: numero(partes.grad),
        area: numero(partes.area),
        enade: numero(partes.enade),
        a1a2a3a4: numero(partes.a1a2a3a4),
        b1b2b3b4: numero(partes.b1b2b3b4),
        icIt: numero(partes.icIt),
        poscomp: numero(partes.poscomp),
        disciplinaPosCapes6Mais: numero(partes.disciplinaPosCapes6Mais),
        disciplinaPosCapes3a5: numero(partes.disciplinaPosCapes3a5),
        notaEtapaII: numero(partes.notaEtapaII),
      });

      const now = new Date();
      const values = {
        ...body,
        avaliado: true,
        notaFinal: pontuacao,
        formulaVersion: 1,
        avaliadoEm: now,
        avaliadoPorId: usuario.id,
        updatedAt: now,
      };

      const [salva] = await tx
        .insert(NotaMestrado)
        .values({ idCandidato, ...values })
        .onConflictDoUpdate({
          target: NotaMestrado.idCandidato,
          set: values,
        })
        .returning();

      return salva;
    });

    return ok(nota ?? null);
  } catch (error) {
    console.error(
      `Error updating nota mestrado for candidato ID ${idCandidato}:`,
      error,
    );
    return err({ type: "database_error", error });
  }
};

export const updateNotaDoutorado = async (
  c: Context<{ Variables: AppVariables }>,
  idCandidato: string,
  body: UpdateNotaDoutoradoInput,
): Promise<AppResult<SelectNotaDoutorado | null, UpdateNotaError>> => {
  const db = c.get("db");
  const usuario = getUsuarioAutenticado(c);

  try {
    const nota = await db.transaction(async (tx) => {
      const [atual] = await tx
        .select()
        .from(NotaDoutorado)
        .where(eq(NotaDoutorado.idCandidato, idCandidato))
        .limit(1)
        .for("update");

      const partes = { ...atual, ...body };
      const { pontuacao } = calcularDoutoradoNota({
        msc: numero(partes.msc),
        areaFormacaoGraduacao: numero(partes.areaFormacaoGraduacao),
        conceitoCapesMestrado: numero(partes.conceitoCapesMestrado),
        a1a2a3a4: numero(partes.a1a2a3a4),
        b1b2b3b4: numero(partes.b1b2b3b4),
        notaAnteprojeto: numero(partes.notaAnteprojeto),
      });

      const now = new Date();
      const values = {
        ...body,
        avaliado: true,
        notaFinal: pontuacao,
        formulaVersion: 1,
        avaliadoEm: now,
        avaliadoPorId: usuario.id,
        updatedAt: now,
      };

      const [salva] = await tx
        .insert(NotaDoutorado)
        .values({
          idCandidato,
          historicoMestradoLink: atual?.historicoMestradoLink ?? "",
          ...values,
        })
        .onConflictDoUpdate({
          target: NotaDoutorado.idCandidato,
          set: values,
        })
        .returning();

      return salva;
    });

    return ok(nota ?? null);
  } catch (error) {
    logDatabaseError(
      `Error updating nota doutorado for candidato ID ${idCandidato}:`,
      error,
    );
    return err({ type: "database_error", error });
  }
};
