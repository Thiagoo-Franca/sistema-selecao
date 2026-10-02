import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services/apiClient"
import { rpcReturn } from "@/lib/utils"
import { toast } from "sonner"
import type { CandidatoDoutoradoComRelacoes, CandidatoMestradoComRelacoes } from "@tcc/server"

export const useCandidatos = () => {
  return useQuery({
    queryKey: ["candidatos", "mestrado", "doutorado"],
    queryFn: async () => {
      const response = await apiClient.candidato.$get()
      return rpcReturn(response) as unknown as {
        mestrado: CandidatoMestradoComRelacoes[]
        doutorado: CandidatoDoutoradoComRelacoes[]
      }
    },
  })
}

export const useCandidatoMestradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoMestrado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.mestrado[":id"].$get({
        param: { id: String(id) }, // param, não query
      })
      return rpcReturn(response) as unknown as CandidatoMestrado | null
    },
    enabled: !!id,
  })
}

export const useCandidatoDoutoradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoDoutorado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado[":id"].$get({
        param: { id: String(id) }, // param, não query
      })
      return rpcReturn(response) as unknown as CandidatoDoutorado | null
    },
    enabled: !!id,
  })
}

export const useUpdateCandidatoDoutorado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: Partial<CandidatoDoutorado> }) => {
      const response = await apiClient.candidato.doutorado[":id"].$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as CandidatoDoutorado
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

export const useUpdateCandidatoMestrado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: Partial<CandidatoMestrado> }) => {
      const response = await apiClient.candidato.mestrado[":id"].$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as CandidatoMestrado
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
    mutationFn: async (data: { id: string | number; body: Partial<NotaMestrado | any> }) => {
      const response = await apiClient.candidato.mestrado[":id"].nota.$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as NotaMestrado | any
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
