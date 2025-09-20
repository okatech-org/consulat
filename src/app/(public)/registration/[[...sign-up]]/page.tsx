import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { CustomRegistrationForm } from '@/components/auth/custom-registration-form';
import Image from 'next/image';
import { env } from '@/env';
import { getTranslations } from 'next-intl/server';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export default async function RegistrationPage() {
  const currentUser = await getCurrentUser();
  const t = await getTranslations('auth.signup');

  if (currentUser) {
    redirect(ROUTES.user.profile_form);
  }

  return (
    <PageContainer className="w-dvw min-h-dvh overflow-x-hidden container py-8 relative bg-background flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6">
        <header className="w-full border-b border-border pb-2">
          <div className="flex mb-4 h-max w-max items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
            <Image
              src={appLogo}
              width={200}
              height={200}
              alt={t('page.image_alt')}
              className="relative h-20 w-20 rounded-md transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <h1 className="text-xl mb-2 font-bold">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('description', { appName: env.NEXT_PUBLIC_APP_NAME })}
          </p>
        </header>
        <CustomRegistrationForm />
        <BetaBanner className="mt-4" />
      </div>
    </PageContainer>
  );
}
