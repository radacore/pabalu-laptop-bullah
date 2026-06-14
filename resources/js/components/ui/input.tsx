import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "bg-surface-container-low border-outline-variant placeholder:text-outline flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base shadow-low transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-secondary focus:shadow-[0_0_0_2px_#0058be] focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
