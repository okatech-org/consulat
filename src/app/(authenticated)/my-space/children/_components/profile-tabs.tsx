'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FullProfile } from '@/types';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import { DocumentsSection } from '../../profile/_utils/components/sections/documents-section';
import { LinkInfoSection } from './sections/link-info-section';
import { useRouter } from 'next/navigation';
import { BasicInfoSection } from '../../profile/_utils/components/sections/basic-info-section';
import { useState } from 'react';
import { useTabs } from '@/hooks/use-tabs';

type ProfileTabsProps = {
  profile: FullProfile;
  requestId?: string;
  noTabs?: boolean;
};

export function ChildProfileTabs({ profile, requestId, noTabs }: ProfileTabsProps) {
  const t = useTranslations('profile');
  const router = useRouter();

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
        <BasicInfoSection
          profile={profile}
          onSave={() => {
            router.refresh();
          }}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'documents',
      title: t('sections.documents'),
      content: (
        <DocumentsSection
          documents={{
            identityPhoto: profile.identityPicture,
            birthCertificate: profile.birthCertificate,
            passport: profile.passport,
            residencePermit: profile.residencePermit,
            addressProof: profile.addressProof,
          }}
          profileId={profile.id}
          onSave={() => {
            router.refresh();
          }}
          requestId={requestId}
        />
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
