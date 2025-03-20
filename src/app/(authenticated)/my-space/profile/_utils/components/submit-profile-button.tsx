'use client';

import { useState } from 'react';
import { MessageKeys, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { submitProfileForValidation } from '@/actions/profile';
import { useRouter } from 'next/navigation';
import { tryCatch } from '@/lib/utils';

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
  const tError = useTranslations('messages.errors');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const { error, data } = await tryCatch(
      submitProfileForValidation(profileId, isChild),
    );

    if (error) {
      toast({
        title: t('error.title'),
        description: tError(error.message),
        variant: 'destructive',
      });

      setIsDialogOpen(false);
    }

    if (data) {
      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: 'success',
      });

      setIsDialogOpen(false);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="gap-2"
        variant="default"
        disabled={!canSubmit}
      >
        <SendHorizonal className="size-4" />
        {t('submit_button')}
      </Button>

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
              disabled={isSubmitting}
            >
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t('dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
