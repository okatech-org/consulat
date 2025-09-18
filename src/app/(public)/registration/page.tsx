import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import CardContainer from '@/components/layouts/card-container';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { getActiveCountries } from '@/actions/countries';
import type { Country } from '@/types/country';
import { env } from '@/env';
import Image from 'next/image';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export default async function RegistrationPage() {
  const currentUser = await getCurrentUser();
  const countries = await getActiveCountries();

  if (currentUser) {
    redirect(ROUTES.user.profile_form);
  }

  return (
    <PageContainer className="w-dvw min-h-dvh overflow-x-hidden container py-8 relative bg-background flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        <CardContainer className="w-full max-w-lg">
          <div className="space-y-6 p-4">
            <header className="w-full text-center">
              <div className="flex mb-4 h-max w-max mx-auto items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
                <Image
                  src={appLogo}
                  width={200}
                  height={200}
                  alt="Logo de l'application"
                  className="relative h-20 w-20 rounded-md transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h1 className="text-xl mb-2 font-bold">Créer mon espace consulaire</h1>
              <p className="text-muted-foreground">
                Rejoignez {env.NEXT_PUBLIC_APP_NAME} et accédez à vos services consulaires
              </p>
            </header>
            <SignUpForm countries={countries as Country[]} />
          </div>
        </CardContainer>
        <BetaBanner className="mt-4" />
      </div>
    </PageContainer>
  );
}
