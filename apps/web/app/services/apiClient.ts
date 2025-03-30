import { AUTH_TOKEN_KEY } from "@/config/env"
import type { AppType } from "@tcc/server"
import { hc } from "hono/client"

const client = hc<AppType>("http://localhost:3000", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
  },
})

export default client
