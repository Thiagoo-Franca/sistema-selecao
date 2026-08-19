import { useNavigate, useParams } from "react-router"
import type { Route } from "./+types/banca.$id"
import { useToast } from "@/hooks"
import { useEffect, useState } from "react"
import { useCalcularEtapa1, useCandidatoMestradoById } from "@/hooks/candidato.hooks"
import { useUser } from "@/services/useUser"
import { Header } from "@/components/layout/Header"
import { ArrowLeft, Loader2 } from "lucide-react"
import type { CandidatoMestrado } from "./_index"
import { formatDate } from "./banca.$id"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldLegend } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CandidatoMestradoNotaEtapa1Schema } from "@/schema/schema"


// para evitar NaN
function paraNumeroSeguro(valor: number | undefined): number {
    return typeof valor === "number" && !Number.isNaN(valor) ? valor : 0
}
export const meta: Route.MetaFunction = () => [{ title: `SISSEL - Avaliação candidato` }]

export type CandidatoMestradoNotaEtapa1 = {
    grad: number,
    area: number,
    enade: number,
    a1a2a3a4: number,
    b1b2b3b4: number,
    ic_it: number,
    poscomp: number,
    DISCIPLINA_PÓS_CAPES_6: number,
    DISCIPLINA_PÓS_CAPES_3_5: number,
}

export function calcularMestradoNotaEtapa1({ grad, area, enade, a1a2a3a4, b1b2b3b4, ic_it, poscomp, DISCIPLINA_PÓS_CAPES_6, DISCIPLINA_PÓS_CAPES_3_5 }: CandidatoMestradoNotaEtapa1): { pontuacao: number, aprovado: boolean } {

    const RGRAD = ((((grad * area) * 7) + ((enade * 2) * 3)) / 10)

    const RPQ_GRAD = Math.min(10, Math.min(10, (a1a2a3a4 * 2)) + Math.min(5, b1b2b3b4) + Math.min(6, (ic_it * 2)) + (poscomp / 7) + Math.min(6, (DISCIPLINA_PÓS_CAPES_6 * 2)) + Math.min(4, DISCIPLINA_PÓS_CAPES_3_5))

    const pontuacao = (RGRAD * 8 + RPQ_GRAD * 2) / 10
    return { pontuacao: pontuacao, aprovado: pontuacao >= 5 }
}

export default function AvaliacaoCandidatoMestradoPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string | undefined }>()
    const [nota, setNota] = useState(0);
    const { toast } = useToast()
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const userQuery = useUser()
    const candidatoQuery = useCandidatoMestradoById(id ?? "")

    const form = useForm<CandidatoMestradoNotaEtapa1>({
        resolver: zodResolver(CandidatoMestradoNotaEtapa1Schema),
    })

    const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = form

    const user = userQuery.data
    const candidato: CandidatoMestrado | null | undefined = candidatoQuery.data
    const isLoading = candidatoQuery.isLoading || userQuery.isLoading
    const isAdmin = user?.role === "ADMIN"

    useEffect(() => {
        if (!id || (!userQuery.isLoading && !user)) {
            navigate("/")
        }
    }, [id, user, userQuery.isLoading, navigate])

    useEffect(() => {
        if (candidato) {
            reset({
                avaliador1: "",
                avaliador2: "",
                area1: "",
                area2: "",
                id: "",
                cpf: "",
                nome: candidato.nome,
                email: "",
                cidade: candidato.municipio,
                isencao: "",
                isencaoAprovada: "",
                GRU: "",
                Homologa: "",
                universidade: candidato.nomeUniversidadeGraduacao,
                cursoGrad: candidato.nomeCursoGraduacao,
                cidadeGrad: candidato.cidadeOndeRealizouGraduacao,
                especiais: "",
                cotas: "",
                SUPRA: "",
                grad: 0,
                area: 0,
                enade: 0,
                a1a2a3a4: 0,
                b1b2b3b4: 0,
                ic_it: 0,
                poscomp: 0,
                DISCIPLINA_PÓS_CAPES_6: 0,
                DISCIPLINA_PÓS_CAPES_3_5: 0,
            })
        }
    }, [candidato, reset])

    const camposNotaEtapa1 = useWatch({
        control,
        name: ["grad", "area", "enade", "a1a2a3a4", "b1b2b3b4", "ic_it", "poscomp", "DISCIPLINA_PÓS_CAPES_6", "DISCIPLINA_PÓS_CAPES_3_5"],
    })

    useEffect(() => {
        const [grad, area, enade, a1a2a3a4, b1b2b3b4, ic_it, poscomp, DISCIPLINA_PÓS_CAPES_6, DISCIPLINA_PÓS_CAPES_3_5] = camposNotaEtapa1

        const resultado = calcularMestradoNotaEtapa1({
            grad: paraNumeroSeguro(grad),
            area: paraNumeroSeguro(area),
            enade: paraNumeroSeguro(enade),
            a1a2a3a4: paraNumeroSeguro(a1a2a3a4),
            b1b2b3b4: paraNumeroSeguro(b1b2b3b4),
            ic_it: paraNumeroSeguro(ic_it),
            poscomp: paraNumeroSeguro(poscomp),
            DISCIPLINA_PÓS_CAPES_6: paraNumeroSeguro(DISCIPLINA_PÓS_CAPES_6),
            DISCIPLINA_PÓS_CAPES_3_5: paraNumeroSeguro(DISCIPLINA_PÓS_CAPES_3_5),
        })

        setNota(resultado.pontuacao)
    }, [camposNotaEtapa1])

    function onSubmit(dados: CandidatoMestradoNotaEtapa1) {
        const resultado = calcularMestradoNotaEtapa1(dados)
        console.log("Pontuação:", resultado.pontuacao)
        console.log("Aprovado:", resultado.aprovado)
    }

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
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>

            {
                // AGRUPAR CAMPOS PARA FICAR MAIS CLARO CADA SEÇÂO, por exemplo dados do candidato
                // REALIZAR CALCULO NO FRONTEND MESMO, PARA APARECER INSTANTANEAMENTE A PONTUAÇÃO E SE FOI APROVADO OU NÃO, SEM PRECISAR FICAR ESPERANDO O BACKEND RESPONDER, PARA DEPOIS MOSTRAR ESSAS INFORMAÇÕES PARA O USUÁRIO
            }

            <form className="flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>

                <FieldLegend className="font-bold text-muted-foreground">Avaliadores</FieldLegend>
                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    {/* Avaliador 1 */}

                    <Field className="flex flex-col gap-4 ">
                        <FieldLabel htmlFor="avaliador1" className="font-bold text-muted-foreground">Avaliador 1</FieldLabel>
                        <Input {...register("avaliador1")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="avaliador1" />
                    </Field>

                    {/* Avaliador 2 */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="avaliador2" className="font-bold text-muted-foreground">Avaliador 2</FieldLabel>
                        <Input {...register("avaliador2")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="avaliador2" />
                    </Field>
                </div>
                <FieldLegend className="font-bold text-muted-foreground">Áreas de Interesse</FieldLegend>

                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">

                    {/* Área 1 */}

                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="area1" className="font-bold text-muted-foreground">ÁREA 1 OPÇÃO</FieldLabel>
                        <Input {...register("area1")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="area1" />
                    </Field>

                    {/* Área 2 */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="area2" className="font-bold text-muted-foreground">ÁREA 2 OPÇÃO</FieldLabel>
                        <Input {...register("area2")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="area2" />
                    </Field>
                </div>
                <FieldLegend className="font-bold text-muted-foreground">Dados do candidato</FieldLegend>

                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">

                    {/* ID */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="id" className="font-bold text-muted-foreground">ID</FieldLabel>
                        <Input {...register("id")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="id" />
                    </Field>

                    {/* CPF */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="cpf" className="font-bold text-muted-foreground">CPF</FieldLabel>
                        <Input {...register("cpf")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="cpf" />
                    </Field>

                    {/* Nome */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="nome" className="font-bold text-muted-foreground">NOME</FieldLabel>
                        <Input {...register("nome")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="nome" />
                    </Field>

                    {/* Email */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="email" className="font-bold text-muted-foreground">EMAIL DO CANDIDATO</FieldLabel>
                        <Input {...register("email")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="email" id="email" />
                    </Field>

                    {/* Cidade */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="cidade" className="font-bold text-muted-foreground">CIDADE DE RESIDÊNCIA</FieldLabel>
                        <Input {...register("cidade")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="cidade" />
                    </Field>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">

                    {/* Pediu Isenção */}
                    <Controller
                        control={control}
                        name="isencao"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="isencao" className="font-bold text-muted-foreground">PEDIU ISENÇÃO?</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
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
                        )}
                    />

                    {/* Isenção Aprovada */}
                    <Controller
                        control={control}
                        name="isencaoAprovada"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="isencaoAprovada" className="font-bold text-muted-foreground">ISENÇÃO APROVADA?</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
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
                        )}
                    />

                    {/* GRU */}
                    <Controller
                        control={control}
                        name="GRU"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="GRU" className="font-bold text-muted-foreground">GRU</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
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
                        )}
                    />
                </div>

                {/* Homologa */}
                <Controller
                    control={control}
                    name="Homologa"
                    render={({ field }) => (
                        <Field className="flex flex-col gap-4">
                            <FieldLabel htmlFor="Homologa" className="font-bold text-muted-foreground">Homologa?</FieldLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <SelectTrigger className="w-full max-w-[400px]">
                                    <SelectValue placeholder="Homologa?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="sim">SIM</SelectItem>
                                        <SelectItem value="nao">NÃO</SelectItem>
                                        <SelectItem value="nao-solicitou">NÃO SOLICITOU</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                />
                <FieldLegend className="font-bold text-muted-foreground">Dados sobre graduação</FieldLegend>
                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    {/* Universidade */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="universidade" className="font-bold text-muted-foreground">UNIVERSIDADE</FieldLabel>
                        <Input {...register("universidade")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="universidade" />
                    </Field>

                    {/* Curso de Graduação */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="cursoGrad" className="font-bold text-muted-foreground">CURSO DE GRADUAÇÃO</FieldLabel>
                        <Input {...register("cursoGrad")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="cursoGrad" />
                    </Field>

                    {/* Cidade de Graduação */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="cidadeGrad" className="font-bold text-muted-foreground">Cidade de graduação</FieldLabel>
                        <Input {...register("cidadeGrad")} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="text" id="cidadeGrad" />
                    </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">

                    {/* Especiais */}
                    <Controller
                        control={control}
                        name="especiais"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="especiais" className="font-bold text-muted-foreground">Especiais</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
                                        <SelectValue placeholder="Especiais?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="sim">SIM</SelectItem>
                                            <SelectItem value="nao">NÃO</SelectItem>
                                            <SelectItem value="nao-solicitou">NÃO SOLICITOU</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />

                    {/* Cotas */}
                    <Controller
                        control={control}
                        name="cotas"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="cotas" className="font-bold text-muted-foreground">Cotas (Negros)</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
                                        <SelectValue placeholder="Cotas (Negros)?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="sim">SIM</SelectItem>
                                            <SelectItem value="nao">NÃO</SelectItem>
                                            <SelectItem value="nao-solicitou">NÃO SOLICITOU</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />

                    {/* SUPRA */}
                    <Controller
                        control={control}
                        name="SUPRA"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="SUPRA" className="font-bold text-muted-foreground">SUPRA</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
                                        <SelectValue placeholder="SUPRA?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="sim">SIM</SelectItem>
                                            <SelectItem value="nao">NÃO</SelectItem>
                                            <SelectItem value="nao-solicitou">NÃO SOLICITOU</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />
                </div>
                <FieldLegend className="font-bold text-muted-foreground">Notas da Etapa I</FieldLegend>
                <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">

                    {/* GRAD */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="grad" className="font-bold text-muted-foreground">GRAD</FieldLabel>
                        <Input {...register("grad", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" step="0.01" id="grad" />
                    </Field>

                    {/* AREA */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="area" className="font-bold text-muted-foreground">AREA</FieldLabel>
                        <Input {...register("area", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" step="0.01" id="area" />
                    </Field>

                    {/* ENADE */}
                    <Controller
                        control={control}
                        name="enade"
                        render={({ field }) => (
                            <Field className="flex flex-col gap-4">
                                <FieldLabel htmlFor="enade" className="font-bold text-muted-foreground">ENADE</FieldLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ""}>
                                    <SelectTrigger className="w-full max-w-[400px]">
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
                        )}
                    />

                    {/* A1A2A3A4 */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="a1a2a3a4" className="font-bold text-muted-foreground">A1, A2, A3, A4</FieldLabel>
                        <Input {...register("a1a2a3a4", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" id="a1a2a3a4" />
                    </Field>

                    {/* B1B2B3B4 */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="b1b2b3b4" className="font-bold text-muted-foreground">B1, B2, B3, B4</FieldLabel>
                        <Input {...register("b1b2b3b4", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" id="b1b2b3b4" />
                    </Field>

                    {/* IC/IT */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="icit" className="font-bold text-muted-foreground">IC/IT</FieldLabel>
                        <Input {...register("ic_it", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" id="icit" />
                    </Field>

                    {/* POSCOMP */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="poscomp" className="font-bold text-muted-foreground">POSCOMP</FieldLabel>
                        <Input {...register("poscomp", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" id="poscomp" />
                    </Field>

                    {/* DISCIPLINA PÓS CAPES 6+ */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="posCapes" className="font-bold text-muted-foreground">DISCIPLINA PÓS CAPES 6+</FieldLabel>
                        <Input {...register("DISCIPLINA_PÓS_CAPES_6", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" id="posCapes" />
                    </Field>

                    {/* DISCIPLINA PÓS CAPES 3 a 5 */}
                    <Field className="flex flex-col gap-4">
                        <FieldLabel htmlFor="posCapes3a5" className="font-bold text-muted-foreground">DISCIPLINA PÓS CAPES 3 a 5</FieldLabel>
                        <Input {...register("DISCIPLINA_PÓS_CAPES_3_5", { valueAsNumber: true })} className="max-w-[400px] w-full p-2 rounded-[8px] border border-gray-800" type="number" id="posCapes3a5" />
                    </Field>
                </div>

                {/* Prévia Nota */}
                <Field className="flex flex-col gap-4">
                    <FieldLabel htmlFor="posCapes3a5" className="font-bold text-muted-foreground">{`Nota (Prévia): ${nota.toFixed(2)}`}</FieldLabel>
                </Field>

                <Button type="submit" className="col-span-3 my-2" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
                </Button>

            </form>
            <hr className="my-4" />
        </div>
    )
}