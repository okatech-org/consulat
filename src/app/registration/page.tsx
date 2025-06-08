import { RegistrationForm } from '@/components/registration/registration-form';
import { getActiveCountries } from '@/actions/countries';
import { getUserFullProfileById } from '@/lib/user/getters';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { NewProfileForm } from '@/components/registration/new-profile-form';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { env } from '@/lib/env/index';
import { getCurrentUser } from '@/actions/user';
import { SessionUser } from '@/types/user';
import { BetaBanner } from '@/components/ui/beta-banner';

const appLogo = env.NEXT_ORG_LOGO;

export default async function RegistrationPage() {
  const currentUser = await getCurrentUser();
  const t = await getTranslations('auth.login');
  const tInputs = await getTranslations('inputs');

  const countries = await getActiveCountries();

  const profile = await getUserFullProfileById(currentUser?.profileId ?? '');

  const CreateProfileFormComponent = () => (
    <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
      <header className="w-full border-b border-border pb-6">
        <div className="flex mb-4 h-max w-max items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
          <Image
            src={appLogo}
            width={200}
            height={200}
            alt={t('page.image_alt')}
            className="relative h-16 w-16 rounded-md transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h1 className="text-2xl mb-2 font-bold">{tInputs('newProfile.title')}</h1>
        <p className="text-md text-muted-foreground">
          {tInputs('newProfile.description')}
        </p>
      </header>
      <div className="w-full flex flex-col">
        <NewProfileForm availableCountries={countries} />
      </div>
      <BetaBanner className="mt-4" />
    </div>
  );

  return (
    <div className="w-dvw min-h-dvh overflow-x-hidden relative bg-background flex items-center justify-center">
      <div className="container w-full overflow-x-hidden py-6">
        <RouteAuthGuard
          user={currentUser as SessionUser}
          fallbackComponent={<CreateProfileFormComponent />}
        >
          {profile ? (
            <RegistrationForm availableCountries={countries} profile={profile} />
          ) : (
            <CreateProfileFormComponent />
          )}
        </RouteAuthGuard>
      </div>
    </div>
  );
}
