import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import type { UserType } from "../pages/admin.users"
import { Badge } from "@/shared/ui/badge"
import { match } from "ts-pattern"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pen, Trash2 } from "lucide-react"
import { Button } from "@/shared/ui/button"

interface UserTableProps {
  users: UserType[]
  searchQuery: string
  currentUserId?: number | string
  onViewUser?: (user: UserType) => void
  onEditUser: (user: UserType) => void
  onDeleteUser: (user: UserType) => void
}

export default function UserTable({
  users,
  searchQuery,
  currentUserId,
  onViewUser,
  onDeleteUser,
  onEditUser,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow
                key={user.id}
                className={onViewUser ? "cursor-pointer hover:bg-muted/50" : undefined}
                onClick={onViewUser ? () => onViewUser(user) : undefined}
              >
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.matricula}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {match(user.role)
                      .with("TEACHER", () => "Professor")
                      .with("ADMIN", () => "Administrador")
                      .otherwise(() => user.role)}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      {onViewUser && (
                        <DropdownMenuItem
                          onClick={() => onViewUser(user)}
                          className="hover:cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={() => onEditUser(user)}
                      >
                        <Pen className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive hover:cursor-pointer focus:text-destructive focus:outline-none"
                        disabled={user.id === currentUserId}
                        onClick={() => onDeleteUser(user)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {searchQuery
                  ? "Nenhum usuário encontrado para esta busca."
                  : "Nenhum usuário cadastrado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
