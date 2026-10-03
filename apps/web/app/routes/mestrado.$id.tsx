import type { Route } from "./+types/dashboard"
import { useNavigate, useParams } from "react-router"
import { useToast } from "@/hooks"
import { useEffect, useState } from "react"
import { useCandidatoMestradoById, useDeleteCandidatoMestrado } from "@/hooks/candidato.hooks"
import { useUser } from "@/services/useUser"
import { Header } from "@/components/layout/Header"
import { ArrowLeft, Loader2, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"
import { formatBoolean, formatCPF, formatDate, formatPhoneNumber } from "@/lib/format"
import SectionContent from "@/components/candidatos/section-content"
import CandidateActions from "@/components/candidatos/candidate-actions"
import CandidateHeader from "@/components/candidatos/candidate-header"
import CandidateDetails from "@/components/candidatos/candidate-details"
import CandidateNotFound from "@/components/candidatos/candidate-not-found"

export const meta: Route.MetaFunction = () => [
  {
    title: "SISSEL - Candidato de mestrado",
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Candidato de mestrado",
      description: "Página de detalhes do candidato de mestrado.",
    }),
  },
]

export default function CandidatoMestradoPage() {
  const { id } = useParams<{ id: string | undefined }>()
  const userQuery = useUser()

  const { toast } = useToast()
  const navigate = useNavigate()
  const candidatoQuery = useCandidatoMestradoById(id ?? "")
  const deleteCandidatoMutation = useDeleteCandidatoMestrado(id ?? "")
  const user = userQuery.data
  const candidato: CandidatoMestradoComRelacoes = candidatoQuery.data

  useEffect(() => {
    document.title = `SISSEL - ${candidato?.nome ?? "Candidato de mestrado"}`
  }, [candidato?.nome])

  if (id === undefined) {
    navigate("/dashboard")
    return null
  }

  if (!id || !user) {
    navigate("/")
    return
  }

  // Ainda sem funcinalidade
  const isAdmin = user?.role === "ADMIN"

  if (candidatoQuery.isLoading || userQuery.isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
        </div>
      </div>
    )
  }

  if (candidatoQuery.isError || userQuery.isError) {
    toast.error("Erro ao carregar os dados do candidato.")
    navigate("/dashboard")
    return null
  }

  if (!candidato) {
    return <CandidateNotFound />
  }

  const SECTION_CONTENT: {
    title: string
    content: { label: string; value: string | boolean | Date | null | undefined; link?: boolean }[]
  }[] = [
    {
      title: "INFORMAÇÕES DA CANDIDATURA",
      content: [
        { label: "Número de inscrição", value: candidato.numeroInscricao },
        { label: "Situação", value: candidato.status },
        { label: "Data de Inscrição", value: formatDate(candidato.dataInscricao) },
      ],
    },
    {
      title: "INFORMAÇÕES DO CANDIDATO",
      content: [
        {
          label: "CPF",
          value: formatCPF(candidato.cpf),
        },
        {
          label: "Nome",
          value: candidato.nome,
        },
        {
          label: "Sexo",
          value: candidato.sexo,
        },
        {
          label: "Estado civil",
          value: candidato.estadoCivil,
        },
        {
          label: "Email",
          value: candidato.email,
        },
        {
          label: "Data de Nascimento",
          value: formatDate(candidato.dataNascimento),
        },
        {
          label: "Nome da mãe",
          value: candidato.nomeMae,
        },
        {
          label: "Nome do Pai",
          value: candidato.nomePai,
        },
        {
          label: "Tipo de escola no ensino médio",
          value: candidato.tipoEscolaEnsinoMedio,
        },
        {
          label: "Telefone fixo",
          value: formatPhoneNumber(candidato.telefoneFixo),
        },
        {
          label: "Telefone celular",
          value: formatPhoneNumber(candidato.telefoneCelular),
        },
      ],
    },
    {
      title: "NACIONALIDADE",
      content: [
        { label: "País", value: candidato.pais },
        { label: "Município", value: candidato.municipio },
        { label: "UF", value: candidato.estado },
      ],
    },
    {
      title: "DOCUMENTOS",
      content: [
        { label: "RG", value: candidato.rg },
        { label: "Orgão de expedição", value: candidato.orgaoExpedidor },
        { label: "UF", value: candidato.estadoExpedicao },
        { label: "Data de expedição", value: formatDate(candidato.dataExpedicao) },
        { label: "Titulo de Eleitor", value: candidato.tituloEleitor },
        { label: "Zona", value: candidato.zonaEleitoral },
        { label: "Seção", value: candidato.secaoEleitoral },
        { label: "Passaporte", value: candidato.passaporte || "Não informado" },
      ],
    },
    {
      title: "ENDEREÇO",
      content: [
        { label: "CEP", value: candidato.endereco?.cep },
        { label: "Logradouro", value: candidato.endereco?.logradouro },
        { label: "Bairro", value: candidato.endereco?.bairro },
        { label: "Complemento", value: candidato.endereco?.complemento || "Não informado" },
        { label: "UF", value: candidato.endereco?.estado },
        { label: "Município", value: candidato.endereco?.municipio },
      ],
    },
    {
      title: "INFORMAÇÕES ADICIONAIS",
      content: [
        {
          label: "Comprovação de inscrição",
          value: candidato.comprovantePagTaxaInscricao,
          link: true,
        },
        { label: "Cópia do CPF", value: candidato.copiaCPF, link: true },
        {
          label: "Cópia do Passaporte ou RNE (Apenas para estrangeiros)",
          value: candidato.copiaPassaporteOuRNE || "Não informado",
          link: !!candidato.copiaPassaporteOuRNE,
        },
        {
          label: "Solicitou isenção do pagamento da taxa de inscrição",
          value: formatBoolean(candidato.solicitouIsencaoTaxaInscricao),
        },
        {
          label: "Cópia do diploma ou declaração de concluinte",
          value: candidato.copiaDiplomaGraduacao,
          link: true,
        },
        {
          label: "Histórico da graduação",
          value: candidato.historicoGraduacao,
          link: true,
        },
        {
          label: "Nome da faculdade/universidade onde realizou graduação",
          value: candidato.nomeUniversidadeGraduacao,
        },
        {
          label: "Nome do curso de graduação",
          value: candidato.nomeCursoGraduacao,
        },
        {
          label: "Cidade onde realizou a graduação",
          value: candidato.cidadeOndeRealizouGraduacao,
        },
        {
          label: "Link para ENADE do curso de graduação",
          value: candidato.enadeDoCursoGraduacao,
          link: true,
        },
        {
          label: "Valor do ENADE",
          value: candidato.valorDoEnadeDoCursoGraduacao,
        },
        {
          label: "Comprovações de pesquisa",
          value: candidato.comprovacaoPesquisas,
          link: true,
        },
        {
          label: "Nota do POSCOMP (opcional)",
          value: candidato.notaPOSCOMP || "Não informado",
        },
        {
          label: "Possui necessidades especiais",
          value: formatBoolean(candidato.possuiNecessidadesEspeciais),
        },
        {
          label: "Concorre às vagas reservadas para negros(as) - preto(as) e pardos(as)",
          value: formatBoolean(candidato.vagasNegrosPardos),
        },
        {
          label: "Concorre às vagas supranumerárias",
          value: formatBoolean(candidato.vagasSupranumerarias),
        },
        {
          label: "Primeira área de preferencia: ",
          value: candidato.primeiraAreaPreferencia || "Não informado",
        },
        {
          label: "Segunda área de preferencia: ",
          value: candidato.segundaAreaPreferencia || "Não informado",
        },
        {
          label: "Carta de motivação",
          value: candidato.cartaMotivacao || "Não informado",
          link: true,
        },
      ],
    },
  ]

  function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) return

    deleteCandidatoMutation
      .mutateAsync()
      .then(() => navigate("/dashboard"))
      .catch(() => undefined)
  }

  return (
    <CandidateDetails
      user={user}
      candidato={candidato}
      handleDelete={handleDelete}
      deleteCandidatoMutation={deleteCandidatoMutation}
      SECTION_CONTENT={SECTION_CONTENT}
    />
  )
}
