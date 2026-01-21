import * as React from "react"
import { cn } from "@/lib/utils"
import { FieldContext } from "./field"

function Input({ 
  className, 
  type, 
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
  required,
  autoComplete,
  ...props 
}: React.ComponentProps<"input">) {
  // Try to get context if available (optional, won't throw if not in Field)
  const context = React.useContext(FieldContext);
  const inputId = id || context?.fieldId;
  
  // Build aria-describedby from context
  const describedByParts: string[] = [];
  if (context?.descriptionId) describedByParts.push(context.descriptionId);
  if (context?.errorId && context?.isInvalid) describedByParts.push(context.errorId);
  if (ariaDescribedBy) describedByParts.push(ariaDescribedBy);
  const finalAriaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;
  
  // Set aria-required if field is required
  const finalAriaRequired = ariaRequired ?? (required || context?.isRequired) ? true : undefined;

  return (
    <input
      type={type}
      id={inputId}
      data-slot="input"
      autoComplete={autoComplete}
      aria-describedby={finalAriaDescribedBy}
      aria-required={finalAriaRequired}
      aria-invalid={context?.isInvalid}
      required={required}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
