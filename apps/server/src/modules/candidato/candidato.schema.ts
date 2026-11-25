import { z } from "zod";
import { AREAPGCOMP, AREAS, GRU_STATUS, ISENCAO_STATUS } from "@tcc/shared";
import { createSortBySchema } from "../../lib/pagination.js";

const areaEnum = z.enum(AREAS);

const updateCandidatoMestradoSchema = z.object({
  avaliadorId: z.string().uuid().nullable().optional(),
  auditorId: z.string().uuid().nullable().optional(),
  primeiraAreaPreferencia: areaEnum.optional(),
  segundaAreaPreferencia: areaEnum.optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .optional(),
  nome: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  cidadeResidencia: z.string().optional(),
  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoComprovanteLink: z.string().nullable().optional(),
  isencaoAprovada: z.enum(ISENCAO_STATUS).optional(),
  gru: z.enum(GRU_STATUS).optional(),

  universidade: z.string().optional(),
  curso: z.string().optional(),
  cidadeGraduacao: z.string().optional(),
  homologa: z.boolean().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  supra: z.boolean().optional(),
});

export { updateCandidatoMestradoSchema };
export type UpdateCandidatoMestradoInput = z.infer<
  typeof updateCandidatoMestradoSchema
>;

export const updateCandidatoDoutoradoSchema = z.object({
  avaliadorId: z.string().uuid().nullable().optional(),
  auditorId: z.string().uuid().nullable().optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .optional(),
  nome: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoComprovanteLink: z.string().nullable().optional(),
  isencaoAprovada: z.enum(ISENCAO_STATUS).optional(),
  gru: z.enum(GRU_STATUS).optional(),
  homologa: z.boolean().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  supra: z.boolean().optional(),
  areaPgcomp: z.enum(AREAPGCOMP).optional(),
  orientadorMestrado: z.string().optional(),
  primeiraOpcaoOrientador: z.string().optional(),
  segundaOpcaoOrientador: z.string().nullable().optional(),
  terceiraOpcaoOrientador: z.string().optional(),

  nomeUniversidadeMestrado: z.string().optional(),
  nomeCursoMestrado: z.string().optional(),
  cidadeMestrado: z.string().optional(),
});
export type UpdateCandidatoDoutoradoInput = z.infer<
  typeof updateCandidatoDoutoradoSchema
>;

const candidatoSortByValues = [
  "nome",
  "dataInscricao",
  "numeroInscricao",
  "status",
  "tipoCurso",
  "email",
  "avaliado",
  "area1",
  "area2",
  "avaliador",
  "auditor",
] as const;

export const candidatoPaginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional().transform((v) => (v === "" ? undefined : v)),
    sortBy: createSortBySchema([...candidatoSortByValues] as [string, ...string[]]).default("nome"),
    order: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export type CandidatoPaginationQuery = z.infer<typeof candidatoPaginationQuerySchema>;
