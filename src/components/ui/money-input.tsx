'use client'

import * as React from "react"
import { cn } from "@/lib/utils/index"
import { Input } from "./input"

interface MoneyInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: number | string
  onChange: (value: number) => void
}

/**
 * A specialized input for monetary values.
 * Uses type="text" and inputMode="decimal" to provide a better mobile experience
 * and bypass browser-specific "number" input quirks (like scroll-to-change).
 */
export function MoneyInput({ value, onChange, className, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = React.useState<string>(value.toString())

  // Sync internal display value when external value changes (e.g. form reset or initial load)
  React.useEffect(() => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    const currentDisplayNum = parseFloat(displayValue)
    
    if (isNaN(numValue)) {
      if (displayValue !== '') setDisplayValue('')
    } else if (numValue !== currentDisplayNum) {
      setDisplayValue(numValue.toString())
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    
    // Only allow numbers, one decimal point, and one leading minus sign
    if (val === '' || val === '-') {
      setDisplayValue(val)
      onChange(0)
      return
    }

    // Regex to allow digits and a single decimal point
    if (/^-?\d*\.?\d*$/.test(val)) {
      setDisplayValue(val)
      const parsed = parseFloat(val)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Format to 2 decimal places on blur if it's a valid number
    const parsed = parseFloat(displayValue)
    if (!isNaN(parsed)) {
      const formatted = parsed.toFixed(2)
      setDisplayValue(formatted)
      onChange(parsed)
    } else {
      setDisplayValue("0.00")
      onChange(0)
    }
    
    if (props.onBlur) props.onBlur(e)
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn("font-mono", className)}
    />
  )
}
