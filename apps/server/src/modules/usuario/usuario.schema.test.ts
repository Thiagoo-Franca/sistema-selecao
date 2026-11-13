import { describe, expect, it } from "vitest";
import { updateUserSchema } from "./usuario.schema.js";

const adminBody = updateUserSchema.shape.body;
const meBody = adminBody.omit({ role: true, areas: true });

describe("updateUserSchema.body (PUT /usuario/:id)", () => {
  it("aceita áreas válidas e remove duplicadas", () => {
    const result = adminBody.safeParse({ areas: ["CD", "ES", "CD"] });
    expect(result.success).toBe(true);
    expect(result.data?.areas).toEqual(["CD", "ES"]);
  });

  it("aceita lista vazia de áreas", () => {
    const result = adminBody.safeParse({ areas: [] });
    expect(result.success).toBe(true);
    expect(result.data?.areas).toEqual([]);
  });

  it("rejeita área inexistente", () => {
    expect(adminBody.safeParse({ areas: ["XYZ"] }).success).toBe(false);
  });

  it("mantém áreas opcional em atualização parcial", () => {
    const result = adminBody.safeParse({ nome: "Fulano" });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("areas");
  });
});

describe("PUT /usuario/me", () => {
  it("não repassa áreas nem função editadas pelo próprio usuário", () => {
    const result = meBody.safeParse({ nome: "Fulano", areas: ["CD"], role: "ADMIN" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ nome: "Fulano" });
  });
});
