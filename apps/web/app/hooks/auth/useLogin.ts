import { useLoginMutation } from "@/services/authService"
import { useUser } from "@/services/useUser"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import type { LoginFormValues } from "@/schema/schema"
import { useToast } from "../use-toast"

export const useLogin = () => {
  const queryClient = useQueryClient()
  const loginMutation = useLoginMutation()

  const navigate = useNavigate()
  const { toast } = useToast()

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { json: data },
      {
        onSuccess: (res) => {
          useUser.setData(queryClient, res.user)

          toast({
            title: "Login realizado com sucesso",
            description: "Você foi redirecionado para o dashboard",
          })

          navigate("/dashboard")
        },
        onError: () => {
          toast({
            title: "Erro ao fazer login",
            description: "Ocorreu um erro ao fazer login",
          })
        },
      }
    )
  }

  return {
    onSubmit,
    errorsMutation: loginMutation.error,
    isPending: loginMutation.isPending,
  }
}
