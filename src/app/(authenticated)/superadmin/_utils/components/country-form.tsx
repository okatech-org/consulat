'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateCountryInput } from '@/types/country'
import { countrySchema } from '@/schemas/country'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { cn, CountryItem, getWorldCountries } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface CountryFormProps {
  initialData?: CreateCountryInput
  isLoading?: boolean
  onSubmit: (data: CreateCountryInput) => Promise<void>
}

export function CountryForm({ initialData, onSubmit, isLoading }: CountryFormProps) {
  const t = useTranslations('superadmin.countries')
  const [countries, setCountries] = useState<CountryItem[]>([])
  const [searchValue, setSearchValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const locale = useLocale()

  const form = useForm<CreateCountryInput>({
    resolver: zodResolver(countrySchema),
    defaultValues: initialData
  })

  useEffect(() => {
    getWorldCountries(locale).then((data) => {
      setCountries(data)
      setIsLoadingCountries(false)
    })
  }, [locale])

  function getSelectedCountry(code: string) {
    return countries.find((country) => country.code === code)
  }

  const handleCountrySelect = (code: string) => {
    const country = getSelectedCountry(code)
    if (country) {
      form.setValue('code', country.code)
      form.setValue('name', country.name)
      form.setValue('flag', country.flag)
    }
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.label')}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading || isLoadingCountries}
                      type="button"
                    >
                      {isLoadingCountries ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                          {field.value && getSelectedCountry(field.value) ? (
                            <>
                              <Image
                                src={`https://flagcdn.com/${field.value.toLowerCase()}.svg`}
                                alt={getSelectedCountry(field.value)?.name || ''}
                                width={20}
                                height={15}
                                className="rounded object-contain"
                              />
                              <span>{getSelectedCountry(field.value)?.name}</span>
                            </>
                          ) : (
                            <span>{t('form.placeholder')}</span>
                          )}
                        </div>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t('form.search')}
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandEmpty>{t('form.empty')}</CommandEmpty>
                    <CommandList>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {countries.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={country.name}
                            onSelect={() => handleCountrySelect(country.code)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{country.name}</span>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === country.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

        <Button type="submit" disabled={isLoading || isLoadingCountries}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? t('actions.update') : t('actions.create')}
        </Button>
      </form>
    </Form>
  )
}