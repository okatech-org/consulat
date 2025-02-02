'use client';

import { useTranslations } from 'next-intl';
import { FileText, Plus, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
  onAction?: (action: string) => void;
}

export function RequestsSection({ stats, onAction }: RequestsSectionProps) {
  const t = useTranslations('profile.dashboard.sections.requests');

  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="size-5" />
            {t('title')}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onAction?.('new_request')}>
            <Plus className="size-4 md:mr-2" />
            <span className="hidden md:inline">{t('actions.new')}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats en grille */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border p-2 text-center">
            <div className="text-xl font-bold">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">{t('status.pending')}</div>
          </div>
          <div className="rounded-lg border p-2 text-center">
            <div className="text-xl font-bold">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">{t('status.in_progress')}</div>
          </div>
          <div className="rounded-lg border p-2 text-center md:col-span-2">
            <div className="text-xl font-bold">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">{t('status.completed')}</div>
          </div>
        </div>

        {/* Dernière demande */}
        {stats.latestRequest ? (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('latest_request')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction?.('view_request')}
                className="size-8 p-0 md:h-9 md:w-auto md:px-3"
              >
                <ArrowRight className="size-4 md:mr-2" />
                <span className="hidden md:inline">{t('actions.view')}</span>
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t(`request_types.${stats.latestRequest.type}`)}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('no_requests')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
