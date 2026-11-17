import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Controller } from "react-hook-form"

interface EnadeFieldProps {
  control: any
  errors: any
  candidato: any
}

export function EnadeField({ control, errors, candidato }: EnadeFieldProps) {
  return (
    <Controller
      control={control}
      name="enade"
      render={({ field }) => {
        const enadeValue =
          typeof field.value === "number" &&
          Number.isInteger(field.value) &&
          field.value >= 1 &&
          field.value <= 5
            ? String(field.value)
            : ""

        return (
          <Field className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
              <FieldLabel htmlFor="enade" className="font-bold text-muted-foreground">
                ENADE
              </FieldLabel>
              <FieldDescription>
                <a
                  href={candidato.notas?.enadeLink ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver comprovante.
                </a>
              </FieldDescription>
            </div>

            <Select
              key={enadeValue || "empty"}
              value={enadeValue}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger className="w-full max-w-[400px]" id="enade">
                <SelectValue placeholder={candidato.notas?.enade ?? "0"} />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError>{errors.enade?.message}</FieldError>
          </Field>
        )
      }}
    />
  )
}
