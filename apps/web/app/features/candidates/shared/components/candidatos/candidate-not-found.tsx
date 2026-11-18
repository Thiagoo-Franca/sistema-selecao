import { useEffect } from "react"
import { ButtonBack } from "../../../../../shared/ui/button-back"
import { Header } from "@/shared/components/layout/header"

export default function CandidateNotFound() {
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
        <ButtonBack className="hover:cursor-pointer" />
      </div>
    </div>
  )
}
