import { Header } from "@/shared/components/layout/header"
import type { Route } from "./+types/profile"

import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { rpcReturn } from "@/shared/lib/utils"
import apiClient from "@/shared/services/apiClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { href, Navigate } from "react-router"
import Loading from "@/shared/components/layout/loading"
import { useUser } from "@/features/auth/hooks/auth.queries"
import {
  passwordFormSchema,
  profileFormSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from "@/features/profile/schema/profile.schema"
import {
  changePasswordMutation,
  updateProfileMutation,
} from "@/features/profile/hooks/profile.mutation"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Perfil" }]

export const passwordForm = useForm<PasswordFormValues>({
  resolver: zodResolver(passwordFormSchema),
  defaultValues: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
})

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useUser()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: user?.nome || "",
      school: user?.school || "",
      academicTitle: user?.academicTitle || "",
    },
    values: {
      nome: user?.nome || "",
      school: user?.school || "",
      academicTitle: user?.academicTitle || "",
    },
  })

  function onSubmitProfile(data: ProfileFormValues) {
    updateProfileMutation.mutate(data)
  }

  function onSubmitPassword(data: PasswordFormValues) {
    changePasswordMutation.mutate(data)
  }

  if (isLoading) {
    return <Loading />
  }

  if (isError || !user) {
    return <Navigate to={href("/")} />
  }

  return (
    <div className="p-4 md:p-8">
      <Header className="mb-6" />

      <div className="mx-auto max-w-2xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais. Seu email e matrícula não podem ser alterados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="school"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instituição</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Universidade Federal da Bahia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="academicTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título Acadêmico</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Doutor, Mestre, Graduado" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col">
                      <FormLabel>Email</FormLabel>
                      <p className="break-all text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="flex flex-col">
                      <FormLabel>Matrícula</FormLabel>
                      <p className="text-sm text-muted-foreground">{user.matricula}</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
                          Atualizando...
                        </>
                      ) : (
                        "Salvar alterações"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <p className="text-xs text-muted-foreground">
                  Última atualização:{" "}
                  {new Date(user.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Altere sua senha de acesso ao sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                    className="space-y-6"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha atual</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite sua senha atual"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Digite sua nova senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar nova senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirme sua nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
                          Alterando senha...
                        </>
                      ) : (
                        "Alterar senha"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
