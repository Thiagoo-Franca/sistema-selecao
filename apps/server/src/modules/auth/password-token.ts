import crypto from "crypto";
import { eq } from "drizzle-orm";
import { env } from "../../config/env.js";
import type { Database } from "../../database/index.js";
import { resetPasswords } from "../../database/schema.js";
import { logDatabaseError } from "../../database/errors.js";
import { sendEmail } from "../../services/email.service.js";
import {
  createDefinirSenhaEmail,
  createPasswordResetEmail,
} from "../../templates/email/index.js";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

// Prazos dos links de senha. O prazo efetivo fica gravado em `expiresAt`.
export const EXPIRACAO_RESET_SENHA_MS = HORA_MS;
export const EXPIRACAO_PRIMEIRA_SENHA_DIAS = 7;
export const EXPIRACAO_PRIMEIRA_SENHA_MS = EXPIRACAO_PRIMEIRA_SENHA_DIAS * DIA_MS;

// Mesma tela no web para os dois casos: /reset-password/<token>.
const FRONTEND_URL_PADRAO = "http://localhost:5173";

// "reset": usuário pediu recuperação. "primeira_senha": admin criou o professor
// ou reenviou o convite. Só variam prazo, assunto e template.
export type TipoTokenSenha = "reset" | "primeira_senha";

const TOKEN_SENHA_CONFIG: Record<
  TipoTokenSenha,
  { expiracaoMs: number; assunto: string; html: (nome: string, url: string) => string }
> = {
  reset: {
    expiracaoMs: EXPIRACAO_RESET_SENHA_MS,
    assunto: "Recuperação de senha - SISSEL",
    html: (nome, url) => createPasswordResetEmail({ nome, resetUrl: url }),
  },
  primeira_senha: {
    expiracaoMs: EXPIRACAO_PRIMEIRA_SENHA_MS,
    assunto: "Defina sua senha - SISSEL",
    html: (nome, url) =>
      createDefinirSenhaEmail({
        nome,
        definirSenhaUrl: url,
        validadeDias: EXPIRACAO_PRIMEIRA_SENHA_DIAS,
      }),
  },
};

// Só o sha256 do token vai para o banco; o token bruto existe apenas no e-mail.
export const hashTokenSenha = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Invalida os tokens anteriores do usuário e grava um novo (um por usuário).
 * Recebe a transação do chamador para ser atômico com o restante da operação
 * (ex.: o insert do usuário na criação de professor).
 */
export const gerarTokenSenha = async (
  tx: Tx,
  userId: string,
  tipo: TipoTokenSenha,
): Promise<string> => {
  const token = crypto.randomBytes(32).toString("hex");
  await tx.delete(resetPasswords).where(eq(resetPasswords.userId, userId));
  await tx.insert(resetPasswords).values({
    userId,
    resetPasswordHash: hashTokenSenha(token),
    expiresAt: new Date(Date.now() + TOKEN_SENHA_CONFIG[tipo].expiracaoMs),
  });
  return token;
};

/**
 * Envia o link de senha. Se o envio falhar, apaga o token (ninguém o recebeu).
 * Nunca lança: devolve se o e-mail saiu, para poder ser usado sem `await`.
 */
export const enviarEmailTokenSenha = async (
  db: Database,
  destinatario: { email: string; nome: string },
  token: string,
  tipo: TipoTokenSenha,
): Promise<boolean> => {
  const config = TOKEN_SENHA_CONFIG[tipo];
  try {
    const url = new URL(
      `/reset-password/${token}`,
      env.FRONTEND_URL ?? FRONTEND_URL_PADRAO,
    ).toString();
    const emailResult = await sendEmail({
      to: destinatario.email,
      subject: config.assunto,
      html: config.html(destinatario.nome, url),
    });
    if (emailResult.ok) return true;
  } catch (error) {
    console.error("Unexpected error sending password link email:", {
      code: (error as { code?: string }).code ?? "unknown",
    });
  }

  try {
    await db
      .delete(resetPasswords)
      .where(eq(resetPasswords.resetPasswordHash, hashTokenSenha(token)));
  } catch (cleanupError) {
    logDatabaseError("Error removing unsent password token:", cleanupError);
  }
  return false;
};
