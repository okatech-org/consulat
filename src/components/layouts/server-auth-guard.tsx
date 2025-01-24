'use client';

import { checkUserExist } from '@/actions/user';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLayoutEffect } from 'react';
import { logUserOut } from '@/actions/auth';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export function ServerAuthGuard({ children }: BaseLayoutProps) {
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!user) {
      router.push(`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    if (user) {
      checkUserExist(user.id).then((exist) => {
        if (!exist) {
          logUserOut().then(() => {
            router.push(`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname)}`);
          });
        }
      });
    }
  }, [pathname, router, user]);

  return <>{children}</>;
}
