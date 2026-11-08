import { useQuery } from "@tanstack/react-query"
import apiClient from "@/shared/services/apiClient"
import { rpcReturn } from "@/shared/lib/utils"
import { useUser } from "@/features/auth"

export const useIsTeacher = () => {
  const userQuery = useUser()

  return userQuery.data?.role === "TEACHER" || userQuery.data?.role === "ADMIN"
}

// Hook to fetch all users (admin only)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      const res = await apiClient.usuario.all.$get()
      return rpcReturn(res)
    },
  })
}

// Hook to fetch teachers
export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await apiClient.usuario.teachers.$get()
      return rpcReturn(response)
    },
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
