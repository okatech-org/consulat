'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CompleteProfile } from '@/convex/lib/types';
import { ContactInfoDisplay } from './sections/contact-info-display';
import { FamilyInfoDisplay } from './sections/family-info-display';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import { useTabs } from '@/hooks/use-tabs';
import { ArrowRight } from 'lucide-react';
import { RequestsSection } from './sections/requests-section';
import { MobileProfileNavigation } from './mobile-profile-navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Fragment, useState } from 'react';
import { BasicInfoDisplay } from './sections/basic-info-display';
import { ProfessionalInfoDisplay } from './sections/professional-info-display';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '@/components/documents/user-document';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
type AdditionalTab = {
  id: string;
  title: string;
  content: React.ReactElement;
};

type ProfileTabsProps = {
  profile?: CompleteProfile;
  showRequests?: boolean;
  noTabs?: boolean;
  additionalTabs?: AdditionalTab[];
};

export function ProfileTabs({
  profile,
  showRequests = false,
  noTabs,
  additionalTabs,
}: ProfileTabsProps) {
  if (!profile) {
    return undefined;
  }

  const t = useTranslations('profile');
  const t_common = useTranslations('common');
  const isMobile = useIsMobile();

  if (!profile) {
    return undefined;
  }

  const requests = useQuery(
    api.functions.request.getAllRequests,
    showRequests
      ? {
          profileId: profile._id,
        }
      : 'skip',
  );

  const profileTabs = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: <BasicInfoDisplay profile={profile} />,
    },
    {
      id: 'contact-info',
      title: t('sections.contact_info'),
      content: <ContactInfoDisplay profile={profile} />,
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: <FamilyInfoDisplay profile={profile} />,
    },
    {
      id: 'professional-info',
      title: t('sections.professional_info'),
      content: <ProfessionalInfoDisplay profile={profile} />,
    },
    {
      id: 'documents',
      title: t('sections.documents'),
      content: (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            profile.passport,
            profile.birthCertificate,
            profile.residencePermit,
            profile.addressProof,
          ]
            .filter(Boolean)
            .map((document) => (
              <Fragment key={document?._id}>
                <UserDocument
                  label={t_common(`documents.types.${document?.type}`)}
                  description={t_common(`documents.descriptions.${document?.type}`)}
                  document={document}
                  expectedType={document?.type}
                  allowEdit={true}
                  required
                  noFormLabel={true}
                  enableBackgroundRemoval={DocumentType.IdentityPhoto === document?.type}
                />
              </Fragment>
            ))}
        </div>
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
    return <MobileProfileNavigation profile={profile} requests={requests} />;
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
