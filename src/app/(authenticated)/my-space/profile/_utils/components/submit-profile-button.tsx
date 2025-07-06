'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useSubmitProfile } from '@/hooks/use-profile';
import { useRouter } from 'next/navigation';

// Définir les items de la checklist de manière statique
const CHECKLIST_ITEMS = [
  'personal_info',
  'documents',
  'contact_info',
  'emergency_contact',
] as const;

interface SubmitProfileButtonProps {
  profileId: string;
  canSubmit: boolean;
  isChild?: boolean;
}

export function SubmitProfileButton({
  profileId,
  canSubmit,
  isChild = false,
}: SubmitProfileButtonProps) {
  const t = useTranslations('profile.submission');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const submitProfile = useSubmitProfile();

  const handleSubmit = async () => {
    try {
      await submitProfile.mutateAsync({
        profileId,
        isChild,
      });

      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      // L'erreur est déjà gérée par le hook useSubmitProfile
      console.error('Error submitting profile:', error);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="w-full md:w-max"
        variant="default"
        disabled={!canSubmit}
        size="lg"
        rightIcon={<SendHorizonal className="size-4" />}
      >
        {t('submit_button')}
      </Button>
      {!canSubmit && (
        <p className="text-sm py-2 text-center text-muted-foreground">
          {t('dialog.description')}
        </p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">{t('dialog.checklist.title')}</h4>
              <ul className="space-y-2 text-sm">
                {CHECKLIST_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary" />
                    {t(`dialog.checklist.items.${item}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitProfile.isPending}
            >
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleSubmit} loading={submitProfile.isPending}>
              {t('dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
