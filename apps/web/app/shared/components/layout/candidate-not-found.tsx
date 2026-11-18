import { ButtonBack } from "../../ui/button-back"

export default function CandidateNotFound() {
  return (
    <div className="py-20 text-center">
      <h2 className="mb-4 text-2xl font-semibold">Ops! Candidato não encontrado</h2>
      <p className="text-muted-foreground">
        O candidato que você está procurando não existe ou foi removido.
      </p>
      <ButtonBack className="mt-4" />
    </div>
  )
}
