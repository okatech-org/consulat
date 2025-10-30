'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { buttonVariants } from '@/components/ui/button';
import { ArrowUpRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function CtaContact() {
  const t = useTranslations('home');
  const { user } = useCurrentUser();

  return (
    <>
      {!user && (
        <Card className={'col-span-12 border-none  shadow-none lg:col-span-12'}>
          <CardHeader>
            <CardTitle className={'text-lg font-normal md:text-xl'}>
              {t('cta.title')}
            </CardTitle>
            <CardDescription>{t('cta.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={ROUTES.user.profile}
              className={
                buttonVariants({ variant: 'secondary' }) +
                ' !text-primary-foreground hover:!text-secondary-foreground'
              }
            >
              {t('cta.create_card')}
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}
