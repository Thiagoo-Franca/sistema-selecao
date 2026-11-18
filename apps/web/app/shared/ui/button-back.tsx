"use client"

import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "./button"

interface ButtonBackProps {
  className?: string
}

export function ButtonBack({ className }: ButtonBackProps) {
  const navigate = useNavigate()

  return (
    <Button
      variant="link"
      onClick={() => navigate(-1)}
      className={`hover:bg-gray-50 ${className}`}
      aria-label="Voltar"
    >
      <ChevronLeft className="me-1 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
      Voltar
    </Button>
  )
}
