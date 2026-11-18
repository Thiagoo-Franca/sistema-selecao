import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { app } from "../../index.js";
import { resetPasswords, Users } from "../../database/schema.js";
import { fakeDeps, getFakeDb } from "../../tests/utils.js";
import { TEST_ADMIN, TEST_TEACHER, createTestUserWithPasswordHash } from "@tcc/tests";
import { sendEmail } from "../../services/email.service.js";
import { EXPIRACAO_PRIMEIRA_SENHA_MS, hashTokenSenha } from "../auth/index.js";

vi.mock("../../services/email.service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../services/email.service.js")>()),
  sendEmail: vi.fn(),
}));

const sendEmailMock = vi.mocked(sendEmail);

const novoProfessor = {
  nome: "Professora Nova",
  email: "  Nova.Professora@UFBA.br ",
  school: "Instituto de Computação",
  matricula: "999",
  academicTitle: "Doutorado",
  role: "TEACHER" as const,
  areas: ["CD", "ES", "CD"],
};
const EMAIL_NORMALIZADO = "nova.professora@ufba.br";

const ultimoToken = (): string => {
  const calls = sendEmailMock.mock.calls;
  const html = calls[calls.length - 1]?.[0].html ?? "";
  const match = html.match(/\/reset-password\/([0-9a-f]{64})/);
  if (!match) throw new Error("token não encontrado no e-mail");
  return match[1];
};

