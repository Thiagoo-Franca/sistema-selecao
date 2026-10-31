import { useState } from "react"
import { useForm } from "react-hook-form"

import { useLogin } from "@/hooks/auth/useLogin"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import type { LoginFormValues } from "@/schema/schema"

interface LoginFormProps {
  onForgotPassword: () => void
  createAccount: () => void
}

export default function LoginForm({ onForgotPassword, createAccount }: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

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

  const { isPending, onSubmit, errorsMutation } = useLogin()

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6 md:gap-4"
      id="login-form"
    >
      {errorsMutation && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de Login</AlertTitle>
          <AlertDescription>
            {errorsMutation?.cause instanceof Error
              ? errorsMutation?.cause.message
              : errorsMutation?.message}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          id="login-email"
          type="email"
          placeholder="exemplo@ufba.br"
          disabled={isPending}
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Senha</Label>
        </div>

        <div className="relative">
          <Input
            id="login-password"
            type={isPasswordVisible ? "text" : "password"}
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            autoComplete="current-password"
            placeholder="********"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((v) => !v)}
          >
            {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>

        {errors.password && (
          <p id="login-password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>{" "}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
        disabled={isPending}
      >
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
      <Button type="button" variant="link" className="w-full text-sm" onClick={onForgotPassword}>
        Esqueci minha senha
      </Button>
      <Button type="button" variant="link" className="w-full text-sm" onClick={createAccount}>
        Criar uma conta
      </Button>
    </form>
  )
}
