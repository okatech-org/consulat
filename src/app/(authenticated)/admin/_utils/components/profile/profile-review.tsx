'use client';

import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
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
import { RequestStatus } from '@prisma/client';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/schemas/routes';
import { ProfileNotes } from '@/app/(authenticated)/admin/_utils/components/profile/profile-notes';
import { ProfileStatusBadge } from '@/app/(authenticated)/user/profile/_utils/components/profile-status-badge';
import { RegistrationRequestDetails } from '@/types/consular-service';
import {
  calculateProfileCompletion,
  formatDefaultDate,
  getProfileFieldsStatus,
} from '@/lib/utils';
import { ProfileCompletion } from '@/app/(authenticated)/user/profile/_utils/components/profile-completion';
import { validateRegistrationRequest } from '@/actions/registrations';

interface ProfileReviewProps {
  request: RegistrationRequestDetails;
}

export function ProfileReview({ request }: ProfileReviewProps) {
  const t = useTranslations('admin.registrations.review');
  const profile = request?.submittedBy?.profile;
  const user = request.submittedBy;

  if (!profile || !user) {
    return null;
  }

  const completionRate = calculateProfileCompletion(profile);
  const fieldStatus = getProfileFieldsStatus(profile);

  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<RequestStatus | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleValidation = async (notes: string) => {
    try {
      setIsLoading(true);

      const result = await validateRegistrationRequest({
        requestId: request.id,
        profileId: profile.id,
        status: validationStatus!,
        notes,
      });

      if (result.error) {
        toast({
          title: t('validation.error.title'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('validation.success.title'),
        description: t('validation.success.description'),
        variant: 'success',
      });

      // Fermer le dialogue et rediriger
      setValidationStatus(null);
      router.push(ROUTES.admin.registrations);
    } catch (error) {
      toast({
        title: t('validation.error.title'),
        description: t('validation.error.unknown') + `: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
                  {t('submitted_on')}: {formatDefaultDate(request.createdAt)}
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
                {t('validation.reject')}
              </Button>
              <Button
                variant={
                  profile.status === RequestStatus.VALIDATED ? 'default' : 'success'
                }
                onClick={() => setValidationStatus(RequestStatus.VALIDATED)}
                disabled={isLoading}
              >
                {t('validation.validate')}
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
              <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
              <TabsTrigger value="documents">{t('tabs.documents')}</TabsTrigger>
              <TabsTrigger value="contact">{t('tabs.contact')}</TabsTrigger>
              <TabsTrigger value="family">{t('tabs.family')}</TabsTrigger>
              <TabsTrigger value="professional">{t('tabs.professional')}</TabsTrigger>
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
        <div className="space-y-4">
          <ProfileCompletion completionRate={completionRate} fieldStatus={fieldStatus} />
          <ProfileNotes profileId={profile.id} notes={profile.notes} />
        </div>
      </div>
    </div>
  );
}
