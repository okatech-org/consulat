import { useTranslations } from 'next-intl';
import { Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NoChildrenMessageProps = {
  onAddChild: () => void;
};

export function NoChildrenMessage({ onAddChild }: NoChildrenMessageProps) {
  const t = useTranslations('user.children');

  return (
    <div className="py-12 flex flex-col items-center text-center">
      <Baby className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{t('no_children')}</h3>
      <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
        {t('no_children_message')}
      </p>
      <Button onClick={onAddChild}>{t('add_child')}</Button>
    </div>
  );
}
