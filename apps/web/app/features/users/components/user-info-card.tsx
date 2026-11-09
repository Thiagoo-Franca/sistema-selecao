import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { GraduationCap, Hash, Layers, Mail, School, User } from "lucide-react"
import { match } from "ts-pattern"

interface UserInfoCardProps {
  user: {
    nome: string
    email: string
    matricula: string
    school: string
    academicTitle: string
    areas: string[] | undefined
    role: string
  }
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
  const roleLabel = match(user.role)
    .with("TEACHER", () => "Professor")
    .with("ADMIN", () => "Administrador")
    .otherwise(() => user.role)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6" />
              {user.nome}
            </CardTitle>
            <CardDescription className="mt-2">{roleLabel}</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {roleLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Hash className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Matrícula</p>
              <p className="text-sm">{user.matricula}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <School className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Escola/Instituição</p>
              <p className="text-sm">{user.school}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Título Acadêmico</p>
              <p className="text-sm">{user.academicTitle}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Áreas de Atuação</p>
              <p className="text-sm">{user.areas?.join(", ")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
