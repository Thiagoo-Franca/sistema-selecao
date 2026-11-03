import { createMiddleware } from "hono/factory";
import { type SignatureKey } from "hono/utils/jwt/jws";
import { verify } from "hono/jwt";
import { match } from "ts-pattern";
import { AppError } from "../../error.js";
import type { AppVariables } from "../../types.js";
import type { UserRole } from "../../database/schema.js";
import { getUserById } from "../usuario/usuario.service.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const checkRole = (roles: UserRole[]) =>
  createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const userId = c.get("jwtPayload")?.sub;
    if (!userId) {
      throw new AppError(401, "Usuário não autenticado");
    }
    const result = await getUserById(c, userId);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "user_not_found" },
          () => new AppError(404, "Usuário não encontrado"),
        )
        .with(
          { type: "database_error" },
          () => new AppError(500, "Erro ao buscar usuário"),
        )
        .exhaustive();
    }
    if (!roles.includes(result.data.role as UserRole)) {
      throw new AppError(
        403,
        "Usuário não tem permissão para acessar esta rota",
      );
    }
    return next();
  });

export const appJwt = (options: { secret: SignatureKey }) =>
  createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const credentials = c.req.raw.headers.get("Authorization");
    if (!credentials) {
      return next();
    }

    const bearerMatch = credentials.match(/^Bearer\s+([^\s]+)$/i);
    if (!bearerMatch) {
      throw new AppError(401, "Não autenticado");
    }

    let payload: Awaited<ReturnType<typeof verify>>;
    try {
      payload = await verify(bearerMatch[1], options.secret, "HS256");
    } catch {
      throw new AppError(401, "Não autenticado");
    }

    if (typeof payload.sub !== "string" || !UUID_PATTERN.test(payload.sub)) {
      throw new AppError(401, "Não autenticado");
    }

    c.set("jwtPayload", payload);
    return next();
  });
