import { z } from "zod"

export const featureRequestSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Título é obrigatório." })
    .max(200, { message: "Título muito longo." }),
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
})

export const feedbackFormSchema = z.object({
  taskComplexityRating: z.number().int().min(1).max(5),
  interfaceConsistencyRating: z.number().int().min(1).max(5),
  responseTimeRating: z.number().int().min(1).max(5),
  satisfactionRating: z.number().int().min(1).max(5),
  usagePurposes: z.array(z.string()).min(1, { message: "Selecione ao menos uma finalidade." }),
  usagePurposeOther: z.string().optional(),
  completedAllTasks: z.boolean(),
})

export type FeatureRequestFormValues = z.infer<typeof featureRequestSchema>
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>
