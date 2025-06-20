// src/components/appointments/appointment-actions.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { Calendar, X } from 'lucide-react';

interface AppointmentActionsProps {
  appointmentId: string;
  onReschedule: () => void;
  onCancel: () => void;
}

export function AppointmentActions({ onReschedule, onCancel }: AppointmentActionsProps) {
  const t = useTranslations('appointments');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="mobile"
        onClick={onReschedule}
        leftIcon={<Calendar />}
      >
        {t('actions.reschedule')}
      </Button>

      <Button
        variant="destructive"
        size="mobile"
        onClick={() => setShowCancelDialog(true)}
        leftIcon={<X />}
      >
        {t('actions.cancel')}
      </Button>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancel.title')}</DialogTitle>
            <DialogDescription>{t('cancel.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t('cancel.back')}
            </Button>
            <Button
              variant="destructive"
              weight="medium"
              onClick={() => {
                onCancel();
                setShowCancelDialog(false);
              }}
            >
              {t('cancel.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
