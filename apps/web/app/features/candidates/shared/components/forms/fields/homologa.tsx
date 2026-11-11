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

interface HomologaFieldProps {
  control: any
  errors: any
  candidato: any
}
export function HomologaField({ control, errors, candidato }: HomologaFieldProps) {
  return (
    <Controller
      control={control}
      name="homologa"
      render={({ field }) => (
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="homologa" className="font-bold text-muted-foreground">
            Homologa?
          </FieldLabel>
          <Select
            key={valorBooleanoSelect(field.value)}
            onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
            value={valorBooleanoSelect(field.value)}
          >
            <SelectTrigger className="w-full max-w-[400px]" id="homologa">
              <SelectValue placeholder="Homologa?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sim">SIM</SelectItem>
                <SelectItem value="nao">NÃO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{msg(errors.homologa)}</FieldError>
        </Field>
      )}
    />
  )
}
