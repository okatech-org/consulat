'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RequestStatus } from '@prisma/client'
import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function ProfilesFilters() {
  const t = useTranslations('common')
  const t_profiles = useTranslations('admin.profiles')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Récupérer les valeurs actuelles des paramètres
  const currentQuery = searchParams.get('q') || ''
  const currentStatus = searchParams.get('status') || 'ALL'

  // État local pour la recherche (pour éviter trop de rerenders)
  const [searchQuery, setSearchQuery] = useState(currentQuery)

  // Fonction pour mettre à jour l'URL avec les paramètres de recherche
  const updateSearchParams = useCallback((params: { q?: string; status?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams)

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    router.push(`${pathname}?${newSearchParams.toString()}`)
  }, [pathname, router, searchParams])

  // Debounce la recherche pour éviter trop de requêtes
  const debouncedSearch = debounce((value: string) => {
    updateSearchParams({ q: value || undefined })
  }, 300)

  // Mettre à jour la recherche
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  // Reset tous les filtres
  const resetFilters = () => {
    setSearchQuery('')
    router.push(pathname)
  }

  const hasFilters = currentQuery || currentStatus !== 'ALL'

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder={t_profiles('filters.search')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            debouncedSearch(e.target.value)
          }}
          className="md:max-w-[300px]"
        />
        <Select
          defaultValue={currentStatus}
          onValueChange={(value) => {
            updateSearchParams({ status: value })
          }}
        >
          <SelectTrigger className="md:max-w-[200px]">
            <SelectValue placeholder={t_profiles('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t_profiles('filters.all')}</SelectItem>
            {Object.values(RequestStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            {t_profiles('filters.reset')}
          </Button>
        )}
      </div>

      {/* Afficher les filtres actifs */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t_profiles('filters.active_filters')}:</span>
          {currentQuery && (
            <span>
              {t_profiles('filters.search')}: &quot;{currentQuery}&quot;
            </span>
          )}
          {currentStatus !== 'ALL' && (
            <span>
              {t_profiles('filters.status')}: {t(`status.${currentStatus.toLowerCase()}`)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}