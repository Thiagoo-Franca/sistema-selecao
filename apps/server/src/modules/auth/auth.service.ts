import * as bcrypt from "bcryptjs"
import crypto from "crypto"
import { and, eq, gte } from "drizzle-orm"
import { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { sign } from "hono/jwt"
import { invites, resetPasswords, usuarios } from "../../database/schema"
import { AppVariables } from "../../types"
import { JWT_AUDIENCE, JWT_EXPIRY_SECONDS, JWT_ISSUER, JWT_SECRET } from "./jwt"

interface LoginResponse {
  id: number
  token: string
  role: string
  name: string
}

/**
 * Logs in a user by verifying email and password, then generates JWT.
 * Refresh token logic has been removed based on user requirement.
 * @param c - Hono Context
 * @param email - User's email
 * @param password - User's plaintext password
 * @returns Promise<LoginResponse>
 * @throws HTTPException for various error conditions
 */
export const loginUserService = async (
  c: Context<{ Variables: AppVariables }>,
  email: string,
  password: string
): Promise<LoginResponse> => {
  const dbInstance = c.get("db") // Get DB instance from context

  const potentialUsers = await dbInstance.select().from(usuarios).where(eq(usuarios.email, email)).limit(1)

  const user = potentialUsers[0]

  if (!user) {
    console.log(`Login attempt failed: User not found for email ${email}`)
    throw new HTTPException(403, { message: "Credenciais inválidas." }) // Generic message for security
  }

  if (user.status !== "active") {
    console.log(`Login attempt failed: User ${email} is inactive.`)
    throw new HTTPException(403, { message: "Usuário inativo." })
  }

  if (!user.passwordHash) {
    console.error(`Login attempt failed: User ${email} has no password hash set.`)
    throw new HTTPException(403, { message: "Credenciais inválidas." }) // Or internal error?
  }

  const passwordIsValid = await bcrypt.compare(password, user.passwordHash)

  if (!passwordIsValid) {
    console.log(`Login attempt failed: Invalid password for user ${email}`)
    throw new HTTPException(403, { message: "Credenciais inválidas." })
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    sub: user.id.toString(), // Subject (user ID)
    // Add other claims like role if needed: role: user.role,
    iat: now,
    exp: now + JWT_EXPIRY_SECONDS,
  }

  let token: string
  try {
    token = await sign(payload, JWT_SECRET)
  } catch (jwtError) {
    console.error("JWT signing error:", jwtError)
    throw new HTTPException(500, { message: "Não foi possível gerar o token de autenticação." })
  }

  return {
    id: user.id,
    token: token,
    role: user.role,
    name: user.nome,
  }
}

/**
 * Initiates the password reset process for a user.
 */
export const requestPasswordResetService = async (
  c: Context<{ Variables: AppVariables }>,
  email: string
): Promise<void> => {
  const dbInstance = c.get("db")
  console.log(`Password reset requested for email: ${email}`)

  const potentialUsers = await dbInstance
    .select({ id: usuarios.id, status: usuarios.status })
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1)
  const user = potentialUsers[0]

  if (!user || user.status !== "active") {
    console.log(`Password reset request failed: User not found or inactive for email ${email}`)
    // Don't reveal if email exists, return success to prevent email enumeration
    // throw new HTTPException(404, { message: 'Usuário não encontrado ou inativo.' });
    return // Pretend success
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const expiryMinutes = 60 // Token valid for 60 minutes
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  try {
    // Delete old tokens for this user
    await dbInstance.delete(resetPasswords).where(eq(resetPasswords.userId, user.id.toString())) // Ensure userId type matches schema

    // Insert new token
    await dbInstance.insert(resetPasswords).values({
      userId: user.id.toString(), // Ensure userId type matches schema
      resetPasswordHash: resetToken, // Store the plain token, the name 'hash' is misleading from yii2
      expiresAt: expiresAt,
      // createdAt is handled by default in schema
    })

    console.log(`Password reset token generated for user ID: ${user.id}`)

    // --- !!! SEND EMAIL HERE !!! ---
    // Construct reset URL: e.g., `https://your-frontend.com/reset-password/${resetToken}`
    const resetUrl = `https://your-frontend-url/reset-password/${resetToken}` // Replace with your actual frontend URL
    console.log(`Reset URL (Email Placeholder): ${resetUrl}`)
    // Use a mailer library (Nodemailer, Resend, etc.) to send an email to `email`
    // containing the `resetUrl`.
    // Example: await sendPasswordResetEmail(email, resetUrl);
    // --- Email Sending Placeholder ---
  } catch (error) {
    console.error(`Error during password reset request for ${email}:`, error)
    // Don't expose internal errors
    // throw new HTTPException(500, { message: 'Erro ao processar solicitação de redefinição de senha.' });
    return // Pretend success even on internal error
  }
}

/**
 * Verifies if a password reset token is valid and not expired.
 */
export const verifyResetHashService = async (
  c: Context<{ Variables: AppVariables }>,
  hash: string
): Promise<{ valid: boolean; message?: string }> => {
  const dbInstance = c.get("db")
  console.log(`Verifying reset hash: ${hash}`)

  const potentialResets = await dbInstance
    .select()
    .from(resetPasswords)
    .where(
      and(
        eq(resetPasswords.resetPasswordHash, hash),
        gte(resetPasswords.expiresAt, new Date()) // Check if expiry is greater than or equal to now
      )
    )
    .limit(1)

  const resetRecord = potentialResets[0]

  if (!resetRecord) {
    console.log(`Reset hash verification failed: Hash not found or expired.`)
    // Check if it existed but expired
    const expiredRecord = await dbInstance
      .select({ id: resetPasswords.id })
      .from(resetPasswords)
      .where(eq(resetPasswords.resetPasswordHash, hash))
      .limit(1)
    if (expiredRecord[0]) {
      // Attempt to clean up expired token
      try {
        await dbInstance.delete(resetPasswords).where(eq(resetPasswords.resetPasswordHash, hash))
      } catch (cleanupError) {
        console.error("Error cleaning up expired reset token:", cleanupError)
      }
      throw new HTTPException(410, { message: "Token de redefinição expirado." })
    }
    throw new HTTPException(404, { message: "Token de redefinição inválido." })
  }

  console.log(`Reset hash verification successful for hash: ${hash}`)
  return { valid: true }
}

/**
 * Resets the user's password using a valid token.
 */
export const resetPasswordService = async (
  c: Context<{ Variables: AppVariables }>,
  hash: string,
  newPassword: string
): Promise<void> => {
  const dbInstance = c.get("db")
  console.log(`Attempting password reset with hash: ${hash}`)

  // 1. Verify the hash and check expiry again (important!)
  const potentialResets = await dbInstance
    .select()
    .from(resetPasswords)
    .where(and(eq(resetPasswords.resetPasswordHash, hash), gte(resetPasswords.expiresAt, new Date())))
    .limit(1)

  const resetRecord = potentialResets[0]

  if (!resetRecord) {
    console.log(`Password reset failed: Hash ${hash} not found or expired during reset attempt.`)
    // Distinguish between expired and invalid? For security, maybe keep generic.
    throw new HTTPException(400, { message: "Token de redefinição inválido ou expirado." })
  }

  // 2. Hash the new password (use sufficient rounds)
  let newPasswordHash: string
  try {
    newPasswordHash = await bcrypt.hash(newPassword, 10) // 10-12 rounds recommended
  } catch (hashError) {
    console.error("Password hashing failed during reset:", hashError)
    throw new HTTPException(500, { message: "Erro ao processar nova senha." })
  }

  // 3. Update the user's password in the usuarios table
  try {
    const userId = parseInt(resetRecord.userId, 10) // Ensure userId is number if schema requires
    if (isNaN(userId)) throw new Error("Invalid userId found in reset token record.")

    const updateResult = await dbInstance
      .update(usuarios)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() }) // Update passwordHash and timestamp
      .where(eq(usuarios.id, userId))

    if (updateResult.rowCount === 0) {
      console.error(`Password reset failed: User with ID ${userId} not found during update.`)
      // This shouldn't happen if the reset token was valid, indicates data inconsistency
      throw new HTTPException(404, { message: "Usuário associado ao token não encontrado." })
    }

    console.log(`Password successfully reset for user ID: ${userId}`)

    // 4. Delete the used reset token
    await dbInstance.delete(resetPasswords).where(eq(resetPasswords.resetPasswordHash, hash))
    console.log(`Reset token deleted for hash: ${hash}`)
  } catch (error) {
    console.error(`Error updating password or deleting reset token for hash ${hash}:`, error)
    throw new HTTPException(500, { message: "Erro ao atualizar a senha." })
  }
}

