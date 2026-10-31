import { useUser } from "@/services/useUser"

export const useIsTeacher = () => {
  const userQuery = useUser()

  return userQuery.data?.role === "TEACHER" || userQuery.data?.role === "ADMIN"
}
