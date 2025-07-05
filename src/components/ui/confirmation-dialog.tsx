'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ConfirmationDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}

export function ConfirmationDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  onConfirm,
  disabled = false,
}: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const t = useTranslations('common');

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            {cancelLabel || t('actions.cancel')}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={isPending}
            disabled={disabled}
          >
            {confirmLabel || t('actions.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
