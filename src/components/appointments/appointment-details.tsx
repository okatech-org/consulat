import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppointmentDetailsProps {
  date: Date;
  time: string;
  duration: number;
  location?: string;
  type?: string;
}

export function AppointmentDetails({
  date,
  time,
  duration,
  location,
  type,
}: AppointmentDetailsProps) {
  const t = useTranslations('consular.services.form.appointment');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('appointment_details')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span>{format(date, 'EEEE d MMMM yyyy', { locale: fr })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <span>
            {time} ({duration} {t('appointment_duration')})
          </span>
        </div>

        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        )}

        {type && (
          <div className="mt-4 text-sm text-muted-foreground">
            <span className={'font-semibold'}>{t('type.reason')} :</span>{' '}
            {t(`type.${type.toLowerCase()}`)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
