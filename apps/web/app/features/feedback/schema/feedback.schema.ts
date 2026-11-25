import { z } from "zod"
import { USAGE_PURPOSE_IDS } from "@tcc/shared"

export const feedbackFormSchema = z.object({
  taskComplexityRating: z.number().int().min(1).max(5),
  interfaceConsistencyRating: z.number().int().min(1).max(5),
  responseTimeRating: z.number().int().min(1).max(5),
  satisfactionRating: z.number().int().min(1).max(5),
  usagePurposes: z
    .array(z.enum(USAGE_PURPOSE_IDS))
    .min(1, { message: "Selecione ao menos uma finalidade." }),
  usagePurposeOther: z.string().optional(),
  completedAllTasks: z.boolean(),
})

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>
