import { useCallback, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router"

import { useQueryParamState } from "@/shared/hooks/use-query-param-state"

import { UploadCandidatos } from "@/features/candidates/shared/components/candidatos/upload-candidate"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import SearchBar from "@/shared/ui/search-bar"
import { CandidatosTab } from "@/features/candidates/shared/components/candidatos-tab/candidato-tab"
import { TABS } from "@/shared/lib/constants"
import { useUser } from "@/features/auth"
import type { Route } from "./+types/dashboard"

export const meta: Route.MetaFunction = () => [
  {
    title: "SISSEL - Dashboard",
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Dashboard",
      description: "Página de dashboard do sistema de seleção de candidatos.",
    }),
  },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useQueryParamState("searchQuery", "")
  const [orderBy, setOrderBy] = useQueryParamState("orderBy", "nome")
  const [order, setOrder] = useQueryParamState<"asc" | "desc">("order", "asc")
  const [activeTab, setActiveTab] = useQueryParamState("activeTab", "meus-candidatos")
  const [, setSearchParams] = useSearchParams()

  const navigate = useNavigate()

  const userQuery = useUser()
  const isAdmin = userQuery.data?.role === "ADMIN"

  const currentTab = TABS.some((t) => t.value === activeTab) ? activeTab : "meus-candidatos"

  const handleSort = useCallback(
    (key: string) => {
      const nextOrder = orderBy === key && order === "asc" ? "desc" : "asc"

      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set("orderBy", JSON.stringify(key))

          if (nextOrder === "asc") {
            params.delete("order")
          } else {
            params.set("order", JSON.stringify(nextOrder))
          }

          return params
        },
        { replace: true }
      )
    },
    [order, orderBy, setSearchParams]
  )

  useEffect(() => {
    if (!userQuery.data && !userQuery.isLoading) {
      navigate("/")
    }
  }, [userQuery.data, userQuery.isLoading, navigate])

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeTrigger = listRef.current?.querySelector<HTMLElement>('[data-state="active"]')
    activeTrigger?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [currentTab])

  return (
    <div className="">
      <div className="mb-6 flex flex-row items-center justify-between gap-2">
        <div className="flex w-full flex-col items-center gap-2 self-stretch md:flex-row md:gap-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        {!!isAdmin && <UploadCandidatos />}
      </div>

      <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full hover:cursor-pointer">
        <div className="mb-4">
          <TabsList
            ref={listRef}
            className="relative flex h-auto w-full snap-x justify-start gap-1 overflow-x-auto rounded-full border bg-white p-1 shadow-none [scrollbar-width:none] md:max-w-lg md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
          >
            {TABS.filter((tab) => !tab.onlyAdmin || isAdmin).map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md md:flex-1"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {TABS.filter((tab) => !tab.onlyAdmin || isAdmin).map((tab) => (
          <CandidatosTab
            key={tab.value}
            tabValue={tab.value}
            type={tab.type}
            searchQuery={searchQuery}
            orderBy={orderBy}
            order={order}
            setOrderBy={setOrderBy}
            setOrder={setOrder}
            onSort={handleSort}
          />
        ))}
      </Tabs>
    </div>
  )
}
