import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { Candidatos } from "../../database";

export const selectCandidatoSchema = createSelectSchema(Candidatos)

export type SelectCandidatoInput = z.infer<typeof selectCandidatoSchema>


export const listCandidatosQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: z.string().optional(),
    tipoCurso: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["nome", "dataInscricao", "email"]).optional().default("dataInscricao"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
}).strict()

export type ListCandidatosQuery = z.infer<typeof listCandidatosQuerySchema>

export const candidatoIdParamSchema = z.object({
    id: z.coerce.number().positive("ID deve ser um número positivo"),
})

export type CandidatoIdParam = z.infer<typeof candidatoIdParamSchema>