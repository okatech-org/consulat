import { getOrganizations } from '@/app/(authenticated)/superadmin/_utils/actions/organizations'
import { OrganizationsTable } from '@/app/(authenticated)/superadmin/_utils/components/organizations-table'
import { OrganizationDialog } from '@/app/(authenticated)/superadmin/_utils/components/organization-dialog'
import { getCountries } from '@/actions/countries'
import { CreateOrganizationButton } from '@/app/(authenticated)/superadmin/_utils/components/create-organization-button'
import { getTranslations } from 'next-intl/server'

export default async function OrganizationsPage() {
  const { data: organizations } = await getOrganizations()
  const { data: countries } = await getCountries()
  const t = await getTranslations('superadmin.organizations')

  return (
    <div className="container space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <CreateOrganizationButton
          countries={countries ?? []}
        />
      </div>
      <OrganizationsTable countries={countries ?? []} organizations={organizations ?? []} />
      <OrganizationDialog countries={countries ?? []} />
    </div>
  )
}