export const GRU_OPTIONS = [
  { value: "isento", label: "ISENTO" },
  { value: "pago", label: "PAGO" },
  { value: "aberto", label: "ABERTO" },
  { value: "nao-isento", label: "NÃO ISENTO" },
  { value: "nao-pagou", label: "NÃO PAGOU" },
] as const

export const NAO_SOLICITOU = "NÃO SOLICITOU"

export const LABELS = [
  {
    key: "nome",
    label: "Nome",
  },
  {
    key: "tipoCurso",
    label: "Nível",
  },
  {
    key: "email",
    label: "Email",
    hiddenOnMobile: true,
  },
  {
    key: "avaliado",
    label: "Avaliado",
  },
  {
    key: "area1",
    label: "Área 1",
    hiddenOnMobile: true,
  },
  {
    key: "area2",
    label: "Área 2",
    hiddenOnMobile: true,
  },
  {
    key: "avaliador",
    label: "Avaliador",
    hiddenOnMobile: true,
  },
  {
    key: "auditor",
    label: "Auditor",
    hiddenOnMobile: true,
  },
]
