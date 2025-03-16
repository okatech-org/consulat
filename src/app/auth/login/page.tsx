import { getCurrentUser } from '@/actions/user';
import { LoginForm } from '../_utils/login-form';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/permissions/utils';
import { ROUTES } from '@/schemas/routes';
import { env } from '@/lib/env/index';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

const appLogo = env.NEXT_PUBLIC_ORG_LOGO;

export default async function LoginPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('auth.login');

  if (user) {
    const isAdmin = hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER']);
    if (isAdmin) {
      redirect(ROUTES.dashboard.base);
    }

    if (hasAnyRole(user, ['USER'])) {
      redirect(ROUTES.user.base);
    }
  }

  return (
    <div className="w-dvw bg-background h-dvh p-4 overflow-hidden flex items-center justify-center md:grid md:grid-cols-2">
      <div className="w-full p-4 flex flex-col items-center justify-center">
        <div className="max-w-lg space-y-8">
          <header className="w-full border-b border-border pb-8">
            <div className="flex mb-4 h-max w-max items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
              <Image
                src={appLogo}
                width={200}
                height={200}
                alt={t('page.image_alt')}
                className="relative h-20 w-20 rounded-md transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h1 className="text-3xl mb-2 font-bold">{t('page.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('page.welcome_message', { appName: env.NEXT_PUBLIC_APP_NAME })}
            </p>
          </header>
          <div className="w-full">
            <LoginForm />
          </div>
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
    </div>
  );
}
