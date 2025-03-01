import React, { Suspense } from 'react';
import { getCurrentUser } from '@/actions/user';
import { getTranslations } from 'next-intl/server';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { getParentalAuthoritiesByParentUser } from '@/actions/parental-authority';
import { ChildrenList } from './_components/children-list';
import { NoChildrenMessage } from './_components/no-children-message';

export default async function ChildrenPage() {
  const user = await getCurrentUser();
  const t = await getTranslations('user.children');

  if (!user) return null;

  const parentalAuthorities = await getParentalAuthoritiesByParentUser(user.id);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CardContainer
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Button asChild size="sm">
            <Link href="/my-space/children/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('add_child')}
            </Link>
          </Button>
        }
      >
        {parentalAuthorities.length > 0 ? (
          <ChildrenList parentalAuthorities={parentalAuthorities} />
        ) : (
          <NoChildrenMessage />
        )}
      </CardContainer>
    </Suspense>
  );
}
