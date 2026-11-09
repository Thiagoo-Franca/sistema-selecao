import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { app } from "../../index.js";
import {
  CandidatoDoutorado,
  CandidatoMestrado,
  NotaDoutorado,
  NotaMestrado,
  Users,
} from "../../database/schema.js";
import { fakeDeps, getFakeDb } from "../../tests/utils.js";
import { createTestUserWithPasswordHash, type TestUserData } from "@tcc/tests";

const password = "Password123!";
const baseUser: Omit<TestUserData, "email" | "nome" | "role"> = {
  password,
  matricula: "123",
  ativo: true,
  school: "ICC",
  academicTitle: "PhD",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("nota authorization", () => {
  let db: Awaited<ReturnType<typeof getFakeDb>>;
  let application: ReturnType<typeof app>;

  beforeAll(async () => {
    db = await getFakeDb();
    await db.execute(sql`
      alter table nota_doutorado
      add column if not exists historico_mestrado text
    `);
    await db.execute(sql`
      alter table nota_doutorado
      add column if not exists area numeric
    `);
    await db.execute(sql`
      alter table nota_doutorado
      add column if not exists a1a2a3a4_link text
    `);
    await db.execute(sql`
      alter table nota_doutorado
      add column if not exists b1b2b3b4_link text
    `);
    application = app(fakeDeps(db));
  });

  beforeEach(async () => {
    await db.delete(NotaMestrado);
    await db.delete(NotaDoutorado);
    await db.delete(CandidatoMestrado);
    await db.delete(CandidatoDoutorado);
    await db.delete(Users);
  });

  async function createUser(
    email: string,
    role: "ADMIN" | "TEACHER",
    nome: string,
  ) {
    const [user] = await db
      .insert(Users)
      .values(
        await createTestUserWithPasswordHash({
          ...baseUser,
          email,
          nome,
          role,
        }),
      )
      .returning({ id: Users.id });
    return user.id;
  }

  async function tokenFor(email: string) {
    const response = await application.request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    expect(response.status).toBe(200);
    return (await response.json()).token as string;
  }

  async function createMestrado() {
    const adminId = await createUser("admin-m@test.com", "ADMIN", "Admin");
    const avaliadorId = await createUser(
      "avaliador-m@test.com",
      "TEACHER",
      "Avaliador",
    );
    const auditorId = await createUser(
      "auditor-m@test.com",
      "TEACHER",
      "Auditor",
    );
    const outroId = await createUser(
      "outro-m@test.com",
      "TEACHER",
      "Outro",
    );
    const [candidato] = await db
      .insert(CandidatoMestrado)
      .values({
        nome: "Candidato Mestrado",
        avaliadorId,
        auditorId,
      })
      .returning({ id: CandidatoMestrado.id });
    await db.insert(NotaMestrado).values({ idCandidato: candidato.id });
    return {
      adminId,
      avaliadorId,
      auditorId,
      outroId,
      id: candidato.id,
    };
  }

  async function createDoutorado() {
    const adminId = await createUser("admin-d@test.com", "ADMIN", "Admin");
    const avaliadorId = await createUser(
      "avaliador-d@test.com",
      "TEACHER",
      "Avaliador",
    );
    const auditorId = await createUser(
      "auditor-d@test.com",
      "TEACHER",
      "Auditor",
    );
    const outroId = await createUser(
      "outro-d@test.com",
      "TEACHER",
      "Outro",
    );
    const id = randomUUID();
    await db.execute(sql`
      insert into candidato_doutorado (
        id,
        nome,
        primeira_opcao_orientador,
        segunda_opcao_orientador,
        terceira_opcao_orientador,
        nome_universidade_mestrado,
        nome_curso_mestrado,
        historico_graduacao,
        copia_diploma_mestrado,
        historico_mestrado,
        anteprojeto_tese,
        avaliador_id,
        auditor_id
      ) values (
        ${id},
        'Candidato Doutorado',
        'Orientador 1',
        'Orientador 2',
        'Orientador 3',
        'UFBA',
        'Computação',
        'historico.pdf',
        'diploma.pdf',
        'historico-mestrado.pdf',
        'anteprojeto.pdf',
        ${avaliadorId},
        ${auditorId}
      )
    `);
    await db
      .insert(NotaDoutorado)
      .values({ idCandidato: id, historicoMestradoLink: "historico.pdf" });
    return {
      adminId,
      avaliadorId,
      auditorId,
      outroId,
      id,
    };
  }

  it.each([
    ["ADMIN", "admin-m@test.com"],
    ["avaliador", "avaliador-m@test.com"],
    ["auditor", "auditor-m@test.com"],
  ])("allows %s to update master's note", async (_label, email) => {
    const candidate = await createMestrado();
    const response = await application.request(
      `/candidato/mestrado/${candidate.id}/nota`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${await tokenFor(email)}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ grad: 8 }),
      },
    );
    expect(response.status).toBe(200);
  });

  it.each([
    ["ADMIN", "admin-d@test.com"],
    ["avaliador", "avaliador-d@test.com"],
    ["auditor", "auditor-d@test.com"],
  ])("allows %s to update doctorate's note", async (_label, email) => {
    const candidate = await createDoutorado();
    const response = await application.request(
      `/candidato/doutorado/${candidate.id}/nota`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${await tokenFor(email)}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ msc: 8 }),
      },
    );
    expect(response.status).toBe(200);
  });

  it.each([
    ["mestrado", createMestrado, "/candidato/mestrado", "grad"],
    ["doutorado", createDoutorado, "/candidato/doutorado", "msc"],
  ] as const)("rejects an unrelated teacher for %s", async (_label, create, path, field) => {
    const candidate = await create();
    const email = `outro-${_label === "mestrado" ? "m" : "d"}@test.com`;
    const before = _label === "mestrado"
      ? await db.select().from(NotaMestrado)
      : await db.select().from(NotaDoutorado);
    const response = await application.request(`${path}/${candidate.id}/nota`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${await tokenFor(email)}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ [field]: 8 }),
    });
    expect(response.status).toBe(404);
    const after = _label === "mestrado"
      ? await db.select().from(NotaMestrado)
      : await db.select().from(NotaDoutorado);
    expect(after).toEqual(before);
  });

  it.each([
    [createMestrado, "/candidato/mestrado"],
    [createDoutorado, "/candidato/doutorado"],
  ] as const)("rejects missing token", async (create, path) => {
    const candidate = await create();
    const response = await application.request(`${path}/${candidate.id}/nota`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grad: 8 }),
    });
    expect(response.status).toBe(401);
  });

  it("rejects malformed candidate ids before reaching the service", async () => {
    await createMestrado();
    const token = await tokenFor("admin-m@test.com");
    const response = await application.request(
      "/candidato/mestrado/not-a-uuid/nota",
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ grad: 8 }),
      },
    );
    expect(response.status).toBe(400);
  });
});
