import CandidatosTabLoading from "./candidatos-tab-loading"
import CandidatosTabError from "./candidatos-tab-error"
import { HomeTableCandidatos } from "."
import { TabsContent } from "../../../../../shared/ui/tabs"
import ProfessoresTab from "./professores-tab"
import { PaginationControls } from "@/shared/ui/pagination-controls"
import { useUser } from "@/features/auth"
import { useCandidatosMestrado } from "@/features/candidates/mestrado/hooks"
import { useCandidatosDoutorado } from "@/features/candidates/doutorado/hooks"
import { useCandidatesByTeacherId } from "../../use-meus-candidatos"
import { useTeachers } from "@/features/users/hooks"
import type { Paginated } from "@/shared/types/pagination"
import type { CandidatoResumo } from "@tcc/shared"
import { useEffect, useRef } from "react"

type TabsType = "mestrado" | "doutorado" | "meus" | "professores" | undefined

interface CandidatosTabProps {
  tabValue: string
  type?: TabsType // sem type = todos os candidatos
  searchQuery: string
  orderBy?: string
  order?: "asc" | "desc"
  setOrderBy?: (orderBy: string) => void
  setOrder?: (order: "asc" | "desc") => void
  onSort?: (key: string) => void
  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function CandidatosTab({
  tabValue,
  type,
  searchQuery,
  orderBy,
  order,
  setOrderBy,
  setOrder,
  onSort,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: CandidatosTabProps) {
  const user = useUser().data
  const listRef = useRef<HTMLDivElement>(null)

  // Smooth scroll to list when page changes
  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [page])

  const mestradoQuery = useCandidatosMestrado({
    page,
    limit,
    search: searchQuery,
    sortBy: orderBy,
    order,
  })
  const doutoradoQuery = useCandidatosDoutorado({
    page,
    limit,
    search: searchQuery,
    sortBy: orderBy,
    order,
  })
  const meusCandidatosQuery = useCandidatesByTeacherId(user?.id ?? 0, {
    page,
    limit,
    search: searchQuery,
    sortBy: orderBy,
    order,
  })
  const professoresQuery = useTeachers({
    page,
    limit,
    search: searchQuery,
    sortBy: orderBy,
    order,
  })

  if (!user) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
        Ops, nenhum usuário encontrado.
      </div>
    )
  }

  const candidateQuery = {
    mestrado: mestradoQuery,
    doutorado: doutoradoQuery,
    meus: meusCandidatosQuery,
    professores: professoresQuery,
  }[type === "professores" ? "professores" : (type ?? "mestrado")]

  function renderContent() {
    if (type === "professores") {
      // Show skeleton only on initial load (isPending), keep data during background fetch (isFetching)
      if (professoresQuery.isPending && !professoresQuery.data) return <CandidatosTabLoading />
      if (professoresQuery.isError) {
        return <CandidatosTabError error={professoresQuery.error} />
      }

      const professoresData = professoresQuery.data as Paginated<any> | any[]
      const data = Array.isArray(professoresData) ? professoresData : professoresData.data
      const meta = Array.isArray(professoresData) ? null : professoresData.meta

      if (!data || data.length === 0) {
        return (
          <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
            Ops, nenhum professor encontrado.
          </div>
        )
      }

      return (
        <>
          <ProfessoresTab
            data={data}
            searchQuery={searchQuery}
            orderBy={orderBy}
            order={order}
            setOrderBy={setOrderBy}
            setOrder={setOrder}
            onSort={onSort}
          />
          {meta && (
            <PaginationControls
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              totalPages={meta.totalPages}
              hasNextPage={meta.hasNextPage}
              hasPreviousPage={meta.hasPreviousPage}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          )}
        </>
      )
    }

    // Show skeleton only on initial load (isPending), keep data during background fetch (isFetching)
    if (candidateQuery.isPending && !candidateQuery.data) return <CandidatosTabLoading />
    if (candidateQuery.isError) return <CandidatosTabError error={candidateQuery.error} />

    // For "meus" candidates, the endpoint returns array directly (not paginated yet)
    const isMeus = type === "meus"
    const rawData = candidateQuery.data
    const data: CandidatoResumo[] = isMeus ? (rawData as CandidatoResumo[]) : (rawData as Paginated<CandidatoResumo>).data
    const meta = isMeus ? null : (rawData as Paginated<CandidatoResumo>).meta

    if (!data || data.length === 0) {
      return (
        <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
          Ops, nenhum candidato encontrado.
        </div>
      )
    }

    return (
      <>
        <HomeTableCandidatos
          data={data}
          searchQuery={searchQuery}
          orderBy={orderBy}
          order={order}
          setOrderBy={setOrderBy}
          setOrder={setOrder}
          onSort={onSort}
          type={type === "meus" ? "meus" : type}
        />
        {meta && (
          <PaginationControls
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            hasNextPage={meta.hasNextPage}
            hasPreviousPage={meta.hasPreviousPage}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        )}
      </>
    )
  }

  return <TabsContent value={tabValue}><div ref={listRef}>{renderContent()}</div></TabsContent>
}