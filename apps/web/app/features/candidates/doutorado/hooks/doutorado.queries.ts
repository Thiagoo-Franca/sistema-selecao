import { rpcReturn } from "@/shared/lib/utils"
import { useQuery } from "@tanstack/react-query"
import type { CandidatoDoutoradoComRelacoes } from "@tcc/server"
import apiClient from "@/shared/services/apiClient"

export const useCandidatosDoutorado = () => {
  return useQuery({
    queryKey: ["candidatos", "doutorado"],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado.$get()
      return rpcReturn(response)
    },
  })
}

export const useCandidatoDoutoradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoDoutorado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado[":id"].$get({
        param: { id: String(id) }, // param, não query
      })
      return rpcReturn(response) as unknown as CandidatoDoutoradoComRelacoes | null
    },
    enabled: !!id,
  })
}
