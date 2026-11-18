import { rpcReturn } from "@/shared/lib/utils"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { CandidatoDoutoradoComRelacoes } from "@tcc/server"
import apiClient from "@/shared/services/apiClient"
import type { PaginationParams } from "@/shared/types/pagination"

interface UseCandidatosDoutoradoOptions extends PaginationParams {
  enabled?: boolean
}

export const useCandidatosDoutorado = (options: UseCandidatosDoutoradoOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, order, enabled = true } = options

  return useQuery({
    queryKey: ["candidatos", "doutorado", { page, limit, search, sortBy, order }],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado.$get({
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
    placeholderData: keepPreviousData,
  })
}

export const useCandidatoDoutoradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoDoutorado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado[":id"].$get({
        param: { id: String(id) },
      })
      return rpcReturn(response) as unknown as CandidatoDoutoradoComRelacoes | null
    },
    enabled: !!id,
  })
}