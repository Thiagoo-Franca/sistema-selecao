import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { and, eq, gte } from "drizzle-orm";
import { type Context } from "hono";
import { sign } from "hono/jwt";
import {
  resetPasswords,
  Users,
  type SelectUser,
} from "../../database/schema.js";
import { err, ok, type AppResult } from "../../result.js";
import { type AppVariables } from "../../types.js";
import {
  JWT_AUDIENCE,
  JWT_EXPIRY_SECONDS,
  JWT_ISSUER,
  JWT_SECRET,
} from "./jwt.js";
import { env } from "../../config/env.js";
import { createPasswordResetEmail, sendEmail } from "../../services/email.service.js";

const hashResetToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

interface LoginResponse {
  id: string;
  token: string;
  role: string;
  name: string;
  user: Omit<SelectUser, "passwordHash" | "createdAt">;
}

type LoginUserServiceError =
  | { type: "invalid_credentials" }
  | { type: "inactive_user" }
  | { type: "no_password_hash" }
  | { type: "jwt_signing_error" }
  | { type: "database_error" };

export const loginUserService = async (
  c: Context<{ Variables: AppVariables }>,
  email: string,
  password: string,
): Promise<AppResult<LoginResponse, LoginUserServiceError>> => {
  const dbInstance = c.get("db");

  try {
    const [user] = await dbInstance
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);

    if (!user) {
      return err({ type: "invalid_credentials" });
    }

    if (!user.ativo) {
      return err({ type: "inactive_user" });
    }

    if (!user.passwordHash) {
      return err({ type: "no_password_hash" });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      return err({ type: "invalid_credentials" });
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      sub: user.id.toString(),
      iat: now,
      exp: now + JWT_EXPIRY_SECONDS,
    };

    let token: string;
    try {
      token = await sign(payload, JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT signing error:", jwtError);
      return err({ type: "jwt_signing_error" });
    }

    return ok({
      id: user.id,
      token: token,
      role: user.role,
      name: user.nome,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        school: user.school,
        matricula: user.matricula,
        areas: user.areas,
        academicTitle: user.academicTitle,
        ativo: user.ativo,
        updatedAt: user.updatedAt,
      },
    });
  } catch (dbError) {
    console.error("Database error during login:", {
      code: (dbError as { code?: string }).code ?? "unknown",
      constraint: (dbError as { constraint?: string }).constraint ?? "unknown",
    });
    return err({ type: "database_error" });
  }
};

type RequestPasswordResetServiceError = { type: "database_error" };

export const requestPasswordResetService = async (
  c: Context<{ Variables: AppVariables }>,
  email: string,
): Promise<AppResult<void, RequestPasswordResetServiceError>> => {
  const dbInstance = c.get("db");

  try {
    const potentialUsers = await dbInstance
      .select({ id: Users.id, nome: Users.nome, ativo: Users.ativo })
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);
    const user = potentialUsers[0];
    if (!user || !user.ativo) return ok(undefined);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await dbInstance.transaction(async (tx) => {
      await tx.delete(resetPasswords).where(eq(resetPasswords.userId, user.id));
      await tx.insert(resetPasswords).values({
        userId: user.id,
        resetPasswordHash: hashResetToken(resetToken),
        expiresAt,
      });
    });

    const resetUrl = new URL(`/reset-password/${resetToken}`, env.FRONTEND_URL).toString();
    const emailResult = await sendEmail({
      to: email,
      subject: "Recuperação de senha - SISSEL",
      html: createPasswordResetEmail(user.nome, resetUrl),
    });

    if (!emailResult.ok) {
      await dbInstance
        .delete(resetPasswords)
        .where(eq(resetPasswords.resetPasswordHash, hashResetToken(resetToken)));
    }

    return ok(undefined);
  } catch (error) {
    console.error("Database error during password reset request:", {
      code: (error as { code?: string }).code ?? "unknown",
      constraint: (error as { constraint?: string }).constraint ?? "unknown",
    });
    return err({ type: "database_error" });
  }
};

type VerifyResetHashServiceError =
  | { type: "token_expired" }
  | { type: "token_invalid" }
  | { type: "database_error" };

export const verifyResetHashService = async (
  c: Context<{ Variables: AppVariables }>,
  hash: string,
): Promise<AppResult<{ valid: boolean }, VerifyResetHashServiceError>> => {
  const dbInstance = c.get("db");
  try {
    const potentialResets = await dbInstance
      .select({ id: resetPasswords.id })
      .from(resetPasswords)
      .where(
        and(
          eq(resetPasswords.resetPasswordHash, hashResetToken(hash)),
          gte(resetPasswords.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const resetRecord = potentialResets[0];

    if (!resetRecord) {
      const expiredCheck = await dbInstance
        .select({ id: resetPasswords.id })
        .from(resetPasswords)
        .where(eq(resetPasswords.resetPasswordHash, hashResetToken(hash)))
        .limit(1);
      if (expiredCheck[0]) {
        try {
          await dbInstance.delete(resetPasswords).where(
            eq(resetPasswords.resetPasswordHash, hashResetToken(hash)),
          );
        } catch (cleanupError) {
          console.error("Error cleaning up expired reset token:", cleanupError);
        }
        return err({ type: "token_expired" });
      }
      return err({ type: "token_invalid" });
    }

    return ok({ valid: true });
  } catch (dbError) {
    console.error("Database error during reset hash verification:", dbError);
    return err({ type: "database_error" });
  }
};

type ResetPasswordServiceError =
  | { type: "token_invalid_or_expired" }
  | { type: "hashing_error" }
  | { type: "user_not_found" }
  | { type: "update_error" }
  | { type: "database_error" };

export const resetPasswordService = async (
  c: Context<{ Variables: AppVariables }>,
  hash: string,
  newPassword: string,
): Promise<AppResult<void, ResetPasswordServiceError>> => {
  const dbInstance = c.get("db");
  try {
    const potentialResets = await dbInstance
      .select({ userId: resetPasswords.userId })
      .from(resetPasswords)
      .where(
        and(
          eq(resetPasswords.resetPasswordHash, hashResetToken(hash)),
          gte(resetPasswords.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const resetRecord = potentialResets[0];

    if (!resetRecord) {
      return err({ type: "token_invalid_or_expired" });
    }

    let newPasswordHash: string;
    try {
      newPasswordHash = await bcrypt.hash(newPassword, 10);
    } catch (hashError) {
      console.error("Password hashing failed during reset:", hashError);
      return err({ type: "hashing_error" });
    }

    const updated = await dbInstance.transaction(async (tx) => {
      const [lockedReset] = await tx
        .select({ id: resetPasswords.id, userId: resetPasswords.userId, expiresAt: resetPasswords.expiresAt })
        .from(resetPasswords)
        .where(eq(resetPasswords.resetPasswordHash, hashResetToken(hash)))
        .limit(1)
        .for("update");
      if (!lockedReset || lockedReset.expiresAt < new Date()) return false;

      const updateResult = await tx
        .update(Users)
        .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
        .where(eq(Users.id, lockedReset.userId));
      if (updateResult.rowCount === 0) return null;

      await tx.delete(resetPasswords).where(eq(resetPasswords.id, lockedReset.id));
      return true;
    });

    if (updated === null) return err({ type: "user_not_found" });
    if (!updated) return err({ type: "token_invalid_or_expired" });
    return ok(undefined);
  } catch (dbError) {
    console.error("Database error during password reset:", dbError);
    return err({ type: "database_error" });
  }
};
