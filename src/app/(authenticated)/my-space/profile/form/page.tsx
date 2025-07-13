import { PageContainer } from '@/components/layouts/page-container';
import { RegistrationForm } from '@/components/registration/registration-form';
import { api } from '@/trpc/server';
import CardContainer from '@/components/layouts/card-container';
import { getTranslations } from 'next-intl/server';

export default async function ProfileFormPage() {
  const tInputs = await getTranslations('inputs');
  const profile = await api.profile.getCurrent();
  const availableCountries = await api.countries.getActive();

  return (
    <PageContainer title={tInputs('newProfile.title')}>
      {!profile && <CardContainer title="Profile non trouvé"></CardContainer>}

      {profile && (
        <RegistrationForm
          availableCountries={availableCountries ?? []}
          profile={profile}
        />
      )}
    </PageContainer>
  );
}
