import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-vf-light bg-vf-navy/20 backdrop-blur-sm px-3.5 py-2.5 text-base text-vf-sand placeholder:text-vf-sand/40 transition-colors duration-300 outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-vf-sand focus-visible:border-vf-accent focus-visible:ring-2 focus-visible:ring-vf-accent/20 focus-visible:shadow-vf-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-vf-navy/10 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 hover:border-vf-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
