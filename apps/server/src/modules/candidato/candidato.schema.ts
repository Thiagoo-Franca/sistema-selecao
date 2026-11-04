import { z } from "zod";
import { AREAS, GRU_STATUS, ISENCAO_STATUS } from "@tcc/shared";
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
  cidade: z.string().optional(),
  solicitouIsencaoTaxaInscricao: z.string().optional(),
  isencaoAprovada: z.enum(ISENCAO_STATUS).optional(),
  gru: z.enum(GRU_STATUS).optional(),
  homologa: z.boolean().nullable().optional(),
  universidade: z.string().optional(),
  cursoGrad: z.string().optional(),
  cidadeGrad: z.string().optional(),
  possuiNecessidadesEspeciais: z.boolean().optional(),
  vagasNegrosPardos: z.boolean().optional(),

  vagasSupranumerarias: z.boolean().optional(),
});

export { updateCandidatoMestradoSchema };

export const updateCandidatoDoutoradoSchema = z.object({
  avaliador: z.string().nullable().optional(),
  auditor: z.string().nullable().optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .optional(),
  nome: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoAprovada: z.enum(ISENCAO_STATUS).optional(),
  gru: z.enum(GRU_STATUS).optional(),
  homologa: z.boolean().nullable().optional(),
  areaPgcomp: z.string().optional(),
  orientadorMestrado: z.string().optional(),
  primeiraOpcaoOrientador: z.string().optional(),
  segundaOpcaoOrientador: z.string().nullable().optional(),
  terceiraOpcaoOrientador: z.string().optional(),
  possuiNecessidadesEspeciais: z.boolean().optional(),
  vagasNegrosPardos: z.boolean().optional(),
  vagasSupranumerarias: z.boolean().optional(),
  nomeUniversidadeMestrado: z.string().optional(),
  nomeCursoMestrado: z.string().optional(),
  cidadeOndeRealizouMestrado: z.string().optional(),
});
export type UpdateCandidatoDoutoradoInput = z.infer<
  typeof updateCandidatoDoutoradoSchema
>;
