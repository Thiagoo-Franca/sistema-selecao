import { useState } from "react"
import { useForm } from "react-hook-form"
import { usePasswordReset } from "@/hooks/auth/useResetPassword"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PasswordResetFormValues } from "@/schema/schema"

interface ResetPasswordFormProps {
  onBackToLogin: () => void
}

export default function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps) {
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

  const { onSubmit: onPasswordResetSubmit, isPending: isPasswordResetPending } = usePasswordReset()

  return (
    <form
      onSubmit={handleResetSubmit(onPasswordResetSubmit)}
      className="flex w-full flex-col gap-6 md:gap-4"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold">Recuperar Senha</h3>
        <p className="text-sm text-muted-foreground">
          Digite seu email para receber instruções de recuperação
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="exemplo@ufba.br"
          disabled={isPasswordResetPending}
          className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          {...resetRegister("email")}
        />
        {resetErrors.email && (
          <p className="mt-1 text-sm text-destructive">{resetErrors.email.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
        disabled={isPasswordResetPending}
      >
        {isPasswordResetPending ? "Enviando..." : "Enviar Email de Recuperação"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onBackToLogin()}
        disabled={isPasswordResetPending}
      >
        Voltar ao Login
      </Button>
    </form>
  )
}
