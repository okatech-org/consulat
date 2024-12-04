'use client'
import { useTranslations } from 'next-intl'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface FieldConfig {
  name: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'number'
  label: string
  description?: string
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

interface DynamicFieldProps<T extends FieldValues> {
  field: FieldConfig
  form: UseFormReturn<T>
  isPreFilled?: boolean
  disabled?: boolean
}

export function DynamicField({
                               field,
                               form,
                               isPreFilled,
                               disabled
                             }: DynamicFieldProps<FieldValues>) {
  const t = useTranslations('consular.services.form')

  const renderFieldInput = (formField: FieldValues) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            disabled={disabled}
            onValueChange={formField.onChange}
            defaultValue={formField.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || t('select_placeholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'tel':
        return (
          <PhoneInput
            {...formField}
            disabled={disabled}
            placeholder={field.placeholder}
            className={cn(
              isPreFilled && "bg-muted text-muted-foreground"
            )}
          />
        )

      case 'textarea':
        return (
          <Textarea
            {...formField}
            disabled={disabled}
            placeholder={field.placeholder}
            className={cn(
              isPreFilled && "bg-muted text-muted-foreground"
            )}
          />
        )

      case 'date':
        return (
          <Input
            {...formField}
            type="date"
            disabled={disabled}
            className={cn(
              isPreFilled && "bg-muted text-muted-foreground"
            )}
          />
        )

      default:
        return (
          <Input
            {...formField}
            type={field.type}
            disabled={disabled}
            placeholder={field.placeholder}
            className={cn(
              isPreFilled && "bg-muted text-muted-foreground"
            )}
          />
        )
    }
  }

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className={cn(isPreFilled && "text-muted-foreground")}>
              {field.label}
            </FormLabel>
            {isPreFilled && (
              <Badge variant="outline" className="text-xs">
                {t('prefilled')}
              </Badge>
            )}
          </div>

          <FormControl>
            {renderFieldInput(formField)}
          </FormControl>

          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}