import { rpcReturn } from "@/shared/lib/utils"
import apiClient from "@/shared/services/apiClient"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CandidatoDoutoradoComRelacoes } from "@tcc/server"

export const useUpdateCandidatoDoutorado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string | number
      body: Partial<CandidatoDoutoradoComRelacoes>
    }) => {
      const response = await apiClient.candidato.doutorado[":id"].$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as CandidatoDoutoradoComRelacoes
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos", "doutorado"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoDoutorado", variables.id] })
      toast.success("Candidato de doutorado atualizado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar candidato de doutorado: ${error.message}`)
    },
  })
}

export const useUpdateCandidatoDoutoradoNota = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: Partial<NotaDoutorado | any> }) => {
      const response = await apiClient.candidato.doutorado[":id"].nota.$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as NotaDoutorado | any
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos", "doutorado"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoDoutorado", variables.id] })
      toast.success("Nota do candidato de doutorado atualizada com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar nota do candidato de doutorado: ${error.message}`)
    },
  })
}

export const useDeleteCandidatoDoutorado = (id: string | number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.candidato.doutorado[":id"].$delete({
        param: { id: String(id) },
      })
      return rpcReturn(response) as unknown as { message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.removeQueries({ queryKey: ["candidatoDoutorado", id] })
      toast.success("Candidato de doutorado deletado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao deletar candidato de doutorado: ${error.message}`)
    },
  })
}
