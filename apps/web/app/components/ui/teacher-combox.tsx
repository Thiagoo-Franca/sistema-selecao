import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface TeacherOption {
  id: number
  nome: string
}

interface TeacherComboboxProps {
  options: TeacherOption[]
  value: number | null | undefined
  onChange: (id: number | null) => void
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
}

export function TeacherCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione um professor",
  isLoading = false,
  disabled = false,
}: TeacherComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((option) => option.id === value)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {isLoading ? "Carregando..." : (selected?.nome ?? placeholder)}
          </span>
          <span className="flex items-center gap-1">
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar professor..." />
          <CommandList>
            <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.nome} ${option.id}`}
                  onSelect={() => {
                    onChange(option.id)
                    setIsOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
