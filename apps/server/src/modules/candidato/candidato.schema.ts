import { z } from "zod";

const updateCandidatoMestradoSchema = z.object({
  avaliador1: z.string().nullable().optional(),
  avaliador2: z.string().nullable().optional(),
  primeiraAreaPreferencia: z.string().optional(),
  segundaAreaPreferencia: z.string().optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .optional(),
  nome: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  cidade: z.string().optional(),
  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoAprovada: z.boolean().optional(),
  gru: z.string().optional(),
  homologa: z.string().optional(),
  universidade: z.string().optional(),
  cursoGrad: z.string().optional(),
  cidadeGrad: z.string().optional(),
  possuiNecessidadesEspeciais: z.boolean().optional(),
  vagasNegrosPardos: z.boolean().optional(),
  vagasSupranumerarias: z.boolean().optional(),
});

export { updateCandidatoMestradoSchema };
const updateNotaMestradoSchema = z.object({
  grad: z.number().optional(),
  area: z.number().optional(),
  enade: z.number().optional(),
  a1a2a3a4: z.number().optional(),
  b1b2b3b4: z.number().optional(),
  icIt: z.number().optional(),
  poscomp: z.number().optional(),
  disciplinaPosCapes6Mais: z.number().optional(),
  disciplinaPosCapes3a5: z.number().optional(),
});
export { updateNotaMestradoSchema };

const updateCandidatoDoutoradoSchema = z.object({
  avaliador1: z.string().nullable().optional(),
  avaliador2: z.string().nullable().optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .optional(),
  nome: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoAprovada: z.boolean().optional(),
  gru: z.string().optional(),
  homologa: z.string().optional(),
  areaPgcomp: z.string().optional(),
  orientadorMestrado: z.string().optional(),
  primeiraOpcaoOrientador: z.string().optional(),
  segundaOpcaoOrientador: z.string().optional(),
  terceiraOpcaoOrientador: z.string().optional(),
  possuiNecessidadesEspeciais: z.boolean().optional(),
  vagasNegrosPardos: z.boolean().optional(),
  vagasSupranumerarias: z.boolean().optional(),
  nomeUniversidadeMestrado: z.string().optional(),
  nomeCursoMestrado: z.string().optional(),
  cidadeOndeRealizouMestrado: z.string().optional(),
});
export { updateCandidatoDoutoradoSchema };

const updateNotaDoutoradoSchema = z.object({
  msc: z.number().optional(),
  areaFormacaoGraduacao: z.number().optional(),
  conceitoCapesMestrado: z.number().optional(),
  a1a2a3a4: z.number().optional(),
  b1b2b3b4: z.number().optional(),
  notaAnteprojeto: z.number().optional(),
});

export { updateNotaDoutoradoSchema };
