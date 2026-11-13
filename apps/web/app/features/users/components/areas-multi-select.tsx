import { AREAS, AREA_LABEL } from "@tcc/shared"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/shared/ui/combox"

type Area = (typeof AREAS)[number]

interface AreasMultiSelectProps {
  value: Area[]
  onChange: (areas: Area[]) => void
  disabled?: boolean
}

export function AreasMultiSelect({ value, onChange, disabled }: AreasMultiSelectProps) {
  const anchor = useComboboxAnchor()

  return (
    <Combobox
      multiple
      items={AREAS}
      value={value}
      onValueChange={onChange}
      itemToStringLabel={(area: Area) => `${area} - ${AREA_LABEL[area]}`}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(selected: Area[]) =>
            selected.map((area) => (
              <ComboboxChip key={area} aria-label={AREA_LABEL[area]} title={AREA_LABEL[area]}>
                {area}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput
          placeholder={value.length ? "" : "Selecione as áreas"}
          aria-label="Áreas de atuação"
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Nenhuma área encontrada</ComboboxEmpty>
        <ComboboxList>
          {(area: Area) => (
            <ComboboxItem key={area} value={area}>
              <span className="font-medium">{area}</span>
              <span className="text-muted-foreground">{AREA_LABEL[area]}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
