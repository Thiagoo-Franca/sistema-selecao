import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PasswordFormValues, ProfileFormValues } from "../schema/profile.schema"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import { toast } from "sonner"
import { passwordForm } from "@/routes/profile"
import { useUser } from "@/features/auth/hooks/auth.queries"

export const updateProfileMutation = useMutation({
  mutationFn: async (data: ProfileFormValues) => {
    const user = useUser().data
    if (!user?.id) throw new Error("Usuário não encontrado")
    const response = await apiClient.usuario.me.$put({
      json: data,
    })
    return rpcReturn(response)
  },
  onSuccess: (data) => {
    toast.success("Perfil atualizado, suas informações foram atualizadas com sucesso!")
    const queryClient = useQueryClient()

    queryClient.setQueryData(useUser.queryKey(), (oldData: any) => {
      return { ...oldData, ...data }
    })
  },
  onError: (error) => {
    toast.error("Erro ao atualizar perfil " + (error instanceof Error ? error.message : "."))
  },
})

export const changePasswordMutation = useMutation({
  mutationFn: async (data: PasswordFormValues) => {
    const response = await apiClient.usuario.me["change-password"].$post({
      json: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    })
    return rpcReturn(response)
  },
  onSuccess: () => {
    toast.success("Sua senha foi alterada com sucesso!")
    passwordForm.reset()
  },
  onError: (error) => {
    toast.error(
      `Erro ao alterar senha ${error instanceof Error ? error.message : "Ocorreu um erro ao alterar sua senha."}`
    )
  },
})
