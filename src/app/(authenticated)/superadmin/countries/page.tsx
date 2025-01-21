import { getCountries } from '@/actions/countries'
import { getTranslations } from 'next-intl/server'
import { CountriesList } from '@/app/(authenticated)/superadmin/_utils/components/countries-list'
import { CreateCountryButton } from '@/app/(authenticated)/superadmin/_utils/components/create-country-button'
import CardContainer from '@/components/layouts/card-container'

export default async function CountriesPage() {
  const t = await getTranslations('superadmin.countries')
  const { data: countries, error } = await getCountries()

  return (
    <div className="container space-y-6">
      <CardContainer
        title={<span className="text-3xl font-bold">{t('title')}</span>}
        action={<CreateCountryButton />}
      >
        {error ? (
          <div className="text-destructive">{t('messages.error.fetch')}</div>
        ) : (
          <CountriesList countries={countries ?? []} />
        )}
      </CardContainer>
    </div>
  )
}