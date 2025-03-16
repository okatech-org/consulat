'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';
import { updateUserProfile } from '@/actions/user';
import { toast } from '@/hooks/use-toast';
import { PageContainer } from '@/components/layouts/page-container';

export default function AccountPage() {
  const t = useTranslations('account');
  const { data: session, update } = useSession();
  const user = session?.user;

  if (!user) return null;

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      await updateUserProfile(formData);
      await update();
      toast({
        title: t('profile_updated'),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t('profile_update_error'),
      });
    }
  };

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
              <form action={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image} alt={user.name || ''} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" type="button">
                    {t('change_avatar')}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('first_name')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user.firstName || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('last_name')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user.lastName || ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ''}
                    disabled
                  />
                </div>

                <Button type="submit">{t('save_changes')}</Button>
              </form>
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
                  <Label>{t('email_notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('email_notifications_description')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('sms_notifications')}</Label>
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
                <Label>{t('two_factor_auth')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('two_factor_description')}
                </p>
                <Button variant="outline">{t('enable_2fa')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
