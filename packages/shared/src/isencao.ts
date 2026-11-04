export const ISENCAO_STATUS = ["sim", "nao", "nao-solicitou"] as const;

export const ISENCAO_LABEL: Record<(typeof ISENCAO_STATUS)[number], string> = {
  sim: "Sim",
  nao: "Nao",
  "nao-solicitou": "Nao solicitou",
};
