import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { addDays, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

interface AppointmentReminderProps {
  appointmentDate: Date;
  onDismiss?: () => void;
}

export function AppointmentReminder({ appointmentDate }: AppointmentReminderProps) {
  const t = useTranslations('consular.services.form.appointment');
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const now = new Date();
    const threeDaysBefore = addDays(appointmentDate, -3);
    addDays(appointmentDate, -1);
    setShouldShow(now >= threeDaysBefore && now <= appointmentDate);
  }, [appointmentDate]);

  if (!shouldShow) return null;

  return (
    <Card className="bg-primary/10">
      <CardContent className="flex items-center gap-3 p-4">
        <Bell className="size-5 text-primary" />
        <div className="flex-1">
          <p className="font-medium">{t('reminder.title')}</p>
          <p className="text-sm text-muted-foreground">
            {t('reminder.description', {
              time: formatDistanceToNow(appointmentDate, { locale: fr }),
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
