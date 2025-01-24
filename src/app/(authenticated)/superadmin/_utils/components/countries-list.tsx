'use client';

import { useTranslations } from 'next-intl';
import { Country } from '@/types/country';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import * as React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Pencil, Trash } from 'lucide-react';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { deleteCountry } from '@/actions/countries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditCountryDialog } from '@/app/(authenticated)/superadmin/_utils/components/edit-country-dialog';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface CountriesListProps {
  countries: Country[];
  isLoading?: boolean;
}

export function CountriesList({ countries }: CountriesListProps) {
  const t = useTranslations('superadmin.countries');
  const t_common = useTranslations('common');
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);

  const handleDelete = async (country: Country) => {
    setIsDeleting(true);
    const result = await deleteCountry(country.id);

    if (result.error) {
      toast({
        title: t('messages.error.delete'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('messages.deleteSuccess'),
      });
      setShowDeleteDialog(false);
    }
    setIsDeleting(false);
  };

  const columns: ColumnDef<Country>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.code')} />
      ),
      cell: ({ row }) => <div>{row.getValue('code')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.name')} />
      ),
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        const code = row.getValue('code') as string;
        return (
          <div className="flex space-x-2">
            <Image
              src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
              alt={name || ''}
              width={20}
              height={15}
              className="rounded object-contain"
            />
            <span className="max-w-[500px] truncate font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as 'ACTIVE' | 'INACTIVE';

        if (!status) {
          return null;
        }

        return (
          <Badge variant={status === 'ACTIVE' ? 'success' : 'rejected'}>
            {t(`form.status.options.${status.toLowerCase() as 'active' | 'inactive'}`)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: '_count.organizations',
      header: t('table.organizationsCount'),
    },
    {
      accessorKey: '_count.users',
      header: t('table.usersCount'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          actions={[
            {
              component: (
                <Link
                  onClick={(e) => e.stopPropagation()}
                  href={ROUTES.sa.edit_country(row.original.id)}
                >
                  <Pencil className="mr-1 size-4" /> {t_common('actions.edit')}
                </Link>
              ),
            },
            {
              label: (
                <>
                  <Trash className="mr-1 size-4 text-destructive" />
                  <span className="text-destructive"> {t_common('actions.delete')}</span>
                </>
              ),
              onClick: (row) => {
                setCountry(row);
                setShowDeleteDialog(true);
              },
            },
          ]}
          row={row}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={countries}
        filters={[
          {
            type: 'search',
            value: 'name',
            label: t('table.name'),
          },
          {
            type: 'radio',
            value: 'status',
            label: t('table.status'),
            options: [
              { value: 'ACTIVE', label: t('form.status.options.active') },
              { value: 'INACTIVE', label: t('form.status.options.inactive') },
            ],
          },
        ]}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => handleDelete(country as Country)}
        title={t('dialogs.delete.title')}
        description={t('dialogs.delete.description')}
        variant={'destructive'}
      />

      {country && (
        <EditCountryDialog
          country={country}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </>
  );
}
