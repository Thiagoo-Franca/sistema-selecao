import { Loader2 } from "lucide-react"
import { Header } from "./header"

export default function Loading() {
  return (
    <div className="p-4 md:p-8">
      <Header className="mb-6" />
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
      </div>
    </div>
  )
}
