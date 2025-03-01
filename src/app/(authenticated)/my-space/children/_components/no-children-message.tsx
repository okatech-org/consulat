import { useTranslations } from 'next-intl';
import { Baby } from 'lucide-react';

export function NoChildrenMessage() {
  const t = useTranslations('user.children');

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Baby className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t('no_children')}</h3>
      <p className="text-muted-foreground max-w-md">
        Créez un profil pour vos enfants mineurs pour effectuer des démarches en leur nom
      </p>
    </div>
  );
}
