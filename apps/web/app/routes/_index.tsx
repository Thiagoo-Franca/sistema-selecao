import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLoginMutation, useRequestPasswordResetMutation } from "@/services/authService"
import { useUser } from "@/services/useUser"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import type { Route } from "./+types/_index"

export type { CandidatoDoutorado, CandidatoMestrado } from "./dashboard"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL" }]

interface LoginFormValues {
  email: string
  password: string
}

interface PasswordResetFormValues {
  email: string
}

export default function LandingPage() {
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const loginMutation = useLoginMutation()
  const requestPasswordResetMutation = useRequestPasswordResetMutation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm,
  } = useForm<PasswordResetFormValues>({
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { json: data },
      {
        onSuccess: (res) => {
          toast({
            title: "Login realizado com sucesso ✅",
            description: "Você foi redirecionado para o dashboard",
          })
          useUser.setData(queryClient, res.user)
          navigate("/dashboard")
        },
        onError: () => {
          toast({
            title: "Erro ao fazer login ❌",
            description: "Ocorreu um erro ao fazer login",
          })
        },
      },
    )
  }

  const onPasswordResetSubmit = (data: PasswordResetFormValues) => {
    requestPasswordResetMutation.mutate(
      { json: data },
      {
        onSuccess: () => {
          toast({
            title: "Email enviado com sucesso ✅",
            description: "Verifique sua caixa de entrada para redefinir sua senha",
          })
          resetForm()
          setShowPasswordReset(false)
        },
        onError: (error) => {
          toast({
            title: "Erro ao enviar email ❌",
            description: error.message || "Ocorreu um erro ao enviar o email",
          })
        },
      },
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistema de seleção</CardTitle>
          <CardDescription>Insira seu email e senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {showPasswordReset ? (
            <form onSubmit={handleResetSubmit(onPasswordResetSubmit)} className="grid gap-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Recuperar Senha</h2>
                <p className="text-sm text-muted-foreground">
                  Digite seu email para receber instruções de recuperação
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="exemplo@ufba.br"
                  disabled={requestPasswordResetMutation.isPending}
                  {...resetRegister("email", {
                    required: "Email é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                />
                {resetErrors.email && (
                  <p className="text-sm text-destructive">{resetErrors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={requestPasswordResetMutation.isPending}>
                {requestPasswordResetMutation.isPending ? "Enviando..." : "Enviar Email de Recuperação"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowPasswordReset(false)}
                disabled={requestPasswordResetMutation.isPending}
              >
                Voltar ao Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {loginMutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro de Login</AlertTitle>
                  <AlertDescription>
                    {loginMutation.error.cause instanceof Error
                      ? loginMutation.error.cause.message
                      : loginMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="exemplo@ufba.br"
                  disabled={loginMutation.isPending}
                  {...register("email", {
                    required: "Email é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  disabled={loginMutation.isPending}
                  {...register("password", {
                    required: "Senha é obrigatória",
                  })}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => setShowPasswordReset(true)}
              >
                Esqueci minha senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
