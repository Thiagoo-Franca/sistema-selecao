import crypto from "crypto";
import { and, eq, isNull, lt } from "drizzle-orm";
import { type Context } from "hono";
import { sign } from "hono/jwt";
import { type db } from "../../database/index.js";
import { refreshTokens, Users } from "../../database/schema.js";
import { logDatabaseError } from "../../database/errors.js";
import { err, ok, type AppResult } from "../../result.js";
import { type AppVariables } from "../../types.js";
import {
  JWT_AUDIENCE,
  JWT_EXPIRY_SECONDS,
  JWT_ISSUER,
  JWT_SECRET,
} from "./jwt.js";

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

const hashRefreshToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (userId: string) => {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    {
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      sub: userId,
      iat: now,
      exp: now + JWT_EXPIRY_SECONDS,
    },
    JWT_SECRET,
    "HS256",
  );
};

/**
 * Emite um refresh token opaco na família indicada (ou numa nova família,
 * que representa uma nova sessão). Devolve o token em claro: só o sha256
 * fica no banco. Aproveita para apagar os tokens já expirados do usuário.
 * Tokens revogados e ainda não expirados são mantidos para detectar reuso.
 */
export const issueRefreshToken = async (
  dbOrTx: DbOrTx,
  userId: string,
  familyId: string = crypto.randomUUID(),
): Promise<string> => {
  const now = new Date();
  await dbOrTx
    .delete(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), lt(refreshTokens.expiresAt, now)),
    );

  const token = crypto.randomBytes(32).toString("hex");
  await dbOrTx.insert(refreshTokens).values({
    userId,
    tokenHash: hashRefreshToken(token),
    familyId,
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
  });
  return token;
};

const revokeFamily = (dbOrTx: DbOrTx, familyId: string) =>
  dbOrTx
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.familyId, familyId), isNull(refreshTokens.revokedAt)),
    );

/** Encerra todas as sessões do usuário (desativação, troca de senha, reset). */
export const revokeAllRefreshTokensForUser = (dbOrTx: DbOrTx, userId: string) =>
  dbOrTx
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    );

type RefreshTokenServiceError =
  | { type: "invalid_refresh_token" }
  | { type: "database_error" };

export const refreshTokenService = async (
  c: Context<{ Variables: AppVariables }>,
  refreshToken: string,
): Promise<
  AppResult<{ token: string; refreshToken: string }, RefreshTokenServiceError>
> => {
  const dbInstance = c.get("db");
  try {
    const result = await dbInstance.transaction(async (tx) => {
      const [current] = await tx
        .select({
          id: refreshTokens.id,
          userId: refreshTokens.userId,
          familyId: refreshTokens.familyId,
          expiresAt: refreshTokens.expiresAt,
          revokedAt: refreshTokens.revokedAt,
        })
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)))
        .limit(1)
        .for("update");

      if (!current) return null;

      // Reuso de um token já rotacionado/revogado: a cadeia pode ter vazado,
      // então a sessão inteira é derrubada. Retornar (sem throw) faz o commit.
      if (current.revokedAt) {
        await revokeFamily(tx, current.familyId);
        return null;
      }

      if (current.expiresAt <= new Date()) return null;

      const [user] = await tx
        .select({ id: Users.id, ativo: Users.ativo })
        .from(Users)
        .where(eq(Users.id, current.userId))
        .limit(1);

      if (!user || !user.ativo) {
        await revokeAllRefreshTokensForUser(tx, current.userId);
        return null;
      }

      await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.id, current.id));

      const newRefreshToken = await issueRefreshToken(
        tx,
        user.id,
        current.familyId,
      );
      // Assinado dentro da transação: se falhar, a rotação é desfeita.
      const token = await signAccessToken(user.id);
      return { token, refreshToken: newRefreshToken };
    });

    if (!result) return err({ type: "invalid_refresh_token" });
    return ok(result);
  } catch (error) {
    logDatabaseError("Database error during token refresh:", error);
    return err({ type: "database_error" });
  }
};

type LogoutServiceError = { type: "database_error" };

/** Revoga a família (sessão) do token. Não revela se o token existia. */
export const logoutService = async (
  c: Context<{ Variables: AppVariables }>,
  refreshToken: string,
): Promise<AppResult<void, LogoutServiceError>> => {
  const dbInstance = c.get("db");
  try {
    const [existing] = await dbInstance
      .select({ familyId: refreshTokens.familyId })
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)))
      .limit(1);

    if (existing) {
      await revokeFamily(dbInstance, existing.familyId);
    }
    return ok(undefined);
  } catch (error) {
    logDatabaseError("Database error during logout:", error);
    return err({ type: "database_error" });
  }
};
