import { Header } from "@/components/layout/Header"
import type { Route } from "./+types/admin.teacher-invitations"

export const meta: Route.MetaFunction = () => [{ title: "SISDEF - Convites de Professores" }]
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUser } from "@/services/useUser"
import {
  useTeacherInvitations,
  useCreateTeacherInvitation,
  type CreateTeacherInvitationData,
} from "@/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Plus, RefreshCw, Search } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate } from "react-router"
import { z } from "zod"

const createTeacherInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
  nome: z.string().min(1, "Nome é obrigatório"),
})

export default function AdminTeacherInvitationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const userQuery = useUser()
  const invitationsQuery = useTeacherInvitations()
  const createInvitationMutation = useCreateTeacherInvitation()

  const form = useForm<CreateTeacherInvitationData>({
    resolver: zodResolver(createTeacherInvitationSchema),
    defaultValues: {
      email: "",
      nome: "",
    },
  })

  // Verifica se o usuário é um administrador
  const isAdmin = userQuery.data?.role === "ADMIN"

  // Redireciona se o usuário não for um administrador
  if (userQuery.isSuccess && !isAdmin) {
    return <Navigate to="/" />
  }

  // Estado de carregamento
  if (userQuery.isLoading || invitationsQuery.isLoading) {
    return (
      <div className="container mx-auto space-y-4 p-4 md:p-8">
        <Header className="mb-6" />
        <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-1/2" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-md border p-4">
          <Skeleton className="mb-2 h-8 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (userQuery.isError || invitationsQuery.isError) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <h2 className="mb-2 text-xl font-bold">Erro ao carregar dados</h2>
          <p>Ocorreu um erro ao carregar os convites. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const filteredInvitations = (invitationsQuery.data?.data || []).filter(
    (invitation: any) =>
      invitation.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onSubmit = async (data: CreateTeacherInvitationData) => {
    try {
      await createInvitationMutation.mutateAsync(data)
      form.reset()
      setDialogOpen(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
            Pendente
          </Badge>
        )
      case "used":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Aceito
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            Expirado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Convites para Professores</h1>
        <p className="text-muted-foreground">Gerencie convites enviados para novos professores.</p>
      </div>

      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => invitationsQuery.refetch()}
            disabled={invitationsQuery.isRefetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${invitationsQuery.isRefetching ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Convite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Convidar Professor</DialogTitle>
                <DialogDescription>
                  Envie um convite para um novo professor se juntar ao sistema.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Professor</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createInvitationMutation.isPending}>
                      {createInvitationMutation.isPending ? (
                        <>
                          <Mail className="mr-2 h-4 w-4 animate-pulse" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Convite
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Expira em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.length > 0 ? (
              filteredInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.nome}</TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                  <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchQuery
                    ? "Nenhum convite encontrado para esta busca."
                    : "Nenhum convite enviado ainda."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
