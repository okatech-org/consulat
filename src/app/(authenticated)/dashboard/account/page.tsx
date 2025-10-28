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
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layouts/page-container';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { hasRole } from '@/lib/permissions/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserRole } from '@/convex/lib/constants';

export default function AdminAccountPage() {
  const t_messages = useTranslations('messages');
  const t_actions = useTranslations('common.actions');
  const t = useTranslations('account');
  const { user } = useCurrentUser();
  const updateUser = useMutation(api.functions.user.updateUser);
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(false);

  if (!user) return null;

  const isManager = hasRole(user, UserRole.Manager);
  const isAgent = hasRole(user, UserRole.Agent);
  const isAdmin = hasRole(user, UserRole.Admin);
  const isSuperAdmin = hasRole(user, UserRole.SuperAdmin);

  const handleUpdateProfile = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;

      if (!user._id) {
        throw new Error('User ID not found');
      }

      await updateUser({
        userId: user._id,
        firstName,
        lastName,
      });

      toast.success(t('profile_updated'), {});
    } catch (error) {
      toast.error(t('profile_update_error'), {
        description: t('profile_update_error_description'),
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title={t('title')}>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          {(isAgent || isManager) && (
            <TabsTrigger value="performance">{t('performance')}</TabsTrigger>
          )}
          <TabsTrigger value="preferences">{t('preferences')}</TabsTrigger>
          {(isAdmin || isSuperAdmin) && (
            <TabsTrigger value="security">{t('security')}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_information')}</CardTitle>
              <CardDescription>{t('admin_profile_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={undefined}
                      alt={`${user.firstName || ''} ${user.lastName || ''}`}
                    />
                    <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" type="button">
                      {t('change_avatar')}
                    </Button>
                    <div className="flex gap-2">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {t(`roles.${role}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('first_name')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user.firstName || ''}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('last_name')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user.lastName || ''}
                      disabled={isLoading}
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

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('save_changes')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('work_preferences')}</CardTitle>
              <CardDescription>{t('work_preferences_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('email_notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('admin_email_notifications_description')}
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('auto_assignment')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('auto_assignment_description')}
                  </p>
                </div>
                <Switch
                  checked={autoAssignment}
                  onCheckedChange={setAutoAssignment}
                  disabled={isLoading}
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      // Here you would save the preferences
                      toast.success(t_messages('success.update'), {
                        description: t_messages('success.update_description'),
                      });
                    } catch (error) {
                      toast.error(t_messages('errors.update'), {
                        description: t_messages('errors.update_description'),
                      });
                      console.error(error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t_actions('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(isAdmin || isSuperAdmin) && (
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('security_settings')}</CardTitle>
                <CardDescription>{t('admin_security_description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('two_factor_auth')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('two_factor_description')}
                  </p>
                  <Button variant="outline">{t('enable_2fa')}</Button>
                </div>
                <div className="space-y-2">
                  <Label>{t('api_access')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('api_access_description')}
                  </p>
                  <Button variant="outline">{t('manage_api_keys')}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
}
