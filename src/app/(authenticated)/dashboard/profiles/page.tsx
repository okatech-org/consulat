'use client';

// Type declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
      startIn?: string;
    }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    name: string;
    getFileHandle(
      name: string,
      options?: { create?: boolean },
    ): Promise<FileSystemFileHandle>;
  }

  interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemWritableFileStream {
    write(data: Blob | BufferSource | string): Promise<void>;
    close(): Promise<void>;
  }
}

import { PageContainer } from '@/components/layouts/page-container';
import {
  GetProfilesOptions,
  PaginatedProfiles,
  ProfilesArrayItem,
  ProfilesFilters,
} from '@/components/profile/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProfiles } from '@/components/profile/actions';
import { DataTable } from '@/components/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { ROUTES } from '@/schemas/routes';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { FileText, Edit, Download, FolderOpen } from 'lucide-react';
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
import { updateProfile } from '@/actions/profile';
import { useTableSearchParams } from '@/components/utils/table-hooks';
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { FullProfileUpdateFormData } from '@/schemas/registration';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

function adaptSearchParams(searchParams: URLSearchParams): ProfilesFilters {
  return {
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status')?.split(',').filter(Boolean) as
      | RequestStatus[]
      | undefined,
    category: searchParams.get('category')?.split(',').filter(Boolean) as
      | ProfileCategory[]
      | undefined,
    gender: searchParams.get('gender')?.split(',').filter(Boolean) as
      | Gender[]
      | undefined,
    organizationId: searchParams.get('organizationId')?.split(',').filter(Boolean) as
      | string[]
      | undefined,
  };
}

export default function ProfilesPage() {
  const t = useTranslations();
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handlePaginationChange,
    handleSortingChange,
  } = useTableSearchParams<ProfilesArrayItem, ProfilesFilters>(adaptSearchParams);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PaginatedProfiles>({
    items: [],
    total: 0,
  });

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const requestsOptions: GetProfilesOptions = {
        ...params,
        ...pagination,
        ...sorting,
      };

      const profiles = await getProfiles(requestsOptions);
      setResults(profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params, pagination, sorting]);

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
        accessorKey: 'id',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={'ID'}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'id',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
          />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            className="text-muted-foreground cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(row.original.id);
              toast({
                title: 'ID copié dans le presse-papiers',
                variant: 'success',
              });
            }}
          >
            {row.original.id}
          </button>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'cardNumber',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={'Carte N°'}
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'cardNumber',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
          />
        ),
        cell: ({ row }) => (
          <div>
            {row.original.cardNumber ? <span>{row.original.cardNumber}</span> : '-'}
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'IDPicture',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Photo" />,
        enableSorting: false,
        cell: ({ row }) => {
          const url = row.original.IDPictureUrl as string;
          return url ? (
            <Avatar className="bg-muted">
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
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'lastName',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
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
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'firstName',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
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
            sortHandler={(direction) =>
              handleSortingChange({
                field: 'category',
                order: direction,
              })
            }
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
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
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.status.label')}
            labels={{ asc: 'A-Z', desc: 'Z-A' }}
          />
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
        accessorKey: 'shareUrl',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('inputs.qrCodeUrl.label')} />
        ),
        cell: ({ row }) => {
          const url = row.getValue('shareUrl') as string;
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
        accessorKey: 'IDPictureFileName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('inputs.identityPicture.label')}
          />
        ),
        cell: ({ row }) => {
          const url = row.getValue('IDPictureFileName') as string;
          return url ? (
            <Button variant={'link'} asChild>
              <Link href={url}>{t('inputs.identityPicture.label')}</Link>
            </Button>
          ) : (
            '-'
          );
        },
      },
      {
        accessorKey: 'IDPicturePath',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={'Nom du fichier'} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <span className="max-w-[200px] truncate">
                {row.original.IDPicturePath || '-'}
              </span>
            </div>
          );
        },
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
                    onSuccess={fetchProfiles}
                  />
                ),
              },
              {
                component: (
                  <ExportWithDirectoryForm
                    selectedRows={table
                      .getFilteredSelectedRowModel()
                      .flatRows.map((row) => row.original)}
                    onSuccess={fetchProfiles}
                  />
                ),
              },
            ]}
          />
        ),
        cell: ({ row }) => (
          <DataTableRowActions
            actions={[
              {
                component: row.original.validationRequestId ? (
                  <Link
                    onClick={(e) => e.stopPropagation()}
                    href={ROUTES.dashboard.service_requests(
                      row.original.validationRequestId,
                    )}
                  >
                    <FileText className="size-icon" />
                    {'Voir la demande'}
                  </Link>
                ) : null,
              },
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
    [handleSortingChange, t, categories, statuses, genders, fetchProfiles],
  );

  const filters = useMemo<FilterOption<ProfilesArrayItem>[]>(
    () => [
      {
        type: 'search',
        property: 'search',
        label: t('common.data_table.search'),
        defaultValue: params.search || '',
        onChange: (value) => handleParamsChange('search', value),
      },
      {
        type: 'checkbox',
        property: 'status',
        label: t('inputs.status.label'),
        defaultValue: params.status || [],
        options: statuses,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('status', value);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'category',
        label: t('inputs.profileCategory.label'),
        defaultValue: params.category || [],
        options: categories,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('category', value);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'gender',
        label: t('inputs.gender.label'),
        defaultValue: params.gender || [],
        options: genders,
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('gender', value);
          }
        },
      },
    ],
    [t, params, statuses, categories, genders, handleParamsChange],
  );

  return (
    <PageContainer title={'Gestion des profils'}>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={results.items}
        filters={filters}
        totalCount={results.total}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        hiddenColumns={[
          'id',
          'cardPin',
          'email',
          'shareUrl',
          'IDPictureFileName',
          'IDPicturePath',
          'gender',
          'cardExpiresAt',
          'category',
        ]}
        activeSorting={[sorting.field, sorting.order]}
      />
    </PageContainer>
  );
}

