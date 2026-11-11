import { msg } from "@/features/candidates/mestrado/components/forms"
import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import { TeacherCombobox } from "@/shared/ui/teacher-combox"
import type { CandidatoDoutoradoComRelacoes, CandidatoMestradoComRelacoes } from "@tcc/server"
import { Controller } from "react-hook-form"

interface AvaliadorFieldProps {
  control: any
  isAdmin: boolean
  teachersData: any[]
  isTeachersLoading: boolean
  candidato: CandidatoDoutoradoComRelacoes | CandidatoMestradoComRelacoes | null | undefined
  errors: any
}
export function AvaliadorField({
  control,
  isAdmin,
  teachersData,
  isTeachersLoading,
  candidato,
  errors,
}: AvaliadorFieldProps) {
  return (
    <Field className="flex flex-col gap-4">
      <FieldLabel htmlFor="avaliadorId" className="font-bold text-muted-foreground">
        Avaliador
      </FieldLabel>
      {isAdmin ? (
        <Controller
          control={control}
          name="avaliadorId"
          render={({ field }) => (
            <TeacherCombobox
              options={teachersData}
              value={field.value}
              onChange={field.onChange}
              placeholder={
                candidato.avaliador ? candidato.avaliador.nome : "Selecione um avaliador"
              }
              isLoading={isTeachersLoading}
            />
          )}
        />
      ) : (
        <p>{candidato.avaliador?.nome ?? "Não alocado"}</p>
      )}
      <FieldError>{msg(errors.avaliadorId)}</FieldError>
    </Field>
  )
}
