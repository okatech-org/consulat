'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CompleteChildProfile } from '@/convex/lib/types';
import { ChildBasicInfoDisplay } from './sections/child-basic-info-display';
import { ChildFamilyInfoDisplay } from './sections/child-family-info-display';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import { useTabs } from '@/hooks/use-tabs';
import { ArrowRight } from 'lucide-react';
import { RequestsSection } from './sections/requests-section';
import { useIsMobile } from '@/hooks/use-mobile';
import { Fragment, useState } from 'react';
import { DocumentType } from '@/convex/lib/constants';
import { UserDocument } from '@/components/documents/user-document';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FileDisplay } from '@/components/ui/file-display';

type AdditionalTab = {
  id: string;
  title: string;
  content: React.ReactElement;
};

type ChildProfileTabsProps = {
  profile?: CompleteChildProfile;
  showRequests?: boolean;
  noTabs?: boolean;
  additionalTabs?: AdditionalTab[];
};

export function ChildProfileTabs({
  profile,
  showRequests = false,
  noTabs,
  additionalTabs,
}: ChildProfileTabsProps) {
  if (!profile) {
    return undefined;
  }

  const t = useTranslations('profile');
  const t_common = useTranslations('common');
  const isMobile = useIsMobile();

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
      content: <ChildBasicInfoDisplay profile={profile} />,
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: <ChildFamilyInfoDisplay profile={profile} />,
    },
    {
      id: 'documents',
      title: t('sections.documents'),
      content: (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            profile.documents?.passport,
            profile.documents?.birthCertificate,
            profile.documents?.residencePermit,
            profile.documents?.addressProof,
          ]
            .filter(Boolean)
            .map((document) => (
              <Fragment key={document?.id}>
                <FileDisplay fileUrl={document?.fileUrl}/>
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

  if (additionalTabs) {
    profileTabs.push(...additionalTabs);
  }

  type Tab = (typeof profileTabs)[number]['id'];

  const { currentTab, handleTabChange } = useTabs<Tab>('tab', 'basic-info');
  const [localTabs, setLocalTabs] = useState<Tab>('basic-info');

  // Skip MobileProfileNavigation for now to avoid complexity of adapting it, 
  // or use standar Tabs which work on mobile too (just stacked).
  // The original has: if (isMobile) return <MobileProfileNavigation ... />
  // I will just use Tabs for now to ensure it works. 
  
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
