import { rpcReturn } from "@/shared/lib/utils"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"

export const useCandidatesByTeacherId = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatos", "lista", id],
    queryFn: async () => {
      const response = await apiClient.candidato[":id"].$get({
        param: { id: String(id) },
      })
      return rpcReturn(response)
    },
  })
}
