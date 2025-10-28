'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link, SendHorizonal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { CompleteProfile } from '@/convex/lib/types';
import { calculateProfileCompletion } from '@/lib/utils';
import { ROUTES } from '@/schemas/routes';

interface SubmitProfileButtonProps {
  profile: CompleteProfile;
}

export function SubmitProfileButton({ profile }: SubmitProfileButtonProps) {
  if (!profile) return null;
  const t = useTranslations('profile.submission');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const completion = calculateProfileCompletion(profile);

  const submitProfileMutation = useMutation(
    api.functions.profile.submitProfileForValidation,
  );

  const handleSubmit = async () => {
    try {
      await submitProfileMutation({
        profileId: profile._id,
      });

      toast.success('Profil soumis', {
        description: 'Votre profil a été soumis pour validation avec succès',
      });

      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la soumission du profil',
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="w-full md:w-max"
        variant="default"
        disabled={!completion.canSubmit}
        size="default"
        rightIcon={<SendHorizonal className="size-4" />}
      >
        {t('submit_button')}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleSubmit}>{t('dialog.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {completion.canSubmit && (
        <p className="text-sm py-2 text-center text-muted-foreground">
          {t('dialog.description')}
        </p>
      )}

      {!completion.canSubmit && (
        <>
          <p className="text-sm py-2 text-center text-muted-foreground">
            {t('dialog.disabled')}
          </p>
          {profile.registrationRequest?._id && (
            <Button variant="outline" asChild>
              <Link
                href={ROUTES.user.service_request_details(
                  profile.registrationRequest._id,
                )}
              >
                Voir ma demande
              </Link>
            </Button>
          )}
        </>
      )}
    </div>
  );
}
