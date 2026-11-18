import * as bcrypt from "bcryptjs";
import { and, eq, gte } from "drizzle-orm";
import { type Context } from "hono";
import {
  resetPasswords,
  Users,
  type SelectUser,
} from "../../database/schema.js";
import { err, ok, type AppResult } from "../../result.js";
import { type AppVariables } from "../../types.js";
import { logDatabaseError } from "../../database/errors.js";
import { emailIgual } from "./email.js";
import {
  enviarEmailTokenSenha,
  gerarTokenSenha,
  hashTokenSenha,
} from "./password-token.js";
import {
  issueRefreshToken,
  revokeAllRefreshTokensForUser,
  signAccessToken,
} from "./refresh-token.service.js";

interface LoginResponse {
  id: string;
  token: string;
  refreshToken: string;
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
      .where(emailIgual(email))
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

    let token: string;
    try {
      token = await signAccessToken(user.id);
    } catch {
      console.error("JWT signing error during login");
      return err({ type: "jwt_signing_error" });
    }

    const refreshToken = await issueRefreshToken(dbInstance, user.id);

    return ok({
      id: user.id,
      token: token,
      refreshToken,
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

/**
 * Solicita o link de recuperação. A resposta é a mesma para e-mail existente,
 * inexistente ou inativo. Para não revelar a existência pelo tempo de resposta,
 * o envio do e-mail (SMTP, a parte lenta) não é aguardado: a resposta sai logo
 * depois de gravar o token. A diferença restante é uma transação curta no banco.
 * Funciona porque o servidor é um processo contínuo (Dokku/tsx), não serverless.
 */
export const requestPasswordResetService = async (
  c: Context<{ Variables: AppVariables }>,
  email: string,
): Promise<AppResult<void, RequestPasswordResetServiceError>> => {
  const dbInstance = c.get("db");

  try {
    const [user] = await dbInstance
      .select({
        id: Users.id,
        nome: Users.nome,
        email: Users.email,
        ativo: Users.ativo,
      })
      .from(Users)
      .where(emailIgual(email))
      .limit(1);
    if (!user || !user.ativo) return ok(undefined);

    const resetToken = await dbInstance.transaction((tx) =>
      gerarTokenSenha(tx, user.id, "reset"),
    );

    void enviarEmailTokenSenha(dbInstance, user, resetToken, "reset");

    return ok(undefined);
  } catch (error) {
    logDatabaseError("Database error during password reset request:", error);
    return err({ type: "database_error" });
  }
};

type VerifyResetHashServiceError =
  | { type: "token_expired" }
  | { type: "token_invalid" }
  | { type: "database_error" };

export const verifyResetHashService = async (
  c: Context<{ Variables: AppVariables }>,
  token: string,
): Promise<AppResult<{ valid: boolean }, VerifyResetHashServiceError>> => {
  const dbInstance = c.get("db");
  const tokenHash = hashTokenSenha(token);
  try {
    const [resetRecord] = await dbInstance
      .select({ id: resetPasswords.id, expiresAt: resetPasswords.expiresAt })
      .from(resetPasswords)
      .where(eq(resetPasswords.resetPasswordHash, tokenHash))
      .limit(1);

    if (!resetRecord) {
      return err({ type: "token_invalid" });
    }

    if (resetRecord.expiresAt < new Date()) {
      try {
        await dbInstance
          .delete(resetPasswords)
          .where(eq(resetPasswords.id, resetRecord.id));
      } catch (cleanupError) {
        logDatabaseError("Error cleaning up expired reset token:", cleanupError);
      }
      return err({ type: "token_expired" });
    }

    return ok({ valid: true });
  } catch (dbError) {
    logDatabaseError("Database error during reset hash verification:", dbError);
    return err({ type: "database_error" });
  }
};

type ResetPasswordServiceError =
  | { type: "token_invalid_or_expired" }
  | { type: "hashing_error" }
  | { type: "database_error" };

export const resetPasswordService = async (
  c: Context<{ Variables: AppVariables }>,
  token: string,
  newPassword: string,
): Promise<AppResult<void, ResetPasswordServiceError>> => {
  const dbInstance = c.get("db");
  const tokenHash = hashTokenSenha(token);
  try {
    // Checagem barata antes do bcrypt; a decisão final é tomada sob lock abaixo.
    const [resetRecord] = await dbInstance
      .select({ id: resetPasswords.id })
      .from(resetPasswords)
      .where(
        and(
          eq(resetPasswords.resetPasswordHash, tokenHash),
          gte(resetPasswords.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!resetRecord) {
      return err({ type: "token_invalid_or_expired" });
    }

    let newPasswordHash: string;
    try {
      newPasswordHash = await bcrypt.hash(newPassword, 10);
    } catch {
      console.error("Password hashing failed during reset");
      return err({ type: "hashing_error" });
    }

    // Consumo de uso único: trava a linha, troca a senha e apaga o token.
    const consumido = await dbInstance.transaction(async (tx) => {
      const [lockedReset] = await tx
        .select({
          id: resetPasswords.id,
          userId: resetPasswords.userId,
          expiresAt: resetPasswords.expiresAt,
        })
        .from(resetPasswords)
        .where(eq(resetPasswords.resetPasswordHash, tokenHash))
        .limit(1)
        .for("update");
      if (!lockedReset || lockedReset.expiresAt < new Date()) return false;

      const [updatedUser] = await tx
        .update(Users)
        .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
        .where(eq(Users.id, lockedReset.userId))
        .returning({ id: Users.id });
      if (!updatedUser) return false;

      await tx
        .delete(resetPasswords)
        .where(eq(resetPasswords.userId, lockedReset.userId));
      // Senha nova derruba todas as sessões abertas (reset e primeira senha).
      await revokeAllRefreshTokensForUser(tx, lockedReset.userId);
      return true;
    });

    if (!consumido) return err({ type: "token_invalid_or_expired" });
    return ok(undefined);
  } catch (dbError) {
    logDatabaseError("Database error during password reset:", dbError);
    return err({ type: "database_error" });
  }
};
