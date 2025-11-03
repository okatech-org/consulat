'use client';

import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { RegistrationSync } from '@/components/auth/registration-sync';
import Image from 'next/image';
import { env } from '@/env';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useTranslations } from 'next-intl';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export default function RegistrationPage() {
  const { user } = useCurrentUser();
  const t = useTranslations('auth.signup');

  if (user?.profileId) {
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
              alt="Consulat.ga"
              className="relative h-20 w-20 rounded-md transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <h1 className="text-xl mb-2 font-bold">{t('sync.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('sync.description')}</p>
        </header>
        <RegistrationSync />
        <BetaBanner className="mt-4" />
      </div>
    </PageContainer>
  );
}
