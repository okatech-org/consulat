'use client';

import { CurrentRequestCard } from './_components/current-request-card';
import { QuickActions } from './_components/quick-actions';
import { RecentHistory } from './_components/recent-history';
import { UserOverview } from './_components/user-overview';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';

export default function MySpacePage() {
  const t = useTranslations('dashboard.unified');

  return (
    <PageContainer
      title={t('title')}
      description={t('subtitle')}
      action={
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.user.contact}>
              <HelpCircle className="size-icon" />
              {t('help')}
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.user.services}>
              <Plus className="size-icon" />
              {t('new_request')}
            </Link>
          </Button>
        </div>
      }
    >
      {/* Section profil utilisateur v15 */}
      <UserOverview />

      <CurrentRequestCard />

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
        </div>
        <div className="space-y-6">
          <RecentHistory />
        </div>
      </div>
    </PageContainer>
  );
}
