import { useRequestPasswordResetMutation } from "@/services/authService"
import type { PasswordResetFormValues } from "@/schema/schema"
import { useToast } from "../use-toast"

export const usePasswordReset = () => {
  const mutation = useRequestPasswordResetMutation()
  const { toast } = useToast()

  const onSubmit = (data: PasswordResetFormValues) => {
    mutation.mutate(
      { json: data },
      {
        onSuccess: () => {
          toast({
            title: "Email enviado com sucesso",
            description: "Verifique sua caixa de entrada para redefinir sua senha",
          })
        },
        onError: (error) => {
          toast({
            title: "Erro ao enviar email",
            description: error.message || "Ocorreu um erro ao enviar o email",
          })
        },
      }
    )
  }

  return {
    onSubmit,
    isPending: mutation.isPending,
  }
}
