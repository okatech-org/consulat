import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

// Field Context for sharing IDs and state between Field components
type FieldContextValue = {
  fieldId: string;
  descriptionId: string;
  errorId: string;
  isInvalid: boolean;
  isRequired: boolean;
};

export const FieldContext = React.createContext<FieldContextValue | undefined>(undefined);

const useFieldContext = () => {
  const context = React.useContext(FieldContext);
  if (!context) {
    throw new Error('Field components must be used within a Field component with name prop');
  }
  return context;
};

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name?: string;
    orientation?: 'horizontal' | 'vertical';
    'data-invalid'?: boolean;
    required?: boolean;
  }
>(({ className, orientation = 'vertical', 'data-invalid': dataInvalid, name, required, children, ...props }, ref) => {
  const formContext = name ? useFormContext() : undefined;
  const fieldId = React.useId();
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  
  // Get field state from React Hook Form if name is provided
  const fieldState = name && formContext ? formContext.getFieldState(name, formContext.formState) : undefined;
  const isInvalid = dataInvalid ?? fieldState?.invalid ?? false;
  const isRequired = required ?? fieldState?.error?.types?.required !== undefined;

  const contextValue: FieldContextValue = {
    fieldId,
    descriptionId,
    errorId,
    isInvalid,
    isRequired,
  };

  return (
    <FieldContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row items-center gap-4' : 'flex-col gap-2',
          isInvalid && 'data-[invalid=true]:text-destructive',
          className
        )}
        data-invalid={isInvalid}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
});
Field.displayName = 'Field';

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, htmlFor, ...props }, ref) => {
  const context = React.useContext(FieldContext);
  const id = htmlFor || context?.fieldId;
  
  return (
    <Label
      ref={ref}
      className={cn(className)}
      htmlFor={id}
      {...props}
    />
  );
});
FieldLabel.displayName = 'FieldLabel';

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, id, ...props }, ref) => {
  const context = React.useContext(FieldContext);
  const descriptionId = id || context?.descriptionId;
  
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FieldDescription.displayName = 'FieldDescription';

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    errors?: Array<{ message?: string } | undefined>;
    customError?: string;
  }
>(({ className, id, errors, children, customError, ...props }, ref) => {
  const t = useTranslations();
  const context = React.useContext(FieldContext);
  const errorId = id || context?.errorId;
  const errorMessages = errors?.filter(Boolean).map((error) => error?.message) || [];
  
  if (!errorMessages.length && !children && !customError) {
    return null;
  }

  const body = customError || (errorMessages.length > 0 ? errorMessages[0] : children);

  return (
    <p
      ref={ref}
      id={errorId}
      role="alert"
      aria-live="polite"
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {customError ? t(customError) : typeof body === 'string' ? t(body) : body}
    </p>
  );
});
FieldError.displayName = 'FieldError';

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
});
FieldGroup.displayName = 'FieldGroup';

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => {
  return (
    <fieldset
      ref={ref}
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
});
FieldSet.displayName = 'FieldSet';

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.LegendHTMLAttributes<HTMLLegendElement> & {
    variant?: 'label' | 'heading';
  }
>(({ className, variant = 'heading', ...props }, ref) => {
  return (
    <legend
      ref={ref}
      className={cn(
        variant === 'heading' ? 'text-lg font-semibold' : 'text-sm font-medium',
        className
      )}
      {...props}
    />
  );
});
FieldLegend.displayName = 'FieldLegend';

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex-1', className)}
      {...props}
    />
  );
});
FieldContent.displayName = 'FieldContent';

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  useFieldContext,
};
