import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
} from "../../database/schema.js";
import {
  notaDoutoradoInputSchema,
  notaMestradoInputSchema,
} from "../nota/index.js";

export const uploadCandidatosMestradoSchema = z.array(
  createInsertSchema(CandidatoMestrado, {
    numeroInscricao: (schema) => schema.min(1),
  })
    .omit({ id: true, tipoCurso: true })
    .extend({
      notas: notaMestradoInputSchema.omit({ notaEtapaII: true }).nullish(),
    }),
);

export type UploadCandidatosMestradoInput = z.infer<
  typeof uploadCandidatosMestradoSchema
>;

export const uploadCandidatosDoutoradoSchema = z.array(
  createInsertSchema(CandidatoDoutorado, {
    numeroInscricao: (schema) => schema.min(1),
  })
    .omit({ id: true, tipoCurso: true })
    .extend({
      // Mesmo padrão do mestrado: aceita células vazias (null) e os links dos comprovantes.
      notas: notaDoutoradoInputSchema.nullish(),
    }),
);

export type UploadCandidatosDoutoradoInput = z.infer<
  typeof uploadCandidatosDoutoradoSchema
>;
