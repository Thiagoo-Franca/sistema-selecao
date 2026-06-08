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
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

function formatBoolean(valor: boolean) {
    if (valor) {
        return "Sim"
    }
    return "Não"
}

export const meta: Route.MetaFunction = () => [{ title: `SISSEL - Avaliação candidato` }]

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
                </div>
            </div>
            <form className="grid grid-cols-3 gap-6">
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="avaliador1" className="font-bold text-muted-foreground">
                        Avaliador 1
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="avaliador1" id="avaliador1" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="avaliador2" className="font-bold text-muted-foreground">
                        Avaliador 2
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="avaliador2" id="avaliador2" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="area1" className="font-bold text-muted-foreground">
                        ÁREA 1 OPÇÃO
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="area1" id="area1" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="area2" className="font-bold text-muted-foreground">
                        ÁREA 2 OPÇÃO
                    </FieldLabel>
                    <input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="area2" id="area2" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="id" className="font-bold text-muted-foreground">
                        ID
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="id" id="id" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="cpf" className="font-bold text-muted-foreground">
                        CPF
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="cpf" id="cpf" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="nome" className="font-bold text-muted-foreground">
                        NOME
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="nome" id="nome" value={candidato.nome || ""} />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="email" className="font-bold text-muted-foreground">
                        EMAIL DO CANDIDATO
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="email" name="email" id="email" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="cidade" className="font-bold text-muted-foreground">
                        CIDADE DE RESIDÊNCIA
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="cidade" id="cidade" value={candidato.municipio || ""} />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="isencao" className="font-bold text-muted-foreground " >
                        PEDIU ISENÇÃO?
                    </FieldLabel>
                    <Select name="isencao" id="isencao">
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Pediu ISENÇÃO?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="sim">Sim</SelectItem>
                                <SelectItem value="nao">Não</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="isencaoAprovada" className="font-bold text-muted-foreground">
                        ISENÇÃO APROVADA?
                    </FieldLabel>
                    <Select name="isencaoAprovada" id="isencaoAprovada">
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Isenção aprovada?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="sim">Sim</SelectItem>
                                <SelectItem value="nao">Não</SelectItem>
                                <SelectItem value="nao-solicitou">Não solicitou</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="isencaoAprovada" className="font-bold text-muted-foreground">
                        GRU
                    </FieldLabel>
                    <Select name="isencaoAprovada" id="GRU">
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="GRU" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="isento">ISENTO</SelectItem>
                                <SelectItem value="pago">PAGO</SelectItem>
                                <SelectItem value="aberto">ABERTO</SelectItem>
                                <SelectItem value="nao-isento">NAO ISENTO</SelectItem>
                                <SelectItem value="nao-pagou">NAO PAGOU</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="Homologa" className="font-bold text-muted-foreground">
                        Homologa?
                    </FieldLabel>
                    <Select name="Homologa" id="Homologa">
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Homologa?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="sim">SIM</SelectItem>
                                <SelectItem value="nao">NÃO</SelectItem>
                                <SelectItem value="nao-solicitou">NÃo SOLICITOU</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="universidade" className="font-bold text-muted-foreground">
                        UNIVERSIDADE
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="universidade" id="universidade" value={candidato.nomeUniversidadeGraduacao || ""} />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="universidade" className="font-bold text-muted-foreground">
                        CURSO DE GRADUAÇÃO
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="universidade" id="universidade" value={candidato.nomeCursoGraduacao || ""} />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="universidade" className="font-bold text-muted-foreground">
                        Cidade de graduação
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" name="universidade" id="universidade" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="Especiais" className="font-bold text-muted-foreground">
                        Especiais
                    </FieldLabel>
                    <Select name="Especiais" id="especial" >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Especiais?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="sim">SIM</SelectItem>
                                <SelectItem value="nao">NÃO</SelectItem>
                                <SelectItem value="nao-solicitou">NÃo SOLICITOU</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="Cotas" className="font-bold text-muted-foreground">
                        Cotas (Negros)
                    </FieldLabel>
                    <Select name="Cotas" id="cotas" >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Cotas (Negros)?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="sim">SIM</SelectItem>
                                <SelectItem value="nao">NÃO</SelectItem>
                                <SelectItem value="nao-solicitou">NÃo SOLICITOU</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="SUPRA" className="font-bold text-muted-foreground">
                        SUPRA
                    </FieldLabel>
                    <Select name="SUPRA" id="supra" >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="SUPRA?" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="sim">SIM</SelectItem>
                                <SelectItem value="nao">NÃO</SelectItem>
                                <SelectItem value="nao-solicitou">NÃo SOLICITOU</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="grad" className="font-bold text-muted-foreground">
                        GRAD
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="grad" id="grad" />
                </Field>

                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="area" className="font-bold text-muted-foreground">
                        AREA
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="area" id="area" />
                </Field>
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="SUPRA" className="font-bold text-muted-foreground">
                        ENADE
                    </FieldLabel>
                    <Select name="Enade" id="enade" >
                        <SelectTrigger className="w-full max-w-48">
                            <SelectValue placeholder="Enade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>

                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="a1a2a3a4" className="font-bold text-muted-foreground">
                        A1, A2, A3, A4
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="a1a2a3a4" id="a1a2a3a4" />
                </Field>

                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="b1b2b3b4" className="font-bold text-muted-foreground">
                        B1, B2, B3, B4
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="b1b2b3b4" id="b1b2b3b4" />
                </Field>

                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="icit" className="font-bold text-muted-foreground">
                        IC/IT
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="ic/it" id="icit" />
                </Field>

                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="poscomp" className="font-bold text-muted-foreground">
                        POSCOMP
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="poscomp" id="poscomp" />
                </Field>


                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="posCapes" className="font-bold text-muted-foreground">
                        DISCIPLINA PÓS CAPES 6+
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="posCapes" id="posCapes" />
                </Field>
                
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="posCapes3a5" className="font-bold text-muted-foreground">
                        DISCIPLINA PÓS CAPES 3 a 5
                    </FieldLabel>
                    <Input className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" inputMode="numeric" pattern="[0-9]*" name="posCapes3a5" id="posCapes3a5" />
                </Field>
            </form>

            <hr className="my-4" />
        </div >
    )
}
