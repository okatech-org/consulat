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
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DocumentStatus } from '@/convex/lib/constants';
import type { Id } from '@/convex/_generated/dataModel';

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
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DocumentStatus>(DocumentStatus.Pending);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateDocumentMutation = useMutation(api.functions.document.validateDocument);

  const handleSubmit = async (status: DocumentStatus) => {
    try {
      setIsSubmitting(true);
      setStatus(status);

      await validateDocumentMutation({
        documentId: documentId as Id<'documents'>,
        validatorId: '' as Id<'users'>,
        status: status as string,
        comments: notes.trim() || undefined,
      });

      toast.success(t('validation.success.description'));
      onValidated();
      onClose();
    } catch (error) {
      toast.error(t('validation.error.description'));
      console.error('Error validating document:', error);
    } finally {
      setIsSubmitting(false);
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
            onClick={() => handleSubmit(DocumentStatus.Rejected)}
            loading={isSubmitting && status === DocumentStatus.Rejected}
          >
            {t('validation.reject')}
          </Button>
          <Button
            variant="success"
            onClick={() => handleSubmit(DocumentStatus.Validated)}
            loading={isSubmitting && status === DocumentStatus.Validated}
          >
            {t('validation.validate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
