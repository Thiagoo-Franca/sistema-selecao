import { capitalizarNomeCompleto } from "@/lib/format"
import type { InsertUser } from "@tcc/server"
import { ChevronUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

interface HomeTableProfessoresProps {
  data: any[]
  searchQuery: string
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
}

const LABELS = [
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  {
    key: "areas",
    label: "Áreas",
    hiddenOnMobile: true,
  },
]

export default function ProfessoresTab({
  data,
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
}: HomeTableProfessoresProps) {
  const navigate = useNavigate()

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
      <div className="grid w-full grid-cols-[2fr_1fr_1fr] gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-[1fr_1fr_2fr] md:gap-4 md:px-8 md:py-3">
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
        {sortedProfessores?.length > 0 ? (
          sortedProfessores.map((professor: InsertUser) => (
            <div
              className="grid w-full cursor-pointer grid-cols-2 items-center gap-4 rounded-lg border border-transparent bg-white px-0 py-3 text-sm shadow-sm transition-all hover:border-blue-200 hover:shadow-md md:flex md:px-4"
              key={professor.id}
              onClick={() => navigate(`/admin/users/${professor.id}`)}
            >
              <div className="w-full font-medium text-neutral-900 md:w-1/4">
                {capitalizarNomeCompleto(professor.nome ?? "")}
              </div>

              <div className="flex w-full text-sm text-neutral-500 md:w-1/4">{professor.email}</div>
              <div className="hidden w-full text-sm text-neutral-500 md:flex md:w-1/2">
                {professor.areas &&
                  professor.areas.length > 0 &&
                  professor.areas.map((area) => (
                    <div className="w-full text-sm text-neutral-500">{area}</div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-black">Nenhum professor encontrado.</p>
          </div>
        )}
      </div>

      <span className="my-4 self-center text-sm text-muted-foreground">
        Exibindo {sortedProfessores.length} de {data.length} professores
      </span>
    </div>
  )
}
