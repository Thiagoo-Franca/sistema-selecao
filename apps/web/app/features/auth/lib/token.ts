import { AUTH_TOKEN_KEY } from "@/config/env"

export const storeAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch (error) {
    console.error("Failed to store auth token:", error)
  }
}

export const getAuthToken = (): string | null => {
  const isServer = typeof window === "undefined"
  if (isServer) return null
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to retrieve auth token:", error)
    return null
  }
}

export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Failed to remove auth token:", error)
  }
}
