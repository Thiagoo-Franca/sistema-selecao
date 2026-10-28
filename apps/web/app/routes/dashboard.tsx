import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useUser } from "@/services/useUser"

import { useQueryParamsState } from "@/hooks/use-query-param-state"

import type { Route } from "./+types/dashboard"
import { UploadCandidatosMestrado } from "@/components/candidatos/upload-candidate"
import { Header } from "@/components/layout/header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchBar from "@/components/ui/search-bar"
import { CandidatosTab } from "@/components/candidatos-tab/candidato-tab"

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
const TABS = [
  { value: "meus-candidatos", label: "Meus Candidatos", type: "meus", onlyAdmin: false },
  { value: "candidatos", label: "Todos os Candidatos", type: undefined, onlyAdmin: false },
  { value: "candidatos-mestrado", label: "Mestrado", type: "mestrado", onlyAdmin: false },
  { value: "candidatos-doutorado", label: "Doutorado", type: "doutorado", onlyAdmin: false },
  { value: "professores", label: "Professores", type: "professores", onlyAdmin: true },
] as const

export default function Home() {
  const [searchQuery, setSearchQuery] = useQueryParamsState("searchQuery", "")
  const [orderBy, setOrderBy] = useQueryParamsState("orderBy", "nome")
  const [order, setOrder] = useQueryParamsState<"asc" | "desc">("order", "asc")
  const [activeTab, setActiveTab] = useQueryParamsState("activeTab", "candidatos")

  const navigate = useNavigate()

  const userQuery = useUser()
  const isAdmin = userQuery.data?.role === "ADMIN"

  const currentTab = TABS.some((t) => t.value === activeTab) ? activeTab : "candidatos"

  useEffect(() => {
    if (!userQuery.data && !userQuery.isLoading) {
      navigate("/")
    }
  }, [userQuery.data, navigate])

  return (
    <div className="mx-auto px-4 md:px-8">
      <Header className="mb-6 py-2" />
      <div className="mb-6 flex flex-row items-center justify-between gap-2">
        <div className="flex w-full flex-col items-center gap-2 self-stretch md:flex-row md:gap-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        {!!isAdmin && <UploadCandidatosMestrado />}
      </div>

      <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full hover:cursor-pointer">
        <div className="mb-4 flex items-center justify-between">
          <TabsList className="flex w-full flex-row items-center justify-between gap-2 overflow-x-auto rounded-lg border-none bg-gradient-to-r from-white to-transparent p-1 shadow-none md:max-w-lg md:overflow-x-visible">
            {TABS.filter((tab) => !tab.onlyAdmin || isAdmin).map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full rounded-lg bg-white px-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 data-[state=active]:shadow-md md:px-4"
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
          />
        ))}
      </Tabs>
    </div>
  )
}
