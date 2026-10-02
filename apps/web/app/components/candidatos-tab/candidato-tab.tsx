import { useCandidatos } from "@/hooks/candidato.hooks"
import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { TabsContent } from "../ui/tabs"
import { HomeTableCandidatos } from "."

interface CandidatosTabProps {
  type: "mestrado" | "doutorado"
  searchQuery: string
}

export default function CandidatoTab({ type, searchQuery }: CandidatosTabProps) {
  const candidatosQuery = useCandidatos()
  const candidatosData =
    type === "mestrado" ? candidatosQuery.data?.mestrado : candidatosQuery.data?.doutorado

  if (candidatosQuery.isLoading) {
    return <CandidatosTabLoading />
  }

  if (candidatosQuery.isError) {
    return <CandidatosTabError error={candidatosQuery.error} />
  }

  if (!candidatosData || candidatosData.length === 0) {
    return (
      <TabsContent value={`candidatos-${type}`}>
        <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
          Nenhum candidato encontrado.
        </div>
      </TabsContent>
    )
  }

  return (
    <TabsContent value={`candidatos-${type}`}>
      <HomeTableCandidatos data={candidatosData} searchQuery={searchQuery} />
    </TabsContent>
  )
}
