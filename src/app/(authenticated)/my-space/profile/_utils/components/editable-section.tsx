'use client';

import { Button } from '@/components/ui/button';
import { Pencil, X, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { RequestStatus } from '@prisma/client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SessionUser } from '@/types';
import { hasAnyRole } from '@/lib/permissions/utils';

interface EditableSectionProps {
  title: string;
  children: React.ReactNode;
  onSave?: () => Promise<void>;
  isEditing: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  className?: string;
  isLoading?: boolean;
  profileStatus?: RequestStatus;
}

export function EditableSection({
  title,
  children,
  onSave,
  isEditing,
  onEdit,
  onCancel,
  className,
  isLoading = false,
  profileStatus = 'DRAFT',
}: EditableSectionProps) {
  const currentUser = useCurrentUser();
  const isAdmin = hasAnyRole(currentUser as SessionUser, [
    'ADMIN',
    'SUPER_ADMIN',
    'AGENT',
  ]);
  const t = useTranslations('profile');

  const canEdit =
    isAdmin || ['DRAFT', 'REJECTED', 'EDITED', 'SUBMITTED'].includes(profileStatus);

  return (
    <div className={cn('relative', className)}>
      <div className="flex pb-4 mb-4 sm:mb-6 border-b border-border items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        {onEdit && canEdit && (
          <>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-2">
                <Pencil className="size-4" />
                <span className="hidden md:inline">{t('actions.edit')}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-8 px-2"
                  disabled={isLoading}
                >
                  <X className="size-4" />
                  <span className="hidden md:inline">{t('actions.cancel')}</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSave}
                  className="h-8 px-2"
                  disabled={isLoading}
                >
                  <Save className="size-4" />
                  <span className="hidden md:inline">{t('actions.save')}</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {children}
    </div>
  );
}
