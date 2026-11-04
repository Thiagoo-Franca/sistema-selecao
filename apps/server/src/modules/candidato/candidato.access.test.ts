import { describe, expect, it } from "vitest";
import { podeAcessarCandidato } from "./candidato.access.js";

const candidato = {
  avaliadorId: "avaliador-id",
  auditorId: "auditor-id",
};

describe("podeAcessarCandidato", () => {
  it.each([
    ["ADMIN", "outro-id"],
    ["TEACHER", "avaliador-id"],
    ["TEACHER", "auditor-id"],
  ] as const)("permite %s %s", (role, id) => {
    expect(podeAcessarCandidato({ role, id }, candidato)).toBe(true);
  });

  it("nega professor sem vínculo", () => {
    expect(
      podeAcessarCandidato(
        { role: "TEACHER", id: "outro-id" },
        candidato,
      ),
    ).toBe(false);
  });
});
