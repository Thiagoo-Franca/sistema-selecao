import { Controller } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/ui/field"
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
import { GRU_OPTIONS } from "@/shared/lib/constants"

interface GruFieldProps {
  control: any
  errors: any
  candidato: any
}
export function GruField({ control, errors, candidato }: GruFieldProps) {
  return (
    <Controller
      control={control}
      name="gru"
      render={({ field }) => (
        <Field className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-2">
            <FieldLabel htmlFor="gru" className="font-bold text-muted-foreground">
              GRU
            </FieldLabel>
            {candidato.gruLink && (
              <FieldDescription>
                <a href={candidato.gruLink} target="_blank" rel="noopener noreferrer">
                  Ver comprovante
                </a>
              </FieldDescription>
            )}
          </div>

          <Select key={field.value} onValueChange={field.onChange} value={field.value ?? ""}>
            {" "}
            <SelectTrigger className="w-full max-w-[400px]" id="gru">
              <SelectValue placeholder="GRU" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {GRU_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{msg(errors.gru)}</FieldError>
        </Field>
      )}
    />
  )
}