// Define schema for profile quick edit
const quickEditSchema = z.object({
  cardNumber: z.string().optional(),
  status: z.nativeEnum(RequestStatus),
});

type QuickEditFormData = z.infer<typeof quickEditSchema>;

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
        toast({
          title: t('errors.common.unknown_error'),
          variant: 'destructive',
        });
        console.error(result.error);
        return;
      }

      toast({
        title: t('profile.update_success'),
        variant: 'success',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('errors.common.unknown_error'),
        variant: 'destructive',
      });
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

// Bulk status change form for profiles
const statusChangeSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});
type StatusChangeFormData = z.infer<typeof statusChangeSchema>;
type StatusChangeFormProps = {
  selectedRows: ProfilesArrayItem[];
  onSuccess: () => void;
};
function StatusChangeForm({ selectedRows, onSuccess }: StatusChangeFormProps) {
  const t = useTranslations();
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
          updateProfile(row.id, {
            status: data.status,
          } as Partial<FullProfileUpdateFormData>),
        );
      });
      await Promise.all(updatePromises);
      toast({
        title: t('common.success.bulk_update_success', { count: selectedRows.length }),
        variant: 'success',
      });
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast({
        title: t('common.errors.save_failed'),
        variant: 'destructive',
      });
      console.error('Error updating profiles:', error);
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
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? t('common.actions.saving') : t('common.actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// Bulk export with directory selection form for profiles
type ExportWithDirectoryFormProps = {
  selectedRows: ProfilesArrayItem[];
  onSuccess: () => void;
};

function ExportWithDirectoryForm({
  selectedRows,
  onSuccess,
}: ExportWithDirectoryFormProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [customPath, setCustomPath] = useState('');
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  // Initialize custom path when opening
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !customPath) {
      // Get default path from env or use a fallback
      const defaultPath =
        process.env.NEXT_PUBLIC_DEFAULT_IMAGE_PATH || '/images/profiles/';
      setCustomPath(defaultPath);
    }
    setOpen(newOpen);
  };

  const handleExportWithDirectory = async () => {
    if (!selectedRows.length) return;

    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      toast({
        title: 'Fonctionnalité non supportée',
        description:
          'Votre navigateur ne supporte pas la sélection de dossier. Utilisez Chrome, Edge ou un navigateur compatible.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);
      setDownloadProgress({ current: 0, total: selectedRows.length + 1 }); // +1 for Excel file

      // Let user select directory
      const directoryHandle = await (
        window as Window & {
          showDirectoryPicker(options?: {
            mode?: 'read' | 'readwrite';
          }): Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker({
        mode: 'readwrite',
      });

      // Prepare data for Excel export with custom IDPicturePath
      const exportData = selectedRows.map((item) => ({
        ...item,
        IDPicturePath: `${customPath.endsWith('/') ? customPath : customPath + '/'}${item.IDPictureFileName}.png`,
      }));

      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Profiles');

      // Generate Excel file as blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const excelBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Save Excel file to selected directory
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const excelFileName = `profiles-export-${dateStr}_${timeStr}.xlsx`;

      const excelFileHandle = await directoryHandle.getFileHandle(excelFileName, {
        create: true,
      });
      const excelWritable = await excelFileHandle.createWritable();
      await excelWritable.write(excelBlob);
      await excelWritable.close();

      // Update progress for Excel file
      setDownloadProgress((prev) => ({ ...prev, current: prev.current + 1 }));

      // Download images to the selected directory (all as PNG)
      const imagePromises = selectedRows
        .filter((item) => item.IDPictureUrl)
        .map(async (item) => {
          try {
            const response = await fetch(item.IDPictureUrl as string, {
              method: 'GET',
              credentials: 'same-origin',
            });

            if (!response.ok) {
              console.error(`Error fetching ${item.IDPictureUrl}: ${response.status}`);
              return null;
            }

            const blob = await response.blob();

            // All images are saved as PNG using IDPictureFileName
            const fileName = `${item.IDPictureFileName}.png`;
            const fileHandle = await directoryHandle.getFileHandle(fileName, {
              create: true,
            });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            // Update progress
            setDownloadProgress((prev) => ({ ...prev, current: prev.current + 1 }));

            return fileName;
          } catch (error) {
            console.error(`Error downloading image for profile ${item.id}:`, error);
            setDownloadProgress((prev) => ({ ...prev, current: prev.current + 1 }));
            return null;
          }
        });

      await Promise.all(imagePromises);

      toast({
        title: 'Export réussi',
        description: `${selectedRows.length} profils exportés avec succès dans le dossier sélectionné.`,
        variant: 'success',
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled directory selection
        return;
      }

      toast({
        title: "Erreur lors de l'export",
        description: "Une erreur est survenue lors de l'export. Veuillez réessayer.",
        variant: 'destructive',
      });
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Exporter avec sélection de dossier"
          className="justify-start"
        >
          Exporter dans un dossier
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col !w-full !max-w-2xl">
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <SheetTitle>Exporter dans un dossier</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cette action va vous permettre de sélectionner un dossier de destination pour
            exporter :
          </p>

          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li>Un fichier Excel avec les données des profils sélectionnés</li>
            <li>Toutes les images des profils (sans compression)</li>
            <li>Les chemins des images seront mis à jour dans le fichier Excel</li>
          </ul>

          <div className="space-y-2">
            <label htmlFor="customPath" className="text-sm font-medium">
              Chemin pour IDPicturePath dans l&apos;Excel :
            </label>
            <Input
              id="customPath"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="/images/profiles/"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Ce chemin sera utilisé dans la colonne IDPicturePath du fichier Excel (ex:{' '}
              {customPath.endsWith('/') ? customPath : customPath + '/'}profile-id.png)
            </p>
          </div>

          {isExporting && downloadProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression :</span>
                <span>
                  {downloadProgress.current}/{downloadProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {downloadProgress.current === 0
                  ? 'Préparation...'
                  : downloadProgress.current === downloadProgress.total
                    ? 'Terminé !'
                    : `Téléchargement en cours... (${downloadProgress.current}/${downloadProgress.total})`}
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Cette fonctionnalité nécessite un navigateur
              compatible (Chrome, Edge, etc.)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExporting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleExportWithDirectory}
              disabled={isExporting || !selectedRows.length || !customPath.trim()}
            >
              {isExporting ? (
                <>
                  <Download className="size-icon mr-2 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <FolderOpen className="size-icon mr-2" />
                  Sélectionner le dossier
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
