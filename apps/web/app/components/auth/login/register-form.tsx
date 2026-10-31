import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { __DEV__ } from "@/config/env"
import { useToast } from "@/hooks/use-toast"
import { useRegisterMutation } from "@/services/authService"
import type { RegisterUserInput } from "@tcc/server"
import { AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { Form } from "../../ui/form"
import type { RegisterFormValues } from "@/schema/schema"
import { useRegister } from "@/hooks/auth/useRegister"

interface RegisterFormProps {
  onBackToLogin: () => void
}
export function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      nome: "",
      email: "",
      school: "Universidade Federal da Bahia",
      academicTitle: "",
      password: "",
      matricula: "",
    },
  })
  const {
    register,
    formState: { errors },
  } = form

  const { onSubmit, isPending, errorMessage } = useRegister({
    onBackToLogin,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no Registro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="register-nome">Nome Completo</Label>
          <Input
            id="register-nome"
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            placeholder="Seu nome completo"
            disabled={isPending}
            {...register("nome", { required: "Nome é obrigatório" })}
          />
          {errors.nome && <p className="mt-1 text-sm text-destructive">{errors.nome.message}</p>}
        </div>

        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            id="register-email"
            type="email"
            placeholder="seu@email.com"
            disabled={isPending}
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="register-universidade">Universidade</Label>
          <Input
            id="register-universidade"
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            placeholder="Nome da sua universidade"
            disabled={isPending}
            {...register("school")}
          />
          {errors.school && (
            <p className="mt-1 text-sm text-destructive">{errors.school.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="register-matricula">Matrícula</Label>
          <Input
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            id="register-matricula"
            placeholder="Número de matrícula"
            disabled={isPending}
            {...register("matricula")}
          />
          {errors.matricula && (
            <p className="mt-1 text-sm text-destructive">{errors.matricula.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="register-academic_title">Título Acadêmico</Label>
          <Input
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"

            id="register-academic_title"
            placeholder="Ex: Doutor, Mestre, Bacharel"
            disabled={isPending}
            {...register("academicTitle")}
          />
          {errors.academicTitle && (
            <p className="mt-1 text-sm text-destructive">{errors.academicTitle.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="register-password">Senha</Label>
          <Input
            className="focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            id="register-password"
            type="password"
            placeholder="Crie uma senha segura"
            disabled={isPending}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          disabled={isPending}
        >
          {isPending ? "Registrando..." : "Registrar"}
        </Button>
        <Button type="button" variant="link" className="w-full text-sm" onClick={onBackToLogin}>
          Voltar para o login
        </Button>
      </form>
    </Form>
  )
}
