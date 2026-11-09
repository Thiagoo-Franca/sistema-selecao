import type { CandidatoMestradoComRelacoes } from "@tcc/server"

interface CandidateInfoProps {
  candidato: CandidatoMestradoComRelacoes
}

export default function CandidateInfo({ candidato }: CandidateInfoProps) {
  return (
    <div className="container mx-auto my-4 flex flex-col gap-2 md:my-6">
      <h1 className="text-2xl font-semibold">{candidato.nome}</h1>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          Avalie o candidato: {candidato.nome} - {candidato.email}
        </p>
        <p>Número de inscrição: {candidato.numeroInscricao}</p>
        <p className="text-sm text-muted-foreground">
          Áreas de interesse do candidato: {candidato.primeiraAreaPreferencia}
          {candidato.segundaAreaPreferencia ? `, ${candidato.segundaAreaPreferencia}` : null}
        </p>
        <p>
          Dados da graduação: {candidato.universidade} - {candidato.curso} -{" "}
          {candidato.cidadeGraduacao}
        </p>
      </div>
    </div>
  )
}
