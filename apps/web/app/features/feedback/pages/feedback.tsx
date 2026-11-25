import type { Route } from ".react-router/types/app/+types/root"
import { useUser } from "@/features/auth"
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm"
import { FeedbackStatistics } from "@/features/feedback/components/FeedbackStatistics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { Navigate } from "react-router"
import { ButtonBack } from "@/shared/ui/button-back"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL - Feedback" }]

const feedbackTabs = [
  { value: "form", label: "Enviar Feedback" },
  { value: "statistics", label: "Resultados da Pesquisa" },
]

export default function FeedbackPage() {
  const { data: user, isLoading: userLoading } = useUser()

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeTrigger = listRef.current?.querySelector<HTMLElement>('[data-state="active"]')
    activeTrigger?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [])

  if (userLoading) {
    return (
      <div className="">
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#70C8EA]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" />
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <ButtonBack />
      </div>
      <Tabs defaultValue="form" className="w-full">
        <TabsList
          ref={listRef}
          className="relative flex h-auto w-full snap-x justify-start gap-1 overflow-x-auto rounded-full border bg-white p-1 shadow-none [scrollbar-width:none] md:max-w-lg md:overflow-x-visible [&::-webkit-scrollbar]:hidden"
        >
          {feedbackTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md md:flex-1"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="form">
          <FeedbackForm />
        </TabsContent>

        <TabsContent value="statistics">
          <FeedbackStatistics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
