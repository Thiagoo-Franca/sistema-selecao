import { Skeleton } from "@/shared/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import type { SelectUser } from "@tcc/server"
import React, { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import DeleteUserDialog from "../components/delete-user-dialog"
import type { Route } from "./+types/admin"
import { useUser } from "@/features/auth"
import { useAllUsers } from "../hooks"
import EditUserDialog from "../components/edit-user-dialog"
import UserTable from "../components/user-table"
import SearchBar from "@/shared/ui/search-bar"
import { removerAcentos } from "@/shared/lib/helpers"

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
    const normalizedSearch = removerAcentos(searchQuery.toLowerCase())

    return users.filter((user) =>
      [user.nome, user.email, user.matricula].some((field) =>
        removerAcentos(field.toLowerCase()).includes(normalizedSearch)
      )
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
  const currentTab = "all" // Default tab is "all"
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeTrigger = listRef.current?.querySelector<HTMLElement>('[data-state="active"]')
    activeTrigger?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [currentTab])

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
        <div className="flex w-full flex-col items-center gap-2 self-stretch md:flex-row md:gap-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList
          ref={listRef}
          className="relative flex h-auto w-full snap-x justify-start gap-1 overflow-x-auto rounded-full border bg-white p-1 shadow-none [scrollbar-width:none] md:max-w-lg md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
        >
          {" "}
          <TabsTrigger
            value="all"
            className="shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md md:flex-1"
          >
            Todos ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger
            value="ADMIN"
            className="shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md md:flex-1"
          >
            Administrador ({getUsersByRole("ADMIN").length})
          </TabsTrigger>
          <TabsTrigger
            value="TEACHER"
            className="shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md md:flex-1"
          >
            Professor ({getUsersByRole("TEACHER").length})
          </TabsTrigger>
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
