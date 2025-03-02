import React, { Suspense } from 'react';
import { getCurrentUser } from '@/actions/user';
import { getTranslations } from 'next-intl/server';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layouts/page-container';
import { ChildrenList } from './_components/children-list';
import { NoChildrenMessage } from './_components/no-children-message';
import CardContainer from '@/components/layouts/card-container';
import { ROUTES } from '@/schemas/routes';
import { getUserWithChildren } from '@/actions/child-profiles';
import { tryCatch } from '@/lib/utils';
export default async function ChildrenPage() {
  const t = await getTranslations('user.children');
  const user = await getCurrentUser();

  if (!user) return null;

  const userWithChildren = await tryCatch(getUserWithChildren(user.id));

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageContainer
        title={t('title')}
        description={t('subtitle')}
        action={
          <Button asChild size="sm">
            <Link href={ROUTES.user.new_child}>
              <Plus className="size-icon" />
              {t('add_child')}
            </Link>
          </Button>
        }
      >
        <CardContainer>
          {userWithChildren.data && userWithChildren.data.childAuthorities?.length > 0 ? (
            <ChildrenList parentalAuthorities={userWithChildren.data.childAuthorities} />
          ) : (
            <NoChildrenMessage />
          )}
        </CardContainer>
      </PageContainer>
    </Suspense>
  );
}
