import { useQuery, keepPreviousData } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import { useUser } from "@/features/auth"
import type { PaginationParams } from "@/shared/types/pagination"

export const useIsTeacher = () => {
  const userQuery = useUser()

  return userQuery.data?.role === "TEACHER" || userQuery.data?.role === "ADMIN"
}

// Hook to fetch all users (admin only)
interface UseAllUsersOptions extends PaginationParams {
  enabled?: boolean
}

export const useAllUsers = (options: UseAllUsersOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, order, enabled = true } = options

  return useQuery({
    queryKey: ["users", "all", { page, limit, search, sortBy, order }],
    queryFn: async () => {
      const res = await apiClient.usuario.all.$get({
        query: {
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
        },
      })
      return rpcReturn(res)
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

// Hook to fetch teachers
interface UseTeachersOptions extends PaginationParams {
  enabled?: boolean
}

export const useTeachers = (options: UseTeachersOptions = {}) => {
  const { page = 1, limit = 10, search, sortBy, order, enabled = true } = options

  return useQuery({
    queryKey: ["teachers", { page, limit, search, sortBy, order }],
    queryFn: async () => {
      const response = await apiClient.usuario.teachers.$get({
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

export const useTeachersSimplified = () => {
  return useQuery({
    queryKey: ["teachersSimplified"],
    queryFn: async () => {
      const response = await apiClient.usuario.teachers.simplified.$get()
      return rpcReturn(response)
    },
  })
}

// Hook to fetch a user by ID
export const useUserById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) throw new Error("User ID não fornecido")
      const res = await apiClient.usuario[":id"].$get({
        param: { id },
      })
      return rpcReturn(res)
    },
    enabled: !!id,
  })
}