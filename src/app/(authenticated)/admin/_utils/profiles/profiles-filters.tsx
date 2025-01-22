'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RequestStatus } from '@prisma/client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { debounce } from 'lodash'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Route } from 'next'

export function ProfilesFilters() {
  const t_common = useTranslations('common')
  const t = useTranslations('actions.profiles')
  const profileStatus: RequestStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT']
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Récupérer les valeurs actuelles des paramètres
  const currentQuery = searchParams.get('q') || ''
  const currentStatus = searchParams.get('status') || ''

  // État local pour le champ de recherche
  const [searchQuery, setSearchQuery] = useState(currentQuery)

  // Fonction pour mettre à jour l'URL avec les paramètres de recherche
  const updateSearchParams = useCallback((params: { q?: string; status?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    // Mettre à jour ou supprimer les paramètres
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    // Construire la nouvelle URL
    const newUrl = `${pathname}?${newSearchParams.toString()}` as Route
    router.push(newUrl)
  }, [pathname, router, searchParams])

  // Debounce la recherche pour éviter trop de mises à jour
  const debouncedSearch = debounce((value: string) => {
    updateSearchParams({ q: value || undefined })
  }, 300)

  // Mettre à jour la recherche quand l'input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  // Gérer le changement de statut
  const handleStatusChange = (value: string) => {
    updateSearchParams({
      status: value === 'ALL' ? undefined : value,
      q: searchQuery || undefined
    })
  }

  // Réinitialiser les filtres
  const handleReset = () => {
    setSearchQuery('')
    updateSearchParams({})
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchQuery || currentStatus

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder={t('filters.search')}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:max-w-[300px]"
        />
        <Select
          value={currentStatus || 'ALL'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('filters.all')}</SelectItem>
            {profileStatus.map((status) => (
              <SelectItem key={status} value={status}>
                {t_common(`status.${status.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <X className="size-4" />
            {t('filters.reset')}
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('filters.active_filters')}:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="rounded-full bg-muted px-2 py-1">
                {searchQuery}
              </span>
            )}
            {currentStatus && (
              <span className="rounded-full bg-muted px-2 py-1">
                {t_common(`status.${currentStatus.toLowerCase()}`)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}