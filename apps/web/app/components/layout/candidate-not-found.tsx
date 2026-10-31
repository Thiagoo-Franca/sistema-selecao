import { useNavigate } from "react-router"

import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Header } from "./header"

export default function CandidateNotFound() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-8">
      <Header className="mb-6" />
      <div className="py-20 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Candidato não encontrado</h2>
        <p className="text-muted-foreground">
          O candidato que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    </div>
  )
}
