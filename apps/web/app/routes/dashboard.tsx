"use client"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQueryParamsState } from "@/hooks/use-query-param-state"
import { useUser } from "@/services/useUser"
import { useState } from "react"
import { useNavigate } from "react-router"

import type { Route } from "./+types/dashboard"
import { CandidatosTab } from "@/components/candidatos-tab"
import CandidatoTab from "@/components/candidatos-tab/candidato-tab"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL" }]

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useQueryParamsState("searchQuery", "")
  const [activeTab, setActiveTab] = useQueryParamsState("activeTab", "candidatos")
  const [sortField, setSortField] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)

  const userQuery = useUser()
  const isTeacherOrAdmin = userQuery.data?.role === "TEACHER" || userQuery.data?.role === "ADMIN"

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="mb-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
        <div className="flex w-full flex-col items-center gap-4 self-stretch sm:flex-row">
          <Input
            id="candidato-search"
            type="search"
            placeholder="Buscar candidatos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full self-stretch sm:w-[400px]"
          />
        </div>
        {!!userQuery.data && isTeacherOrAdmin && (
          <Button onClick={() => navigate("/")}>Adicionar Candidato</Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full hover:cursor-pointer">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            {isTeacherOrAdmin && (
              <>
                <TabsTrigger
                  value="candidatos"
                  data-testid="all-candidatos-tab"
                  className="hover:cursor-pointer"
                >
                  Candidatos
                </TabsTrigger>
                <TabsTrigger value="candidatos-mestrado" data-testid="candidatos-mestrado-tab">
                  Candidatos Mestrado
                </TabsTrigger>
                <TabsTrigger value="candidatos-doutorado" data-testid="candidatos-doutorado-tab">
                  Candidatos Doutorado
                </TabsTrigger>
              </>
            )}
          </TabsList>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">Exibir:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value))
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">linhas</span>
          </div>
        </div>
        {isTeacherOrAdmin && (
          <>
            <CandidatosTab
              searchQuery={searchQuery}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              rowsPerPage={rowsPerPage}
            />
            <CandidatoTab
              type="mestrado"
              searchQuery={searchQuery}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              rowsPerPage={rowsPerPage}
            />
            <CandidatoTab
              type="doutorado"
              searchQuery={searchQuery}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              rowsPerPage={rowsPerPage}
            />
          </>
        )}
      </Tabs>
    </div>
  )
}
