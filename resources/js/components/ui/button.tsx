import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, Slot } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: "bg-secondary text-on-secondary shadow-low hover:bg-on-secondary-fixed-variant",
        destructive: "bg-error text-on-error shadow-low hover:bg-error/90",
        success: "bg-green-600 text-white shadow-low hover:bg-green-700",
        outline: "border border-outline-variant bg-surface text-on-surface shadow-low hover:bg-surface-container-low",
        secondary: "bg-surface-container-low text-on-surface hover:bg-surface-container-high",
        ghost: "hover:bg-surface-container-low text-on-surface-variant",
        link: "text-secondary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
