import { describe, expect, it } from "vitest";
import { updateCandidatoDoutoradoSchema } from "./candidato.schema.js";

describe("updateCandidatoDoutoradoSchema", () => {
  it("mantém universidade e curso do mestrado com os nomes das colunas", () => {
    const result = updateCandidatoDoutoradoSchema.parse({
      nomeUniversidadeMestrado: "UFRJ",
      nomeCursoMestrado: "Engenharia",
    });
    expect(result).toEqual({
      nomeUniversidadeMestrado: "UFRJ",
      nomeCursoMestrado: "Engenharia",
    });
  });
});
