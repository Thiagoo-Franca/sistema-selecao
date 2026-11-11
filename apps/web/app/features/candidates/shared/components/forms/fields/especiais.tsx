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

interface EspeciaisFieldProps {
  control: any
  errors: any
}

export function EspeciaisField({ control, errors }: EspeciaisFieldProps) {
  return (
    <Controller
      control={control}
      name="especiais"
      render={({ field }) => (
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="especiais" className="font-bold text-muted-foreground">
            Especiais
          </FieldLabel>
          <Select
            key={valorBooleanoSelect(field.value)}
            onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
            value={valorBooleanoSelect(field.value)}
          >
            <SelectTrigger className="w-full max-w-[400px]" id="especiais">
              <SelectValue placeholder="Especiais?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sim">SIM</SelectItem>
                <SelectItem value="nao">NÃO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{msg(errors.especiais)}</FieldError>
        </Field>
      )}
    />
  )
}
