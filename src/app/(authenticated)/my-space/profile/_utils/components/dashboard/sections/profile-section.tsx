'use client';

import { useTranslations } from 'next-intl';
import { UserCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Key } from 'react';
import { RequestStatus } from '@/convex/lib/constants';

interface ProfileSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
  onAction?: (action: string) => void;
}

export function ProfileSection({ stats, onAction }: ProfileSectionProps) {
  const t = useTranslations('dashboard.sections.profile');
  const t_common = useTranslations('common');
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <UserCircle className="size-5" />
            {t('title')}
          </CardTitle>
          <Badge variant={stats?.status as BadgeVariant}>
            {t_common(`status.${stats?.status as RequestStatus}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Taux de complétion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t('completion')}</span>
            <span>{stats?.completionRate}%</span>
          </div>
          <Progress value={stats?.completionRate} />
        </div>

        {/* Champs manquants - masqués sur mobile si plus de 2 */}
        {stats && stats.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('missing_fields')}</p>
            <ul className="space-y-1">
              {stats.missingFields.slice(0, 2).map((field: Key | null | undefined) => (
                <li
                  key={field}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <AlertCircle className="text-warning size-4" />
                  {t(`fields.${field}`)}
                </li>
              ))}
              {stats.missingFields.length > 2 && (
                <li className="text-sm text-muted-foreground">
                  {t('and_more', { count: stats.missingFields.length - 2 })}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => onAction?.('view_profile')}
          >
            {t('actions.view')}
          </Button>
          <Link
            onClick={() => onAction?.('complete_profile')}
            className={buttonVariants({ variant: 'default', size: 'sm' })}
            href={ROUTES.user.profile}
          >
            {t('actions.complete')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
