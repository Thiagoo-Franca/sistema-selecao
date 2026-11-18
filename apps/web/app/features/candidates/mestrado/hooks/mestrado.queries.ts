import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"
import type { PaginationParams } from "@/shared/types/pagination"

interface UseCandidatosMestradoOptions extends PaginationParams {
  enabled?: boolean
}

export const useCandidatosMestrado = (options: UseCandidatosMestradoOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, order, enabled = true } = options

  return useQuery({
    queryKey: ["candidatos", "mestrado", { page, limit, search, sortBy, order }],
    queryFn: async () => {
      const response = await apiClient.candidato.mestrado.$get({
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

export const useCandidatoMestradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoMestrado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.mestrado[":id"].$get({
        param: { id: String(id) },
      })
      return rpcReturn(response) as unknown as CandidatoMestradoComRelacoes | null
    },
    enabled: !!id,
  })
}