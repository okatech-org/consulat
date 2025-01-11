import { Suspense } from 'react'
import { getServiceById } from '@/app/(authenticated)/user/services/_utils/actions/get'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ServiceForm } from '@/app/(authenticated)/user/services/_utils/consular-services/service-form'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/schemas/routes'
import { getUserDocumentsList } from '@/actions/documents'
import { getUserFullProfile } from '@/lib/user/getters'
import { getCurrentUser } from '@/actions/user'
import { ConsularService, DocumentType } from '@prisma/client'
import { ServiceStep } from '@/types/consular-service'

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

  if (!service) {
    redirect(ROUTES.services)
  }

  if (!user.consulateId) {
    redirect(ROUTES.services)
  }

  console.log({ service }, service.steps)

  return (
    <div className="container max-w-4xl py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <ServiceForm
          service={service as unknown as ConsularService & {
            steps: ServiceStep[]
            requiredDocuments: DocumentType[]
            requiresAppointment: boolean
          }}
          documents={documents}
          consulateId={user.consulateId}
          profile={profile}
          defaultValues={profile ?? {} as Record<string, unknown>}
        />
      </Suspense>
    </div>
  )
}