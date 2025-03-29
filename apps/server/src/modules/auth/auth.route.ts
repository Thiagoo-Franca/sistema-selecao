import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { z } from "zod"
import { AppVariables } from "../../types"

// Import the service functions
import {
  loginUserService,
  logoutUserService,
  requestPasswordResetService,
  resetPasswordService,
  verifyInviteHashService,
  verifyResetHashService,
} from "./auth.service"

export const authRoutes = new Hono<{ Variables: AppVariables }>()

// --- Validation Schemas ---
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
})

const requestResetSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
})

const resetPasswordSchema = z.object({
  hash: z.string().min(1, { message: "Token de reset é obrigatório." }),
  newPassword: z.string().min(6, { message: "Nova senha deve ter pelo menos 6 caracteres." }), // Example minimum length
})

// --- Login ---
// POST /auth/login
authRoutes.post(
  "/login",
  zValidator("json", loginSchema), // Validate request body
  async (c) => {
    const { email, password } = c.req.valid("json")
    try {
      const loginData = await loginUserService(c, email, password)
      return c.json(loginData)
    } catch (error) {
      // HTTPException is handled by hono's default onError, others might need specific handling
      if (error instanceof Error) {
        console.error("Login route error:", error.message)
      }
      // Re-throw or let default handler manage
      throw error
    }
  }
)

// DELETE /auth/logout
authRoutes.delete("/logout", async (c) => {
  // Note: Requires authentication middleware to run before this if
  // we needed user context, but the service itself is stateless.
  try {
    await logoutUserService(c)
    return c.json({ message: "Logout successful" }, 200) // Or 204 No Content
  } catch (error) {
    if (error instanceof Error) {
      console.error("Logout route error:", error.message)
    }
    throw error // Let global handler manage
  }
})

// --- Invites ---
// GET /invites/:hash
authRoutes.get("/invites/:hash", async (c) => {
  const hash = c.req.param("hash")
  if (!hash) {
    return c.json({ message: "Hash do convite é obrigatório." }, 400)
  }
  try {
    const inviteDetails = await verifyInviteHashService(c, hash)
    return c.json(inviteDetails)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Verify invite route error:", error.message)
    }
    throw error
  }
})

// --- Reset Password ---
// POST /auth/reset-password
authRoutes.post("/reset-password", zValidator("json", requestResetSchema), async (c) => {
  const { email } = c.req.valid("json")
  try {
    await requestPasswordResetService(c, email)
    // Always return success to prevent email enumeration
    return c.json({ message: "Se o email existir, um link de redefinição foi enviado." }, 200)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Request reset route error:", error.message)
    }
    // Even if service throws, pretend success to user
    return c.json({ message: "Se o email existir, um link de redefinição foi enviado." }, 200)
  }
})

// GET /auth/reset-password/:hash
authRoutes.get("/reset-password/:hash", async (c) => {
  const hash = c.req.param("hash")
  if (!hash) {
    return c.json({ message: "Hash de reset é obrigatório." }, 400)
  }
  try {
    const result = await verifyResetHashService(c, hash)
    return c.json(result) // Returns { valid: true } or throws error
  } catch (error) {
    if (error instanceof Error) {
      console.error("Verify reset hash route error:", error.message)
    }
    throw error
  }
})

// POST /auth/reset-password/reset
authRoutes.post("/reset-password/reset", zValidator("json", resetPasswordSchema), async (c) => {
  const { hash, newPassword } = c.req.valid("json")
  try {
    await resetPasswordService(c, hash, newPassword)
    return c.json({ message: "Senha redefinida com sucesso." }, 200)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Reset password route error:", error.message)
    }
    throw error
  }
})
