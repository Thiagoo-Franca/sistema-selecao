import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import type { LoginFormValues, PasswordResetFormValues } from "../schema/auth.schema"
import { useUser } from "./auth.queries"
import { rpcReturn, type RpcType } from "@/shared/lib/utils"
import apiClient from "@/shared/services/apiClient"
import { storeAuthToken } from "../lib/token"
import { toast } from "sonner"

export const useLogin = () => {
  const queryClient = useQueryClient()
  const loginMutation = useLoginMutation()

  const navigate = useNavigate()

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { json: data },
      {
        onSuccess: (res) => {
          useUser.setData(queryClient, res.user)

          toast.success("Login realizado com sucesso, você será redirecionado para o dashboard")

          navigate("/dashboard")
        },
        onError: () => {
          toast.error("Erro ao realizar login, verifique suas credenciais e tente novamente")
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

export const usePasswordReset = () => {
  const mutation = useRequestPasswordResetMutation()

  const onSubmit = (data: PasswordResetFormValues) => {
    mutation.mutate(
      { json: data },
      {
        onSuccess: () => {
          toast.success(
            "Email enviado com sucesso, verifique sua caixa de entrada para redefinir sua senha"
          )
        },
        onError: (error) => {
          toast.error(
            `Erro ao enviar email ${error.message || "Ocorreu um erro ao enviar o email"}`
          )
        },
      }
    )
  }

  return {
    onSubmit,
    isPending: mutation.isPending,
  }
}

export const useLoginMutation = () => {
  type query = RpcType<typeof apiClient.auth.login.$post>
  return useMutation({
    mutationFn: async (request: query["input"]) => {
      const response = await apiClient.auth.login.$post(request)
      return rpcReturn(response)
    },
    onSuccess: (response) => {
      storeAuthToken(response.token)
    },
    onError: (error) => {
      console.error("Login mutation failed:", error)
    },
  })
}

export const useRequestPasswordResetMutation = () => {
  type Query = RpcType<(typeof apiClient.auth)["reset-password"]["$post"]>
  return useMutation({
    mutationFn: async (request: Query["input"]) => {
      const response = await apiClient.auth["reset-password"]["$post"](request)
      return rpcReturn(response)
    },
  })
}

export const useResetPasswordMutation = () => {
  type Query = RpcType<(typeof apiClient.auth)["reset-password"]["reset"]["$post"]>
  return useMutation({
    mutationFn: async (request: Query["input"]) => {
      const response = await apiClient.auth["reset-password"]["reset"]["$post"](request)
      return rpcReturn(response)
    },
  })
}
