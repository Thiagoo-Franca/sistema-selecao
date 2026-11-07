import { useQuery } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"

export const useCandidatosMestrado = () => {
  return useQuery({
    queryKey: ["candidatos", "mestrado"],
    queryFn: async () => {
      const response = await apiClient.candidato.mestrado.$get()
      return rpcReturn(response)
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
      return rpcReturn(response) as unknown as CandidatoMestradoComRelacoes | null
    },
    enabled: !!id,
  })
}
