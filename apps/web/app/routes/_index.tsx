"use client"

import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQueryParamsState } from "@/hooks/use-query-param-state"
import { useUser } from "@/services/useUser"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { href, useNavigate } from "react-router"
import { match } from "ts-pattern"

import { useBancasQueParticipei, useMyDefesas, usePastBancasDefesa, useUpcomingBancasDefesa } from "@/hooks"
import type { Route } from "./+types/_index"
import { useCandidatos } from "@/hooks/candidato.hooks"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL" }]

type BancasDefesa = ReturnType<typeof useUpcomingBancasDefesa>["data"] & {}

// Tipo mínimo para renderizar tabela (sem membros)
type BancaTableItem = {
  id: number
  dataRealizacao: string | Date
  tituloTrabalho: string
  autor: string
  local: string | null
  orientador: { nome: string }
  curso: { sigla: string }
}

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useQueryParamsState("searchQuery", "")
  const [activeTab, setActiveTab] = useQueryParamsState("activeTab", "all-defenses")
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
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full self-stretch">
          <Input
            id="banca-search"
            type="search"
            placeholder="Buscar candidatos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[400px] self-stretch"
          />
        </div>
        {!!userQuery.data && isTeacherOrAdmin && <Button onClick={() => navigate("/add-banca")}>Adicionar Candidato</Button>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all-defenses" data-testid="all-defenses-tab">
              Defesas
            </TabsTrigger>
            {isTeacherOrAdmin && (
              <>
                <TabsTrigger value="my-defesas" data-testid="my-defesas-tab">
                  Minhas defesas
                </TabsTrigger>
                <TabsTrigger value="my-participations" data-testid="my-participations-tab">
                  Participações
                </TabsTrigger>
                <TabsTrigger value="candidatos" data-testid="all-candidatos-tab">
                  Candidatos
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
        <AllDefensesTab
          searchQuery={searchQuery}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          rowsPerPage={rowsPerPage}
        />
        {isTeacherOrAdmin && (
          <>
            <MyDefensesTab
              searchQuery={searchQuery}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              rowsPerPage={rowsPerPage}
            />
            <MyParticipationsTab
              searchQuery={searchQuery}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              rowsPerPage={rowsPerPage}
            />
            <CandidatosTab
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

interface AllDefensesTabProps {
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
}

function AllDefensesTab(props: AllDefensesTabProps) {
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState<number>(1)
  const [pastCurrentPage, setPastCurrentPage] = useState<number>(1)

  const upcomingBancasQuery = useUpcomingBancasDefesa(
    props.sortField || undefined,
    props.sortField ? props.sortOrder : undefined,
    upcomingCurrentPage,
    props.rowsPerPage,
    props.searchQuery
  )

  const pastBancasQuery = usePastBancasDefesa(
    props.sortField || undefined,
    props.sortField ? props.sortOrder : undefined,
    pastCurrentPage,
    props.rowsPerPage,
    props.searchQuery
  )

  // Reset to first page when search query or sorting changes
  useEffect(() => {
    setUpcomingCurrentPage(1)
    setPastCurrentPage(1)
  }, [props.searchQuery, props.sortField, props.sortOrder, props.rowsPerPage])

  if (upcomingBancasQuery.isLoading || pastBancasQuery.isLoading) {
    return (
      <TabsContent value="all-defenses">
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </TabsContent>
    )
  }

  if (upcomingBancasQuery.isError || pastBancasQuery.isError) {
    return (
      <TabsContent value="all-defenses">
        <div className="text-red-600 p-4">
          Erro ao carregar as defesas:{" "}
          {upcomingBancasQuery.error?.message || pastBancasQuery.error?.message || "Erro desconhecido"}
        </div>
      </TabsContent>
    )
  }

  const upcomingData = upcomingBancasQuery.data?.data || []
  const pastData = pastBancasQuery.data?.data || []
  const hasUpcomingDefenses = upcomingData.length > 0

  return (
    <TabsContent value="all-defenses">
      <div className="space-y-4" data-testid="defense-table">
        {/* Próximas defesas - só exibe se houver dados */}
        {hasUpcomingDefenses && (
          <div>
            <div className="border rounded-md">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Próximas defesas</h3>
              </div>
              <div className="overflow-x-auto">
                <HomeTable
                  data={upcomingData}
                  searchQuery={props.searchQuery}
                  sortField={props.sortField}
                  sortOrder={props.sortOrder}
                  onSort={props.onSort}
                  rowsPerPage={props.rowsPerPage}
                />
              </div>
            </div>
            {upcomingBancasQuery.data?.meta && (
              <div className="flex items-center justify-between px-4 pt-2">
                <div className="text-sm text-muted-foreground">
                  Exibindo {upcomingData.length} de {upcomingBancasQuery.data.meta.total} resultado
                  {upcomingBancasQuery.data.meta.total !== 1 ? "s" : ""}
                  {props.searchQuery && ` para "${props.searchQuery}"`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpcomingCurrentPage(upcomingCurrentPage - 1)}
                    disabled={!upcomingBancasQuery.data.meta.hasPrev}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Paginação {upcomingBancasQuery.data.meta.currentPage} de {upcomingBancasQuery.data.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpcomingCurrentPage(upcomingCurrentPage + 1)}
                    disabled={!upcomingBancasQuery.data.meta.hasNext}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Defesas anteriores */}
        <div>
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Defesas anteriores</h3>
            </div>
            <div className="overflow-x-auto">
              <HomeTable
                data={pastData}
                searchQuery={props.searchQuery}
                sortField={props.sortField}
                sortOrder={props.sortOrder}
                onSort={props.onSort}
                rowsPerPage={props.rowsPerPage}
              />
            </div>
          </div>
          {pastBancasQuery.data?.meta && (
            <div className="flex items-center justify-between px-4 pt-2">
              <div className="text-sm text-muted-foreground">
                Exibindo {pastData.length} de {pastBancasQuery.data.meta.total} resultado
                {pastBancasQuery.data.meta.total !== 1 ? "s" : ""}
                {props.searchQuery && ` para "${props.searchQuery}"`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPastCurrentPage(pastCurrentPage - 1)}
                  disabled={!pastBancasQuery.data.meta.hasPrev}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Paginação {pastBancasQuery.data.meta.currentPage} de {pastBancasQuery.data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPastCurrentPage(pastCurrentPage + 1)}
                  disabled={!pastBancasQuery.data.meta.hasNext}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  )
}

interface MyDefensesTabProps {
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
}

function MyDefensesTab(props: MyDefensesTabProps) {
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState<number>(1)
  const [pastCurrentPage, setPastCurrentPage] = useState<number>(1)

  const myDefesasQuery = useMyDefesas(
    props.sortField || undefined,
    props.sortField ? props.sortOrder : undefined,
    upcomingCurrentPage, // Use upcoming page for the main query
    props.rowsPerPage,
    props.searchQuery
  )

  // Reset to first page when search query or sorting changes
  useEffect(() => {
    setUpcomingCurrentPage(1)
    setPastCurrentPage(1)
  }, [props.searchQuery, props.sortField, props.sortOrder, props.rowsPerPage])

  if (myDefesasQuery.isLoading) {
    return (
      <TabsContent value="my-defesas">
        <div className="border rounded-md p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </TabsContent>
    )
  }

  if (myDefesasQuery.isError) {
    return (
      <TabsContent value="my-defesas">
        <div className="text-red-600 p-4">
          Erro ao carregar suas defesas: {myDefesasQuery.error?.message || "Erro desconhecido"}
        </div>
      </TabsContent>
    )
  }

  const upcomingData = myDefesasQuery.data?.upcoming || []
  const pastData = myDefesasQuery.data?.past || []
  const meta = myDefesasQuery.data?.meta

  return (
    <TabsContent value="my-defesas">
      <div className="space-y-4">
        <div>
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Próximas defesas</h3>
            </div>
            <div className="overflow-x-auto">
              <HomeTable
                data={upcomingData}
                searchQuery={props.searchQuery}
                sortField={props.sortField}
                sortOrder={props.sortOrder}
                onSort={props.onSort}
                rowsPerPage={props.rowsPerPage}
              />
            </div>
          </div>
          {meta && (
            <div className="flex items-center justify-between px-4 pt-2">
              <div className="text-sm text-muted-foreground">
                Exibindo {upcomingData.length} de {meta.total} resultado
                {meta.total !== 1 ? "s" : ""}
                {props.searchQuery && ` para "${props.searchQuery}"`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingCurrentPage(upcomingCurrentPage - 1)}
                  disabled={!meta.hasPrev}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Paginação {meta.currentPage} de {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpcomingCurrentPage(upcomingCurrentPage + 1)}
                  disabled={!meta.hasNext}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Defesas anteriores</h3>
            </div>
            <div className="overflow-x-auto">
              <HomeTable
                data={pastData}
                searchQuery={props.searchQuery}
                sortField={props.sortField}
                sortOrder={props.sortOrder}
                onSort={props.onSort}
                rowsPerPage={props.rowsPerPage}
              />
            </div>
          </div>
          {meta && (
            <div className="flex items-center justify-between px-4 pt-2">
              <div className="text-sm text-muted-foreground">
                Exibindo {pastData.length} de {meta.total} resultado
                {meta.total !== 1 ? "s" : ""}
                {props.searchQuery && ` para "${props.searchQuery}"`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPastCurrentPage(pastCurrentPage - 1)}
                  disabled={!meta.hasPrev}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Paginação {meta.currentPage} de {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPastCurrentPage(pastCurrentPage + 1)}
                  disabled={!meta.hasNext}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  )
}

// ─── Enums (matching DB enum types) ───────────────────────────────────────────

export type Sexo = "Masculino" | "Feminino" | "Outro";
export type EstadoCivil = "Solteiro" | "Casado" | "Divorciado" | "Viúvo" | "União Estável";
export type TipoCurso = "Mestrado" | "Doutorado";
export type AreaPreferencia = string; // ajuste conforme o enum real no DB

// ─── Base ──────────────────────────────────────────────────────────────────────

interface Candidato {
  // dados da inscrição
  id: number;
  numeroInscricao: string;
  status: string; // 'Inscricao Submetida' | 'Aprovada' | 'Rejeitada'
  dataInscricao: string; // ISO timestamp

  // pontuação e classificação
  pontuacao: string | null;       // numeric(5,2) → string no Drizzle/Postgres
  dataPontuacao: string | null;   // ISO timestamp

  // dados pessoais
  cpf: string;
  sexo: Sexo;
  nome: string;
  estadoCivil: EstadoCivil;
  email: string;
  dataNascimento: string;         // ISO timestamp
  raca: string;
  nomeMae: string;
  nomePai: string | null;
  tipoEscolaEnsinoMedio: string;  // 'Publica' | 'Privada' | 'Particular'

  // naturalidade
  pais: string;
  estado: string;
  municipio: string;

  // documentos
  rg: string;
  orgaoExpedidor: string;
  estadoExpedicao: string;
  dataExpedicao: string;          // ISO timestamp
  tituloEleitor: string;
  secaoEleitoral: string;
  zonaEleitoral: string | null;
  passaporte: string | null;

  // endereço
  cep: string;
  logradouro: string;
  bairro: string;
  complemento: string | null;
  estadoEndereco: string;
  municipioEndereco: string;
  telefoneFixo: string | null;
  telefoneCelular: string;

  // processo seletivo
  linhaPesquisa: string;

  // formulário comum
  comprovantePagTaxaInscricao: string;  // URL do PDF
  copiaCPF: string;                     // URL do PDF
  copiaPassaporteOuRNE: string | null;  // URL do PDF (apenas estrangeiros)
  copiaDocumentoIdentificacao: string | null; // URL do PDF (apenas brasileiros)
  solicitouIsencaoTaxaInscricao: boolean;
  comprovacaoPesquisas: string;         // URL do PDF
  possuiNecessidadesEspeciais: boolean;
  vagasNegrosPardos: boolean;
  vagasSupranumerarias: boolean;
}

// ─── Doutorado ─────────────────────────────────────────────────────────────────

export interface CandidatoDoutorado extends Candidato {
  tipoCurso: "doutorado";

  // endereço
  numero: string;

  // formulário de doutorado
  historicoGraduacao: string;           // URL do PDF
  copiaDiplomaMestrado: string;         // URL do PDF
  historicoMestrado: string;            // URL do PDF
  nomeUniversidadeMestrado: string;
  nomeCursoMestrado: string;
  anteprojetoTese: string;              // URL do PDF
  conceitoCapesMestrado: string | null;
  primeiraOpcaoOrientador: string;
  segundaOpcaoOrientador: string;
  terceiraOpcaoOrientador: string;
}

// ─── Mestrado ──────────────────────────────────────────────────────────────────

export interface CandidatoMestrado extends Candidato {
  tipoCurso: "mestrado";

  // formulário de mestrado
  copiaDiplomaGraduacao: string;        // URL do PDF
  historicoGraduacao: string;           // URL do PDF
  nomeUniversidadeGraduacao: string;
  nomeCursoGraduacao: string;
  cidadeOndeRealizouGraduacao: string;
  enadeDoCursoGraduacao: string;        // URL portal EMEC
  valorDoEnadeDoCursoGraduacao: string;
  notaPOSCOMP: string | null;
  primeiraAreaPreferencia: AreaPreferencia;
  segundaAreaPreferencia: AreaPreferencia | null;
  cartaMotivacao: string;               // URL do PDF
}
interface CandidatosTabProps {
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
}

function CandidatosTab(props: CandidatosTabProps) {
  const candidatosQuery = useCandidatos()

  console.log("Dados de candidatos:", candidatosQuery.data) // Log para verificar os dados retornados

  if (candidatosQuery.isLoading) {
    return (
      <TabsContent value="candidatos">
        <div className="border rounded-md p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </TabsContent>
    )
  }

  if (candidatosQuery.isError) {
    return (
      <TabsContent value="candidatos">
        <div className="text-red-600 p-4">
          Erro ao carregar candidatos: {candidatosQuery.error?.message || "Erro desconhecido"}
        </div>
      </TabsContent>
    )
  }

  const mestradoData = candidatosQuery.data?.mestrado || []
  const doutoradoData = candidatosQuery.data?.doutorado || []

  return (
    <TabsContent value="candidatos">
      <div className="space-y-4">
        <div>
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Candidatos de Mestrado</h3>
            </div>
            <div className="overflow-x-auto">
              <HomeTableCandidatos
                data={mestradoData}
                searchQuery={props.searchQuery}
                sortField={props.sortField}
                sortOrder={props.sortOrder}
                onSort={props.onSort} />
            </div>
          </div>
        </div>
        <div>
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Candidatos de Doutorado</h3>
            </div>
            <div className="overflow-x-auto">
              <HomeTableCandidatos
                data={doutoradoData}
                searchQuery={props.searchQuery}
                sortField={props.sortField}
                sortOrder={props.sortOrder}
                onSort={props.onSort}
              />
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}



interface MyParticipationsTabProps {
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
}

function MyParticipationsTab(props: MyParticipationsTabProps) {
  const participationsQuery = useBancasQueParticipei(props.searchQuery)

  if (participationsQuery.isLoading) {
    return (
      <TabsContent value="my-participations">
        <div className="border rounded-md p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </TabsContent>
    )
  }

  if (participationsQuery.isError) {
    return (
      <TabsContent value="my-participations">
        <div className="text-red-600 p-4">
          Erro ao carregar bancas que participei: {participationsQuery.error?.message || "Erro desconhecido"}
        </div>
      </TabsContent>
    )
  }

  const upcomingData = participationsQuery.data?.upcoming || []
  const pastData = participationsQuery.data?.past || []
  const total = participationsQuery.data?.total || 0

  return (
    <TabsContent value="my-participations">
      <div className="space-y-4">
        {upcomingData.length > 0 && (
          <div>
            <div className="border rounded-md">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Próximas defesas</h3>
              </div>
              <div className="overflow-x-auto">
                <HomeTable
                  data={upcomingData}
                  searchQuery={props.searchQuery}
                  sortField={props.sortField}
                  sortOrder={props.sortOrder}
                  onSort={props.onSort}
                  rowsPerPage={props.rowsPerPage}
                />
              </div>
            </div>
          </div>
        )}
        <div>
          <div className="border rounded-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Defesas anteriores</h3>
            </div>
            <div className="overflow-x-auto">
              <HomeTable
                data={pastData}
                searchQuery={props.searchQuery}
                sortField={props.sortField}
                sortOrder={props.sortOrder}
                onSort={props.onSort}
                rowsPerPage={props.rowsPerPage}
              />
            </div>
          </div>
          <div className="flex items-center px-4 pt-2">
            <div className="text-sm text-muted-foreground">
              Total: {total} banca{total !== 1 ? "s" : ""}
              {props.searchQuery && ` para "${props.searchQuery}"`}
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

const columns = [
  { key: "dataRealizacao", header: "Data", minWidth: "100px", sortable: true },
  { key: "tituloTrabalho", header: "Título do Trabalho", minWidth: "350px", sortable: true },
  { key: "autor", header: "Discente", minWidth: "120px", sortable: true },
  { key: "orientador", header: "Orientador", minWidth: "150px", sortable: true },
  { key: "curso", header: "Curso", minWidth: "80px", sortable: true },
  { key: "local", header: "Virtual", minWidth: "200px", sortable: true },
] as const

function HomeTable(props: {
  data: BancaTableItem[]
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
}) {
  const navigate = useNavigate()

  const goToViewBanca = (bancaId: string | number) => {
    navigate(href("/banca/:id", { id: String(bancaId) }))
  }

  const getSortIcon = (columnKey: string) => {
    if (props.sortField !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return props.sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Data is already filtered and paginated by the backend
  const paginatedData = props.data

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              style={{ minWidth: col.minWidth }}
              className={col.sortable ? "cursor-pointer select-none hover:bg-muted/50" : ""}
              onClick={() => col.sortable && props.onSort(col.key)}
            >
              <div className="flex items-center gap-2">
                {col.header}
                {col.sortable && getSortIcon(col.key)}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedData.length > 0 ? (
          paginatedData.map((banca) => (
            <TableRow
              key={banca.id}
              onClick={() => goToViewBanca(banca.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              {columns.map((col) => (
                <TableCell key={`${banca.id}-${col.key}`}>
                  {match(col.key)
                    .with("dataRealizacao", () => (
                      <span className="whitespace-nowrap text-xs">
                        {new Date(banca.dataRealizacao).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                    ))
                    .with("tituloTrabalho", () => (
                      <span className="block" title={banca.tituloTrabalho}>
                        {truncateText(banca.tituloTrabalho, 80)}
                      </span>
                    ))
                    .with("autor", () => <span className="whitespace-nowrap">{banca.autor}</span>)
                    .with("orientador", () => <span className="whitespace-nowrap">{banca.orientador.nome}</span>)
                    .with("curso", () => <span className="whitespace-nowrap">{banca.curso.sigla}</span>)
                    .with("local", () => <span className="whitespace-nowrap">{banca.local}</span>)
                    .otherwise(() => null)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Nenhuma defesa agendada{props.searchQuery ? " para esta busca." : "."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function TableWithInfo(props: {
  data: BancaTableItem[]
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
  meta?: {
    total: number
    totalPages: number
    currentPage: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
}) {
  const meta = props.meta

  return (
    <div>
      <div className="border rounded-md overflow-x-auto">
        <HomeTable {...props} />
      </div>
      {meta && (
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="text-sm text-muted-foreground">
            Exibindo {props.data.length} de {meta.total} resultado{meta.total !== 1 ? "s" : ""}
            {props.searchQuery && ` para "${props.searchQuery}"`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => props.onPageChange(props.currentPage - 1)}
              disabled={!meta.hasPrev}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Paginação {meta.currentPage} de {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => props.onPageChange(props.currentPage + 1)}
              disabled={!meta.hasNext}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


function HomeTableCandidatos(props: {
  data: CandidatoMestrado[] | CandidatoDoutorado[]
  searchQuery: string
  sortField: string
  sortOrder: "asc" | "desc"
  onSort: (field: string) => void
  rowsPerPage?: number
}) {
  const navigate = useNavigate()

  const goToViewCandidato = (tipo: "mestrado" | "doutorado", candidatoId: string | number) => {
    navigate(href(`/${tipo}/:id`, { id: String(candidatoId) }))
  }

  const getSortIcon = (columnKey: string) => {
    if (props.sortField !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return props.sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
  const paginatedData = props.data
  console.log("Paginated Data:", paginatedData)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Situação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        { paginatedData?.length > 0 ? (
          paginatedData.map((candidato) => (
            <TableRow
              key={candidato.id}
              onClick={() => goToViewCandidato(candidato.tipoCurso.toLowerCase() as "mestrado" | "doutorado", candidato.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>{candidato.nome}</TableCell>
              <TableCell>{candidato.tipoCurso}</TableCell>
              <TableCell>{candidato.status}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">
              Nenhum candidato encontrado{props.searchQuery ? " para esta busca." : "."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

