import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { match } from "ts-pattern";
import { z } from "zod";
import { AppError } from "../../error.js";
import { type AppVariables } from "../../types.js";
import { logoutService, refreshTokenService } from "./refresh-token.service.js";

// Rotas públicas: não exigem access token (appJwt deixa passar sem header).
const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().min(1).max(512),
  })
  .strict();

export const refreshTokenRoutes = new Hono<{ Variables: AppVariables }>()
  .post("/refresh", zValidator("json", refreshTokenBodySchema), async (c) => {
    const { refreshToken } = c.req.valid("json");
    const result = await refreshTokenService(c, refreshToken);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "invalid_refresh_token" },
          () => new AppError(401, "Sessão inválida ou expirada."),
        )
        .with(
          { type: "database_error" },
          () => new AppError(500, "Algo deu errado tente novamente mais tarde"),
        )
        .exhaustive();
    }
    return c.json(result.data, 200);
  })
  .post("/logout", zValidator("json", refreshTokenBodySchema), async (c) => {
    const { refreshToken } = c.req.valid("json");
    const result = await logoutService(c, refreshToken);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Algo deu errado tente novamente mais tarde"),
        )
        .exhaustive();
    }
    return c.json({ message: "Sessão encerrada." }, 200);
  });
