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

import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/convex/_generated/api';

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

  const submitProfileMutation = useMutation(api.profile.submitProfileForValidation);

  const handleSubmit = async () => {
    try {
      await submitProfileMutation({
        profileId: profileId as any,
        isChild,
      });

      toast({
        title: 'Profil soumis',
        description: 'Votre profil a été soumis pour validation avec succès',
        variant: 'default',
      });

      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission du profil',
        variant: 'destructive',
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
        disabled={!canSubmit}
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
              disabled={submitProfileMutation.isPending}
            >
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitProfileMutation.isPending}>
              {submitProfileMutation.isPending ? 'Soumission...' : t('dialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canSubmit && (
        <p className="text-sm py-2 text-center text-muted-foreground">
          {t('dialog.description')}
        </p>
      )}

      {!canSubmit && (
        <p className="text-sm py-2 text-center text-muted-foreground">
          {t('dialog.disabled')}
        </p>
      )}
    </div>
  );
}
