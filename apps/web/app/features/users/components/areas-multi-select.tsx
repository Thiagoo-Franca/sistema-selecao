import { useState } from "react"
import { AREAS, AREA_LABEL } from "@tcc/shared"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

type Area = (typeof AREAS)[number]

interface AreasMultiSelectProps {
  value: Area[]
  onChange: (areas: Area[]) => void
  disabled?: boolean
}

// Popover + Command do Radix/cmdk (mesmo padrão do TeacherCombobox): funciona
// dentro do Dialog do Radix, que bloqueia cliques em portais de outras libs.
export function AreasMultiSelect({ value, onChange, disabled }: AreasMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleArea = (area: Area) => {
    onChange(value.includes(area) ? value.filter((item) => item !== area) : [...value, area])
  }

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={cn("truncate", !value.length && "text-muted-foreground")}>
              {value.length
                ? `${value.length} área(s) selecionada(s)`
                : "Selecione as áreas"}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar área..." />
            <CommandList>
              <CommandEmpty>Nenhuma área encontrada.</CommandEmpty>
              <CommandGroup>
                {AREAS.map((area) => (
                  <CommandItem
                    key={area}
                    value={`${area} ${AREA_LABEL[area]}`}
                    onSelect={() => toggleArea(area)}
                  >
                    <Check
                      className={cn(value.includes(area) ? "opacity-100" : "opacity-0")}
                    />
                    <span className="font-medium">{area}</span>
                    <span className="text-muted-foreground">{AREA_LABEL[area]}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((area) => (
            <Badge key={area} variant="secondary" className="gap-1" title={AREA_LABEL[area]}>
              {area}
              <button
                type="button"
                onClick={() => toggleArea(area)}
                disabled={disabled}
                aria-label={`Remover ${AREA_LABEL[area]}`}
                className="rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
