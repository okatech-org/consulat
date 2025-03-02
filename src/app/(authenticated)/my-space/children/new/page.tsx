import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/actions/user';
import CardContainer from '@/components/layouts/card-container';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { ChildRegistrationForm } from '@/components/registration/child-registration-form';

export default async function NewChildProfilePage() {
  const user = await getCurrentUser();
  const t = await getTranslations('user.children');
  const t_actions = await getTranslations('common.actions');

  if (!user) return null;

  return (
    <CardContainer
      title={t('create_form.title')}
      subtitle={t('create_form.subtitle')}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t_actions('back')}
          </Link>
        </Button>
      }
    >
      <ChildRegistrationForm />
    </CardContainer>
  );
}
