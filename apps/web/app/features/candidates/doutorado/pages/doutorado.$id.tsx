import { useNavigate, useParams } from "react-router"
import type { Route } from "./+types/doutorado.$id"
import { useEffect, useState } from "react"
import { useUser } from "@/features/auth"
import {
  useCandidatoDoutoradoById,
  useDeleteCandidatoDoutorado,
  useUpdateCandidatoDoutorado,
  useUpdateCandidatoDoutoradoNota,
} from "../hooks"
import { useTeachersSimplified } from "@/features/users/hooks"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { TeacherOption } from "@/shared/ui/teacher-combox"
import type { CandidatoDoutoradoComRelacoes } from "@tcc/server"
import {
  CandidatoDoutoradoNotaSchema,
  type CandidatoDoutoradoNota,
} from "../../shared/schema/candidate.schema"
import type { TeacherData } from "../../mestrado/pages/mestrado.$id"
import { normalizeGru, normalizeIsencao, paraBooleano } from "@/shared/lib/helpers"
import { calcularDoutoradoNota, paraNumeroSeguro } from "@tcc/shared"
import { toast } from "sonner"
import Loading from "@/shared/components/layout/loading"
import CandidateNotFound from "@/shared/components/layout/candidate-not-found"
import CandidateActions from "../../shared/components/avaliacao/candidate-actions"
import CandidateInfo from "../../shared/components/avaliacao/candidate-info"
import FormsAvaliacaoDoutorado from "../components/forms"

export const meta: Route.MetaFunction = () => [
  { title: "SISSEL - Candidato de doutorado", description: "Página do candidato de doutorado" },
]

