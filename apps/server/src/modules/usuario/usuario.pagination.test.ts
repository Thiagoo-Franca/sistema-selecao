import { testClient } from "hono/testing";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../index.js";
import { Users } from "../../database/schema.js";
import { fakeDeps, getFakeDb } from "../../tests/utils.js";
import { TEST_ADMIN, TEST_TEACHER, createTestUserWithPasswordHash } from "@tcc/tests";
import * as bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";

describe("Usuario Pagination", async () => {
  const db = await getFakeDb();
  const client = testClient(app(fakeDeps(db)));

  let adminToken: string;
  let teacherToken: string;

  beforeAll(async () => {
    const adminWithHash = await createTestUserWithPasswordHash(TEST_ADMIN);
    const teacherWithHash = await createTestUserWithPasswordHash(TEST_TEACHER);
    await db.insert(Users).values([adminWithHash, teacherWithHash]);

    // Login as admin
    const adminLogin = await client.auth.login.$post({
      json: { email: TEST_ADMIN.email, password: TEST_ADMIN.password },
    });
    const adminData = await adminLogin.json();
    adminToken = (adminData as { token: string }).token;

    // Login as teacher
    const teacherLogin = await client.auth.login.$post({
      json: { email: TEST_TEACHER.email, password: TEST_TEACHER.password },
    });
    const teacherData = await teacherLogin.json();
    teacherToken = (teacherData as { token: string }).token;
  });

  afterAll(async () => {
    await db.delete(Users);
  });

  beforeEach(async () => {
    // Create additional test users for pagination
    const extraUsers = [
      {
        email: "user1@test.com",
        password: "Password123!",
        nome: "User One",
        role: "TEACHER" as const,
        matricula: "101",
        ativo: true,
        school: "ICC",
        academicTitle: "PhD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user2@test.com",
        password: "Password123!",
        nome: "User Two",
        role: "TEACHER" as const,
        matricula: "102",
        ativo: true,
        school: "ICC",
        academicTitle: "PhD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "user3@test.com",
        password: "Password123!",
        nome: "User Three",
        role: "TEACHER" as const,
        matricula: "103",
        ativo: true,
        school: "ICC",
        academicTitle: "PhD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "admin2@test.com",
        password: "Password123!",
        nome: "Admin Two",
        role: "ADMIN" as const,
        matricula: "201",
        ativo: true,
        school: "ICC",
        academicTitle: "PhD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const usersWithHash = await Promise.all(
      extraUsers.map(async (u) => ({
        ...u,
        passwordHash: await bcrypt.hash(u.password, 10),
      })),
    );
    await db.insert(Users).values(usersWithHash);
  });

  afterEach(async () => {
    // Clean up extra users (keep the main test users)
    await db
      .delete(Users)
      .where(
        or(
          eq(Users.email, "user1@test.com"),
          eq(Users.email, "user2@test.com"),
          eq(Users.email, "user3@test.com"),
          eq(Users.email, "admin2@test.com"),
        ),
      );
  });

  describe("GET /usuario/all (ADMIN only)", () => {
    it("should return paginated users with default page=1, limit=10", async () => {
      const response = await client.usuario.all.$get(
        { query: {} },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
          hasPreviousPage: expect.any(Boolean),
        }),
      );
      expect(data.meta.total).toBeGreaterThanOrEqual(6); // 2 original + 4 extra
      expect(data.data.length).toBeLessThanOrEqual(10);
    });

    it("should respect custom limit", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "2" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.meta.limit).toBe(2);
      expect(data.data.length).toBeLessThanOrEqual(2);
    });

    it("should respect page parameter", async () => {
      const page1 = await client.usuario.all.$get(
        { query: { limit: "2", page: "1" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );
      const page2 = await client.usuario.all.$get(
        { query: { limit: "2", page: "2" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);

      const data1 = await page1.json();
      const data2 = await page2.json();

      expect(data1.meta.page).toBe(1);
      expect(data2.meta.page).toBe(2);
      // Page 2 should have different users
      if (data1.data.length > 0 && data2.data.length > 0) {
        expect(data1.data[0].id).not.toBe(data2.data[0].id);
      }
    });

    it("should filter by search term (nome)", async () => {
      const response = await client.usuario.all.$get(
        { query: { search: "User One" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.meta.total).toBe(1);
      expect(data.data.length).toBe(1);
      expect(data.data[0].nome).toBe("User One");
    });

    it("should filter by search term (email)", async () => {
      const response = await client.usuario.all.$get(
        { query: { search: "user2@test.com" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.meta.total).toBe(1);
      expect(data.data[0].email).toBe("user2@test.com");
    });

    it("should filter by search term (matricula)", async () => {
      const response = await client.usuario.all.$get(
        { query: { search: "103" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.meta.total).toBe(1);
      expect(data.data[0].matricula).toBe("103");
    });

    it("should sort by nome ascending (default)", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "10", sortBy: "nome", order: "asc" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      const nomes = data.data.map((u: any) => u.nome);
      const sorted = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
      expect(nomes).toEqual(sorted);
    });

    it("should sort by nome descending", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "10", sortBy: "nome", order: "desc" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      const nomes = data.data.map((u: any) => u.nome);
      const sorted = [...nomes].sort((a, b) => b.localeCompare(a, "pt-BR"));
      expect(nomes).toEqual(sorted);
    });

    it("should sort by email", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "10", sortBy: "email", order: "asc" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      const emails = data.data.map((u: any) => u.email);
      const sorted = [...emails].sort();
      expect(emails).toEqual(sorted);
    });

    it("should sort by matricula", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "10", sortBy: "matricula", order: "asc" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      const matriculas = data.data.map((u: any) => u.matricula);
      const sorted = [...matriculas].sort();
      expect(matriculas).toEqual(sorted);
    });

    it("should sort by createdAt", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "10", sortBy: "createdAt", order: "asc" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      const dates = data.data.map((u: any) => new Date(u.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
    });

    it("should return empty data for page beyond totalPages", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "2", page: "999" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual([]);
      expect(data.meta.page).toBe(999);
      expect(data.meta.hasNextPage).toBe(false);
    });

    it("should reject invalid page (0)", async () => {
      const response = await client.usuario.all.$get(
        { query: { page: "0" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(400);
    });

    it("should reject invalid limit (101)", async () => {
      const response = await client.usuario.all.$get(
        { query: { limit: "101" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(400);
    });

    it("should reject invalid sortBy", async () => {
      const response = await client.usuario.all.$get(
        { query: { sortBy: "invalid" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(400);
    });

    it("should reject TEACHER access", async () => {
      const response = await client.usuario.all.$get(
        { query: {} },
        { headers: { Authorization: `Bearer ${teacherToken}` } },
      );

      expect(response.status).toBe(403);
    });

    it("should not return passwordHash in response", async () => {
      const response = await client.usuario.all.$get(
        { query: {} },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      for (const user of data.data) {
        expect(user).not.toHaveProperty("passwordHash");
      }
    });
  });

  describe("GET /usuario/teachers (ADMIN + TEACHER)", () => {
    it("should return paginated teachers", async () => {
      const response = await client.usuario.teachers.$get(
        { query: { limit: "10" } },
        { headers: { Authorization: `Bearer ${teacherToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");
      expect(Array.isArray(data.data)).toBe(true);
      // Should include both teachers and admins
      expect(data.meta.total).toBeGreaterThanOrEqual(4); // 2 original + 2 extra teachers + 1 extra admin
    });

    it("should allow TEACHER access", async () => {
      const response = await client.usuario.teachers.$get(
        { query: {} },
        { headers: { Authorization: `Bearer ${teacherToken}` } },
      );

      expect(response.status).toBe(200);
    });

    it("should filter teachers by search", async () => {
      const response = await client.usuario.teachers.$get(
        { query: { search: "User" } },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.meta.total).toBe(3); // User One, User Two, User Three
    });

    it("should not return passwordHash in response", async () => {
      const response = await client.usuario.teachers.$get(
        { query: {} },
        { headers: { Authorization: `Bearer ${teacherToken}` } },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      for (const user of data.data) {
        expect(user).not.toHaveProperty("passwordHash");
      }
    });
  });
});