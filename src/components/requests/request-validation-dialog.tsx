// src/components/actions/requests/request-validation-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (status: 'APPROVED' | 'REJECTED', notes: string) => Promise<void>;
  isLoading?: boolean;
}

export function RequestValidationDialog({
  isOpen,
  onClose,
  onValidate,
  isLoading,
}: ValidationDialogProps) {
  const t = useTranslations('admin.requests');
  const [notes, setNotes] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('validation.title')}</DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder={t('validation.notes_placeholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onValidate('REJECTED', notes)}
            disabled={isLoading}
          >
            {t('actions.reject')}
          </Button>
          <Button onClick={() => onValidate('APPROVED', notes)} disabled={isLoading}>
            {t('actions.approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
