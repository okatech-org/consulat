'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageContainer } from '@/components/layouts/page-container';
import SmartInteractiveMap from '@/components/intelligence/smart-interactive-map';

export default function CartePage() {
  const profilesMap = useQuery(api.functions.profile.getProfilesMapData);
  return (
    <PageContainer
      title="Carte des profiles consulaires"
      description="Carte des profiles consulaires"
      className="container py-8 max-w-screen-xl"
    >
      <SmartInteractiveMap
        profiles={profilesMap}
        onProfileClick={() => {}}
        className="w-full h-full"
      />
    </PageContainer>
  );
}
