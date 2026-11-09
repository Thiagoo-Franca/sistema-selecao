import { describe, expect, it } from "vitest";
import {
  escolherAvaliadorEAuditor,
  escolherProfessor,
  registrarAlocacao,
} from "./alocacao.policy.js";

describe("escolherProfessor", () => {
  const professores = [
    { id: "b", carga: 1, areas: ["CVIS"] },
    { id: "a", carga: 1, areas: ["CVIS", "ES"] },
    { id: "c", carga: 0, areas: ["ES"] },
  ];

  it("prioritizes area and then lowest load", () => {
    expect(escolherProfessor(professores, "CVIS")).toBe("a");
  });

  it("uses identifier ordering as deterministic tie breaker", () => {
    expect(escolherProfessor(professores, "CVIS", ["a"])).toBe("b");
  });

  it("falls back to any area when no area is provided", () => {
    expect(escolherProfessor(professores, null, ["c"])).toBe("a");
  });

  it("falls back to any active professor for the evaluator", () => {
    expect(escolherAvaliadorEAuditor(professores, ["SSEG"])).toEqual({
      avaliadorId: "c",
      auditorId: "a",
    });
  });

  it("keeps evaluator and auditor distinct and balances the next candidate", () => {
    const carga = [
      { id: "a", carga: 0, areas: ["CD"] },
      { id: "b", carga: 0, areas: ["CD"] },
      { id: "c", carga: 0, areas: ["CD"] },
    ];

    const first = escolherAvaliadorEAuditor(carga, ["CD"]);
    registrarAlocacao(carga, first);
    const second = escolherAvaliadorEAuditor(carga, ["CD"]);

    expect(first).toEqual({ avaliadorId: "a", auditorId: "b" });
    expect(second).toEqual({ avaliadorId: "c", auditorId: "a" });
  });

  it("uses the least-loaded professor outside the area only when no area auditor exists", () => {
    expect(
      escolherAvaliadorEAuditor(
        [
          { id: "a", carga: 0, areas: ["CD"] },
          { id: "b", carga: 2, areas: ["CD"] },
          { id: "c", carga: 0, areas: ["ES"] },
        ],
        ["CD"],
      ),
    ).toEqual({ avaliadorId: "a", auditorId: "b" });

    expect(
      escolherAvaliadorEAuditor(
        [
          { id: "a", carga: 0, areas: ["CD"] },
          { id: "c", carga: 0, areas: ["ES"] },
        ],
        ["CD"],
      ),
    ).toEqual({ avaliadorId: "a", auditorId: "c" });
  });
});
