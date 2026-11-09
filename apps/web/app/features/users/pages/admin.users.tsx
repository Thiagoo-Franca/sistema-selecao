import { Input } from "@/shared/ui/input"
import { Skeleton } from "@/shared/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import type { SelectUser } from "@tcc/server"
import { Search } from "lucide-react"
import React, { useState } from "react"
import { Navigate, useNavigate } from "react-router"
import DeleteUserDialog from "../components/delete-user-dialog"
import type { Route } from "./+types/admin"
import { useUser } from "@/features/auth"
import { useAllUsers } from "../hooks"
import EditUserDialog from "../components/edit-user-dialog"
import UserTable from "../components/user-table"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Gerenciar Usuários" }]

export type UserType = Omit<SelectUser, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}

export default function AdminUsersIndexPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null)

  const userQuery = useUser()
  const allUsersQuery = useAllUsers()

  const filteredUsers = React.useMemo(() => {
    const users = allUsersQuery.data || []

    return users.filter(
      (user) =>
        user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.matricula.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allUsersQuery.data, searchQuery])

  const getUsersByRole = React.useCallback(
    (role?: SelectUser["role"]) => {
      if (!role) return filteredUsers
      return filteredUsers.filter((user) => user.role === role)
    },
    [filteredUsers]
  )

  const isAdmin = userQuery.data?.role === "ADMIN"

  if (userQuery.isSuccess && !isAdmin) {
    return <Navigate to="/" />
  }

  if (userQuery.isLoading || allUsersQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-1/2" />
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

  if (userQuery.isError || allUsersQuery.isError) {
    return (
      <div className="">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <h2 className="mb-2 text-xl font-bold">Erro ao carregar dados</h2>
          <p>
            Ocorreu um erro ao carregar a lista de usuários. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    )
  }

  const handleEditUser = (user: UserType) => {
    setEditingUser(user)
    setEditDialogOpen(true)
  }

  const handleDeleteUser = (user: UserType) => {
    setUserToDelete(user)
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os usuários do sistema.</p>
      </div>

      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou matrícula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="ADMIN">Administrador ({getUsersByRole("ADMIN").length})</TabsTrigger>
          <TabsTrigger value="TEACHER">Professor ({getUsersByRole("TEACHER").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <UserTable
            users={filteredUsers}
            searchQuery={searchQuery}
            currentUserId={userQuery.data?.id}
            onViewUser={(user) => navigate(`/admin/users/${user.id}`)}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="ADMIN" className="mt-6">
          <UserTable
            users={getUsersByRole("ADMIN")}
            searchQuery={searchQuery}
            onViewUser={(user) => navigate(`/admin/users/${user.id}`)}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="TEACHER" className="mt-6">
          <UserTable
            users={getUsersByRole("TEACHER")}
            searchQuery={searchQuery}
            onViewUser={(user) => navigate(`/admin/users/${user.id}`)}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </TabsContent>
      </Tabs>

      <EditUserDialog user={editingUser} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <DeleteUserDialog
        user={userToDelete}
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      />
    </div>
  )
}
