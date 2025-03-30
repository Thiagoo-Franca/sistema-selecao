"use client"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/services/useUser"
import React, { useEffect, useState } from "react"
import { href, useNavigate } from "react-router"
import { fetchBancas } from "../services/bancaService"

export interface Banca {
  id: string | number
  data_realizacao: string
  titulo_trabalho: string
  autor: string
  nome_orientador: string
  sigla_curso: string
  local: string
  tipo_banca: "remoto" | "presencial"
  palavras_chave: string[]
  resumo: string
  membros: string[]

  data?: Date
  formatedData?: string
}

const matchSearchQuery = (element: Banca, query: string): boolean => {
  if (!query) return true

  const lowerCaseQuery = query.toLocaleLowerCase()
  const SEARCH_PROPERTIES: (keyof Banca)[] = [
    "autor",
    "formatedData",
    "local",
    "nome_orientador",
    "palavras_chave",
    "resumo",
    "sigla_curso",
    "titulo_trabalho",
    "membros",
  ]

  return SEARCH_PROPERTIES.some((property) => {
    const value = element[property]
    if (Array.isArray(value)) {
      return value.some((item) => String(item).toLocaleLowerCase().includes(lowerCaseQuery))
    }
    return String(value).toLocaleLowerCase().includes(lowerCaseQuery)
  })
}

export default function Home() {
  const { data: user } = useUser()
  const [rawData, setRawData] = useState<[Banca[], Banca[]]>([[], []])
  const [filteredData, setFilteredData] = useState<[Banca[], Banca[]]>([[], []])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const isTeacher = user?.role === "teacher"

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)

    fetchBancas()
      .then((fetchedEvents: Banca[]) => {
        let events: Banca[] = fetchedEvents || []

        if (events && Array.isArray(events)) {
          events.forEach((e) => {
            e.data = new Date(e.data_realizacao)
            e.data.setSeconds(0)
            e.formatedData = `${e.data.toLocaleDateString()} às ${e.data.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}h`
          })

          const now = new Date()
          events.sort((a, b) => (a.data! < b.data! ? -1 : 1))

          const upcomingEvents = events.filter((a) => a.data! >= now)
          const pastEvents = events.filter((a) => a.data! < now)

          const allEvents: [Banca[], Banca[]] = [upcomingEvents, pastEvents]
          setRawData(allEvents)
          setFilteredData(allEvents)
        } else {
          console.error("Fetched data is not in the expected format:", events)
          setRawData([[], []])
          setFilteredData([[], []])
        }
      })
      .catch((error) => {
        console.error("Error fetching data in component:", error)

        setRawData([[], []])
        setFilteredData([[], []])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const upcomingFiltered = rawData[0].filter((banca) => matchSearchQuery(banca, searchQuery))
    const pastFiltered = rawData[1].filter((banca) => matchSearchQuery(banca, searchQuery))
    setFilteredData([upcomingFiltered, pastFiltered])
  }, [searchQuery, rawData])

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <Skeleton className="h-10 w-full sm:w-1/2" />
          {isTeacher && <Skeleton className="h-10 w-full sm:w-auto px-8" />}
        </div>
        <Skeleton className="h-10 w-48 mb-4" /> {/* Tab List Skeleton */}
        <div className="border rounded-md p-4">
          <Skeleton className="h-8 w-full mb-2" /> {/* Table Header Skeleton */}
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      {/* Search and Add Button Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <Input
          id="banca-search"
          type="search"
          placeholder="Buscar defesas, alunos, orientadores ou avaliadores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-lg w-full"
        />
        {isTeacher && <Button onClick={() => navigate(href("/add-banca"))}>Cadastrar Defesa de TCC</Button>}
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Próximas defesas</TabsTrigger>
          <TabsTrigger value="past">Defesas anteriores</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="border rounded-md overflow-x-auto">
            {" "}
            {/* Add border and horizontal scroll */}
            <HomeTable data={filteredData[0]} searchQuery={searchQuery} />
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="border rounded-md overflow-x-auto">
            {" "}
            <HomeTable data={filteredData[1]} searchQuery={searchQuery} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function HomeTable(p: { data: Banca[]; searchQuery: string }) {
  const navigate = useNavigate()
  const columns = [
    { key: "formatedData", header: "Data", minWidth: "160px" },
    { key: "titulo_trabalho", header: "Título do Trabalho", minWidth: "400px" },
    { key: "autor", header: "Discente", minWidth: "150px" },
    { key: "nome_orientador", header: "Orientador", minWidth: "150px" },
    { key: "sigla_curso", header: "Curso", minWidth: "80px" },
    { key: "local", header: "Local ou link", minWidth: "200px" },
    { key: "actions", header: "Ações", minWidth: "100px" },
  ]

  const goToViewBanca = (bancaId: string | number) => {
    navigate(`/verbanca?id=${bancaId}`)
  }

  const renderCellContent = (banca: Banca, columnKey: string) => {
    switch (columnKey) {
      case "local":
        const isRemote = banca.tipo_banca === "remoto"
        return isRemote ? (
          <a href={banca.local} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
            {banca.local}
          </a>
        ) : (
          <span className="break-words">{banca.local}</span>
        )
      case "actions":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToViewBanca(banca.id)}
            aria-label={`Ver detalhes da banca ${banca.titulo_trabalho}`}
          >
            Ver
          </Button>
        )
      case "formatedData":
        return <span className="whitespace-nowrap">{banca.formatedData}</span>
      default:
        return (banca[columnKey as keyof Banca] as React.ReactNode) || "N/A"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} style={{ minWidth: col.minWidth }}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {p.data.length > 0 ? (
          p.data.map((banca) => (
            <TableRow
              key={banca.id}
              onDoubleClick={() => goToViewBanca(banca.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              {columns.map((col) => (
                <TableCell key={`${banca.id}-${col.key}`}>{renderCellContent(banca, col.key)}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Nenhuma defesa encontrada{p.searchQuery ? " para esta busca." : "."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
