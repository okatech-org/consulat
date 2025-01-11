'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateCountryInput } from '@/types/country'
import { countrySchema } from '@/schemas/country'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface CountryFormProps {
  initialData?: CreateCountryInput
  isLoading?: boolean
  onSubmit: (data: CreateCountryInput) => Promise<void>
}

export function CountryForm({ initialData, onSubmit }: CountryFormProps) {
  const t = useTranslations('superadmin.countries')

  const form = useForm<CreateCountryInput>({
    resolver: zodResolver(countrySchema),
    defaultValues: initialData
  })

  useEffect(() => {
    console.log(form.formState.errors)
  }, [form.formState.errors])

  return (
    // eslint-disable-next-line react/jsx-no-undef
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.name.placeholder')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.code.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('form.code.placeholder')}
                  maxLength={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status.label')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.status.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {t('form.status.options.active')}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {t('form.status.options.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {initialData ? t('actions.update') : t('actions.create')}
        </Button>
      </form>
    </Form>
  )
}