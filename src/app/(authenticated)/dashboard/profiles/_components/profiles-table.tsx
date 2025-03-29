'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Download } from 'lucide-react';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import {
  Gender,
  MaritalStatus,
  ProfileCategory,
  RequestStatus,
  WorkStatus,
} from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { format as formatDate } from 'date-fns';
import { getProfiles, GetProfilesOptions, PaginatedProfiles } from '@/actions/profiles';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/schemas/routes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import JSZip from 'jszip';
import { toast } from '@/hooks/use-toast';
import { tryCatch } from '@/lib/utils';

interface ProfilesTableProps {
  filters: GetProfilesOptions;
}

const appUrl = process.env.NEXT_PUBLIC_URL;

export function ProfilesTable({ filters }: ProfilesTableProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaginatedProfiles | null>(null);
  const [pendingFilters, setPendingFilters] = useState<Record<string, string> | null>(
    null,
  );
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PaginatedProfiles['items']>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (pendingFilters) {
      const params = new URLSearchParams(searchParams?.toString());

      Object.entries(pendingFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
      setPendingFilters(null);
    }
  }, [pendingFilters, router, searchParams, pathname]);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      const result = await tryCatch(getProfiles(filters));

      if (result.error) {
        console.error('Error fetching profiles:', result.error.message);
      }

      if (result.data) {
        setResult(result.data);
      }

      setIsLoading(false);
    };

    fetchProfiles();
  }, [filters]);

  const statuses = Object.values(RequestStatus).map((status) => ({
    value: status,
    label: t(`inputs.requestStatus.options.${status}`),
  }));

  const categories = Object.values(ProfileCategory).map((category) => ({
    value: category,
    label: t(`inputs.profileCategory.options.${category}`),
  }));

  const genders = Object.values(Gender).map((gender) => ({
    value: gender,
    label: t(`inputs.gender.options.${gender}`),
  }));

  const maritalStatuses = Object.values(MaritalStatus).map((status) => ({
    value: status,
    label: t(`inputs.maritalStatus.options.${status}`),
  }));

  const workStatuses = Object.values(WorkStatus).map((status) => ({
    value: status,
    label: t(`inputs.workStatus.options.${status}`),
  }));

  const processedData: (PaginatedProfiles['items'][number] & {
    identityPictureUrl: string;
    qrCodeUrl: string;
    fileName: string;
  })[] = React.useMemo(() => {
    if (!result?.items) return [];

    return result.items.map((item) => ({
      ...item,
      lastName: item.lastName?.toUpperCase() ?? '',
      identityPictureUrl: item.identityPicture?.fileUrl || '',
      qrCodeUrl: `${appUrl}${ROUTES.listing.profile(item.id)}`,
      fileName: `${item.lastName?.trim()?.replace(' ', '_').toUpperCase() || 'unknown'}_${item.firstName?.trim()?.replace(' ', '_') || 'unknown'}_${item.cardNumber || 'unassigned'}`,
      ...(item.cardIssuedAt && {
        cardIssuedAt: formatDate(item.cardIssuedAt, 'dd/mm/YYYY') as unknown as Date,
      }),
      ...(item.cardExpiresAt && {
        cardExpiresAt: formatDate(item.cardExpiresAt, 'dd/mm/YYYY') as unknown as Date,
      }),
    }));
  }, [result?.items]);

  const columns: ColumnDef<
    PaginatedProfiles['items'][number] & {
      identityPictureUrl?: string;
      qrCodeUrl?: string;
      fileName?: string;
    }
  >[] = [
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
      cell: ({ row }) => <div>{row.original.cardNumber || '-'}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'identityPictureUrl',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Photo d'identité" />
      ),
      cell: ({ row }) => {
        const url = row.original.identityPictureUrl as string;
        return url ? (
          <Avatar>
            <AvatarImage src={url} />
          </Avatar>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'lastName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.lastName.label')} />
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
        <DataTableColumnHeader column={column} title={t('inputs.firstName.label')} />
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
      accessorKey: 'fileName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Nom du fichier'} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="max-w-[200px] truncate">{row.original.fileName || '-'}</span>
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
            <span className="max-w-[200px] truncate">{row.getValue('email') || '-'}</span>
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
      accessorKey: 'maritalStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.maritalStatus.label')} />
      ),
      cell: ({ row }) => {
        const status = maritalStatuses.find(
          (s) => s.value === row.getValue('maritalStatus'),
        );
        return status ? <Badge variant={'outline'}>{status.label}</Badge> : '-';
      },
    },
    {
      accessorKey: 'workStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.workStatus.label')} />
      ),
      cell: ({ row }) => {
        const status = workStatuses.find((s) => s.value === row.getValue('workStatus'));
        return status ? <Badge variant={'outline'}>{status.label}</Badge> : '-';
      },
    },
    {
      accessorKey: 'cardIssuedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.cardIssuedAt.label')} />
      ),
      cell: ({ row }) => {
        const date = row.original.cardIssuedAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'cardExpiresAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.cardExpiresAt.label')} />
      ),
      cell: ({ row }) => {
        const date = row.original.cardExpiresAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('inputs.createdAt.label')} />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? formatDate(date, 'dd/MM/yyyy') : '-';
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
                  <FileText className="mr-1 size-icon" />
                  {t('common.actions.consult')}
                </Link>
              ),
            },
          ]}
          row={row}
        />
      ),
    },
  ];

  const localFilters: FilterOption<PaginatedProfiles['items'][number]>[] = [
    {
      type: 'search',
      label: t('common.data_table.search'),
      defaultValue: filters.search ?? '',
      onChange: (value) => handleFilterChange('search', value),
    },
    {
      type: 'checkbox',
      property: 'status',
      label: t('inputs.status.label'),
      defaultValue: filters.status?.toString().split(',') ?? [],
      options: statuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('status', value.join(','));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'category',
      label: t('inputs.profileCategory.label'),
      defaultValue: filters.category?.toString().split(',') ?? [],
      options: categories,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('category', value.join(','));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'gender',
      label: t('inputs.gender.label'),
      defaultValue: filters.gender?.toString().split(',') ?? [],
      options: genders,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('gender', value.join(','));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'maritalStatus',
      label: t('inputs.maritalStatus.label'),
      defaultValue: filters.maritalStatus?.toString().split(',') ?? [],
      options: maritalStatuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('maritalStatus', value.join(','));
        }
      },
    },
    {
      type: 'checkbox',
      property: 'workStatus',
      label: t('inputs.workStatus.label'),
      defaultValue: filters.workStatus?.toString().split(',') ?? [],
      options: workStatuses,
      onChange: (value) => {
        if (Array.isArray(value)) {
          handleFilterChange('workStatus', value.join(','));
        }
      },
    },
  ];

  const downloadPhotos = async () => {
    if (!selectedRows.length) return;

    setIsDownloading(true);
    const zip = new JSZip();

    try {
      // Create an array of promises for fetching images
      const photoPromises = selectedRows
        .filter((profile) => {
          const hasPhoto = !!profile.identityPicture?.fileUrl;
          if (!hasPhoto) {
            console.log(
              'Profile without photo:',
              profile.id,
              profile.firstName,
              profile.lastName,
            );
          }
          return hasPhoto;
        })
        .map(async (profile) => {
          const url = profile.identityPicture?.fileUrl;
          if (!url) return null;

          const fileName = `${profile.firstName?.trim()?.replace(' ', '_') || 'unknown'}_${profile.lastName?.trim()?.replace(' ', '_') || 'unknown'}_${profile.cardNumber || 'unassigned'}`;

          try {
            const response = await fetch(url, {
              method: 'GET',
              credentials: 'same-origin',
            });

            if (!response.ok) {
              console.error(
                `Error fetching ${url}: ${response.status} ${response.statusText}`,
              );
              return null;
            }

            const blob = await response.blob();

            if (blob.size === 0) {
              console.error('Empty blob received for:', fileName);
              return null;
            }

            // Determine file extension based on blob type
            let extension = '.jpg'; // Default
            if (blob.type) {
              const mimeType = blob.type.toLowerCase();
              if (mimeType.includes('png')) {
                extension = '.png';
              } else if (mimeType.includes('gif')) {
                extension = '.gif';
              } else if (mimeType.includes('webp')) {
                extension = '.webp';
              } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
                extension = '.jpg';
              } else if (mimeType.includes('svg')) {
                extension = '.svg';
              } else if (mimeType.includes('bmp')) {
                extension = '.bmp';
              }
              // Add more types as needed
            }

            const fileNameWithExt = `${profile.lastName?.trim()?.replace(' ', '_').toUpperCase() || 'unknown'}_${profile.firstName?.trim()?.replace(' ', '_') || 'unknown'}_${profile.cardNumber || 'unassigned'}${extension}`;

            return { fileName: fileNameWithExt, blob };
          } catch (error) {
            console.error(`Error downloading ${url}:`, error);
            return null;
          }
        });

      const photos = (await Promise.all(photoPromises)).filter(Boolean);

      if (photos.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Aucune photo disponible',
          description: "Aucune photo n'a été trouvée pour les profils sélectionnés.",
        });
        setIsDownloading(false);
        setShowDownloadDialog(false);
        return;
      }

      // Add each photo to the zip file
      photos.forEach((photo) => {
        if (photo) {
          console.log('Adding to zip:', photo.fileName, 'Size:', photo.blob.size);
          zip.file(photo.fileName, photo.blob);
        }
      });

      // Generate the zip file
      console.log('Generating zip...');
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      console.log('Zip generated, size:', content.size);

      if (content.size < 100) {
        console.error('ZIP file is too small, might be empty. Size:', content.size);
        toast({
          variant: 'destructive',
          title: 'Erreur de génération',
          description: 'Le fichier ZIP généré semble vide. Veuillez réessayer.',
        });
        setIsDownloading(false);
        setShowDownloadDialog(false);
        return;
      }

      // Create a download link and trigger the download
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `profile-photos-${dateStr}_${timeStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Téléchargement réussi',
        description: `${photos.length} photos téléchargées avec succès.`,
      });
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de téléchargement',
        description: "Une erreur s'est produite lors du téléchargement des photos.",
      });
    } finally {
      setIsDownloading(false);
      setShowDownloadDialog(false);
    }
  };

  return (
    <>
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={processedData}
        filters={localFilters}
        totalCount={result?.total ?? 0}
        pageIndex={filters?.page}
        pageSize={filters?.limit}
        onExport={(data) => {
          setSelectedRows(data);
          setShowDownloadDialog(true);
        }}
        onPageChange={(page) => {
          handleFilterChange('page', page.toString);
        }}
        onLimitChange={(limit) => {
          handleFilterChange('limit', limit.toString());
        }}
        enableExport={true}
        exportSelectedOnly={true}
        exportFilename="profiles"
        hiddenColumns={[
          'cardPin',
          'maritalStatus',
          'workStatus',
          'email',
          'qrCodeUrl',
          'fileName',
          'createdAt',
        ]}
      />

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Télécharger les photos</DialogTitle>
            <DialogDescription>
              Voulez-vous télécharger les photos d&apos;identité des profils sélectionnés
              ({selectedRows.length}) ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>
              Annuler
            </Button>
            <Button onClick={downloadPhotos} disabled={isDownloading} className="gap-2">
              {isDownloading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
