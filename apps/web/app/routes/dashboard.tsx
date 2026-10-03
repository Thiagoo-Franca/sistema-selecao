"use client"

import { useUser } from "@/services/useUser"
import { useNavigate } from "react-router"
import type { Route } from "./+types/dashboard"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQueryParamsState } from "@/hooks/use-query-param-state"
import { CandidatosTab } from "@/components/candidatos-tab"
import CandidatoTab from "@/components/candidatos-tab/candidato-tab"

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

const TABS: { value: string; label: string }[] = [
  {
    value: "candidatos",
    label: "Todos os Candidatos",
  },
  {
    value: "candidatos-mestrado",
    label: "Mestrado",
  },
  {
    value: "candidatos-doutorado",
    label: "Doutorado",
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useQueryParamsState("searchQuery", "")
  const [orderBy, setOrderBy] = useQueryParamsState("orderBy", "nome")
  const [order, setOrder] = useQueryParamsState<"asc" | "desc">("order", "asc")
  const [activeTab, setActiveTab] = useQueryParamsState("activeTab", "candidatos")

  const userQuery = useUser()
  const isTeacherOrAdmin = userQuery.data?.role === "TEACHER" || userQuery.data?.role === "ADMIN"

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="mb-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
        <div className="flex w-full flex-col items-center gap-4 self-stretch sm:flex-row">
          <Input
            id="candidato-search"
            type="search"
            placeholder="Buscar por nome…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full self-stretch md:max-w-lg"
          />
        </div>
        {!!userQuery.data && userQuery.data.role === "ADMIN" && (
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 md:max-w-xs"
            //  onClick={() => navigate("/")}
          >
            Adicionar Candidato
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full hover:cursor-pointer">
        <div className="flexitems-center mb-4 justify-between">
          <TabsList className="flex w-full flex-row items-center justify-between gap-2 rounded-lg border-none bg-white p-1 shadow-none md:max-w-lg">
            {isTeacherOrAdmin &&
              TABS.map((tab) => (
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
        {isTeacherOrAdmin && (
          <>
            <CandidatosTab
              searchQuery={searchQuery}
              orderBy={orderBy}
              order={order}
              setOrderBy={setOrderBy}
              setOrder={setOrder}
            />
            <CandidatoTab
              type="mestrado"
              searchQuery={searchQuery}
              orderBy={orderBy}
              order={order}
              setOrderBy={setOrderBy}
              setOrder={setOrder}
            />
            <CandidatoTab
              type="doutorado"
              searchQuery={searchQuery}
              orderBy={orderBy}
              order={order}
              setOrderBy={setOrderBy}
              setOrder={setOrder}
            />
          </>
        )}
      </Tabs>
    </div>
  )
}
