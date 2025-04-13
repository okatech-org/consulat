'use client';

import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EditableSectionProps {
  children: React.ReactNode;
  onSave?: () => Promise<void>;
  isEditing: boolean;
  isLoading?: boolean;
  allowEdit?: boolean;
}

export function EditableSection({
  children,
  onSave,
  isEditing = true,
  isLoading = false,
  allowEdit = true,
}: EditableSectionProps) {
  const t = useTranslations('profile');

  return (
    <div className="flex flex-col gap-4">
      {children}

      {allowEdit && (
        <Button
          variant="default"
          onClick={onSave}
          className="h-8 px-2"
          disabled={isLoading || isEditing}
        >
          <Save className="size-4" />
          <span>{t('actions.save')}</span>
        </Button>
      )}
    </div>
  );
}
