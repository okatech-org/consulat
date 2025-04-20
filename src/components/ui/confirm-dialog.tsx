'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  onConfirm,
  disabled = false,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const t = useTranslations('common.confirm');

  const handleConfirm = async () => {
    try {
      setIsPending(true);
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsPending(false);
    }
  };

  const dialog = (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title || t('delete.title')}</AlertDialogTitle>
        <AlertDialogDescription>
          {description || t('delete.description')}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>
          {cancelLabel || t('cancel')}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={disabled || isPending}
          className={
            variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : ''
          }
        >
          {confirmLabel || t('confirm')}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (open !== undefined && onOpenChange) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {dialog}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      {dialog}
    </AlertDialog>
  );
}
