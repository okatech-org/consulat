'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { RequestStatus } from '@prisma/client';
import { Textarea } from '@/components/ui/textarea';
import {
  useDateLocale,
  tryCatch,
  calculateChildProfileCompletion,
  getChildProfileFieldsStatus,
} from '@/lib/utils';
import type { FullServiceRequest } from '@/types/service-request';
import { ProfileCompletion } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-completion';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
import { ReviewNotes } from '../requests/review-notes';
import type { FullProfile } from '@/types/profile';
import { Label } from '@/components/ui/label';
import CardContainer from '@/components/layouts/card-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  updateConsularRegistrationStatus,
  validateConsularRegistration,
} from '@/actions/consular-registration';
import { StatusTimeline } from '@/components/consular/status-timeline';
import { canSwitchTo, STATUS_ORDER } from '@/lib/validations/status-transitions';
import { MultiSelect } from '@/components/ui/multi-select';
import { ChildProfileTabs } from '@/app/(authenticated)/my-space/children/_components/profile-tabs';

interface ChildProfileReviewProps {
  request: FullServiceRequest & { profile: FullProfile | null };
}

export function ChildProfileReview({ request }: ChildProfileReviewProps) {
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

  const completionRate = calculateChildProfileCompletion(profile);
  const fieldStatus = getChildProfileFieldsStatus(profile);

  const statusOptions = STATUS_ORDER.map((item) => {
    return { value: item, label: t(`common.status.${item}`) };
  });

  function isStatusCompleted(status: RequestStatus) {
    return STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(request.status);
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actions */}
      <CardContainer>
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
              <ProfileStatusBadge
                status={request.status}
                label={t(`common.status.${request.status}`)}
              />
            </h2>
            {profile.user?.email && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Mail className="size-4" />
                {profile.user.email}
              </div>
            )}
            {profile.user?.phoneNumber && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Phone className="size-4" />
                {profile.user.phoneNumber}
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
      <CardContainer>
        <StatusTimeline
          currentStatus={request.status}
          request={request}
          profile={profile}
        />
      </CardContainer>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {request.appointments[0] && (
            <CardContainer title={t('admin.registrations.review.appointment.title')}>
              <div className="space-y-2">
                <Label>{t('admin.registrations.review.appointment.date')}</Label>
                <p>{formatDate(request.appointments[0].date)}</p>
              </div>
            </CardContainer>
          )}
          <ChildProfileTabs profile={profile} />
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
              <MultiSelect<RequestStatus>
                type="single"
                selected={selectedStatus}
                onChange={(value) => setSelectedStatus(value as RequestStatus)}
                placeholder={t('admin.registrations.review.validation.status')}
                options={statusOptions.map((option) => {
                  const { can, reason } = canSwitchTo(
                    option.value as RequestStatus,
                    request,
                    profile,
                    true,
                  );

                  const isCompleted = isStatusCompleted(option.value as RequestStatus);

                  let label = option.label;
                  if (!isCompleted && reason) {
                    label += ` (${t(`admin.registrations.review.transitions.${reason}`)})`;
                  }
                  if (isCompleted) {
                    label += ` (${t('common.status.COMPLETED')})`;
                  }

                  return { value: option.value, label: label, disabled: !can };
                })}
              />
            </div>
            {selectedStatus === RequestStatus.VALIDATED &&
              RequestStatus.VALIDATED !== request.status && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('admin.registrations.review.validation.notes')}</Label>
                    <Textarea
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                      placeholder={t(
                        'admin.registrations.review.validation.notes_placeholder',
                      )}
                    />
                  </div>
                  <Button
                    disabled={isLoading}
                    className="w-full"
                    onClick={async () => {
                      setIsLoading(true);
                      await tryCatch(
                        validateConsularRegistration(
                          request.id,
                          profile.id,
                          profile.residenceCountyCode,
                          'VALIDATED',
                          3,
                          validationNotes,
                        ),
                      );
                      setIsLoading(false);
                    }}
                  >
                    {t('admin.registrations.review.validation.validate')}
                  </Button>
                </div>
              )}
            {selectedStatus !== RequestStatus.VALIDATED && (
              <Button
                className="w-full"
                disabled={isLoading || selectedStatus === request.status}
                onClick={async () => {
                  setIsLoading(true);
                  await updateConsularRegistrationStatus(
                    request.id,
                    profile.id,
                    selectedStatus,
                  );
                  setIsLoading(false);
                }}
              >
                {t('admin.registrations.review.validation.validate')}
              </Button>
            )}
          </CardContainer>
          <ReviewNotes requestId={request.id} notes={request.notes} />
        </div>
      </div>
    </div>
  );
}
