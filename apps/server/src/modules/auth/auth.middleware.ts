import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import { type SignatureKey } from "hono/utils/jwt/jws";
import { verify } from "hono/jwt";
import { AppError } from "../../error.js";
import type { AppVariables } from "../../types.js";
import type { UserRole } from "../../database/schema.js";
import { Users } from "../../database/schema.js";
import { eq } from "drizzle-orm";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const checkRole = (roles: UserRole[]) =>
  createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const userId = c.get("jwtPayload")?.sub;
    if (!userId) {
      throw new AppError(401, "Não autenticado");
    }

    const [user] = await c
      .get("db")
      .select({ id: Users.id, role: Users.role, ativo: Users.ativo })
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1);

    if (!user || !user.ativo) {
      throw new AppError(401, "Não autenticado");
    }

    c.set("usuario", { id: user.id, role: user.role });

    if (!roles.includes(user.role)) {
      throw new AppError(
        403,
        "Usuário não tem permissão para acessar esta rota",
      );
    }
    return next();
  });

export const getUsuarioAutenticado = (
  c: Context<{ Variables: AppVariables }>,
) => {
  const usuario = c.get("usuario");
  if (!usuario) {
  throw new AppError(401, "Não autenticado");
  }
  return usuario;
};

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
