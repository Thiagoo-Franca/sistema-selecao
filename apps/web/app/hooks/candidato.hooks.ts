import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services/apiClient"
import { rpcReturn } from "@/lib/utils"
import { toast } from "sonner"
import type {
  CandidatoDoutoradoComRelacoes,
  CandidatoMestradoComRelacoes,
  InsertNotaMestrado,
} from "@tcc/server"

export const useCandidatos = () => {
  return useQuery({
    queryKey: ["candidatos", "lista"],
    queryFn: async () => {
      const response = await apiClient.candidato.$get()
      return rpcReturn(response)
    },
  })
}

export const useCandidatosMestrado = () => {
  return useQuery({
    queryKey: ["candidatos", "mestrado"],
    queryFn: async () => {
      const response = await apiClient.candidato.mestrado.$get()
      return rpcReturn(response)
    },
  })
}

export const useCandidatosDoutorado = () => {
  return useQuery({
    queryKey: ["candidatos", "doutorado"],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado.$get()
      return rpcReturn(response)
    },
  })
}

export const useCandidatoMestradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoMestrado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.mestrado[":id"].$get({
        param: { id: String(id) }, // param, não query
      })
      return rpcReturn(response) as unknown as CandidatoMestradoComRelacoes | null
    },
    enabled: !!id,
  })
}

export const useCandidatoDoutoradoById = (id: string | number) => {
  return useQuery({
    queryKey: ["candidatoDoutorado", id],
    queryFn: async () => {
      const response = await apiClient.candidato.doutorado[":id"].$get({
        param: { id: String(id) }, // param, não query
      })
      return rpcReturn(response) as unknown as CandidatoDoutoradoComRelacoes | null
    },
    enabled: !!id,
  })
}

/*
export const useUpdateCandidatoDoutorado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: Partial<CandidatoDoutorado> }) => {
      const response = await apiClient.candidato.doutorado[":id"].$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as CandidatoDoutorado
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos", "doutorado"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoDoutorado", variables.id] })
      toast.success("Candidato de doutorado atualizado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar candidato de doutorado: ${error.message}`)
    },
  })
}

export const useUpdateCandidatoDoutoradoNota = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: Partial<NotaDoutorado | any> }) => {
      const response = await apiClient.candidato.doutorado[":id"].nota.$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as NotaDoutorado | any
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos", "doutorado"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoDoutorado", variables.id] })
      toast.success("Nota do candidato de doutorado atualizada com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar nota do candidato de doutorado: ${error.message}`)
    },
  })
}
*/
export const useUpdateCandidatoMestrado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string | number
      body: Partial<CandidatoMestradoComRelacoes>
    }) => {
      const response = await apiClient.candidato.mestrado[":id"].$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as CandidatoMestradoComRelacoes
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoMestrado", variables.id] })
      toast.success("Candidato de mestrado atualizado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar candidato de mestrado: ${error.message}`)
    },
  })
}

export const useUpdateCandidatoMestradoNota = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { id: string | number; body: Partial<InsertNotaMestrado | any> }) => {
      const response = await apiClient.candidato.mestrado[":id"].nota.$patch({
        param: { id: String(data.id) },
        json: data.body,
      })
      return rpcReturn(response) as unknown as InsertNotaMestrado | any
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.invalidateQueries({ queryKey: ["candidatoMestrado", variables.id] })
      toast.success("Nota do candidato de mestrado atualizada com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar nota do candidato de mestrado: ${error.message}`)
    },
  })
}

export const useDeleteCandidatoMestrado = (id: string | number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.candidato.mestrado[":id"].$delete({
        param: { id: String(id) },
      })
      return rpcReturn(response) as unknown as { message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.removeQueries({ queryKey: ["candidatoMestrado", id] })
      toast.success("Candidato de mestrado deletado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao deletar candidato de mestrado: ${error.message}`)
    },
  })
}

/*
export const useDeleteCandidatoDoutorado = (id: string | number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.candidato.doutorado[":id"].$delete({
        param: { id: String(id) },
      })
      return rpcReturn(response) as unknown as { message: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.removeQueries({ queryKey: ["candidatoDoutorado", id] })
      toast.success("Candidato de doutorado deletado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao deletar candidato de doutorado: ${error.message}`)
    },
  })
}

*/

