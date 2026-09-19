import { Button } from "@/components/ui/button"
import { Calendar, Loader2 } from "lucide-react"
import { useGoogleCalendarUrl, useOutlookCalendarUrl } from "@/hooks/calendar.hooks"

interface CalendarQuickLinksProps {
  bancaId: string
}

export function CalendarQuickLinks({ bancaId }: CalendarQuickLinksProps) {
  const googleCalendarMutation = useGoogleCalendarUrl()
  const outlookCalendarMutation = useOutlookCalendarUrl()

  const handleGoogleCalendar = () => {
    googleCalendarMutation.mutate(bancaId)
  }

  const handleOutlookCalendar = () => {
    outlookCalendarMutation.mutate(bancaId)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        variant="outline"
        onClick={handleGoogleCalendar}
        disabled={googleCalendarMutation.isPending}
        className="flex flex-1 items-center justify-center gap-2"
      >
        {googleCalendarMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Calendar className="h-4 w-4" />
        )}
        <span>Google Calendar</span>
      </Button>

      <Button
        variant="outline"
        onClick={handleOutlookCalendar}
        disabled={outlookCalendarMutation.isPending}
        className="flex flex-1 items-center justify-center gap-2"
      >
        {outlookCalendarMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Calendar className="h-4 w-4" />
        )}
        <span>Outlook.com</span>
      </Button>
    </div>
  )
}
