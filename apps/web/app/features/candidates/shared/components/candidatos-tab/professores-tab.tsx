import { capitalizarNomeCompleto } from "@/shared/lib/format"
import type { InsertUser } from "@tcc/server"
import { ChevronUp } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"

interface HomeTableProfessoresProps {
  data: any[]
  searchQuery: string
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
  onSort?: (key: string) => void
}

const LABELS = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "areas", label: "Áreas" },
]

const TABLE_GRID =
  "grid w-full grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_9rem] gap-4 md:grid-cols-[1fr_1fr_2fr]"

export default function ProfessoresTab({
  data,
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
  onSort,
}: HomeTableProfessoresProps) {
  const navigate = useNavigate()
  const swipeRef = useRef({ x: 0, dragged: false })

  const [professores, setProfessores] = useState(data)

  const removerAcentos = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }

  useEffect(() => {
    if (!searchQuery) {
      setProfessores(data)
    } else {
      const buscaSemAcentos = removerAcentos(searchQuery.toLowerCase())

      const filteredData = data.filter((candidato) => {
        if (!candidato.nome) return false

        const nomeSemAcentos = removerAcentos(candidato.nome.toLowerCase())

        return nomeSemAcentos.includes(buscaSemAcentos)
      })
      setProfessores(filteredData)
    }
  }, [searchQuery, data])

  const handleSort = (key: string) => {
    setOrder?.(orderBy === key && order === "asc" ? "desc" : "asc")
    setOrderBy?.(key)
  }

  const sortedProfessores = useMemo(() => {
    if (!orderBy) return professores

    return [...professores].sort((a, b) => {
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
  }, [professores, orderBy, order])

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className="w-full cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:cursor-default md:overflow-x-visible md:active:cursor-default md:[scrollbar-width:auto] [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:block"
        onPointerDown={(event) => {
          swipeRef.current = { x: event.clientX, dragged: false }
        }}
        onPointerMove={(event) => {
          if (Math.abs(event.clientX - swipeRef.current.x) > 8) {
            swipeRef.current.dragged = true
          }
        }}
      >
        <div className="flex w-[calc(100%+5.5rem)] flex-col gap-2 md:w-full">
          <div
            className={`${TABLE_GRID} px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:px-8 md:py-3`}
          >
            {LABELS.map((label) => (
              <div
                key={label.key}
                onClick={() => {
                  if (swipeRef.current.dragged) return
                  if (onSort) {
                    onSort(label.key)
                  } else {
                    handleSort(label.key)
                  }
                }}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <ChevronUp
                  className={`inline-block h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200 md:mr-1 ${
                    orderBy === label.key && order === "asc" ? "rotate-180" : ""
                  }`}
                />
                {label.label}
              </div>
            ))}
          </div>
          <div className="flex w-full flex-col gap-2">
            {sortedProfessores?.length > 0 ? (
              sortedProfessores.map((professor: InsertUser) => (
                <div
                  className={`${TABLE_GRID} cursor-pointer items-center rounded-lg border border-transparent bg-white px-4 py-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:shadow-md`}
                  key={professor.id}
                  onClick={() => {
                    if (swipeRef.current.dragged) return
                    navigate(`/admin/users/${professor.id}`)
                  }}
                >
                  <div className="truncate font-medium text-neutral-900">
                    {capitalizarNomeCompleto(professor.nome ?? "")}
                  </div>

                  <div className="truncate text-sm text-neutral-500">{professor.email}</div>
                  <div className="flex flex-nowrap gap-x-3 text-sm text-neutral-500">
                    {professor.areas && professor.areas.length > 0
                      ? professor.areas.map((area) => (
                          <span key={area} className="whitespace-nowrap">
                            {area}
                          </span>
                        ))
                      : "—"}
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-black">Nenhum professor encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <span className="my-4 self-center text-sm text-muted-foreground">
        Exibindo {sortedProfessores.length} de {data.length} professores
      </span>
    </div>
  )
}
