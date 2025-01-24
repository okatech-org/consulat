import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface ConsulateScheduleProps {
  schedule: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }[];
}

export function ScheduleDisplay({ schedule }: ConsulateScheduleProps) {
  const t = useTranslations('consular.services.form.schedule');

  const days = [
    t('days.monday'),
    t('days.tuesday'),
    t('days.wednesday'),
    t('days.thursday'),
    t('days.friday'),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {days.map((day, index) => {
            const daySchedule = schedule.find((s) => s.dayOfWeek === index);
            return (
              <div key={day} className="flex items-center justify-between border-b py-2">
                <span className="font-medium">{day}</span>
                <span>
                  {daySchedule?.isOpen
                    ? `${daySchedule.openTime} - ${daySchedule.closeTime}`
                    : t('closed')}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
