import { getCountryById } from '@/actions/countries'
import CardContainer from '@/components/layouts/card-container'
import { Suspense } from 'react'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { getTranslations } from 'next-intl/server'
import { CountryForm } from '@/app/(authenticated)/superadmin/_utils/components/country-form'
import NotFound from 'next/dist/client/components/not-found-error'


export default async function CountryDetails({ params }: { params: { id: string } }) {
  const t = await getTranslations('superadmin.countries')

  // use async function to retrieve country data so that we do not need to fetch on client side
  const { data: country } = await getCountryById(params.id)

  if (!country) {
    return <NotFound />
  }

  return (
    <div className="container space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>

        <CardContainer title={<span>{t('form.edit_title')} - {country.name}</span>}>
          {/* Afficher un message d'erreur si la récupération des données échoue */}

          <CountryForm initialData={country} />
        </CardContainer>

      </Suspense>
    </div>
  )
}