describe("criação de professor e convite para definir senha", () => {
  let db: Awaited<ReturnType<typeof getFakeDb>>;
  let application: ReturnType<typeof app>;
  let adminToken: string;
  let teacherToken: string;
  let teacherId: string;

  const request = (
    method: string,
    path: string,
    { token, body }: { token?: string; body?: unknown } = {},
  ) =>
    application.request(path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const loginToken = async (email: string, password: string) => {
    const response = await request("POST", "/auth/login", { body: { email, password } });
    expect(response.status).toBe(200);
    return ((await response.json()) as { token: string }).token;
  };

  const criarProfessor = (body: unknown = novoProfessor, token = adminToken) =>
    request("POST", "/usuario", { token, body });

  const reenviarConvite = (id: string, token = adminToken) =>
    request("POST", `/usuario/${id}/convite`, { token });

  beforeAll(async () => {
    db = await getFakeDb();
    application = app(fakeDeps(db));
  });

  beforeEach(async () => {
    sendEmailMock.mockReset();
    sendEmailMock.mockResolvedValue({ ok: true, data: undefined });
    await db.insert(Users).values(await createTestUserWithPasswordHash(TEST_ADMIN));
    const [teacher] = await db
      .insert(Users)
      .values(await createTestUserWithPasswordHash(TEST_TEACHER))
      .returning({ id: Users.id });
    teacherId = teacher.id;
    adminToken = await loginToken(TEST_ADMIN.email, TEST_ADMIN.password);
    teacherToken = await loginToken(TEST_TEACHER.email, TEST_TEACHER.password);
  });

  afterEach(async () => {
    await db.delete(resetPasswords);
    await db.delete(Users);
  });

  it("cria professor sem senha, com hash inutilizável e token de 7 dias", async () => {
    const antes = Date.now();
    const response = await criarProfessor();
    expect(response.status).toBe(201);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      email: EMAIL_NORMALIZADO,
      nome: "Professora Nova",
      role: "TEACHER",
      areas: ["CD", "ES"],
      ativo: true,
      conviteEnviado: true,
    });
    expect(body).not.toHaveProperty("passwordHash");
    expect(body).not.toHaveProperty("password");

    const [salvo] = await db.select().from(Users).where(eq(Users.id, body.id as string));
    expect(salvo.email).toBe(EMAIL_NORMALIZADO);
    expect(salvo.areas).toEqual(["CD", "ES"]);
    expect(salvo.passwordHash).toMatch(/^\$2[aby]\$10\$/);

    // Nenhuma senha "óbvia" funciona antes de o professor definir a sua.
    for (const senha of ["", "Password123!", "12345678"]) {
      const login = await request("POST", "/auth/login", {
        body: { email: EMAIL_NORMALIZADO, password: senha || "x" },
      });
      expect(login.status).toBe(403);
    }

    const [linha] = await db.select().from(resetPasswords).where(eq(resetPasswords.userId, salvo.id));
    const prazo = linha.expiresAt.getTime() - antes;
    expect(prazo).toBeGreaterThan(EXPIRACAO_PRIMEIRA_SENHA_MS - 60_000);
    expect(prazo).toBeLessThanOrEqual(EXPIRACAO_PRIMEIRA_SENHA_MS + 60_000);

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const email = sendEmailMock.mock.calls[0][0];
    expect(email.to).toBe(EMAIL_NORMALIZADO);
    expect(email.subject).toBe("Defina sua senha - SISSEL");
    expect(linha.resetPasswordHash).toBe(hashTokenSenha(ultimoToken()));
  });

  it("o link do convite define a senha e permite login", async () => {
    await criarProfessor();
    const token = ultimoToken();

    const reset = await request("POST", "/auth/reset-password/reset", {
      body: { token, newPassword: "MinhaSenha123!" },
    });
    expect(reset.status).toBe(200);
    expect((await request("POST", "/auth/login", {
      body: { email: EMAIL_NORMALIZADO, password: "MinhaSenha123!" },
    })).status).toBe(200);
  });

  it("rejeita password e campos de sistema no corpo (400)", async () => {
    expect((await criarProfessor({ ...novoProfessor, password: "Password123!" })).status).toBe(400);
    expect((await criarProfessor({ ...novoProfessor, ativo: false })).status).toBe(400);
    expect((await criarProfessor({ ...novoProfessor, passwordHash: "x" })).status).toBe(400);
    expect((await criarProfessor({ ...novoProfessor, id: randomUUID() })).status).toBe(400);
    expect(await db.select().from(Users).where(eq(Users.email, EMAIL_NORMALIZADO))).toHaveLength(0);
  });

  it("e-mail duplicado (ignorando maiúsculas) → 409", async () => {
    const response = await criarProfessor({ ...novoProfessor, email: "TEACHER@test.com" });
    expect(response.status).toBe(409);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("falha no envio mantém o usuário e devolve conviteEnviado=false", async () => {
    sendEmailMock.mockResolvedValue({ ok: false, error: { type: "email_error" } });

    const response = await criarProfessor();
    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: string; conviteEnviado: boolean };
    expect(body.conviteEnviado).toBe(false);

    expect(await db.select().from(Users).where(eq(Users.id, body.id))).toHaveLength(1);
    expect(await db.select().from(resetPasswords).where(eq(resetPasswords.userId, body.id))).toHaveLength(0);
  });

  it("reenviar convite troca o token (o antigo deixa de valer)", async () => {
    const criado = (await (await criarProfessor()).json()) as { id: string };
    const tokenAntigo = ultimoToken();

    const antes = Date.now();
    const response = await reenviarConvite(criado.id);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ conviteEnviado: true });
    const tokenNovo = ultimoToken();
    expect(tokenNovo).not.toBe(tokenAntigo);

    const linhas = await db.select().from(resetPasswords).where(eq(resetPasswords.userId, criado.id));
    expect(linhas).toHaveLength(1);
    expect(linhas[0].expiresAt.getTime() - antes).toBeGreaterThan(EXPIRACAO_PRIMEIRA_SENHA_MS - 60_000);

    expect((await application.request(`/auth/reset-password/${tokenAntigo}`)).status).toBe(400);
    expect((await application.request(`/auth/reset-password/${tokenNovo}`)).status).toBe(200);
  });

  it("reenviar para id inexistente → 404 e id malformado → 400", async () => {
    expect((await reenviarConvite(randomUUID())).status).toBe(404);
    expect((await reenviarConvite("nao-e-uuid")).status).toBe(400);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("reenviar para usuário inativo → 409", async () => {
    await db.update(Users).set({ ativo: false }).where(eq(Users.id, teacherId));
    expect((await reenviarConvite(teacherId)).status).toBe(409);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("falha no envio do reenvio → 502", async () => {
    sendEmailMock.mockResolvedValue({ ok: false, error: { type: "email_error" } });
    expect((await reenviarConvite(teacherId)).status).toBe(502);
    expect(await db.select().from(resetPasswords)).toHaveLength(0);
  });

  it("TEACHER não cria nem reenvia convite (403)", async () => {
    expect((await criarProfessor(novoProfessor, teacherToken)).status).toBe(403);
    expect((await reenviarConvite(teacherId, teacherToken)).status).toBe(403);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("sem token → 401", async () => {
    expect((await request("POST", "/usuario", { body: novoProfessor })).status).toBe(401);
    expect((await request("POST", `/usuario/${teacherId}/convite`)).status).toBe(401);
  });
});
