/*

import type { Context } from "hono";
import { match } from "ts-pattern";
import { AppError } from "../../error.js";
import { getBancaInfoForDocument } from "../../services/document.service.js";
import type { AppVariables } from "../../types.js";

export const getBancaDocumentInfo = async (
  c: Context<{ Variables: AppVariables }>,
  bancaId: number,
) => {
  const result = await getBancaInfoForDocument(c, bancaId);

  if (!result.ok) {
    throw match(result.error)
      .with(
        { type: "database_error" },
        () => new AppError(500, "Erro interno do servidor"),
      )
      .with(
        { type: "banca_not_found" },
        () => new AppError(404, "Banca não encontrada"),
      )
      .exhaustive();
  }

  return result.data;
};

*/
