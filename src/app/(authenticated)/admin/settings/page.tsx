import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTranslations } from 'next-intl/server';
import { OrganizationSettings } from '@/components/service/organization-settings';
import { GeneralSettings } from '@/app/(authenticated)/admin/_utils/components/general-settings';
import { getOrganizationFromUser } from '@/components/service/organization';

import { getCurrentUser } from '@/actions/user';
import { Unauthorized } from '@/components/layouts/unauthorized';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <Unauthorized />;
  }

  const t = await getTranslations('manager.settings');
  const organization = await getOrganizationFromUser(user.id);

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">{t('tabs.organization')}</TabsTrigger>
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          {organization && <OrganizationSettings organization={organization} />}
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
