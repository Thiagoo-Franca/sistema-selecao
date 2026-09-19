import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { CalendarQuickLinks } from "./CalendarQuickLinks"
import { EmailInviteDialog } from "./EmailInviteDialog"

interface CalendarInviteSectionProps {
  bancaId: string
  bancaTitle: string
}

export function CalendarInviteSection({ bancaId, bancaTitle }: CalendarInviteSectionProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Quick Links */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Links rápidos:</p>
          <CalendarQuickLinks bancaId={bancaId} />
        </div>

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t"></div>
          <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* Email Invite */}
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Para qualquer aplicativo de calendário:
          </p>
          <Button
            variant="outline"
            onClick={() => setEmailDialogOpen(true)}
            className="w-full justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Enviar convite por email
          </Button>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Compatível com Google, Outlook, Apple Calendar e outros
          </p>
        </div>
      </div>

      {/* Email Dialog */}
      <EmailInviteDialog
        bancaId={bancaId}
        bancaTitle={bancaTitle}
        isOpen={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
      />
    </div>
  )
}
