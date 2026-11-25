import { describe, expect, it } from "vitest";
import { uploadCandidatosDoutoradoSchema } from "./importacao.schema.js";

const candidatoDoutorado = {
  numeroInscricao: "123",
  nome: "Candidata",
  historicoMestradoLink: "https://exemplo.com/historico.pdf",
  nomeUniversidadeMestrado: "UFBA",
  nomeCursoMestrado: "Computação",
};

describe("uploadCandidatosDoutoradoSchema", () => {
  it("aceita notas vazias (null) vindas da planilha", () => {
    const result = uploadCandidatosDoutoradoSchema.safeParse([
      {
        ...candidatoDoutorado,
        notas: {
          msc: null,
          areaFormacaoGraduacao: null,
          conceitoCapesMestrado: null,
          notaAnteprojeto: null,
        },
      },
    ]);
    expect(result.success).toBe(true);
  });

  it("mantém os links dos comprovantes das notas", () => {
    const notas = {
      msc: 8.5,
      conceitoCapesMestradoLink: "https://exemplo.com/capes",
      a1a2a3a4Link: "https://exemplo.com/a1",
      b1b2b3b4Link: "https://exemplo.com/b1",
    };
    const result = uploadCandidatosDoutoradoSchema.parse([
      { ...candidatoDoutorado, notas },
    ]);
    expect(result[0].notas).toEqual(notas);
  });

  it("não aceita campos de sistema nas notas", () => {
    const [candidato] = uploadCandidatosDoutoradoSchema.parse([
      { ...candidatoDoutorado, notas: { notaFinal: 10, avaliado: true } },
    ]);
    expect(candidato.notas).toEqual({});
  });
});
