import z from "zod"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export { loginSchema }

const passwordResetSchema = z.object({
  email: z.string().email("Email inválido"),
})

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>

export { passwordResetSchema }
