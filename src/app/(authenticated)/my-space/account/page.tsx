import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PageContainer } from '@/components/layouts/page-container';
import { getActiveCountries } from '@/actions/countries';
import { getCurrentUser } from '@/actions/user';
import { UserSettingsForm } from './_utils/user-settings-form';
import { getTranslations } from 'next-intl/server';
import type { SessionUser } from '@/types/user';

export default async function AccountPage() {
  const t = await getTranslations('account');
  const countries = await getActiveCountries();
  const user = await getCurrentUser();

  return (
    <PageContainer title={t('title')}>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_information')}</CardTitle>
              <CardDescription>{t('profile_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <UserSettingsForm
                  user={user as SessionUser}
                  availableCountries={countries}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('notification_preferences')}</CardTitle>
              <CardDescription>{t('notification_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label>{t('email_notifications')}</label>
                  <p className="text-sm text-muted-foreground">
                    {t('email_notifications_description')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label>{t('sms_notifications')}</label>
                  <p className="text-sm text-muted-foreground">
                    {t('sms_notifications_description')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('security_settings')}</CardTitle>
              <CardDescription>{t('security_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label>{t('two_factor_auth')}</label>
                <p className="text-sm text-muted-foreground">
                  {t('two_factor_description')}
                </p>
                <Button variant="outline" size="mobile">
                  {t('enable_2fa')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
