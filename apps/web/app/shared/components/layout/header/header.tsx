import { cn } from "@/shared/lib/utils"
import HeaderBrand from "./header-brand"
import { useState } from "react"
import HeaderActions from "./header-actions"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      role="banner"
      aria-label="Cabeçalho principal"
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <HeaderBrand />
        <HeaderActions />
      </div>
    </header>
  )
}
