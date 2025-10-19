'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layouts/page-container';
import { ChildrenList } from './_components/children-list';
import { NoChildrenMessage } from './_components/no-children-message';
import CardContainer from '@/components/layouts/card-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { QuickChildProfileModal } from '@/components/registration/quick-child-profile-modal';
import { useState } from 'react';

export default function ChildrenPage() {
  const t = useTranslations('user.children');
  const { user } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const childProfiles = useQuery(
    api.functions.childProfile.getChildProfilesByAuthor,
    user?._id ? { authorUserId: user._id } : 'skip',
  );

  const currentProfile = useQuery(api.functions.profile.getCurrentProfile);

  if (childProfiles === undefined) {
    return (
      <PageContainer title={t('title')} description={t('subtitle')}>
        <LoadingSkeleton variant="card" className="!w-full h-48" />
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer
        title={t('title')}
        description={t('subtitle')}
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="size-icon" />
            <span className={'ml-1 hidden sm:inline'}>{t('add_child')}</span>
          </Button>
        }
      >
        <CardContainer>
          {childProfiles && childProfiles.length > 0 ? (
            <ChildrenList profiles={childProfiles} />
          ) : (
            <NoChildrenMessage onAddChild={() => setIsModalOpen(true)} />
          )}
        </CardContainer>
      </PageContainer>

      {currentProfile?.residenceCountry && (
        <QuickChildProfileModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          residenceCountry={currentProfile.residenceCountry}
        />
      )}
    </>
  );
}
