import { zValidator } from "@hono/zod-validator";
import {z} from "zod";

const updateCandidatoDoutoradoSchema = z.object({
  avaliador1: z.string().nullable().optional(),
  avaliador2: z.string().nullable().optional(),
    cpf: z.string().regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos").optional(),
    nome: z.string().min(1, "O nome é obrigatório").optional(),
    email: z.string().email("Email inválido").optional(),
    solicitouIsencaoTaxaInscricao: z.string().optional(),
    isencaoAprovada: z.string().optional(),
    GRU: z.string().optional(),
    homologa: z.string().optional(),
    areaPGCOMP: z.string().optional(),
    OrientadorMestrado: z.string().optional(),
    PotencialOrientador1: z.string().optional(),
    PotencialOrientador2: z.string().optional(),
    PotencialOrientador3: z.string().optional(),
    Especiais: z.string().optional(),
    Cotas: z.string().optional(),
    Supra: z.string().optional(),
    Universidade: z.string().optional(),
    Curso: z.string().optional(),
    Cidade: z.string().optional(),
    msc: z.number().optional(),
    areaFormacaoGraduacao: z.number().optional(),
    conceitoCapesMestrado: z.number().optional(),
    a1a2a3a4: z.number().optional(),
    b1b2b3b4: z.number().optional(),
    notaAnteprojeto: z.number().optional(),
});

export { updateCandidatoDoutoradoSchema };