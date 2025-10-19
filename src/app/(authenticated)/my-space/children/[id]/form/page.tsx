'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { ChildRegistrationForm } from '@/components/registration/child-registration-form';
import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Spinner } from '@/components/ui/spinner';
import { useParams } from 'next/navigation';
import type { Id } from '@/convex/_generated/dataModel';

export default function ChildProfileFormPage() {
  const params = useParams<{ id: string }>();
  const childId = params.id as Id<'childProfiles'>;
  const t = useTranslations('user.children');
  const t_actions = useTranslations('common.actions');

  const childProfile = useQuery(
    api.functions.childProfile.getCurrentChildProfile,
    childId ? { childProfileId: childId } : 'skip',
  );

  if (childProfile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (childProfile === null) {
    return (
      <PageContainer
        title="Profil introuvable"
        description="Le profil enfant que vous recherchez n'existe pas"
      >
        <div className="flex flex-col items-center gap-4 p-8">
          <p className="text-muted-foreground">
            Ce profil n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href={ROUTES.user.children}>Retour à la liste</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={t('edit_form.title')}
      description={`${childProfile.personal.firstName} ${childProfile.personal.lastName}`}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.user.children}>
            <ArrowLeft className="size-icon" />
            <span className={'ml-1 hidden sm:inline'}>{t_actions('back')}</span>
          </Link>
        </Button>
      }
    >
      <ChildRegistrationForm childProfileId={childId} />
    </PageContainer>
  );
}
