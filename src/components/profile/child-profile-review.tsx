'use client';

import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { RequestStatus, UserRole } from '@/convex/lib/constants';
import { Textarea } from '@/components/ui/textarea';
import { useDateLocale, calculateChildProfileCompletion } from '@/lib/utils';
import { ProfileCompletion } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-completion';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
import { Label } from '@/components/ui/label';
import CardContainer from '@/components/layouts/card-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { ChildProfileTabs } from '@/app/(authenticated)/my-space/children/_components/profile-tabs';
import { LoadingSkeleton } from '../ui/loading-skeleton';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { hasRole } from '@/lib/permissions/utils';

interface ChildProfileReviewProps {
  request: NonNullable<Doc<'requests'>>;
}

export function ChildProfileReviewBase({ request }: ChildProfileReviewProps) {
  const { user: currentUser } = useCurrentUser();
  const cantUpdateRequest =
    hasRole(currentUser, UserRole.Agent) &&
    request.assignedAgentId !== currentUser?.membership?._id;

  const t = useTranslations();

  // Fetch child profile data using Convex
  const profile = useQuery(
    api.functions.childProfile.getChildProfile,
    request.profileId
      ? { childProfileId: request.profileId as Id<'childProfiles'> }
      : 'skip',
  );

  const [isLoading, setIsLoading] = useState(false);
  const { formatDate } = useDateLocale();
  const [selectedStatus, setSelectedStatus] = useState<string>(request.status);
  const [validationNotes, setValidationNotes] = useState('');
  const router = useRouter();

  // Convex mutations
  const updateRequestStatus = useMutation(api.functions.request.updateRequestStatus);
  const addNoteMutation = useMutation(api.functions.request.addRequestNote);

  if (!profile) {
    return <LoadingSkeleton variant="form" />;
  }

  const completionRate = calculateChildProfileCompletion(profile);

  const statusOptions = Object.values(RequestStatus).map((status) => ({
    value: status,
    label: t(`common.status.${status}`),
  }));

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await updateRequestStatus({
        requestId: request._id,
        status: newStatus as RequestStatus,
      });

      if (validationNotes && currentUser?.membership?._id) {
        await addNoteMutation({
          requestId: request._id,
          note: {
            type: 'internal',
            content: validationNotes,
          },
          addedById: currentUser.membership._id,
        });
      }

      toast.success('Statut mis à jour avec succès');
      router.refresh();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actions */}
      <CardContainer>
        <div className="flex items-start gap-4">
          <Avatar className="size-14 md:size-24">
            <AvatarImage
              src={profile.documents?.identityPicture?.fileUrl ?? ''}
              alt={profile.personal?.firstName ?? ''}
            />
            <AvatarFallback>
              {profile.personal?.firstName?.[0]}
              {profile.personal?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl md:text-2xl flex items-center gap-2 font-semibold">
              {profile.personal?.firstName} {profile.personal?.lastName}{' '}
              <ProfileStatusBadge
                status={request.status as any}
                label={t(`common.status.${request.status}`)}
              />
            </h2>
            {request.metadata.requester?.email && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Mail className="size-4" />
                {request.metadata.requester.email}
              </div>
            )}
            {request.metadata.requester?.phoneNumber && (
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Phone className="size-4" />
                {request.metadata.requester.phoneNumber}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('admin.registrations.review.submitted_on')}:{' '}
                {request.submittedAt
                  ? formatDate(new Date(request.submittedAt))
                  : formatDate(new Date(request._creationTime))}
              </span>
            </div>
          </div>
        </div>
      </CardContainer>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <ChildProfileTabs profile={profile as any} />
        </div>

        {/* Panneau latéral pour les notes et validations */}
        <div className="space-y-4 col-span-1">
          <ProfileCompletion completion={completionRate} />
          <CardContainer
            title={t('admin.registrations.review.validation.title')}
            contentClass="space-y-4"
          >
            <div className="space-y-2">
              <Label>{t('admin.registrations.review.validation.status')}</Label>
              <MultiSelect<string>
                type="single"
                selected={selectedStatus}
                onChange={(value) => value && setSelectedStatus(value)}
                placeholder={t('admin.registrations.review.validation.status')}
                options={statusOptions}
              />
            </div>

            {selectedStatus === RequestStatus.Validated && (
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
              </div>
            )}

            <Button
              className="w-full"
              loading={isLoading}
              disabled={selectedStatus === request.status || cantUpdateRequest}
              onClick={() => handleStatusUpdate(selectedStatus)}
            >
              {t('admin.registrations.review.validation.validate')}
            </Button>
          </CardContainer>

          {/* Activity History */}
          <CardContainer title="Historique" contentClass="space-y-3">
            {request.metadata.activities.length > 0 ? (
              request.metadata.activities
                .slice()
                .reverse()
                .slice(0, 5)
                .map((activity, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(activity.timestamp), 'PPp')}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune activité</p>
            )}
          </CardContainer>
        </div>
      </div>
    </div>
  );
}

export function ChildProfileReview({ request }: ChildProfileReviewProps) {
  return (
    <Suspense fallback={<LoadingSkeleton variant="form" className="w-full" />}>
      <ChildProfileReviewBase request={request} />
    </Suspense>
  );
}
