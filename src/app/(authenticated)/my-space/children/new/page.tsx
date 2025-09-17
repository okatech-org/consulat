import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { ChildRegistrationForm } from '@/components/registration/child-registration-form';
import { PageContainer } from '@/components/layouts/page-container';

export default async function NewChildProfilePage() {
  const user = await getCurrentUser();
  const t = await getTranslations('user.children');
  const t_actions = await getTranslations('common.actions');

  if (!user) return null;

  return (
    <PageContainer
      title={t('create_form.title')}
      description={t('create_form.subtitle')}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="size-icon" />
            <span className={'ml-1 hidden sm:inline'}>{t_actions('back')}</span>
          </Link>
        </Button>
      }
    >
      <ChildRegistrationForm />
    </PageContainer>
  );
}
