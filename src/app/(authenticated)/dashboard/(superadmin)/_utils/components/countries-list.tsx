'use client';

import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DataTable } from '@/components/data-table/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Pencil, Trash, Edit } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { deleteCountry } from '@/actions/countries';
import { EditCountryDialog } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/edit-country-dialog';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { tryCatch } from '@/lib/utils';
import { useCountries } from '@/hooks/use-countries';
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import type { CountryListItem } from '@/server/api/routers/countries/types';
import type { Country, CountryMetadata } from '@/types/country';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateCountry } from '@/actions/countries';
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Fonction pour convertir CountryListItem en Country
function countryListItemToCountry(item: CountryListItem): Country {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    status: item.status,
    flag: null,
    metadata: item.metadata
      ? ((typeof item.metadata === 'string'
          ? JSON.parse(item.metadata)
          : item.metadata) as CountryMetadata)
      : null,
    _count: item._count,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// Types pour les filtres de pays
interface CountryFilters {
  search?: string;
  status?: Array<'ACTIVE' | 'INACTIVE'>;
}

// Function to adapt search parameters for countries
function adaptSearchParams(searchParams: URLSearchParams): CountryFilters {
  return {
    status: searchParams.get('status')?.split(',').filter(Boolean) as
      | Array<'ACTIVE' | 'INACTIVE'>
      | undefined,
    search: searchParams.get('search') || undefined,
  };
}

export function CountriesList() {
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handleSortingChange,
    handlePaginationChange,
  } = useTableSearchParams<CountryListItem, CountryFilters>(adaptSearchParams);

  const t = useTranslations('sa.countries');
  const t_common = useTranslations('common');
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [country, setCountry] = useState<CountryListItem | null>(null);

  const { countries, total, isLoading, refetch } = useCountries({
    ...params,
    page: pagination.page,
    limit: pagination.limit,
  });

  const handleDelete = async (country: CountryListItem) => {
    const result = await tryCatch(deleteCountry(country.id));

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
      refetch();
    }
  };

  const columns = useMemo<ColumnDef<CountryListItem>[]>(
    () => [
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
          <DataTableColumnHeader
            column={column}
            title={t('table.code')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'code' as keyof CountryListItem,
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => <div>{row.getValue('code')}</div>,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.name')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'name' as keyof CountryListItem,
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
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
          <DataTableColumnHeader
            column={column}
            title={t('table.status')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'status' as keyof CountryListItem,
                order: direction,
              })
            }
            labels={{
              asc: 'A-Z',
              desc: 'Z-A',
            }}
          />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as 'ACTIVE' | 'INACTIVE';

          if (!status) {
            return null;
          }

          return (
            <Badge variant={status === 'ACTIVE' ? 'default' : 'warning'}>
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
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.organizationsCount')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: '_count' as keyof CountryListItem,
                order: direction,
              })
            }
          />
        ),
      },
      {
        accessorKey: '_count.users',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('table.usersCount')}
            sortHandler={(direction) =>
              handleSortingChange({
                field: '_count' as keyof CountryListItem,
                order: direction,
              })
            }
          />
        ),
      },
      {
        id: 'actions',
        header: ({ table }) => (
          <DataTableBulkActions
            table={table}
            actions={[
              {
                component: (
                  <StatusChangeForm
                    selectedRows={table
                      .getFilteredSelectedRowModel()
                      .flatRows.map((row) => row.original)}
                    onSuccess={() => {
                      refetch();
                    }}
                  />
                ),
              },
            ]}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  className={
                    buttonVariants({ variant: 'ghost', size: 'icon' }) +
                    ' aspect-square p-0'
                  }
                  onClick={(e) => e.stopPropagation()}
                  href={ROUTES.sa.edit_country(row.original.id)}
                >
                  <Pencil className="size-icon" />
                  <span className="sr-only">{t_common('actions.edit')}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <span>{t_common('actions.edit')}</span>
              </TooltipContent>
            </Tooltip>

            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="aspect-square p-0">
                      <Edit className="size-icon" />
                      <span className="sr-only">Modification rapide</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Modification rapide</span>
                </TooltipContent>
              </Tooltip>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Modification rapide</DialogTitle>
                </DialogHeader>
                <QuickEditForm country={row.original} onSuccess={() => refetch()} />
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="aspect-square p-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    setCountry(row.original);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash className="size-icon" />
                  <span className="sr-only">{t_common('actions.delete')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>{t_common('actions.delete')}</span>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, t_common, handleSortingChange],
  );

  // Définition des filtres
  const filters = useMemo<FilterOption<CountryListItem>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('table.name'),
        defaultValue: params.search || '',
        onChange: (value: string) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('table.status'),
        options: [
          { value: 'ACTIVE', label: t('form.status.options.active') },
          { value: 'INACTIVE', label: t('form.status.options.inactive') },
        ],
        defaultValue: params.status || ['ACTIVE'],
        onChange: (value: string[]) => {
          if (Array.isArray(value)) {
            handleParamsChange('status', value as Array<'ACTIVE' | 'INACTIVE'>);
          }
        },
      },
    ],
    [t, params, handleParamsChange],
  );

  // Calcul des statistiques
  const stats = useMemo(() => {
    const activeCountries = countries.filter(
      (country) => country.status === 'ACTIVE',
    ).length;
    const inactiveCountries = countries.filter(
      (country) => country.status === 'INACTIVE',
    ).length;

    return {
      totalCountries: total,
      activeCountries,
      inactiveCountries,
    };
  }, [countries, total]);

  return (
    <>
      {stats && (
        <div className="mb-4 text-sm text-muted-foreground">
          {stats.totalCountries} pays total • {stats.activeCountries} actifs •{' '}
          {stats.inactiveCountries} inactifs
        </div>
      )}
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={countries}
        filters={filters}
        totalCount={total}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        onRefresh={refetch}
        activeSorting={[sorting.field, sorting.order]}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => handleDelete(country as CountryListItem)}
        title={t('dialogs.delete.title')}
        description={t('dialogs.delete.description')}
        variant={'destructive'}
      />

      {country && (
        <EditCountryDialog
          country={countryListItemToCountry(country)}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </>
  );
}

