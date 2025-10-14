'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FullProfile } from '@/types/convex-profile';
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
import { RequestsSection } from './sections/requests-section';
import { MobileProfileNavigation } from './mobile-profile-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import type { Doc } from '@/convex/_generated/dataModel';

type AdditionalTab = {
  id: string;
  title: string;
  content: React.ReactElement;
};

type ProfileTabsProps = {
  profile: FullProfile;
  requestId?: string;
  requests?: Doc<'requests'>[];
  noTabs?: boolean;
  additionalTabs?: AdditionalTab[];
};

export function ProfileTabs({
  profile,
  requestId,
  requests,
  noTabs,
  additionalTabs,
}: ProfileTabsProps) {
  const t = useTranslations('profile');
  const router = useRouter();
  const isMobile = useIsMobile();

  if (!profile) {
    return undefined;
  }

  const profileTabs = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: (
        <BasicInfoSection profile={profile} onSaveAction={() => router.refresh()} />
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
          profileId={profile._id}
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

  // Ajouter les onglets supplémentaires
  if (additionalTabs) {
    profileTabs.push(...additionalTabs);
  }

  type Tab = (typeof profileTabs)[number]['id'];

  const { currentTab, handleTabChange } = useTabs<Tab>('tab', 'basic-info');
  const [localTabs, setLocalTabs] = useState<Tab>('basic-info');

  // Use Accordion on mobile, Tabs on desktop
  if (isMobile) {
    return (
      <MobileProfileNavigation
        profile={profile}
        requestId={requestId}
        requests={requests}
      />
    );
  }

  return (
    <Tabs
      className={'col-span-full lg:col-span-6'}
      value={noTabs ? localTabs : currentTab}
      onValueChange={noTabs ? setLocalTabs : handleTabChange}
    >
      <TabsList className="mb-2 w-full flex-wrap !h-auto">
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
