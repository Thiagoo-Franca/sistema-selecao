import { Search } from "lucide-react"
import { Input } from "./input"

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <div className="bg-whitx flex w-full items-center gap-1 rounded-sm border border-gray-300 px-2 shadow-sm md:max-w-md">
      <Search size={24} color="#70C8EA" strokeWidth={2} />
      <Input
        id="candidato-search"
        type="search"
        placeholder="Buscar por nome…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border-none shadow-none outline-none focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
      />
    </div>
  )
}
