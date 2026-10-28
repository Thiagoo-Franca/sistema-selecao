import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { LABELS } from "@/lib/constants"
import { capitalizarNomeCompleto } from "@/lib/format"
import { ChevronUp } from "lucide-react"
import type { CandidatoHome } from "@/types"
import { handleSort, removerAcentos } from "@/lib/helpers"

interface HomeTableCandidatosProps {
  data: CandidatoHome[]
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

  const [candidatos, setCandidatos] = useState(data)

  useEffect(() => {
    if (!searchQuery) {
      setCandidatos(data)
    } else {
      const buscaSemAcentos = removerAcentos(searchQuery.toLowerCase())

      const filteredData = data.filter((candidato) => {
        if (!candidato.nome) return false

        const nomeSemAcentos = removerAcentos(candidato.nome.toLowerCase())

        return nomeSemAcentos.includes(buscaSemAcentos)
      })
      setCandidatos(filteredData)
    }
  }, [searchQuery, data])

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
      <div className="grid w-full grid-cols-[2fr_1fr_1fr] gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr_2fr_2fr] md:gap-4 md:px-8 md:py-3">
        {LABELS.map((label) => (
          <div
            key={label.key}
            onClick={() => handleSort(label.key, setOrderBy, setOrder, orderBy, order)}
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
          sortedCandidatos.map((candidato: CandidatoHome) => (
            <div
              className="grid w-full cursor-pointer grid-cols-[2fr_1fr_1fr] items-center gap-4 rounded-lg border border-transparent bg-white px-0 py-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:shadow-md md:grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr_2fr_2fr] md:px-4"
              key={candidato.id}
              onClick={() => navigate(`/${candidato.tipo?.toLocaleLowerCase()}/${candidato.id}`)}
            >
              <div className="col-span-1 font-medium text-neutral-900">
                {capitalizarNomeCompleto(candidato.nome ?? "")}
              </div>
              <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                {candidato.tipo}
              </span>
              <div className="col-span-1 hidden text-sm text-neutral-500 md:flex">
                {candidato.email}
              </div>
              <div
                className={`col-span-1 text-sm ${candidato.avaliado ? "text-green-600" : "text-red-600"}`}
              >
                {candidato.avaliado ? "Sim" : "Pendente"}
              </div>
              <div className="col-span-1 hidden text-sm text-neutral-500 md:flex">
                {candidato.area1}
              </div>
              <div className="col-span-1 hidden text-sm text-neutral-500 md:flex">
                {candidato.area2}
              </div>
              <div className="col-span-1 hidden text-sm text-neutral-500 md:flex">
                {candidato.avaliador}
              </div>
              <div className="col-span-1 hidden text-sm text-neutral-500 md:flex">
                {candidato.auditor}
              </div>
            </div>
          ))
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-black">Nenhum candidato encontrado.</p>
          </div>
        )}
      </div>

      <span className="my-4 self-center text-sm text-muted-foreground">
        Exibindo {sortedCandidatos.length} de {data.length} candidatos
      </span>
    </div>
  )
}
