'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FullProfile } from '@/types';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import { BasicInfoSection } from '../../profile/_utils/components/sections/basic-info-section';
import { DocumentsSection } from '../../profile/_utils/components/sections/documents-section';
import { LinkInfoSection } from './sections/link-info-section';

type ProfileTabsProps = {
  profile: FullProfile;
};

export function ChildProfileTabs({ profile }: ProfileTabsProps) {
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
      content: <BasicInfoSection profile={profile} />,
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
          profileStatus={profile.status}
          className="md:col-span-2"
        />
      ),
    },
  ];

  return (
    <Tabs className={'col-span-full lg:col-span-6'} defaultValue="link-info">
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