// Schema pour la modification rapide de pays
const quickEditSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  code: z
    .string()
    .min(2, 'Le code pays doit contenir exactement 2 caractères')
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type QuickEditFormData = z.infer<typeof quickEditSchema>;

type QuickEditFormProps = {
  country: CountryListItem;
  onSuccess: () => void;
};

function QuickEditForm({ country, onSuccess }: QuickEditFormProps) {
  const t = useTranslations('sa.countries');
  const t_common = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickEditFormData>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      name: country.name || '',
      code: country.code || '',
      status: country.status,
    },
  });

  const onSubmit = async (data: QuickEditFormData) => {
    setIsSubmitting(true);
    try {
      const result = await tryCatch(
        updateCountry({
          id: country.id,
          name: data.name || country.name,
          code: data.code || country.code,
          status: data.status,
        }),
      );

      if (result.error) {
        toast.error(t('messages.error.update'));
        console.error(result.error);
        return;
      }

      toast.success(t('messages.updateSuccess'));
      onSuccess();
    } catch (error) {
      toast.error(t('messages.error.update'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.name.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.name.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.code.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('form.code.placeholder')}
                  {...field}
                  style={{ textTransform: 'uppercase' }}
                  maxLength={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.status.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {t('form.status.options.active')}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {t('form.status.options.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              {t_common('actions.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t_common('actions.saving') : t_common('actions.save')}
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}

// Schema pour le changement de statut en masse
const statusChangeSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type StatusChangeFormData = z.infer<typeof statusChangeSchema>;

type StatusChangeFormProps = {
  selectedRows: CountryListItem[];
  onSuccess: () => void;
};

function StatusChangeForm({ selectedRows, onSuccess }: StatusChangeFormProps) {
  const t = useTranslations('sa.countries');
  const t_common = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StatusChangeFormData>({
    resolver: zodResolver(statusChangeSchema),
  });

  const onSubmit = async (data: StatusChangeFormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedRows.length) return;

      const updatePromises = selectedRows.map(async (row) => {
        return tryCatch(
          updateCountry({
            id: row.id,
            name: row.name,
            code: row.code,
            status: data.status,
          }),
        );
      });

      await Promise.all(updatePromises);

      toast.success(`${selectedRows.length} pays mis à jour avec succès`);
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast.error(t('messages.error.update'));
      console.error('Error updating countries:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" aria-label="Changer le statut" className="justify-start">
          Changer le statut
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <SheetTitle>Changer le statut</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.status.label')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.status.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        {t('form.status.options.active')}
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        {t('form.status.options.inactive')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                {t_common('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? t_common('actions.saving') : t_common('actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
