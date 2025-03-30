import { AUTH_TOKEN_KEY } from "@/config/env"
import type { AppType } from "@tcc/server"
import { hc } from "hono/client"

const client = hc<AppType>("http://localhost:3000", {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token && init) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return fetch(input, init)
  },
})

export default client
