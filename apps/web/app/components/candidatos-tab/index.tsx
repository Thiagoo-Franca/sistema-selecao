import { useCandidatos } from "@/hooks/candidato.hooks"
import { TabsContent } from "../ui/tabs"
import { href, useNavigate } from "react-router"
import type { CandidatoDoutoradoComRelacoes, CandidatoMestradoComRelacoes } from "@tcc/server"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { useEffect, useMemo, useState } from "react"

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
    hiddenOnMobile: true,
  },
  {
    key: "avaliado",
    label: "Avaliado",
  },
]

interface HomeTableCandidatosProps {
  data: (CandidatoMestradoComRelacoes | CandidatoDoutoradoComRelacoes)[]
  searchQuery: string
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
}

export function HomeTableCandidatos({
  data,
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
}: HomeTableCandidatosProps) {
  const navigate = useNavigate()

  const goToViewCandidato = (tipo: "mestrado" | "doutorado", candidatoId: string | number) => {
    navigate(href(`/${tipo}/:id`, { id: String(candidatoId) }))
  }

  const [candidatos, setCandidatos] = useState(data)

  const removerAcentos = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }

  useEffect(() => {
    if (!searchQuery) {
      setCandidatos(data)
    } else {
      const buscaSemAcentos = removerAcentos(searchQuery.toLowerCase())

      const filteredData = data.filter((candidato) => {
        const nomeSemAcentos = removerAcentos(candidato.nome.toLowerCase())

        const linhaPesquisaSemAcentos = removerAcentos(candidato.linhaPesquisa.toLowerCase())

        return (
          nomeSemAcentos.includes(buscaSemAcentos) ||
          linhaPesquisaSemAcentos.includes(buscaSemAcentos)
        )
      })
      setCandidatos(filteredData)
    }
  }, [searchQuery, data])

  const handleSort = (key: string) => {
    setOrder?.(orderBy === key && order === "asc" ? "desc" : "asc")
    setOrderBy?.(key)
  }

  const sortedCandidatos = useMemo(() => {
    if (!orderBy) return candidatos

    return [...candidatos].sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a]
      const bValue = b[orderBy as keyof typeof b]
      const direction = order === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return (Number(aValue) - Number(bValue)) * direction
      }

      return 0
    })
  }, [candidatos, orderBy, order])

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="grid w-full grid-cols-[2fr_1fr_1fr] gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-4 md:gap-4 md:px-8 md:py-3">
        {LABELS.map((label) => (
          <div
            key={label.key}
            onClick={() => handleSort(label.key)}
            className={`flex items-center gap-1 ${label.hiddenOnMobile ? "hidden md:flex" : ""}`}
          >
            <ChevronUp
              className={`inline-block h-4 w-4 cursor-pointer transition-transform duration-200 md:mr-1 ${
                orderBy === label.key && order === "asc" ? "rotate-180" : ""
              }`}
            />
            {label.label}
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-2">
        {sortedCandidatos?.length > 0 ? (
          sortedCandidatos.map(
            (candidato: CandidatoMestradoComRelacoes | CandidatoDoutoradoComRelacoes) => (
              <div
                className="grid w-full cursor-pointer grid-cols-[2fr_1fr_1fr] items-center gap-4 rounded-lg border border-transparent bg-white px-0 py-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:shadow-md md:grid-cols-4 md:px-4"
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
                <div className="col-span-1 hidden text-sm text-neutral-500 md:flex">
                  {candidato.linhaPesquisa}
                </div>
                <div
                  className={`col-span-1 text-sm ${candidato.avaliado ? "text-green-600" : "text-gray-500"}`}
                >
                  {candidato.avaliado ? "Sim" : "Pendente"}
                </div>
              </div>
            )
          )
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
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
}

export function CandidatosTab({
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
}: CandidatosTabProps) {
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
      <HomeTableCandidatos
        data={candidatos}
        searchQuery={searchQuery}
        orderBy={orderBy}
        order={order}
        setOrderBy={setOrderBy}
        setOrder={setOrder}
      />
    </TabsContent>
  )
}
