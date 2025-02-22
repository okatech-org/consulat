'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileBasicInfo } from './basic-info';
import { ProfileDocuments } from './documents';
import { ProfileContact } from './contact';
import { ProfileFamily } from './family';
import { ProfileProfessional } from './professional';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RequestStatus, User } from '@prisma/client';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/schemas/routes';
import {
  calculateProfileCompletion,
  useDateLocale,
  getProfileFieldsStatus,
} from '@/lib/utils';
import { validateRegistrationRequest } from '@/actions/registrations';
import { FullServiceRequest } from '@/types/service-request';
import { ProfileCompletion } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-completion';
import { ProfileStatusBadge } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-status-badge';
import { ProfileNotes } from './profile-notes';
import { FullProfile } from '@/types/profile';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';

interface ProfileReviewProps {
  request: FullServiceRequest & { profile: FullProfile | null };
  agents: User[];
}

export function ProfileReview({ request, agents = [] }: ProfileReviewProps) {
  const t = useTranslations();
  const profile = request?.profile;
  const user = request.submittedBy;
  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<RequestStatus | null>(null);
  const router = useRouter();
  const { formatDate } = useDateLocale();
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(request.status);
  const [isValidating, setIsValidating] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');

  if (!profile || !user) {
    return null;
  }

  const completionRate = calculateProfileCompletion(profile);
  const fieldStatus = getProfileFieldsStatus(profile);

  const statusOptions = [
    { value: 'DOCUMENTS_VALIDATION', label: t('common.status.documents_validation') },
    { value: 'PENDING_COMPLETION', label: t('common.status.pending_completion') },
    { value: 'VALIDATED', label: t('common.status.validated') },
    { value: 'REJECTED', label: t('common.status.rejected') },
  ];

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validateRegistrationRequest({
        requestId: request.id,
        profileId: profile.id,
        status: selectedStatus,
        notes: validationNotes,
      });

      if (result.error) {
        toast({
          title: t('admin.registrations.review.validation.error.title'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('admin.registrations.review.validation.success.title'),
        description: t('admin.registrations.review.validation.success.description'),
        variant: 'success',
      });

      // Fermer le dialogue et rediriger
      setValidationStatus(null);
      router.push(ROUTES.dashboard.service_request_review(request.id));
    } catch (error) {
      toast({
        title: t('admin.registrations.review.validation.error.title'),
        description:
          t('admin.registrations.review.validation.error.unknown') + `: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const ValidationDialog = React.memo(
    ({
      isOpen,
      onClose,
      onConfirm,
      status,
      isLoading,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: (notes: string) => void;
      status: RequestStatus;
      isLoading: boolean;
    }) => {
      const [notes, setNotes] = useState('');
      const t = useTranslations('admin.registrations.review');

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {status === RequestStatus.VALIDATED
                  ? t('validation.title')
                  : t('rejection.title')}
              </DialogTitle>
              <DialogDescription>
                {status === RequestStatus.VALIDATED
                  ? t('validation.description')
                  : t('rejection.description')}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder={t('validation.notes_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                {t('validation.cancel')}
              </Button>
              <Button
                variant={status === RequestStatus.VALIDATED ? 'default' : 'destructive'}
                onClick={() => onConfirm(notes)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {status === RequestStatus.VALIDATED
                  ? t('validation.validate')
                  : t('validation.reject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  );
  ValidationDialog.displayName = 'ValidationDialog';

  return (
    <div className="space-y-6">
      {/* En-tête avec statut et actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center gap-2">
                <ProfileStatusBadge status={request.status} />
                <span className="text-sm text-muted-foreground">
                  {t('admin.registrations.review.submitted_on')}:{' '}
                  {formatDate(request.createdAt ?? '')}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant={
                  profile.status === RequestStatus.REJECTED ? 'default' : 'destructive'
                }
                onClick={() => setValidationStatus(RequestStatus.REJECTED)}
                disabled={isLoading}
              >
                {t('admin.registrations.actions.reject')}
              </Button>
              <Button
                variant={
                  profile.status === RequestStatus.VALIDATED ? 'default' : 'success'
                }
                onClick={() => setValidationStatus(RequestStatus.VALIDATED)}
                disabled={isLoading}
              >
                {t('admin.registrations.actions.validate')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ValidationDialog
        isOpen={!!validationStatus}
        onClose={() => setValidationStatus(null)}
        onConfirm={handleValidation}
        status={validationStatus!}
        isLoading={isLoading}
      />

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">
                {t('admin.registrations.review.tabs.basic')}
              </TabsTrigger>
              <TabsTrigger value="documents">
                {t('admin.registrations.review.tabs.documents')}
              </TabsTrigger>
              <TabsTrigger value="contact">
                {t('admin.registrations.review.tabs.contact')}
              </TabsTrigger>
              <TabsTrigger value="family">
                {t('admin.registrations.review.tabs.family')}
              </TabsTrigger>
              <TabsTrigger value="professional">
                {t('admin.registrations.review.tabs.professional')}
              </TabsTrigger>
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
        <div className="space-y-4 w-80">
          <ProfileCompletion completionRate={completionRate} fieldStatus={fieldStatus} />
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.registrations.review.validation.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('admin.registrations.review.validation.status')}</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as RequestStatus)}
                >
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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
                  placeholder={t(
                    'admin.registrations.review.validation.notes_placeholder',
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <ProfileNotes profileId={profile.id} notes={profile.notes} />
          <Button onClick={handleValidation} disabled={isValidating} className="w-full">
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('admin.registrations.review.validation.processing')}
              </>
            ) : (
              t('admin.registrations.review.validation.submit')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