export default function CandidatoDoutoradoPage() {
  const { id } = useParams<{ id: string | undefined }>()
  const [nota, setNota] = useState(0)
  const [RPQ_MSC, setRPQ_MSC] = useState(0)
  const [RPG, setRPG] = useState(0)

  const userQuery = useUser()
  const candidatoQuery = useCandidatoDoutoradoById(id ?? "")
  const deleteCandidatoMutation = useDeleteCandidatoDoutorado(id ?? "")
  const teachers = useTeachersSimplified()
  const updateCandidatoMutation = useUpdateCandidatoDoutorado()
  const updateNotaMutation = useUpdateCandidatoDoutoradoNota()

  const navigate = useNavigate()

  const form = useForm<CandidatoDoutoradoNota>({
    resolver: zodResolver(CandidatoDoutoradoNotaSchema),
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
  const candidato: CandidatoDoutoradoComRelacoes | null | undefined = candidatoQuery.data

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
        auditorId: candidato.auditorId ?? undefined,
        avaliadorId: candidato.avaliadorId ?? undefined,
        areaPgcomp: candidato.areaPgcomp ?? undefined,
        solicitouIsencaoTaxaInscricao: candidato.solicitouIsencaoTaxaInscricao ?? undefined,
        isencaoAprovada: normalizeIsencao(candidato.isencaoAprovada),
        gru: normalizeGru(candidato.gru),
        homologa:
          candidato.homologa === true ? true : candidato.homologa === false ? false : undefined,
        especiais: paraBooleano(candidato.especiais),
        cotas: paraBooleano(candidato.cotas),
        supra: paraBooleano(candidato.supra),
        nomeUniversidadeMestrado: candidato.nomeUniversidadeMestrado ?? undefined,
        nomeCursoMestrado: candidato.nomeCursoMestrado ?? undefined,
        cidadeMestrado: candidato.cidadeMestrado ?? undefined,
        orientadorMestrado: candidato.orientadorMestrado ?? undefined,
        primeiraOpcaoOrientador: candidato.primeiraOpcaoOrientador ?? undefined,
        segundaOpcaoOrientador: candidato.segundaOpcaoOrientador ?? undefined,
        terceiraOpcaoOrientador: candidato.terceiraOpcaoOrientador ?? undefined,
        msc: candidato.notas?.msc ? Number(candidato.notas?.msc) : 0,
        areaFormacaoGraduacao: candidato.notas?.areaFormacaoGraduacao
          ? Number(candidato.notas?.areaFormacaoGraduacao)
          : 0,
        conceitoCapesMestrado: Number(candidato.notas?.conceitoCapesMestrado ?? 0),
        a1a2a3a4: candidato.notas?.a1a2a3a4 ? Number(candidato.notas?.a1a2a3a4) : 0,
        b1b2b3b4: candidato.notas?.b1b2b3b4 ? Number(candidato.notas?.b1b2b3b4) : 0,
        notaAnteprojeto: candidato.notas?.notaAnteprojeto
          ? Number(candidato.notas?.notaAnteprojeto)
          : 0,
      })
    }
  }, [candidato, reset])

  const camposNota = useWatch({
    control,
    name: [
      "msc",
      "areaFormacaoGraduacao",
      "a1a2a3a4",
      "b1b2b3b4",
      "conceitoCapesMestrado",
      "notaAnteprojeto",
    ],
  })

  useEffect(() => {
    const [msc, areaFormacaoGraduacao, a1a2a3a4, b1b2b3b4, conceitoCapesMestrado, notaAnteprojeto] =
      camposNota

    const resultado = calcularDoutoradoNota({
      msc: paraNumeroSeguro(msc),
      areaFormacaoGraduacao: paraNumeroSeguro(areaFormacaoGraduacao),
      a1a2a3a4: paraNumeroSeguro(a1a2a3a4),
      b1b2b3b4: paraNumeroSeguro(b1b2b3b4),
      conceitoCapesMestrado: paraNumeroSeguro(conceitoCapesMestrado),
      notaAnteprojeto: paraNumeroSeguro(notaAnteprojeto),
    })

    setNota(resultado.pontuacao)
    setRPQ_MSC(resultado.RPQ_MSC)
    setRPG(resultado.RPG)
  }, [camposNota])

  async function onSubmit(dados: CandidatoDoutoradoNota) {
    if (!id) return

    try {
      const resultados = await Promise.allSettled([
        updateCandidatoMutation.mutateAsync({
          id,
          body: {
            areaPgcomp: dados.areaPgcomp ?? undefined,
            avaliadorId: dados.avaliadorId || undefined,
            auditorId: dados.auditorId || undefined,
            solicitouIsencaoTaxaInscricao: dados.solicitouIsencaoTaxaInscricao ?? undefined,
            isencaoAprovada: dados.isencaoAprovada ?? undefined,
            gru: dados.gru || undefined,
            homologa: dados.homologa ?? undefined,
            orientadorMestrado: dados.orientadorMestrado ?? undefined,
            primeiraOpcaoOrientador: dados.primeiraOpcaoOrientador ?? undefined,
            segundaOpcaoOrientador: dados.segundaOpcaoOrientador ?? undefined,
            terceiraOpcaoOrientador: dados.terceiraOpcaoOrientador ?? undefined,
            cidadeMestrado: dados.cidadeMestrado ?? undefined,
            nomeUniversidadeMestrado: dados.nomeUniversidadeMestrado ?? undefined,
            nomeCursoMestrado: dados.nomeCursoMestrado ?? undefined,
            especiais: dados.especiais ?? undefined,
            cotas: dados.cotas ?? undefined,
            supra: dados.supra ?? undefined,
          },
        }),
        updateNotaMutation.mutateAsync({
          id,
          body: {
            msc: dados.msc ?? null,
            areaFormacaoGraduacao: dados.areaFormacaoGraduacao ?? null,
            a1a2a3a4: dados.a1a2a3a4 ?? null,
            b1b2b3b4: dados.b1b2b3b4 ?? null,
            conceitoCapesMestrado: dados.conceitoCapesMestrado ?? null,
            notaAnteprojeto: dados.notaAnteprojeto ?? null,
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
      <FormsAvaliacaoDoutorado
        handleSubmit={handleSubmit}
        register={register}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        RPG={RPG}
        RPQ_MSC={RPQ_MSC}
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
