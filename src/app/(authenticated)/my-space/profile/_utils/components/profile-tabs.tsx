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
import { useStoredTabs } from '@/hooks/use-tabs';
import { useRouter } from 'next/navigation';

type ProfileTabsProps = {
  profile: FullProfile;
  requestId?: string;
};

export function ProfileTabs({ profile, requestId }: ProfileTabsProps) {
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
          profileStatus={profile.status}
          className="md:col-span-2"
          onSave={() => router.refresh()}
          requestId={requestId}
        />
      ),
    },
  ];

  type Tab = (typeof profileTabs)[number]['id'];

  const { currentTab, setCurrentTab } = useStoredTabs<Tab>('tab', 'basic-info');

  return (
    <Tabs
      className={'col-span-full lg:col-span-6'}
      value={currentTab}
      onValueChange={setCurrentTab}
    >
      <TabsList className="mb-2 w-full px-0">
        <div className="carousel-zone flex items-center px-0">
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
