import { useNavigate } from "react-router"

import { LABELS } from "@/shared/lib/constants"
import { capitalizarNomeCompleto } from "@/shared/lib/format"
import { ChevronUp } from "lucide-react"
import type { CandidatoHome } from "@/types"
import { handleSort } from "@/shared/lib/helpers"

interface HomeTableCandidatosProps {
  data: CandidatoHome[]
  searchQuery: string
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
  onSort?: (key: string) => void
}

export function HomeTableCandidatos({
  data,
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
  onSort,
}: HomeTableCandidatosProps) {
  const navigate = useNavigate()

  return (
    <div className="flex w-full flex-col gap-2 overflow-x-auto min-[1440px]:overflow-x-hidden">
      <div className="lg:min-w-auto grid min-w-[1280px] grid-cols-[1.5fr_1fr_2fr_1fr_1fr_1fr_2fr_2fr] gap-2 px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:gap-4 md:px-4 md:py-3">
        {LABELS.map((label) => (
          <div
            key={label.key}
            onClick={() => {
              if (onSort) {
                onSort(label.key)
              } else {
                handleSort(label.key, setOrderBy, setOrder, orderBy, order)
              }
            }}
            className={`flex w-full items-center gap-1 cursor-pointer`}
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
        {data?.length > 0 ? (
          data.map((candidato: CandidatoHome) => (
            <div
              className="lg:min-w-auto grid min-w-[1280px] cursor-pointer grid-cols-[1.5fr_1fr_2fr_1fr_1fr_1fr_2fr_2fr] items-center gap-4 rounded-lg border border-transparent bg-white px-2 py-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:shadow-md md:grid-cols-[1.5fr_1fr_2fr_1fr_1fr_1fr_2fr_2fr] md:px-4"
              key={candidato.id}
              onClick={() => navigate(`/${candidato.tipo?.toLocaleLowerCase()}/${candidato.id}`)}
            >
              <div className="col-span-1 font-medium text-neutral-900">
                {capitalizarNomeCompleto(candidato.nome ?? "")}
              </div>
              <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                {candidato.tipo[0].toUpperCase() + candidato.tipo.slice(1).toLowerCase()}
              </span>
              <div className="col-span-1 text-sm text-neutral-500">{candidato.email}</div>
              <div
                className={`col-span-1 flex items-center justify-center text-sm ${candidato.avaliado ? "text-green-600" : "text-red-600"}`}
              >
                {candidato.avaliado ? "Sim" : "Pendente"}
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm text-neutral-500">
                {candidato.area1}
              </div>
              <div className="col-span-1 flex items-center justify-center text-sm text-neutral-500">
                {candidato.area2}
              </div>
              <div className="col-span-1 text-sm text-neutral-500">{candidato.avaliador}</div>
              <div className="col-span-1 text-sm text-neutral-500">{candidato.auditor}</div>
            </div>
          ))
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-black">Nenhum candidato encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}