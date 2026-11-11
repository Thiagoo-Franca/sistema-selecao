import { Controller } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/shared/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { msg } from "@/features/candidates/mestrado/components/forms"
import { valorBooleanoSelect } from "@/shared/lib/helpers"

interface IsencaoAprovadaFieldProps {
  control: any
  errors: any
  candidato: any
}

export function IsencaoAprovadaField({ control, errors, candidato }: IsencaoAprovadaFieldProps) {
  return (
    <Controller
      control={control}
      name="isencaoAprovada"
      render={({ field }) => (
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="isencaoAprovada" className="font-bold text-muted-foreground">
            ISENÇÃO APROVADA?
            {candidato.isencaoAprovadaLink ? (
              <a href={candidato.isencaoAprovadaLink} target="_blank" rel="noopener noreferrer">
                Ver comprovante
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Sem comprovante</span>
            )}
          </FieldLabel>
          <Select key={field.value} onValueChange={field.onChange} value={field.value ?? ""}>
            <SelectTrigger className="w-full max-w-[400px]" id="isencaoAprovada">
              <SelectValue placeholder="Isenção aprovada?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
                <SelectItem value="nao-solicitou">Não solicitou</SelectItem>
                <SelectItem value="nao-avaliado">Não avaliado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{msg(errors.isencaoAprovada)}</FieldError>
        </Field>
      )}
    />
  )
}
