import { useCandidatos } from "@/hooks/candidato.hooks"
import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { TabsContent } from "../ui/tabs"
import { HomeTableCandidatos } from "."

interface CandidatosTabProps {
  type: "mestrado" | "doutorado"
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
}

export default function CandidatoTab({
  type,
  searchQuery,
  sortField,
  sortOrder,
  onSort,
  rowsPerPage,
}: CandidatosTabProps) {
  const candidatosQuery = useCandidatos()
  const candidatosData =
    type === "mestrado" ? candidatosQuery.data?.mestrado : candidatosQuery.data?.doutorado

  if (candidatosQuery.isLoading) {
    return <CandidatosTabLoading />
  }

  if (candidatosQuery.isError) {
    return <CandidatosTabError error={candidatosQuery.error} />
  }

  return (
    <TabsContent value={`candidatos-${type}`}>
      <HomeTableCandidatos
        data={candidatosData}
        searchQuery={searchQuery}
        sortField={sortField}
        sortOrder={sortOrder}
        rowsPerPage={rowsPerPage}
        onSort={onSort}
      />
    </TabsContent>
  )
}
