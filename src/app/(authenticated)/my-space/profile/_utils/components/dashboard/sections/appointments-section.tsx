'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppointmentsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any['appointments'];
  onAction?: (action: string) => void;
}

export function AppointmentsSection({ stats, onAction }: AppointmentsSectionProps) {
  const t = useTranslations('profile.dashboard.sections.appointments');
  const t_common = useTranslations('common');

  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="size-5" />
            {t('title')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction?.('schedule_appointment')}
          >
            <Plus className="size-4 md:mr-2" />
            <span className="hidden md:inline">{t('actions.schedule')}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prochain rendez-vous */}
        {stats.upcoming ? (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t('next_appointment')}</h4>
              <Badge variant={stats.upcoming.status as BadgeVariant}>
                {t_common(`status.${stats.upcoming.status}`)}
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span>
                  {format(new Date(stats.upcoming.date), "PPP 'à' HH'h'mm", {
                    locale: fr,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{t(`type.${stats.upcoming.type.toLowerCase()}`)}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction?.('reschedule_appointment')}
                className="flex-1 md:flex-none"
              >
                {t('actions.reschedule')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction?.('cancel_appointment')}
                className="flex-1 md:flex-none"
              >
                {t('actions.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('no_upcoming')}</p>
            <Button
              className="mt-2"
              size="sm"
              onClick={() => onAction?.('schedule_appointment')}
            >
              {t('actions.schedule')}
            </Button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.past}</div>
            <div className="text-xs text-muted-foreground">{t('stats.past')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">{t('stats.cancelled')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
