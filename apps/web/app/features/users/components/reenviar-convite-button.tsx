import { Mail } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { useReenviarConvite } from "@/features/users/hooks"

interface ReenviarConviteButtonProps {
  userId: string
  nome: string
}

export function ReenviarConviteButton({ userId, nome }: ReenviarConviteButtonProps) {
  const reenviarConvite = useReenviarConvite()

  return (
    <Button
      variant="outline"
      onClick={() => reenviarConvite.mutate(userId)}
      disabled={reenviarConvite.isPending}
      aria-label={`Reenviar convite para ${nome}`}
    >
      <Mail className="mr-2 h-4 w-4" />
      {reenviarConvite.isPending ? "Enviando..." : "Reenviar convite"}
    </Button>
  )
}
