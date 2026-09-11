import type { ReactNode } from "react"

interface BancaHeaderProps {
  title: string
  trabalho: string
  autor: string
  curso: string
  additionalActions?: ReactNode
}

export function BancaHeader({
  title,
  trabalho,
  autor,
  curso,
  additionalActions,
}: BancaHeaderProps) {
  return (
    <div className="border-b bg-muted p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <img src="/brasao_ufba.png" alt="Brasão da UFBA" className="h-16 w-16 object-contain" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-muted-foreground">{trabalho}</p>
            <p className="text-sm text-muted-foreground">
              Autor: {autor} • Curso: {curso}
            </p>
          </div>
        </div>

        {additionalActions && additionalActions}
      </div>
    </div>
  )
}
