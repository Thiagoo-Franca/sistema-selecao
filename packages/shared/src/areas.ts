export const AREAPGCOMP = [
  "COMPUTAÇÃO APLICADA",
  "SISTEMAS COMPUTACIONAIS",
  "ENGENHARIA DE SOFTWARE",
] as const;

export const AREAPGCOMP_LABEL: Record<(typeof AREAPGCOMP)[number], string> = {
  "COMPUTAÇÃO APLICADA": "Computação Aplicada",
  "SISTEMAS COMPUTACIONAIS": "Sistemas Computacionais",
  "ENGENHARIA DE SOFTWARE": "Engenharia de Software",
};

export const AREAS = [
  "CVIS",
  "CD",
  "ICOT",
  "SIBW",
  "IEDU",
  "ES",
  "RCSD",
  "SCTR",
  "SSEG",
] as const;

export const AREA_LABEL: Record<(typeof AREAS)[number], string> = {
  CVIS: "Computação Visual",
  CD: "Ciência de Dados",
  ICOT: "Inteligência Computacional e Otimização",
  SIBW: "Sistemas de Informação, Banco de Dados Web",
  IEDU: "Informática & Educação",
  ES: "Engenharia de Software",
  RCSD: "Redes de Computadores e Sistemas Distribuídos",
  SCTR: "Sistemas Ciberfísicos e de Tempo Real",
  SSEG: "Segurança de Sistemas e Redes",
};
