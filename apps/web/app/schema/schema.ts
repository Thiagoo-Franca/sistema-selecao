import z from "zod"

const CandidatoMestradoNotaSchema = z.object({
  avaliador1: z
    .string()
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "O nome do avaliador deve conter apenas letras e espaços")
    .max(30, "O nome do avaliador 1 não pode ter mais de 30 caracteres")
    .optional(),
  avaliador2: z
    .string()
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "O nome do avaliador deve conter apenas letras e espaços")
    .max(30, "O nome do avaliador 2 não pode ter mais de 30 caracteres")
    .optional(),
  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoAprovada: z.boolean().optional(),
  gru: z.string().optional(),
  Homologa: z.string().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  SUPRA: z.boolean().optional(),

  avaliado: z.boolean().optional(),

  grad: z.coerce.number().max(10, "A nota da graduação não pode ser maior que 10").optional(),
  area: z.coerce.number().optional(),
  enade: z
    .number()
    .min(1, "A nota do ENADE deve ser maior ou igual a 1")
    .max(5, "A nota do ENADE não pode ser maior que 5")
    .optional(),
  a1a2a3a4: z.coerce.number().optional(),
  b1b2b3b4: z.coerce.number().optional(),
  icIt: z.coerce.number().optional(),
  poscomp: z.coerce.number().optional(),
  disciplinaPosCapes6Mais: z.coerce.number().optional(),
  disciplinaPosCapes3a5: z.coerce.number().optional(),
  notaEtapaII: z.preprocess(
    (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
    z.coerce.number().max(10, "A nota da etapa II não pode ser maior que 10").optional()
  ),
})

export type CandidatoMestradoNota = z.infer<typeof CandidatoMestradoNotaSchema>

export { CandidatoMestradoNotaSchema }

const CandidatoDoutoradoNotaEtapa1Schema = z.object({
  avaliador1: z.string(),
  avaliador2: z.string().optional(),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos"),
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  solicitouIsencaoTaxaInscricao: z.string(),
  isencaoAprovada: z.string(),
  gru: z.string(),
  homologa: z.string(),
  areaPgcomp: z.string(),
  OrientadorMestrado: z.string(),
  PotencialOrientador1: z.string(),
  PotencialOrientador2: z.string(),
  PotencialOrientador3: z.string(),
  Especiais: z.string(),
  Cotas: z.string(),
  Supra: z.string(),
  Universidade: z.string(),
  Curso: z.string(),
  Cidade: z.string(),
  msc: z.number(),
  areaFormacaoGraduacao: z.number(),
  conceitoCapesMestrado: z.number(),
  a1a2a3a4: z.number(),
  b1b2b3b4: z.number(),
  notaAnteprojeto: z.number(),
})

export type CandidatoDoutoradoNotaEtapa1 = z.infer<typeof CandidatoDoutoradoNotaEtapa1Schema>

export { CandidatoDoutoradoNotaEtapa1Schema }
