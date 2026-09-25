import { TabsContent } from "../ui/tabs"

export default function CandidatosTabError({ error }: { error: Error }) {
  return (
    <TabsContent value="candidatos">
      <div className="p-4 text-red-600">
        Erro ao carregar candidatos: {error.message || "Erro desconhecido"}
      </div>
    </TabsContent>
  )
}
