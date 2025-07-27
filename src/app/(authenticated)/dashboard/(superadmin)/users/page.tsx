import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { UsersList } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/users-list';
import { getTranslations } from 'next-intl/server';

export default async function UsersPage() {
  const t = await getTranslations('sa.users');

  return (
    <PageContainer title={t('title')}>
      <CardContainer>
        <UsersList />
      </CardContainer>
    </PageContainer>
  );
}
