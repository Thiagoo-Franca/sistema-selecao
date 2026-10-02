import { useCandidatos } from "@/hooks/candidato.hooks"
import { TabsContent } from "../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { href, useNavigate } from "react-router"
import type { CandidatoDoutoradoComRelacoes, CandidatoMestradoComRelacoes } from "@tcc/server"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { useEffect, useState } from "react"

const LABELS = [
  {
    key: "nome",
    label: "Nome",
  },
  {
    key: "tipoCurso",
    label: "Nível",
  },
  {
    key: "linhaPesquisa",
    label: "Linha de Pesquisa",
  },
  {
    key: "avaliado",
    label: "Avaliado",
  },
]

export function HomeTableCandidatos(props: {
  data: (CandidatoMestradoComRelacoes | CandidatoDoutoradoComRelacoes)[]
  type?: "mestrado" | "doutorado"
  searchQuery: string
}) {
  const navigate = useNavigate()

  const goToViewCandidato = (tipo: "mestrado" | "doutorado", candidatoId: string | number) => {
    navigate(href(`/${tipo}/:id`, { id: String(candidatoId) }))
  }

  const [candidatos, setCandidatos] = useState(props.data)

  const removerAcentos = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }
  /*
  const getSortIcon = (columnKey: string) => {
    if (props.sortField !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return props.sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }*/

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  useEffect(() => {
    if (!props.searchQuery) {
      setCandidatos(props.data)
    } else {
      const buscaSemAcentos = removerAcentos(props.searchQuery.toLowerCase())

      const filteredData = props.data.filter((candidato) => {
        const nomeSemAcentos = removerAcentos(candidato.nome.toLowerCase())

        const linhaPesquisaSemAcentos = removerAcentos(candidato.linhaPesquisa.toLowerCase())

        return (
          nomeSemAcentos.includes(buscaSemAcentos) ||
          linhaPesquisaSemAcentos.includes(buscaSemAcentos)
        )
      })
      setCandidatos(filteredData)
    }
  }, [props.searchQuery, props.data])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="grid w-full grid-cols-4 gap-4 px-8 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {LABELS.map((label) => (
          <div key={label.key}>{label.label}</div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-2">
        {candidatos?.length > 0 ? (
          candidatos.map((candidato) => (
            <div
              className="grid w-full cursor-pointer grid-cols-4 items-center gap-4 rounded-lg border border-transparent bg-white px-4 py-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
              key={candidato.id}
              onClick={() =>
                goToViewCandidato(
                  candidato.tipoCurso.toLowerCase() as "mestrado" | "doutorado",
                  candidato.id
                )
              }
            >
              <div className="col-span-1 font-medium text-neutral-900">{candidato.nome}</div>
              <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                {candidato.tipoCurso}
              </span>
              <div className="col-span-1 text-sm text-neutral-500">{candidato.linhaPesquisa}</div>
              <div
                className={`col-span-1 text-sm ${candidato.avaliado ? "text-green-600" : "text-gray-500"}`}
              >
                {candidato.avaliado ? "Sim" : "Pendente"}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhum candidato encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CandidatosTabProps {
  searchQuery: string
}

export function CandidatosTab(props: CandidatosTabProps) {
  const candidatosQuery = useCandidatos()

  if (candidatosQuery.isLoading) {
    return <CandidatosTabLoading />
  }

  if (candidatosQuery.isError) {
    return <CandidatosTabError error={candidatosQuery.error} />
  }

  const candidatos = [
    ...(candidatosQuery.data?.mestrado || []),
    ...(candidatosQuery.data?.doutorado || []),
  ]

  if (!candidatosQuery.data || candidatos?.length === 0) {
    return (
      <TabsContent value="candidatos">
        <div className="p-4 text-gray-600">Nenhum candidato encontrado.</div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value="candidatos">
      <HomeTableCandidatos data={candidatos} searchQuery={props.searchQuery} />
    </TabsContent>
  )
}
