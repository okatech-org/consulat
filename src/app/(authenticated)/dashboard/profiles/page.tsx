'use client';

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
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { FilterOption } from '@/components/data-table/data-table-toolbar';
import { ROUTES } from '@/schemas/routes';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { FileText, Edit, Download, FolderOpen, Eye } from 'lucide-react';
import {
  ProfileStatus,
  ProfileCategory,
  Gender,
  UserRole,
  RequestStatus,
  CountryCode,
  CountryStatus,
} from '@/convex/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
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
import { useTableSearchParams } from '@/hooks/use-table-search-params';
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import * as XLSX from 'xlsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useProfilesList, useUpdateProfileStatus } from '@/hooks/use-profiles';
import { useRouter } from 'next/navigation';
import type { Id } from '@/convex/_generated/dataModel';
import type { ProfileListItem } from '@/convex/lib/types';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export type ProfilesFilters = {
  search?: string;
  status?: RequestStatus[];
  gender?: Gender[];
  countryCode?: CountryCode[];
  page?: number;
  limit?: number;
  sort?: {
    field: keyof ProfileListItem;
    order: 'asc' | 'desc';
  };
};

function adaptSearchParams(searchParams: URLSearchParams): ProfilesFilters {
  const params = {
    ...(searchParams.get('search') && { search: searchParams.get('search') }),
    ...(searchParams.get('status') && {
      status: searchParams.get('status')?.split(',').filter(Boolean) as
        | string[]
        | undefined,
    }),
    ...(searchParams.get('gender') && {
      gender: searchParams.get('gender')?.split(',').filter(Boolean) as
        | Gender[]
        | undefined,
    }),
    ...(searchParams.get('countryCode') && {
      countryCode: searchParams.get('countryCode')?.split(',').filter(Boolean) as
        | CountryCode[]
        | undefined,
    }),
  } as ProfilesFilters;

  return params;
}

export default function ProfilesPage() {
  const router = useRouter();
  const t = useTranslations();
  const { user } = useCurrentUser();
  const activeCountries = useQuery(api.functions.country.getAllCountries, {
    status: CountryStatus.Active,
  });
  const isIntelAgent = user?.roles?.includes(UserRole.SuperAdmin) === false;
  const {
    params,
    pagination,
    sorting,
    handleParamsChange,
    handlePaginationChange,
    handleSortingChange,
  } = useTableSearchParams<ProfileListItem, ProfilesFilters>(adaptSearchParams);

  const { profiles, total, isLoading } = useProfilesList({
    search: params.search,
    status: params.status,
    gender: params.gender,
    countryCode: params.countryCode ?? user?.membership?.assignedCountries ?? [],
    page: pagination.page,
    limit: pagination.limit,
  });

  const result = {
    items: profiles,
    total,
  };

  const statuses = useMemo(
    () =>
      Object.values(ProfileStatus).map((status) => ({
        value: status,
        label: t(`inputs.profileStatus.options.${status}`),
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

  const generateColumns = () => {
    const baseColumns: ColumnDef<ProfileListItem>[] = [
      {
        id: 'id',
        header: ({ table }) => (
          <label className="flex items-center gap-2 px-2 cursor-pointer">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
            <span>ID</span>
          </label>
        ),
        cell: ({ row }) => (
          <label className="flex items-center gap-2 px-2 cursor-pointer">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(row.original.id);
                    toast.success('ID copié dans le presse-papiers');
                  }}
                >
                  <span className="uppercase text-muted-foreground">
                    {row.original.id.slice(0, 6)}...
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span className="uppercase">{row.original.id}</span> (cliquez pour copier)
              </TooltipContent>
            </Tooltip>
          </label>
        ),
        enableSorting: false,
        enableHiding: false,
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
                    onSuccess={() => router.refresh()}
                  />
                ),
              },
              {
                component: (
                  <ExportWithDirectoryForm
                    selectedRows={table
                      .getFilteredSelectedRowModel()
                      .flatRows.map((row) => row.original)}
                    onSuccess={() => router.refresh()}
                  />
                ),
              },
            ]}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.registrationRequest && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    className={
                      buttonVariants({ variant: 'ghost', size: 'icon' }) +
                      ' aspect-square p-0'
                    }
                    onClick={(e) => e.stopPropagation()}
                    href={ROUTES.dashboard.service_requests(
                      row.original.registrationRequest,
                    )}
                  >
                    <FileText className="size-icon" />
                    <span className="sr-only">Voir la demande</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Voir la demande</span>
                </TooltipContent>
              </Tooltip>
            )}
            <ProfileLookupSheet
              profileId={row.original.id as Id<'profiles'>}
              icon={<Eye className="size-icon" />}
              tooltipContent="Aperçu du profil"
            />
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="aspect-square p-0">
                      <Edit className="size-icon" />
                      <span className="sr-only"> {t('common.actions.edit')}</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Modification rapide</span>
                </TooltipContent>
              </Tooltip>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('common.actions.edit')}</DialogTitle>
                </DialogHeader>
                <QuickEditForm
                  profile={row.original}
                  onSuccess={() => router.refresh()}
                />
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ];

    // Pour les agents de renseignement, on ne garde que certaines colonnes
    if (isIntelAgent) {
      return baseColumns
        .filter((column) => {
          const columnId = column.id || (column as any).accessorKey;
          return [
            'id',
            'cardNumber',
            'IDPicture',
            'lastName',
            'firstName',
            'category',
            'status',
            'email',
            'cardPin',
            'gender',
            'cardIssuedAt',
            'cardExpiresAt',
            'actions',
          ].includes(columnId);
        })
        .map((column) => {
          // Modifier la colonne actions pour les agents de renseignement
          if (column.id === 'actions') {
            return {
              ...column,
              cell: ({ row }: { row: { original: ProfileListItem } }) => (
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={ROUTES.listing.profile(row.original.id)}>
                          <Eye className="size-icon" />
                          <span className="sr-only">Voir le profil</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Voir le profil</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ),
            };
          }
          return column;
        });
    }

    return baseColumns;
  };

  const columns = useMemo<ColumnDef<ProfileListItem>[]>(
    () => generateColumns(),
    [handleSortingChange, t, categories, statuses, genders, router, isIntelAgent],
  );

  const filters = useMemo<FilterOption<ProfileListItem>[]>(
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
            handleParamsChange('status', value as RequestStatus[]);
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
            handleParamsChange('gender', value as Gender[]);
          }
        },
      },
      {
        type: 'checkbox',
        property: 'countryCode',
        label: t('inputs.countryCode.label'),
        defaultValue: params.countryCode || [],
        options: activeCountries
          ? activeCountries?.map((country) => ({
              value: country.code,
              label: t(`countries.${country.code}`),
            }))
          : [],
        onChange: (value) => {
          if (Array.isArray(value)) {
            handleParamsChange('countryCode', value as CountryCode[]);
          }
        },
      },
    ],
    [t, params, statuses, categories, genders, handleParamsChange],
  );

  return (
    <PageContainer title={isIntelAgent ? 'Profils des Citoyens' : 'Gestion des profils'}>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={result?.items || []}
        filters={filters}
        totalCount={result?.total || 0}
        pageIndex={pagination.page - 1}
        pageSize={pagination.limit}
        onPageChange={(page) => handlePaginationChange('page', page + 1)}
        onLimitChange={(limit) => handlePaginationChange('limit', limit)}
        hiddenColumns={
          isIntelAgent
            ? ['shareUrl', 'IDPictureFileName', 'IDPicturePath']
            : [
                'cardPin',
                'email',
                'shareUrl',
                'IDPictureFileName',
                'IDPicturePath',
                'gender',
                'cardExpiresAt',
                'category',
              ]
        }
        activeSorting={[sorting.field, sorting.order]}
        sticky={[
          { id: 'id', position: 'left' },
          { id: 'actions', position: 'right' },
        ]}
        onRefresh={() => router.refresh()}
      />
    </PageContainer>
  );
}

