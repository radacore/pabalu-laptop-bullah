import * as React from "react"
import { cn } from "@/lib/utils"

type TooltipCtx = { open: boolean; setOpen: (v: boolean) => void }
const TooltipContext = React.createContext<TooltipCtx>({ open: false, setOpen: () => {} })

function TooltipProvider({ children, delayDuration: _delay }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>
}

function TooltipTrigger({ children, asChild, className, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(TooltipContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      className: cn((children as React.ReactElement<Record<string, unknown>>).props.className as string | undefined, className),
      ...props,
    })
  }
  return <button type="button" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className={className} {...props}>{children}</button>
}

function TooltipContent({ children, className, ...props }: React.ComponentProps<"div">) {
  const { open } = React.useContext(TooltipContext)
  if (!open) return null
  return (
    <div className={cn("bg-surface-container-high text-on-surface z-50 rounded-md px-3 py-1.5 text-xs shadow-lg whitespace-nowrap", className)} {...props}>
      {children}
    </div>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
