import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { CandidatoMestrado } from "../../database/schema.js";
import { notaMestradoInputSchema } from "../nota/index.js";

export const uploadCandidatosMestradoSchema = z.array(
  createInsertSchema(CandidatoMestrado, {
    numeroInscricao: (schema) => schema.min(1),
  })
    .omit({ id: true, tipoCurso: true })
    .extend({
      notas: notaMestradoInputSchema
        .omit({ notaEtapaII: true })
        .nullish(),
    }),
);

export type UploadCandidatosMestradoInput = z.infer<
  typeof uploadCandidatosMestradoSchema
>;
