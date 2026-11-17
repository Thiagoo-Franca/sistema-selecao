import { removeAuthToken, useUser } from "@/features/auth"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { useQueryClient } from "@tanstack/react-query"
import { LogOut, Menu, MessageSquare, User, Users, X } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { match } from "ts-pattern"

// Alvo de toque de 44px no mobile (recomendação de Apple/Google), compacto a partir de md
const itemClass = "min-h-11 cursor-pointer gap-2 md:min-h-9"

function getRoleLabel(role: string) {
  return match(role)
    .with("ADMIN", () => "Administrador")
    .with("TEACHER", () => "Professor")
    .with("STUDENT", () => "Aluno")
    .otherwise(() => role)
}

function getInitials(name?: string) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return "U"
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
  return (first + last).toUpperCase()
}

const avatarSizes = {
  sm: "h-8 w-8 text-xs md:h-7 md:w-7 md:text-[11px]",
  md: "h-10 w-10 text-sm md:h-9 md:w-9 md:text-xs",
}

interface UserAvatarProps {
  name?: string
  size?: keyof typeof avatarSizes
}

function UserAvatar({ name, size = "sm" }: UserAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground ${avatarSizes[size]}`}
    >
      {getInitials(name)}
    </span>
  )
}

export default function HeaderActions() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser()
  // Fonte única de verdade: o mesmo estado controla o dropdown e o ícone do trigger
  const [open, setOpen] = useState(false)

  function handleLogout() {
    removeAuthToken()
    useUser.removeQueries(queryClient)
    navigate("/")
  }

  // Skeleton com as mesmas dimensões do trigger, para não deslocar o layout
  if (isLoading) {
    return (
      <div
        className="ml-auto flex h-11 w-11 items-center justify-center md:h-9 md:w-auto md:gap-2 md:pl-1 md:pr-3"
        role="status"
      >
        <span className="sr-only">Carregando usuário</span>
        <div
          className="h-8 w-8 animate-pulse rounded-full bg-muted md:h-7 md:w-7"
          aria-hidden="true"
        />
        <div
          className="hidden h-3 w-14 animate-pulse rounded bg-muted md:block"
          aria-hidden="true"
        />
      </div>
    )
  }

  // useUser limpa o token quando a requisição falha, então erro e deslogado caem aqui
  if (!user) {
    return (
      <div className="ml-auto flex items-center">
        <Button asChild variant="ghost" size="sm" className="h-11 px-4 md:h-9 md:px-3">
          <Link to="/">Entrar</Link>
        </Button>
      </div>
    )
  }

  const firstName = user.nome.split(" ")[0]

  return (
    <div className="ml-auto flex items-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-11 w-11 rounded-full p-0 active:bg-muted data-[state=open]:bg-muted md:h-9 md:w-auto md:gap-2 md:pl-1 md:pr-3 md:hover:bg-muted"
            aria-label={`Menu do usuário: ${user.nome}`}
          >
            {/* Mobile: ícone que acompanha o estado real do menu */}
            <span className="md:hidden">
              {open ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </span>

            {/* Desktop: avatar e nome */}
            <span className="hidden items-center gap-2 md:flex">
              <UserAvatar name={user.nome} />
              <span className="text-sm font-medium">{firstName}</span>
              {user.role === "ADMIN" && (
                <span className="text-xs text-muted-foreground">(Admin)</span>
              )}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="w-64 max-w-[calc(100vw-1.5rem)] md:w-56"
        >
          <DropdownMenuLabel className="flex items-center gap-3 p-2 font-normal">
            <UserAvatar name={user.nome} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">{user.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild className={itemClass}>
            <Link to="/profile">
              <User className="h-4 w-4 text-muted-foreground" />
              Meu perfil
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={itemClass}>
            <Link to="/feedback">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Feedback
            </Link>
          </DropdownMenuItem>

          {user.role === "ADMIN" && (
            <DropdownMenuItem asChild className={itemClass}>
              <Link to="/admin/users">
                <Users className="h-4 w-4 text-muted-foreground" />
                Gerenciar usuários
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={handleLogout}
            className={`${itemClass} text-red-600 focus:bg-destructive/10 focus:text-destructive`}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
