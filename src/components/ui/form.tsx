import * as React from "react"
import { Form as FormPrimitive } from "@base-ui/react/form"
import { cn } from "@/lib/utils"

function Form({ className, ...props }: React.ComponentProps<typeof FormPrimitive>) {
  return (
    <FormPrimitive
      data-slot="form"
      className={cn("grid gap-4", className)}
      {...props}
    />
  )
}

export { Form }