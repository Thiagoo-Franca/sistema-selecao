import { USAGE_PURPOSE_IDS } from "@tcc/shared"

export const USAGE_PURPOSE_OPTIONS = [
  { id: USAGE_PURPOSE_IDS[0], label: "Distribuir avaliadores e auditores" },
  { id: USAGE_PURPOSE_IDS[1], label: "Avaliar candidatos" },
  { id: USAGE_PURPOSE_IDS[2], label: "Auditar avaliações" },
  { id: USAGE_PURPOSE_IDS[3], label: "Consultar candidatos e avaliações" },
  { id: USAGE_PURPOSE_IDS[4], label: "Gerenciar usuários" },
  { id: USAGE_PURPOSE_IDS[5], label: "Não usaria" },
  { id: USAGE_PURPOSE_IDS[6], label: "Outro" },
] satisfies ReadonlyArray<{ id: (typeof USAGE_PURPOSE_IDS)[number]; label: string }>
