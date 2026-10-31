import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TeacherCombobox } from "@/components/ui/teacher-combox"
import { GRU_OPTIONS } from "@/lib/constants"
import { normalizeGru, valorBooleanoSelect, valorSimNaoSelect } from "@/lib/helpers"
import type { CandidatoMestradoComRelacoes } from "@tcc/server"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form"

interface FormsAvaliacaoMestradoProps {
  handleSubmit: UseFormHandleSubmit<any>
  register: UseFormRegister<any>
  control: Control<any, any>
  errors: FieldErrors<any>
  isSubmitting: boolean
  nota: number
  isAdmin: boolean
  teachersData: any[]
  isTeachersLoading: boolean
  candidato: CandidatoMestradoComRelacoes
  onSubmit: (data: any) => Promise<void>
}

export default function FormsAvaliacaoMestrado({
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
}: FormsAvaliacaoMestradoProps) {
  return (
    <form className="container mx-auto flex flex-col gap-y-3" onSubmit={handleSubmit(onSubmit)}>
      <FieldLegend className="font-bold text-muted-foreground">Avaliadores</FieldLegend>
      <div className="grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
        {/* Avaliador */}

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
          <FieldError>{errors.avaliadorId?.message}</FieldError>
        </Field>

        {/* Auditor */}
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
          <FieldError>{errors.auditorId?.message}</FieldError>
        </Field>
      </div>
      <div className="mt-4 grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
        {/* Pediu Isenção */}

        {
          // AVALIAR SE REALMENTE É NECESSÁRIO TER ESSE CAMPO, POIS NÃO FAZ MUITO SENTIDO ALTERAR ESSE CAMPO A MENOS QUE SEJA PARA EDITAR NA PAGINA ANTERIOR
        }
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
              </FieldLabel>
              <Select
                key={field.value}
                onValueChange={(v) => field.onChange(v === "sim" ? "sim" : "nao")}
                value={field.value}
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
              <FieldError>{errors.solicitouIsencaoTaxaInscricao?.message}</FieldError>
            </Field>
          )}
        />

        {/* Isenção Aprovada */}
        <Controller
          control={control}
          name="isencaoAprovada"
          render={({ field }) => (
            <Field className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between gap-2">
                <FieldLabel htmlFor="isencaoAprovada" className="font-bold text-muted-foreground">
                  ISENÇÃO APROVADA?
                </FieldLabel>
                <FieldDescription>
                  {candidato.solicitouIsencaoTaxaInscricao === "NÃO SOLICITOU" ? (
                    <span className="text-sm text-muted-foreground">
                      <a className="hover:underline" href={candidato.isencaoAprovada ?? "#"}>
                        Ver comprovante pagamento
                      </a>
                    </span>
                  ) : (
                    <a
                      className="text-sm text-muted-foreground"
                      href={candidato.solicitouIsencaoTaxaInscricao ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver comprovante.
                    </a>
                  )}
                </FieldDescription>
              </div>
              <Select
                key={field.value}
                onValueChange={(v) => field.onChange(v === "sim" ? "sim" : "nao")}
                value={field.value}
              >
                {" "}
                <SelectTrigger className="w-full max-w-[400px]" id="isencaoAprovada">
                  <SelectValue placeholder="Isenção aprovada?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.isencaoAprovada?.message}</FieldError>
            </Field>
          )}
        />

        {/* GRU (Guia de Recolhimento da União) */}
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

              <Select onValueChange={field.onChange} value={normalizeGru(field.value)}>
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
              <FieldError>{errors.gru?.message}</FieldError>
            </Field>
          )}
        />
        {/* Homologa */}
        <Controller
          control={control}
          name="Homologa"
          render={({ field }) => (
            <Field className="flex flex-col gap-4">
              <FieldLabel htmlFor="Homologa" className="font-bold text-muted-foreground">
                Homologa?
              </FieldLabel>
              <Select
                key={valorSimNaoSelect(field.value)}
                onValueChange={(v) => field.onChange(v === "sim" ? "sim" : "nao")}
                value={valorSimNaoSelect(field.value)}
              >
                <SelectTrigger className="w-full max-w-[400px]" id="Homologa">
                  <SelectValue placeholder="Homologa?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sim">SIM</SelectItem>
                    <SelectItem value="nao">NÃO</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.Homologa?.message}</FieldError>
            </Field>
          )}
        />
        {/* Especiais */}
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
              <FieldError>{errors.especiais?.message}</FieldError>
            </Field>
          )}
        />

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
              <FieldError>{errors.cotas?.message}</FieldError>
            </Field>
          )}
        />

        {/* SUPRA */}
        <Controller
          control={control}
          name="SUPRA"
          render={({ field }) => (
            <Field className="flex flex-col gap-4">
              <FieldLabel htmlFor="SUPRA" className="font-bold text-muted-foreground">
                SUPRA
              </FieldLabel>
              <Select
                key={valorBooleanoSelect(field.value)}
                onValueChange={(v) => field.onChange(v === "sim" ? true : false)}
                value={valorBooleanoSelect(field.value)}
              >
                <SelectTrigger className="w-full max-w-[400px]" id="SUPRA">
                  <SelectValue placeholder="SUPRA?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sim">SIM</SelectItem>
                    <SelectItem value="nao">NÃO</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{errors.SUPRA?.message}</FieldError>
            </Field>
          )}
        />
      </div>
      <FieldLegend className="font-bold">Notas da Etapa I</FieldLegend>
      <div className="grid w-full grid-cols-1 gap-4 px-2 md:grid-cols-3">
        {/* GRAD */}
        <Field className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-2">
            <FieldLabel htmlFor="grad" className="font-bold text-muted-foreground">
              GRAD
            </FieldLabel>
            <FieldDescription>
              {candidato.notas?.gradLink ? (
                <a href={candidato.notas?.gradLink} target="_blank" rel="noopener noreferrer">
                  Ver histórico.
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">Histórico não disponível</span>
              )}
            </FieldDescription>
          </div>
          <Input
            {...register("grad", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            step="0.01"
            id="grad"
          />
          <FieldError>{errors.grad?.message}</FieldError>
        </Field>

        {/* AREA 
          <Field className="flex flex-col gap-4">
            <FieldLabel htmlFor="area" className="font-bold text-muted-foreground">
              AREA
            </FieldLabel>
            <Input
              {...register("area", { valueAsNumber: true })}
              className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
              type="number"
              step="0.01"
              id="area"
            />
            <FieldError>{errors.area?.message}</FieldError>
          </Field>
              */}
        {/* AREA */}
        <Controller
          control={control}
          name="area"
          render={({ field }) => {
            const areaValue =
              typeof field.value === "number" &&
              Number.isFinite(field.value) &&
              field.value >= 0 &&
              field.value <= 1
                ? String(field.value)
                : ""

            return (
              <Field className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between gap-2">
                  <FieldLabel htmlFor="area" className="font-bold text-muted-foreground">
                    ÁREA
                  </FieldLabel>
                  <FieldDescription>
                    <a
                      href={candidato.notas?.gradLink ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver comprovante.
                    </a>
                  </FieldDescription>
                </div>

                <Select
                  key={areaValue || "empty"}
                  value={areaValue}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger className="w-full max-w-[400px]" id="area">
                    <SelectValue placeholder={candidato.notas?.area ?? "0"} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="0.5">0.5</SelectItem>
                      <SelectItem value="0.6">0.6</SelectItem>
                      <SelectItem value="0.7">0.7</SelectItem>
                      <SelectItem value="0.85">0.85</SelectItem>
                      <SelectItem value="0.9">0.9</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.area?.message}</FieldError>
              </Field>
            )
          }}
        />

        {/* ENADE */}
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
        <div>
          <a
            href={candidato.notas?.a1a2a3a4Link ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-500 hover:text-[#70C8EA] hover:underline"
          >
            Clique aqui para ver as produções
          </a>
        </div>
        <div />
        <div />
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
          <FieldError>{errors.a1a2a3a4?.message}</FieldError>
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
          <FieldError>{errors.b1b2b3b4?.message}</FieldError>
        </Field>

        {/* IC/IT */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="icit" className="font-bold text-muted-foreground">
            IC/IT
          </FieldLabel>
          <Input
            {...register("icIt", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            id="icit"
          />
          <FieldError>{errors.icIt?.message}</FieldError>
        </Field>

        {/* POSCOMP */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="poscomp" className="font-bold text-muted-foreground">
            POSCOMP
          </FieldLabel>
          <Input
            {...register("poscomp", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            id="poscomp"
          />
          <FieldError>{errors.poscomp?.message}</FieldError>
        </Field>

        {/* DISCIPLINA PÓS CAPES 6+ */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="posCapes" className="font-bold text-muted-foreground">
            DISCIPLINA PÓS CAPES 6+
          </FieldLabel>
          <Input
            {...register("disciplinaPosCapes6Mais", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            id="posCapes"
          />
          <FieldError>{errors.disciplinaPosCapes6Mais?.message}</FieldError>
        </Field>

        {/* DISCIPLINA PÓS CAPES 3 a 5 */}
        <Field className="flex flex-col gap-4">
          <FieldLabel htmlFor="posCapes3a5" className="font-bold text-muted-foreground">
            DISCIPLINA PÓS CAPES 3 a 5
          </FieldLabel>
          <Input
            {...register("disciplinaPosCapes3a5", { valueAsNumber: true })}
            className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
            type="number"
            id="posCapes3a5"
          />
          <FieldError>{errors.disciplinaPosCapes3a5?.message}</FieldError>
        </Field>
      </div>

      <FieldLegend className="font-bold">Notas da Etapa II</FieldLegend>
      {/* Nota etapa II */}
      <Field className="flex flex-col gap-4">
        <FieldLabel htmlFor="notaEtapaII" className="font-bold text-muted-foreground">
          Nota etapa II
        </FieldLabel>
        <Input
          {...register("notaEtapaII", { valueAsNumber: true })}
          className="w-full max-w-[400px] rounded-[8px] border border-gray-800 p-2"
          type="number"
          id="notaEtapaII"
        />
        <FieldError>{errors.notaEtapaII?.message}</FieldError>
      </Field>

      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Prévia Nota */}
        <Field className="flex flex-col gap-4">
          <FieldLabel
            htmlFor=" notaFinal"
            className="text-lg font-bold text-muted-foreground"
          >{`NOTA FINAL (PRÉVIA): ${nota.toFixed(2)}`}</FieldLabel>
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
