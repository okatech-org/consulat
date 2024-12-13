'use client'
import { useTranslations } from 'next-intl'
import { ConsularService, ConsularServiceType } from '@prisma/client'
import { ServiceCard } from './service-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface ServicesListProps {
  services: ConsularService[]
  disabledServices?: string[]
}

export function ServicesList({
                               services,
                               disabledServices = []
                             }: ServicesListProps) {
  const t = useTranslations('consular.services')
  const searchParams = useSearchParams()

  // Récupérer les paramètres de recherche et de filtre
  const query = searchParams.get('q')?.toLowerCase() || ''
  const type = searchParams.get('type') as ConsularServiceType | 'ALL' || 'ALL'

  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchesQuery = !query ||
      service.title.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)

    const matchesType = type === 'ALL' || service.type === type

    return matchesQuery && matchesType
  })

  if (filteredServices.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={query ? t('search.no_results') : t('empty.title')}
        description={query ? t('search.try_again') : t('empty.description')}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredServices.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          disabled={disabledServices.includes(service.id)}
        />
      ))}
    </div>
  )
}