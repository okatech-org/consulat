'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail } from 'lucide-react';
import { FullProfile } from '@/types/profile';
import { ProfileProfessional } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/professional';
import { ProfileBasicInfo } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/basic-info';
import { ProfileContact } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/contact';
import { ProfileDocuments } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/documents';
import { ProfileFamily } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/family';
import CardContainer from '../layouts/card-container';

interface UserProfileProps {
  profile: FullProfile;
}

export function UserProfile({ profile }: UserProfileProps) {
  const t_review = useTranslations('admin.registrations.review');

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de base */}
      <CardContainer contentClass="pt-6">
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
      </CardContainer>

      {/* Contenu principal */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">{t_review('tabs.basic')}</TabsTrigger>
          <TabsTrigger value="documents">{t_review('tabs.documents')}</TabsTrigger>
          <TabsTrigger value="contact">{t_review('tabs.contact')}</TabsTrigger>
          <TabsTrigger value="family">{t_review('tabs.family')}</TabsTrigger>
          <TabsTrigger value="professional">{t_review('tabs.professional')}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <ProfileBasicInfo profile={profile} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ProfileDocuments profile={profile} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ProfileContact profile={profile} />
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <ProfileFamily profile={profile} />
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <ProfileProfessional profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
