import { useNavigate, useParams } from "react-router"
import type { Route } from "./+types/banca.$id"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks"
import { useUser } from "@/services/useUser"
import {
  useCandidatoDoutoradoById,
  useUpdateCandidatoDoutorado,
  useUpdateCandidatoDoutoradoNota,
} from "@/hooks/candidato.hooks"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  CandidatoDoutoradoNotaEtapa1Schema,
  type CandidatoDoutoradoNotaEtapa1,
} from "@/schema/schema"
import { zodResolver } from "@hookform/resolvers/zod"

import { calcularNotaDoutoradoEtapa1, paraNumeroSeguro } from "@/lib/calculoNotas"
import { Header } from "@/components/layout/Header"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldLegend } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { CandidatoDoutorado } from "./dashboard"

export const meta: Route.MetaFunction = () => [{ title: `SISSEL - Avaliação candidato Doutorado` }]

export default function AvaliacaoCandidatoDoutoradoPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string | undefined }>()
  const [nota, setNota] = useState(0)
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const userQuery = useUser()
  const candidatoQuery = useCandidatoDoutoradoById(id ?? "")

  const form = useForm<CandidatoDoutoradoNotaEtapa1>({
    resolver: zodResolver(CandidatoDoutoradoNotaEtapa1Schema),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const user = userQuery.data
  const candidato: CandidatoDoutorado | null | undefined = candidatoQuery.data
  const isAdmin = user?.role === "ADMIN"
  const isLoading = candidatoQuery.isLoading || userQuery.isLoading

  useEffect(() => {
    if (!id || (!userQuery.isLoading && !user)) {
      navigate("/")
    }
  }, [id, user, userQuery.isLoading, navigate])

  useEffect(() => {
    if (candidato) {
      reset({
        avaliador1: candidato.avaliador1 ? candidato.avaliador1 : "",
        avaliador2: candidato.avaliador2 ? candidato.avaliador2 : "",
        cpf: candidato.cpf ? candidato.cpf : "",
        nome: candidato.nome ? candidato.nome : "",
        email: candidato.email ? candidato.email : "",
        solicitouIsencaoTaxaInscricao: candidato.solicitouIsencaoTaxaInscricao ? "sim" : "nao",
        isencaoAprovada: candidato.isencaoAprovada ? "sim" : "nao",
        gru: candidato.gru ? candidato.gru : "", // ajustar GRU
        homologa: candidato.homologa ? "sim" : "nao", // ajustar homologa
        areaPgcomp: candidato.areaPgcomp ? candidato.areaPgcomp : "", // ajustar areaPGCOMP
        OrientadorMestrado: candidato.orientadorMestrado ? candidato.orientadorMestrado : "", // ajustar orientadorMestrado
        PotencialOrientador1: candidato.primeiraOpcaoOrientador
          ? candidato.primeiraOpcaoOrientador
          : "",
        PotencialOrientador2: candidato.segundaOpcaoOrientador
          ? candidato.segundaOpcaoOrientador
          : "",
        PotencialOrientador3: candidato.terceiraOpcaoOrientador
          ? candidato.terceiraOpcaoOrientador
          : "",
        Especiais: candidato.possuiNecessidadesEspeciais ? "sim" : "nao",
        Cotas: candidato.vagasNegrosPardos ? "sim" : "nao",
        Supra: candidato.vagasSupranumerarias ? "sim" : "nao",
        Universidade: candidato.nomeUniversidadeMestrado ? candidato.nomeUniversidadeMestrado : "",
        Curso: candidato.nomeCursoMestrado ? candidato.nomeCursoMestrado : "",
        Cidade: candidato.cidadeOndeRealizouMestrado ? candidato.cidadeOndeRealizouMestrado : "", // cidade da universidade
        msc: candidato.notas?.msc ? candidato.notas?.msc : 0,
        areaFormacaoGraduacao: candidato.notas?.areaFormacaoGraduacao
          ? candidato.notas?.areaFormacaoGraduacao
          : 0,
        conceitoCapesMestrado: candidato.notas?.conceitoCapesMestrado
          ? candidato.notas?.conceitoCapesMestrado
          : 0,
        a1a2a3a4: candidato.notas?.a1a2a3a4 ? candidato.notas?.a1a2a3a4 : 0,
        b1b2b3b4: candidato.notas?.b1b2b3b4 ? candidato.notas?.b1b2b3b4 : 0,
        notaAnteprojeto: candidato.notas?.notaAnteprojeto ? candidato.notas?.notaAnteprojeto : 0,
      })
    }
  }, [candidato, reset])

  const camposNotaEtapa1 = useWatch({
    control,
    name: [
      "msc",
      "areaFormacaoGraduacao",
      "conceitoCapesMestrado",
      "notaAnteprojeto",
      "a1a2a3a4",
      "b1b2b3b4",
    ],
  })

  useEffect(() => {
    if (!camposNotaEtapa1) return

    const [MSC, areaFormacaoGraduacao, conceitoCapesMestrado, notaAnteprojeto, a1a2a3a4, b1b2b3b4] =
      camposNotaEtapa1

    const resultado = calcularNotaDoutoradoEtapa1({
      msc: paraNumeroSeguro(MSC),
      areaFormacaoGraduacao: paraNumeroSeguro(areaFormacaoGraduacao),
      conceitoCapesMestrado: paraNumeroSeguro(conceitoCapesMestrado),
      a1a2a3a4: paraNumeroSeguro(a1a2a3a4),
      b1b2b3b4: paraNumeroSeguro(b1b2b3b4),
      notaAnteprojeto: paraNumeroSeguro(notaAnteprojeto),
    })

    setNota(resultado.pontuacao)
  }, [camposNotaEtapa1])

  const updateCandidatoMutation = useUpdateCandidatoDoutorado()
  const updateNotaMutation = useUpdateCandidatoDoutoradoNota()

  async function onSubmit(dados: CandidatoDoutoradoNotaEtapa1) {
    if (!id) return

    console.log("Dados do formulário:", dados)

    const [candidatoResult, notaResult] = await Promise.allSettled([
      updateCandidatoMutation.mutateAsync({
        id,
        body: {
          avaliador1: dados.avaliador1,
          avaliador2: dados.avaliador2,
          cpf: dados.cpf,
          nome: dados.nome,
          email: dados.email,
          solicitouIsencaoTaxaInscricao: dados.solicitouIsencaoTaxaInscricao === "sim",
          isencaoAprovada: dados.isencaoAprovada === "sim",
          gru: dados.gru,
          homologa: dados.homologa === "sim" ? "sim" : "nao",
          areaPgcomp: dados.areaPgcomp,
          orientadorMestrado: dados.OrientadorMestrado,
          primeiraOpcaoOrientador: dados.PotencialOrientador1,
          segundaOpcaoOrientador: dados.PotencialOrientador2,
          terceiraOpcaoOrientador: dados.PotencialOrientador3,
          possuiNecessidadesEspeciais: dados.Especiais === "sim",
          vagasNegrosPardos: dados.Cotas === "sim",
          vagasSupranumerarias: dados.Supra === "sim",
          nomeUniversidadeMestrado: dados.Universidade,
          nomeCursoMestrado: dados.Curso,
          cidadeOndeRealizouMestrado: dados.Cidade,
        },
      }),
      updateNotaMutation.mutateAsync({
        id,
        body: {
          msc: dados.msc,
          areaFormacaoGraduacao: dados.areaFormacaoGraduacao,
          conceitoCapesMestrado: dados.conceitoCapesMestrado,
          a1a2a3a4: dados.a1a2a3a4,
          b1b2b3b4: dados.b1b2b3b4,
          notaAnteprojeto: dados.notaAnteprojeto,
        },
      }),
    ])

    // toasts de sucesso/erro já disparam dentro dos hooks (onSuccess/onError);
    // aqui só decide o que fazer se uma das duas falhar
    if (candidatoResult.status === "rejected" || notaResult.status === "rejected") return
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!candidato) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="py-20 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Candidato não encontrado</h2>
          <p className="text-muted-foreground">
            O candidato que você está procurando não existe ou foi removido.
          </p>
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
      <div className="mb-6 flex flex-row items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={handleSubmit(onSubmit, (erros) => {
          console.log("Erros de validação:", erros)
        })}
      >
        <FieldLegend className="font-bold text-muted-foreground">Avaliadores</FieldLegend>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {/* Avaliador 1 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="avaliador1" className="font-bold text-muted-foreground">
              Avaliador 1
            </FieldLabel>
            <Input
              {...register("avaliador1")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="avaliador1"
            />
          </Field>

          {/* Avaliador 2 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="avaliador2" className="font-bold text-muted-foreground">
              Avaliador 2
            </FieldLabel>
            <Input
              {...register("avaliador2")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="avaliador2"
            />
          </Field>
        </div>

        <FieldLegend className="font-bold text-muted-foreground">Dados do candidato</FieldLegend>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {/* CPF */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="cpf" className="font-bold text-muted-foreground">
              CPF
            </FieldLabel>
            <Input
              {...register("cpf")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="cpf"
            />
          </Field>

          {/* Nome */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="nome" className="font-bold text-muted-foreground">
              NOME
            </FieldLabel>
            <Input
              {...register("nome")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="nome"
            />
          </Field>

          {/* Email */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="email" className="font-bold text-muted-foreground">
              EMAIL DO CANDIDATO
            </FieldLabel>
            <Input
              {...register("email")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="email"
              id="email"
            />
          </Field>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {/* Pediu Isenção */}
          <Controller
            control={control}
            name="solicitouIsencaoTaxaInscricao"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel
                  htmlFor="solicitouIsencaoTaxaInscricao"
                  className="font-bold text-muted-foreground"
                >
                  PEDIU ISENÇÃO?
                </FieldLabel>
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
                <FieldLabel htmlFor="isencaoAprovada" className="font-bold text-muted-foreground">
                  ISENÇÃO APROVADA?
                </FieldLabel>
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
            name="gru"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="GRU" className="font-bold text-muted-foreground">
                  GRU
                </FieldLabel>
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
          {/* Homologa */}
          <Controller
            control={control}
            name="homologa"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="homologa" className="font-bold text-muted-foreground">
                  Homologa?
                </FieldLabel>
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
          {/* Area PGCOMP */}
          <Controller
            control={control}
            name="areaPgcomp"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="areaPGCOMP" className="font-bold text-muted-foreground">
                  Area PGCOMP
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger className="w-full max-w-[400px]">
                    <SelectValue placeholder="Area PGCOMP?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="engenharia-de-software">ENGENHARIA DE SOFTWARE</SelectItem>
                      <SelectItem value="computacao-aplicada">COMPUTACAO APLICADA</SelectItem>
                      <SelectItem value="sistemas-computacionais">
                        SISTEMAS COMPUTACIONAIS
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          {/* Orientador(a) do Mestrado */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="orientadorMestrado" className="font-bold text-muted-foreground">
              Orientador(a) do Mestrado
            </FieldLabel>
            <Input
              {...register("OrientadorMestrado")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="orientadorMestrado"
            />
          </Field>
          {/* Potencial orientador 1 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="potencialOrientador1" className="font-bold text-muted-foreground">
              Potencial Orientador 1
            </FieldLabel>
            <Input
              {...register("PotencialOrientador1")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="potencialOrientador1"
            />
          </Field>

          {/* Potencial orientador 2 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="potencialOrientador2" className="font-bold text-muted-foreground">
              Potencial Orientador 2
            </FieldLabel>
            <Input
              {...register("PotencialOrientador2")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="potencialOrientador2"
            />
          </Field>
          {/* Potencial orientador 3 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="potencialOrientador3" className="font-bold text-muted-foreground">
              Potencial Orientador 3
            </FieldLabel>
            <Input
              {...register("PotencialOrientador3")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="potencialOrientador3"
            />
          </Field>

          {/* Especiais */}
          <Controller
            control={control}
            name="Especiais"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="especiais" className="font-bold text-muted-foreground">
                  Especiais
                </FieldLabel>
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
            name="Cotas"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="cotas" className="font-bold text-muted-foreground">
                  Cotas (Negros)
                </FieldLabel>
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
            name="Supra"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="SUPRA" className="font-bold text-muted-foreground">
                  SUPRA
                </FieldLabel>
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
          {/* Universidade */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="universidade" className="font-bold text-muted-foreground">
              Universidade
            </FieldLabel>
            <Input
              {...register("Universidade")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="universidade"
            />
          </Field>
          {/* Curso */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="curso" className="font-bold text-muted-foreground">
              Curso
            </FieldLabel>
            <Input
              {...register("Curso")}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="curso"
            />
          </Field>
          {/* Cidade Universiade */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="cidadeUniversidade" className="font-bold text-muted-foreground">
              Cidade da Universidade
            </FieldLabel>
            <Input
              {...register("Cidade")}
              className="masx-w-[400px] w-full rounded-[8px] border border-gray-800 p-2"
              type="text"
              id="cidadeUniversidade"
            />
          </Field>
        </div>
        <FieldLegend className="font-bold text-muted-foreground">Notas da Etapa I</FieldLegend>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {/* Nota mestrado*/}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="area" className="font-bold text-muted-foreground">
              MSC (NOTA MESTRADO)
            </FieldLabel>
            <Input
              {...register("msc", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              step="0.01"
              id="area"
            />
          </Field>

          {/* AREA */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="areaFormacaoGraduacao" className="font-bold text-muted-foreground">
              AREA DE FORMAÇÃO DA GRADUAÇÃO
            </FieldLabel>
            <Input
              {...register("areaFormacaoGraduacao", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              step="0.01"
              id="areaFormacaoGraduacao"
            />
          </Field>

          {/* Conceito CAPES */}
          <Controller
            control={control}
            name="conceitoCapesMestrado"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel
                  htmlFor="conceitoCapesMestrado"
                  className="font-bold text-muted-foreground"
                >
                  CONCEITO CAPES
                </FieldLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger className="w-full max-w-[400px]">
                    <SelectValue placeholder="Conceito CAPES" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="0">0</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          {/* A1A2A3A4 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="a1a2a3a4" className="font-bold text-muted-foreground">
              A1, A2, A3, A4
            </FieldLabel>
            <Input
              {...register("a1a2a3a4", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="a1a2a3a4"
            />
          </Field>

          {/* B1B2B3B4 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="b1b2b3b4" className="font-bold text-muted-foreground">
              B1, B2, B3, B4
            </FieldLabel>
            <Input
              {...register("b1b2b3b4", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="b1b2b3b4"
            />
          </Field>
          {/* Nota anteprojeto */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="notaAnteprojeto" className="font-bold text-muted-foreground">
              Nota do Anteprojeto
            </FieldLabel>
            <Input
              {...register("notaAnteprojeto", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="notaAnteprojeto"
            />
          </Field>
        </div>

        {/* Prévia Nota */}
        <Field className="flex flex-col gap-4">
          <FieldLabel
            htmlFor="posCapes3a5"
            className="text-lg font-bold text-muted-foreground"
          >{`Nota (Prévia): ${nota.toFixed(2)}`}</FieldLabel>
        </Field>

        <Button
          type="submit"
          className="col-span-3 my-2 bg-green-500 hover:bg-green-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </form>
    </div>
  )
}
