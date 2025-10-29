'use client';

import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/lib/permissions/utils';
import { UserRole } from '@/convex/lib/constants';
import { Edit, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface EditableSectionProps {
  children: React.ReactNode;
  previewContent?: React.ReactNode;
  onSave?: () => Promise<void>;
  isLoading?: boolean;
  allowEdit?: boolean;
  id?: string;
  defaultEditing?: boolean;
}

export function EditableSection({
  children,
  previewContent,
  onSave,
  isLoading = false,
  allowEdit = true,
  id,
  defaultEditing = false,
}: EditableSectionProps) {
  const t = useTranslations('profile.actions');
  const [isEditing, setIsEditing] = useState(defaultEditing);

  const handleSave = async () => {
    if (onSave) {
      await onSave();
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-4" id={id}>
      {isEditing ? (
        <>
          {children}
          {allowEdit && (
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handleSave}
                className="h-10 px-4"
                leftIcon={<Save className="size-4" />}
                loading={isLoading}
              >
                {t('save')}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-10 px-4"
                leftIcon={<X className="size-4" />}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {previewContent || children}
          {allowEdit && (
            <RoleGuard
              roles={[
                UserRole.ADMIN,
                UserRole.SUPER_ADMIN,
                UserRole.MANAGER,
                UserRole.AGENT,
              ]}
            >
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="h-10 px-4"
                  leftIcon={<Edit className="size-4" />}
                >
                  {t('edit')}
                </Button>
              </div>
            </RoleGuard>
          )}
        </>
      )}
    </div>
  );
}
