import { rpcReturn } from "@/shared/lib/utils"
import apiClient from "@/shared/services/apiClient"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UpdateUserFormData } from "../schema/users.schema"
import { toast } from "sonner"

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserFormData }) => {
      const res = await apiClient.usuario[":id"].$put({
        param: { id: id.toString() },
        json: data,
      })
      return rpcReturn(res)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "all"] })
      // Tela de detalhe (["user", id]), perfil do próprio usuário (["user"]) e listas de professores
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["teachers"] })
      queryClient.invalidateQueries({ queryKey: ["teachersSimplified"] })
      toast.success(
        "Usuário atualizado com sucesso. Os dados do usuário foram atualizados com sucesso"
      )
    },
    onError: () => {
      toast.error("Erro ao atualizar os dados do usuário")
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cascade }: { id: string; cascade?: boolean }) => {
      const res = await apiClient.usuario[":id"].$delete({
        param: { id: id.toString() },
        query: { cascade: cascade ? "true" : "false" },
      })
      if (!res.ok) {
        const data = (await res.json()) as { message?: string }
        const message = data?.message ?? "Erro ao excluir usuário"
        const error = new Error(message) as Error & { status?: number }
        error.status = res.status
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "all"] })
      toast.success("O usuário foi removido do sistema com sucesso")
    },
    onError: (error: Error & { status?: number }) => {
      if (error.status === 400) return
      const isNotFound = error.status === 404
      toast.error(
        isNotFound ? "Usuário não encontrado" : "Erro ao excluir usuário" + " - " + error.message
      )
    },
  })
}
