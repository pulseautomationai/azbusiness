import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-ocotillo-red text-white [a&]:hover:bg-ocotillo-red/90",
        secondary:
          "border-transparent bg-desert-marigold text-white [a&]:hover:bg-desert-marigold/90",
        destructive:
          "border-transparent bg-ocotillo-red text-white [a&]:hover:bg-ocotillo-red/90 focus-visible:ring-ocotillo-red/20 dark:focus-visible:ring-ocotillo-red/40",
        outline:
          "text-ironwood-charcoal border-gray-200 [a&]:hover:bg-agave-cream [a&]:hover:text-ironwood-charcoal",
        success:
          "border-transparent bg-turquoise-sky text-white [a&]:hover:bg-turquoise-sky/90",
        warning:
          "border-transparent bg-desert-marigold text-white [a&]:hover:bg-desert-marigold/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge, badgeVariants }
