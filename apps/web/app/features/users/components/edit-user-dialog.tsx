import { useForm } from "react-hook-form"
import { useUpdateUser } from "../hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserSchema, type UpdateUserFormData } from "../schema/users.schema"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { AreasMultiSelect } from "./areas-multi-select"
import { Input } from "@/shared/ui/input"
import type { UserType } from "../pages/admin.users"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Button } from "@/shared/ui/button"

interface EditUserDialogProps {
  user: Pick<UserType, "id" | "nome" | "school" | "academicTitle" | "role" | "areas"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const updateUserMutation = useUpdateUser()

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      nome: user?.nome || "",
      school: user?.school || "",
      academicTitle: user?.academicTitle || "",
      role: user?.role || "TEACHER",
      areas: user?.areas ?? [],
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        nome: user.nome,
        school: user.school,
        academicTitle: user.academicTitle,
        role: user.role,
        areas: user.areas ?? [],
      })
    }
  }, [user, form])

  const onSubmit = (data: UpdateUserFormData) => {
    if (!user) return

    updateUserMutation.mutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Edite as informações do usuário {user.nome}. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escola/Instituição</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da escola ou instituição" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academicTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Acadêmico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Doutor em Ciência da Computação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TEACHER">Professor</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Áreas de Atuação</FormLabel>
                  <FormControl>
                    <AreasMultiSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Usadas na alocação de novos candidatos. Alterar as áreas não realoca
                    candidatos já atribuídos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
