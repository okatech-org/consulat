import { getOrganizations } from '@/app/(authenticated)/superadmin/_utils/actions/organizations'
import { OrganizationsTable } from '@/app/(authenticated)/superadmin/_utils/components/organizations-table'
import { OrganizationDialog } from '@/app/(authenticated)/superadmin/_utils/components/organization-dialog'
import { getCountries } from '@/actions/countries'
import { CreateOrganizationButton } from '@/app/(authenticated)/superadmin/_utils/components/create-organization-button'
import { getTranslations } from 'next-intl/server'
import CardContainer from '@/components/layouts/card-container'

export default async function OrganizationsPage() {
  const { data: organizations } = await getOrganizations()
  const { data: countries } = await getCountries()
  const t = await getTranslations('superadmin.organizations')

  return (
    <div className="container space-y-6">
      <CardContainer
        title={<span>{t('title')}</span>}
        action={<CreateOrganizationButton countries={countries ?? []} />}
      >
        <OrganizationsTable countries={countries ?? []} organizations={organizations ?? []} />
        <OrganizationDialog countries={countries ?? []} />
      </CardContainer>
    </div>
  )
}