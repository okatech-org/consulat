import { getServices } from '@/app/(authenticated)/superadmin/_utils/actions/services'
import { getOrganizations } from '@/app/(authenticated)/superadmin/_utils/actions/organizations'
import { ServicesTable } from '@/app/(authenticated)/superadmin/_utils/components/services-table'
import { CreateServiceButton } from '@/app/(authenticated)/superadmin/_utils/components/create-service-button'
import { getTranslations } from 'next-intl/server'
import CardContainer from '@/components/layouts/card-container'

export default async function ServicesPage() {
  const [
    { data: services, error: servicesError },
    { data: organizations, error: organizationsError }
  ] = await Promise.all([
    getServices(),
    getOrganizations()
  ])

  const t = await getTranslations('superadmin.services')

  return (
    <div className="container space-y-6">
      <CardContainer
        title={<h1 className="text-3xl font-bold">{t('title')}</h1>}
        action={<CreateServiceButton organizations={organizations ?? []} />}
      >
        {(servicesError || organizationsError) ? (
          <div className="text-destructive">
            {t('messages.error.fetch')}
          </div>
        ) : (
          <ServicesTable
            services={services ?? []}
            organizations={organizations ?? []}
          />
        )}
      </CardContainer>
    </div>
  )
}