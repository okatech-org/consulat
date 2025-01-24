'use client';

import { Badge } from '@/components/ui/badge';
import React from 'react';
import { useTranslations } from 'next-intl';

export default function MissingBadge({
  isMissing = false,
  label,
  customClasses,
}: {
  isMissing: boolean;
  label?: string;
  customClasses?: string;
}) {
  const t = useTranslations('common.labels');
  return (
    <>
      {isMissing && (
        <div className={`inline-flex min-w-max items-center gap-2 ${customClasses}`}>
          <span className={'font-medium'}>{label}</span>
          <Badge variant={'warning'}>{t('to_complete')}</Badge>
        </div>
      )}
    </>
  );
}
