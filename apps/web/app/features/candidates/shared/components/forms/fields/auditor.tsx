import { msg } from "@/features/candidates/mestrado/components/forms"
import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import { TeacherCombobox } from "@/shared/ui/teacher-combox"
import { Controller } from "react-hook-form"

interface AuditorFieldProps {
  control: any
  isAdmin: boolean
  teachersData: any[]
  isTeachersLoading: boolean
  candidato: any
  errors: any
}
export function AuditorField({
  control,
  isAdmin,
  teachersData,
  isTeachersLoading,
  candidato,
  errors,
}: AuditorFieldProps) {
  return (
    <Field className="flex flex-col gap-4">
      <FieldLabel htmlFor="auditorId" className="font-bold text-muted-foreground">
        Auditor
      </FieldLabel>
      {isAdmin ? (
        <Controller
          control={control}
          name="auditorId"
          render={({ field }) => (
            <TeacherCombobox
              options={teachersData}
              value={field.value}
              onChange={field.onChange}
              placeholder={candidato.auditor ? candidato.auditor.nome : "Selecione um auditor"}
              isLoading={isTeachersLoading}
            />
          )}
        />
      ) : (
        <p>{candidato.auditor?.nome ?? "Não alocado"}</p>
      )}
      <FieldError>{msg(errors.auditorId)}</FieldError>
    </Field>
  )
}
