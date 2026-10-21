import { Header } from "../layout/header"
import CandidateActions from "./candidate-actions"
import CandidateHeader from "./candidate-header"
import SectionContent from "./section-content"

interface CandidateDetailsProps {
  user: {
    role: "STUDENT" | "TEACHER" | "ADMIN"
  }
  candidato: {
    id: string
    email: string | null
    nome: string | null
    tipoCurso: "Doutorado" | "Mestrado"
  }
  handleDelete?: () => void
  deleteCandidatoMutation?: any
  SECTION_CONTENT: {
    title: string
    content: {
      label: string
      value: string | boolean | number | null | undefined
      link?: boolean
    }[]
  }[]
}

export default function CandidateDetails({
  user,
  candidato,
  handleDelete,
  deleteCandidatoMutation,
  SECTION_CONTENT,
}: CandidateDetailsProps) {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <CandidateActions
        user={user}
        candidato={candidato}
        handleDelete={handleDelete}
        deleteCandidatoMutation={deleteCandidatoMutation}
      />
      <CandidateHeader candidato={candidato} />
      {SECTION_CONTENT.map((section, index) => (
        <SectionContent key={index} title={section.title} content={section.content} />
      ))}
    </div>
  )
}
