'use client';

import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { PaginatedProfiles, ProfilesArrayItem } from '@/components/profile/types';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adaptSearchParams } from '@/components/profile/adapters';
import { getProfiles } from '@/components/profile/actions';
import { DataTable } from '@/components/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { ROUTES } from '@/schemas/routes';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { FileText, Edit } from 'lucide-react';
import { RequestStatus, ProfileCategory, Gender } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
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
import { filterUneditedKeys, tryCatch } from '@/lib/utils';
import { toast } from 'sonner';
import { updateProfile } from '@/actions/profile';
import { useTableParams } from '@/components/utils/table-hooks';
import { exportFilesAsZip } from '@/components/utils/table-export';

// Define schema for profile quick edit
const quickEditSchema = z.object({
  cardNumber: z.string().optional(),
  status: z.nativeEnum(RequestStatus),
});

type QuickEditFormData = z.infer<typeof quickEditSchema>;

export default function ProfilesPage() {
  const t = useTranslations();
  const queryParams = useSearchParams();
  const formattedQueryParams = useMemo(
    () => adaptSearchParams(queryParams),
    [queryParams],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PaginatedProfiles>({
    items: [],
    total: 0,
  });

  const { handleParamsChange, handleSortChange, handlePageChange, handleLimitChange } =
    useTableParams();

  const fetchProfiles = useCallback(async () => {
    const params = adaptSearchParams(queryParams);
    setIsLoading(true);
    try {
      const profiles = await getProfiles(params);
      setResults(profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const statuses = useMemo(
    () =>
      Object.values(RequestStatus).map((status) => ({
        value: status,
        label: t(`inputs.requestStatus.options.${status}`),
      })),
    [t],
  );

  const categories = useMemo(
    () =>
      Object.values(ProfileCategory).map((category) => ({
        value: category,
        label: t(`inputs.profileCategory.options.${category}`),
      })),
    [t],
  );

  const genders = useMemo(
    () =>
      Object.values(Gender).map((gender) => ({
        value: gender,
        label: t(`inputs.gender.options.${gender}`),
      })),
    [t],
  );

  const handleExport = useCallback((data: ProfilesArrayItem[]) => {
    const itemsToDownload = data
      .filter((item) => item.IDPictureUrl)
      .map((item) => ({
        url: item.IDPictureUrl as string,
        name: item.IDPictureFileName || `profile-${item.id}`,
      }));

    exportFilesAsZip(itemsToDownload, setIsLoading);
  }, []);

  const columns = useMemo<ColumnDef<ProfilesArrayItem>[]>(
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
        accessorKey: 'cardNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title={'ID'} />,
        cell: ({ row }) => (
          <div>
            {row.original.cardNumber ? (
              <span>{`...-${row.original.cardNumber.split('-')[1]}`}</span>
            ) : (
              '-'
            )}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'identityPictureUrl',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Photo" />,
        cell: ({ row }) => {
          const url = row.original.IDPictureUrl as string;
          return url ? (
            <Avatar>
              <AvatarImage src={url} className="h-10 w-10 rounded-full object-cover" />
            </Avatar>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'lastName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.lastName.label')}
            sortHandler={(direction) => handleSortChange('lastName', direction)}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <span className="max-w-[250px] truncate font-medium">
                {row.original.lastName || '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'firstName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.firstName.label')}
            sortHandler={(direction) => handleSortChange('firstName', direction)}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <span className="max-w-[250px] truncate font-medium">
                {row.original.firstName || '-'}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.profileCategory.label')}
            sortHandler={(direction) => handleSortChange('category', direction)}
          />
        ),
        cell: ({ row }) => {
          const category = categories.find((cat) => cat.value === row.original.category);

          if (!category) {
            return null;
          }

          return (
            <div className="flex items-center">
              <Badge variant={'outline'}>{category.label}</Badge>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.original.category);
        },
      },
      {
        accessorKey: 'IDPictureFileName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={'Nom du fichier'} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <span className="max-w-[200px] truncate">
                {row.original.IDPictureFileName || '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.status.label')} />
        ),
        cell: ({ row }) => {
          const status = statuses.find((status) => status.value === row.original.status);

          if (!status) {
            return null;
          }

          return (
            <div className="flex min-w-max items-center">
              <Badge variant={'outline'}>{status.label}</Badge>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.original.status);
        },
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.email.label')} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <span className="max-w-[200px] truncate">
                {row.getValue('email') || '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'cardPin',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.cardPin.label')} />
        ),
      },
      {
        accessorKey: 'gender',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.gender.label')} />
        ),
        cell: ({ row }) => {
          const gender = genders.find((g) => g.value === row.getValue('gender'));
          return gender ? <Badge variant={'outline'}>{gender.label}</Badge> : '-';
        },
      },
      {
        accessorKey: 'cardIssuedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.cardIssuedAt.label')} />
        ),
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate">
            {row.original.cardIssuedAt ? row.original.cardIssuedAt : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'cardExpiresAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.cardExpiresAt.label')}
          />
        ),
        cell: ({ row }) => {
          return (
            <span className="max-w-[200px] truncate">
              {row.original.cardExpiresAt ? row.original.cardExpiresAt : '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.createdAt.label')} />
        ),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return date ? `${date.toLocaleString()}` : '-';
        },
      },
      {
        accessorKey: 'qrCodeUrl',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.qrCodeUrl.label')} />
        ),
        cell: ({ row }) => {
          const url = row.getValue('qrCodeUrl') as string;
          return url ? (
            <Button variant={'link'} asChild>
              <Link href={url}>{t('inputs.qrCodeUrl.link')}</Link>
            </Button>
          ) : (
            '-'
          );
        },
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
                    href={ROUTES.listing.profile(row.original.id)}
                  >
                    <FileText className="size-icon" />
                    {t('common.actions.consult')}
                  </Link>
                ),
              },
              {
                component: (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Edit className="size-icon" />
                        <span>{t('common.actions.edit')}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('common.actions.edit')}</DialogTitle>
                      </DialogHeader>
                      <QuickEditForm profile={row.original} onSuccess={fetchProfiles} />
                    </DialogContent>
                  </Dialog>
                ),
              },
            ]}
            row={row}
          />
        ),
      },
    ],
    [t, categories, genders, statuses, handleSortChange, fetchProfiles],
  );

  const filters = useMemo<FilterOption<ProfilesArrayItem>[]>(
    () => [
      {
        type: 'search',
        label: t('common.data_table.search'),
        defaultValue: formattedQueryParams.search ?? '',
        onChange: (value) =>
          handleParamsChange({
            type: 'filter',
            name: 'search',
            value,
          }),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('inputs.status.label'),
        defaultValue: formattedQueryParams.status?.toString().split(',') ?? [],
        options: statuses,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'status',
              value: value.join(','),
            });
          }
        },
      },
      {
        type: 'checkbox',
        property: 'category',
        label: t('inputs.profileCategory.label'),
        defaultValue: formattedQueryParams.category?.toString().split(',') ?? [],
        options: categories,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'category',
              value: value.join(','),
            });
          }
        },
      },
      {
        type: 'checkbox',
        property: 'gender',
        label: t('inputs.gender.label'),
        defaultValue: formattedQueryParams.gender?.toString().split(',') ?? [],
        options: genders,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange({
              type: 'filter',
              name: 'gender',
              value: value.join(','),
            });
          }
        },
      },
    ],
    [t, formattedQueryParams, statuses, categories, genders, handleParamsChange],
  );

  return (
    <PageContainer title={t('requests.title')}>
      <CardContainer>
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={results.items}
          filters={filters}
          totalCount={results.total}
          pageIndex={formattedQueryParams.page}
          pageSize={formattedQueryParams.limit}
          onExport={handleExport}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          enableExport={true}
          exportSelectedOnly={true}
          exportFilename="profiles"
          hiddenColumns={[
            'cardPin',
            'email',
            'qrCodeUrl',
            'IDPictureFileName',
            'createdAt',
            'gender',
          ]}
        />
      </CardContainer>
    </PageContainer>
  );
}

type QuickEditFormProps = {
  profile: ProfilesArrayItem;
  onSuccess: () => void;
};

function QuickEditForm({ profile, onSuccess }: QuickEditFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickEditFormData>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      cardNumber: profile.cardNumber || '',
      status: profile.status,
    },
  });

  const onSubmit = async (data: QuickEditFormData) => {
    const editedData = filterUneditedKeys(data, form.formState.dirtyFields);

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await tryCatch(updateProfile(profile.id, editedData as any));

      if (result.error) {
        toast.error(t('errors.common.unknown_error'));
        console.error(result.error);
        return;
      }

      toast.success(t('profile.update_success'));
      onSuccess();
    } catch (error) {
      toast.error(t('errors.common.unknown_error'));
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
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('inputs.cardNumber.label')}</FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
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
              <FormLabel>{t('inputs.status.label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('inputs.status.placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(RequestStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`inputs.requestStatus.options.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              {t('common.actions.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.actions.saving') : t('common.actions.save')}
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}
