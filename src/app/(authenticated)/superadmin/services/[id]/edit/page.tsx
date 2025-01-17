import { getService } from '@/app/(authenticated)/superadmin/_utils/actions/services'
import { ServiceEditForm } from '@/app/(authenticated)/superadmin/_utils/components/service-edit-form'
import { getTranslations } from 'next-intl/server'
import CardContainer from '@/components/layouts/card-container'
import { getOrganizations } from '@/app/(authenticated)/superadmin/_utils/actions/organizations'

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const [
    { data: service, error: serviceError },
    { data: organizations, error: organizationsError }
  ] = await Promise.all([
    getService(params.id),
    getOrganizations()
  ])
  const t = await getTranslations('superadmin.services')

  if (serviceError || organizationsError) {
    return <div>Error: {serviceError || organizationsError}</div>
  }

  return (
    <div className="container h-full space-y-6">
      <CardContainer
        title={<h2 className="text-3xl font-bold tracking-tight">
          {t('edit_title')} - {service.name}
        </h2>}
      >
        <ServiceEditForm service={service} organizations={organizations ?? []} />
      </CardContainer>
    </div>
  )
}