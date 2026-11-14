import { useUser } from "@/features/auth"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowUp, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import {
  useCreateFeatureRequestMutation,
  useVoteFeatureRequestMutation,
} from "../hooks/feedback.mutation"
import { featureRequestSchema, type FeatureRequestFormValues } from "../schema/feedback.schema"
import { toast } from "sonner"
import { useFeatureRequestsQuery } from "../hooks/feedback.queries"

export function FeatureRequests() {
  const { data: user } = useUser()

  return (
    <div className="space-y-8">
      <SubmissionSection user={user} />
      <FeatureRequestsList user={user} />
    </div>
  )
}

interface SubmissionSectionProps {
  user: any
}

function SubmissionSection({ user }: SubmissionSectionProps) {
  const queryClient = useQueryClient()
  const createFeatureRequestMutation = useCreateFeatureRequestMutation()

  const form = useForm<FeatureRequestFormValues>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  function onSubmit(data: FeatureRequestFormValues) {
    if (!user) {
      toast("Autenticação necessária. Por favor, faça login para enviar uma solicitação.")
      return
    }

    createFeatureRequestMutation.mutate(
      { json: data },
      {
        onSuccess: () => {
          toast.success("Solicitação enviada com sucesso, obrigado por sua sugestão!")
          form.reset()
          queryClient.invalidateQueries({ queryKey: ["feature-requests"] })
        },
        onError: (error) => {
          toast.error(
            "Erro ao enviar solicitação: " +
              (error instanceof Error
                ? error.message
                : "Ocorreu um erro ao enviar sua solicitação.")
          )
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Nova Funcionalidade</CardTitle>
        <CardDescription>
          {user
            ? "Sugira melhorias ou novas funcionalidades para o sistema."
            : "Faça login para enviar sua solicitação."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Adicionar filtro de busca por data"
                      {...field}
                      disabled={!user}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a funcionalidade que você gostaria de ver no sistema..."
                      rows={4}
                      {...field}
                      disabled={!user}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createFeatureRequestMutation.isPending || !user}
            >
              {createFeatureRequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitação"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

interface FeatureRequestsListProps {
  user: any
}

function FeatureRequestsList({ user }: FeatureRequestsListProps) {
  const { data: featureRequests, isLoading } = useFeatureRequestsQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!featureRequests || featureRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma solicitação de funcionalidade ainda. Seja o primeiro a sugerir!
          </p>
        </CardContent>
      </Card>
    )
  }

  const sortedRequests = [...featureRequests].sort((a, b) => b.voteCount - a.voteCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Funcionalidades</CardTitle>
        <CardDescription>
          Vote nas funcionalidades que você gostaria de ver implementadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRequests.map((request) => (
            <FeatureRequestItem key={request.id} request={request} user={user} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureRequestItemProps {
  request: any
  user: any
}

function FeatureRequestItem({ request, user }: FeatureRequestItemProps) {
  const queryClient = useQueryClient()
  const voteFeatureRequestMutation = useVoteFeatureRequestMutation()

  function handleVote() {
    if (!user) {
      toast("Autenticação necessária. Por favor, faça login para votar.")
      return
    }

    if (request.userVoted) {
      toast("Voto já registrado, você já votou nesta solicitação.")
      return
    }

    voteFeatureRequestMutation.mutate(
      { json: { featureRequestId: request.id } },
      {
        onSuccess: () => {
          toast.success("Voto registrado, seu voto foi computado com sucesso!")
          queryClient.invalidateQueries({ queryKey: ["feature-requests"] })
        },
        onError: (error) => {
          toast.error(
            `Erro ao votar: ${error instanceof Error ? error.message : "Ocorreu um erro ao registrar seu voto."}`
          )
        },
      }
    )
  }

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      <div className="flex flex-col items-center gap-1">
        <Button
          variant={request.userVoted ? "secondary" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={request.userVoted || voteFeatureRequestMutation.isPending}
          className="h-10 w-10 p-0"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold">{request.voteCount}</span>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-semibold">{request.title}</h3>
        <p className="text-sm text-muted-foreground">{request.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Por {request.authorName}</span>
          <span>•</span>
          <span>{new Date(request.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  )
}
