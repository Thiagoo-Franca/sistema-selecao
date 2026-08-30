import z from "zod"

const CandidatoMestradoNotaEtapa1Schema = z.object({
    grad: z.coerce.number(),
    area: z.coerce.number(),
    enade: z.number(),
    a1a2a3a4: z.coerce.number(),
    b1b2b3b4: z.coerce.number(),
    ic_it: z.coerce.number(),
    poscomp: z.coerce.number(),
    DISCIPLINA_PÓS_CAPES_6: z.coerce.number(),
    DISCIPLINA_PÓS_CAPES_3_5: z.coerce.number(),
    avaliador1: z.string(),
    avaliador2: z.string().optional(),
    area1: z.string(),
    area2: z.string().optional(),
    id: z.string(),
    cpf: z.string().regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos"),
    nome: z.string().min(1, "O nome é obrigatório"),
    email: z.string().email("Email inválido"),
    cidade: z.string().min(1, "A cidade é obrigatória"),
    isencao: z.string(),
    isencaoAprovada: z.string(),
    GRU: z.string(),
    Homologa: z.string(),
    universidade: z.string(),
    cursoGrad: z.string(),
    cidadeGrad: z.string(),
    especiais: z.string(),
    cotas: z.string(),
    SUPRA: z.string(),
})

export type CandidatoMestradoNotaEtapa1 = z.infer<typeof CandidatoMestradoNotaEtapa1Schema>

export { CandidatoMestradoNotaEtapa1Schema }