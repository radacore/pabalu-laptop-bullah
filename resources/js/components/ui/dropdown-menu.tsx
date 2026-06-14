import * as React from "react"
import { cn } from "@/lib/utils"

type DropdownCtx = { open: boolean; setOpen: (v: boolean) => void }
const DropdownContext = React.createContext<DropdownCtx>({ open: false, setOpen: () => {} })

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])
  return (
    <div ref={ref} className="relative inline-block">
      <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>
    </div>
  )
}

function DropdownMenuTrigger({ children, asChild, className, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = React.useContext(DropdownContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: () => setOpen(true),
      className: cn((children as React.ReactElement<Record<string, unknown>>).props.className as string | undefined, className),
      ...props,
    })
  }
  return <button type="button" onClick={() => setOpen(true)} className={className} {...props}>{children}</button>
}

function DropdownMenuContent({ children, className, align = "end", ...props }: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-outline-variant bg-white p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({ children, className, asChild, variant, ...props }: React.ComponentProps<"button"> & { asChild?: boolean; variant?: string }) {
  const { setOpen } = React.useContext(DropdownContext)

  const variantClass = variant === "destructive"
    ? "text-error hover:bg-error/10 focus:bg-error/10"
    : ""

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false)
    props.onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    const childProps = (children as React.ReactElement).props as Record<string, unknown>
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: (e: React.MouseEvent) => {
        setOpen(false)
        const childOnClick = childProps.onClick as ((e: React.MouseEvent) => void) | undefined
        childOnClick?.(e)
      },
      className: cn(
        "flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-on-surface outline-none transition-colors hover:bg-surface-container-low focus:bg-surface-container-low",
        variantClass,
        childProps.className as string | undefined,
        className
      ),
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-on-surface outline-none transition-colors hover:bg-surface-container-low focus:bg-surface-container-low",
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold text-on-surface", className)} {...props} />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr className={cn("-mx-1 my-1 border-outline-variant", className)} {...props} />
}

function DropdownMenuGroup({ children, className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-1", className)} {...props}>{children}</div>
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
}
