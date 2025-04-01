'use client';

import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import {
  ArrayOption,
  PaginatedProfiles,
  ProfilesArrayItem,
} from '@/components/profile/types';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adaptSearchParams } from '@/components/profile/adapters';
import { getProfiles } from '@/components/profile/actions';
import { DataTable } from '@/components/data-table/data-table';
import JSZip from 'jszip';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { FilterOption } from '@/components/data-table/data-table-toolbar';
import { ROUTES } from '@/schemas/routes';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { FileText } from 'lucide-react';
import { RequestStatus, ProfileCategory, Gender } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function ProfilesPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = useSearchParams();
  const formattedQueryParams = adaptSearchParams(queryParams);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PaginatedProfiles>({
    items: [],
    total: 0,
  });

  function handleParamsChange(option: ArrayOption) {
    const params = new URLSearchParams(queryParams?.toString());

    if (option.type === 'filter') {
      if (option.value) {
        params.set(option.name, option.value.toString());
      } else {
        params.delete(option.name);
      }
    } else {
      if (option.value) {
        params.set(option.type, option.value.toString());
      } else {
        params.delete(option.type);
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    async function fetchProfiles() {
      const params = adaptSearchParams(queryParams);
      setIsLoading(true);
      const profiles = await getProfiles(params);
      setResults(profiles);
      setIsLoading(false);
    }
    fetchProfiles();
  }, [queryParams]);

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

  const columns: ColumnDef<ProfilesArrayItem>[] = [
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
          sortHandler={(dir) => {
            handleParamsChange({ type: 'sort', value: dir });
          }}
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
          sortHandler={(dir) => {
            handleParamsChange({ type: 'sort', value: dir });
          }}
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
          sortHandler={(dir) => {
            handleParamsChange({ type: 'sort', value: dir });
          }}
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
        <DataTableColumnHeader column={column} title={t('inputs.cardExpiresAt.label')} />
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

  const filters: FilterOption<ProfilesArrayItem>[] = [
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
  ];

  React.useEffect(() => {
    console.log(formattedQueryParams);
  }, [formattedQueryParams]);

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
          onExport={(data) => {
            const itemsToDownload = data
              .filter((item) => item.IDPictureUrl)
              .map((item) => ({
                url: item.IDPictureUrl as string,
                name: item.IDPictureFileName,
              }));

            downloadPhotos(itemsToDownload, setIsLoading);
          }}
          onPageChange={(pageIndex) => {
            handleParamsChange({ type: 'page', value: pageIndex });
          }}
          onLimitChange={(limit) => {
            handleParamsChange({ type: 'limit', value: limit });
          }}
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

const downloadPhotos = async (
  items: Array<{ url: string; name: string }>,
  setIsLoading: (isLoading: boolean) => void,
) => {
  setIsLoading(true);
  const zip = new JSZip();

  try {
    // Create an array of promises for fetching images
    const photoPromises = items.map(async (item) => {
      const { url, name } = item;
      if (!url) return null;

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
          console.error('Empty blob received for:', name);
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

        const fileNameWithExt = `${name}${extension}`;

        return { fileName: fileNameWithExt, blob };
      } catch (error) {
        console.error(`Error downloading ${url}:`, error);
        return null;
      }
    });

    const photos = (await Promise.all(photoPromises)).filter(Boolean);

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
  } catch (error) {
    console.error('Error creating zip file:', error);
  } finally {
    setIsLoading(false);
  }
};
