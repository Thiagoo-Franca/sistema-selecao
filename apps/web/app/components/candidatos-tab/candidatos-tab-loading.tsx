import { Skeleton } from "../ui/skeleton"
import { TabsContent } from "../ui/tabs"

export default function CandidatosTabLoading() {
  return (
    <TabsContent value="candidatos">
      <div className="rounded-md border p-4">
        <Skeleton className="mb-2 h-8 w-full" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </TabsContent>
  )
}
