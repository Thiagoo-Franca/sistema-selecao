import { FeatureRequests } from "@/features/feedback/components/FeatureRequests"
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm"
import { FeedbackStatistics } from "@/features/feedback/components/FeedbackStatistics"
import { Header } from "@/shared/components/layout/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Loader2 } from "lucide-react"
import { Navigate } from "react-router"
import type { Route } from "./+types/feedback"
import { useUser } from "@/features/auth/hooks/auth.queries"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Feedback" }]

export default function FeedbackPage() {
  const { data: user, isLoading: userLoading } = useUser()

  if (userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Header className="mb-6" />
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" />
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header className="mb-6" />

      <div className="mx-auto max-w-4xl">
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Enviar Feedback</TabsTrigger>
            <TabsTrigger value="statistics">Resultados da Pesquisa</TabsTrigger>
            <TabsTrigger value="requests">Solicitações</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <FeedbackForm />
          </TabsContent>

          <TabsContent value="statistics">
            <FeedbackStatistics />
          </TabsContent>

          <TabsContent value="requests">
            <FeatureRequests />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
