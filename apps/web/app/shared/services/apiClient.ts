import { AUTH_TOKEN_KEY, env } from "@/config/env"
import type { AppType } from "@tcc/server"
import { hc } from "hono/client"

const authenticatedClientOptions = {
  headers() {
    if (typeof window === "undefined") return {}

    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return {}

    return {
      Authorization: `Bearer ${token}`,
    }
  },
}

const client = hc<AppType>(env.VITE_API_URL, authenticatedClientOptions)

export const publicApiClient = hc<AppType>(env.VITE_API_URL)

export default client
