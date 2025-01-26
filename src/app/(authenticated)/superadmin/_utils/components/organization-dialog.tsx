'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { OrganizationForm } from './organization-form';
import { useOrganizationDialog } from '@/app/(authenticated)/superadmin/_utils/hooks/use-organization-dialog';
import { Country } from '@prisma/client';

export function OrganizationDialog({ countries }: { countries: Country[] }) {
  const t = useTranslations('sa.organizations');
  const { isOpen, organization, closeDialog } = useOrganizationDialog();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {organization ? t('dialog.edit_title') : t('dialog.create_title')}
          </DialogTitle>
        </DialogHeader>
        <OrganizationForm
          countries={countries}
          organization={organization}
          onSuccess={closeDialog}
          onCancel={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
