import { z } from "zod";
import { AREAPGCOMP, AREAS, GRU_STATUS, ISENCAO_STATUS } from "@tcc/shared";

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
  cursoGrad: z.string().optional(),
  cidadeGrad: z.string().optional(),
  homologa: z.boolean().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  supra: z.boolean().optional(),
});

export { updateCandidatoMestradoSchema };

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

  universidadeMestrado: z.string().optional(),
  cursoMestrado: z.string().optional(),
  cidadeMestrado: z.string().optional(),
});
export type UpdateCandidatoDoutoradoInput = z.infer<
  typeof updateCandidatoDoutoradoSchema
>;
