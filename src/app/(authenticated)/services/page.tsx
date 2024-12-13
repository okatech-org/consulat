import { Suspense } from 'react'
import { getAvailableServices } from '@/actions/consular-services/get'
import { getCurrentUser } from '@/actions/user'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ServicesList } from '@/components/consular-services/services-list'
import { ServicesHeader } from '@/components/consular-services/services-header'

export default async function ServicesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const services = await getAvailableServices()

  return (
    <div className="container py-6">
      <ServicesHeader />

      <Suspense fallback={<LoadingSkeleton />}>
        <ServicesList
          services={services}
          disabledServices={[]}
        />
      </Suspense>
    </div>
  )
}