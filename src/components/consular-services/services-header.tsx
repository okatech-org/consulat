'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConsularServiceType } from '@prisma/client'
import { useCallback } from 'react'
import { debounce } from 'lodash'

export function ServicesHeader() {
  const t = useTranslations('consular.services')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Récupérer les valeurs actuelles des paramètres
  const currentQuery = searchParams.get('q') || ''
  const currentType = searchParams.get('type') || 'ALL'

  // Fonction pour mettre à jour l'URL avec les paramètres de recherche
  const updateSearchParams = useCallback((params: { q?: string; type?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams)

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    router.push(`?${newSearchParams.toString()}`)
  }, [router, searchParams])

  // Debounce la recherche pour éviter trop de mises à jour
  const debouncedSearch = debounce((value: string) => {
    updateSearchParams({ q: value || undefined })
  }, 300)

  return (
    <div className="mb-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder={t('search.placeholder')}
          defaultValue={currentQuery}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="sm:max-w-[300px]"
        />

        <Select
          defaultValue={currentType}
          onValueChange={(value) => {
            updateSearchParams({ type: value === 'ALL' ? undefined : value })
          }}
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