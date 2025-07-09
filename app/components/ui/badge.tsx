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
          "border-transparent bg-saguaro-teal text-primary-foreground [a&]:hover:bg-mesa-terracotta",
        secondary:
          "border-transparent bg-clay-beige text-desert-night [a&]:hover:bg-clay-beige/80",
        destructive:
          "border-transparent bg-mesa-terracotta text-white [a&]:hover:bg-mesa-terracotta/90 focus-visible:ring-mesa-terracotta/20 dark:focus-visible:ring-mesa-terracotta/40",
        outline:
          "text-desert-night border-clay-beige [a&]:hover:bg-clay-beige [a&]:hover:text-desert-night",
        success:
          "border-transparent bg-agave-green text-white [a&]:hover:bg-agave-green/90",
        warning:
          "border-transparent bg-sun-gold text-desert-night [a&]:hover:bg-sun-gold/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
