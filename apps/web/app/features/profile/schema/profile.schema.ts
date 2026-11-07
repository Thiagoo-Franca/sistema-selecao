import { z } from "zod"

export const profileFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  school: z.string().min(2, {
    message: "A instituição deve ter pelo menos 2 caracteres",
  }),
  academicTitle: z.string().min(2, {
    message: "O título acadêmico deve ter pelo menos 2 caracteres",
  }),
})

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type ProfileFormValues = z.infer<typeof profileFormSchema>
export type PasswordFormValues = z.infer<typeof passwordFormSchema>
