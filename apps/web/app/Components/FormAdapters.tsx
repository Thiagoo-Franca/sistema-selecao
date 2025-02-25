import { Radio as MuiRadio, Select as MuiSelect, TextField as MuiTextField } from "@material-ui/core"
import type { MouseEvent, ReactNode } from "react"
import type { FieldRenderProps } from "react-final-form"

// Custom Field Adapter interfaces
interface FieldMetaState {
  active?: boolean
  data?: any
  dirty?: boolean
  dirtySinceLastSubmit?: boolean
  error?: any
  initial?: any
  invalid?: boolean
  pristine?: boolean
  submitError?: any
  submitFailed?: boolean
  submitSucceeded?: boolean
  submitting?: boolean
  touched?: boolean
  valid?: boolean
  visited?: boolean
}

interface TextFieldProps extends FieldRenderProps<string, HTMLElement> {
  label?: string
  fullWidth?: boolean
  multiline?: boolean
  type?: string
}

interface SelectFieldProps extends FieldRenderProps<string, HTMLElement> {
  label?: string
  formControlProps?: any
  children: ReactNode
  loading?: boolean
}

interface RadioFieldProps extends FieldRenderProps<string, HTMLElement> {
  value: string
  type: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

interface DatePickerWrapperProps extends FieldRenderProps<string, HTMLElement> {
  format?: string
  label?: string
  fullWidth?: boolean
  margin?: "normal" | "dense" | "none"
}

// Custom Field Adapters for Material-UI
export const TextFieldAdapter = ({ input, meta, ...rest }: TextFieldProps) => {
  const showError = ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) && meta.touched
  return (
    <MuiTextField
      {...input}
      {...rest}
      error={showError}
      helperText={showError ? meta.error || meta.submitError : undefined}
    />
  )
}

export const SelectAdapter = ({ input, meta, children, formControlProps, ...rest }: SelectFieldProps) => {
  const showError = ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) && meta.touched
  return (
    <MuiSelect
      {...input}
      {...rest}
      error={showError}
      inputProps={rest}
      onChange={(e) => input.onChange(e.target.value)}
      FormHelperTextProps={{ error: showError }}
      {...formControlProps}
    >
      {children}
    </MuiSelect>
  )
}

export const RadioAdapter = ({ input, ...rest }: RadioFieldProps) => {
  const { onClick, ...radioProps } = rest
  return (
    <MuiRadio
      {...input}
      {...radioProps}
      checked={input.value === rest.value}
      onChange={(e) => {
        input.onChange(e)
        if (onClick) {
          onClick(e as any)
        }
      }}
    />
  )
}

// Export types for reuse
export type { DatePickerWrapperProps, FieldMetaState, RadioFieldProps, SelectFieldProps, TextFieldProps }
