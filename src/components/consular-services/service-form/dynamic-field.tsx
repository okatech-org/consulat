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
import { ServiceField } from '@/types/consular-service'

interface DynamicFieldProps<T extends FieldValues> {
  data: ServiceField
  form: UseFormReturn<T>
  isPreFilled?: boolean
  disabled?: boolean
}

export function DynamicField({
                               data,
                               form,
                               isPreFilled,
                               disabled
                             }: DynamicFieldProps<FieldValues>) {
  const t = useTranslations('consular.services.form')

  const renderFieldInput = (formField: FieldValues) => {
    switch (data.type) {
      case 'select':
        return (
          <Select
            disabled={disabled}
            onValueChange={formField.onChange}
            defaultValue={formField.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={data.placeholder || t('select_placeholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {data.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'phone':
        return (
          <PhoneInput
            {...formField}
            disabled={disabled}
            placeholder={data.placeholder}
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
            placeholder={data.placeholder}
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
            type={data.type}
            disabled={disabled}
            placeholder={data.placeholder}
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
      name={data.name}
      render={({ field: formField }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className={cn(isPreFilled && "text-muted-foreground")}>
              {data.label}
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

          {data.description && (
            <FormDescription>{data.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}