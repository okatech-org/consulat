'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DocumentStatus } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';

import { validateDocument } from '@/actions/documents';
import { tryCatch } from '@/lib/utils';

interface DocumentValidationDialogProps {
  documentId: string;
  documentType: string;
  isOpen: boolean;
  onClose: () => void;
  onValidated: () => void;
}

export function DocumentValidationDialog({
  documentId,
  documentType,
  isOpen,
  onClose,
  onValidated,
}: DocumentValidationDialogProps) {
  const t = useTranslations('admin.registrations.review.documents');
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DocumentStatus>(DocumentStatus.PENDING);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (status: DocumentStatus) => {
    const result = await tryCatch(
      validateDocument({ documentId, status, notes: notes.trim() || undefined }),
    );

    if (result.error) {
      toast({
        title: t('validation.error.title'),
        description: t('validation.error.description'),
        variant: 'destructive',
      });
    } else {
      setIsSubmitting(true);
      setStatus(status);

      toast({
        title: t('validation.success.title'),
        description: t('validation.success.description'),
        variant: 'success',
      });

      onValidated();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('validation.title', { type: documentType })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder={t('validation.notes_placeholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('validation.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleSubmit(DocumentStatus.REJECTED)}
            loading={isSubmitting && status === DocumentStatus.REJECTED}
          >
            {t('validation.reject')}
          </Button>
          <Button
            variant="success"
            onClick={() => handleSubmit(DocumentStatus.VALIDATED)}
            loading={isSubmitting && status === DocumentStatus.VALIDATED}
          >
            {t('validation.validate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
