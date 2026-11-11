import z from "zod"
import { ISENCAO_STATUS } from "../../../../../../../packages/shared/src/isencao"

const uploadCandidatosMestradoSchema = z.array(
  z.object({
    primeiraAreaPreferencia: z.string().optional(),
    segundaAreaPreferencia: z.string().optional(),

    numeroInscricao: z.string().optional(),

    cpf: z.string().optional(),
    nome: z.string().optional(),
    email: z.string().email("Email inválido").optional(),

    cidadeResidencia: z.string().optional(),
    solicitouIsencaoTaxaInscricao: z.string().optional(),
    isencaoAprovada: z.string(),
    gru: z.string().optional(),
    gruLink: z.string().optional(),

    universidade: z.string().optional(),
    curso: z.string().optional(),
    cidadeGraduacao: z.string().optional(),

    homologa: z.boolean(),
    especiais: z.boolean(),
    cotas: z.boolean(),
    supra: z.boolean(),

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
  avaliadorId: z.string().uuid().optional(),
  auditorId: z.string().uuid().optional(),
  cidadeResidencia: z.string().optional(),

  universidade: z.string().optional(),
  cursoGrad: z.string().optional(),
  cidadeGrad: z.string().optional(),

  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoComprovanteLink: z.string().nullable().optional(),
  isencaoAprovada: z.enum(ISENCAO_STATUS).optional(),
  isencaoAprovadaLink: z.string().nullable().optional(),
  gru: z.string().optional(),

  homologa: z.boolean().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  supra: z.boolean().optional(),

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

const uploadCandidatosDoutoradoSchema = z.array(
  z.object({
    numeroInscricao: z.string().optional(),

    cpf: z.string().optional(),
    nome: z.string().optional(),
    email: z.string().email("Email inválido").optional(),

    solicitouIsencaoTaxaInscricao: z.string().optional(),
    isencaoAprovada: z.string(),
    gru: z.string().optional(),
    gruLink: z.string().optional(),

    universidadeMestrado: z.string().optional(),
    cursoMestrado: z.string().optional(),
    cidadeMestrado: z.string().optional(),
    avaliado: z.boolean().optional(),
    areaPgcomp: z.string().optional(),
    msc: z.number().nullable().optional(),
    areaFormacaoGraduacao: z.number().nullable().optional(),
    conceitoCapesMestrado: z.number().nullable().optional(),
    a1a2a3a4: z.number().nullable().optional(),
    b1b2b3b4: z.number().nullable().optional(),
    notaAnteprojeto: z.number().nullable().optional(),
  })
)

export type uploadCandidatosDoutoradoSchema = z.infer<typeof uploadCandidatosDoutoradoSchema>
export { uploadCandidatosDoutoradoSchema }

const CandidatoDoutoradoNotaSchema = z.object({
  avaliadorId: z.string().uuid().optional(),
  auditorId: z.string().uuid().optional(),

  universidadeMestrado: z.string().optional(),
  cursoMestrado: z.string().optional(),
  cidadeMestrado: z.string().optional(),

  solicitouIsencaoTaxaInscricao: z.boolean().optional(),
  isencaoComprovanteLink: z.string().nullable().optional(),
  isencaoAprovada: z.enum(ISENCAO_STATUS).optional(),
  isencaoAprovadaLink: z.string().nullable().optional(),
  gru: z.string().optional(),

  homologa: z.boolean().optional(),
  especiais: z.boolean().optional(),
  cotas: z.boolean().optional(),
  supra: z.boolean().optional(),

  avaliado: z.boolean().optional(),

  msc: z.coerce
    .number()
    .min(0, "A nota do mestrado não pode ser menor que 0")
    .max(10, "A nota do mestrado não pode ser maior que 10")
    .optional(),
  areaGrad: z.coerce.number().optional(),
  a1a2a3a4: z.coerce.number().optional(),
  b1b2b3b4: z.coerce.number().optional(),
  conceitoCapesMestrado: z.coerce.number().optional(),
  notaAnteprojeto: z.coerce.number().optional(),
  notaEtapaII: z.preprocess(
    (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
    z.coerce
      .number()
      .min(0, "A nota da etapa II não pode ser menor que 0")
      .max(10, "A nota da etapa II não pode ser maior que 10")
      .optional()
  ),
})

export type CandidatoDoutoradoNota = z.infer<typeof CandidatoDoutoradoNotaSchema>

export { CandidatoDoutoradoNotaSchema }