/**
 * Verifies an invite hash.
 */
export const verifyInviteHashService = async (c: Context<{ Variables: AppVariables }>, hash: string): Promise<any> => {
  // Return type 'any' for now, adjust based on required invite details
  const dbInstance = c.get("db")
  console.log(`Verifying invite hash: ${hash}`)

  // Note: Yii2 used sha1(email + hash_from_post). We're assuming the hash stored IS the verification hash.
  // If not, the generation logic in Yii2 actionCreate needs re-evaluation.
  const potentialInvites = await dbInstance
    .select({
      emailConvidado: invites.emailConvidado,
      roleConvidado: invites.roleConvidado,
      bancaId: invites.bancaId,
      status: invites.status,
      // Add other fields needed by the frontend/process
    })
    .from(invites)
    .where(eq(invites.inviteHash, hash)) // Assuming direct hash lookup
    .limit(1)

  const inviteRecord = potentialInvites[0]

  if (!inviteRecord) {
    console.log(`Invite hash verification failed: Hash ${hash} not found.`)
    throw new HTTPException(404, { message: "Convite inválido." })
  }

  // Optional: Check status if needed (e.g., prevent using accepted/expired invites)
  if (inviteRecord.status !== "pending") {
    // Adjust 'pending' if needed
    console.log(`Invite hash verification failed: Invite ${hash} has status ${inviteRecord.status}.`)
    // Use 410 Gone for expired/used? Or 400 Bad Request?
    throw new HTTPException(410, { message: `Convite não está mais pendente (status: ${inviteRecord.status}).` })
  }

  // Return relevant details about the invite
  console.log(`Invite hash verification successful for hash: ${hash}`)
  return inviteRecord
}

/**
 * Handles user logout. Currently placeholder as no server-side session/token revocation is implemented.
 */
export const logoutUserService = async (c: Context<{ Variables: AppVariables }>): Promise<void> => {
  // In a stateless JWT setup, logout is primarily client-side (deleting the token).
  // Server-side actions could include:
  // 1. Adding the token JTI (JWT ID) to a denylist (requires DB/cache).
  // 2. Revoking associated refresh tokens (if they were implemented).
  console.log("Logout request received. No server-side action taken in this stateless implementation.")
  return // Indicate success
}
