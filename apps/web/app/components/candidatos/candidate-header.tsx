interface CandidateHeaderProps {
  candidato: {
    nome: string
    linhaPesquisa: string
    tipoCurso: "Mestrado" | "Doutorado"
  }
}

export default function CandidateHeader({ candidato }: CandidateHeaderProps) {
  return (
    <div className="my-4 flex flex-col gap-2 md:my-6">
      <h1 className="text-2xl font-semibold">{candidato.nome}</h1>
      <div className="flex flex-row gap-1 text-sm text-muted-foreground">
        <p>
          Candidato de {candidato.tipoCurso.toLocaleLowerCase()} - Linha de pesquisa:{" "}
          {candidato.linhaPesquisa}
        </p>
      </div>
    </div>
  )
}
