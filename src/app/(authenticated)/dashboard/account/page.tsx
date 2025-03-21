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
import { updateUserData, updateUserProfile } from '@/actions/user';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceCategory } from '@prisma/client';
import { PageContainer } from '@/components/layouts/page-container';
import { UserSettings } from '@/schemas/user';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function AdminAccountPage() {
  const t = useTranslations('account');
  const user = useCurrentUser();

  if (!user) return null;

  const handleUpdateProfile = async (formData: FormData) => {
    const data = Object.fromEntries(formData.entries()) as unknown as UserSettings;
    try {
      await updateUserData(user.id, data);
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
          <TabsTrigger value="performance">{t('performance')}</TabsTrigger>
          <TabsTrigger value="preferences">{t('preferences')}</TabsTrigger>
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
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
                    <AvatarImage src={user.image} alt={user.name || ''} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
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
                      defaultValue={user.name || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('last_name')}</Label>
                    <Input id="lastName" name="lastName" defaultValue={user.name || ''} />
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

                <div className="space-y-2">
                  <Label>{t('specializations')}</Label>
                  <Select name="specialization" defaultValue={user.specializations?.[0]}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_specialization')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ServiceCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`service_category.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit">{t('save_changes')}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('performance_metrics')}</CardTitle>
              <CardDescription>{t('performance_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t('completed_requests')}</Label>
                  <span className="font-medium">{user.completedRequests}</span>
                </div>
                <Progress value={75} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t('average_processing_time')}</Label>
                  <span className="font-medium">
                    {user.averageProcessingTime
                      ? `${Math.round(user.averageProcessingTime)} ${t('hours')}`
                      : t('not_available')}
                  </span>
                </div>
                <Progress value={85} />
              </div>

              <div className="space-y-2">
                <Label>{t('active_requests_limit')}</Label>
                <Input
                  type="number"
                  name="maxActiveRequests"
                  defaultValue={user.maxActiveRequests || 10}
                />
              </div>
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
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('auto_assignment')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('auto_assignment_description')}
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
      </Tabs>
    </PageContainer>
  );
}
