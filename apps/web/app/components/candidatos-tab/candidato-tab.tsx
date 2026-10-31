import {
  useCandidatesByTeacherId,
  useCandidatos,
  useCandidatosDoutorado,
  useCandidatosMestrado,
  useTeachers,
} from "@/hooks"

import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { HomeTableCandidatos } from "."
import { TabsContent } from "../ui/tabs"
import { useUser } from "@/services/useUser"
import ProfessoresTab from "./professores-tab"

type TabsType = "mestrado" | "doutorado" | "meus" | "professores" | undefined

interface CandidatosTabProps {
  tabValue: string
  type?: TabsType // sem type = todos os candidatos
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
  const user = useUser().data
  const todosQuery = useCandidatos()
  const mestradoQuery = useCandidatosMestrado()
  const doutoradoQuery = useCandidatosDoutorado()
  const meusCandidatosQuery = useCandidatesByTeacherId(user?.id ?? 0)
  const professoresQuery = useTeachers()

  if (!user) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
        Ops, nenhum usuário encontrado.
      </div>
    )
  }

  const candidateQuery = {
    todos: todosQuery,
    mestrado: mestradoQuery,
    doutorado: doutoradoQuery,
    meus: meusCandidatosQuery,
  }[type === "professores" ? "todos" : (type ?? "todos")]

  function renderContent() {
    if (type === "professores") {
      if (professoresQuery.isLoading) return <CandidatosTabLoading />
      if (professoresQuery.isError) {
        return <CandidatosTabError error={professoresQuery.error} />
      }

      if (!professoresQuery.data || professoresQuery.data.length === 0) {
        return (
          <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
            Ops, nenhum professor encontrado.
          </div>
        )
      }

      return (
        <ProfessoresTab
          data={professoresQuery.data}
          searchQuery={searchQuery}
          orderBy={orderBy}
          order={order}
          setOrderBy={setOrderBy}
          setOrder={setOrder}
        />
      )
    }

    if (candidateQuery.isLoading) return <CandidatosTabLoading />
    if (candidateQuery.isError) return <CandidatosTabError error={candidateQuery.error} />

    if (!candidateQuery.data || candidateQuery.data.length === 0) {
      return (
        <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
          Ops, nenhum candidato encontrado.
        </div>
      )
    }

    return (
      <HomeTableCandidatos
        data={candidateQuery.data}
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
