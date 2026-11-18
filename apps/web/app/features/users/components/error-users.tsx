import { Header } from "@/shared/components/layout/header"
import { ButtonBack } from "@/shared/ui/button-back"
import { Card, CardContent } from "@/shared/ui/card"

interface ErrorsUsersProps {
  userQuery: {
    error: Error | null
  }
  user: any
  error?: Error | null
}

export default function ErrorUsers({ userQuery, user, error }: ErrorsUsersProps) {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />
      <div className="mx-auto max-w-4xl">
        <ButtonBack className="mb-4" />
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              <h2 className="mb-2 text-xl font-bold">
                {userQuery.error?.message?.includes("404") || !user
                  ? "Usuário não encontrado"
                  : "Erro ao carregar dados do usuário"}
              </h2>
              <p>
                {error instanceof Error
                  ? error.message
                  : "Ocorreu um erro ao carregar os dados do usuário. Por favor, tente novamente mais tarde."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
