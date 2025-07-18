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
import { useUserData } from '@/hooks/use-role-data';

export default async function ChildrenPage() {
  const t = useTranslations('user.children');

  const { children } = useUserData();

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
        {children && children.length > 0 ? (
          <ChildrenList authorities={children} />
        ) : (
          <NoChildrenMessage />
        )}
      </CardContainer>
    </PageContainer>
  );
}
