import React from 'react';
import { useTranslations } from 'next-intl';
import { Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NoChildrenMessage() {
  const t = useTranslations('user.children');

  return (
    <div className="py-12 flex flex-col items-center text-center">
      <Baby className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{t('no_children')}</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
        Créez un profil pour vos enfants mineurs pour effectuer des démarches en leur nom
      </p>
      <Button asChild>
        <Link href="/my-space/children/new">{t('add_child')}</Link>
      </Button>
    </div>
  );
}
