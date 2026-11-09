export const ISENCAO_STATUS = [
  "sim",
  "nao",
  "nao-solicitou",
  "nao-avaliado",
] as const;

export const ISENCAO_LABEL: Record<(typeof ISENCAO_STATUS)[number], string> = {
  sim: "Sim",
  nao: "Nao",
  "nao-solicitou": "Nao solicitou",
  "nao-avaliado": "Nao avaliado",
};

export function parseSolicitouIsencao(raw: string | null | undefined) {
  const valor = raw?.trim() ?? "";
  const naoSolicitou = valor === "" || /^n[aã]o\s+solicitou$/i.test(valor);
  return {
    solicitouIsencaoTaxaInscricao: !naoSolicitou,
    isencaoComprovanteLink: naoSolicitou ? null : valor,
  };
}
