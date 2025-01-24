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
import * as React from 'react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/actions/user';

export default async function CtaContact() {
  const t = await getTranslations('home');
  const user = await getCurrentUser();

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
              href={ROUTES.profile}
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
