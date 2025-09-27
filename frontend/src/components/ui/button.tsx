import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-slate-950 dark:focus-visible:ring-cyan-400",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-200",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700",
        outline:
          "border border-blue-200 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400/30 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
        secondary:
          "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30",
        ghost: "text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
