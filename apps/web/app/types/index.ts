export type CandidatoHome = {
  id: string
  avaliado: boolean
  avaliador: string | null
  auditor: string | null
  email: string | null
  nome: string | null
  numeroInscricao: string | null
  tipo: "Mestrado" | "Doutorado" | undefined
  area1: string | null
  area2: string | null
}
