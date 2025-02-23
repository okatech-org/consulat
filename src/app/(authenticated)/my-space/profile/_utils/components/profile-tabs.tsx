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

type ProfileTabsProps = {
  profile: FullProfile;
};

export function ProfileTabs({ profile }: ProfileTabsProps) {
  const t = useTranslations('profile');
  const profileTabs = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: <BasicInfoSection profile={profile} />,
    },
    {
      id: 'contact-info',
      title: t('sections.contact_info'),
      content: <ContactInfoSection profile={profile} />,
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: <FamilyInfoSection profile={profile} />,
    },
    {
      id: 'professional-info',
      title: t('sections.professional_info'),
      content: <ProfessionalInfoSection profile={profile} />,
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
            identityPhoto: profile.identityPicture,
          }}
          profileId={profile.id}
          className="md:col-span-2"
        />
      ),
    },
  ];

  return (
    <Tabs className={'col-span-full lg:col-span-6'} defaultValue="basic-info">
      <TabsList className="mb-2 w-full">
        <div className="carousel-zone flex items-center gap-2">
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
