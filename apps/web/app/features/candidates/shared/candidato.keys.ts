import { useQuery } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"

export const useCandidatos = () => {
  return useQuery({
    queryKey: ["candidatos", "lista"],
    queryFn: async () => {
      const response = await apiClient.candidato.$get()
      return rpcReturn(response)
    },
  })
}
