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

interface PediuIsencaoFieldProps {
  control: any
  errors: any
  candidato: any
}

export function PediuIsencaoField({ control, errors, candidato }: PediuIsencaoFieldProps) {
  return (
    <Controller
      control={control}
      name="solicitouIsencaoTaxaInscricao"
      render={({ field }) => (
        <Field className="flex flex-col gap-4">
          <FieldLabel
            htmlFor="solicitouIsencaoTaxaInscricao"
            className="font-bold text-muted-foreground"
          >
            PEDIU ISENÇÃO?
            {candidato.isencaoComprovanteLink ? (
              <a href={candidato.isencaoComprovanteLink} target="_blank" rel="noopener noreferrer">
                Ver comprovante
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Sem comprovante</span>
            )}
          </FieldLabel>
          <Select
            key={field.value}
            onValueChange={(v) => field.onChange(v === "sim")}
            value={valorBooleanoSelect(field.value)}
          >
            <SelectTrigger className="w-full max-w-[400px]" id="solicitouIsencaoTaxaInscricao">
              <SelectValue placeholder="Pediu ISENÇÃO?" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{msg(errors.solicitouIsencaoTaxaInscricao)}</FieldError>{" "}
        </Field>
      )}
    />
  )
}
