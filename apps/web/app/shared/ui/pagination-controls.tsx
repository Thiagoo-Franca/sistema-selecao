"use client"

import { useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface PaginationControlsProps {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  className?: string
}

const LIMIT_OPTIONS = [10, 20, 50, 100]

export function PaginationControls({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onLimitChange,
  className,
}: PaginationControlsProps) {
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (page > 3) {
        pages.push("ellipsis")
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis")
      }

      pages.push(totalPages)
    }

    return pages
  }, [page, totalPages])

  const handlePrevious = useCallback(() => {
    if (hasPreviousPage) {
      onPageChange(page - 1)
    }
  }, [hasPreviousPage, onPageChange, page])

  const handleNext = useCallback(() => {
    if (hasNextPage) {
      onPageChange(page + 1)
    }
  }, [hasNextPage, onPageChange, page])

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 py-3 border-t",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">
          {total === 0 ? (
            "Nenhum resultado"
          ) : (
            <>
              Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de{" "}
              <strong>{total}</strong> resultado{total !== 1 ? "s" : ""}
            </>
          )}
        </span>

        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Itens por página">
            <SelectValue placeholder="Por página" />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} por página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Paginação">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={!hasPreviousPage}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageNum, index) =>
            pageNum === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "ghost"}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Página ${pageNum}`}
                aria-current={page === pageNum ? "page" : undefined}
                className="h-8 w-8"
              >
                {pageNum}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!hasNextPage}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  )
}