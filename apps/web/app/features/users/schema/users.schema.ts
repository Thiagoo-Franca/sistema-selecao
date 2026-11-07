import z from "zod"

// Schema for updating user
export const updateUserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  school: z.string().min(1, "Escola é obrigatória"),
  academicTitle: z.string().min(1, "Título acadêmico é obrigatório"),
  role: z.enum(["TEACHER", "ADMIN"], {
    required_error: "Função é obrigatória",
  }),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>
