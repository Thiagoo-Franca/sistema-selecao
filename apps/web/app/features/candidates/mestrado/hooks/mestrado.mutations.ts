import { rpcReturn } from "@/shared/lib/utils"
import apiClient from "@/shared/services/apiClient"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CandidatoMestradoComRelacoes, NotaMestradoUpdate } from "@tcc/server"
import type { CandidatoMestradoUpload } from "../../shared/components/lib/parse-upload"
import { toast } from "sonner"

export function useUploadCandidatosMestrado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (candidatos: CandidatoMestradoUpload[]) => {
      const response = await apiClient.candidato.mestrado.$post({ json: candidatos })
      return rpcReturn(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.removeQueries({ queryKey: ["candidatoMestrado"] })
      toast.success("Candidatos de mestrado adicionados com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar candidatos: ${error.message}`)
    },
  })
}

export const useUpdateCandidatoMestrado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string | number
      body: Partial<CandidatoMestradoComRelacoes>
    }) => {
      const response = await apiClient.candidato.mestrado[":id"].$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as CandidatoMestradoComRelacoes
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoMestrado", variables.id] })
      toast.success("Candidato de mestrado atualizado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar candidato de mestrado: ${error.message}`)
    },
  })
}

export const useUpdateCandidatoMestradoNota = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: NotaMestradoUpdate }) => {
      const response = await apiClient.candidato.mestrado[":id"].nota.$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoMestrado", variables.id] })
      toast.success("Nota do candidato de mestrado atualizada com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar nota do candidato de mestrado: ${error.message}`)
    },
  })
}

export const useDeleteCandidatoMestrado = (id: string | number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.candidato.mestrado[":id"].$delete({
        param: { id: String(id) },
      })
      return rpcReturn(response) as unknown as { message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.removeQueries({ queryKey: ["candidatoMestrado", id] })
      toast.success("Candidato de mestrado deletado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao deletar candidato de mestrado: ${error.message}`)
    },
  })
}
