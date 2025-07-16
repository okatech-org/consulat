'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';

export function EmptyState() {
  const t = useTranslations('dashboard.unified.empty_state');
  return (
    <Card className="border-2 border-dashed border-border">
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">{t('title')}</h3>
        <p className="text-muted-foreground mb-6">{t('description')}</p>

        <Button asChild>
          <Link href={ROUTES.user.services}>
            <Plus className="size-icon" />
            {t('create_first')}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
