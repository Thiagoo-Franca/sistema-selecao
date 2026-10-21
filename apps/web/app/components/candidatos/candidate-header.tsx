interface CandidateHeaderProps {
  candidato: {
    nome: string | null
    tipoCurso: "Mestrado" | "Doutorado"
  }
}

export default function CandidateHeader({ candidato }: CandidateHeaderProps) {
  return (
    <div className="my-4 flex flex-col gap-2 md:my-6">
      <h1 className="text-2xl font-semibold">{candidato.nome ?? "Nome não informado"}</h1>
      <div className="flex flex-row gap-1 text-sm text-muted-foreground">
        <p>Candidato {candidato.tipoCurso.toLocaleLowerCase()}</p>
      </div>
    </div>
  )
}
