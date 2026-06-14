import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ComponentProps<"input"> {
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ className, onCheckedChange, ...props }: SwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked)
    props.onChange?.(e)
  }

  return (
    <input
      type="checkbox"
      role="switch"
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-outline-variant transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-secondary checked:border-secondary relative",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Switch }
