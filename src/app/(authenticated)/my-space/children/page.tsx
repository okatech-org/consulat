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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ChildrenPage() {
  const t = useTranslations('user.children');
  const { user } = useCurrentUser();
  const childProfiles = useQuery(
    api.functions.childProfile.getChildProfilesByAuthor,
    user?._id ? { authorUserId: user._id } : 'skip',
  );

  if (childProfiles === undefined) {
    return (
      <PageContainer title={t('title')} description={t('subtitle')}>
        <LoadingSkeleton variant="card" className="!w-full h-48" />
      </PageContainer>
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
        {childProfiles && childProfiles.length > 0 ? (
          <ChildrenList authorities={childProfiles} />
        ) : (
          <NoChildrenMessage />
        )}
      </CardContainer>
    </PageContainer>
  );
}
