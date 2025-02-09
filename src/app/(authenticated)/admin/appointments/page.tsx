import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function AppointmentsPage() {
  const t = useTranslations('admin.appointments');

  return (
    <div className="container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('upcoming')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-60 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-muted-foreground">{t('coming_soon')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('calendar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg bg-muted/50 p-6">
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">{t('calendar_placeholder')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 