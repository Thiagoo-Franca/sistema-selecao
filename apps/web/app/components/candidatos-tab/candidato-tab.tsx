import { useCandidatos, useCandidatosDoutorado, useCandidatosMestrado } from "@/hooks"
import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { HomeTableCandidatos } from "."
import { TabsContent } from "../ui/tabs"

type TipoCandidato = "mestrado" | "doutorado"

interface CandidatosTabProps {
  tabValue: string
  type?: TipoCandidato // sem type = todos os candidatos
  searchQuery: string
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
}

export function CandidatosTab({
  tabValue,
  type,
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
}: CandidatosTabProps) {
  const todosQuery = useCandidatos()
  const mestradoQuery = useCandidatosMestrado()
  const doutoradoQuery = useCandidatosDoutorado()

  const query = { todos: todosQuery, mestrado: mestradoQuery, doutorado: doutoradoQuery }[
    type ?? "todos"
  ]

  function renderContent() {
    if (query.isLoading) return <CandidatosTabLoading />
    if (query.isError) return <CandidatosTabError error={query.error} />

    if (!query.data || query.data.length === 0) {
      return (
        <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
          Ops, nenhum candidato encontrado.
        </div>
      )
    }

    return (
      <HomeTableCandidatos
        data={query.data}
        searchQuery={searchQuery}
        orderBy={orderBy}
        order={order}
        setOrderBy={setOrderBy}
        setOrder={setOrder}
      />
    )
  }

  return <TabsContent value={tabValue}>{renderContent()}</TabsContent>
}
