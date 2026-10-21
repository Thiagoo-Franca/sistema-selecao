import { useNavigate } from "react-router"
import { Header } from "../layout/header"
import { Button } from "../ui/button"
import { ArrowLeft } from "lucide-react"
import { useEffect } from "react"

export default function CandidateNotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "SISSEL - Candidato não encontrado"
  }, [])

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="flex flex-col items-center justify-center gap-8 py-20 text-center">
        <h2 className="text-3xl font-bold">Ops! Candidato não encontrado</h2>
        <p className="text-muted-foreground">
          O candidato que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="hover:cursor-pointer">
          <ArrowLeft className="text mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    </div>
  )
}
