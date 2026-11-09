import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
    </div>
  )
}
