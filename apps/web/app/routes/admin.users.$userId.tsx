import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserById } from "@/hooks"
import { ArrowLeft, GraduationCap, Hash, Mail, School, User } from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { match } from "ts-pattern"
import type { Route } from "./+types/admin.users.$userId"

const roleLabels: Record<string, string> = {
  orientador: "Orientador",
  coorientador: "Coorientador",
  aluno: "Aluno",
  avaliador: "Avaliador",
}

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Detalhe do Usuário" }]

export default function AdminUserDetailPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const userQuery = useUserById(userId)
  // const associationsQuery = useUserAssociations(userId ? parseInt(userId, 10) : null)

  const isLoading = userQuery.isLoading // || associationsQuery.isLoading
  const user = userQuery.data
  // const associations = associationsQuery.data

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="mx-auto max-w-4xl space-y-6">
          <Button onClick={() => navigate("/admin/users")} variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (userQuery.error || !user) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="mx-auto max-w-4xl">
          <Button onClick={() => navigate("/admin/users")} variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <h2 className="mb-2 text-xl font-bold">Usuário não encontrado</h2>
                <p>O usuário solicitado não existe ou você não tem permissão para visualizá-lo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const roleLabel = match(user.role)
    .with("TEACHER", () => "Professor")
    .with("ADMIN", () => "Administrador")
    .otherwise(() => user.role)

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="mx-auto max-w-4xl space-y-6">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Áreas de Atuação</p>
                  <p className="text-sm">{user.areas?.join(", ")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
