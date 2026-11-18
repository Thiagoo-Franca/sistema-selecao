import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { app } from "../../index.js";
import { resetPasswords, Users } from "../../database/schema.js";
import { fakeDeps, getFakeDb } from "../../tests/utils.js";
import { TEST_USER_BASIC, createTestUserWithPasswordHash } from "@tcc/tests";
import { sendEmail } from "../../services/email.service.js";
import { EXPIRACAO_RESET_SENHA_MS, hashTokenSenha } from "./password-token.js";

vi.mock("../../services/email.service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../services/email.service.js")>()),
  sendEmail: vi.fn(),
}));

const sendEmailMock = vi.mocked(sendEmail);
const MENSAGEM_NEUTRA = "Se o email existir, um link de redefinição foi enviado.";
const MENSAGEM_TOKEN = "Link inválido ou expirado. Solicite um novo link.";
const NOVA_SENHA = "NovaSenha123!";

const tokenDoEmail = (callIndex = 0): string => {
  const html = sendEmailMock.mock.calls[callIndex]?.[0].html ?? "";
  const match = html.match(/\/reset-password\/([0-9a-f]{64})/);
  if (!match) throw new Error("token não encontrado no e-mail");
  return match[1];
};

describe("recuperação de senha", () => {
  let db: Awaited<ReturnType<typeof getFakeDb>>;
  let application: ReturnType<typeof app>;
  let userId: string;

  const post = (path: string, body: unknown) =>
    application.request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  const solicitarReset = (email: string) =>
    post("/auth/reset-password", { email });

  const redefinir = (token: string, newPassword = NOVA_SENHA) =>
    post("/auth/reset-password/reset", { token, newPassword });

  const login = (email: string, password: string) =>
    post("/auth/login", { email, password });

  beforeAll(async () => {
    db = await getFakeDb();
    application = app(fakeDeps(db));
  });

  beforeEach(async () => {
    sendEmailMock.mockReset();
    sendEmailMock.mockResolvedValue({ ok: true, data: undefined });
    const [user] = await db
      .insert(Users)
      .values(await createTestUserWithPasswordHash(TEST_USER_BASIC))
      .returning({ id: Users.id });
    userId = user.id;
  });

  afterEach(async () => {
    await db.delete(resetPasswords);
    await db.delete(Users);
  });

  it("responde igual para e-mail existente e inexistente", async () => {
    const inexistente = await solicitarReset("ninguem@example.com");
    const existente = await solicitarReset(TEST_USER_BASIC.email);

    expect(inexistente.status).toBe(200);
    expect(existente.status).toBe(200);
    expect(await inexistente.json()).toEqual({ message: MENSAGEM_NEUTRA });
    expect(await existente.json()).toEqual({ message: MENSAGEM_NEUTRA });

    await vi.waitFor(() => expect(sendEmailMock).toHaveBeenCalledTimes(1));
    expect(sendEmailMock.mock.calls[0][0].to).toBe(TEST_USER_BASIC.email);
  });

  it("não envia e-mail para usuário inativo", async () => {
    await db.update(Users).set({ ativo: false }).where(eq(Users.id, userId));

    const response = await solicitarReset(TEST_USER_BASIC.email);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: MENSAGEM_NEUTRA });
    expect(await db.select().from(resetPasswords)).toHaveLength(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("normaliza o e-mail (espaços e maiúsculas) na solicitação e no login", async () => {
    const response = await solicitarReset("  TEST@Example.COM ");
    expect(response.status).toBe(200);
    await vi.waitFor(() => expect(sendEmailMock).toHaveBeenCalledTimes(1));

    const loginResponse = await login(" Test@EXAMPLE.com", TEST_USER_BASIC.password);
    expect(loginResponse.status).toBe(200);
  });

  it("grava token com expiração de 1 hora e só o hash dele", async () => {
    const antes = Date.now();
    await solicitarReset(TEST_USER_BASIC.email);
    await vi.waitFor(() => expect(sendEmailMock).toHaveBeenCalledTimes(1));

    const token = tokenDoEmail();
    const [linha] = await db.select().from(resetPasswords);
    expect(linha.resetPasswordHash).toBe(hashTokenSenha(token));
    expect(linha.resetPasswordHash).not.toBe(token);
    const prazo = linha.expiresAt.getTime() - antes;
    expect(prazo).toBeGreaterThan(EXPIRACAO_RESET_SENHA_MS - 60_000);
    expect(prazo).toBeLessThanOrEqual(EXPIRACAO_RESET_SENHA_MS + 60_000);
  });

  it("mantém um único token por usuário (o anterior deixa de valer)", async () => {
    await solicitarReset(TEST_USER_BASIC.email);
    await vi.waitFor(() => expect(sendEmailMock).toHaveBeenCalledTimes(1));
    await solicitarReset(TEST_USER_BASIC.email);
    await vi.waitFor(() => expect(sendEmailMock).toHaveBeenCalledTimes(2));

    expect(await db.select().from(resetPasswords)).toHaveLength(1);
    expect((await redefinir(tokenDoEmail(0))).status).toBe(400);
    expect((await redefinir(tokenDoEmail(1))).status).toBe(200);
  });

  it("token válido redefine a senha e é consumido (segundo uso → 400)", async () => {
    await solicitarReset(TEST_USER_BASIC.email);
    await vi.waitFor(() => expect(sendEmailMock).toHaveBeenCalledTimes(1));
    const token = tokenDoEmail();

    const verificacao = await application.request(`/auth/reset-password/${token}`);
    expect(verificacao.status).toBe(200);
    expect(await verificacao.json()).toEqual({ valid: true });

    const primeiro = await redefinir(token);
    expect(primeiro.status).toBe(200);
    expect((await login(TEST_USER_BASIC.email, NOVA_SENHA)).status).toBe(200);
    expect((await login(TEST_USER_BASIC.email, TEST_USER_BASIC.password)).status).toBe(403);

    const segundo = await redefinir(token, "OutraSenha456!");
    expect(segundo.status).toBe(400);
    expect(await segundo.json()).toEqual({ message: MENSAGEM_TOKEN });
    expect(await db.select().from(resetPasswords)).toHaveLength(0);
  });

  it("token expirado → 400 com mensagem genérica no GET e no POST", async () => {
    const token = "a".repeat(64);
    await db.insert(resetPasswords).values({
      userId,
      resetPasswordHash: hashTokenSenha(token),
      expiresAt: new Date(Date.now() - 1000),
    });

    const reset = await redefinir(token);
    expect(reset.status).toBe(400);
    expect(await reset.json()).toEqual({ message: MENSAGEM_TOKEN });

    const verificacao = await application.request(`/auth/reset-password/${token}`);
    expect(verificacao.status).toBe(400);
    expect(await verificacao.json()).toEqual({ message: MENSAGEM_TOKEN });
    // Verificação remove o token expirado.
    expect(await db.select().from(resetPasswords)).toHaveLength(0);
  });

  it("token inexistente → 400 com a mesma mensagem", async () => {
    const response = await redefinir("b".repeat(64));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: MENSAGEM_TOKEN });

    const verificacao = await application.request(`/auth/reset-password/${"b".repeat(64)}`);
    expect(verificacao.status).toBe(400);
    expect(await verificacao.json()).toEqual({ message: MENSAGEM_TOKEN });
  });

  it("param malformado no GET → 400 neutro", async () => {
    for (const hash of ["abc", "Z".repeat(64), `${"a".repeat(64)}0`]) {
      const response = await application.request(`/auth/reset-password/${hash}`);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: MENSAGEM_TOKEN });
    }
  });

  it("rejeita campos extras e senha curta no corpo", async () => {
    const token = "c".repeat(64);
    expect(
      (await post("/auth/reset-password/reset", { token, newPassword: NOVA_SENHA, userId })).status,
    ).toBe(400);
    expect((await redefinir(token, "curta")).status).toBe(400);
    expect((await redefinir("nao-hex", NOVA_SENHA)).status).toBe(400);
    expect(
      (await post("/auth/reset-password", { email: TEST_USER_BASIC.email, role: "ADMIN" })).status,
    ).toBe(400);
  });

  it("apaga o token quando o envio do e-mail falha", async () => {
    sendEmailMock.mockResolvedValue({ ok: false, error: { type: "email_error" } });

    const response = await solicitarReset(TEST_USER_BASIC.email);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: MENSAGEM_NEUTRA });

    await vi.waitFor(async () => {
      expect(await db.select().from(resetPasswords)).toHaveLength(0);
    });
  });
});
