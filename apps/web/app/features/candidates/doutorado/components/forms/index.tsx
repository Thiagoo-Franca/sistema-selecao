import { Button } from "@/shared/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { valorBooleanoSelect } from "@/shared/lib/helpers"
import type { CandidatoDoutoradoComRelacoes } from "@tcc/server"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form"
import { msg } from "@/features/candidates/mestrado/components/forms"
import type { CandidatoDoutoradoNota } from "@/features/candidates/shared/schema/candidate.schema"
import {
  AuditorField,
  AvaliadorField,
  GruField,
  HomologaField,
  IsencaoAprovadaField,
} from "@/features/candidates/shared/components/forms/fields"
import { PediuIsencaoField } from "@/features/candidates/shared/components/forms/fields/pediu-isencao"
import { EspeciaisField } from "@/features/candidates/shared/components/forms/fields/especiais"
import { AREAPGCOMP, AREAPGCOMP_LABEL } from "@tcc/shared"

interface FormsAvaliacaoDoutoradoProps {
  handleSubmit: UseFormHandleSubmit<any>
  register: UseFormRegister<CandidatoDoutoradoNota>
  control: Control<any, any>
  errors: FieldErrors<any>
  isSubmitting: boolean
  nota: number
  isAdmin: boolean
  teachersData: any[]
  isTeachersLoading: boolean
  candidato: CandidatoDoutoradoComRelacoes
  onSubmit: (data: any) => Promise<void>
  RPG: number
  RPQ_MSC: number
}

