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
import { CountryCode, phoneCountries } from '@/lib/autocomplete-datas'

export interface PhoneValue {
  number: string
  countryCode: CountryCode
}

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: PhoneValue
  onChange?: (value: PhoneValue) => void
  error?: boolean
}

export function PhoneInput({
                             className,
                             value = { number: '', countryCode: '+33' },
                             onChange,
                             error,
                             ...props
                           }: PhoneInputProps) {
  const t = useTranslations('common')
  const t_countries = useTranslations('countries')
  const [phoneValue, setPhoneValue] = React.useState<PhoneValue>(value)
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, '')
    const newValue = {
      number: newNumber,
      countryCode: value?.countryCode || '+33'
    }
    setPhoneValue(newValue)
    onChange?.(newValue)
  }

  const handleCountrySelect = (code: CountryCode) => {
    const newValue = {
      number: phoneValue.number,
      countryCode: code
    }
    setOpen(false)
    setPhoneValue(newValue)
    onChange?.(newValue)
  }

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
            className={cn(
              "w-[120px] justify-between",
              error && "border-destructive"
            )}
          >
            {phoneValue?.countryCode || '+33'} {phoneCountries.find(c => c.value === (value?.countryCode || '+33'))?.flag}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
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
                        value?.number === country.value ? "opacity-100" : "opacity-0"
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
        className={cn(
          className,
          error && "border-destructive"
        )}
        value={phoneValue.number}
        onChange={handlePhoneChange}
        {...props}
      />
    </div>
  )
}