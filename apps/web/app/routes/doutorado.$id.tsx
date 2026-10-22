import { useNavigate, useParams } from "react-router"
import { useToast } from "@/hooks"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

import type { CandidatoDoutoradoComRelacoes } from "@tcc/server"
import { useCandidatoDoutoradoById, 
  // useDeleteCandidatoDoutorado
 } from "@/hooks/candidato.hooks"
import { useUser } from "@/services/useUser"
import { Header } from "@/components/layout/header"
import type { Route } from "./+types/dashboard"
import { formatBoolean, formatCPF, formatDate, formatPhoneNumber } from "@/lib/format"
import CandidateDetails from "@/components/candidatos/candidate-details"
import CandidateNotFound from "@/components/candidatos/candidate-not-found"

export const meta: Route.MetaFunction = () => [
  { title: "SISSEL - Candidato de doutorado", description: "Página do candidato de doutorado" },
]

export default function CandidatoDoutoradoPage() {
  const { id } = useParams<{ id: string | undefined }>()
  const userQuery = useUser()

  const { toast } = useToast()
  const navigate = useNavigate()
  const candidatoQuery = useCandidatoDoutoradoById(id ?? "")
  const deleteCandidatoMutation = useDeleteCandidatoDoutorado(id ?? "")
  const user = userQuery.data
  const candidato: CandidatoDoutoradoComRelacoes = candidatoQuery.data

  useEffect(() => {
    document.title = `SISSEL - ${candidato?.nome ?? "Candidato de doutorado"}`
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
    toast.error({
      title: "Erro",
      description: "Erro ao carregar os dados do candidato.",
    })
    navigate("/dashboard")
    return null
  }

  if (!candidato) {
    return <CandidateNotFound />
  }

  function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) return

    deleteCandidatoMutation
      .mutateAsync()
      .then(() => navigate("/dashboard"))
      .catch(() => undefined)
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
          label: "Nome do pai",
          value: candidato.nomePai,
        },
        {
          label: "Tipo de escola no ensino médio",
          value: candidato.tipoEscolaEnsinoMedio,
        },
        {
          label: "Telefone fixo",
          value: candidato.telefoneFixo,
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
        {
          label: "País",
          value: candidato.pais,
        },
        {
          label: "Município",
          value: candidato.municipio,
        },
        {
          label: "UF",
          value: candidato.estado,
        },
      ],
    },
    {
      title: "DOCUMENTOS",
      content: [
        {
          label: "RG",
          value: candidato.rg,
        },
        {
          label: "Orgão de expedição",
          value: candidato.orgaoExpedidor,
        },
        {
          label: "UF",
          value: candidato.estadoExpedicao,
        },
        {
          label: "Data de expedição",
          value: formatDate(candidato.dataExpedicao),
        },
        {
          label: "Título de eleitor",
          value: candidato.tituloEleitor,
        },
        {
          label: "Zona",
          value: candidato.zonaEleitoral,
        },
        {
          label: "Seção",
          value: candidato.secaoEleitoral,
        },
        {
          label: "Passaporte",
          value: candidato.passaporte,
        },
      ],
    },
    {
      title: "ENDEREÇO",
      content: [
        {
          label: "CEP",
          value: candidato.endereco?.cep,
        },
        {
          label: "Logradouro",
          value: candidato.endereco?.logradouro,
        },
        {
          label: "Bairro",
          value: candidato.endereco?.bairro,
        },
        {
          label: "Complemento",
          value: candidato.endereco?.complemento,
        },
        {
          label: "UF",
          value: candidato.endereco?.estado,
        },
        {
          label: "Município",
          value: candidato.endereco?.municipio,
        },
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
        {
          label: "Cópia CPF",
          value: candidato.copiaCPF,
          link: true,
        },
        {
          label: "Cópia Passaporte ou RNE (Apenas para estrageiros)",
          value: candidato.copiaPassaporteOuRNE,
          link: !!candidato.copiaPassaporteOuRNE,
        },
        {
          label: "Isenção pagamento taxa de inscrição",
          value: formatBoolean(candidato.solicitouIsencaoTaxaInscricao),
        },
        {
          label: "Histórico acadêmico do curso de graduação",
          value: candidato.historicoGraduacao,
          link: true,
        },
        {
          label: "Cópia de diploma de mestrado ou declaração de concluinte",
          value: candidato.copiaDiplomaMestrado,
          link: true,
        },
        {
          label: "Histórico acadêmico do curso de mestrado",
          value: candidato.historicoMestrado,
          link: true,
        },
        {
          label: "Nome da universidade/faculdade onde realizou mestrado",
          value: candidato.nomeUniversidadeMestrado,
        },
        {
          label: "Nome do curso de mestrado",
          value: candidato.nomeCursoMestrado,
        },
        {
          label: "Comprovações de pesquisa",
          value: candidato.comprovacaoPesquisas,
          link: true,
        },
        {
          label: "Anteprojeto de tese",
          value: candidato.anteprojetoTese,
          link: true,
        },
        {
          label: "Conceito CAPES do programa do curso de mestrado",
          value: candidato.conceitoCapesMestrado,
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
      ],
    },
    {
      title: "Opções para orientadores",
      content: [
        {
          label: "Primeira opção de orientador(a)",
          value: candidato.primeiraOpcaoOrientador,
        },
        {
          label: "Segunda opção de orientador(a)",
          value: candidato.segundaOpcaoOrientador,
        },
        {
          label: "Terceira opção de orientador(a)",
          value: candidato.terceiraOpcaoOrientador,
        },
      ],
    },
  ]
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