export default function FormsAvaliacaoDoutorado({
  handleSubmit,
  register,
  control,
  errors,
  isSubmitting,
  nota,
  isAdmin,
  teachersData,
  isTeachersLoading,
  candidato,
  onSubmit,
  RPG,
  RPQ_MSC,
}: FormsAvaliacaoDoutoradoProps) {
  return (
    <form className="container mx-auto flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <FieldLegend className="font-bold text-muted-foreground">Avaliadores</FieldLegend>
      <div className="grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
        <AvaliadorField
          candidato={candidato}
          control={control}
          isAdmin={isAdmin}
          teachersData={teachersData}
          isTeachersLoading={isTeachersLoading}
          errors={errors}
        />

        <AuditorField
          candidato={candidato}
          control={control}
          isAdmin={isAdmin}
          teachersData={teachersData}
          isTeachersLoading={isTeachersLoading}
          errors={errors}
        />
      </div>

      <FieldLegend className="font-bold text-muted-foreground">Dados do candidato</FieldLegend>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <PediuIsencaoField control={control} errors={errors} candidato={candidato} />
        <IsencaoAprovadaField control={control} errors={errors} candidato={candidato} />
        <GruField control={control} errors={errors} candidato={candidato} />
        <HomologaField control={control} errors={errors} candidato={candidato} />
        <Controller
          control={control}
          name="areaPgcomp"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-4" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="areaPgcomp" className="font-bold text-muted-foreground">
                Área PGCOMP
              </FieldLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <SelectTrigger
                  id="areaPgcomp"
                  className="w-full max-w-[400px]"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {AREAPGCOMP.map((area) => (
                      <SelectItem key={area} value={area}>
                        {AREAPGCOMP_LABEL[area]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Orientador(a) do Mestrado */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="orientadorMestrado" className="font-bold text-muted-foreground">
            Orientador(a) do Mestrado
          </FieldLabel>
          <Input
            {...register("orientadorMestrado")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="orientadorMestrado"
          />
        </Field>
        {/* Potencial orientador 1 */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="primeiraOpcaoOrientador" className="font-bold text-muted-foreground">
            Potencial Orientador 1
          </FieldLabel>
          <Input
            {...register("primeiraOpcaoOrientador")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="primeiraOpcaoOrientador"
          />
        </Field>
        {/* Potencial orientador 2 */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="segundaOpcaoOrientador" className="font-bold text-muted-foreground">
            Potencial Orientador 2
          </FieldLabel>
          <Input
            {...register("segundaOpcaoOrientador")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="segundaOpcaoOrientador"
          />
        </Field>
        {/* Potencial orientador 3 */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="terceiraOpcaoOrientador" className="font-bold text-muted-foreground">
            Potencial Orientador 3
          </FieldLabel>
          <Input
            {...register("terceiraOpcaoOrientador")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="terceiraOpcaoOrientador"
          />
        </Field>
        <EspeciaisField control={control} errors={errors} />
        {/* Cotas */}
        <Controller
          control={control}
          name="cotas"
          render={({ field }) => (
            <Field className="flex flex-col gap-4">
              <FieldLabel htmlFor="cotas" className="font-bold text-muted-foreground">
                Cotas (Negros)
              </FieldLabel>
              <Select
                key={valorBooleanoSelect(field.value)}
                onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                value={valorBooleanoSelect(field.value)}
              >
                <SelectTrigger className="w-full max-w-[400px]" id="cotas">
                  <SelectValue placeholder="Cotas (Negros)?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sim">SIM</SelectItem>
                    <SelectItem value="nao">NÃO</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{msg(errors.cotas)}</FieldError>
            </Field>
          )}
        />
        {/* SUPRA */}
        <Controller
          control={control}
          name="supra"
          render={({ field }) => (
            <Field className="flex flex-col gap-4">
              <FieldLabel htmlFor="supra" className="font-bold text-muted-foreground">
                SUPRA
              </FieldLabel>
              <Select
                key={valorBooleanoSelect(field.value)}
                onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                value={valorBooleanoSelect(field.value)}
              >
                <SelectTrigger className="w-full max-w-[400px]" id="supra">
                  <SelectValue placeholder="SUPRA?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sim">SIM</SelectItem>
                    <SelectItem value="nao">NÃO</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{msg(errors.SUPRA)}</FieldError>
            </Field>
          )}
        />
        {/* Universidade */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="universidadeMestrado" className="font-bold text-muted-foreground">
            Universidade Mestrado
          </FieldLabel>
          <Input
            {...register("universidadeMestrado")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="universidadeMestrado"
          />
        </Field>
        {/* Curso */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="cursoMestrado" className="font-bold text-muted-foreground">
            Curso
          </FieldLabel>
          <Input
            {...register("cursoMestrado")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="cursoMestrado"
          />
        </Field>
        {/* Cidade Universiade */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="cidadeMestrado" className="font-bold text-muted-foreground">
            Cidade da Universidade
          </FieldLabel>
          <Input
            {...register("cidadeMestrado")}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="text"
            id="cidadeMestrado"
          />
        </Field>
      </div>
      <FieldLegend className="font-bold text-muted-foreground">Notas da Etapa I</FieldLegend>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {/* Nota mestrado*/}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="msc" className="font-bold text-muted-foreground">
            MSC (NOTA MESTRADO)
          </FieldLabel>
          <Input
            {...register("msc", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            step="0.01"
            id="msc"
          />
        </Field>

        {/* AREA */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="areaGrad" className="font-bold text-muted-foreground">
            AREA DE FORMAÇÃO DA GRADUAÇÃO
          </FieldLabel>
          <Input
            {...register("areaGrad", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            step="0.01"
            id="areaGrad"
          />
        </Field>

        {/* Conceito CAPES */}
        <Controller
          control={control}
          name="conceitoCapesMestrado"
          render={({ field }) => (
            <Field className="flex flex-col gap-4">
              <FieldLabel
                htmlFor="conceitoCapesMestrado"
                className="font-bold text-muted-foreground"
              >
                CONCEITO CAPES
              </FieldLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value ? String(field.value) : ""}
              >
                <SelectTrigger className="w-full max-w-[400px]">
                  <SelectValue placeholder="Conceito CAPES" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="0">0</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {/* A1A2A3A4 */}
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

        {/* B1B2B3B4 */}
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
        <Field className="flex flex-col gap-4" data-invalid={!!errors.notaAnteprojeto}>
          <FieldLabel htmlFor="notaAnteprojeto" className="font-bold text-muted-foreground">
            Nota do Anteprojeto
          </FieldLabel>
          <Input
            {...register("notaAnteprojeto", {
              setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
            })}
            className="w-full max-w-[400px]"
            type="number"
            id="notaAnteprojeto"
            step="0.01"
            min={0}
            max={10}
            aria-invalid={!!errors.notaAnteprojeto}
          />
          {errors.notaAnteprojeto && <FieldError errors={[errors.notaAnteprojeto]} />}
        </Field>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Prévia Nota */}
        <Field className="flex flex-col gap-4">
          <FieldDescription className="text-sm text-muted-foreground">
            RPQ_MSC: {RPQ_MSC} | RPG: {RPG}
          </FieldDescription>
          <FieldLabel
            htmlFor="notas.notaFinal"
            className="text-lg font-bold text-muted-foreground"
          >{`NOTA FINAL (PRÉVIA): ${nota}`}</FieldLabel>
        </Field>

        <Button
          type="submit"
          className="col-span-3 my-2 w-full max-w-[400px] rounded-[8px] bg-green-500 p-2 text-white hover:bg-green-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </div>
      <hr className="my-4" />
      <FieldDescription className="text-sm text-muted-foreground">
        A nota final é calculada automaticamente com base nas notas informadas. Antes de salvar,
        revise todos os valores. Para aprovação, o candidato deve obter nota mínima de 6,0 na
        primeira etapa, 8,0 na segunda etapa e nota final igual ou superior a 7,0.
      </FieldDescription>
    </form>
  )
}
