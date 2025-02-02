'use client';

import { useTranslations } from 'next-intl';
import { ListChecks, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProceduresSectionProps {
  stats: unknown;
  onAction: (action: string) => void;
}

export function ProceduresSection({ stats, onAction }: ProceduresSectionProps) {
  const t = useTranslations('profile.dashboard.sections.procedures');

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="size-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques des procédures */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-xs text-muted-foreground">{t('status.active')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">{t('status.completed')}</div>
          </div>
        </div>

        {/* Prochaine étape */}
        {stats.nextStep && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('next_step')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('view_procedure')}
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {stats.nextStep.description}
            </p>
            {stats.nextStep.deadline && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t('deadline')}: {new Date(stats.nextStep.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
