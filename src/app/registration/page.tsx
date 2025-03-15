import { RegistrationForm } from '@/components/registration/registration-form';
import { getActiveCountries } from '@/actions/countries';
import { checkAuth } from '@/lib/auth/action';
import { tryCatch } from '@/lib/utils';
import { getUserFullProfile } from '@/lib/user/getters';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { NewProfileForm } from '@/components/registration/new-profile-form';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { env } from '@/lib/env';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export default async function RegistrationPage() {
  const t = await getTranslations('auth.login');
  const tInputs = await getTranslations('inputs');

  const countries = await getActiveCountries();
  const { data: currentUser } = await tryCatch(checkAuth());

  const { data: profile } = await tryCatch(
    getUserFullProfile(currentUser?.user.id ?? ''),
  );

  const CreateProfileFormComponent = () => (
    <div className="w-full h-full max-w-lg mx-auto space-y-6">
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
    </div>
  );

  return (
    <div className="w-dvw relative bg-background h-dvh p-4 overflow-hidden flex items-center justify-center md:grid md:grid-cols-12 md:gap-4">
      <div className="min-h-full w-full overflow-y-auto flex flex-col items-center justify-center md:col-span-7">
        <div className="min-w-full h-full max-w-2xl">
          <RouteAuthGuard
            user={currentUser?.user}
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
      <div className="w-full h-full overflow-hidden rounded-lg hidden md:block md:col-span-5">
        <Image
          src={'https://utfs.io/f/yMD4lMLsSKvz349tIYw9oyDVxmdLHiTXuO0SKbeYqQUlPghR'}
          alt={t('page.hero_image_alt')}
          className="h-full w-full object-cover"
          width={800}
          height={800}
        />
      </div>
    </div>
  );
}
