'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'

interface CopyConfigProps {
  countries: { id: string; name: string }[]
  currentCountry: string
  onCopy: (fromCountry: string) => void
}

export function CopyConfig({ countries, currentCountry, onCopy }: CopyConfigProps) {
  const [fromCountry, setFromCountry] = React.useState('')
  const t = useTranslations('manager.settings.organization')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{t('copy_config')}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <Select value={fromCountry} onValueChange={setFromCountry}>
            <SelectTrigger>
              <SelectValue placeholder={t('select_country_to_copy')} />
            </SelectTrigger>
            <SelectContent>
              {countries
                .filter(c => c.id !== currentCountry)
                .map(country => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => onCopy(fromCountry)}
            disabled={!fromCountry}
            className="w-full"
          >
            {t('copy')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}