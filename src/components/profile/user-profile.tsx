'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useDateLocale } from '@/lib/utils';
import { FullProfile } from '@/types/profile';

interface UserProfileProps {
  profile: FullProfile;
}

export function UserProfile({ profile }: UserProfileProps) {
  const t = useTranslations('profile');
  const { formatDate } = useDateLocale();

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de base */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={profile.identityPicture?.fileUrl ?? ''}
                alt={profile.firstName ?? ''}
              />
              <AvatarFallback>
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-semibold">
                {profile.firstName} {profile.lastName}
              </h2>
              {profile.user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  {profile.user.email}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations détaillées */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">{t('tabs.personal')}</TabsTrigger>
          <TabsTrigger value="contact">{t('tabs.contact')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t('personal_info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('personal_info.birth')}:</span>
                <span>{formatDate(profile.birthDate)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>{t('contact_info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('contact_info.phone')}:
                  </span>
                  <span>
                    {profile.phone.countryCode}
                    {profile.phone.number}
                  </span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">
                      {t('contact_info.address')}:
                    </span>
                    <p className="mt-1">
                      {profile.address.firstLine}
                      {profile.address.secondLine && <>, {profile.address.secondLine}</>}
                      <br />
                      {profile.address.zipCode} {profile.address.city}
                      <br />
                      {profile.address.country}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
