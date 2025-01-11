import { Suspense } from 'react'
import { getServiceById } from '@/app/(authenticated)/services/_utils/actions/get'
import { getCurrentUser } from '@/actions/user'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ServiceDetails } from '@/app/(authenticated)/services/_utils/consular-services/service-details'
import { getUserDocumentsList } from '@/actions/documents'

interface ServiceDetailsPageProps {
  params: {
    id: string
  }
}

export default async function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const [service, documents] = await Promise.all([
    getServiceById(params.id),
    getUserDocumentsList()
  ])

  if (!service) {
    return null
  }

  return (
    <div className="container py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <ServiceDetails
          service={service}
          documents={documents}
        />
      </Suspense>
    </div>
  )
}