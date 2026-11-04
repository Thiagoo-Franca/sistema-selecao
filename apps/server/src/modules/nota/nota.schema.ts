import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { NotaDoutorado, NotaMestrado } from "../../database/schema.js";

export const notaMestradoInputSchema = createInsertSchema(NotaMestrado)
  .omit({
    id: true,
    idCandidato: true,
    avaliado: true,
    notaFinal: true,
    formulaVersion: true,
    avaliadoEm: true,
    avaliadoPorId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const notaDoutoradoInputSchema = createInsertSchema(NotaDoutorado)
  .omit({
    id: true,
    idCandidato: true,
    avaliado: true,
    notaFinal: true,
    formulaVersion: true,
    avaliadoEm: true,
    avaliadoPorId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const updateNotaMestradoSchema = z.object({
  grad: z.number().nullable().optional(),
  area: z.number().nullable().optional(),
  enade: z.number().nullable().optional(),
  a1a2a3a4: z.number().nullable().optional(),
  b1b2b3b4: z.number().nullable().optional(),
  icIt: z.number().nullable().optional(),
  poscomp: z.number().nullable().optional(),
  disciplinaPosCapes6Mais: z.number().nullable().optional(),
  disciplinaPosCapes3a5: z.number().nullable().optional(),
  notaEtapaII: z.number().nullable().optional(),
});

export const updateNotaDoutoradoSchema = z.object({
  msc: z.number().nullable().optional(),
  areaFormacaoGraduacao: z.number().nullable().optional(),
  conceitoCapesMestrado: z.number().nullable().optional(),
  a1a2a3a4: z.number().nullable().optional(),
  b1b2b3b4: z.number().nullable().optional(),
  notaAnteprojeto: z.number().nullable().optional(),
});

export type UpdateNotaMestradoInput = z.infer<
  typeof updateNotaMestradoSchema
>;
export type UpdateNotaDoutoradoInput = z.infer<
  typeof updateNotaDoutoradoSchema
>;