const COLUNAS = [
  "primeiraAreaPreferencia",
  "segundaAreaPreferencia",
  "numeroInscricao",
  "cpf",
  "nome",
  "email",
  "cidadeResidencia",
  "solicitouIsencaoTaxaInscricao",
  "isencaoAprovada",
  "gruLink",
  "homologa",
  "universidade",
  "curso",
  "cidadeGraduacao",
  "especiais",
  "cotas",
  "supra",
] as const

const NOTAS = [
  { chave: "gradLink", tipo: "link" },
  { chave: "area", tipo: "numero" },
  { chave: "enade", tipo: "numero" },
  { chave: "a1a2a3a4Link", tipo: "link" },
  { chave: "b1b2b3b4Link", tipo: "link" },
  { chave: "icItLink", tipo: "link" },
  { chave: "poscompLink", tipo: "link" },
  { chave: "disciplinaPosCapes6MaisLink", tipo: "link" },
  { chave: "disciplinaPosCapes3a5Link", tipo: "link" },
] as const

const TOTAL_COLUNAS = COLUNAS.length + NOTAS.length

const HYPERLINK = /^=HYPERLINK\(\s*"([^"]*)"\s*[;,]\s*"([^"]*)"\s*\)$/i

type CandidatoBase = Record<(typeof COLUNAS)[number], string | null>
type Notas = Record<
  Exclude<(typeof NOTAS)[number]["chave"], "area" | "enade"> | "enadeLink",
  string | null
> & { area: number | null; enade: number | null }

export type CandidatoMestradoUpload = CandidatoBase & { notas: Notas }

// Células copiadas do Excel/Sheets podem vir como "=HYPERLINK(""url""; ""txt"")"
function limpaCelula(cell?: string): string {
  const v = (cell ?? "").trim()
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/""/g, '"').trim()
  }
  return v
}

export function parseHyperlink(cell?: string): { link: string | null; texto: string | null } {
  const v = (cell ?? "").trim()
  if (!v) return { link: null, texto: null }

  const m = v.match(HYPERLINK)
  if (!m) return { link: null, texto: v } // célula comum

  const link = /^https?:\/\//i.test(m[1]) ? m[1] : null // "NÃO SE APLICA" não é link
  return { link, texto: m[2].trim() || null }
}

export function parseNumero(texto: string | null): number | null {
  if (!texto) return null
  const n = Number(texto.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

export function parseCandidatosMestrado(text: string): CandidatoMestradoUpload[] {
  const candidatos: CandidatoMestradoUpload[] = []

  text
    .split(/\r?\n/)
    .filter((linha) => linha.trim() !== "")
    .forEach((linha, idx) => {
      const celulas = linha.split("\t").map(limpaCelula)

      // ignora a linha de cabeçalho colada junto (numeroInscricao não numérico)
      const numeroInscricao = celulas[COLUNAS.indexOf("numeroInscricao")]
      if (!/^\d+$/.test(numeroInscricao ?? "")) return

      if (celulas.length > TOTAL_COLUNAS) {
        throw new Error(
          `Linha ${idx + 1}: esperado no máximo ${TOTAL_COLUNAS} colunas, veio ${celulas.length}`
        )
      }

      const candidato = {} as CandidatoBase
      COLUNAS.forEach((coluna, i) => {
        const { link, texto } = parseHyperlink(celulas[i])
        candidato[coluna] = link ?? texto
      })

      const notas = {} as Notas
      NOTAS.forEach(({ chave, tipo }, i) => {
        const { link, texto } = parseHyperlink(celulas[COLUNAS.length + i])

        if (chave === "enade") {
          notas.enade = parseNumero(texto) // nota
          notas.enadeLink = link // url do e-MEC
          return
        }

        if (tipo === "numero") {
          notas[chave as "area"] = parseNumero(texto)
        } else {
          notas[chave as Exclude<typeof chave, "area" | "enade">] = link // só URL válida
        }
      })

      candidatos.push({ ...candidato, notas })
    })

  return candidatos
}

export function useUploadCandidatosMestrado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (candidatos: CandidatoMestradoUpload[]) => {
      const response = await apiClient.candidato.mestrado.$post({ json: candidatos })
      return rpcReturn(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidatos"] })
      queryClient.removeQueries({ queryKey: ["candidatoMestrado"] })
      toast.success("Candidatos de mestrado adicionados com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar candidatos: ${error.message}`)
    },
  })
}
