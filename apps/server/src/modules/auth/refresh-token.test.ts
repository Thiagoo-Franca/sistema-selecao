import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { TEST_USER_BASIC, createTestUserWithPasswordHash } from "@tcc/tests";
import { app } from "../../index.js";
import { refreshTokens, Users } from "../../database/schema.js";
import { fakeDeps, getFakeDb } from "../../tests/utils.js";

const json = (body: unknown, token?: string) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
});

describe("refresh token", () => {
  let db: Awaited<ReturnType<typeof getFakeDb>>;
  let application: ReturnType<typeof app>;
  let userId: string;

  beforeAll(async () => {
    db = await getFakeDb();
    application = app(fakeDeps(db));
  });

  beforeEach(async () => {
    const [user] = await db
      .insert(Users)
      .values(await createTestUserWithPasswordHash(TEST_USER_BASIC))
      .returning({ id: Users.id });
    userId = user.id;
  });

  afterEach(async () => {
    await db.delete(Users); // refresh_token cai junto (onDelete cascade)
  });

  async function login(password = TEST_USER_BASIC.password) {
    const response = await application.request(
      "/auth/login",
      json({ email: TEST_USER_BASIC.email, password }),
    );
    expect(response.status).toBe(200);
    return (await response.json()) as { token: string; refreshToken: string };
  }

  const refresh = (refreshToken: unknown) =>
    application.request("/auth/refresh", json({ refreshToken }));

  it("login devolve token e refreshToken (guardado só como hash)", async () => {
    const data = await login();
    expect(typeof data.token).toBe("string");
    expect(data.refreshToken).toMatch(/^[0-9a-f]{64}$/);

    const rows = await db
      .select({ tokenHash: refreshTokens.tokenHash })
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(data.refreshToken);
  });

  it("refresh feliz gera novo par, o access token novo funciona e o refresh antigo deixa de funcionar", async () => {
    const { refreshToken } = await login();

    const response = await refresh(refreshToken);
    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      token: string;
      refreshToken: string;
    };
    expect(data.refreshToken).toMatch(/^[0-9a-f]{64}$/);
    expect(data.refreshToken).not.toBe(refreshToken);

    const me = await application.request("/usuario/me", {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    expect(me.status).toBe(200);

    expect((await refresh(refreshToken)).status).toBe(401);
  });

  it("mantém a família na rotação", async () => {
    const { refreshToken } = await login();
    const response = await refresh(refreshToken);
    expect(response.status).toBe(200);

    const rows = await db
      .select({ familyId: refreshTokens.familyId })
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((row) => row.familyId)).size).toBe(1);
  });

  it("reuso de token revogado derruba a família inteira", async () => {
    const { refreshToken: first } = await login();
    const rotated = await refresh(first);
    const { refreshToken: second } = (await rotated.json()) as {
      refreshToken: string;
    };

    const reuse = await refresh(first);
    expect(reuse.status).toBe(401);
    expect(await reuse.json()).toEqual({
      message: "Sessão inválida ou expirada.",
    });

    expect((await refresh(second)).status).toBe(401);
  });

  it("reuso numa sessão não derruba outra sessão do mesmo usuário", async () => {
    const { refreshToken: sessionA } = await login();
    const { refreshToken: sessionB } = await login();

    await refresh(sessionA);
    expect((await refresh(sessionA)).status).toBe(401);

    expect((await refresh(sessionB)).status).toBe(200);
  });

  it("token expirado → 401", async () => {
    const { refreshToken } = await login();
    await db
      .update(refreshTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(refreshTokens.userId, userId));

    expect((await refresh(refreshToken)).status).toBe(401);
  });

  it("token aleatório ou malformado → 401", async () => {
    expect((await refresh("f".repeat(64))).status).toBe(401);
    expect((await refresh("nao-e-um-token")).status).toBe(401);
  });

  it("usuário desativado não renova a sessão", async () => {
    const { refreshToken } = await login();
    await db.update(Users).set({ ativo: false }).where(eq(Users.id, userId));

    expect((await refresh(refreshToken)).status).toBe(401);

    // reativar não ressuscita a sessão: os tokens foram revogados
    await db.update(Users).set({ ativo: true }).where(eq(Users.id, userId));
    expect((await refresh(refreshToken)).status).toBe(401);
  });

  it("logout revoga a sessão", async () => {
    const { refreshToken } = await login();

    const response = await application.request(
      "/auth/logout",
      json({ refreshToken }),
    );
    expect(response.status).toBe(200);

    expect((await refresh(refreshToken)).status).toBe(401);
  });

  it("logout com token inexistente responde 200 (não confirma existência)", async () => {
    const response = await application.request(
      "/auth/logout",
      json({ refreshToken: "a".repeat(64) }),
    );
    expect(response.status).toBe(200);
  });

  it("troca de senha pelo próprio usuário revoga os refresh tokens", async () => {
    const { token, refreshToken } = await login();

    const response = await application.request(
      "/usuario/me/change-password",
      json(
        {
          currentPassword: TEST_USER_BASIC.password,
          newPassword: "OutraSenha123!",
        },
        token,
      ),
    );
    expect(response.status).toBe(200);

    expect((await refresh(refreshToken)).status).toBe(401);
  });

  it("body com campos extras ou sem refreshToken → 400", async () => {
    const { refreshToken } = await login();

    const extraRefresh = await application.request(
      "/auth/refresh",
      json({ refreshToken, userId }),
    );
    expect(extraRefresh.status).toBe(400);

    const extraLogout = await application.request(
      "/auth/logout",
      json({ refreshToken, familyId: userId }),
    );
    expect(extraLogout.status).toBe(400);

    expect((await application.request("/auth/refresh", json({}))).status).toBe(
      400,
    );
    expect((await refresh(123)).status).toBe(400);

    // o token continua válido: as requisições rejeitadas não o consumiram
    expect((await refresh(refreshToken)).status).toBe(200);
  });

  it("apaga os tokens expirados do usuário ao emitir um novo", async () => {
    await login();
    await db
      .update(refreshTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(refreshTokens.userId, userId));

    await login();

    const rows = await db
      .select({ id: refreshTokens.id })
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
    expect(rows).toHaveLength(1);
  });
});
