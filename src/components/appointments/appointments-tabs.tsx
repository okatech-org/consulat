'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTabs } from '@/hooks/use-tabs';

export function AppointmentsTabs() {
  const t = useTranslations('user.dashboard.appointments');
  const { handleTabChange, currentTab } = useTabs('tab', 'upcoming');

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="upcoming">{t('tabs.upcoming')}</TabsTrigger>
        <TabsTrigger value="past">{t('tabs.past')}</TabsTrigger>
        <TabsTrigger value="cancelled">{t('tabs.cancelled')}</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcoming.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">{t('upcoming.empty')}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('past.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">{t('past.empty')}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cancelled" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('cancelled.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">{t('cancelled.empty')}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
