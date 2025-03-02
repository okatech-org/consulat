import React from 'react';
import { useTranslations } from 'next-intl';
import { Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export function NoChildrenMessage() {
  const t = useTranslations('user.children');

  return (
    <div className="py-12 flex flex-col items-center text-center">
      <Baby className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{t('no_children')}</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
        {t('no_children_message')}
      </p>
      <Button asChild>
        <Link href={ROUTES.user.new_child}>{t('add_child')}</Link>
      </Button>
    </div>
  );
}
