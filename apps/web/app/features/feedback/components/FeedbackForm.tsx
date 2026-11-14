import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Checkbox } from "@/shared/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Label } from "@/shared/ui/label"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import { Textarea } from "@/shared/ui/textarea"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { useSubmitFeedbackMutation } from "../hooks/feedback.mutation"
import { feedbackFormSchema, type FeedbackFormValues } from "../schema/feedback.schema"
import { toast } from "sonner"
import { USAGE_PURPOSE_OPTIONS } from "../lib/constants"

export function FeedbackForm() {
  const navigate = useNavigate()
  const submitFeedbackMutation = useSubmitFeedbackMutation()

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      taskComplexityRating: 3,
      interfaceConsistencyRating: 3,
      responseTimeRating: 3,
      satisfactionRating: 3,
      usagePurposes: [],
      usagePurposeOther: "",
      completedAllTasks: undefined,
    },
  })

  function onSubmit(data: FeedbackFormValues) {
    submitFeedbackMutation.mutate(
      { json: data },
      {
        onSuccess: () => {
          toast.success("Feedback enviado com sucesso. Obrigado por contribuir com sua opinião!")
          form.reset()
          navigate("/")
        },
        onError: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : "Ocorreu um erro ao enviar seu feedback."

          if (errorMessage.includes("400") || errorMessage.toLowerCase().includes("já enviou")) {
            toast.error("Feedback já enviado. Você já enviou seu feedback")
          } else {
            toast.error(`Erro ao enviar feedback ${errorMessage}`)
          }
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback do Sistema</CardTitle>
        <CardDescription>
          Sua opinião é muito importante para melhorar o sistema. Por favor, responda as perguntas
          abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <RatingScalesSection form={form} />
            <SystemUsageSection form={form} />
            <TaskCompletionSection form={form} />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Feedback"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

interface FormSectionProps {
  form: ReturnType<typeof useForm<FeedbackFormValues>>
}

function RatingScalesSection({ form }: FormSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-lg font-semibold">Avaliação do Sistema</h3>

      <RatingScale
        form={form}
        name="taskComplexityRating"
        label="Complexidade das Tarefas"
        minLabel="Baixa"
        maxLabel="Alta"
      />

      <RatingScale
        form={form}
        name="interfaceConsistencyRating"
        label="Consistência da Interface"
        minLabel="Baixa"
        maxLabel="Alta"
      />

      <RatingScale
        form={form}
        name="responseTimeRating"
        label="Tempo de Resposta"
        minLabel="Muito lento"
        maxLabel="Muito rápido"
      />

      <RatingScale
        form={form}
        name="satisfactionRating"
        label="Satisfação Geral"
        minLabel="Muito insatisfeito"
        maxLabel="Muito satisfeito"
      />
    </div>
  )
}

interface RatingScaleProps {
  form: ReturnType<typeof useForm<FeedbackFormValues>>
  name: keyof FeedbackFormValues
  label: string
  minLabel: string
  maxLabel: string
}

function RatingScale({ form, name, label, minLabel, maxLabel }: RatingScaleProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`h-12 flex-1 rounded-md border-2 transition-colors ${
                      field.value === value
                        ? "border-blue-500 bg-blue-500 text-primary-foreground"
                        : "border-input hover:border-blue-500 hover:bg-blue-50 focus:border-blue-500 focus:bg-blue-50 focus:outline-none"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{minLabel}</span>
                <span>{maxLabel}</span>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SystemUsageSection({ form }: FormSectionProps) {
  const selectedPurposes = form.watch("usagePurposes")
  const showOtherInput = selectedPurposes.includes("other")

  return (
    <div className="space-y-4">
      <h3 className="border-b pb-2 text-lg font-semibold">Uso do Sistema</h3>

      <FormField
        control={form.control}
        name="usagePurposes"
        render={() => (
          <FormItem>
            <FormLabel>Para quais finalidades você usaria?</FormLabel>
            <div className="space-y-2">
              {USAGE_PURPOSE_OPTIONS.map((option) => (
                <FormField
                  key={option.id}
                  control={form.control}
                  name="usagePurposes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(option.id)}
                          className="data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                          onCheckedChange={(checked) => {
                            const value = field.value || []
                            if (checked) {
                              field.onChange([...value, option.id])
                            } else {
                              field.onChange(value.filter((v) => v !== option.id))
                            }
                          }}
                        />
                      </FormControl>
                      <Label className="cursor-pointer font-normal">{option.label}</Label>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {showOtherInput && (
        <FormField
          control={form.control}
          name="usagePurposeOther"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especifique outras finalidades</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva outras finalidades..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

function TaskCompletionSection({ form }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="border-b pb-2 text-lg font-semibold">Conclusão das Tarefas</h3>

      <FormField
        control={form.control}
        name="completedAllTasks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você conseguiu completar todas as tarefas propostas?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                value={String(field.value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="true"
                    id="completed-yes"
                    className="data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                  />
                  <Label htmlFor="completed-yes" className="cursor-pointer font-normal">
                    Sim
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="false"
                    id="completed-no"
                    className="data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500"
                  />
                  <Label htmlFor="completed-no" className="cursor-pointer font-normal">
                    Não
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
