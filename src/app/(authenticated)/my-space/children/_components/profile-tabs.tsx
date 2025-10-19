'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CompleteChildProfile } from '@/convex/lib/types';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import { LinkInfoSection } from './sections/link-info-section';
import { useState } from 'react';
import { useTabs } from '@/hooks/use-tabs';
import { ChildBasicInfoForm } from '@/components/registration/child-basic-info-form';
import { ChildDocumentsForm } from '@/components/registration/child-documents-form';

type ProfileTabsProps = {
  profile: CompleteChildProfile;
  noTabs?: boolean;
};

export function ChildProfileTabs({ profile, noTabs }: ProfileTabsProps) {
  const t = useTranslations('profile');

  const profileTabs = [
    {
      id: 'link-info',
      title: t('sections.link_info'),
      content: <LinkInfoSection profile={profile} />,
    },
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: (
        <ChildBasicInfoForm profile={profile} onSave={() => {}} onPrevious={() => {}} />
      ),
    },
    {
      id: 'documents',
      title: t('sections.documents'),
      content: (
        <ChildDocumentsForm profile={profile} onSave={() => {}} onPrevious={() => {}} />
      ),
    },
  ];

  type Tab = (typeof profileTabs)[number]['id'];

  const { currentTab, handleTabChange } = useTabs<Tab>('tab', 'link-info');
  const [localTabs, setLocalTabs] = useState<Tab>('link-info');

  return (
    <Tabs
      className={'col-span-full lg:col-span-6'}
      value={noTabs ? localTabs : currentTab}
      onValueChange={noTabs ? setLocalTabs : handleTabChange}
    >
      <TabsList className="mb-2 w-max">
        <div className="carousel-zone flex  gap-2">
          {profileTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.title}
            </TabsTrigger>
          ))}
        </div>
      </TabsList>
      {profileTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <CardContainer className="col-span-full lg:col-span-6">
            {tab.content}
          </CardContainer>
        </TabsContent>
      ))}
    </Tabs>
  );
}
