import { Suspense } from 'react'
import { getServiceById } from '@/actions/consular-services/get'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ServiceForm } from '@/components/consular-services/service-form'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'
import { getUserDocumentsList } from '@/actions/documents'
import { getUserFullProfile } from '@/lib/user/getters'
import { getCurrentUser } from '@/actions/user'

interface ServiceStartPageProps {
  params: {
    id: string
  }
}

export default async function ServiceStartPage({ params }: ServiceStartPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const [service, documents, profile] = await Promise.all([
    getServiceById(params.id),
    getUserDocumentsList(),
    getUserFullProfile(user.id)
  ])

  console.log(user)

  if (!service) {
    redirect(ROUTES.services)
  }

  if (!user.consulateId) {
    redirect(ROUTES.services)
  }

  return (
    <div className="container max-w-4xl py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <ServiceForm
          service={service}
          documents={documents}
          consulateId={user.consulateId}
          profile={profile}
          defaultValues={profile ?? {} as Record<string, unknown>}
        />
      </Suspense>
    </div>
  )
}