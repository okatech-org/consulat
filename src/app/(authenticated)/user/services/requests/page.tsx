import { Suspense } from 'react'
import { getUserServiceRequests } from '@/app/(authenticated)/user/services/_utils/actions/get-requests'
import { RequestsList } from '@/app/(authenticated)/user/services/_utils/consular-services/requests/requests-list'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getTranslations } from 'next-intl/server'

export default async function ServiceRequestsPage() {
  const t = await getTranslations('consular.services.requests')
  const requests = await getUserServiceRequests()

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <RequestsList requests={requests} />
      </Suspense>
    </div>
  )
}