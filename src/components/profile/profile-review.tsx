'use client';

import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { RequestStatus, UserRole } from '@/convex/lib/constants';
import { Textarea } from '@/components/ui/textarea';
import { calculateProfileCompletion, useDateLocale } from '@/lib/utils';
import { ProfileCompletion } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-completion';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
import { Label } from '@/components/ui/label';
import CardContainer from '@/components/layouts/card-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';
import { useCurrentUser } from '@/hooks/use-current-user';
import { hasRole } from '@/lib/permissions/utils';
import { LoadingSkeleton } from '../ui/loading-skeleton';
import { useRouter } from 'next/navigation';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

interface ProfileReviewProps {
  request: Doc<'requests'>;
}

export function ProfileReviewBase({ request }: ProfileReviewProps) {
  const { user: currentUser } = useCurrentUser();
  const cantUpdateRequest =
    hasRole(currentUser, UserRole.Agent) &&
    request.assignedAgentId !== currentUser?.membership?._id;
  const t = useTranslations();

  // Fetch profile data using Convex
  const profile = useQuery(
    api.functions.profile.getCurrentProfile,
    request.profileId ? { profileId: request.profileId as Id<'profiles'> } : 'skip',
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

  const completion = calculateProfileCompletion(profile);

  const statusOptions = Object.values(RequestStatus).map((status) => ({
    value: status,
    label: t(`inputs.requestStatus.options.${status}`),
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
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-6">
        <CardContainer className="col-span-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 md:size-24 bg-muted">
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
              <h2 className="text-lg md:text-xl flex flex-col items-start gap-2 font-semibold">
                <ProfileStatusBadge
                  status={profile.status}
                  label={t(`inputs.requestStatus.options.${request.status}`)}
                />
                {profile.personal?.firstName} {profile.personal?.lastName}{' '}
              </h2>
              {profile.contacts?.email && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Mail className="size-4" />
                  {profile.contacts.email}
                </div>
              )}
              {profile.contacts?.phone && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Phone className="size-4" />
                  {profile.contacts.phone}
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
        <div className="col-span-2">
          <ProfileCompletion completion={completion} />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <ProfileTabs profile={profile} />
        </div>

        {/* Panneau latéral pour les notes et validations */}
        <div className="space-y-4 col-span-1">
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
                    <p className="text-sm font-medium">
                      {t(`inputs.activityType.options.${activity.type}`)}
                    </p>
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

export function ProfileReview({ request }: ProfileReviewProps) {
  return (
    <Suspense fallback={<LoadingSkeleton variant="form" className="w-full" />}>
      <ProfileReviewBase request={request} />
    </Suspense>
  );
}
