import { useRegisterMutation } from "@/services/authService"
import { useToast } from "../use-toast"
import type { RegisterFormValues } from "@/schema/schema"

interface UseRegisterReturn {
  onBackToLogin(): void
}

export const useRegister = ({ onBackToLogin }: UseRegisterReturn) => {
  const { toast } = useToast()

  const mutation = useRegisterMutation()

  const register = (data: RegisterFormValues) => {
    mutation.mutate(
      {
        json: {
          email: data.email,
          password: data.password,
          nome: data.nome,
          school: data.school,
          academicTitle: data.academicTitle,
          matricula: data.matricula,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já pode fazer o login.",
          })
          onBackToLogin()
        },

        onError: (error) => {
          toast({
            title: "Erro ao criar conta",
            description: error.message || "Ocorreu um erro ao criar a conta",
          })
        },
      }
    )
  }

  return {
    onSubmit: register,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message,
  }
}
