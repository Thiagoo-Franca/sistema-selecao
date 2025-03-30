import { useQuery, useQueryClient } from "@tanstack/react-query"
import { rpcReturn } from "../lib/utils"
import apiClient from "./apiClient"
import { getAuthToken, removeAuthToken } from "./authService"

export const useUser = () => {
  const queryClient = useQueryClient()
  const token = getAuthToken()

  return useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) {
        return null
      }
      try {
        const response = await apiClient.usuario.$get({})
        return rpcReturn(response)
      } catch (error) {
        console.error("Auth error fetching user, removing token:", error)
        removeAuthToken()
        queryClient.invalidateQueries({ queryKey: ["user"] })
        throw error
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
