'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ServiceCategory } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { quickEditInput, quickEditSchema } from '@/schemas/consular-service'

interface ServiceFormProps {
  initialData?: Partial<quickEditInput>
  handleSubmit: (data: quickEditInput) => Promise<void>
  isLoading?: boolean
}


export function ServiceQuickForm({ initialData, handleSubmit, isLoading }: ServiceFormProps) {
  const t = useTranslations('superadmin.services')

  const form = useForm<quickEditInput>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || ServiceCategory.CIVIL_STATUS
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('form.name.placeholder')} disabled={isLoading} />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description.label')}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t('form.description.placeholder')} disabled={isLoading} />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.category.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.category.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ServiceCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}