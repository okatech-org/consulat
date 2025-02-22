'use client';

import { useTranslations } from 'next-intl';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsListMobile,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ProfileBasicInfo } from './basic-info';
import { ProfileDocuments } from './documents';
import { ProfileContact } from './contact';
import { ProfileFamily } from './family';
import { ProfileProfessional } from './professional';
import React, { useState } from 'react';
import { RequestStatus, User } from '@prisma/client';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import {
  calculateProfileCompletion,
  useDateLocale,
  getProfileFieldsStatus,
} from '@/lib/utils';
import { FullServiceRequest } from '@/types/service-request';
import { ProfileCompletion } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-completion';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
import { ProfileNotes } from './profile-notes';
import { FullProfile } from '@/types/profile';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select';
import CardContainer from '@/components/layouts/card-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';

interface ProfileReviewProps {
  request: FullServiceRequest & { profile: FullProfile | null };
  agents: User[];
}

export function ProfileReview({ request, agents = [] }: ProfileReviewProps) {
  const t = useTranslations();
  const profile = request?.profile;
  const user = request.submittedBy;
  const [isLoading, setIsLoading] = useState(false);
  const { formatDate } = useDateLocale();
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(request.status);
  const [validationNotes, setValidationNotes] = useState('');

  if (!profile || !user) {
    return null;
  }

  const completionRate = calculateProfileCompletion(profile);
  const fieldStatus = getProfileFieldsStatus(profile);

  const statusOptions = [
    { value: 'PENDING', label: t('common.status.pending') },
    { value: 'DOCUMENTS_VALIDATION', label: t('common.status.documents_validation') },
    { value: 'PENDING_COMPLETION', label: t('common.status.pending_completion') },
    { value: 'VALIDATED', label: t('common.status.validated') },
    { value: 'REJECTED', label: t('common.status.rejected') },
  ];

  const profileTabs = [
    { value: 'basic', label: t('admin.registrations.review.tabs.basic') },
    { value: 'documents', label: t('admin.registrations.review.tabs.documents') },
    { value: 'contact', label: t('admin.registrations.review.tabs.contact') },
    { value: 'family', label: t('admin.registrations.review.tabs.family') },
    { value: 'professional', label: t('admin.registrations.review.tabs.professional') },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actions */}
      <CardContainer contentClass="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="size-14 md:size-24">
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
            <h2 className="text-xl md:text-2xl flex items-center gap-2 font-semibold">
              {profile.firstName} {profile.lastName}{' '}
              <ProfileStatusBadge status={request.status} />
            </h2>
            {profile.user.email && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Mail className="size-4" />
                {profile.user.email}
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Phone className="size-4" />
                {profile.phone.number}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('admin.registrations.review.submitted_on')}:{' '}
                {formatDate(request.createdAt ?? '')}
              </span>
            </div>
          </div>
        </div>
      </CardContainer>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              {profileTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
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

        {/* Panneau latéral pour les notes et validations */}
        <div className="space-y-4 col-span-1">
          <ProfileCompletion completionRate={completionRate} fieldStatus={fieldStatus} />
          <CardContainer
            title={t('admin.registrations.review.validation.title')}
            contentClass="space-y-4"
          >
            <div className="space-y-2">
              <Label>{t('admin.registrations.review.validation.status')}</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as RequestStatus)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('admin.registrations.review.validation.status')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      defaultChecked={option.value === selectedStatus}
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.registrations.review.validation.notes')}</Label>
              <Textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder={t('admin.registrations.review.validation.notes_placeholder')}
              />
            </div>
          </CardContainer>
          <ProfileNotes profileId={profile.id} notes={profile.notes} />
        </div>
      </div>
    </div>
  );
}
