import { env } from '@/env';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { BetaBanner } from '@/components/ui/beta-banner';
import { PageContainer } from '@/components/layouts/page-container';
import { SignIn } from '@clerk/nextjs';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export default async function LoginPage() {
  const t = await getTranslations('auth.login');

  return (
    <PageContainer className="w-dvw bg-background h-dvh pt-8 p-6 md:pt-6 min-h-max overflow-x-hidden md:overflow-hidden flex items-center justify-center md:grid md:grid-cols-2">
      <div className="w-full h-full min-h-max flex flex-col items-center justify-center">
        <div className="flex max-w-lg w-full  overflow-hidden flex-col items-center justify-center p-2 space-y-4">
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
            <h1 className="text-xl mb-2 font-bold">{t('page.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('page.welcome_message', { appName: env.NEXT_PUBLIC_APP_NAME })}
            </p>
          </header>
          <div className="w-full flex justify-center items-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none w-full !p-6',
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
            />
          </div>
          <BetaBanner />
        </div>
      </div>
      <div className="w-full h-full overflow-hidden rounded-lg hidden md:block">
        <Image
          src={'https://utfs.io/f/yMD4lMLsSKvz349tIYw9oyDVxmdLHiTXuO0SKbeYqQUlPghR'}
          alt={t('page.hero_image_alt')}
          className="h-full w-full object-cover"
          width={800}
          height={800}
        />
      </div>
    </PageContainer>
  );
}
