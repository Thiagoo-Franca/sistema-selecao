import { useNavigate, useParams } from "react-router"
import { useToast } from "@/hooks"
import { useEffect, useState } from "react"
import {
  useCandidatoMestradoById,
  useUpdateCandidatoMestrado,
  useUpdateCandidatoMestradoNota,
} from "@/hooks/candidato.hooks"
import { useUser } from "@/services/useUser"
import { Header } from "@/components/layout/Header"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel, FieldLegend } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CandidatoMestradoNotaSchema, type CandidatoMestradoNota } from "@/schema/schema"
import { calcularMestradoNota, paraNumeroSeguro } from "@/lib/calculoNotas"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"
import type { Route } from "../+types/root"

export const meta: Route.MetaFunction = () => [
  { title: `SISSEL - Avaliação candidato Mestrado` },
  { description: "Página de avaliação do candidato de mestrado" },
]

const GRU_OPTIONS = [
  { value: "isento", label: "ISENTO" },
  { value: "pago", label: "PAGO" },
  { value: "aberto", label: "ABERTO" },
  { value: "nao-isento", label: "NÃO ISENTO" },
  { value: "nao-pagou", label: "NÃO PAGOU" },
] as const

function normalizeGru(value: string | null | undefined) {
  const normalizedValue = value?.trim().toLowerCase()
  return GRU_OPTIONS.find((option) => option.value === normalizedValue)?.value ?? ""
}

function paraBooleano(value: unknown): boolean | undefined {
  if (value === true || value === 1) return true
  if (value === false || value === 0) return false

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase()
    if (["true", "t", "sim", "1"].includes(normalizedValue)) return true
    if (["false", "f", "nao", "não", "0"].includes(normalizedValue)) return false
  }

  return undefined
}

function valorBooleanoSelect(value: boolean | undefined) {
  return value === undefined ? "" : value ? "sim" : "nao"
}

function valorSimNaoSelect(value: unknown) {
  if (value === true || value === 1) return "sim"
  if (value === false || value === 0) return "nao"

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase()
    if (["sim", "true", "t", "1"].includes(normalizedValue)) return "sim"
    if (["nao", "não", "false", "f", "0"].includes(normalizedValue)) return "nao"
  }

  return ""
}

export default function AvaliacaoCandidatoMestradoPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string | undefined }>()
  const [nota, setNota] = useState(0)
  const { toast } = useToast()

  const userQuery = useUser()
  const candidatoQuery = useCandidatoMestradoById(id ?? "")

  const form = useForm<CandidatoMestradoNota>({
    resolver: zodResolver(CandidatoMestradoNotaSchema),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const user = userQuery.data
  const candidato: CandidatoMestradoComRelacoes | null | undefined = candidatoQuery.data
  const isLoading = candidatoQuery.isLoading || userQuery.isLoading
  const isAdmin = user?.role === "ADMIN"

  useEffect(() => {
    if (!user && !userQuery.isLoading) {
      navigate("/")
    }
  }, [user, userQuery.isLoading, navigate])

  useEffect(() => {
    if (candidato) {
      reset({
        avaliador1: candidato.avaliador1 ? candidato.avaliador1 : "",
        avaliador2: candidato.avaliador2 ? candidato.avaliador2 : "",
        solicitouIsencaoTaxaInscricao: paraBooleano(candidato.solicitouIsencaoTaxaInscricao),
        isencaoAprovada: paraBooleano(candidato.isencaoAprovada),
        gru: normalizeGru(candidato.gru),
        Homologa: valorSimNaoSelect(candidato.homologa),
        especiais: paraBooleano(candidato.possuiNecessidadesEspeciais),
        cotas: paraBooleano(candidato.vagasNegrosPardos),
        SUPRA: paraBooleano(candidato.vagasSupranumerarias),
        grad: candidato.notas?.grad ? Number(candidato.notas?.grad) : 0,
        area: candidato.notas?.area ? Number(candidato.notas?.area) : 0,
        enade: Number(candidato.notas?.enade ?? 0),
        a1a2a3a4: candidato.notas?.a1a2a3a4 ? Number(candidato.notas?.a1a2a3a4) : 0,
        b1b2b3b4: candidato.notas?.b1b2b3b4 ? Number(candidato.notas?.b1b2b3b4) : 0,
        icIt: candidato.notas?.icIt ? Number(candidato.notas?.icIt) : 0,
        poscomp: candidato.notas?.poscomp ? Number(candidato.notas?.poscomp) : 0,
        disciplinaPosCapes6Mais: candidato.notas?.disciplinaPosCapes6Mais
          ? Number(candidato.notas?.disciplinaPosCapes6Mais)
          : 0,
        disciplinaPosCapes3a5: candidato.notas?.disciplinaPosCapes3a5
          ? Number(candidato.notas?.disciplinaPosCapes3a5)
          : 0,
        notaEtapaII: candidato.notas?.notaEtapaII
          ? Number(candidato.notas?.notaEtapaII)
          : undefined,
      })
    }
  }, [candidato, reset])

  const camposNota = useWatch({
    control,
    name: [
      "grad",
      "area",
      "enade",
      "a1a2a3a4",
      "b1b2b3b4",
      "icIt",
      "poscomp",
      "disciplinaPosCapes6Mais",
      "disciplinaPosCapes3a5",
      "notaEtapaII",
    ],
  })

  useEffect(() => {
    const [
      grad,
      area,
      enade,
      a1a2a3a4,
      b1b2b3b4,
      icIt,
      poscomp,
      disciplinaPosCapes6Mais,
      disciplinaPosCapes3a5,
      notaEtapaII,
    ] = camposNota

    const resultado = calcularMestradoNota({
      grad: paraNumeroSeguro(grad),
      area: paraNumeroSeguro(area),
      enade: paraNumeroSeguro(enade),
      a1a2a3a4: paraNumeroSeguro(a1a2a3a4),
      b1b2b3b4: paraNumeroSeguro(b1b2b3b4),
      icIt: paraNumeroSeguro(icIt),
      poscomp: paraNumeroSeguro(poscomp),
      disciplinaPosCapes6Mais: paraNumeroSeguro(disciplinaPosCapes6Mais),
      disciplinaPosCapes3a5: paraNumeroSeguro(disciplinaPosCapes3a5),
      notaEtapaII: paraNumeroSeguro(notaEtapaII),
    })

    setNota(resultado.pontuacao)
  }, [camposNota])

  const updateCandidatoMutation = useUpdateCandidatoMestrado()
  const updateNotaMutation = useUpdateCandidatoMestradoNota()

  async function onSubmit(dados: CandidatoMestradoNota) {
    if (!id) return

    try {
      const resultados = await Promise.allSettled([
        updateCandidatoMutation.mutateAsync({
          id,
          body: {
            avaliado: true,
            avaliador1: dados.avaliador1 || undefined,
            avaliador2: dados.avaliador2 || undefined,
            solicitouIsencaoTaxaInscricao: dados.solicitouIsencaoTaxaInscricao ?? undefined,
            isencaoAprovada: dados.isencaoAprovada ?? undefined,
            gru: dados.gru || undefined,
            homologa: dados.Homologa || undefined,
            possuiNecessidadesEspeciais: dados.especiais ?? undefined,
            vagasNegrosPardos: dados.cotas ?? undefined,
            vagasSupranumerarias: dados.SUPRA ?? undefined,
          },
        }),
        updateNotaMutation.mutateAsync({
          id,
          body: {
            grad: dados.grad,
            area: dados.area,
            enade: dados.enade,
            a1a2a3a4: dados.a1a2a3a4,
            b1b2b3b4: dados.b1b2b3b4,
            icIt: dados.icIt,
            poscomp: dados.poscomp,
            disciplinaPosCapes6Mais: dados.disciplinaPosCapes6Mais,
            disciplinaPosCapes3a5: dados.disciplinaPosCapes3a5,
            notaEtapaII: Number.isNaN(dados.notaEtapaII) ? undefined : dados.notaEtapaII,
          },
        }),
      ])

      for (const resultado of resultados) {
        if (resultado.status === "rejected") {
          throw resultado.reason
        }
      }

      toast({
        title: "Avaliação salva com sucesso",
        description: "A avaliação do candidato de mestrado foi salva com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar avaliação",
        description:
          "Ocorreu um erro ao salvar a avaliação do candidato de mestrado." +
          (error instanceof Error ? ` Detalhes: ${error.message}` : ""),
      })
    }
  }
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
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

  console.log("Candidato:", candidato)
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="mb-6 flex flex-row items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <div className="my-4 flex flex-col gap-2 md:my-6">
        <h1 className="text-2xl font-semibold">{candidato.nome}</h1>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>
            Avalie o candidato: {candidato.nome} - {candidato.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Áreas de interesse do candidato:{" "}
            <span className="font-medium">{candidato.primeiraAreaPreferencia}</span>{" "}
            {candidato.segundaAreaPreferencia ? ` , ${candidato.segundaAreaPreferencia}` : null}
          </p>
          <p>
            Dados da graduação: {candidato.nomeUniversidadeGraduacao} -{" "}
            {candidato.nomeCursoGraduacao} - {candidato.cidadeOndeRealizouGraduacao}
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
        <FieldLegend className="font-bold text-muted-foreground">Avaliadores</FieldLegend>
        <div className="grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
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
            <FieldError>{errors.avaliador1?.message}</FieldError>
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
            <FieldError>{errors.avaliador2?.message}</FieldError>
          </Field>
        </div>
        <div className="mt-4 grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
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
                <Select
                  key={valorBooleanoSelect(field.value)}
                  onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                  value={valorBooleanoSelect(field.value)}
                >
                  <SelectTrigger
                    className="w-full max-w-[400px]"
                    id="solicitouIsencaoTaxaInscricao"
                  >
                    <SelectValue placeholder="Pediu ISENÇÃO?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.solicitouIsencaoTaxaInscricao?.message}</FieldError>
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
                <Select
                  key={valorBooleanoSelect(field.value)}
                  onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                  value={valorBooleanoSelect(field.value)}
                >
                  {" "}
                  <SelectTrigger className="w-full max-w-[400px]" id="isencaoAprovada">
                    <SelectValue placeholder="Isenção aprovada?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.isencaoAprovada?.message}</FieldError>
              </Field>
            )}
          />

          {/* GRU (Guia 
de Recolhimento da União) */}
          <Controller
            control={control}
            name="gru"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="gru" className="font-bold text-muted-foreground">
                  GRU
                </FieldLabel>
                <Select
                  key={field.value ?? "empty"}
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  {" "}
                  <SelectTrigger className="w-full max-w-[400px]" id="gru">
                    <SelectValue placeholder="GRU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {GRU_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.gru?.message}</FieldError>
              </Field>
            )}
          />

          {/* Homologa */}
          <Controller
            control={control}
            name="Homologa"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="Homologa" className="font-bold text-muted-foreground">
                  Homologa?
                </FieldLabel>
                <Select
                  key={valorSimNaoSelect(field.value)}
                  onValueChange={(v) => field.onChange(v === "sim" ? "sim" : "nao")}
                  value={valorSimNaoSelect(field.value)}
                >
                  <SelectTrigger className="w-full max-w-[400px]" id="Homologa">
                    <SelectValue placeholder="Homologa?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sim">SIM</SelectItem>
                      <SelectItem value="nao">NÃO</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.Homologa?.message}</FieldError>
              </Field>
            )}
          />
          {/* Especiais */}
          <Controller
            control={control}
            name="especiais"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="especiais" className="font-bold text-muted-foreground">
                  Especiais
                </FieldLabel>
                <Select
                  key={valorBooleanoSelect(field.value)}
                  onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                  value={valorBooleanoSelect(field.value)}
                >
                  <SelectTrigger className="w-full max-w-[400px]" id="especiais">
                    <SelectValue placeholder="Especiais?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sim">SIM</SelectItem>
                      <SelectItem value="nao">NÃO</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.especiais?.message}</FieldError>
              </Field>
            )}
          />

          {/* Cotas */}
          <Controller
            control={control}
            name="cotas"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="cotas" className="font-bold text-muted-foreground">
                  Cotas (Negros)
                </FieldLabel>
                <Select
                  key={valorBooleanoSelect(field.value)}
                  onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                  value={valorBooleanoSelect(field.value)}
                >
                  <SelectTrigger className="w-full max-w-[400px]" id="cotas">
                    <SelectValue placeholder="Cotas (Negros)?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sim">SIM</SelectItem>
                      <SelectItem value="nao">NÃO</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.cotas?.message}</FieldError>
              </Field>
            )}
          />

          {/* SUPRA */}
          <Controller
            control={control}
            name="SUPRA"
            render={({ field }) => (
              <Field className="flex flex-col gap-4">
                <FieldLabel htmlFor="SUPRA" className="font-bold text-muted-foreground">
                  SUPRA
                </FieldLabel>
                <Select
                  key={valorBooleanoSelect(field.value)}
                  onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                  value={valorBooleanoSelect(field.value)}
                >
                  <SelectTrigger className="w-full max-w-[400px]" id="SUPRA">
                    <SelectValue placeholder="SUPRA?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="sim">SIM</SelectItem>
                      <SelectItem value="nao">NÃO</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.SUPRA?.message}</FieldError>
              </Field>
            )}
          />
        </div>
        <FieldLegend className="font-bold">Notas da Etapa I</FieldLegend>
        <div className="grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
          {/* GRAD */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="grad" className="font-bold text-muted-foreground">
              GRAD
            </FieldLabel>
            <Input
              {...register("grad", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              step="0.01"
              id="grad"
            />
            <FieldError>{errors.grad?.message}</FieldError>
          </Field>

          {/* AREA */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="area" className="font-bold text-muted-foreground">
              AREA
            </FieldLabel>
            <Input
              {...register("area", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              step="0.01"
              id="area"
            />
            <FieldError>{errors.area?.message}</FieldError>
          </Field>

          {/* ENADE */}
          <Controller
            control={control}
            name="enade"
            render={({ field }) => {
              const enadeValue =
                typeof field.value === "number" &&
                Number.isInteger(field.value) &&
                field.value >= 1 &&
                field.value <= 5
                  ? String(field.value)
                  : ""

              return (
                <Field className="flex flex-col gap-4">
                  <FieldLabel htmlFor="enade" className="font-bold text-muted-foreground">
                    ENADE
                  </FieldLabel>

                  <Select
                    key={enadeValue || "empty"}
                    value={enadeValue}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full max-w-[400px]" id="enade">
                      <SelectValue placeholder="ENADE" />
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
                  <FieldError>{errors.enade?.message}</FieldError>
                </Field>
              )
            }}
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
            <FieldError>{errors.a1a2a3a4?.message}</FieldError>
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
            <FieldError>{errors.b1b2b3b4?.message}</FieldError>
          </Field>

          {/* IC/IT */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="icit" className="font-bold text-muted-foreground">
              IC/IT
            </FieldLabel>
            <Input
              {...register("icIt", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="icit"
            />
            <FieldError>{errors.icIt?.message}</FieldError>
          </Field>

          {/* POSCOMP */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="poscomp" className="font-bold text-muted-foreground">
              POSCOMP
            </FieldLabel>
            <Input
              {...register("poscomp", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="poscomp"
            />
            <FieldError>{errors.poscomp?.message}</FieldError>
          </Field>

          {/* DISCIPLINA PÓS CAPES 6+ */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="posCapes" className="font-bold text-muted-foreground">
              DISCIPLINA PÓS CAPES 6+
            </FieldLabel>
            <Input
              {...register("disciplinaPosCapes6Mais", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="posCapes"
            />
            <FieldError>{errors.disciplinaPosCapes6Mais?.message}</FieldError>
          </Field>

          {/* DISCIPLINA PÓS CAPES 3 a 5 */}
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="posCapes3a5" className="font-bold text-muted-foreground">
              DISCIPLINA PÓS CAPES 3 a 5
            </FieldLabel>
            <Input
              {...register("disciplinaPosCapes3a5", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              id="posCapes3a5"
            />
            <FieldError>{errors.disciplinaPosCapes3a5?.message}</FieldError>
          </Field>
        </div>

        <FieldLegend className="font-bold">Notas da Etapa II</FieldLegend>
        {/* Nota etapa II */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="notaEtapaII" className="font-bold text-muted-foreground">
            Nota etapa II
          </FieldLabel>
          <Input
            {...register("notaEtapaII", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            id="notaEtapaII"
          />
          <FieldError>{errors.notaEtapaII?.message}</FieldError>
        </Field>
        {/* Prévia Nota */}
        <Field className="flex flex-col gap-4">
          <FieldLabel
            htmlFor="posCapes3a5"
            className="text-lg font-bold text-muted-foreground"
          >{`NOTA FINAL (PRÉVIA): ${nota.toFixed(2)}`}</FieldLabel>
        </Field>

        <Button
          type="submit"
          className="col-span-3 my-2 bg-green-500 hover:bg-green-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </form>
      <hr className="my-4" />
    </div>
  )
}
