import type { Route } from "./+types/dashboard"
import { useNavigate, useParams } from "react-router"
import { useToast } from "@/hooks"
import { useEffect, useState } from "react"
import { useCandidatoMestradoById } from "@/hooks/candidato.hooks"
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

  if (id === undefined) {
    navigate("/dashboard")
    return null
  }
  const candidatoQuery = useCandidatoMestradoById(id)

  const user = userQuery.data

  if (!id || !user) {
    navigate("/")
    return
  }

  const candidato: CandidatoMestradoComRelacoes = candidatoQuery.data

  useEffect(() => {
    document.title = `SISSEL - ${candidato?.nome ?? "Candidato de mestrado"}`
  }, [candidato?.nome])

  // Ainda sem funcinalidade
  const isAdmin = user?.role === "ADMIN"

  if (candidatoQuery.isLoading || userQuery.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Header className="mb-6" />
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Header className="mb-6" />
        <div className="py-20 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Candidato não encontrado</h2>
          <p className="text-muted-foreground">
            O candidato que você está procurando não existe ou foi removido.
          </p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mt-4 hover:cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </div>
    )
  }

  const SECTION_CONTENT: {
    title: string
    content: { label: string; value: string | boolean | Date | null }[]
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
  ]

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="mb-6 flex w-full flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline" className="">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex flex-col items-center gap-4 self-stretch md:flex-row">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Outras opções</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex flex-col gap-2 p-4">
                    <li>
                      <Button className="w-full bg-white text-black hover:bg-black/10">
                        Editar candidato
                      </Button>
                    </li>
                    <li>
                      <Button className="w-full bg-red-500 hover:bg-red-600">
                        Excluir candidato
                      </Button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate(`/mestrado/${candidato.id}/avaliacao`)}
          >
            Avaliar
          </Button>
        </div>
      </div>
      <div className="my-2 flex flex-col gap-2 md:my-6">
        <h1 className="text-2xl font-semibold">{candidato.nome}</h1>
        <div className="flex flex-row gap-1 text-sm text-muted-foreground">
          <p>Candidato de mestrado</p>
          {"-"}
          <p>Linha de pesquisa: {candidato.linhaPesquisa}</p>
        </div>
      </div>
      {SECTION_CONTENT.map((section, index) => (
        <SectionContent key={index} title={section.title} content={section.content} />
      ))}

      <section>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-muted-foreground">Comprovante de inscrição</h3>
            <a
              href={candidato.comprovantePagTaxaInscricao}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.comprovantePagTaxaInscricao}
            </a>
          </div>
          <div>
            <h3 className="text-muted-foreground">Cópia CPF</h3>
            <a
              href={candidato.copiaCPF}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.copiaCPF}
            </a>
          </div>
          {candidato.copiaPassaporteOuRNE && (
            <div>
              <h3 className="text-muted-foreground">
                Cópia Passaporte ou RNE (Apenas para estrageiros)
              </h3>

              <a
                href={candidato.copiaPassaporteOuRNE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
              >
                {candidato.copiaPassaporteOuRNE}
              </a>
            </div>
          )}
          <div>
            <h3 className="text-muted-foreground">Isenção pagamento taxa de inscrição </h3>
            <p className="font-semibold">
              {formatBoolean(candidato.solicitouIsencaoTaxaInscricao)}
            </p>
          </div>
          <div>
            <h3 className="text-muted-foreground">Cópia diploma ou declaração de concluinte</h3>
            <a
              href={candidato.copiaDiplomaGraduacao}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.copiaDiplomaGraduacao}
            </a>
          </div>
          <div>
            <h3 className="text-muted-foreground">Histórico Graduação</h3>
            <a
              href={candidato.historicoGraduacao}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.historicoGraduacao}
            </a>
          </div>
          <div>
            <h3 className="text-muted-foreground">
              Nome da universidade/faculdade onde realizou graduação
            </h3>
            <p className="font-semibold">{candidato.nomeUniversidadeGraduacao}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground">Nome do curso de graduação</h3>
            <p className="font-semibold">{candidato.nomeCursoGraduacao}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground">Cidade onde realizou graduação</h3>
            <p className="font-semibold">{candidato.cidadeOndeRealizouGraduacao}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground">Link para ENADE do curso de graduação</h3>
            <a
              href={candidato.enadeDoCursoGraduacao}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.enadeDoCursoGraduacao}
            </a>
          </div>
          <div>
            <h3 className="text-muted-foreground">Valor do ENADE</h3>
            <p className="font-semibold">{candidato.valorDoEnadeDoCursoGraduacao}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground">Comprovações de pesquisa</h3>
            <a
              href={candidato.comprovacaoPesquisas}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.comprovacaoPesquisas}
            </a>
          </div>
          {candidato.notaPOSCOMP && (
            <div>
              <h3 className="text-muted-foreground">Nota do POSCOMP (opcional)</h3>
              <p className="font-semibold">{candidato.notaPOSCOMP}</p>
            </div>
          )}
          <div>
            <h3 className="text-muted-foreground">Possui necessidades especiais</h3>
            <p className="font-semibold">{formatBoolean(candidato.possuiNecessidadesEspeciais)}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground">
              Concorre às vagas reservadas para negros(as) - preto(as) e pardos(as)
            </h3>
            <p className="font-semibold">{formatBoolean(candidato.vagasNegrosPardos)}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground">Concorre às vagas supranumerárias</h3>
            <p className="font-semibold">{formatBoolean(candidato.vagasSupranumerarias)}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground">Primeira área de preferência</h3>
            <p className="font-semibold">{candidato.primeiraAreaPreferencia}</p>
          </div>
          <div>
            <h3 className="text-muted-foreground">Segunda área de preferência</h3>
            <p className="font-semibold">{candidato.segundaAreaPreferencia}</p>
          </div>

          <div>
            <h3 className="text-muted-foreground">Carta de motivação</h3>
            <a
              href={candidato.cartaMotivacao}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {candidato.cartaMotivacao}
            </a>
          </div>
        </div>

        <hr className="my-4" />
      </section>
    </div>
  )
}
