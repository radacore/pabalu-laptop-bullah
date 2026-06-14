import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.ComponentProps<"input"> {
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({ className, onCheckedChange, ...props }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked)
    props.onChange?.(e)
  }

  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-outline-variant bg-surface shadow-sm transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-secondary checked:text-on-secondary checked:border-secondary",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Checkbox }
