import { describe, expect, it } from "vitest";
import { escolherProfessor } from "./alocacao.policy.js";

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
});
