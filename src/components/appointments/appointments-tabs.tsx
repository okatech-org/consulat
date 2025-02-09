'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTabs } from '@/hooks/use-tabs';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { useState } from 'react';
import { User } from '@prisma/client';
import { ConsularService } from '@prisma/client';

export function AppointmentsTabs({
  user,
  services,
}: {
  user: User;
  services: ConsularService[];
}) {
  const t = useTranslations('user.dashboard.appointments');
  const { handleTabChange, searchParams } = useTabs();
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const tab = searchParams.get('tab') || 'upcoming';

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button onClick={() => setShowNewAppointment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('new_appointment')}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
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

      <NewAppointmentDialog
        user={user}
        services={services}
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
      />
    </>
  );
}
