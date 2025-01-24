'use client';

import { Organization } from '@/types/organization';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash, Ban, CheckCircle } from 'lucide-react';
import { useOrganizationDialog } from '@/app/(authenticated)/superadmin/_utils/hooks/use-organization-dialog';
import { useOrganizationActions } from '@/app/(authenticated)/superadmin/_utils/hooks/use-organization-actions';
export function OrganizationActions({ organization }: { organization: Organization }) {
  const t = useTranslations('superadmin.organizations');
  const { openEditDialog } = useOrganizationDialog();
  const { handleDelete, handleStatusChange, isLoading } = useOrganizationActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openEditDialog(organization)}>
          <Pencil className="mr-2 size-4" />
          {t('actions.edit')}
        </DropdownMenuItem>

        {organization.status === 'ACTIVE' ? (
          <DropdownMenuItem
            onClick={() => handleStatusChange(organization.id, 'SUSPENDED')}
            disabled={isLoading}
          >
            <Ban className="mr-2 size-4" />
            {t('actions.suspend')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleStatusChange(organization.id, 'ACTIVE')}
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 size-4" />
            {t('actions.activate')}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => handleDelete(organization.id)}
          className="text-destructive"
          disabled={isLoading}
        >
          <Trash className="mr-2 size-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
