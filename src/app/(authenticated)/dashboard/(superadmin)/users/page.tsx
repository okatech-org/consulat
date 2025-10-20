'use client';

import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { UsersList } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/users-list';
import { useTranslations } from 'next-intl';

export default function UsersPage() {
  const t = useTranslations('sa.users');

  return (
    <PageContainer title={t('title')}>
      <CardContainer>
        <UsersList />
      </CardContainer>
    </PageContainer>
  );
}
