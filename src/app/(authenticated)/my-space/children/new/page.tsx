import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/actions/user';
import CardContainer from '@/components/layouts/card-container';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';

export default async function NewChildProfilePage() {
  const user = await getCurrentUser();
  const t = await getTranslations('user.children');

  if (!user) return null;

  return (
    <CardContainer
      title={t('create_form.title')}
      subtitle={t('create_form.subtitle')}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      }
    >
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Formulaire de création de profil enfant à implémenter
        </p>
      </div>
    </CardContainer>
  );
}
