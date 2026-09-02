import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <section
        aria-labelledby="brand-title"
        className="flex flex-col items-center justify-center bg-white px-6 py-6 text-center lg:min-h-screen lg:bg-green-50 lg:px-12 lg:py-16"
      >
        <div className="flex flex-col items-center">
          <img
            src="/icc-ufba.png"
            alt="Logo do Instituto de Computação da UFBA"
            className="h-auto w-44 object-contain sm:w-52 lg:w-56"
          />
          <h1 id="brand-title" className="mt-3 hidden text-4xl font-bold tracking-tight lg:block lg:text-5xl">
            Sistema Seleção
          </h1>
        </div>
      </section>
      <section
        aria-labelledby="login-title"
        className="flex items-center justify-center bg-white px-6 py-6 lg:min-h-screen lg:px-16 lg:py-16"
      >
        <div className="w-full max-w-md">
          <h1 id="login-title" className="mb-8 text-center text-3xl font-bold tracking-tight lg:text-left lg:text-4xl">
            <span className="lg:hidden">Sistema de seleção</span>
            <span className="hidden lg:inline">Login</span>
          </h1>
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
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={loginMutation.isPending}
              >
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
        </div>
      </section>
    </main>
  )
}
