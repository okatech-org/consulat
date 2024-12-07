'use client'

import { useTranslations } from 'next-intl'
import { ServiceRequest } from '@prisma/client'
import { RequestCard } from './request-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

interface RequestsListProps {
  requests: Array<ServiceRequest & {
    service: { type: string; title: string }
    appointment?: { date: Date } | null
  }>
}

export function RequestsList({ requests }: RequestsListProps) {
  const t = useTranslations('consular.services.requests')

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t('empty.title')}
        description={t('empty.description')}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}