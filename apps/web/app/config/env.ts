import { TODO } from "@/lib/utils"
import { z } from "zod"

export const AUTH_TOKEN_KEY = "authToken"
TODO("Fix envs")
export const envSchema = z.object({
  API_URL: z.string().url().optional(),
})

export const env = envSchema.parse(import.meta.env)
