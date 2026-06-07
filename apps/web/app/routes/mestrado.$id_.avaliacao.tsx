import { useNavigate, useParams } from "react-router"
import type { Route } from "./+types/banca.$id"
import { useToast } from "@/hooks"
import { useState } from "react"
import { useCandidatoMestradoById } from "@/hooks/candidato.hooks"
import { useUser } from "@/services/useUser"
import { Header } from "@/components/layout/Header"
import { ArrowLeft, Loader2, Table } from "lucide-react"
import { TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CandidatoMestrado } from "./_index"
import { formatDate } from "./banca.$id"
import { Button } from "@/components/ui/button"

function formatBoolean(valor: boolean) {
    if (valor) {
        return "Sim"
    }
    return "Não"
}

export const meta: Route.MetaFunction = () => [{ title: `SISSEL - Avaliação candidato` } ]

export default function AvaliacaoCandidatoMestradoPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string | undefined }>()
    const { toast } = useToast()
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const userQuery = useUser()

    const userLoading = userQuery.isLoading
    if (id === undefined) {
        navigate("/")
        return null
    }

    const candidatoQuery = useCandidatoMestradoById(id)

    const user = userQuery.data

    if (!id || !user) {
        navigate("/")
        return
    }

    if (userLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Header className="mb-6" />
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }


    // const bancaQuery = useBanca(id)
    // const deleteBancaMutation = useDeleteBanca()
    // const toggleVisibilityMutation = useToggleBancaVisibility(id)

    function handleCopy(text: string, id: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id)
            toast({
                title: "Copiado!",
                description: "Texto copiado para a área de transferência.",
            })
            setTimeout(() => setCopiedId(null), 2000)
        })
    }

    const candidato: CandidatoMestrado | null | undefined = candidatoQuery.data
    console.log("Candidato: ", candidato)

    //const orientador = banca?.membros?.find((m) => m.role === "orientador")?.usuario
    // const aluno = banca?.membros?.find((m) => m.role === "aluno")?.usuario

    const isAdmin = user?.role === "ADMIN"
    // const isOrientador = !!user?.id && user?.id === orientador?.id
    const canEdit = isAdmin // || isOrientador

    const isLoading = candidatoQuery.isLoading || userLoading
    const error = candidatoQuery.error || userQuery.error

    // const membrosBanca = banca?.membros

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Header className="mb-6" />
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    if (!candidato) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Header className="mb-6" />
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-4">Candidato não encontrado</h2>
                    <p className="text-muted-foreground">O candidato que você está procurando não existe ou foi removido.</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Header className="mb-6" />
            <div className="flex flex-row items-center justify-between mb-6">
                <div className="flex flex-row gap-4 items-center">
                    <Button onClick={() => navigate(-1)} variant="outline" className="">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-2xl font-bold">{candidato.nome}</h1>
                </div>
                <Button className="">Avaliar </Button>
            </div>
            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">Número de inscrição</h3>
                        <p className="text-muted-foreground">{candidato.numeroInscricao}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Situação</h3>
                        <p className="text-muted-foreground">{candidato.status}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Data de Inscrição</h3>
                        <p className="text-muted-foreground">{formatDate(candidato.dataInscricao)}</p>
                    </div>

                </div>
                <hr className="my-4" />
            </section>
            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">CPF</h3>
                        <p className="text-muted-foreground">{candidato.cpf}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Nome</h3>
                        <p className="text-muted-foreground">{candidato.nome}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Sexo</h3>
                        <p className="text-muted-foreground">{candidato.sexo}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Estado civil</h3>
                        <p className="text-muted-foreground">{candidato.estadoCivil}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-muted-foreground">{candidato.email}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Data de Nascimento</h3>
                        <p className="text-muted-foreground">{formatDate(candidato.dataNascimento)}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Nome da mãe</h3>
                        <p className="text-muted-foreground">{candidato.nomeMae}</p>
                    </div>
                    {
                        candidato.nomePai &&
                        <div>
                            <h3 className="font-semibold">Nome do Pai</h3>
                            <p className="text-muted-foreground">{candidato.nomePai}</p>
                        </div>
                    }
                    <div>
                        <h3 className="font-semibold">Tipo de escola no ensino médio</h3>
                        <p className="text-muted-foreground">{candidato.tipoEscolaEnsinoMedio}</p>
                    </div>

                </div>
                <hr className="my-4" />
            </section>
            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">País</h3>
                        <p className="text-muted-foreground">{candidato.pais}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Município</h3>
                        <p className="text-muted-foreground">{candidato.municipio}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">UF</h3>
                        <p className="text-muted-foreground">{candidato.estado}</p>
                    </div>
                </div>
                <hr className="my-4" />
            </section>
            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">RG</h3>
                        <p className="text-muted-foreground">{candidato.rg}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Orgão de expedição</h3>
                        <p className="text-muted-foreground">{candidato.orgaoExpedidor}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">UF</h3>
                        <p className="text-muted-foreground">{candidato.estadoExpedicao}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Data de expedição</h3>
                        <p className="text-muted-foreground">{formatDate(candidato.dataExpedicao)}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Titulo de Eleitor</h3>
                        <p className="text-muted-foreground">{candidato.tituloEleitor}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Zona</h3>
                        <p className="text-muted-foreground">{candidato.zonaEleitoral}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Seção</h3>
                        <p className="text-muted-foreground">{candidato.secaoEleitoral}</p>
                    </div>
                    {
                        candidato.passaporte && (
                            <div>
                                <h3 className="font-semibold">Passaporte</h3>
                                <p className="text-muted-foreground">{candidato.passaporte}</p>
                            </div>
                        )
                    }
                </div>
                <hr className="my-4" />
            </section>
            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">CEP</h3>
                        <p className="text-muted-foreground">{candidato.cep}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Logradouro</h3>
                        <p className="text-muted-foreground">{candidato.logradouro}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Bairro</h3>
                        <p className="text-muted-foreground">{candidato.bairro}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Complemento</h3>
                        <p className="text-muted-foreground">{candidato.complemento}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">UF</h3>
                        <p className="text-muted-foreground">{candidato.estado}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Município</h3>
                        <p className="text-muted-foreground">{candidato.municipio}</p>
                    </div>
                    {
                        candidato.telefoneFixo && (
                            <div>
                                <h3 className="font-semibold">Tel. Fixo</h3>
                                <p className="text-muted-foreground">{candidato.telefoneFixo}</p>
                            </div>
                        )
                    }
                    <div>
                        <h3 className="font-semibold">Tel. Celular</h3>
                        <p className="text-muted-foreground">{candidato.telefoneCelular}</p>
                    </div>


                </div>
                <hr className="my-4" />
            </section>
            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">Linha de pesquisa</h3>
                        <p className="text-muted-foreground">{candidato.linhaPesquisa}</p>
                    </div>
                </div>
                <hr className="my-4" />
            </section>

            <section>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold">Comprovante de inscrição</h3>
                        <a href={candidato.comprovantePagTaxaInscricao} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.comprovantePagTaxaInscricao}
                        </a>
                    </div>
                    <div>
                        <h3 className="font-semibold">Cópia CPF</h3>
                        <a href={candidato.copiaCPF} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.copiaCPF}
                        </a>
                    </div>
                    {
                        candidato.copiaPassaporteOuRNE && (
                            <div>
                                <h3 className="font-semibold">Cópia Passaporte ou RNE (Apenas para estrageiros)</h3>

                                <a href={candidato.copiaPassaporteOuRNE} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                                    {candidato.copiaPassaporteOuRNE}
                                </a>
                            </div>
                        )
                    }
                    <div>
                        <h3 className="font-semibold">Isenção pagamento taxa de inscrição </h3>
                        <p className="text-muted-foreground">
                            {formatBoolean(candidato.solicitouIsencaoTaxaInscricao)}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Cópia diploma ou declaração de concluinte</h3>
                        <a href={candidato.copiaDiplomaGraduacao} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.copiaDiplomaGraduacao}
                        </a>
                    </div>
                    <div>
                        <h3 className="font-semibold">Histórico Graduação</h3>
                        <a href={candidato.historicoGraduacao} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.historicoGraduacao}
                        </a>
                    </div>
                    <div>
                        <h3 className="font-semibold">Nome da universidade/faculdade onde realizou graduação</h3>
                        <p className="text-muted-foreground">
                            {candidato.nomeUniversidadeGraduacao}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Nome do curso de graduação</h3>
                        <p className="text-muted-foreground">
                            {candidato.nomeCursoGraduacao}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Cidade onde realizou graduação</h3>
                        <p className="text-muted-foreground">
                            {candidato.cidadeOndeRealizouGraduacao}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Link para ENADE do curso de graduação</h3>
                        <a href={candidato.enadeDoCursoGraduacao} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.enadeDoCursoGraduacao}
                        </a>
                    </div>
                    <div>
                        <h3 className="font-semibold">Valor do ENADE</h3>
                        <p className="text-muted-foreground">
                            {candidato.valorDoEnadeDoCursoGraduacao}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Comprovações de pesquisa</h3>
                        <a href={candidato.comprovacaoPesquisas} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.comprovacaoPesquisas}
                        </a>
                    </div>
                    {
                        candidato.notaPOSCOMP && (

                            <div>
                                <h3 className="font-semibold">Nota do POSCOMP (opcional)</h3>
                                <p className="text-muted-foreground">
                                    {candidato.notaPOSCOMP}
                                </p>
                            </div>
                        )
                    }
                    <div>
                        <h3 className="font-semibold">Possui necessidades especiais</h3>
                        <p className="text-muted-foreground">
                            {formatBoolean(candidato.possuiNecessidadesEspeciais)}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Concorre às vagas reservadas para negros(as) - preto(as) e pardos(as)</h3>
                        <p className="text-muted-foreground">
                            {formatBoolean(candidato.vagasNegrosPardos)}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Concorre às vagas supranumerárias</h3>
                        <p className="text-muted-foreground">
                            {formatBoolean(candidato.vagasSupranumerarias)}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Primeira área de preferência</h3>
                        <p className="text-muted-foreground">
                            {candidato.primeiraAreaPreferencia}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Segunda área de preferência</h3>
                        <p className="text-muted-foreground">
                            {candidato.segundaAreaPreferencia}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Carta de motivação</h3>
                        <a href={candidato.cartaMotivacao} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">
                            {candidato.cartaMotivacao}
                        </a>
                    </div>

                </div>

                <hr className="my-4" />
            </section>
        </div>
    )
}
