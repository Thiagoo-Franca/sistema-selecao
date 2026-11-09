import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import type { ProfileFormValues } from "../schema/profile.schema"

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileFormValues) =>
      rpcReturn(await apiClient.usuario.me.$put({ json: data })),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data)
      toast.success("Perfil atualizado")
    },
    onError: (error) => toast.error("Erro ao atualizar perfil", { description: error.message }),
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (data) =>
      rpcReturn(await apiClient.usuario.me["change-password"].$post({ json: data })),
    onSuccess: () => toast.success("Senha alterada"),
    onError: (error) => toast.error("Erro ao alterar senha", { description: error.message }),
  })
