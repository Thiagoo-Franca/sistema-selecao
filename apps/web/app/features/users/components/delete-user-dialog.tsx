import { useEffect, useState } from "react"
import { useDeleteUser } from "../hooks"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import type { UserType } from "../pages/admin.users"

interface DeleteUserDialogProps {
  user: UserType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const [showAssociations, setShowAssociations] = useState(false)
  const deleteUserMutation = useDeleteUser()

  useEffect(() => {
    if (!open) setShowAssociations(false)
  }, [open])

  function handleConfirm(cascade = false) {
    if (!user) return
    deleteUserMutation.mutate(
      { id: user.id, cascade },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
        onError: (error: Error & { status?: number }) => {
          if (error.status === 400) setShowAssociations(true)
        },
      }
    )
  }

  if (!user) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            {showAssociations
              ? "Este usuário possui as seguintes associações no sistema:"
              : `Tem certeza que deseja excluir ${user.nome} (${user.email})? Esta ação não pode ser desfeita.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowAssociations(false)}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => handleConfirm()}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
