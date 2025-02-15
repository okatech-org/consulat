'use client';

import { User } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useDateLocale } from '@/lib/utils';

interface UserProfileProps {
  user: User & {
    profile?: {
      birthDate: Date;
      nationality: string;
      address?: {
        firstLine?: string;
        secondLine?: string;
        city?: string;
        zipCode?: string;
        country?: string;
      } | null;
      phone?: {
        countryCode: string;
        number: string;
      } | null;
    } | null;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const t = useTranslations('profile');
  const t_countries = useTranslations('countries');
  const { formatDate } = useDateLocale();

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de base */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.image} alt={user.firstName ?? ''} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  {user.email}
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
              {user.profile && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t('personal_info.birth')}:
                    </span>
                    <span>{formatDate(user.profile.birthDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t('personal_info.nationality')}:
                    </span>
                    <span>{t_countries(user.profile.nationality)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>{t('contact_info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.profile?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('contact_info.phone')}:
                  </span>
                  <span>
                    {user.profile.phone.countryCode}
                    {user.profile.phone.number}
                  </span>
                </div>
              )}
              {user.profile?.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">
                      {t('contact_info.address')}:
                    </span>
                    <p className="mt-1">
                      {user.profile.address.firstLine}
                      {user.profile.address.secondLine && (
                        <>, {user.profile.address.secondLine}</>
                      )}
                      <br />
                      {user.profile.address.zipCode} {user.profile.address.city}
                      <br />
                      {user.profile.address.country}
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
