import { useResetPasswordMutation } from "@/features/auth/hooks/auth.mutation"
import type { Route } from "./+types/reset-password.$token"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Redefinir Senha" }]
interface ResetPasswordFormValues {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const resetPasswordMutation = useResetPasswordMutation()
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  useEffect(() => {
    if (!token) {
      navigate("/")
      return
    }

    // Token validation would happen here if needed
    // For now, we'll assume it's valid and let the backend handle validation
    setTokenValid(true)
  }, [token, navigate])

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) return

    resetPasswordMutation.mutate(
      { json: { token, newPassword: data.password } },
      {
        onSuccess: () => {
          setIsSuccess(true)
          toast.success("Senha redefinida com sucesso! Agora você pode fazer login.")

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/")
          }, 3000)
        },
        onError: (error) => {
          toast.error(
            `Erro ao redefinir senha: ${error.message || "Ocorreu um erro ao redefinir a senha"}`
          )
        },
      }
    )
  }

  if (tokenValid === null) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p>Verificando token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua nova senha"
                disabled={resetPasswordMutation.isPending}
                {...register("password", {
                  required: "Nova senha é obrigatória",
                  minLength: {
                    value: 8,
                    message: "A senha deve ter pelo menos 8 caracteres",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
                disabled={resetPasswordMutation.isPending}
                {...register("confirmPassword", {
                  required: "Confirmação de senha é obrigatória",
                  validate: (value) => value === password || "As senhas não coincidem",
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
              disabled={resetPasswordMutation.isPending}
            >
              Voltar ao Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
