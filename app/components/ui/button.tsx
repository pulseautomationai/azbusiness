import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-ocotillo-red text-white shadow-xs hover:bg-ocotillo-red/90 hover:shadow-sm transition-all duration-200",
        destructive:
          "bg-ocotillo-red text-white shadow-xs hover:bg-ocotillo-red/90 focus-visible:ring-ocotillo-red/20 dark:focus-visible:ring-ocotillo-red/40",
        outline:
          "border border-gray-200 bg-white text-ironwood-charcoal shadow-xs hover:bg-agave-cream hover:border-turquoise-sky hover:text-turquoise-sky dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-desert-marigold text-white shadow-xs hover:bg-desert-marigold/90",
        ghost:
          "hover:bg-agave-cream hover:text-ironwood-charcoal dark:hover:bg-accent/50",
        link: "text-turquoise-sky underline-offset-4 hover:underline hover:text-turquoise-sky/90",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
