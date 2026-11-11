import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  CandidatoMestradoNotaSchema,
  type CandidatoMestradoNota,
} from "@/features/candidates/shared/schema/candidate.schema"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"
import { calcularMestradoNota, paraNumeroSeguro } from "@tcc/shared"

import Loading from "@/shared/components/layout/loading"
import CandidateNotFound from "@/shared/components/layout/candidate-not-found"
import {
  normalizeGru,
  paraBooleano,
  valorIsencaoSelect,
  valorSimNaoSelect,
} from "@/shared/lib/helpers"
import FormsAvaliacaoMestrado from "@/features/candidates/mestrado/components/forms"
import CandidateInfo from "@/features/candidates/shared/components/avaliacao/candidate-info"
import CandidateActions from "@/features/candidates/shared/components/avaliacao/candidate-actions"
import { useUser } from "@/features/auth/hooks/auth.queries"
import {
  useCandidatoMestradoById,
  useDeleteCandidatoMestrado,
  useUpdateCandidatoMestrado,
  useUpdateCandidatoMestradoNota,
} from "@/features/candidates/mestrado/hooks"
import { useTeachersSimplified } from "@/features/users/hooks"
import { toast } from "sonner"
import type { Route } from "./+types/mestrado.$id"

export type TeacherOption = { id: string; nome: string }
export type TeacherData = { id: string; nome?: string | null; name?: string | null }

export const meta: Route.MetaFunction = () => [
  { title: `SISSEL - Avaliação candidato Mestrado` },
  { description: "Página de avaliação do candidato de mestrado" },
]

export default function AvaliacaoCandidatoMestradoPage() {
  const { id } = useParams<{ id: string | undefined }>()
  const [nota, setNota] = useState(0)
  const [RGRAD, setRGRAD] = useState(0)
  const [RPQ_GRAD, setRPQ_GRAD] = useState(0)

  const userQuery = useUser()
  const candidatoQuery = useCandidatoMestradoById(id ?? "")
  const deleteCandidatoMutation = useDeleteCandidatoMestrado(id ?? "")
  const teachers = useTeachersSimplified()
  const updateCandidatoMutation = useUpdateCandidatoMestrado()
  const updateNotaMutation = useUpdateCandidatoMestradoNota()

  const navigate = useNavigate()

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

  useEffect(() => {
    if (candidato) {
      reset({
        avaliadorId: candidato.avaliadorId ?? undefined,
        auditorId: candidato.auditorId ?? undefined,
        cidadeResidencia: candidato.cidadeResidencia ?? undefined,
        solicitouIsencaoTaxaInscricao: candidato.solicitouIsencaoTaxaInscricao ?? undefined,
        isencaoAprovada: candidato.isencaoAprovada ?? undefined,
        gru: normalizeGru(candidato.gru),
        homologa:
          candidato.homologa === true ? true : candidato.homologa === false ? false : undefined,
        especiais: paraBooleano(candidato.especiais),
        cotas: paraBooleano(candidato.cotas),
        supra: paraBooleano(candidato.supra),
        universidade: candidato.universidade ?? undefined,
        cursoGrad: candidato.curso ?? undefined,
        cidadeGrad: candidato.cidadeGraduacao ?? undefined,
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
    setRGRAD(resultado.RGRAD)
    setRPQ_GRAD(resultado.RPQ_GRAD)
  }, [camposNota])

  async function onSubmit(dados: CandidatoMestradoNota) {
    if (!id) return

    try {
      const resultados = await Promise.allSettled([
        updateCandidatoMutation.mutateAsync({
          id,
          body: {
            avaliadorId: dados.avaliadorId || undefined,
            auditorId: dados.auditorId || undefined,
            solicitouIsencaoTaxaInscricao: dados.solicitouIsencaoTaxaInscricao ?? undefined,
            isencaoAprovada: dados.isencaoAprovada ?? undefined,
            gru: dados.gru || undefined,
            homologa: dados.homologa ?? undefined,
            cidadeGraduacao: dados.cidadeGrad ?? undefined,
            universidade: dados.universidade ?? undefined,
            curso: dados.cursoGrad ?? undefined,
            especiais: dados.especiais ?? undefined,
            cidadeResidencia: dados.cidadeResidencia ?? undefined,

            cotas: dados.cotas ?? undefined,
            supra: dados.supra ?? undefined,
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

      toast.success("Avaliação salva com sucesso")
      navigate("/dashboard")
    } catch (error) {
      toast.error(
        "Erro ao salvar avaliação" + (error instanceof Error ? ` Detalhes: ${error.message}` : "")
      )
    }
  }
  if (isLoading) {
    return <Loading />
  }

  if (!candidato) {
    return <CandidateNotFound />
  }

  return (
    <>
      <CandidateActions isAdmin={isAdmin} deleteCandidatoMutation={deleteCandidatoMutation} />
      <CandidateInfo candidato={candidato} />
      <FormsAvaliacaoMestrado
        handleSubmit={handleSubmit}
        register={register}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        RGRAD={RGRAD}
        RPQ_GRAD={RPQ_GRAD}
        nota={nota}
        isAdmin={isAdmin}
        teachersData={teachersData}
        isTeachersLoading={isTeachersLoading}
        candidato={candidato}
        onSubmit={onSubmit}
      />
    </>
  )
}
