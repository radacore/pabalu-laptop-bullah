import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type DialogContextType = { open: boolean; onOpenChange: (v: boolean) => void }
const DialogContext = React.createContext<DialogContextType | null>(null)

function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>")
  return ctx
}

function Dialog({ children, open: controlledOpen, onOpenChange: controlledOnOpenChange, defaultOpen = false }: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (v: boolean) => void
  defaultOpen?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

function DialogTrigger({ children, asChild, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onOpenChange } = useDialog()
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, { onClick: () => onOpenChange(true), ...props })
  }
  return <button type="button" onClick={() => onOpenChange(true)} {...props}>{children}</button>
}

function DialogClose({ children, asChild, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onOpenChange } = useDialog()
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, { onClick: () => onOpenChange(false), ...props })
  }
  return <button type="button" onClick={() => onOpenChange(false)} {...props}>{children}</button>
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body)
}

function DialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  )
}

function DialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { open, onOpenChange } = useDialog()
  if (!open) return null
  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />
      <div
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-outline-variant bg-white p-6 shadow-lg sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>,
    document.body
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-headline-sm text-headline-sm text-on-surface", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-body-md text-body-md text-on-surface-variant", className)} {...props} />
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
