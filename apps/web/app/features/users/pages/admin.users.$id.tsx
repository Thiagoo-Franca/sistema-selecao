import { useState } from "react"
import { useNavigate, useParams } from "react-router"

import { Button } from "@/shared/ui/button"
import { ArrowLeft, Pen } from "lucide-react"
import { useUser } from "@/features/auth/hooks/auth.queries"
import { useUserById } from "@/features/users/hooks"
import IsLoadingUsers from "@/features/users/components/loading-users"
import ErrorUsers from "@/features/users/components/error-users"
import UserInfoCard from "@/features/users/components/user-info-card"
import EditUserDialog from "@/features/users/components/edit-user-dialog"
import type { Route } from "./+types/admin.users.$id"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Perfil do Usuário" }]

export default function UserProfilePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const currentUserQuery = useUser()
  const userQuery = useUserById(id)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  if (!id) {
    navigate("/")
    return null
  }

  const { isLoading: isLoading, error, data: user } = userQuery
  const { data: currentUser } = currentUserQuery

  const isAdmin = currentUser?.role === "ADMIN"

  if (isLoading) {
    return <IsLoadingUsers />
  }

  if (error || !user) {
    return <ErrorUsers userQuery={userQuery} user={user} error={error} />
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        {isAdmin && (
          <Button onClick={() => setEditDialogOpen(true)} aria-label={`Editar ${user.nome}`}>
            <Pen className="mr-2 h-4 w-4" /> Editar
          </Button>
        )}
      </div>

      <UserInfoCard user={user} />

      {isAdmin && (
        <EditUserDialog user={user} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      )}
    </div>
  )
}
