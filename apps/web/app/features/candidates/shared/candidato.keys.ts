import { useQuery } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import type { PaginationParams } from "@/shared/types/pagination"

interface UseCandidatosOptions extends PaginationParams {
  enabled?: boolean
}

export const useCandidatos = (options: UseCandidatosOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, order, enabled = true } = options

  return useQuery({
    queryKey: ["candidatos", "lista", { page, limit, search, sortBy, order }],
    queryFn: async () => {
      const response = await apiClient.candidato.$get({
        query: {
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
        },
      })
      return rpcReturn(response)
    },
    enabled,
  })
}