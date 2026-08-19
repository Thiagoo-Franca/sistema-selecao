import { useMutation, useQuery } from "@tanstack/react-query"
import apiClient from "@/services/apiClient"
import { rpcReturn } from "@/lib/utils"
import type { CandidatoDoutorado, CandidatoMestrado } from "@/routes/_index"
import type { CandidatoMestradoNotaEtapa1 } from "@/routes/mestrado.$id_.avaliacao"

export const useCandidatos = () => {
    return useQuery({
        queryKey: ["candidatos"],
        queryFn: async () => {
            const response = await apiClient.candidato.$get()
            return rpcReturn(response) as unknown as { mestrado: CandidatoMestrado[]; doutorado: CandidatoDoutorado[] }
        },
    })
}

export const useCandidatoMestradoById = (id: string | number) => {
    return useQuery({
        queryKey: ["candidatoMestrado", id],
        queryFn: async () => {
            const response = await apiClient.candidato.mestrado[":id"].$get({
                param: { id: String(id) }  // param, não query
            })
            return rpcReturn(response) as unknown as CandidatoMestrado | null
        },
        enabled: !!id,
    })
}

// Mestrado

export const useCalcularEtapa1 = () => {
  return useMutation({
    mutationFn: async (dados: CandidatoMestradoNotaEtapa1) => {
      const response = await apiClient.candidato.mestrado["calcular-etapa1"].$post({ json: dados })

         // debug temporário
      console.log("Status:", response.status)
      console.log("Body:", await response.text())

      
      return rpcReturn(response) as unknown as { pontuacao: number; aprovado: boolean }
    },
  })
}