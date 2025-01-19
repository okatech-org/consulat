'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConsularServiceType } from '@prisma/client'

export function ServicesHeader() {
  const t = useTranslations('consular.services')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ConsularServiceType | 'ALL'>('ALL')

  return (
    <div className="mb-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-[300px]"
        />

        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as ConsularServiceType | 'ALL')}
        >
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder={t('filter.type.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filter.type.all')}</SelectItem>
            {Object.values(ConsularServiceType).map((type) => (
              <SelectItem key={type} value={type}>
                {t(`types.${type.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}