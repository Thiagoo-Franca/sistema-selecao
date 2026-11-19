import { z } from "zod";

// E-mail sempre comparado/gravado em minúsculas e sem espaços nas pontas.
// trim/toLowerCase vêm antes de email() porque o Zod aplica os checks em ordem.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Email inválido." });

// Regra única de senha (reset, primeira senha e troca de senha).
// bcrypt só considera os primeiros 72 bytes; o máximo evita truncamento silencioso.
export const SENHA_MIN = 8;
export const SENHA_MAX = 72;
export const senhaSchema = z
  .string()
  .min(SENHA_MIN, {
    message: `A senha deve ter pelo menos ${SENHA_MIN} caracteres.`,
  })
  .max(SENHA_MAX, {
    message: `A senha deve ter no máximo ${SENHA_MAX} caracteres.`,
  });

export const TOKEN_SENHA_INVALIDO_MENSAGEM =
  "Link inválido ou expirado. Solicite um novo link.";

// Token bruto enviado por e-mail: crypto.randomBytes(32) em hex.
export const tokenSenhaSchema = z
  .string()
  .regex(/^[0-9a-f]{64}$/, { message: TOKEN_SENHA_INVALIDO_MENSAGEM });

export const requestResetSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: tokenSenhaSchema,
    newPassword: senhaSchema,
  })
  .strict();

export const resetTokenParamSchema = z.object({
  hash: tokenSenhaSchema,
});
