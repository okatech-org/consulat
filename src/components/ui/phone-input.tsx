'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { phoneCountries } from '@/assets/autocomplete-datas'

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange?: (value: string) => void
}

export function PhoneInput({ className, value, onChange, ...props }: PhoneInputProps) {
  const t = useTranslations('common')
  const t_countries = useTranslations('countries')
  const [open, setOpen] = React.useState(false)
  const [countryCode, setCountryCode] = React.useState('+33')
  const [searchValue, setSearchValue] = React.useState('')

  // Extraire le numéro sans l'indicatif
  const phoneNumber = value?.replace(countryCode, '') || ''

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, '')
    onChange?.(countryCode + newNumber)
  }

  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setOpen(false)
    onChange?.(code + phoneNumber)
  }

  // Filter countries based on search value
  const filteredCountries = phoneCountries.filter((country) => {
    const searchTermLower = searchValue.toLowerCase()
    return (
      country.value.includes(searchTermLower) ||
      t_countries(country.label).toLowerCase().includes(searchTermLower) ||
      country.label.toLowerCase().includes(searchTermLower)
    )
  })

  return (
    <div className="flex w-full gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {countryCode} {phoneCountries.find(c => c.value === countryCode)?.flag}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput
              placeholder={t('search_country')}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{t('no_country_found')}</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country, index) => (
                  <CommandItem
                    key={country.value + index}
                    value={`${country.value} ${t_countries(country.label)}`}
                    onSelect={() => handleCountrySelect(country.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        countryCode === country.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {country.flag} {t_countries(country.label)} ({country.value})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        className={className}
        value={phoneNumber}
        onChange={handlePhoneChange}
        {...props}
      />
    </div>
  )
}