import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { match } from "ts-pattern";
import { z } from "zod";
import { AppError } from "../../error.js";
import { type AppVariables } from "../../types.js";

import {
  emailSchema,
  requestResetSchema,
  resetPasswordSchema,
  resetTokenParamSchema,
  TOKEN_SENHA_INVALIDO_MENSAGEM,
} from "./auth.schema.js";
import {
  loginUserService,
  requestPasswordResetService,
  resetPasswordService,
  verifyResetHashService,
} from "./auth.service.js";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export const authRoutes = new Hono<{ Variables: AppVariables }>()
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const result = await loginUserService(c, email, password);
    if (!result.ok) {
      throw match(result.error)
        .with(
          { type: "database_error" },
          () => new AppError(500, "Algo deu errado tente novamente mais tarde"),
        )
        .with(
          { type: "inactive_user" },
          () => new AppError(403, "Seu usuário está inativo."),
        )
        .otherwise(() => new AppError(403, "Usuário ou senha inválidos."));
    }
    return c.json(result.data, 200);
  })
  .post(
    "/reset-password",
    zValidator("json", requestResetSchema),
    async (c) => {
      const { email } = c.req.valid("json");
      const result = await requestPasswordResetService(c, email);

      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "database_error" },
            () =>
              new AppError(
                500,
                "Erro interno ao solicitar redefinição de senha.",
              ),
          )
          .exhaustive();
      }

      return c.json(
        { message: "Se o email existir, um link de redefinição foi enviado." },
        200,
      );
    },
  )
  .get(
    "/reset-password/:hash",
    // Token malformado recebe a mesma resposta de token inexistente.
    zValidator("param", resetTokenParamSchema, (result) => {
      if (!result.success) {
        throw new AppError(400, TOKEN_SENHA_INVALIDO_MENSAGEM);
      }
    }),
    async (c) => {
      const { hash } = c.req.valid("param");
      const result = await verifyResetHashService(c, hash);
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "token_expired" },
            { type: "token_invalid" },
            () => new AppError(400, TOKEN_SENHA_INVALIDO_MENSAGEM),
          )
          .with(
            { type: "database_error" },
            () =>
              new AppError(
                500,
                "Erro interno ao verificar o link de redefinição.",
              ),
          )
          .exhaustive();
      }
      return c.json(result.data, 200);
    },
  )
  .post(
    "/reset-password/reset",
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { token, newPassword } = c.req.valid("json");
      const result = await resetPasswordService(c, token, newPassword);
      if (!result.ok) {
        throw match(result.error)
          .with(
            { type: "token_invalid_or_expired" },
            () => new AppError(400, TOKEN_SENHA_INVALIDO_MENSAGEM),
          )
          .with(
            { type: "hashing_error" },
            { type: "database_error" },
            () => new AppError(500, "Erro interno ao redefinir a senha."),
          )
          .exhaustive();
      }
      return c.json({ message: "Senha redefinida com sucesso." }, 200);
    },
  );
