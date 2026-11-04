import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../index.js";
import { Users } from "../../database/schema.js";
import { fakeDeps, getFakeDb } from "../../tests/utils.js";
import { TEST_USER_BASIC, createTestUserWithPasswordHash } from "@tcc/tests";

describe("Auth Routes", async () => {
  const db = await getFakeDb();
  const client = testClient(app(fakeDeps(db)));

  beforeEach(async () => {
    const testUserWithHash =
      await createTestUserWithPasswordHash(TEST_USER_BASIC);
    await db.insert(Users).values(testUserWithHash);
  });
  afterEach(async () => {
    await db.delete(Users);
  });

  it("should allow login with valid credentials", async () => {
    const response = await client.auth.login.$post({
      json: {
        email: TEST_USER_BASIC.email,
        password: TEST_USER_BASIC.password,
      },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("role", TEST_USER_BASIC.role);
    expect(data).toHaveProperty("name", TEST_USER_BASIC.nome);
  });

  it("should reject login with invalid password", async () => {
    const response = await client.auth.login.$post({
      json: {
        email: TEST_USER_BASIC.email,
        password: "WrongPassword123!",
      },
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Usuário ou senha inválidos.");
  });

  it("should reject login with non-existent email", async () => {
    const response = await client.auth.login.$post({
      json: {
        email: "nonexistent@example.com",
        password: TEST_USER_BASIC.password,
      },
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toHaveProperty("message", "Usuário ou senha inválidos.");
  });

  it("should validate login inputs", async () => {
    const response = await client.auth.login.$post({
      json: {
        email: "not-an-email",
        password: TEST_USER_BASIC.password,
      },
    });

    expect(response.status).toBe(400);
  });
});
