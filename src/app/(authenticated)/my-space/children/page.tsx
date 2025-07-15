import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layouts/page-container';
import { ChildrenList } from './_components/children-list';
import { NoChildrenMessage } from './_components/no-children-message';
import CardContainer from '@/components/layouts/card-container';
import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/server';

// Cache optimisé pour la liste des enfants
export const revalidate = 300; // 5 minutes

export default async function ChildrenPage() {
  const t = await getTranslations('user.children');

  const childrenData = await api.profile.getChildrenForDashboard();

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
        {childrenData.parentalAuthorities.length > 0 ? (
          <ChildrenList parentalAuthorities={childrenData.parentalAuthorities} />
        ) : (
          <NoChildrenMessage />
        )}
      </CardContainer>
    </PageContainer>
  );
}
