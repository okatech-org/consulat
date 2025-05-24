'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FullProfile } from '@/types';
import { BasicInfoSection } from './sections/basic-info-section';
import { ContactInfoSection } from './sections/contact-info-section';
import { DocumentsSection } from './sections/documents-section';
import { FamilyInfoSection } from './sections/family-info-section';
import { ProfessionalInfoSection } from './sections/professional-info-section';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import { useTabs } from '@/hooks/use-tabs';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { ServiceRequest } from '@prisma/client';
import { RequestsSection } from './sections/requests-section';

type ProfileTabsProps = {
  profile: FullProfile;
  requestId?: string;
  requests?: ServiceRequest[];
};

export function ProfileTabs({ profile, requestId, requests }: ProfileTabsProps) {
  const t = useTranslations('profile');
  const router = useRouter();

  const profileTabs = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: (
        <BasicInfoSection
          profile={profile}
          onSave={() => router.refresh()}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'contact-info',
      title: t('sections.contact_info'),
      content: (
        <ContactInfoSection
          profile={profile}
          onSave={() => router.refresh()}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: (
        <FamilyInfoSection
          profile={profile}
          onSave={() => router.refresh()}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'professional-info',
      title: t('sections.professional_info'),
      content: (
        <ProfessionalInfoSection
          profile={profile}
          onSave={() => router.refresh()}
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
            passport: profile.passport,
            birthCertificate: profile.birthCertificate,
            residencePermit: profile.residencePermit,
            addressProof: profile.addressProof,
          }}
          profileId={profile.id}
          onSave={() => router.refresh()}
          requestId={requestId}
        />
      ),
    },
  ];

  if (requests) {
    profileTabs.push({
      id: 'requests',
      title: t('sections.requests'),
      content: <RequestsSection requests={requests} />,
    });
  }

  type Tab = (typeof profileTabs)[number]['id'];

  const { currentTab, handleTabChange } = useTabs<Tab>('tab', 'basic-info');

  return (
    <Tabs
      className={'col-span-full lg:col-span-6'}
      value={currentTab}
      onValueChange={handleTabChange}
    >
      <TabsList className="mb-2 w-full">
        <div className="flex items-center flex-wrap">
          {profileTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.title}
              <ArrowRight className="size-4 ml-1" />
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
