import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { CandidatoMestradoNotaSchema, type CandidatoMestradoNota } from "@/schema/schema"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"
import { calcularMestradoNota, paraNumeroSeguro } from "@/lib/calculoNotas"
import { useTeachersSimplified, useToast } from "@/hooks"
import {
  useCandidatoMestradoById,
  useDeleteCandidatoMestrado,
  useUpdateCandidatoMestrado,
  useUpdateCandidatoMestradoNota,
} from "@/hooks/candidato.hooks"
import { useUser } from "@/services/useUser"

import { Header } from "@/components/layout/header"
import type { Route } from "../+types/root"
import Loading from "@/components/layout/loading"
import CandidateNotFound from "@/components/layout/candidate-not-found"
import { normalizeGru, paraBooleano, valorIsencaoSelect, valorSimNaoSelect } from "@/lib/helpers"
import FormsAvaliacaoMestrado from "@/components/avaliacao/mestrado/forms"
import CandidateInfo from "@/components/avaliacao/mestrado/candidate-info"
import CandidateActions from "@/components/avaliacao/mestrado/candidate-actions"

type TeacherOption = { id: number; nome: string }
type TeacherData = { id: number; nome?: string | null; name?: string | null }

export const meta: Route.MetaFunction = () => [
  { title: `SISSEL - Avaliação candidato Mestrado` },
  { description: "Página de avaliação do candidato de mestrado" },
]

export default function AvaliacaoCandidatoMestradoPage() {
  const { id } = useParams<{ id: string | undefined }>()
  const [nota, setNota] = useState(0)

  const userQuery = useUser()
  const candidatoQuery = useCandidatoMestradoById(id ?? "")
  const deleteCandidatoMutation = useDeleteCandidatoMestrado(id ?? "")
  const teachers = useTeachersSimplified()
  const updateCandidatoMutation = useUpdateCandidatoMestrado()
  const updateNotaMutation = useUpdateCandidatoMestradoNota()

  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<CandidatoMestradoNota>({
    resolver: zodResolver(CandidatoMestradoNotaSchema),
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const user = userQuery.data
  const candidato: CandidatoMestradoComRelacoes | null | undefined = candidatoQuery.data

  const isLoading = candidatoQuery.isLoading || userQuery.isLoading
  const isAdmin = user?.role === "ADMIN"
  const isTeachersLoading = teachers.isLoading || teachers.isFetching

  const teachersData: TeacherOption[] =
    (teachers.data as unknown as TeacherData[] | undefined)?.map((t) => ({
      id: t.id,
      nome: t.nome ?? t.name ?? "",
    })) ?? []

  useEffect(() => {
    if (!user && !userQuery.isLoading) {
      navigate("/")
    }
  }, [user, userQuery.isLoading, navigate])

  useEffect(() => {
    if (!!candidato) {
      document.title = `SISSEL |  Avaliação - ${candidato.nome}`
    }
  }, [candidato])

  // console.log(candidato)

  useEffect(() => {
    if (candidato) {
      reset({
        avaliadorId: candidato.avaliadorId ?? undefined,
        auditorId: candidato.auditorId ?? undefined,
        solicitouIsencaoTaxaInscricao: valorIsencaoSelect(candidato.solicitouIsencaoTaxaInscricao),
        isencaoAprovada: candidato.isencaoAprovada ?? undefined,
        gru: normalizeGru(candidato.gru),
        Homologa: valorSimNaoSelect(candidato.homologa),
        especiais: paraBooleano(candidato.especiais),
        cotas: paraBooleano(candidato.cotas),
        SUPRA: paraBooleano(candidato.supra),
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

  async function onSubmit(dados: CandidatoMestradoNota) {
    if (!id) return

    try {
      const resultados = await Promise.allSettled([
        updateCandidatoMutation.mutateAsync({
          id,
          body: {
            avaliado: true,
            avaliadorId: dados.avaliadorId || undefined,
            auditorId: dados.auditorId || undefined,
            solicitouIsencaoTaxaInscricao: dados.solicitouIsencaoTaxaInscricao ?? undefined,
            isencaoAprovada: dados.isencaoAprovada ?? undefined,
            gru: dados.gru || undefined,
            homologa: dados.Homologa || undefined,
            especiais: dados.especiais ?? undefined,
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
      navigate("/dashboard")
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
    return <Loading />
  }

  if (!candidato) {
    return <CandidateNotFound />
  }

  return (
    <div className="p-4 md:p-8">
      <Header className="mb-6" />
      <CandidateActions isAdmin={isAdmin} deleteCandidatoMutation={deleteCandidatoMutation} />
      <CandidateInfo candidato={candidato} />
      <FormsAvaliacaoMestrado
        handleSubmit={handleSubmit}
        register={register}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        nota={nota}
        isAdmin={isAdmin}
        teachersData={teachersData}
        isTeachersLoading={isTeachersLoading}
        candidato={candidato}
        onSubmit={onSubmit}
      />
    </div>
  )
}
