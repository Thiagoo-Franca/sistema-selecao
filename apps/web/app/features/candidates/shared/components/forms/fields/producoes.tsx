import { Field, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import type { useForm } from "react-hook-form"

interface ProducoesFieldsProps {
  register: any
}

export function A1a2a3a4Field({ register }: ProducoesFieldsProps) {
  return (
    <Field className="flex flex-col gap-4">
      <FieldLabel htmlFor="a1a2a3a4" className="font-bold text-muted-foreground">
        A1, A2, A3, A4
      </FieldLabel>
      <Input
        {...register("a1a2a3a4", { valueAsNumber: true })}
        className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
        type="number"
        id="a1a2a3a4"
      />
    </Field>
  )
}
export function B1b2b3b4Field({ register }: ProducoesFieldsProps) {
  return (
    <Field className="flex flex-col gap-4">
      <FieldLabel htmlFor="b1b2b3b4" className="font-bold text-muted-foreground">
        B1, B2, B3, B4
      </FieldLabel>
      <Input
        {...register("b1b2b3b4", { valueAsNumber: true })}
        className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
        type="number"
        id="b1b2b3b4"
      />
    </Field>
  )
}