// Define schema for profile quick edit
const quickEditSchema = z.object({
  cardNumber: z.string().optional(),
  status: z.string(),
});

type QuickEditFormData = z.infer<typeof quickEditSchema>;

type QuickEditFormProps = {
  profile: ProfileListItem;
  onSuccess: () => void;
};

function QuickEditForm({ profile, onSuccess }: QuickEditFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStatus } = useUpdateProfileStatus();

  const form = useForm<QuickEditFormData>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      cardNumber: profile.cardNumber || '',
      status: profile.status,
    },
  });

  const onSubmit = async (data: QuickEditFormData) => {
    setIsSubmitting(true);
    try {
      if (data.status && data.status !== profile.status) {
        await updateStatus(profile.id as any, data.status);
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
                  {Object.values(ProfileStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`inputs.profileStatus.options.${status}`)}
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
  status: z.string(),
});
type StatusChangeFormData = z.infer<typeof statusChangeSchema>;
type StatusChangeFormProps = {
  selectedRows: ProfileListItem[];
  onSuccess: () => void;
};
function StatusChangeForm({ selectedRows, onSuccess }: StatusChangeFormProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStatus } = useUpdateProfileStatus();

  const form = useForm<StatusChangeFormData>({
    resolver: zodResolver(statusChangeSchema),
  });

  const onSubmit = async (data: StatusChangeFormData) => {
    setIsSubmitting(true);
    try {
      if (!selectedRows.length) return;
      const updatePromises = selectedRows.map((row) =>
        updateStatus(row.id as any, data.status),
      );
      await Promise.all(updatePromises);
      toast.success(
        t('common.success.bulk_update_success', { count: selectedRows.length }),
      );
      onSuccess();
      setOpen(false);
    } catch (error) {
      toast.error(t('common.errors.save_failed'));
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
                      {Object.values(ProfileStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`inputs.profileStatus.options.${status}`)}
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
  selectedRows: ProfileListItem[];
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
      toast.error(
        'Votre navigateur ne supporte pas la sélection de dossier. Utilisez Chrome, Edge ou un navigateur compatible.',
      );
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
        IDPicturePath: `${item.IDPictureFileName}.png`,
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

      toast.success(
        `${selectedRows.length} profils exportés avec succès dans le dossier sélectionné.`,
      );

      setOpen(false);
      onSuccess();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled directory selection
        return;
      }

      toast.error("Une erreur est survenue lors de l'export. Veuillez réessayer.");
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
            <li>
              Assurez vous d&apos;enregistrer les images dans le dossier configuré pour
              les images dans l&apos;application d&apos;implémentation
            </li>
          </ul>

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
