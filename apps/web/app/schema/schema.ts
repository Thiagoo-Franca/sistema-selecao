import z from "zod"

const uploadCandidatosMestradoSchema = z.array(
  z.object({
    primeiraAreaPreferencia: z.string().optional(),
    segundaAreaPreferencia: z.string().optional(),

    numeroInscricao: z.string().optional(),

    cpf: z.string().optional(),
    nome: z.string().optional(),
    email: z.string().email("Email inválido").optional(),

    cidade_residencia: z.string().optional(),

    solicitouIsencaoTaxaInscricao: z.string().optional(),
    isencaoAprovada: z.string().optional(),
    gru: z.string().optional(),
    gruLink: z.string().optional(),
    homologa: z.string().optional(),

    universidade: z.string().optional(),
    curso: z.string().optional(),
    cidadeGraduacao: z.string().optional(),

    especiais: z.string().optional(),
    cotas: z.string().optional(),
    supra: z.string().optional(),

    grad: z.number().nullable().optional(),
    area: z.number().nullable().optional(),
    enade: z.number().nullable().optional(),

    a1a2a3a4: z.number().nullable().optional(),
    b1b2b3b4: z.number().nullable().optional(),
    icIt: z.number().nullable().optional(),
    poscomp: z.number().nullable().optional(),

    disciplinaPosCapes3a5: z.number().nullable().optional(),
    disciplinaPosCapes6Mais: z.number().nullable().optional(),
  })
)
export { uploadCandidatosMestradoSchema }

const CandidatoMestradoNotaSchema = z.object({
  avaliadorId: z.number().optional(),
  auditorId: z.number().optional(),
  solicitouIsencaoTaxaInscricao: z.string().optional(),
  isencaoAprovada: z.string().optional(),
  gru: z.string().optional(),
  Homologa: z.string().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  SUPRA: z.boolean().optional(),

  avaliado: z.boolean().optional(),

  grad: z.coerce
    .number()
    .min(0, "A nota da graduação não pode ser menor que 0")
    .max(10, "A nota da graduação não pode ser maior que 10")
    .optional(),
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
    z.coerce
      .number()
      .min(0, "A nota da etapa II não pode ser menor que 0")
      .max(10, "A nota da etapa II não pode ser maior que 10")
      .optional()
  ),
})

export type CandidatoMestradoNota = z.infer<typeof CandidatoMestradoNotaSchema>

export { CandidatoMestradoNotaSchema }

const CandidatoDoutoradoNotaEtapa1Schema = z.object({
  avaliadorId: z.string(),
  auditorId: z.string().optional(),
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
