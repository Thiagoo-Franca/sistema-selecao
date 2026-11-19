export const TABS = [
  { value: "meus-candidatos", label: "Meus Candidatos", type: "meus", onlyAdmin: false },
  { value: "candidatos-mestrado", label: "Mestrado", type: "mestrado", onlyAdmin: false },
  { value: "candidatos-doutorado", label: "Doutorado", type: "doutorado", onlyAdmin: false },
  { value: "professores", label: "Professores", type: "professores", onlyAdmin: true },
] as const

export const GRU_OPTIONS = [
  { value: "isento", label: "ISENTO" },
  { value: "pago", label: "PAGO" },
  { value: "aberto", label: "ABERTO" },
  { value: "nao-isento", label: "NÃO ISENTO" },
  { value: "nao-pagou", label: "NÃO PAGOU" },
  { value: "nao-avaliado", label: "NÃO AVALIADO" },
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
  },
  {
    key: "avaliado",
    label: "Avaliado",
  },
  {
    key: "area1",
    label: "Área 1",
  },
  {
    key: "area2",
    label: "Área 2",
  },
  {
    key: "avaliador",
    label: "Avaliador",
  },
  {
    key: "auditor",
    label: "Auditor",
  },
]

export const LABELS_DOUTORADO = [
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
  },
  {
    key: "avaliado",
    label: "Avaliado",
  },
  {
    key: "area1",
    label: "Área PGCOMP",
  },
  {
    key: "avaliador",
    label: "Avaliador",
  },
  {
    key: "auditor",
    label: "Auditor",
  },
]
