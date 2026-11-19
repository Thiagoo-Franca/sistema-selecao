import { rpcReturn } from "@/shared/lib/utils"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import type { PaginationParams } from "@/shared/types/pagination"

interface UseCandidatesByTeacherIdOptions extends PaginationParams {
  enabled?: boolean
}

export const useCandidatesByTeacherId = (id: string | number, options: UseCandidatesByTeacherIdOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, order, enabled = true } = options

  return useQuery({
    queryKey: ["candidatos", "lista", id, { page, limit, search, sortBy, order }],
    queryFn: async () => {
      const response = await apiClient.candidato[":id"].$get({
        param: { id: String(id) },
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
    enabled: !!id && enabled,
    placeholderData: keepPreviousData,
  })
}
