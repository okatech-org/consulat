'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layouts/page-container';
import { ChildrenList } from './_components/children-list';
import { NoChildrenMessage } from './_components/no-children-message';
import CardContainer from '@/components/layouts/card-container';
import { ROUTES } from '@/schemas/routes';
import { useChildrenDashboard } from '@/hooks/use-child-profiles';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Cache optimisé pour la liste des enfants
export const dynamic = 'force-dynamic'; // Nécessaire pour les hooks côté client

export default function ChildrenPageClient() {
  const t = useTranslations('user.children');

  const { children, totalChildren, isLoading, isError } = useChildrenDashboard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-destructive mb-4">
          Erreur lors du chargement des profils enfants
        </p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <PageContainer
      title={t('title')}
      description={t('subtitle')}
      action={
        <Button asChild size="sm">
          <Link href={ROUTES.user.new_child}>
            <Plus className="size-icon" />
            <span className={'ml-1 hidden sm:inline'}>{t('add_child')}</span>
          </Link>
        </Button>
      }
    >
      <CardContainer>
        {totalChildren > 0 ? (
          <ChildrenList parentalAuthorities={children} />
        ) : (
          <NoChildrenMessage />
        )}
      </CardContainer>
    </PageContainer>
  );
}
